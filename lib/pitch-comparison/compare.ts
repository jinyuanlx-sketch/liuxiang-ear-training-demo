import type {
  OctaveCorrection,
  PitchComparisonItem,
  PitchComparisonResult,
  PitchPoint,
  RawPitchFrame,
  TargetNoteTimelineItem,
  TargetPitchTrackPoint,
  VoiceType
} from "@/types/audio";
import { midiToNoteName, noteNameToMidi } from "@/lib/pitch-detection/notes";
import {
  buildRegisterTargetTracks,
  evaluateNoteRegister,
  expectedSoundingMidiForVoice
} from "@/lib/pitch-comparison/register";

export interface PitchComparisonOptions {
  targetRhythms?: string[] | null;
  tempo?: number;
  timeSignature?: string;
  voiceType?: VoiceType;
  scoringAdjustedPitchTrack?: PitchPoint[];
  allowHighNoteOctaveSubstitution?: boolean;
  rawPitchTrack?: RawPitchFrame[];
  lowConfidenceFrames?: number;
  filteredFrames?: number;
  octaveCorrections?: OctaveCorrection[];
}

interface ObservedSegment {
  id: number;
  points: PitchPoint[];
  startTime: number;
  endTime: number;
  duration: number;
  medianMidi: number;
  medianFrequency: number;
  confidence: number;
}

const DELETE_COST = 1.35;
const INSERT_COST = 1.25;

