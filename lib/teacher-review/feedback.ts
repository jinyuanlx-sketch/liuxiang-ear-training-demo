export const teacherFeedbackDimensions = [
  { key: "pitch", label: "音准" },
  { key: "rhythm", label: "节奏" },
  { key: "tonality", label: "调性感" },
  { key: "tempo", label: "速度稳定性" },
  { key: "phrasing", label: "呼吸与乐句" }
] as const;

export type TeacherFeedbackDimensionKey =
  (typeof teacherFeedbackDimensions)[number]["key"];
