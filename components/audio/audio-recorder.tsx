"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, RotateCcw, Square, Upload, Waves } from "lucide-react";
import type { RecorderDiagnostics } from "@/types/audio";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/lib/audio-recording/use-audio-recorder";

export function AudioRecorder({
  onAudioReady,
  onStartRequest,
  onReset,
  showDiagnostics = false
}: {
  onAudioReady?: (blob: Blob, diagnostics: RecorderDiagnostics | null) => void;
  onStartRequest?: (startRecording: () => Promise<void>) => void;
  onReset?: () => void;
  showDiagnostics?: boolean;
}) {
  const recorder = useAudioRecorder();
  const [playbackConfirmed, setPlaybackConfirmed] = useState(false);

  useEffect(() => {
    setPlaybackConfirmed(false);
  }, [recorder.audioUrl]);

  function handleStartRecording() {
    if (onStartRequest) {
      onStartRequest(recorder.startRecording);
      return;
    }

    void recorder.startRecording();
  }

  function handleResetRecording() {
    recorder.resetRecording();
    onReset?.();
  }

  return (
    <div className="liuxiang-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ivory">视唱录音</div>
          <div className="mt-1 text-xs leading-5 text-muted">
            录音结束后可先回放确认，再进行音高分析。
          </div>
        </div>
        <div className="shrink-0 rounded-md border border-ivory/10 px-2.5 py-1 text-xs text-muted">
          {recorder.isRecording ? `${recorder.duration}s` : "待录制"}
        </div>
      </div>

      {recorder.isRecording ? (
        <div className="mt-4 rounded-md border border-ivory/10 bg-ink-950/45 p-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> 录音电平
            </span>
            <span>RMS {recorder.level.rms.toFixed(3)} · 峰值 {recorder.level.peak.toFixed(3)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-sm bg-ivory/10">
            <div
              className={recorder.level.clipping ? "h-full bg-red-300" : "h-full bg-jade"}
              style={{ width: `${Math.min(100, recorder.level.peak * 100)}%` }}
            />
          </div>
          {recorder.level.clipping || recorder.level.volumeDrop ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-brass">
              <AlertTriangle className="h-3.5 w-3.5" />
              {recorder.level.clipping ? "检测到削波，请离麦克风稍远。" : "检测到明显音量骤降，请确认麦克风未被遮挡。"}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {recorder.isRecording ? (
          <Button
            type="button"
            variant="danger"
            icon={<Square className="h-4 w-4" />}
            onClick={recorder.stopRecording}
          >
            停止录音
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            icon={<Waves className="h-4 w-4" />}
            onClick={handleStartRecording}
          >
            开始录音
          </Button>
        )}
        <Button
            type="button"
            variant="secondary"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={handleResetRecording}
            disabled={recorder.isRecording}
        >
          重录
        </Button>
      </div>

      {recorder.error ? (
        <div className="mt-3 rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
          {recorder.error}
        </div>
      ) : null}

      {recorder.audioUrl ? (
        <div className="mt-4 space-y-3">
          <audio controls src={recorder.audioUrl} className="w-full" />
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-ivory/10 bg-ink-950/40 px-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={playbackConfirmed}
              onChange={(event) => setPlaybackConfirmed(event.target.checked)}
              className="h-4 w-4 accent-brass"
            />
            我已回放并确认录音声音正常
          </label>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            icon={<Upload className="h-4 w-4" />}
            disabled={!playbackConfirmed}
            onClick={() =>
              recorder.audioBlob && onAudioReady?.(recorder.audioBlob, recorder.diagnostics)
            }
          >
            分析录音
          </Button>
        </div>
      ) : null}

      {showDiagnostics && recorder.diagnostics ? (
        <details className="mt-4 rounded-md border border-ivory/10 bg-ink-950/35 p-3 text-xs text-muted">
          <summary className="cursor-pointer font-medium text-ivory">录音诊断信息</summary>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            <Diagnostic label="实际 MIME" value={recorder.diagnostics.mimeType ?? "浏览器默认"} />
            <Diagnostic label="采样率" value={formatSetting(recorder.diagnostics.trackSettings?.sampleRate, " Hz")} />
            <Diagnostic label="声道" value={formatSetting(recorder.diagnostics.trackSettings?.channelCount)} />
            <Diagnostic label="回声消除" value={formatBoolean(recorder.diagnostics.trackSettings?.echoCancellation)} />
            <Diagnostic label="降噪" value={formatBoolean(recorder.diagnostics.trackSettings?.noiseSuppression)} />
            <Diagnostic label="自动增益" value={formatBoolean(recorder.diagnostics.trackSettings?.autoGainControl)} />
            <Diagnostic label="Web Audio" value={formatSetting(recorder.diagnostics.audioContextSampleRate, " Hz")} />
            <Diagnostic label="约束降级" value={recorder.diagnostics.usedFallbackConstraints ? "是" : "否"} />
          </dl>
        </details>
      ) : null}
    </div>
  );
}

function Diagnostic({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="mt-0.5 break-all text-ivory/85">{value}</dd>
    </div>
  );
}

function formatBoolean(value: boolean | string | undefined) {
  if (value === undefined) return "浏览器未报告";
  if (typeof value === "string") return value === "true" ? "启用" : value === "false" ? "关闭" : value;
  return value ? "启用" : "关闭";
}

function formatSetting(value: number | null | undefined, suffix = "") {
  return value === undefined || value === null ? "浏览器未报告" : `${value}${suffix}`;
}
