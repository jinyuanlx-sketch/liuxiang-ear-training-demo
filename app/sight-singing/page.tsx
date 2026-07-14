import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { assignments } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function SightSingingPage() {
  const sightAssignments = assignments.filter((assignment) => assignment.module === "sight_singing");

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Badge tone="warning">核心模块</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">视唱训练</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            查看标准谱面、录制视唱、运行实验性音高检测，再提交给老师诊断。
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {sightAssignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={assignment.questionId ? `/sight-singing/practice/${assignment.id}` : `/sight-singing/${assignment.id}`}
              className="liuxiang-panel rounded-lg p-4 transition hover:border-brass/40"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge tone="warning">难度 {assignment.difficulty}</Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Clock3 className="h-3.5 w-3.5" />
                  {assignment.dueDate ? formatDate(assignment.dueDate) : "无截止"}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-ivory">{assignment.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{assignment.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-brass">
                开始练习
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
