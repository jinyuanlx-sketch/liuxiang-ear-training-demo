import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
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
  const matchedCount = analysis?.items.filter((item) => item.centDeviation !== null).length ?? 0;

  return (
    <TeacherShell>
      <div className="space-y-5">
        <div>
          <Badge tone="warning">视唱提交</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">{student?.name} · {assignment?.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">查看实验性音高检测数据，并填写老师诊断反馈。</p>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-brass/25 bg-brass/10 p-3 text-sm text-brass">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>实验性音高检测，仅用于技术测试，暂不作为训练评价。</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="liuxiang-panel rounded-lg p-4">
            <h2 className="text-lg font-semibold text-ivory">录音与实验检测</h2>
            <div className="mt-4 rounded-md border border-ivory/10 bg-ink-950/50 p-4 text-sm text-muted">
              真实提交后这里播放 Supabase Storage 中的音频文件。当前为演示提交。
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="逐音检测参考" value={`${matchedCount}/${analysis?.items.length ?? "-"}`} />
              <Stat label="平均偏差参考" value={`${analysis?.averageCentDeviation ?? "-"}c`} />
              <Stat label="低置信度帧" value={`${analysis?.lowConfidenceFrames ?? "-"}`} />
              <Stat label="额外片段" value={`${analysis?.extraSegmentCount ?? "-"}`} />
            </div>
          </section>

          <PitchCurve
            targetPitches={targetData?.targetPitches ?? []}
            rawDetectedPitchTrack={analysis?.rawDetectedPitchTrack ?? analysis?.detectedPitchTrack ?? []}
            comparison={analysis}
            voiceType={analysis?.voiceType ?? "female"}
          />
        </div>

        <section className="liuxiang-panel rounded-lg p-4">
          <h2 className="text-lg font-semibold text-ivory">逐音对比</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-ivory/10">
                  <th className="py-3 pr-4 font-medium">谱面 MIDI</th>
                  <th className="py-3 pr-4 font-medium">评分目标 MIDI</th>
                  <th className="py-3 pr-4 font-medium">原始检测 MIDI</th>
                  <th className="py-3 pr-4 font-medium">评分调整 MIDI</th>
                  <th className="py-3 pr-4 font-medium">演唱音区</th>
                  <th className="py-3 pr-4 font-medium">音区状态</th>
                  <th className="py-3 font-medium">偏差</th>
                  <th className="py-3 font-medium">置信度</th>
                  <th className="py-3 font-medium">单音内波动</th>
                  <th className="py-3 font-medium">判断</th>
                </tr>
              </thead>
              <tbody>
                {analysis?.items.map((item, index) => (
                  <tr key={`${item.targetPitch}-${index}`} className="border-b border-ivory/10">
                    <td className="py-3 pr-4 text-ivory">{formatMidi(item.writtenTargetMidi ?? item.targetMidi)}</td>
                    <td className="py-3 pr-4 text-muted">{formatMidi(item.expectedSoundingMidi)}</td>
                    <td className="py-3 pr-4 text-jade">{formatMidi(item.rawDetectedMidi ?? item.detectedMidi)}</td>
                    <td className="py-3 pr-4 text-muted">{formatMidi(item.scoringAdjustedMidi)}</td>
                    <td className="py-3 pr-4 text-muted">{item.voiceType ?? "-"}</td>
                    <td className="py-3 pr-4 text-muted">{item.noteRegisterStatus ?? "-"}</td>
                    <td className="py-3 text-muted">{item.centDeviation ? `${item.centDeviation} cents` : "-"}</td>
                    <td className="py-3 text-muted">{item.confidence === undefined ? "-" : item.confidence.toFixed(2)}</td>
                    <td className="py-3 text-muted">{item.stabilityCents === undefined || item.stabilityCents === null ? "-" : `${item.stabilityCents}c`}</td>
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

function formatMidi(value: number | null | undefined) {
  return value === null || value === undefined ? "-" : value.toFixed(2);
}
