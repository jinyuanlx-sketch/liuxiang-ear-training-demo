import Link from "next/link";
import { ArrowRight, ClipboardList, FileAudio, Link2, Library, Sparkles, UsersRound } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Section } from "@/components/ui/section";
import { assignments, students, submissions } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function TeacherDashboardPage() {
  const quickEntries = [
    {
      href: "/teacher/students",
      title: "学生列表",
      description: "查看学生档案、训练重点和能力等级。",
      status: "Demo 可看",
      icon: UsersRound
    },
    {
      href: "/teacher/sight-singing/question-bank",
      title: "视唱题库",
      description: "题目详情页可管理训练资源链接。",
      status: "Demo 可编辑",
      icon: Sparkles
    },
    {
      href: "/teacher/assignments",
      title: "作业 / 任务",
      description: "查看任务，布置任务页可附加外部资源。",
      status: "原型入口",
      icon: ClipboardList
    },
    {
      href: "/teacher/sight-singing/question-bank/sight_teacher_001",
      title: "训练资源链接",
      description: "新增、编辑、删除、排序抖音/小红书视频链接。",
      status: "Demo 本地保存",
      icon: Link2
    },
    {
      href: "/teacher/submissions",
      title: "反馈入口",
      description: "查看提交内容并填写老师诊断反馈。",
      status: "Demo 可看",
      icon: FileAudio
    },
    {
      href: "/teacher/theory",
      title: "乐理模块",
      description: "仅保留入口，当前不展开完整题库。",
      status: "预留",
      icon: Library
    }
  ];

  return (
    <TeacherShell>
      <div className="space-y-6">
        <div>
          <Badge tone="warning">老师后台</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">训练诊断概览</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            快速查看学生训练状态、自动评分结果和待反馈提交。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="学生数" value={`${students.length}`} helper="第一版支持手动创建" icon={<UsersRound className="h-4 w-4" />} />
          <MetricCard label="待反馈" value="1" helper="视唱提交优先处理" icon={<FileAudio className="h-4 w-4" />} />
          <MetricCard label="本周任务" value={`${assignments.length}`} helper="视唱 + 练耳" />
          <MetricCard label="平均完成率" value="76%" helper="演示数据" />
        </div>

        <Section title="后台入口">
          <div className="grid gap-3 lg:grid-cols-3">
            {quickEntries.map((entry) => {
              const Icon = entry.icon;

              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="liuxiang-panel rounded-lg p-4 transition hover:border-brass/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-ivory/10 bg-ivory/5 text-brass">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge tone={entry.status === "预留" ? "disabled" : "warning"}>
                      {entry.status}
                    </Badge>
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-ivory">{entry.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{entry.description}</p>
                </Link>
              );
            })}
          </div>
        </Section>

        <Section
          title="待处理提交"
          action={
            <Link href="/teacher/submissions" className="text-sm text-brass">
              查看全部
            </Link>
          }
        >
          <div className="space-y-3">
            {submissions.map((submission) => {
              const student = students.find((item) => item.id === submission.studentId);
              const assignment = assignments.find((item) => item.id === submission.assignmentId);

              return (
                <Link
                  key={submission.id}
                  href={`/teacher/submissions/${submission.id}`}
                  className="liuxiang-panel flex items-center justify-between rounded-lg p-4"
                >
                  <div>
                    <div className="text-base font-semibold text-ivory">{student?.name}</div>
                    <div className="mt-1 text-sm text-muted">{assignment?.title}</div>
                    <div className="mt-1 text-xs text-muted">{formatDate(submission.submittedAt)}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brass">
                    处理
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>

        <Section title="重点学生">
          <div className="grid gap-3 lg:grid-cols-2">
            {students.map((student) => (
              <Link
                key={student.id}
                href={`/teacher/students/${student.id}`}
                className="liuxiang-panel rounded-lg p-4 transition hover:border-brass/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ivory">{student.name}</h2>
                  <Badge tone={student.sightLevel >= 4 ? "success" : "warning"}>
                    视唱 {student.sightLevel}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{student.currentFocus}</p>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </TeacherShell>
  );
}
