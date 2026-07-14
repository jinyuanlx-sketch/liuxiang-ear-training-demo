"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileMusic } from "lucide-react";
import type { SightSingingQuestion } from "@/types/question-bank";

export function SightScoreViewer({ question }: { question?: SightSingingQuestion }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [musicXmlState, setMusicXmlState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!question?.musicxmlUrl || !containerRef.current) {
      setMusicXmlState("idle");
      return;
    }

    let cancelled = false;
    const container = containerRef.current;
    container.innerHTML = "";
    setMusicXmlState("loading");

    void import("opensheetmusicdisplay")
      .then(async ({ OpenSheetMusicDisplay }) => {
        if (cancelled) return;
        const renderer = new OpenSheetMusicDisplay(container, {
          autoResize: true,
          backend: "svg",
          drawTitle: false
        });
        await renderer.load(question.musicxmlUrl!);
        if (cancelled) return;
        renderer.render();
        setMusicXmlState("ready");
      })
      .catch(() => {
        if (!cancelled) setMusicXmlState("error");
      });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [question?.musicxmlUrl]);

  if (question?.musicxmlUrl) {
    return (
      <div className="mt-4 overflow-hidden rounded-lg border border-ivory/10 bg-white">
        {musicXmlState === "loading" ? (
          <div className="flex min-h-44 items-center justify-center px-4 text-sm text-neutral-600">
            正在渲染标准五线谱...
          </div>
        ) : null}
        <div
          ref={containerRef}
          className={musicXmlState === "ready" ? "min-h-44 overflow-x-auto px-2 py-4 sm:px-4" : "h-0 overflow-hidden"}
          aria-label="标准五线谱"
        />
        {musicXmlState === "error" ? (
          <ScoreFallback question={question} musicXmlFailed />
        ) : null}
      </div>
    );
  }

  if (question?.scoreImageUrl) {
    return (
      <div className="mt-4 overflow-hidden rounded-lg border border-ivory/10 bg-white p-2 sm:p-4">
        <img src={question.scoreImageUrl} alt={`${question.title} 标准谱面`} className="h-auto w-full" />
      </div>
    );
  }

  if (question?.pdfUrl) {
    return (
      <a
        href={question.pdfUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex min-h-24 items-center justify-between gap-3 rounded-lg border border-ivory/10 bg-ink-950/45 p-4 text-sm text-ivory"
      >
        <span className="flex items-center gap-3">
          <FileMusic className="h-5 w-5 text-brass" />
          打开标准谱面 PDF
        </span>
        <ExternalLink className="h-4 w-4 text-muted" />
      </a>
    );
  }

  return (
    <div className="mt-4 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-ivory/15 bg-ink-950/35 px-4 text-center text-sm text-muted">
      尚未上传标准谱面
    </div>
  );
}

function ScoreFallback({
  question,
  musicXmlFailed
}: {
  question: SightSingingQuestion;
  musicXmlFailed: boolean;
}) {
  if (question.scoreImageUrl) {
    return (
      <div className="p-2 sm:p-4">
        <img src={question.scoreImageUrl} alt={`${question.title} 标准谱面`} className="h-auto w-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-4 text-center text-sm text-neutral-600">
      <span>{musicXmlFailed ? "MusicXML 谱面渲染失败。" : "尚未上传标准谱面"}</span>
      <a
        href={question.musicxmlUrl ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-neutral-900 underline"
      >
        打开 MusicXML 文件 <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