export function comparePitchTrack(
  targetPitches: string[],
  rawDetectedPitchTrackInput: PitchPoint[],
  options: PitchComparisonOptions = {}
): PitchComparisonResult {
  const voiceType = options.voiceType ?? "female";
  const rawDetectedPitchTrack = rawDetectedPitchTrackInput.map((point) => ({ ...point }));
  const scoringAdjustedPitchTrack = (
    options.scoringAdjustedPitchTrack ?? rawDetectedPitchTrackInput
  ).map((point) => ({ ...point }));
  const writtenTimeline = buildTargetTimeline(
    targetPitches,
    options.targetRhythms,
    options.tempo ?? 60,
    options.timeSignature ?? "4/4"
  );
  const expectedTimeline = writtenTimeline.map((item) => ({
    ...item,
    targetMidi:
      item.targetMidi === null
        ? null
        : expectedSoundingMidiForVoice(item.targetMidi, voiceType)
  }));
  const pitchedTargets = expectedTimeline.filter(
    (item) => !item.isRest && item.targetMidi !== null
  );

  if (pitchedTargets.length === 0 || rawDetectedPitchTrack.length === 0) {
    const tracks = buildRegisterTargetTracks(writtenTimeline, voiceType);
    const items = writtenTimeline.map((item, index) =>
      emptyComparisonItem(item, expectedTimeline[index], voiceType)
    );
    return buildResult({
      items,
      rawDetectedPitchTrack,
      scoringAdjustedPitchTrack,
      writtenTimeline,
      writtenTargetPitchTrack: tracks.writtenTargetPitchTrack,
      expectedSoundingPitchTrack: tracks.expectedSoundingPitchTrack,
      tempoScale: 1,
      extraSegmentCount: 0,
      voiceType,
      options
    });
  }

  const segments = buildObservedSegments(scoringAdjustedPitchTrack);
  if (segments.length === 0) {
    const tracks = buildRegisterTargetTracks(writtenTimeline, voiceType);
    const items = writtenTimeline.map((item, index) =>
      emptyComparisonItem(item, expectedTimeline[index], voiceType)
    );
    return buildResult({
      items,
      rawDetectedPitchTrack,
      scoringAdjustedPitchTrack,
      writtenTimeline,
      writtenTargetPitchTrack: tracks.writtenTargetPitchTrack,
      expectedSoundingPitchTrack: tracks.expectedSoundingPitchTrack,
      tempoScale: 1,
      extraSegmentCount: 0,
      voiceType,
      options
    });
  }

  const firstTargetStart = pitchedTargets[0].startTime;
  const lastTargetEnd = pitchedTargets[pitchedTargets.length - 1].endTime;
  const expectedSpan = Math.max(0.25, lastTargetEnd - firstTargetStart);
  const observedSpan = Math.max(
    0.25,
    segments[segments.length - 1].endTime - segments[0].startTime
  );
  const tempoScale = clamp(observedSpan / expectedSpan, 0.6, 1.6);
  const actualStart = segments[0].startTime - firstTargetStart * tempoScale;
  const mapping = alignTargetsWithDtw(pitchedTargets, segments, actualStart, tempoScale);
  const mappedSegmentIds = new Set([...mapping.values()].map((segment) => segment.id));
  const tracks = buildRegisterTargetTracks(writtenTimeline, voiceType, actualStart, tempoScale);

  const items = writtenTimeline.map((writtenTarget, index) => {
    const expectedTarget = expectedTimeline[index];
    const alignedStart = actualStart + writtenTarget.startTime * tempoScale;
    const alignedEnd = actualStart + writtenTarget.endTime * tempoScale;

    if (writtenTarget.isRest || writtenTarget.targetMidi === null || expectedTarget.targetMidi === null) {
      const voicedDuringRest = rawDetectedPitchTrack.filter(
        (point) => point.time >= alignedStart && point.time <= alignedEnd
      );
      return {
        ...emptyComparisonItem(writtenTarget, expectedTarget, voiceType),
        status: voicedDuringRest.length > 1 ? "missed" : "rest",
        noteRegisterStatus: voicedDuringRest.length > 1 ? "wrong_register" : "rest",
        targetStartTime: alignedStart,
        targetEndTime: alignedEnd
      } satisfies PitchComparisonItem;
    }

    const segment = mapping.get(writtenTarget.index);
    if (!segment) {
      return {
        ...emptyComparisonItem(writtenTarget, expectedTarget, voiceType),
        targetStartTime: alignedStart,
        targetEndTime: alignedEnd
      };
    }

    const rawSegmentPoints = rawDetectedPitchTrack.filter(
      (point) => point.time >= segment.startTime && point.time <= segment.endTime
    );
    const rawStablePoints = getStableZone(rawSegmentPoints);
    const scoringStablePoints = getStableZone(segment.points);
    if (rawStablePoints.length === 0) {
      return {
        ...emptyComparisonItem(writtenTarget, expectedTarget, voiceType),
        targetStartTime: alignedStart,
        targetEndTime: alignedEnd,
        detectedStartTime: segment.startTime,
        detectedEndTime: segment.endTime
      } satisfies PitchComparisonItem;
    }
    const rawDetectedFrequency = median(rawStablePoints.map((point) => point.frequency));
    const rawDetectedMidi = frequencyToContinuousMidi(rawDetectedFrequency);
    const scoringCandidateMidi = median(scoringStablePoints.map((point) => point.midi));
    const register = evaluateNoteRegister({
      writtenTargetMidi: writtenTarget.targetMidi,
      rawDetectedMidi,
      scoringCandidateMidi,
      voiceType,
      allowHighNoteOctaveSubstitution:
        options.allowHighNoteOctaveSubstitution ?? true
    });
    const deviation =
      (register.scoringAdjustedMidi - register.expectedSoundingMidi) * 100;
    const stabilityCents = median(
      rawStablePoints.map((point) =>
        Math.abs(1200 * Math.log2(point.frequency / rawDetectedFrequency))
      )
    );
    const octaveError =
      register.noteRegisterStatus === "wrong_register" ||
      segment.points.some((point) => point.octaveCorrected);

    return {
      targetPitch: writtenTarget.targetPitch,
      targetMidi: writtenTarget.targetMidi,
      detectedPitch: midiToNoteName(Math.round(rawDetectedMidi)),
      detectedMidi: rawDetectedMidi,
      averageFrequency: rawDetectedFrequency,
      centDeviation: Math.round(deviation),
      status: getPitchStatus(deviation),
      confidence: round(average(rawStablePoints.map((point) => point.confidence)), 3),
      octaveError,
      onsetDeviationMs: Math.round((segment.startTime - alignedStart) * 1000),
      durationDeviationMs: Math.round(
        (segment.duration - writtenTarget.durationSeconds * tempoScale) * 1000
      ),
      stabilityCents: Math.round(stabilityCents),
      targetStartTime: alignedStart,
      targetEndTime: alignedEnd,
      detectedStartTime: segment.startTime,
      detectedEndTime: segment.endTime,
      rawDetectedMidi: register.rawDetectedMidi,
      writtenTargetMidi: register.writtenTargetMidi,
      expectedSoundingMidi: register.expectedSoundingMidi,
      scoringAdjustedMidi: register.scoringAdjustedMidi,
      voiceType: register.voiceType,
      noteRegisterStatus: register.noteRegisterStatus
    } satisfies PitchComparisonItem;
  });

  return buildResult({
    items,
    rawDetectedPitchTrack,
    scoringAdjustedPitchTrack,
    writtenTimeline,
    writtenTargetPitchTrack: tracks.writtenTargetPitchTrack,
    expectedSoundingPitchTrack: tracks.expectedSoundingPitchTrack,
    tempoScale,
    extraSegmentCount: Math.max(0, segments.length - mappedSegmentIds.size),
    voiceType,
    options
  });
}

