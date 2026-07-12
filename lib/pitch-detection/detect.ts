import type { PitchPoint } from "@/types/audio";
import { frequencyToNote } from "@/lib/pitch-detection/notes";

const WINDOW_SIZE = 2048;
const HOP_SIZE = 1024;
const MIN_FREQUENCY = 70;
const MAX_FREQUENCY = 1100;
const RMS_THRESHOLD = 0.015;

export async function detectPitchTrackFromBlob(blob: Blob): Promise<PitchPoint[]> {
  const audioContext = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const points: PitchPoint[] = [];

  for (let start = 0; start + WINDOW_SIZE < channelData.length; start += HOP_SIZE) {
    const frame = channelData.slice(start, start + WINDOW_SIZE);
    const rms = calculateRms(frame);

    if (rms < RMS_THRESHOLD) {
      continue;
    }

    const frequency = autoCorrelate(frame, sampleRate);

    if (!frequency || frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
      continue;
    }

    const note = frequencyToNote(frequency);

    points.push({
      time: start / sampleRate,
      frequency,
      noteName: note.noteName,
      midi: note.midi,
      centsFromNearest: note.centsFromNearest,
      clarity: Math.min(1, rms * 18)
    });
  }

  await audioContext.close();
  return points;
}

function calculateRms(buffer: Float32Array) {
  let sum = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    sum += buffer[index] * buffer[index];
  }

  return Math.sqrt(sum / buffer.length);
}

function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let bestOffset = -1;
  let bestCorrelation = 0;
  const minOffset = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxOffset = Math.floor(sampleRate / MIN_FREQUENCY);

  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;

    for (let index = 0; index < buffer.length - offset; index += 1) {
      correlation += buffer[index] * buffer[index + offset];
    }

    correlation /= buffer.length - offset;

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestOffset < 0 || bestCorrelation < 0.01) {
    return null;
  }

  return sampleRate / bestOffset;
}
