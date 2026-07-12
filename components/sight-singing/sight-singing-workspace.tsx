"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Music2, Send } from "lucide-react";
import type { SightSingingTargetData } from "@/types/assignment";
import type { PitchComparisonResult } from "@/types/audio";
import type { SightSingingQuestion } from "@/types/question-bank";
import type { TrainingResourceLink, TrainingResourceQuery } from "@/types/training-resource";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { PitchCurve } from "@/components/charts/pitch-curve";
import { TrainingResourceList } from "@/components/training-resources/training-resource-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detectPitchTrackFromBlob } from "@/lib/pitch-detection/detect";
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

  const targetPitches = targetData.targetPitches;
  const suggestions =
    analysis && "suggestions" in analysis && Array.isArray(analysis.suggestions)
      ? (analysis.suggestions as string[])
      : [];

  const noteCells = useMemo(
    () =>
      targetPitches.map((pitch, index) => ({
        pitch,
        result: analysis?.items[index]
      })),
    [analysis?.items, targetPitches]
  );

  async function handleAudioReady(blob: Blob) {
    setIsAnalyzing(true);
    setMessage(null);

    try {
      const comparison = question
        ? await scoreSightSingingRecording(blob, question)
        : comparePitchTrack(targetPitches, await detectPitchTrackFromBlob(blob));
      setAnalysis(comparison);
    } catch {
      setMessage("音高分析失败。请确认录音中有人声，并使用较新的浏览器。");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="liuxiang-panel rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted">谱例信息</div>
            <h2 className="mt-1 text-xl font-semibold text-ivory">{targetData.trainingGoal}</h2>
          </div>
          <Badge tone="warning">{targetData.difficultyLabel}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-md border border-ivory/10 bg-ivory/5 p-3">
            <div className="text-xs text-muted">调号</div>
            <div className="mt-1 text-ivory">{targetData.key}</div>
          </div>
          <div className="rounded-md border border-ivory/10 bg-ivory/5 p-3">
            <div className="text-xs text-muted">拍号</div>
            <div className="mt-1 text-ivory">{targetData.meter}</div>
          </div>
          <div className="rounded-md border border-ivory/10 bg-ivory/5 p-3">
            <div className="text-xs text-muted">速度</div>
            <div className="mt-1 text-ivory">{targetData.tempo} bpm</div>
          </div>
        </div>

        <div className="staff-lines mt-4 rounded-lg border border-ivory/10 bg-ink-950/50 p-4">
          <div className="flex min-h-36 items-center gap-3 overflow-x-auto pb-2">
            {noteCells.map((cell, index) => (
              <div
                key={`${cell.pitch}-${index}`}
                className="flex min-w-14 flex-col items-center justify-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/40 bg-ink-950 text-sm font-semibold text-brass">
                  {cell.pitch.replace(/\d/, "")}
                </div>
                <span className="text-xs text-muted">{cell.pitch}</span>
                {cell.result ? (
                  <span
                    className={
                      cell.result.status === "accurate"
                        ? "text-xs text-jade"
                        : "text-xs text-brass"
                    }
                  >
                    {cell.result.status === "accurate"
                      ? "准"
                      : cell.result.centDeviation
                        ? `${cell.result.centDeviation}c`
                        : "漏"}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">{targetData.teacherInstruction}</p>
      </div>

      <AudioRecorder onAudioReady={handleAudioReady} />

      {isAnalyzing ? (
        <div className="liuxiang-panel rounded-lg p-4 text-sm text-muted">正在分析音高曲线...</div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-brass/25 bg-brass/10 px-3 py-2 text-sm text-brass">
          {message}
        </div>
      ) : null}

      <PitchCurve
        targetPitches={targetPitches}
        detectedPitchTrack={analysis?.detectedPitchTrack ?? []}
        comparison={analysis}
      />

      {analysis ? (
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="音高准确度" value={`${analysis.pitchAccuracy}%`} />
          <ResultStat label="平均偏差" value={`${analysis.averageCentDeviation} cents`} />
          <ResultStat label="最大偏差" value={`${analysis.maxCentDeviation} cents`} />
          <ResultStat label="稳定性" value={`${analysis.stabilityScore}%`} />
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

      <Button
        type="button"
        variant="primary"
        className="w-full"
        icon={analysis ? <Send className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
        disabled={!analysis}
      >
        {analysis ? "提交给老师诊断" : "完成分析后可提交"}
      </Button>

      {analysis ? (
        <div className="flex items-start gap-2 rounded-lg border border-jade/20 bg-jade/10 p-3 text-sm text-jade">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>AI 基础训练反馈，仅供日常练习参考，最终诊断以老师反馈为准。</span>
        </div>
      ) : null}

      <div className="liuxiang-panel rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-ivory">老师反馈</div>
            <div className="mt-1 text-xs text-muted">Demo 示例，正式提交后由老师更新。</div>
          </div>
          <Badge tone="warning">待复核</Badge>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-md border border-ivory/10 bg-ivory/5 p-3">
            <div className="text-xs text-muted">音准</div>
            <div className="mt-1 text-ivory">三度跳进前先内心听到目标音</div>
          </div>
          <div className="rounded-md border border-ivory/10 bg-ivory/5 p-3">
            <div className="text-xs text-muted">调性感</div>
            <div className="mt-1 text-ivory">句尾主音不要下压</div>
          </div>
          <div className="rounded-md border border-ivory/10 bg-ivory/5 p-3">
            <div className="text-xs text-muted">下一步</div>
            <div className="mt-1 text-ivory">录音后复盘对应训练视频</div>
          </div>
        </div>
      </div>

      {analysis ? (
        <TrainingResourceList
          title="对应训练"
          helper="这是与本题训练点相关的讲解资源。观看后可返回继续练习。"
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
      <div className="mt-2 text-xl font-semibold text-ivory">{value}</div>
    </div>
  );
}
