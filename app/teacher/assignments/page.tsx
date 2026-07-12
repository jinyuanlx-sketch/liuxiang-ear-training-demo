import Link from "next/link";
import { Plus } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assignments, students } from "@/lib/mock-data";
import { assignmentTypeLabels, moduleLabels } from "@/types/module";
import { formatDate } from "@/lib/utils";

export default function TeacherAssignmentsPage() {
  return (
    <TeacherShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge tone="neutral">任务</Badge>
            <h1 className="mt-3 text-3xl font-semibold text-ivory">训练任务</h1>
            <p className="mt-2 text-sm text-muted">统一管理视唱、练耳与后续乐理训练任务。</p>
          </div>
          <Link href="/teacher/assignments/new">
            <Button type="button" variant="primary" icon={<Plus className="h-4 w-4" />}>
              新建任务
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {assignments.map((assignment) => {
            const student = students.find((item) => item.id === assignment.studentId);
            return (
              <article key={assignment.id} className="liuxiang-panel rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={assignment.module === "sight_singing" ? "warning" : "success"}>
                    {moduleLabels[assignment.module]}
                  </Badge>
                  <Badge tone="neutral">{assignmentTypeLabels[assignment.type]}</Badge>
                  <span className="text-xs text-muted">学生：{student?.name ?? "班级任务"}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-ivory">{assignment.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{assignment.description}</p>
                <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
                  <div>题目来源：{assignment.questionId ? "题库题目" : "历史任务"}</div>
                  <div>截止：{assignment.dueDate ? formatDate(assignment.dueDate) : "未设置"}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </TeacherShell>
  );
}
