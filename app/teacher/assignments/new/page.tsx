import { Save } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrainingResourceManager } from "@/components/training-resources/training-resource-manager";
import {
  getApprovedEarTrainingQuestions,
  getApprovedSightSingingQuestions
} from "@/lib/question-bank";
import { getTrainingResourcesForTeacherTarget } from "@/lib/training-resource-links";

export default function NewAssignmentPage() {
  const sightQuestions = getApprovedSightSingingQuestions();
  const earQuestions = getApprovedEarTrainingQuestions();
  const assignmentResources = getTrainingResourcesForTeacherTarget({
    module: "sight_singing",
    assignmentId: "sg-001"
  });

  return (
    <TeacherShell>
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <Badge tone="warning">新建任务</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">布置训练任务</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            第一版支持视唱和练耳任务。老师必须从 approved 题库中选择 question_id，乐理只保留入口。
          </p>
        </div>

        <form className="liuxiang-panel rounded-lg p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="任务标题" placeholder="C 大调级进与三度跳进" />
            <label className="space-y-2">
              <span className="text-sm text-muted">模块</span>
              <select className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-ivory outline-none focus:border-brass/70">
                <option value="sight_singing">视唱</option>
                <option value="ear_training">练耳</option>
                <option value="theory" disabled>
                  乐理，即将开放
                </option>
              </select>
            </label>
            <Field label="难度" placeholder="1-5" />
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm text-muted">选择 approved 视唱题</span>
              <select className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-ivory outline-none focus:border-brass/70">
                {sightQuestions.map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.title} · {question.keySignature} · Level {question.level}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm text-muted">选择 approved 练耳题</span>
              <select className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-ivory outline-none focus:border-brass/70">
                {earQuestions.map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.title} · {question.type} · Level {question.level}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm text-muted">老师说明</span>
            <textarea
              rows={4}
              placeholder="写给学生的练习提示。题目标准答案来自 question_id，不在 assignment 里重复手写。"
              className="w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 py-3 text-sm text-ivory outline-none placeholder:text-muted/60 focus:border-brass/70"
            />
          </label>

          <Button type="button" variant="primary" className="mt-5" icon={<Save className="h-4 w-4" />}>
            保存任务
          </Button>
        </form>

        <TrainingResourceManager
          resources={assignmentResources}
          bindingLabel="当前任务 assignment_id，新建保存后写入真实 assignment_id"
          module="sight_singing"
          assignmentId="sg-001"
        />
      </div>
    </TeacherShell>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-muted">{label}</span>
      <input
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none placeholder:text-muted/60 focus:border-brass/70"
      />
    </label>
  );
}
