export interface PitchPoint {
  time: number;
  frequency: number;
  noteName: string;
  midi: number;
  centsFromNearest: number;
  clarity: number;
}

export interface PitchComparisonItem {
  targetPitch: string;
  targetMidi: number;
  detectedPitch: string | null;
  detectedMidi: number | null;
  averageFrequency: number | null;
  centDeviation: number | null;
  status: "accurate" | "sharp" | "flat" | "missed";
}

export interface PitchComparisonResult {
  items: PitchComparisonItem[];
  pitchAccuracy: number;
  averageCentDeviation: number;
  maxCentDeviation: number;
  wrongNoteCount: number;
  stabilityScore: number;
  detectedPitchTrack: PitchPoint[];
  suggestions?: string[];
}