export function buildTargetTimeline(
  targetPitches: string[],
  targetRhythms: string[] | null | undefined,
  tempo: number,
  timeSignature: string
): TargetNoteTimelineItem[] {
  const safeTempo = Number.isFinite(tempo) && tempo > 0 ? tempo : 60;
  const beatSeconds = 60 / safeTempo;
  const beatsPerMeasure = Number(timeSignature.split("/")[0]) || 4;
  let elapsedBeats = 0;

  return targetPitches.map((targetPitch, index) => {
    const rhythm = targetRhythms?.[index] ?? "quarter";
    const beats = rhythmToQuarterBeats(rhythm);
    const isRest = /^rest([_: -]|$)/i.test(rhythm) || /^(rest|r)$/i.test(targetPitch);
    const startTime = elapsedBeats * beatSeconds;
    const endTime = (elapsedBeats + beats) * beatSeconds;
    const item: TargetNoteTimelineItem = {
      index,
      targetPitch,
      targetMidi: isRest ? null : noteNameToMidi(targetPitch),
      rhythm,
      beats,
      startTime,
      endTime,
      durationSeconds: beats * beatSeconds,
      measure: Math.floor(elapsedBeats / beatsPerMeasure) + 1,
      beatInMeasure: (elapsedBeats % beatsPerMeasure) + 1,
      isRest
    };
    elapsedBeats += beats;
    return item;
  });
}

function alignTargetsWithDtw(
  targets: TargetNoteTimelineItem[],
  segments: ObservedSegment[],
  actualStart: number,
  tempoScale: number
) {
  const rows = targets.length + 1;
  const columns = segments.length + 1;
  const costs = Array.from({ length: rows }, () =>
    Array(columns).fill(Number.POSITIVE_INFINITY)
  );
  const trace = Array.from({ length: rows }, () =>
    Array<"match" | "delete" | "insert" | null>(columns).fill(null)
  );
  costs[0][0] = 0;

  for (let row = 1; row < rows; row += 1) {
    costs[row][0] = costs[row - 1][0] + DELETE_COST;
    trace[row][0] = "delete";
  }
  for (let column = 1; column < columns; column += 1) {
    costs[0][column] = costs[0][column - 1] + INSERT_COST;
    trace[0][column] = "insert";
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const target = targets[row - 1];
      const segment = segments[column - 1];
      const match =
        costs[row - 1][column - 1] +
        targetSegmentCost(target, segment, actualStart, tempoScale);
      const deletion = costs[row - 1][column] + DELETE_COST;
      const insertion = costs[row][column - 1] + INSERT_COST;
      const best = Math.min(match, deletion, insertion);
      costs[row][column] = best;
      trace[row][column] =
        best === match ? "match" : best === deletion ? "delete" : "insert";
    }
  }

  const mapping = new Map<number, ObservedSegment>();
  let row = targets.length;
  let column = segments.length;
  while (row > 0 || column > 0) {
    const operation = trace[row][column];
    if (operation === "match") {
      mapping.set(targets[row - 1].index, segments[column - 1]);
      row -= 1;
      column -= 1;
    } else if (operation === "delete") {
      row -= 1;
    } else if (operation === "insert") {
      column -= 1;
    } else {
      break;
    }
  }
  return mapping;
}

