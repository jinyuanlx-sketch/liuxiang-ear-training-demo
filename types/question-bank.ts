import type { AssignmentType, ModuleKey } from "@/types/module";

export type QuestionSourceType =
  | "manual_create"
  | "json_import"
  | "musicxml_import"
  | "ai_generated"
  | "teacher_edited";

export type QuestionReviewStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "archived";

export type SightSingingMode = "major" | "minor" | "modal" | "atonal_reserved";

export interface SightSingingQuestion {
  id: string;
  title: string;
  level: number;
  keySignature: string;
  mode: SightSingingMode;
  timeSignature: string;
  tempo: number;
  measuresCount: number;
  clef: "treble" | "bass" | "alto" | "tenor";
  rangeLow: string;
  rangeHigh: string;
  scoreImageUrl?: string | null;
  pdfUrl?: string | null;
  musicxmlUrl?: string | null;
  midiUrl?: string | null;
  targetPitchJson: string[];
  targetRhythmJson: string[];
  rubricJson: Record<string, unknown>;
  difficultyTags: string[];
  trainingGoal: string;
  teacherStyleNotes?: string | null;
  sourceType: QuestionSourceType;
  reviewStatus: QuestionReviewStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EarTrainingQuestion {
  id: string;
  title: string;
  level: number;
  type: Extract<
    AssignmentType,
    "single_note" | "interval" | "chord" | "rhythm_choice" | "melody_dictation"
  >;
  midiUrl?: string | null;
  audioUrl?: string | null;
  stimulusJson: Record<string, unknown>;
  answerKeyJson: {
    correctAnswer: string;
    aliases?: string[];
  };
  choicesJson: string[];
  explanation?: string | null;
  difficultyTags: string[];
  sourceType: QuestionSourceType;
  reviewStatus: QuestionReviewStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type QuestionRefType = Extract<ModuleKey, "sight_singing" | "ear_training" | "theory">;

export interface QuestionGeneratorParams {
  level: number;
  keySignature: string;
  mode: SightSingingMode;
  timeSignature: string;
  measuresCount: number;
  tempo: number;
  allowedNoteValues: string[];
  allowedIntervals: string[];
  maxLeap: string;
  rangeLow: string;
  rangeHigh: string;
  allowAccidentals: boolean;
  allowSyncopation: boolean;
  allowDottedRhythm: boolean;
  allowTriplets: boolean;
  cadenceRule: string;
  trainingGoal: string;
}

export interface QuestionValidationResult {
  valid: boolean;
  issues: {
    code: string;
    message: string;
    severity: "error" | "warning";
  }[];
}

export interface QuestionAnnotation {
  id: string;
  questionId: string;
  module: Extract<ModuleKey, "sight_singing" | "ear_training">;
  teacherId: string;
  levelAccuracy: number;
  examLikeScore: number;
  trainingValueScore: number;
  levelFitScore: number;
  melodicNaturalness?: number;
  tonalityClarity?: number;
  rhythmStandardness?: number;
  needsRevision: boolean;
  revisionReason?: string | null;
  createdAt: string;
}
