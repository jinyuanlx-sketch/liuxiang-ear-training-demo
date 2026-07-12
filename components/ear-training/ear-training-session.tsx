"use client";

import { useMemo, useState } from "react";
import { Check, Play, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type EarQuestion,
  type EarTrainingKind,
  generateEarSession
} from "@/lib/ear-training-engine/generator";
import { playEarQuestion } from "@/lib/ear-training-engine/audio";
import { cn } from "@/lib/utils";

export function EarTrainingSession({
  kind,
  title,
  description
}: {
  kind: EarTrainingKind;
  title: string;
  description: string;
}) {
  const [questions, setQuestions] = useState<EarQuestion[]>(() => generateEarSession(kind, 10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isAnswered = Boolean(answers[currentQuestion.id]);
  const correctCount = useMemo(
    () =>
      questions.reduce((count, question) => {
        return answers[question.id] === question.answer ? count + 1 : count;
      }, 0),
    [answers, questions]
  );
  const completedCount = Object.keys(answers).length;
  const isFinished = completedCount === questions.length;
  const accuracy = isFinished ? Math.round((correctCount / questions.length) * 100) : 0;

  function chooseAnswer(answer: string) {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setAnswers((current) => ({ ...current, [currentQuestion.id]: answer }));
  }

  function nextQuestion() {
    setSelectedAnswer(null);
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  function restart() {
    setQuestions(generateEarSession(kind, 10));
    setCurrentIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
  }

  return (
    <div className="space-y-4">
      <div className="liuxiang-panel rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone="success">自动判分</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-ivory">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </div>
          <div className="rounded-md border border-ivory/10 px-3 py-2 text-sm text-muted">
            {currentIndex + 1}/{questions.length}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-ivory/10">
          <div
            className="h-full rounded-full bg-brass"
            style={{ width: `${(completedCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {!isFinished ? (
        <div className="liuxiang-panel rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-ivory">{currentQuestion.prompt}</div>
              <div className="mt-1 text-xs text-muted">可重复播放，选择后立即判分。</div>
            </div>
            <Button
              type="button"
              variant="primary"
              icon={<Play className="h-4 w-4" />}
              onClick={() => void playEarQuestion(currentQuestion)}
            >
              播放
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option || answers[currentQuestion.id] === option;
              const isCorrect = currentQuestion.answer === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseAnswer(option)}
                  className={cn(
                    "min-h-12 rounded-md border px-3 py-2 text-sm transition",
                    isAnswered && isCorrect
                      ? "border-jade/40 bg-jade/10 text-jade"
                      : isAnswered && isSelected
                        ? "border-red-300/30 bg-red-400/10 text-red-100"
                        : "border-ivory/10 bg-ivory/6 text-ivory hover:bg-ivory/10"
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered ? (
            <div className="mt-4 rounded-md border border-ivory/10 bg-ink-950/50 p-3 text-sm">
              {answers[currentQuestion.id] === currentQuestion.answer ? (
                <div className="flex items-center gap-2 text-jade">
                  <Check className="h-4 w-4" />
                  正确
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-100">
                  <X className="h-4 w-4" />
                  正确答案：{currentQuestion.answer}
                </div>
              )}
              {currentIndex < questions.length - 1 ? (
                <Button type="button" variant="secondary" className="mt-3 w-full" onClick={nextQuestion}>
                  下一题
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="liuxiang-panel rounded-lg p-5">
          <div className="text-sm text-muted">本轮完成</div>
          <div className="mt-2 text-4xl font-semibold text-ivory">{accuracy}%</div>
          <div className="mt-2 text-sm text-muted">
            共 {questions.length} 题，正确 {correctCount} 题。正式接入后会同步到练习记录。
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-5 w-full"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={restart}
          >
            再练一组
          </Button>
        </div>
      )}
    </div>
  );
}
