import type { PitchComparisonItem, PitchComparisonResult, PitchPoint } from "@/types/audio";
import {
  centDeviation,
  frequencyToMidi,
  midiToNoteName,
  noteNameToMidi
} from "@/lib/pitch-detection/notes";

export function comparePitchTrack(
  targetPitches: string[],
  detectedPitchTrack: PitchPoint[]
): PitchComparisonResult {
  if (targetPitches.length === 0 || detectedPitchTrack.length === 0) {
    return {
      items: targetPitches.map((targetPitch) => ({
        targetPitch,
        targetMidi: noteNameToMidi(targetPitch),
        detectedPitch: null,
        detectedMidi: null,
        averageFrequency: null,
        centDeviation: null,
        status: "missed"
      })),
      pitchAccuracy: 0,
      averageCentDeviation: 0,
      maxCentDeviation: 0,
      wrongNoteCount: targetPitches.length,
      stabilityScore: 0,
      detectedPitchTrack
    };
  }

  const startTime = detectedPitchTrack[0].time;
  const endTime = detectedPitchTrack[detectedPitchTrack.length - 1].time;
  const segmentLength = Math.max(0.3, (endTime - startTime) / targetPitches.length);

  const items: PitchComparisonItem[] = targetPitches.map((targetPitch, index) => {
    const targetMidi = noteNameToMidi(targetPitch);
    const segmentStart = startTime + index * segmentLength;
    const segmentEnd = segmentStart + segmentLength;
    const segmentPoints = detectedPitchTrack.filter(
      (point) => point.time >= segmentStart && point.time < segmentEnd
    );

    if (segmentPoints.length === 0) {
      return {
        targetPitch,
        targetMidi,
        detectedPitch: null,
        detectedMidi: null,
        averageFrequency: null,
        centDeviation: null,
        status: "missed"
      };
    }

    const averageFrequency =
      segmentPoints.reduce((sum, point) => sum + point.frequency, 0) / segmentPoints.length;
    const detectedMidi = frequencyToMidi(averageFrequency);
    const deviation = centDeviation(averageFrequency, targetMidi);

    return {
      targetPitch,
      targetMidi,
      detectedPitch: midiToNoteName(detectedMidi),
      detectedMidi,
      averageFrequency,
      centDeviation: Math.round(deviation),
      status: getPitchStatus(deviation)
    };
  });

  const completedItems = items.filter((item) => item.centDeviation !== null);
  const deviations = completedItems.map((item) => Math.abs(item.centDeviation ?? 0));
  const accurateCount = items.filter((item) => item.status === "accurate").length;
  const averageCentDeviation =
    deviations.length > 0 ? deviations.reduce((sum, value) => sum + value, 0) / deviations.length : 0;
  const maxCentDeviation = deviations.length > 0 ? Math.max(...deviations) : 0;
  const wrongNoteCount = items.filter((item) => item.status !== "accurate").length;

  return {
    items,
    pitchAccuracy: Math.round((accurateCount / targetPitches.length) * 100),
    averageCentDeviation: Math.round(averageCentDeviation),
    maxCentDeviation: Math.round(maxCentDeviation),
    wrongNoteCount,
    stabilityScore: calculateStabilityScore(detectedPitchTrack),
    detectedPitchTrack
  };
}

function getPitchStatus(deviation: number): PitchComparisonItem["status"] {
  if (Math.abs(deviation) <= 35) return "accurate";
  return deviation > 0 ? "sharp" : "flat";
}

function calculateStabilityScore(points: PitchPoint[]) {
  if (points.length < 4) {
    return 0;
  }

  const jitter =
    points.reduce((sum, point, index) => {
      if (index === 0) return sum;
      return sum + Math.abs(point.midi - points[index - 1].midi);
    }, 0) /
    (points.length - 1);

  return Math.max(0, Math.round(100 - jitter * 18));
}
