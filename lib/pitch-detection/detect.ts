import type {
  OctaveCorrection,
  PitchDetectionResult,
  PitchPoint,
  RawPitchFrame
} from "@/types/audio";
import { frequencyToNote } from "@/lib/pitch-detection/notes";

const WINDOW_SIZE = 2048;
const HOP_SIZE = 512;
const MIN_FREQUENCY = 70;
const MAX_FREQUENCY = 1100;
const RMS_THRESHOLD = 0.012;
const YIN_THRESHOLD = 0.12;
const MIN_CONFIDENCE = 0.72;

interface YinEstimate {
  frequency: number | null;
  confidence: number;
}

export async function analyzePitchTrackFromBlob(blob: Blob): Promise<PitchDetectionResult> {
  const audioContext = new AudioContext();

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const channelData = mixToMono(audioBuffer);
    return analyzePitchSamples(channelData, audioBuffer.sampleRate);
  } finally {
    await audioContext.close();
  }
}

export async function detectPitchTrackFromBlob(blob: Blob): Promise<PitchPoint[]> {
  const result = await analyzePitchTrackFromBlob(blob);
  return result.rawDetectedPitchTrack;
}

export function analyzePitchSamples(
  samples: Float32Array,
  sampleRate: number
): PitchDetectionResult {
  const rawPitchTrack: RawPitchFrame[] = [];

  for (let start = 0; start + WINDOW_SIZE <= samples.length; start += HOP_SIZE) {
    const frame = samples.subarray(start, start + WINDOW_SIZE);
    const rms = calculateRms(frame);
    const time = (start + WINDOW_SIZE / 2) / sampleRate;

    if (rms < RMS_THRESHOLD) {
      rawPitchTrack.push({
        time,
        frequency: null,
        midi: null,
        confidence: 0,
        rms,
        voiced: false,
        filterReason: "silence"
      });
      continue;
    }

    const estimate = detectYinPitch(frame, sampleRate);
    const inRange =
      estimate.frequency !== null &&
      estimate.frequency >= MIN_FREQUENCY &&
      estimate.frequency <= MAX_FREQUENCY;
    const voiced = inRange && estimate.confidence >= MIN_CONFIDENCE;

    rawPitchTrack.push({
      time,
      frequency: inRange ? estimate.frequency : null,
      midi: inRange && estimate.frequency ? frequencyToContinuousMidi(estimate.frequency) : null,
      confidence: estimate.confidence,
      rms,
      voiced,
      filterReason: !inRange ? "out_of_range" : voiced ? undefined : "low_confidence"
    });
  }

  const rawDetectedPitchTrack = buildRawDetectedPitchTrack(rawPitchTrack);
  const { points: scoringAdjustedPitchTrack, corrections } =
    buildScoringAdjustedTrack(rawDetectedPitchTrack);
  const lowConfidenceFrames = rawPitchTrack.filter(
    (frame) => frame.filterReason === "low_confidence"
  ).length;

  return {
    algorithm: "yin",
    sampleRate,
    duration: samples.length / sampleRate,
    rawPitchTrack,
    rawDetectedPitchTrack,
    scoringAdjustedPitchTrack,
    processedPitchTrack: scoringAdjustedPitchTrack,
    waveform: buildWaveform(samples, 360),
    lowConfidenceFrames,
    filteredFrames: rawPitchTrack.length - rawDetectedPitchTrack.length,
    octaveCorrections: corrections
  };
}

export function detectYinPitch(frame: Float32Array, sampleRate: number): YinEstimate {
  const maxTau = Math.min(Math.floor(sampleRate / MIN_FREQUENCY), frame.length / 2 - 1);
  const minTau = Math.max(2, Math.floor(sampleRate / MAX_FREQUENCY));
  const difference = new Float64Array(maxTau + 1);
  const cmnd = new Float64Array(maxTau + 1);

  let mean = 0;
  for (let index = 0; index < frame.length; index += 1) {
    mean += frame[index];
  }
  mean /= frame.length;

  for (let tau = 1; tau <= maxTau; tau += 1) {
    let sum = 0;
    const limit = frame.length - tau;
    for (let index = 0; index < limit; index += 1) {
      const delta = frame[index] - mean - (frame[index + tau] - mean);
      sum += delta * delta;
    }
    difference[tau] = sum;
  }

  cmnd[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau <= maxTau; tau += 1) {
    runningSum += difference[tau];
    cmnd[tau] = runningSum === 0 ? 1 : (difference[tau] * tau) / runningSum;
  }

  let selectedTau = -1;
  for (let tau = minTau; tau <= maxTau; tau += 1) {
    if (cmnd[tau] < YIN_THRESHOLD) {
      while (tau + 1 <= maxTau && cmnd[tau + 1] < cmnd[tau]) {
        tau += 1;
      }
      selectedTau = tau;
      break;
    }
  }

  if (selectedTau < 0) {
    let bestTau = minTau;
    for (let tau = minTau + 1; tau <= maxTau; tau += 1) {
      if (cmnd[tau] < cmnd[bestTau]) bestTau = tau;
    }
    if (1 - cmnd[bestTau] < MIN_CONFIDENCE) {
      return { frequency: null, confidence: Math.max(0, 1 - cmnd[bestTau]) };
    }
    selectedTau = bestTau;
  }

  const refinedTau = parabolicInterpolation(cmnd, selectedTau);
  const frequency = refinedTau > 0 ? sampleRate / refinedTau : null;
  return {
    frequency,
    confidence: Math.max(0, Math.min(1, 1 - cmnd[selectedTau]))
  };
}

