import { notFound } from "next/navigation";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { PitchCurve } from "@/components/charts/pitch-curve";
import { TeacherFeedbackForm } from "@/components/teacher/feedback-form";
import { Badge } from "@/components/ui/badge";
import { assignments, getSubmissionById, students } from "@/lib/mock-data";
import type { PitchComparisonResult } from "@/types/audio";
import type { SightSingingTargetData } from "@/types/assignment";

export default async function TeacherSubmissionDetailPage({
  params
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const submission = getSubmissionById(submissionId);

  if (!submission) {
    notFound();
  }

  const assignment = assignments.find((item) => item.id === submission.assignmentId);
  const student = students.find((item) => item.id === submission.studentId);
  const targetData = assignment?.targetData as SightSingingTargetData | undefined;
  const analysis = submission.autoResultJson as PitchComparisonResult | null;

  return (
    <TeacherShell>
      <div className="space-y-5">
        <div>
          <Badge tone="warning">视唱提交</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">{student?.name} · {assignment?.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">查看自动音准分析，并填写老师诊断反馈。</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="liuxiang-panel rounded-lg p-4">
            <h2 className="text-lg font-semibold text-ivory">录音与自动结果</h2>
            <div className="mt-4 rounded-md border border-ivory/10 bg-ink-950/50 p-4 text-sm text-muted">
              真实提交后这里播放 Supabase Storage 中的音频文件。当前为演示提交。
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="自动评分" value={`${submission.autoScore ?? "-"}%`} />
              <Stat label="平均偏差" value={`${analysis?.averageCentDeviation ?? "-"}c`} />
              <Stat label="最大偏差" value={`${analysis?.maxCentDeviation ?? "-"}c`} />
              <Stat label="错音数量" value={`${analysis?.wrongNoteCount ?? "-"}`} />
            </div>
          </section>

          <PitchCurve
            targetPitches={targetData?.targetPitches ?? []}
            detectedPitchTrack={analysis?.detectedPitchTrack ?? []}
            comparison={analysis}
          />
        </div>

        <section className="liuxiang-panel rounded-lg p-4">
          <h2 className="text-lg font-semibold text-ivory">逐音对比</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-ivory/10">
                  <th className="py-3 font-medium">目标音</th>
                  <th className="py-3 font-medium">检测音</th>
                  <th className="py-3 font-medium">偏差</th>
                  <th className="py-3 font-medium">判断</th>
                </tr>
              </thead>
              <tbody>
                {analysis?.items.map((item, index) => (
                  <tr key={`${item.targetPitch}-${index}`} className="border-b border-ivory/10">
                    <td className="py-3 text-ivory">{item.targetPitch}</td>
                    <td className="py-3 text-muted">{item.detectedPitch ?? "-"}</td>
                    <td className="py-3 text-muted">{item.centDeviation ? `${item.centDeviation} cents` : "-"}</td>
                    <td className="py-3">
                      <Badge tone={item.status === "accurate" ? "success" : "warning"}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <TeacherFeedbackForm />
      </div>
    </TeacherShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ivory/10 bg-ink-950/40 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold text-ivory">{value}</div>
    </div>
  );
}
