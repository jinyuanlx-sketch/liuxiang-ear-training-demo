import { Library } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";

export default function TeacherTheoryPage() {
  return (
    <TeacherShell>
      <div className="liuxiang-panel rounded-lg p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-brass/25 bg-brass/10 text-brass">
          <Library className="h-6 w-6" />
        </div>
        <Badge tone="disabled" className="mt-5">
          module: theory
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold text-ivory">老师端乐理模块即将开放</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          后续可扩展乐理题库、模拟卷、错题本、老师批改和阶段报告。第一版只保留入口与数据库结构。
        </p>
      </div>
    </TeacherShell>
  );
}
