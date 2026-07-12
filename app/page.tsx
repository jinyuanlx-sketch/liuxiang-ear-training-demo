import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Headphones, Mic2, ShieldCheck } from "lucide-react";
import { DemoModeBanner } from "@/components/layout/demo-mode-banner";
import { Badge } from "@/components/ui/badge";

const experienceItems = [
  {
    title: "视唱训练",
    description: "查看谱面、录制演唱、生成基础音准反馈，再交给老师诊断。",
    icon: Mic2
  },
  {
    title: "练耳训练",
    description: "单音、音程、和弦听辨可直接播放、作答和自动判分。",
    icon: Headphones
  },
  {
    title: "老师诊断",
    description: "保留专业判断、训练重点和阶段性反馈，适合艺考备考节奏。",
    icon: GraduationCap
  }
];

export default function HomePage() {
  return (
    <main className="min-h-svh">
      <DemoModeBanner />
      <section className="mx-auto flex min-h-[calc(100svh-2.25rem)] w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:py-8">
        <header className="flex items-center justify-between gap-3">
          <div>
            <div className="font-serif text-xl font-semibold text-ivory">流响音乐</div>
            <div className="text-xs text-muted">视唱练耳训练系统</div>
          </div>
          <Badge tone="warning">Demo / 内测原型</Badge>
        </header>

        <div className="grid flex-1 items-center gap-6 py-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-brass/25 bg-brass/10 px-3 py-2 text-xs text-brass">
                <ShieldCheck className="h-4 w-4" />
                自动训练 + 老师诊断
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-ivory sm:text-5xl">
                流响音乐 · 视唱练耳训练系统
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted">
                面向音乐艺考学生的视唱练耳训练与老师诊断系统。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brass px-4 text-sm font-medium text-ink-950 transition hover:bg-[#d7b56f]"
              >
                进入学生端
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/teacher"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ivory/10 bg-ivory/5 px-4 text-sm font-medium text-ivory transition hover:bg-ivory/10"
              >
                进入老师端
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="liuxiang-panel rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-ivory/10 bg-ivory/5 text-muted">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-ivory">乐理模块</div>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    入口已预留，当前版本显示“即将开放”，不会展开完整题库。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="liuxiang-panel overflow-hidden rounded-lg">
            <div className="relative min-h-[420px]">
              <img
                src="/brand/end-card.png"
                alt="流响音乐品牌视觉"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "center 35%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="rounded-lg border border-ivory/10 bg-ink-950/70 p-4 backdrop-blur-xl">
                  <div className="text-sm font-medium text-ivory">当前可预览</div>
                  <div className="mt-3 grid gap-2 text-sm text-muted">
                    {experienceItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.title} className="flex items-start gap-3">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                          <div>
                            <span className="text-ivory">{item.title}</span>
                            <span className="text-muted"> · {item.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
