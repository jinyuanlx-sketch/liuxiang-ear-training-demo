"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import type { SightSingingTargetData } from "@/types/assignment";
import type { PitchComparisonResult, VoiceType } from "@/types/audio";
import type { SightSingingQuestion } from "@/types/question-bank";
import type { TrainingResourceLink, TrainingResourceQuery } from "@/types/training-resource";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { PitchCurve } from "@/components/charts/pitch-curve";
import { SightScoreViewer } from "@/components/sight-singing/sight-score-viewer";
import { VoiceTypeDialog } from "@/components/sight-singing/voice-type-dialog";
import { TrainingResourceList } from "@/components/training-resources/training-resource-list";
import { Button } from "@/components/ui/button";
import { analyzePitchTrackFromBlob } from "@/lib/pitch-detection/detect";
import { comparePitchTrack } from "@/lib/pitch-comparison/compare";
import { scoreSightSingingRecording } from "@/lib/audio-scoring/score-sight-singing";

export function SightSingingWorkspace({
  targetData,
  question,
  resultResources = [],
  resultResourceQuery
}: {
  targetData: SightSingingTargetData;
  question?: SightSingingQuestion;
  resultResources?: TrainingResourceLink[];
  resultResourceQuery?: TrainingResourceQuery;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PitchComparisonResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [voiceType, setVoiceType] = useState<VoiceType | null>(null);
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
  const pendingStartRecordingRef = useRef<(() => Promise<void>) | null>(null);
  const targetPitches = targetData.targetPitches;
  const suggestions = analysis?.suggestions ?? [];

  function handleStartRequest(startRecording: () => Promise<void>) {
    if (voiceType) {
      void startRecording();
      return;
    }

    pendingStartRecordingRef.current = startRecording;
    setIsVoiceDialogOpen(true);
  }

  function handleVoiceTypeSelect(nextVoiceType: VoiceType) {
    const startRecording = pendingStartRecordingRef.current;
    pendingStartRecordingRef.current = null;
    setVoiceType(nextVoiceType);
    setIsVoiceDialogOpen(false);
    if (startRecording) void startRecording();
  }

  function closeVoiceTypeDialog() {
    pendingStartRecordingRef.current = null;
    setIsVoiceDialogOpen(false);
  }

  async function handleAudioReady(blob: Blob) {
    if (!voiceType) {
      setMessage("请重新开始录音并选择声音类型。");
      return;
    }

    const selectedVoiceType = voiceType;
    setIsAnalyzing(true);
    setMessage(null);

    try {
      if (question) {
        setAnalysis(await scoreSightSingingRecording(blob, question, { voiceType: selectedVoiceType }));
      } else {
        const detection = await analyzePitchTrackFromBlob(blob);
        setAnalysis(
          comparePitchTrack(targetPitches, detection.rawDetectedPitchTrack, {
            targetRhythms: targetData.rhythmPattern,
            tempo: targetData.tempo,
            timeSignature: targetData.meter,
            voiceType: selectedVoiceType,
            scoringAdjustedPitchTrack: detection.scoringAdjustedPitchTrack,
            rawPitchTrack: detection.rawPitchTrack,
            lowConfidenceFrames: detection.lowConfidenceFrames,
            filteredFrames: detection.filteredFrames,
            octaveCorrections: detection.octaveCorrections
          })
        );
      }
    } catch {
      setMessage("音高检测失败。请先回放确认录音可用，并在录音诊断页查看格式与采样设置。");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const pitchedItems = analysis?.items.filter((item) => item.status !== "rest") ?? [];
  const matchedItems = pitchedItems.filter((item) => item.centDeviation !== null);
  const stableValues = matchedItems
    .map((item) => item.stabilityCents)
    .filter((value): value is number => value !== null && value !== undefined);
  const medianStability = stableValues.length > 0
    ? [...stableValues].sort((a, b) => a - b)[Math.floor(stableValues.length / 2)]
    : null;

  return (
    <div className="space-y-4">
      <div className="liuxiang-panel rounded-lg p-4">
        <div className="text-sm font-medium text-ivory">标准五线谱</div>
        <SightScoreViewer question={question} />
        <div className="mt-3 border-t border-ivory/10 pt-3">
          <div className="text-xs text-muted">教师提示</div>
          <p className="mt-1 text-sm leading-6 text-ivory/85">{targetData.teacherInstruction}</p>
        </div>
      </div>

      <AudioRecorder
        onAudioReady={handleAudioReady}
        onStartRequest={handleStartRequest}
        onReset={() => {
          setAnalysis(null);
          setMessage(null);
        }}
      />
      <p className="px-1 text-xs leading-5 text-muted">音高检测为实验功能，结果仅供练习参考。</p>

      <VoiceTypeDialog
        open={isVoiceDialogOpen}
        onSelect={handleVoiceTypeSelect}
        onClose={closeVoiceTypeDialog}
      />

      {isAnalyzing ? (
        <div className="liuxiang-panel rounded-lg p-4 text-sm text-muted">正在运行 YIN 检测与节奏时间轴对齐...</div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-brass/25 bg-brass/10 px-3 py-2 text-sm text-brass">
          {message}
        </div>
      ) : null}

      {analysis ? (
        <PitchCurve
          targetPitches={targetPitches}
          rawDetectedPitchTrack={analysis.rawDetectedPitchTrack ?? []}
          comparison={analysis}
          voiceType={analysis.voiceType ?? voiceType ?? "female"}
        />
      ) : null}

      {analysis ? (
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="逐音检测参考" value={`${matchedItems.length}/${pitchedItems.length} 个`} />
          <ResultStat label="平均偏差参考" value={`${analysis.averageCentDeviation} cents`} />
          <ResultStat label="单音内波动中位数" value={medianStability === null ? "-" : `${medianStability} cents`} />
          <ResultStat label="低置信度帧" value={`${analysis.lowConfidenceFrames ?? 0} 帧`} />
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="liuxiang-panel rounded-lg p-4">
          <div className="text-sm font-medium text-ivory">基础建议</div>
          <div className="mt-3 space-y-2">
            {suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-md border border-ivory/10 bg-ink-950/40 p-3 text-sm text-muted">
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {analysis ? (
        <Button
          type="button"
          variant="primary"
          className="w-full"
          icon={<Send className="h-4 w-4" />}
        >
          提交录音给老师诊断
        </Button>
      ) : null}

      {analysis ? (
        <TrainingResourceList
          title="对应训练"
          helper="完成练习后，可观看对应讲解。"
          resources={resultResources}
          resourceQuery={resultResourceQuery}
        />
      ) : null}
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="liuxiang-panel rounded-lg p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-lg font-semibold text-ivory">{value}</div>
    </div>
  );
}
