import type { ModuleKey, SubmissionStatus } from "@/types/module";
import type { PitchComparisonResult } from "@/types/audio";

export interface PracticeRecord {
  id: string;
  studentId: string;
  module: ModuleKey;
  type: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  detailJson: Record<string, unknown>;
  practicedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionType: "audio" | "choice" | "text" | "file";
  fileUrl?: string | null;
  textAnswer?: string | null;
  selectedAnswer?: string | null;
  autoScore?: number | null;
  autoResultJson?: PitchComparisonResult | Record<string, unknown> | null;
  status: SubmissionStatus;
  submittedAt: string;
}

export interface TeacherFeedback {
  id: string;
  submissionId: string;
  teacherId: string;
  textFeedback: string;
  audioFeedbackUrl?: string | null;
  ratingJson: {
    pitch?: number;
    rhythm?: number;
    tonality?: number;
    tempo?: number;
    phrasing?: number;
  };
  nextSteps: string;
  createdAt: string;
}
