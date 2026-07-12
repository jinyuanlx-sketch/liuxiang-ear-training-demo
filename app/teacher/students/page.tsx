import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { students } from "@/lib/mock-data";

export default function TeacherStudentsPage() {
  return (
    <TeacherShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge tone="neutral">学生管理</Badge>
            <h1 className="mt-3 text-3xl font-semibold text-ivory">学生列表</h1>
            <p className="mt-2 text-sm text-muted">创建学生、查看档案、跟踪训练重点。</p>
          </div>
          <Button type="button" variant="primary" icon={<Plus className="h-4 w-4" />}>
            创建学生
          </Button>
        </div>

        <div className="liuxiang-panel flex items-center gap-3 rounded-lg px-4 py-3">
          <Search className="h-4 w-4 text-muted" />
          <input
            placeholder="搜索姓名、城市、目标院校"
            className="h-10 flex-1 bg-transparent text-sm text-ivory outline-none placeholder:text-muted/60"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {students.map((student) => (
            <Link key={student.id} href={`/teacher/students/${student.id}`} className="liuxiang-panel rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ivory">{student.name}</h2>
                  <div className="mt-1 text-sm text-muted">
                    {student.grade} · {student.city} · {student.major}
                  </div>
                </div>
                <Badge tone="warning">{student.trainingStage}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Level label="视唱" value={student.sightLevel} />
                <Level label="练耳" value={student.earLevel} />
                <Level label="乐理" value={student.theoryLevel} />
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{student.currentFocus}</p>
            </Link>
          ))}
        </div>
      </div>
    </TeacherShell>
  );
}

function Level({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-ivory/10 bg-ivory/5 p-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold text-ivory">{value}</div>
    </div>
  );
}