function buildRawDetectedPitchTrack(rawFrames: RawPitchFrame[]) {
  return rawFrames
    .filter(
    (frame): frame is RawPitchFrame & { frequency: number; midi: number } =>
      frame.voiced && frame.frequency !== null && frame.midi !== null
    )
    .map((frame): PitchPoint => {
      const note = frequencyToNote(frame.frequency);
      return {
        time: frame.time,
        frequency: frame.frequency,
        noteName: note.noteName,
        midi: frame.midi,
        centsFromNearest: note.centsFromNearest,
        clarity: frame.confidence,
        confidence: frame.confidence,
        rms: frame.rms,
        voiced: true
      };
    });
}

function buildScoringAdjustedTrack(rawDetectedPitchTrack: PitchPoint[]) {
  const correctedMidis = rawDetectedPitchTrack.map((point) => point.midi);
  const corrections: OctaveCorrection[] = [];

  for (let index = 1; index < rawDetectedPitchTrack.length - 1; index += 1) {
    const current = correctedMidis[index];
    const previous = correctedMidis[index - 1];
    const next = correctedMidis[index + 1];
    const neighborsAgree = Math.abs(previous - next) < 1.4;
    const octaveDistance = Math.abs(current - (previous + next) / 2);

    if (neighborsAgree && octaveDistance > 10.5 && octaveDistance < 13.5) {
      const correctedMidi = current > previous ? current - 12 : current + 12;
      const correctedFrequency = midiToFrequency(correctedMidi);
      corrections.push({
        time: rawDetectedPitchTrack[index].time,
        originalFrequency: rawDetectedPitchTrack[index].frequency,
        correctedFrequency
      });
      correctedMidis[index] = correctedMidi;
    }
  }

  const smoothedMidis = correctedMidis.map((midi, index) => {
    const local = correctedMidis
      .slice(Math.max(0, index - 2), Math.min(correctedMidis.length, index + 3))
      .filter((candidate) => Math.abs(candidate - midi) <= 3);
    return median(local.length > 0 ? local : [midi]);
  });

  const points: PitchPoint[] = rawDetectedPitchTrack.map((rawPoint, index) => {
    const frequency = midiToFrequency(smoothedMidis[index]);
    const note = frequencyToNote(frequency);
    const correction = corrections.find((item) => Math.abs(item.time - rawPoint.time) < 0.0001);

    return {
      time: rawPoint.time,
      frequency,
      noteName: note.noteName,
      midi: frequencyToContinuousMidi(frequency),
      centsFromNearest: note.centsFromNearest,
      clarity: rawPoint.confidence,
      confidence: rawPoint.confidence,
      rms: rawPoint.rms,
      voiced: true,
      originalFrequency: correction ? rawPoint.frequency : undefined,
      octaveCorrected: Boolean(correction)
    };
  });

  return { points, corrections };
}

function mixToMono(audioBuffer: AudioBuffer) {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0).slice();
  }

  const output = new Float32Array(audioBuffer.length);
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      output[index] += data[index] / audioBuffer.numberOfChannels;
    }
  }
  return output;
}

function calculateRms(buffer: Float32Array) {
  let sum = 0;
  for (let index = 0; index < buffer.length; index += 1) {
    sum += buffer[index] * buffer[index];
  }
  return Math.sqrt(sum / buffer.length);
}

function parabolicInterpolation(values: Float64Array, index: number) {
  if (index <= 0 || index >= values.length - 1) return index;
  const left = values[index - 1];
  const center = values[index];
  const right = values[index + 1];
  const denominator = left - 2 * center + right;
  if (Math.abs(denominator) < 1e-12) return index;
  return index + 0.5 * (left - right) / denominator;
}

function buildWaveform(samples: Float32Array, bucketCount: number) {
  const bucketSize = Math.max(1, Math.floor(samples.length / bucketCount));
  const waveform: number[] = [];
  for (let start = 0; start < samples.length; start += bucketSize) {
    let peak = 0;
    const end = Math.min(samples.length, start + bucketSize);
    for (let index = start; index < end; index += 1) {
      peak = Math.max(peak, Math.abs(samples[index]));
    }
    waveform.push(peak);
  }
  return waveform;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function frequencyToContinuousMidi(frequency: number) {
  return 69 + 12 * Math.log2(frequency / 440);
}
