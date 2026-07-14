export interface PitchPoint {
  time: number;
  frequency: number;
  noteName: string;
  midi: number;
  centsFromNearest: number;
  clarity: number;
  confidence: number;
  rms: number;
  voiced: true;
  originalFrequency?: number;
  octaveCorrected?: boolean;
}

export type PitchFrameFilterReason =
  | "silence"
  | "low_confidence"
  | "out_of_range"
  | "transition";

export interface RawPitchFrame {
  time: number;
  frequency: number | null;
  midi: number | null;
  confidence: number;
  rms: number;
  voiced: boolean;
  filterReason?: PitchFrameFilterReason;
}

export interface OctaveCorrection {
  time: number;
  originalFrequency: number;
  correctedFrequency: number;
}

export interface PitchDetectionResult {
  algorithm: "yin";
  sampleRate: number;
  duration: number;
  rawPitchTrack: RawPitchFrame[];
  rawDetectedPitchTrack: PitchPoint[];
  scoringAdjustedPitchTrack: PitchPoint[];
  /** @deprecated Use scoringAdjustedPitchTrack for scoring and rawDetectedPitchTrack for charts. */
  processedPitchTrack: PitchPoint[];
  waveform: number[];
  lowConfidenceFrames: number;
  filteredFrames: number;
  octaveCorrections: OctaveCorrection[];
}

export type VoiceType = "female" | "male";

export type NoteRegisterStatus =
  | "normal_register"
  | "high_note_octave_substitution"
  | "wrong_register"
  | "missed"
  | "rest";

export interface TargetPitchTrackPoint {
  index: number;
  noteName: string;
  midi: number | null;
  startTime: number;
  endTime: number;
  isRest: boolean;
}

export interface TargetNoteTimelineItem {
  index: number;
  targetPitch: string;
  targetMidi: number | null;
  rhythm: string;
  beats: number;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  measure: number;
  beatInMeasure: number;
  isRest: boolean;
}

export interface PitchComparisonItem {
  targetPitch: string;
  targetMidi: number;
  detectedPitch: string | null;
  detectedMidi: number | null;
  averageFrequency: number | null;
  centDeviation: number | null;
  status: "accurate" | "sharp" | "flat" | "missed" | "rest";
  confidence?: number;
  octaveError?: boolean;
  onsetDeviationMs?: number | null;
  durationDeviationMs?: number | null;
  stabilityCents?: number | null;
  targetStartTime?: number;
  targetEndTime?: number;
  detectedStartTime?: number | null;
  detectedEndTime?: number | null;
  rawDetectedMidi?: number | null;
  writtenTargetMidi?: number | null;
  expectedSoundingMidi?: number | null;
  scoringAdjustedMidi?: number | null;
  voiceType?: VoiceType;
  noteRegisterStatus?: NoteRegisterStatus;
}

export interface PitchComparisonResult {
  items: PitchComparisonItem[];
  pitchAccuracy: number;
  averageCentDeviation: number;
  maxCentDeviation: number;
  wrongNoteCount: number;
  stabilityScore: number;
  detectedPitchTrack: PitchPoint[];
  writtenTargetPitchTrack?: TargetPitchTrackPoint[];
  expectedSoundingPitchTrack?: TargetPitchTrackPoint[];
  rawDetectedPitchTrack?: PitchPoint[];
  scoringAdjustedPitchTrack?: PitchPoint[];
  voiceType?: VoiceType;
  targetTimeline?: TargetNoteTimelineItem[];
  alignmentMethod?: "rhythm_timeline_dtw";
  tempoScale?: number;
  extraSegmentCount?: number;
  rawPitchTrack?: RawPitchFrame[];
  lowConfidenceFrames?: number;
  filteredFrames?: number;
  octaveCorrections?: OctaveCorrection[];
  experimental?: true;
  suggestions?: string[];
}

export interface RecorderLevelState {
  rms: number;
  peak: number;
  clipping: boolean;
  volumeDrop: boolean;
}

export interface RecorderDiagnostics {
  supportedConstraints: Pick<
    MediaTrackSupportedConstraints,
    | "channelCount"
    | "echoCancellation"
    | "noiseSuppression"
    | "autoGainControl"
    | "sampleRate"
  >;
  requestedConstraints: MediaTrackConstraints;
  trackSettings: MediaTrackSettings | null;
  mimeType: string | null;
  audioContextSampleRate: number | null;
  usedFallbackConstraints: boolean;
}
