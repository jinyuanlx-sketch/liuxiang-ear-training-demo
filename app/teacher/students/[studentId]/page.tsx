import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, FileAudio } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { assignments, feedbackItems, getStudentById, practiceRecords, submissions } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default async function TeacherStudentDetailPage({
  params
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = getStudentById(studentId);

  if (!student) {
    notFound();
  }

  const studentAssignments = assignments.filter((assignment) => assignment.studentId === student.id);
  const studentRecords = practiceRecords.filter((record) => record.studentId === student.id);
  const studentSubmissions = submissions.filter((submission) => submission.studentId === student.id);

  return (
    <TeacherShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone="neutral">学生档案</Badge>
            <h1 className="mt-3 text-3xl font-semibold text-ivory">{student.name}</h1>
            <p className="mt-2 text-sm text-muted">
              {student.grade} · {student.city} · {student.examDirection}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" icon={<ClipboardList className="h-4 w-4" />}>
              布置任务
            </Button>
            <Button type="button" variant="primary" icon={<FileAudio className="h-4 w-4" />}>
              写诊断
            </Button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="liuxiang-panel rounded-lg p-4">
            <h2 className="text-lg font-semibold text-ivory">训练重点</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{student.currentFocus}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Field label="目标院校" value={student.targetSchools.join(" / ")} />
              <Field label="主项 / 副项" value={`${student.major} / ${student.minor}`} />
              <Field label="当前阶段" value={student.trainingStage} />
              <Field label="基础判断" value={student.currentLevel} />
            </div>
          </section>

          <section className="liuxiang-panel rounded-lg p-4">
            <h2 className="text-lg font-semibold text-ivory">能力等级</h2>
            <div className="mt-4 space-y-3">
              <Progress label="视唱" value={student.sightLevel} />
              <Progress label="练耳" value={student.earLevel} />
              <Progress label="乐理" value={student.theoryLevel} disabled />
            </div>
          </section>
        </div>

        <Section title="任务与提交">
          <div className="grid gap-3 lg:grid-cols-2">
            {studentAssignments.map((assignment) => (
              <div key={assignment.id} className="liuxiang-panel rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={assignment.module === "sight_singing" ? "warning" : "success"}>
                    {assignment.module === "sight_singing" ? "视唱" : "练耳"}
                  </Badge>
                  <span className="text-xs text-muted">{assignment.dueDate ? formatDate(assignment.dueDate) : "无截止"}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-ivory">{assignment.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{assignment.description}</p>
              </div>
            ))}
            {studentSubmissions.map((submission) => (
              <Link
                key={submission.id}
                href={`/teacher/submissions/${submission.id}`}
                className="liuxiang-panel rounded-lg p-4"
              >
                <Badge tone="warning">已提交</Badge>
                <h3 className="mt-3 text-base font-semibold text-ivory">视唱录音提交</h3>
                <p className="mt-2 text-sm text-muted">
                  自动评分：{submission.autoScore ?? "-"} · {formatDate(submission.submittedAt)}
                </p>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="历史练习">
          <div className="space-y-3">
            {studentRecords.map((record) => (
              <div key={record.id} className="liuxiang-panel flex items-center justify-between rounded-lg p-4">
                <div>
                  <div className="text-base font-semibold text-ivory">
                    {record.type === "single_note" ? "单音听辨" : "音程听辨"}
                  </div>
                  <div className="mt-1 text-xs text-muted">{formatDate(record.practicedAt)}</div>
                </div>
                <div className="text-right text-ivory">{record.accuracy}%</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="反馈记录">
          <div className="space-y-3">
            {feedbackItems.map((feedback) => (
              <div key={feedback.id} className="liuxiang-panel rounded-lg p-4">
                <div className="text-xs text-muted">{formatDate(feedback.createdAt)}</div>
                <p className="mt-3 text-sm leading-6 text-ivory/80">{feedback.textFeedback}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </TeacherShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ivory/10 bg-ink-950/40 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-ivory">{value}</div>
    </div>
  );
}

function Progress({ label, value, disabled }: { label: string; value: number; disabled?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className={disabled ? "text-muted" : "text-ivory"}>{label}</span>
        <span className="text-muted">{value}/5</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-ivory/10">
        <div
          className={disabled ? "h-full rounded-full bg-muted/40" : "h-full rounded-full bg-brass"}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
