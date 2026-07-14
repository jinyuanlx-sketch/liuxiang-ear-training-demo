"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Activity,
  ClipboardList,
  FileAudio,
  LayoutDashboard,
  Library,
  Sparkles,
  UsersRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoModeBanner } from "@/components/layout/demo-mode-banner";

const teacherNavItems = [
  { href: "/teacher", label: "概览", icon: LayoutDashboard },
  { href: "/teacher/students", label: "学生", icon: UsersRound },
  { href: "/teacher/sight-singing/question-bank", label: "视唱题库", icon: Sparkles },
  { href: "/teacher/ear-training/question-bank", label: "练耳题库", icon: Sparkles },
  { href: "/teacher/assignments", label: "任务", icon: ClipboardList },
  { href: "/teacher/submissions", label: "提交", icon: FileAudio },
  { href: "/teacher/progress", label: "进度", icon: BarChart3 },
  { href: "/teacher/audio-diagnostics", label: "音频诊断", icon: Activity },
  { href: "/teacher/theory", label: "乐理", icon: Library }
];

export function TeacherShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh bg-ink-950/20">
      <DemoModeBanner />
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-ivory/10 bg-ink-950/70 px-4 py-4 backdrop-blur-xl lg:sticky lg:top-0 lg:h-svh lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Link href="/teacher">
              <div className="font-serif text-xl font-semibold text-ivory">流响音乐</div>
              <div className="text-xs text-muted">老师诊断后台</div>
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-ivory/10 px-3 py-2 text-xs text-muted transition hover:bg-ivory/10 hover:text-ivory"
            >
              学生端
            </Link>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {teacherNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/teacher" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                    isActive ? "bg-ivory/10 text-ivory" : "text-muted hover:bg-ivory/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="w-full min-w-0 px-4 py-5 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
