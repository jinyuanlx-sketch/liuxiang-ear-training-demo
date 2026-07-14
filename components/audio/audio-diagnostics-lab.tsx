"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import type { PitchComparisonResult, PitchDetectionResult, RecorderDiagnostics, VoiceType } from "@/types/audio";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { PitchDiagnosticsChart, WaveformChart } from "@/components/charts/audio-diagnostics-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyzePitchTrackFromBlob } from "@/lib/pitch-detection/detect";
import { comparePitchTrack } from "@/lib/pitch-comparison/compare";
import { sightSingingQuestions } from "@/lib/mock-data";
import { audioDiagnosticTestCases } from "@/lib/audio-diagnostics/test-cases";
import { runSyntheticPitchSelfTest, type SyntheticPitchSelfTestResult } from "@/lib/audio-diagnostics/synthetic-self-test";
import { runRegisterSelfTests, type RegisterSelfTestCaseResult } from "@/lib/audio-diagnostics/register-self-test";

export function AudioDiagnosticsLab() {
  const question = sightSingingQuestions[0];
  const [browserInfo, setBrowserInfo] = useState("读取中...");
  const [recorderDiagnostics, setRecorderDiagnostics] = useState<RecorderDiagnostics | null>(null);
  const [detection, setDetection] = useState<PitchDetectionResult | null>(null);
  const [comparison, setComparison] = useState<PitchComparisonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selfTest, setSelfTest] = useState<SyntheticPitchSelfTestResult | null>(null);
  const [registerSelfTests, setRegisterSelfTests] = useState<RegisterSelfTestCaseResult[] | null>(null);
  const [voiceType, setVoiceType] = useState<VoiceType>("female");

  useEffect(() => {
    setBrowserInfo(`${navigator.userAgent} · ${navigator.platform || "平台未报告"}`);
  }, []);

  async function handleAudioReady(blob: Blob, diagnostics: RecorderDiagnostics | null) {
    setIsAnalyzing(true);
    setError(null);
    setRecorderDiagnostics(diagnostics);
    try {
      const nextDetection = await analyzePitchTrackFromBlob(blob);
      const nextComparison = comparePitchTrack(
        question.targetPitchJson,
        nextDetection.rawDetectedPitchTrack,
        {
          targetRhythms: question.targetRhythmJson,
          tempo: question.tempo,
          timeSignature: question.timeSignature,
          voiceType,
          scoringAdjustedPitchTrack: nextDetection.scoringAdjustedPitchTrack,
          rawPitchTrack: nextDetection.rawPitchTrack,
          lowConfidenceFrames: nextDetection.lowConfidenceFrames,
          filteredFrames: nextDetection.filteredFrames,
          octaveCorrections: nextDetection.octaveCorrections
        }
      );
      setDetection(nextDetection);
      setComparison(nextComparison);
    } catch {
      setError("当前录音无法解码或检测。请记录 MIME 和设备信息后更换浏览器复测。");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="liuxiang-panel rounded-lg p-4">
        <div className="text-sm font-medium text-ivory">设备与浏览器</div>
        <p className="mt-2 break-words text-xs leading-5 text-muted">{browserInfo}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Info label="录音格式" value={recorderDiagnostics?.mimeType ?? "待录音"} />
          <Info label="实际采样率" value={formatNumber(recorderDiagnostics?.trackSettings?.sampleRate, " Hz")} />
          <Info label="声道" value={formatNumber(recorderDiagnostics?.trackSettings?.channelCount)} />
          <Info label="解码采样率" value={formatNumber(detection?.sampleRate, " Hz")} />
          <Info label="回声消除" value={formatBoolean(recorderDiagnostics?.trackSettings?.echoCancellation)} />
          <Info label="降噪" value={formatBoolean(recorderDiagnostics?.trackSettings?.noiseSuppression)} />
          <Info label="自动增益" value={formatBoolean(recorderDiagnostics?.trackSettings?.autoGainControl)} />
          <Info label="约束降级" value={recorderDiagnostics ? (recorderDiagnostics.usedFallbackConstraints ? "是" : "否") : "待录音"} />
        </div>
      </section>

      <AudioRecorder onAudioReady={handleAudioReady} showDiagnostics />
      <section className="liuxiang-panel rounded-lg p-4">
        <div className="text-sm font-medium text-ivory">诊断评分音区</div>
        <div className="mt-3 grid grid-cols-2 rounded-md border border-ivory/10 bg-ink-950/50 p-1">
          {(["female", "male"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={voiceType === option}
              className={`min-h-11 rounded-sm px-3 text-sm ${voiceType === option ? "bg-ivory/10 text-ivory" : "text-muted"}`}
              onClick={() => {
                setVoiceType(option);
                setComparison(null);
              }}
            >
              {option === "female" ? "女声 · 原谱音区" : "男声 · 低八度音区"}
            </button>
          ))}
        </div>
      </section>
      {isAnalyzing ? <div className="liuxiang-panel rounded-lg p-4 text-sm text-muted">正在生成完整诊断数据...</div> : null}
      {error ? <div className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">{error}</div> : null}

      {detection ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Info label="当前 RMS 结果" value={`${detection.rawPitchTrack.filter((frame) => frame.rms > 0.012).length} 活跃帧`} />
            <Info label="低置信度帧" value={`${detection.lowConfidenceFrames}`} />
            <Info label="被过滤帧" value={`${detection.filteredFrames}`} />
            <Info label="八度修正" value={`${detection.octaveCorrections.length}`} />
          </div>
          <WaveformChart waveform={detection.waveform} />
          <PitchDiagnosticsChart detection={detection} />
        </>
      ) : null}

      {comparison ? (
        <section className="liuxiang-panel rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ivory">逐音对齐结果</h2>
              <p className="mt-1 text-xs text-muted">原始检测数据不参与音区搬移。对齐方式：节奏时间轴 + 序列 DTW。</p>
            </div>
            <Badge tone="warning">实验性技术数据</Badge>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1220px] text-left text-xs">
              <thead className="text-muted">
                <tr className="border-b border-ivory/10">
                  {['谱面 MIDI', '评分目标 MIDI', '原始检测 MIDI', '评分调整 MIDI', 'voiceType', '音区状态', '偏差', '置信度', '起音偏差', '时值偏差', '单音内波动'].map((label) => (
                    <th key={label} className="py-3 pr-4 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.items.map((item, index) => (
                  <tr key={`${item.targetPitch}-${index}`} className="border-b border-ivory/10 text-muted">
                    <td className="py-3 pr-4 text-ivory">{formatMidi(item.writtenTargetMidi)}</td>
                    <td className="py-3 pr-4">{formatMidi(item.expectedSoundingMidi)}</td>
                    <td className="py-3 pr-4 text-jade">{formatMidi(item.rawDetectedMidi)}</td>
                    <td className="py-3 pr-4">{formatMidi(item.scoringAdjustedMidi)}</td>
                    <td className="py-3 pr-4">{item.voiceType ?? '-'}</td>
                    <td className="py-3 pr-4">{item.noteRegisterStatus ?? '-'}</td>
                    <td className="py-3 pr-4">{item.centDeviation === null ? '-' : `${item.centDeviation}c`}</td>
                    <td className="py-3 pr-4">{item.confidence?.toFixed(2) ?? '-'}</td>
                    <td className="py-3 pr-4">{formatMs(item.onsetDeviationMs)}</td>
                    <td className="py-3 pr-4">{formatMs(item.durationDeviationMs)}</td>
                    <td className="py-3 pr-4">{item.stabilityCents === null || item.stabilityCents === undefined ? '-' : `${item.stabilityCents}c`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <DiagnosticList title="低置信度 / 过滤统计" items={[
              `低置信度 ${comparison.lowConfidenceFrames ?? 0} 帧`,
              `全部过滤 ${comparison.filteredFrames ?? 0} 帧`,
              `未匹配额外片段 ${comparison.extraSegmentCount ?? 0} 个`
            ]} />
            <DiagnosticList
              title="八度修正记录"
              items={comparison.octaveCorrections?.length
                ? comparison.octaveCorrections.map((item) => `${item.time.toFixed(2)}s · ${item.originalFrequency.toFixed(1)} Hz → ${item.correctedFrequency.toFixed(1)} Hz`)
                : ['本次未触发单帧八度修正']}
            />
          </div>
        </section>
      ) : null}

      <section className="liuxiang-panel rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ivory">验证用例</h2>
            <p className="mt-1 text-xs text-muted">自动纯音自检只验证算法基线；人声和设备用例必须真机完成。</p>
          </div>
          <Button type="button" variant="secondary" icon={<FlaskConical className="h-4 w-4" />} onClick={() => setSelfTest(runSyntheticPitchSelfTest())}>
            运行 440 Hz 自检
          </Button>
          <Button type="button" variant="secondary" icon={<FlaskConical className="h-4 w-4" />} onClick={() => setRegisterSelfTests(runRegisterSelfTests())}>
            运行音区映射自检
          </Button>
        </div>
        {selfTest ? (
          <div className={`mt-4 rounded-md border p-3 text-sm ${selfTest.passed ? 'border-jade/20 bg-jade/10 text-jade' : 'border-red-300/20 bg-red-400/10 text-red-100'}`}>
            {selfTest.passed ? '通过' : '未通过'} · 检测 {selfTest.detectedFrequency?.toFixed(2) ?? '-'} Hz · 误差 {selfTest.centError?.toFixed(2) ?? '-'} cents · {selfTest.voicedFrames} 帧
          </div>
        ) : null}
        {registerSelfTests ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {registerSelfTests.map((result) => (
              <div key={result.name} className={`rounded-md border p-3 text-xs ${result.passed ? 'border-jade/20 bg-jade/10 text-jade' : 'border-red-300/20 bg-red-400/10 text-red-100'}`}>
                {result.passed ? '通过' : '未通过'} · {result.name}<br />
                书写 {result.writtenTargetMidi} / 目标 {result.expectedSoundingMidi} / 原始 {result.rawDetectedMidi} / 评分 {result.scoringAdjustedMidi} / {result.noteRegisterStatus}
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {audioDiagnosticTestCases.map((testCase) => (
            <article key={testCase.id} className="rounded-md border border-ivory/10 bg-ink-950/35 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium text-ivory">{testCase.name}</div>
                <Badge tone={testCase.status === 'browser_self_test' ? 'success' : 'neutral'}>
                  {testCase.status === 'browser_self_test' ? '可自动' : '需真机'}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">{testCase.purpose}</p>
              <p className="mt-2 text-xs leading-5 text-ivory/75">通过条件：{testCase.passCriteria}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ivory/10 bg-ink-950/40 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 break-words text-sm text-ivory">{value}</div>
    </div>
  );
}

function DiagnosticList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-ivory/10 bg-ink-950/40 p-3">
      <div className="text-sm font-medium text-ivory">{title}</div>
      <div className="mt-2 space-y-1 text-xs leading-5 text-muted">
        {items.map((item) => <div key={item}>{item}</div>)}
      </div>
    </div>
  );
}

function formatBoolean(value: boolean | string | undefined) {
  if (value === undefined) return "待录音 / 未报告";
  if (typeof value === "string") return value === "true" ? "启用" : value === "false" ? "关闭" : value;
  return value ? "启用" : "关闭";
}

function formatNumber(value: number | undefined, suffix = "") {
  return value === undefined ? "待录音 / 未报告" : `${value}${suffix}`;
}

function formatMs(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : `${value} ms`;
}

function formatMidi(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : value.toFixed(2);
}
