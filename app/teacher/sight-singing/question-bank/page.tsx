import Link from "next/link";
import { ArrowRight, FileJson, Plus, Sparkles, Upload } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sightSingingQuestions } from "@/lib/mock-data";

export default function TeacherSightQuestionBankPage() {
  return (
    <TeacherShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="warning">sight_singing_questions</Badge>
            <h1 className="mt-3 text-3xl font-semibold text-ivory">视唱题库</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              谱面图片/PDF 用于展示，target_pitch_json 与 target_rhythm_json 用于机器评分。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/teacher/sight-singing/generator">
              <Button type="button" variant="secondary" icon={<Sparkles className="h-4 w-4" />}>
                AI 候选题
              </Button>
            </Link>
            <Link href="/teacher/sight-singing/question-bank/new">
              <Button type="button" variant="primary" icon={<Plus className="h-4 w-4" />}>
                新增题目
              </Button>
            </Link>
            <Link href="/teacher/sight-singing/import">
              <Button type="button" variant="secondary" icon={<Upload className="h-4 w-4" />}>
                导入题目
              </Button>
            </Link>
            <Link href="/teacher/sight-singing/import-json">
              <Button type="button" variant="secondary" icon={<FileJson className="h-4 w-4" />}>
                JSON 批量导入
              </Button>
            </Link>
          </div>
        </div>

        <div className="liuxiang-panel grid gap-3 rounded-lg p-4 md:grid-cols-5">
          {["level", "调号", "拍号", "review_status", "source_type"].map((label) => (
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
          {sightSingingQuestions.map((question) => (
            <Link
              key={question.id}
              href={`/teacher/sight-singing/question-bank/${question.id}`}
              className="liuxiang-panel block rounded-lg p-4 transition hover:border-brass/40"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={question.reviewStatus === "approved" ? "success" : "warning"}>
                  {question.reviewStatus}
                </Badge>
                <Badge tone="neutral">Level {question.level}</Badge>
                <Badge tone="neutral">{question.keySignature}</Badge>
                <Badge tone="neutral">{question.timeSignature}</Badge>
                <span className="text-xs text-muted">{question.sourceType}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ivory">{question.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{question.trainingGoal}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-brass" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </TeacherShell>
  );
}
