"use client";

import { useMemo, useState } from "react";
import { Check, Play, X } from "lucide-react";
import type { EarTrainingQuestion } from "@/types/question-bank";
import type { TrainingResourceLink, TrainingResourceQuery } from "@/types/training-resource";
import { TrainingResourceList } from "@/components/training-resources/training-resource-list";
import { Button } from "@/components/ui/button";
import { playEarQuestion } from "@/lib/ear-training-engine/audio";
import type { EarQuestion } from "@/lib/ear-training-engine/generator";
import { midiToFrequency, noteNameToMidi } from "@/lib/pitch-detection/notes";
import { cn } from "@/lib/utils";

export function AssignmentEarPractice({
  question,
  afterResources = [],
  afterResourceQuery
}: {
  question: EarTrainingQuestion;
  afterResources?: TrainingResourceLink[];
  afterResourceQuery?: TrainingResourceQuery;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const correctAnswer = question.answerKeyJson.correctAnswer;
  const aliases = question.answerKeyJson.aliases ?? [];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === correctAnswer || aliases.includes(selectedAnswer ?? "");

  const earQuestion = useMemo<EarQuestion>(() => {
    const notes = Array.isArray(question.stimulusJson.notes)
      ? (question.stimulusJson.notes as string[])
      : [];

    return {
      id: question.id,
      kind:
        question.type === "single_note" || question.type === "interval" || question.type === "chord"
          ? question.type
          : "single_note",
      prompt: question.title,
      answer: correctAnswer,
      frequencies: notes.map((note) => midiToFrequency(noteNameToMidi(note))),
      options: question.choicesJson
    };
  }, [correctAnswer, question]);

  function chooseAnswer(answer: string) {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <div className="liuxiang-panel rounded-lg p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ivory">播放题目</h2>
            <p className="mt-1 text-sm text-muted">听清后选择答案。</p>
          </div>
          <Button type="button" variant="primary" className="w-full sm:w-auto" icon={<Play className="h-4 w-4" />} onClick={() => void playEarQuestion(earQuestion)}>
            播放
          </Button>
        </div>
      </div>

      <div className="liuxiang-panel rounded-lg p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {question.choicesJson.map((choice) => {
            const selected = selectedAnswer === choice;
            const correct = choice === correctAnswer || aliases.includes(choice);

            return (
              <button
                key={choice}
                type="button"
                onClick={() => chooseAnswer(choice)}
                className={cn(
                  "min-h-12 rounded-md border px-3 py-2 text-sm transition",
                  isAnswered && correct
                    ? "border-jade/40 bg-jade/10 text-jade"
                    : isAnswered && selected
                      ? "border-red-300/30 bg-red-400/10 text-red-100"
                      : "border-ivory/10 bg-ivory/5 text-ivory hover:bg-ivory/10"
                )}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered ? (
        <div className="liuxiang-panel rounded-lg p-4">
          <div className={isCorrect ? "flex items-center gap-2 text-jade" : "flex items-center gap-2 text-red-100"}>
            {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {isCorrect ? "回答正确" : `回答错误，正确答案：${correctAnswer}`}
          </div>
          {question.explanation ? <p className="mt-3 text-sm leading-6 text-muted">{question.explanation}</p> : null}
          {saved ? (
            <p className="mt-3 text-xs text-muted">Demo 数据，接入 Supabase 后保存练习记录。</p>
          ) : null}
        </div>
      ) : null}

      {isAnswered ? (
        <TrainingResourceList
          title="对应训练"
          helper="完成练习后，可观看对应讲解。"
          resources={afterResources}
          resourceQuery={afterResourceQuery}
        />
      ) : null}
    </div>
  );
}
