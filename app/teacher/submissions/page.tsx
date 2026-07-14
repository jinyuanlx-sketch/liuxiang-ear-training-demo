import Link from "next/link";
import { FileAudio } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { assignments, students, submissions } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function TeacherSubmissionsPage() {
  return (
    <TeacherShell>
      <div className="space-y-5">
        <div>
          <Badge tone="warning">提交</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">学生提交</h1>
          <p className="mt-2 text-sm text-muted">听录音、看自动分析、写老师诊断。</p>
        </div>

        <div className="space-y-3">
          {submissions.map((submission) => {
            const student = students.find((item) => item.id === submission.studentId);
            const assignment = assignments.find((item) => item.id === submission.assignmentId);

            return (
              <Link
                key={submission.id}
                href={`/teacher/submissions/${submission.id}`}
                className="liuxiang-panel flex items-center justify-between gap-4 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-brass/25 bg-brass/10 text-brass">
                    <FileAudio className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-ivory">{student?.name}</h2>
                    <p className="mt-1 text-sm text-muted">{assignment?.title}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(submission.submittedAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge tone={submission.status === "auto_scored" ? "warning" : "success"}>
                    {submission.status}
                  </Badge>
                  <div className="mt-2 text-sm text-muted">音高检测：实验性技术数据</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </TeacherShell>
  );
}
