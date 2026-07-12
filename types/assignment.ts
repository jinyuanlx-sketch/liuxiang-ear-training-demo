import type { AssignmentType, ModuleKey } from "@/types/module";
import type { QuestionRefType } from "@/types/question-bank";

export interface SightSingingTargetData {
  key: string;
  meter: string;
  tempo: number;
  difficultyLabel: string;
  trainingGoal: string;
  teacherInstruction: string;
  targetPitches: string[];
  rhythmPattern?: string[] | null;
  scoreUrl?: string | null;
}

export interface EarTrainingTargetData {
  questionCount: number;
  answerMode?: "fixed_note" | "solfege";
  allowedOptions?: string[];
}

export type AssignmentTargetData =
  | SightSingingTargetData
  | EarTrainingTargetData
  | Record<string, unknown>;

export interface Assignment {
  id: string;
  title: string;
  module: ModuleKey;
  type: AssignmentType;
  difficulty: number;
  teacherId: string;
  classId?: string | null;
  studentId?: string | null;
  description: string;
  questionId?: string | null;
  questionRefType?: QuestionRefType | null;
  targetData: AssignmentTargetData;
  scoreConfig?: Record<string, unknown>;
  dueDate?: string | null;
  createdAt: string;
}
