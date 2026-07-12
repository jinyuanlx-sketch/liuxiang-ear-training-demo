import type {
  QuestionGeneratorParams,
  QuestionValidationResult,
  SightSingingQuestion
} from "@/types/question-bank";

export interface GeneratedQuestionCandidate {
  id: string;
  params: QuestionGeneratorParams;
  questionJson: Omit<
    SightSingingQuestion,
    "id" | "createdAt" | "updatedAt" | "createdBy" | "sourceType" | "reviewStatus"
  >;
  validation: QuestionValidationResult;
  createdAt: string;
}

export interface TeacherReviewAction {
  action: "approve" | "reject" | "regenerate" | "edit";
  reason?: string;
  editedQuestionJson?: Partial<SightSingingQuestion>;
}
