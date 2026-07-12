import Link from "next/link";
import { FileJson, Upload } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { earTrainingQuestions } from "@/lib/mock-data";

export default function TeacherEarQuestionBankPage() {
  return (
    <TeacherShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="success">ear_training_questions</Badge>
            <h1 className="mt-3 text-3xl font-semibold text-ivory">练耳题库</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              stimulus_json 记录播放内容，answer_key_json 记录标准答案，choices_json 记录选项。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/teacher/ear-training/import">
              <Button type="button" variant="primary" icon={<Upload className="h-4 w-4" />}>
                导入题目
              </Button>
            </Link>
            <Link href="/teacher/ear-training/import-json">
              <Button type="button" variant="secondary" icon={<FileJson className="h-4 w-4" />}>
                JSON 批量导入
              </Button>
            </Link>
          </div>
        </div>

        <div className="liuxiang-panel grid gap-3 rounded-lg p-4 md:grid-cols-3">
          {["type", "level", "review_status"].map((label) => (
            <select
              key={label}
              className="h-11 rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-muted outline-none focus:border-brass/70"
              defaultValue=""
            >
              <option value="">{label}</option>
            </select>
          ))}
        </div>

        <div className="space-y-3">
          {earTrainingQuestions.map((question) => (
            <Link
              key={question.id}
              href={`/teacher/ear-training/question-bank/${question.id}`}
              className="liuxiang-panel block rounded-lg p-4 transition hover:border-brass/40"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={question.reviewStatus === "approved" ? "success" : "warning"}>
                  {question.reviewStatus}
                </Badge>
                <Badge tone="neutral">{question.type}</Badge>
                <Badge tone="neutral">Level {question.level}</Badge>
                <span className="text-xs text-muted">{question.sourceType}</span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-ivory">{question.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{question.explanation ?? "暂无解释"}</p>
            </Link>
          ))}
        </div>
      </div>
    </TeacherShell>
  );
}
