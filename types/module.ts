export type ModuleKey = "sight_singing" | "ear_training" | "theory";

export type UserRole = "student" | "teacher" | "admin" | "parent";

export type AssignmentType =
  | "sight_singing_piece"
  | "single_note"
  | "interval"
  | "chord"
  | "rhythm_choice"
  | "melody_dictation"
  | "theory_quiz";

export type SubmissionStatus =
  | "not_submitted"
  | "submitted"
  | "auto_scored"
  | "teacher_reviewed"
  | "needs_redo"
  | "completed";

export interface ModuleSetting {
  id: string;
  module: ModuleKey;
  enabled: boolean;
  displayName: string;
  sortOrder: number;
}

export const moduleLabels: Record<ModuleKey, string> = {
  sight_singing: "视唱",
  ear_training: "练耳",
  theory: "乐理"
};

export const assignmentTypeLabels: Record<AssignmentType, string> = {
  sight_singing_piece: "视唱谱例",
  single_note: "单音听辨",
  interval: "音程听辨",
  chord: "和弦听辨",
  rhythm_choice: "节奏选择",
  melody_dictation: "旋律听写",
  theory_quiz: "乐理测验"
};
