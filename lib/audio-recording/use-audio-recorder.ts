"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RecorderDiagnostics, RecorderLevelState } from "@/types/audio";

export type RecorderPermission = "idle" | "requesting" | "granted" | "denied";

export interface AudioRecorderState {
  permission: RecorderPermission;
  isRecording: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
  duration: number;
  error: string | null;
  level: RecorderLevelState;
  diagnostics: RecorderDiagnostics | null;
}

const EMPTY_LEVEL: RecorderLevelState = {
  rms: 0,
  peak: 0,
  clipping: false,
  volumeDrop: false
};

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/webm"
];

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    permission: "idle",
    isRecording: false,
    audioUrl: null,
    audioBlob: null,
    duration: 0,
    error: null,
    level: EMPTY_LEVEL,
    diagnostics: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const recentRmsRef = useRef<number[]>([]);
  const lastLevelUpdateRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopLevelMeter = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    recentRmsRef.current = [];
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    clearTimer();
    stopLevelMeter();
  }, [clearTimer, stopLevelMeter]);

  const startLevelMeter = useCallback((stream: MediaStream) => {
    try {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      const source = context.createMediaStreamSource(stream);
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);
      audioContextRef.current = context;
      sourceNodeRef.current = source;
      const samples = new Float32Array(analyser.fftSize);

      const update = (timestamp: number) => {
        analyser.getFloatTimeDomainData(samples);
        let sum = 0;
        let peak = 0;
        for (let index = 0; index < samples.length; index += 1) {
          const absolute = Math.abs(samples[index]);
          sum += samples[index] * samples[index];
          peak = Math.max(peak, absolute);
        }
        const rms = Math.sqrt(sum / samples.length);
        const history = recentRmsRef.current;
        history.push(rms);
        if (history.length > 40) history.shift();
        const activeHistory = history.filter((value) => value > 0.015);
        const baseline = activeHistory.length > 0
          ? activeHistory.reduce((total, value) => total + value, 0) / activeHistory.length
          : 0;
        const volumeDrop = baseline > 0.025 && rms < baseline * 0.25;

        if (timestamp - lastLevelUpdateRef.current > 90) {
          lastLevelUpdateRef.current = timestamp;
          setState((current) => ({
            ...current,
            level: {
              rms,
              peak,
              clipping: peak >= 0.98,
              volumeDrop
            },
            diagnostics: current.diagnostics
              ? { ...current.diagnostics, audioContextSampleRate: context.sampleRate }
              : current.diagnostics
          }));
        }
        animationFrameRef.current = window.requestAnimationFrame(update);
      };

      animationFrameRef.current = window.requestAnimationFrame(update);
    } catch {
      // Web Audio diagnostics are optional; MediaRecorder can still continue.
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState((current) => ({
        ...current,
        error: "当前浏览器不支持所需的麦克风录音能力。"
      }));
      return;
    }

    try {
      setState((current) => ({
        ...current,
        permission: "requesting",
        error: null
      }));

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      const supported = navigator.mediaDevices.getSupportedConstraints();
      const requested = buildPreferredConstraints(supported);
      let stream: MediaStream;
      let usedFallbackConstraints = false;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: requested });
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") throw error;
        usedFallbackConstraints = true;
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;
      chunksRef.current = [];
      const selectedMimeType = selectSupportedMimeType();
      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);
      const track = stream.getAudioTracks()[0];
      const diagnostics: RecorderDiagnostics = {
        supportedConstraints: {
          channelCount: supported.channelCount,
          echoCancellation: supported.echoCancellation,
          noiseSuppression: supported.noiseSuppression,
          autoGainControl: supported.autoGainControl,
          sampleRate: supported.sampleRate
        },
        requestedConstraints: requested,
        trackSettings: track?.getSettings?.() ?? null,
        mimeType: recorder.mimeType || selectedMimeType,
        audioContextSampleRate: null,
        usedFallbackConstraints
      };

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || selectedMimeType || "application/octet-stream";
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;
        cleanupStream();
        mediaRecorderRef.current = null;
        startedAtRef.current = null;

        setState((current) => ({
          ...current,
          isRecording: false,
          audioBlob,
          audioUrl,
          level: EMPTY_LEVEL,
          diagnostics: current.diagnostics
            ? { ...current.diagnostics, mimeType }
            : current.diagnostics
        }));
      };

      recorder.start(250);
      startLevelMeter(stream);
      startedAtRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current === null) return;
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
        duration: 0,
        level: EMPTY_LEVEL,
        diagnostics
      }));
    } catch {
      cleanupStream();
      setState((current) => ({
        ...current,
        permission: "denied",
        isRecording: false,
        error: "无法获取麦克风权限，请检查浏览器授权或系统麦克风设置。"
      }));
    }
  }, [cleanupStream, startLevelMeter]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  const resetRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    mediaRecorderRef.current = null;
    cleanupStream();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setState({
      permission: "idle",
      isRecording: false,
      audioUrl: null,
      audioBlob: null,
      duration: 0,
      error: null,
      level: EMPTY_LEVEL,
      diagnostics: null
    });
  }, [cleanupStream]);

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      cleanupStream();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [cleanupStream]);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording
  };
}

function buildPreferredConstraints(supported: MediaTrackSupportedConstraints) {
  const constraints: MediaTrackConstraints = {};
  if (supported.channelCount) constraints.channelCount = { ideal: 1 };
  if (supported.echoCancellation) constraints.echoCancellation = { ideal: false };
  if (supported.noiseSuppression) constraints.noiseSuppression = { ideal: false };
  if (supported.autoGainControl) constraints.autoGainControl = { ideal: false };
  if (supported.sampleRate) constraints.sampleRate = { ideal: 48000 };
  return constraints;
}

function selectSupportedMimeType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return null;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}
