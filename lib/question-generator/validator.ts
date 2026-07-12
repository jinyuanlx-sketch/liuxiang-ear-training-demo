import type {
  QuestionGeneratorParams,
  QuestionValidationResult,
  SightSingingQuestion
} from "@/types/question-bank";
import { noteNameToMidi } from "@/lib/pitch-detection/notes";

export function validateSightSingingQuestion(
  question: Pick<
    SightSingingQuestion,
    | "targetPitchJson"
    | "targetRhythmJson"
    | "rangeLow"
    | "rangeHigh"
    | "timeSignature"
    | "difficultyTags"
  >,
  params?: Partial<QuestionGeneratorParams>
): QuestionValidationResult {
  const issues: QuestionValidationResult["issues"] = [];

  if (question.targetPitchJson.length === 0) {
    issues.push({
      code: "missing_pitch",
      message: "target_pitch_json 不能为空。",
      severity: "error"
    });
  }

  if (question.targetPitchJson.length !== question.targetRhythmJson.length) {
    issues.push({
      code: "pitch_rhythm_length_mismatch",
      message: "target_pitch_json 和 target_rhythm_json 长度必须一致。",
      severity: "error"
    });
  }

  const low = noteNameToMidi(question.rangeLow);
  const high = noteNameToMidi(question.rangeHigh);
  const outOfRange = question.targetPitchJson.some((pitch) => {
    const midi = noteNameToMidi(pitch);
    return midi < low || midi > high;
  });

  if (outOfRange) {
    issues.push({
      code: "range_out_of_bounds",
      message: "存在超出题目音域的音。",
      severity: "error"
    });
  }

  if (!question.timeSignature.includes("/")) {
    issues.push({
      code: "invalid_time_signature",
      message: "拍号格式应类似 2/4 或 4/4。",
      severity: "error"
    });
  }

  if (params?.allowTriplets === false && question.targetRhythmJson.includes("triplet")) {
    issues.push({
      code: "triplet_not_allowed",
      message: "当前出题参数不允许三连音。",
      severity: "error"
    });
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues
  };
}
