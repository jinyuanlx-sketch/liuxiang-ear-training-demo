import { notFound } from "next/navigation";
import { Archive, CheckCircle2, Edit3, Send } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrainingResourceManager } from "@/components/training-resources/training-resource-manager";
import { getSightSingingQuestionById } from "@/lib/question-bank";
import { getTrainingResourcesForTeacherTarget } from "@/lib/training-resource-links";

export default async function SightQuestionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = getSightSingingQuestionById(id);

  if (!question) {
    notFound();
  }

  const resources = getTrainingResourcesForTeacherTarget({
    module: "sight_singing",
    questionId: question.id
  });

  return (
    <TeacherShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone={question.reviewStatus === "approved" ? "success" : "warning"}>
              {question.reviewStatus}
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold text-ivory">{question.title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted">{question.trainingGoal}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" icon={<Edit3 className="h-4 w-4" />}>
              编辑
            </Button>
            <Button type="button" variant="secondary" icon={<Send className="h-4 w-4" />}>
              提交审核
            </Button>
            <Button type="button" variant="primary" icon={<CheckCircle2 className="h-4 w-4" />}>
              通过审核
            </Button>
            <Button type="button" variant="danger" icon={<Archive className="h-4 w-4" />}>
              归档
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="liuxiang-panel rounded-lg p-4">
            <h2 className="text-lg font-semibold text-ivory">谱面展示层</h2>
            <div className="staff-lines mt-4 flex min-h-56 items-center justify-center rounded-lg border border-ivory/10 bg-ink-950/40 text-sm text-muted">
              {question.scoreImageUrl || question.pdfUrl ? "谱面文件预览" : "暂无谱面图片或 PDF"}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="调号" value={question.keySignature} />
              <Info label="拍号" value={question.timeSignature} />
              <Info label="速度" value={`${question.tempo} bpm`} />
              <Info label="音域" value={`${question.rangeLow} - ${question.rangeHigh}`} />
            </div>
          </section>

          <section className="liuxiang-panel rounded-lg p-4">
            <h2 className="text-lg font-semibold text-ivory">机器评分层</h2>
            <JsonBlock label="target_pitch_json" value={question.targetPitchJson} />
            <JsonBlock label="target_rhythm_json" value={question.targetRhythmJson} />
            <div className="mt-4 flex flex-wrap gap-2">
              {question.difficultyTags.map((tag) => (
                <Badge key={tag} tone="neutral">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        </div>

        <section className="liuxiang-panel rounded-lg p-4">
          <h2 className="text-lg font-semibold text-ivory">老师审核与标注</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {["难度是否准确", "是否像考试题", "训练价值", "旋律自然度"].map((item) => (
              <select key={item} className="h-11 rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-ivory">
                <option>{item}</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </select>
            ))}
          </div>
        </section>

        <TrainingResourceManager
          resources={resources}
          bindingLabel={`视唱题 question_id: ${question.id}`}
          module="sight_singing"
          questionId={question.id}
        />
      </div>
    </TeacherShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ivory/10 bg-ink-950/40 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-ivory">{value}</div>
    </div>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="mt-4">
      <div className="text-sm text-muted">{label}</div>
      <pre className="mt-2 overflow-x-auto rounded-md border border-ivory/10 bg-ink-950/70 p-3 text-xs text-ivory">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
