import { analyzePitchSamples } from "@/lib/pitch-detection/detect";

export interface SyntheticPitchSelfTestResult {
  passed: boolean;
  expectedFrequency: number;
  detectedFrequency: number | null;
  centError: number | null;
  voicedFrames: number;
  medianConfidence: number | null;
}

export function runSyntheticPitchSelfTest(): SyntheticPitchSelfTestResult {
  const sampleRate = 48000;
  const frequency = 440;
  const duration = 1.5;
  const samples = new Float32Array(Math.floor(sampleRate * duration));
  const fadeSamples = Math.floor(sampleRate * 0.03);

  for (let index = 0; index < samples.length; index += 1) {
    const fadeIn = Math.min(1, index / fadeSamples);
    const fadeOut = Math.min(1, (samples.length - index - 1) / fadeSamples);
    samples[index] = Math.sin((2 * Math.PI * frequency * index) / sampleRate) * 0.35 * fadeIn * fadeOut;
  }

  const result = analyzePitchSamples(samples, sampleRate);
  const frequencies = result.processedPitchTrack.map((point) => point.frequency);
  const confidences = result.processedPitchTrack.map((point) => point.confidence);
  const detectedFrequency = frequencies.length > 0 ? median(frequencies) : null;
  const centError = detectedFrequency
    ? 1200 * Math.log2(detectedFrequency / frequency)
    : null;

  return {
    passed: centError !== null && Math.abs(centError) <= 5 && frequencies.length > 20,
    expectedFrequency: frequency,
    detectedFrequency,
    centError,
    voicedFrames: frequencies.length,
    medianConfidence: confidences.length > 0 ? median(confidences) : null
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}
