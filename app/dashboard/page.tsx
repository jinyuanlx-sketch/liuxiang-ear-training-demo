import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Ear, Mic2, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Section } from "@/components/ui/section";
import { assignments, feedbackItems, practiceRecords, students } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const student = students[0];
  const todayAssignments = assignments.filter((assignment) => assignment.studentId === student.id);
  const latestFeedback = feedbackItems[0];

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="liuxiang-panel overflow-hidden rounded-lg">
          <div className="relative min-h-52 p-5">
            <div className="absolute inset-0 opacity-25 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-1/2 sm:opacity-40">
              <img
                src="/brand/end-card.png"
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: "center 20%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink-900 to-transparent" />
            </div>
            <div className="relative max-w-lg">
              <Badge tone="success">{student.trainingStage}</Badge>
              <h1 className="mt-4 text-3xl font-semibold text-ivory sm:text-4xl">{student.name}，今日训练</h1>
              <p className="mt-3 text-sm leading-6 text-muted">{student.currentFocus}</p>
              <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                <Link
                  href="/sight-singing/practice/sg-001"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brass px-4 text-sm font-medium text-ink-950"
                >
                  开始视唱
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/ear-training"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ivory/10 px-4 text-sm text-ivory"
                >
                  练耳训练
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="本周完成率" value="76%" helper="较上周 +8%" icon={<CheckCircle2 className="h-4 w-4" />} />
          <MetricCard label="视唱检测" value="实验中" helper="暂不作为训练评价" icon={<Mic2 className="h-4 w-4" />} />
          <MetricCard label="练耳正确率" value="78%" helper="近 7 天平均" icon={<Ear className="h-4 w-4" />} />
          <MetricCard label="阶段趋势" value="稳定" helper="老师标记" icon={<TrendingUp className="h-4 w-4" />} />
        </div>

        <Section title="今日训练">
          <div className="grid gap-3 lg:grid-cols-3">
            {todayAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={
                  assignment.module === "sight_singing"
                    ? `/sight-singing/practice/${assignment.id}`
                    : `/ear-training/practice/${assignment.id}`
                }
                className="liuxiang-panel rounded-lg p-4 transition hover:border-brass/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={assignment.module === "sight_singing" ? "warning" : "success"}>
                    {assignment.module === "sight_singing" ? "视唱" : "练耳"}
                  </Badge>
                  <span className="text-xs text-muted">难度 {assignment.difficulty}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ivory">{assignment.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{assignment.description}</p>
              </Link>
            ))}
            <Link href="/theory" className="liuxiang-panel rounded-lg p-4 opacity-75">
              <Badge tone="disabled">即将开放</Badge>
              <h3 className="mt-4 text-base font-semibold text-ivory">乐理专项训练</h3>
              <p className="mt-2 text-sm leading-6 text-muted">模块已预留，第一版不开放具体题库。</p>
            </Link>
          </div>
        </Section>

        <Section title="最近老师反馈">
          <div className="liuxiang-panel rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <Badge tone="warning">陈老师</Badge>
              <span className="text-xs text-muted">{formatDate(latestFeedback.createdAt)}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-ivory/80">{latestFeedback.textFeedback}</p>
            <div className="mt-3 rounded-md border border-ivory/10 bg-ink-950/40 p-3 text-sm text-muted">
              下一步：{latestFeedback.nextSteps}
            </div>
          </div>
        </Section>

        <Section title="最近练习记录">
          <div className="space-y-3">
            {practiceRecords.map((record) => (
              <div key={record.id} className="liuxiang-panel flex items-center justify-between rounded-lg p-4">
                <div>
                  <div className="text-sm font-medium text-ivory">
                    {record.type === "single_note" ? "单音听辨" : "音程听辨"}
                  </div>
                  <div className="mt-1 text-xs text-muted">{formatDate(record.practicedAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-ivory">{record.accuracy}%</div>
                  <div className="text-xs text-muted">
                    {record.correctCount}/{record.totalQuestions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
