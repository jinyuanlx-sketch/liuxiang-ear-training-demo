"use client";

import { RotateCcw, Square, Upload, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/lib/audio-recording/use-audio-recorder";

export function AudioRecorder({
  onAudioReady
}: {
  onAudioReady?: (blob: Blob) => void;
}) {
  const recorder = useAudioRecorder();

  function handleStop() {
    recorder.stopRecording();
  }

  return (
    <div className="liuxiang-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ivory">视唱录音</div>
          <div className="mt-1 text-xs text-muted">浏览器本地录音，可回放并生成基础音高分析。</div>
        </div>
        <div className="rounded-md border border-ivory/10 px-2.5 py-1 text-xs text-muted">
          {recorder.isRecording ? `${recorder.duration}s` : "待录制"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {recorder.isRecording ? (
          <Button
            type="button"
            variant="danger"
            icon={<Square className="h-4 w-4" />}
            onClick={handleStop}
          >
            停止录音
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            icon={<Waves className="h-4 w-4" />}
            onClick={recorder.startRecording}
          >
            开始录音
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          icon={<RotateCcw className="h-4 w-4" />}
          onClick={recorder.resetRecording}
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
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => recorder.audioBlob && onAudioReady?.(recorder.audioBlob)}
          >
            生成基础音高分析
          </Button>
        </div>
      ) : null}
    </div>
  );
}
