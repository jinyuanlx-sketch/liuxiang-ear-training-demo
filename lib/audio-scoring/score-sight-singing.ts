import type { PitchComparisonResult } from "@/types/audio";
import type { SightSingingQuestion } from "@/types/question-bank";
import { detectPitchTrackFromBlob } from "@/lib/pitch-detection/detect";
import { comparePitchTrack } from "@/lib/pitch-comparison/compare";

export interface AudioScoringResult extends PitchComparisonResult {
  detectedPitchJson: PitchComparisonResult["detectedPitchTrack"];
  comparisonJson: PitchComparisonResult["items"];
  suggestions: string[];
}

export async function scoreSightSingingRecording(
  audioBlob: Blob,
  question: SightSingingQuestion
): Promise<AudioScoringResult> {
  const detectedPitchTrack = await detectPitchTrackFromBlob(audioBlob);
  const comparison = comparePitchTrack(question.targetPitchJson, detectedPitchTrack);

  return {
    ...comparison,
    detectedPitchJson: detectedPitchTrack,
    comparisonJson: comparison.items,
    suggestions: buildSuggestions(comparison)
  };
}

function buildSuggestions(comparison: PitchComparisonResult) {
  const suggestions: string[] = [];

  if (comparison.averageCentDeviation > 35) {
    suggestions.push("建议先慢速唱音名，再回到原速录音。");
  }

  if (comparison.wrongNoteCount > 0) {
    suggestions.push("重点复唱偏高或偏低位置，先在钢琴上确认目标音。");
  }

  if (comparison.stabilityScore < 70) {
    suggestions.push("保持气息支撑，长音和句尾不要下坠。");
  }

  return suggestions.length > 0 ? suggestions : ["本次基础音准较稳定，可提交老师复核。"];
}
