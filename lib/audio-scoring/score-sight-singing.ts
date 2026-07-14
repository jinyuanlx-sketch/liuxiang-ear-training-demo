import type { PitchComparisonResult, VoiceType } from "@/types/audio";
import type { SightSingingQuestion } from "@/types/question-bank";
import { analyzePitchTrackFromBlob } from "@/lib/pitch-detection/detect";
import { comparePitchTrack } from "@/lib/pitch-comparison/compare";

export interface AudioScoringResult extends PitchComparisonResult {
  writtenTargetPitchJson: NonNullable<PitchComparisonResult["writtenTargetPitchTrack"]>;
  expectedSoundingPitchJson: NonNullable<PitchComparisonResult["expectedSoundingPitchTrack"]>;
  rawDetectedPitchJson: NonNullable<PitchComparisonResult["rawDetectedPitchTrack"]>;
  detectedPitchJson: PitchComparisonResult["detectedPitchTrack"];
  scoringAdjustedPitchJson: NonNullable<PitchComparisonResult["scoringAdjustedPitchTrack"]>;
  comparisonJson: PitchComparisonResult["items"];
  suggestions: string[];
}

export async function scoreSightSingingRecording(
  audioBlob: Blob,
  question: SightSingingQuestion,
  options: { voiceType?: VoiceType } = {}
): Promise<AudioScoringResult> {
  const detection = await analyzePitchTrackFromBlob(audioBlob);
  const comparison = comparePitchTrack(
    question.targetPitchJson,
    detection.rawDetectedPitchTrack,
    {
      targetRhythms: question.targetRhythmJson,
      tempo: question.tempo,
      timeSignature: question.timeSignature,
      voiceType: options.voiceType ?? "female",
      scoringAdjustedPitchTrack: detection.scoringAdjustedPitchTrack,
      rawPitchTrack: detection.rawPitchTrack,
      lowConfidenceFrames: detection.lowConfidenceFrames,
      filteredFrames: detection.filteredFrames,
      octaveCorrections: detection.octaveCorrections
    }
  );

  return {
    ...comparison,
    writtenTargetPitchJson: comparison.writtenTargetPitchTrack ?? [],
    expectedSoundingPitchJson: comparison.expectedSoundingPitchTrack ?? [],
    rawDetectedPitchJson: detection.rawDetectedPitchTrack,
    detectedPitchJson: detection.rawDetectedPitchTrack,
    scoringAdjustedPitchJson: detection.scoringAdjustedPitchTrack,
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

  const unstableNotes = comparison.items.filter(
    (item) => (item.stabilityCents ?? 0) > 25
  );

  if (unstableNotes.length > 0) {
    suggestions.push("部分单音主体区波动较大，可回放确认录音质量后再慢速复唱。");
  }

  return suggestions.length > 0
    ? suggestions
    : ["当前技术检测未发现明显异常，仍需由老师结合节奏与乐句复核。"];
}