function targetSegmentCost(
  target: TargetNoteTimelineItem,
  segment: ObservedSegment,
  actualStart: number,
  tempoScale: number
) {
  const targetMidi = target.targetMidi ?? segment.medianMidi;
  const rawPitchDistance = Math.abs(segment.medianMidi - targetMidi);
  const pitchClassDistance = Math.min(
    rawPitchDistance,
    Math.abs(rawPitchDistance - 12),
    Math.abs(rawPitchDistance - 24)
  );
  const octavePenalty = rawPitchDistance > 9 ? 0.7 : 0;
  const expectedCenter =
    actualStart + ((target.startTime + target.endTime) / 2) * tempoScale;
  const segmentCenter = (segment.startTime + segment.endTime) / 2;
  const expectedDuration = Math.max(0.12, target.durationSeconds * tempoScale);
  const timingCost = Math.min(
    3,
    Math.abs(segmentCenter - expectedCenter) / expectedDuration
  );
  const durationCost = Math.min(
    3,
    Math.abs(segment.duration - expectedDuration) / expectedDuration
  );
  return (
    Math.min(3, pitchClassDistance / 2.5) +
    octavePenalty +
    timingCost * 0.35 +
    durationCost * 0.15
  );
}

function buildObservedSegments(points: PitchPoint[]) {
  const ordered = [...points].sort((a, b) => a.time - b.time);
  const groups: PitchPoint[][] = [];
  let current: PitchPoint[] = [];

  for (const point of ordered) {
    const previous = current[current.length - 1];
    const currentMedian =
      current.length > 0 ? median(current.map((item) => item.midi)) : point.midi;
    const startsNewSegment =
      previous &&
      (point.time - previous.time > 0.16 ||
        Math.abs(point.midi - currentMedian) > 0.85);

    if (startsNewSegment) {
      if (current.length >= 2) groups.push(current);
      current = [];
    }
    current.push(point);
  }
  if (current.length >= 2) groups.push(current);

  return groups.map((segmentPoints, index) => {
    const startTime = segmentPoints[0].time;
    const endTime = segmentPoints[segmentPoints.length - 1].time;
    return {
      id: index,
      points: segmentPoints,
      startTime,
      endTime,
      duration: Math.max(0.02, endTime - startTime),
      medianMidi: median(segmentPoints.map((point) => point.midi)),
      medianFrequency: median(segmentPoints.map((point) => point.frequency)),
      confidence: average(segmentPoints.map((point) => point.confidence))
    };
  });
}

