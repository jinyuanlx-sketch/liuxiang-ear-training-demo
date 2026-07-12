import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";

export default function TheoryPage() {
  return (
    <AppShell>
      <div className="liuxiang-panel rounded-lg p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-brass/25 bg-brass/10 text-brass">
          <BookOpen className="h-6 w-6" />
        </div>
        <Badge tone="disabled" className="mt-5">
          module: theory
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold text-ivory">乐理训练模块即将开放</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          数据结构和导航入口已预留。第一版不开发乐理题库、模拟卷、错题本或老师批改流程。
        </p>
      </div>
    </AppShell>
  );
}
