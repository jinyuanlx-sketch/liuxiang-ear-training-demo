"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderPermission = "idle" | "requesting" | "granted" | "denied";

export interface AudioRecorderState {
  permission: RecorderPermission;
  isRecording: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
  duration: number;
  error: string | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    permission: "idle",
    isRecording: false,
    audioUrl: null,
    audioBlob: null,
    duration: 0,
    error: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState((current) => ({
        ...current,
        error: "当前浏览器不支持麦克风录音。"
      }));
      return;
    }

    try {
      setState((current) => ({
        ...current,
        permission: "requesting",
        error: null
      }));

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm"
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        clearTimer();

        setState((current) => ({
          ...current,
          isRecording: false,
          audioBlob,
          audioUrl
        }));
      };

      recorder.start();
      startedAtRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        if (!startedAtRef.current) return;
        setState((current) => ({
          ...current,
          duration: Math.floor((Date.now() - startedAtRef.current!) / 1000)
        }));
      }, 250);

      setState((current) => ({
        ...current,
        permission: "granted",
        isRecording: true,
        audioBlob: null,
        audioUrl: null,
        duration: 0
      }));
    } catch {
      clearTimer();
      setState((current) => ({
        ...current,
        permission: "denied",
        isRecording: false,
        error: "无法获取麦克风权限，请检查浏览器授权。"
      }));
    }
  }, [clearTimer]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState({
      permission: "idle",
      isRecording: false,
      audioUrl: null,
      audioBlob: null,
      duration: 0,
      error: null
    });
  }, [state.audioUrl]);

  useEffect(() => {
    return () => {
      clearTimer();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, [clearTimer, state.audioUrl]);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording
  };
}