function buildResult({
  items,
  rawDetectedPitchTrack,
  scoringAdjustedPitchTrack,
  writtenTimeline,
  writtenTargetPitchTrack,
  expectedSoundingPitchTrack,
  tempoScale,
  extraSegmentCount,
  voiceType,
  options
}: {
  items: PitchComparisonItem[];
  rawDetectedPitchTrack: PitchPoint[];
  scoringAdjustedPitchTrack: PitchPoint[];
  writtenTimeline: TargetNoteTimelineItem[];
  writtenTargetPitchTrack: TargetPitchTrackPoint[];
  expectedSoundingPitchTrack: TargetPitchTrackPoint[];
  tempoScale: number;
  extraSegmentCount: number;
  voiceType: VoiceType;
  options: PitchComparisonOptions;
}): PitchComparisonResult {
  const pitchedItems = items.filter((item) => item.noteRegisterStatus !== "rest");
  const completedItems = pitchedItems.filter((item) => item.centDeviation !== null);
  const deviations = completedItems.map((item) => Math.abs(item.centDeviation ?? 0));
  const stabilityValues = completedItems
    .map((item) => item.stabilityCents)
    .filter((value): value is number => value !== null && value !== undefined);
  const accurateCount = pitchedItems.filter((item) => item.status === "accurate").length;
  const averageCentDeviation = deviations.length > 0 ? average(deviations) : 0;
  const maxCentDeviation = deviations.length > 0 ? Math.max(...deviations) : 0;
  const medianStability = stabilityValues.length > 0 ? median(stabilityValues) : 50;

  return {
    items,
    pitchAccuracy:
      pitchedItems.length > 0
        ? Math.round((accurateCount / pitchedItems.length) * 100)
        : 0,
    averageCentDeviation: Math.round(averageCentDeviation),
    maxCentDeviation: Math.round(maxCentDeviation),
    wrongNoteCount: pitchedItems.filter((item) => item.status !== "accurate").length,
    stabilityScore: Math.max(0, Math.round(100 - medianStability * 2)),
    detectedPitchTrack: rawDetectedPitchTrack,
    writtenTargetPitchTrack,
    expectedSoundingPitchTrack,
    rawDetectedPitchTrack,
    scoringAdjustedPitchTrack,
    voiceType,
    targetTimeline: writtenTimeline,
    alignmentMethod: "rhythm_timeline_dtw",
    tempoScale: round(tempoScale, 3),
    extraSegmentCount,
    rawPitchTrack: options.rawPitchTrack,
    lowConfidenceFrames: options.lowConfidenceFrames,
    filteredFrames: options.filteredFrames,
    octaveCorrections: options.octaveCorrections,
    experimental: true
  };
}

function emptyComparisonItem(
  writtenTarget: TargetNoteTimelineItem,
  expectedTarget: TargetNoteTimelineItem,
  voiceType: VoiceType
): PitchComparisonItem {
  return {
    targetPitch: writtenTarget.targetPitch,
    targetMidi: writtenTarget.targetMidi ?? 0,
    detectedPitch: null,
    detectedMidi: null,
    averageFrequency: null,
    centDeviation: null,
    status: writtenTarget.isRest ? "rest" : "missed",
    confidence: 0,
    octaveError: false,
    onsetDeviationMs: null,
    durationDeviationMs: null,
    stabilityCents: null,
    targetStartTime: writtenTarget.startTime,
    targetEndTime: writtenTarget.endTime,
    detectedStartTime: null,
    detectedEndTime: null,
    rawDetectedMidi: null,
    writtenTargetMidi: writtenTarget.targetMidi,
    expectedSoundingMidi: expectedTarget.targetMidi,
    scoringAdjustedMidi: null,
    voiceType,
    noteRegisterStatus: writtenTarget.isRest ? "rest" : "missed"
  };
}

function getPitchStatus(deviation: number): PitchComparisonItem["status"] {
  if (Math.abs(deviation) <= 35) return "accurate";
  return deviation > 0 ? "sharp" : "flat";
}

function getStableZone(points: PitchPoint[]) {
  if (points.length < 5) return points;
  const trim = Math.max(1, Math.floor(points.length * 0.2));
  return points.slice(trim, Math.max(trim + 1, points.length - trim));
}

function rhythmToQuarterBeats(rhythm: string) {
  const normalized = rhythm.toLowerCase().replace(/^rest[_: -]?/, "");
  const dotted = normalized.includes("dotted");
  let beats = 1;
  if (normalized.includes("whole")) beats = 4;
  else if (normalized.includes("half")) beats = 2;
  else if (normalized.includes("eighth")) beats = 0.5;
  else if (normalized.includes("sixteenth")) beats = 0.25;
  else if (normalized.includes("triplet")) beats = 1 / 3;
  return dotted ? beats * 1.5 : beats;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function frequencyToContinuousMidi(frequency: number) {
  return 69 + 12 * Math.log2(frequency / 440);
}
