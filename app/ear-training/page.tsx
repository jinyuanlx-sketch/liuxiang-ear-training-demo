import Link from "next/link";
import { ArrowRight, Ear, Layers3, Music2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { assignments } from "@/lib/mock-data";

const earModules = [
  {
    href: "/ear-training/single-note",
    title: "单音听辨",
    description: "播放一个音，选择固定音名。首调唱名模式预留。",
    icon: Music2
  },
  {
    href: "/ear-training/interval",
    title: "音程听辨",
    description: "播放两个音，识别从二度到八度的音程类型。",
    icon: Ear
  },
  {
    href: "/ear-training/chord",
    title: "和弦听辨",
    description: "识别大、小、减、增三和弦，七和弦与转位后续扩展。",
    icon: Layers3
  }
];

export default function EarTrainingPage() {
  const earAssignments = assignments.filter((assignment) => assignment.module === "ear_training");

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Badge tone="success">自动判分</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">练耳训练</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            第一版优先支持能稳定自动判分的基础题型，节奏和旋律听写先做结构预留。
          </p>
        </div>

        <div className="liuxiang-panel rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Badge tone="success">今日练耳任务</Badge>
              <h2 className="mt-3 text-lg font-semibold text-ivory">老师布置的专项练习</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                进入后可体验播放、答题、自动判分和对应训练视频资源。
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {earAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/ear-training/practice/${assignment.id}`}
                className="flex min-h-14 items-center justify-between gap-3 rounded-md border border-ivory/10 bg-ivory/5 px-3 py-2 text-sm transition hover:bg-ivory/10"
              >
                <span className="font-medium text-ivory">{assignment.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-jade" />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {earModules.map((module) => {
            const Icon = module.icon;

            return (
              <Link key={module.href} href={module.href} className="liuxiang-panel rounded-lg p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-jade/25 bg-jade/10 text-jade">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-ivory">{module.title}</h2>
                <p className="mt-2 min-h-16 text-sm leading-6 text-muted">{module.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-jade">
                  进入训练
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="liuxiang-panel rounded-lg p-4">
          <Badge tone="disabled">预留</Badge>
          <h2 className="mt-3 text-lg font-semibold text-ivory">节奏训练</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            未来支持节奏选择、听写、跟打与节拍稳定性分析。第一版暂不开发复杂节奏识别。
          </p>
        </div>
      </div>
    </AppShell>
  );
}
