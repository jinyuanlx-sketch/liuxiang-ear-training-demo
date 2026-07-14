"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { VoiceType } from "@/types/audio";

export function VoiceTypeDialog({
  open,
  onSelect,
  onClose
}: {
  open: boolean;
  onSelect: (voiceType: VoiceType) => void;
  onClose: () => void;
}) {
  const firstChoiceRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => firstChoiceRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/80 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-type-dialog-title"
      aria-describedby="voice-type-dialog-description"
    >
      <div className="relative w-full max-w-sm rounded-lg border border-ivory/15 bg-ink-900 p-5 shadow-2xl shadow-black/40">
        <button
          type="button"
          aria-label="关闭"
          title="关闭"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-md text-muted transition hover:bg-ivory/10 hover:text-ivory"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="voice-type-dialog-title" className="pr-10 text-xl font-semibold text-ivory">
          请选择声音类型
        </h2>
        <p id="voice-type-dialog-description" className="mt-2 text-sm text-muted">
          用于匹配本次视唱音区。
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            ref={firstChoiceRef}
            type="button"
            onClick={() => onSelect("male")}
            className="min-h-16 rounded-md border border-ivory/15 bg-ivory/5 px-4 text-base font-medium text-ivory transition hover:border-brass/45 hover:bg-ivory/10 focus-visible:border-brass focus-visible:outline-none"
          >
            男声
          </button>
          <button
            type="button"
            onClick={() => onSelect("female")}
            className="min-h-16 rounded-md border border-ivory/15 bg-ivory/5 px-4 text-base font-medium text-ivory transition hover:border-brass/45 hover:bg-ivory/10 focus-visible:border-brass focus-visible:outline-none"
          >
            女声
          </button>
        </div>
      </div>
    </div>
  );
}
