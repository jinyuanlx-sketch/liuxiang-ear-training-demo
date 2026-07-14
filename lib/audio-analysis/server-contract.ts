import type { PitchComparisonResult } from "@/types/audio";

export const AUDIO_ANALYSIS_API_VERSION = "v1";

export interface ServerAudioAnalysisRequestMetadata {
  apiVersion: typeof AUDIO_ANALYSIS_API_VERSION;
  questionId: string;
  tempo: number;
  timeSignature: string;
  targetPitchJson: string[];
  targetRhythmJson: string[];
}

export interface ServerAudioAnalysisResponse extends PitchComparisonResult {
  provider: "crepe" | "torchcrepe" | "pyin";
  modelVersion: string;
  analyzedAt: string;
}

export async function requestServerAudioAnalysis(
  endpoint: string,
  audioBlob: Blob,
  metadata: ServerAudioAnalysisRequestMetadata
): Promise<ServerAudioAnalysisResponse> {
  const body = new FormData();
  body.append("audio", audioBlob, "recording");
  body.append("metadata", JSON.stringify(metadata));
  const response = await fetch(endpoint, { method: "POST", body });
  if (!response.ok) throw new Error(`Audio analysis service returned ${response.status}`);
  return response.json() as Promise<ServerAudioAnalysisResponse>;
}
