import { notFound } from "next/navigation";
import { Archive, CheckCircle2, Edit3 } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { TrainingResourceManager } from "@/components/training-resources/training-resource-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEarTrainingQuestionById } from "@/lib/question-bank";
import { getTrainingResourcesForTeacherTarget } from "@/lib/training-resource-links";

export default async function EarQuestionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = getEarTrainingQuestionById(id);

  if (!question) {
    notFound();
  }

  const resources = getTrainingResourcesForTeacherTarget({
    module: "ear_training",
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
            <p className="mt-2 text-sm leading-6 text-muted">{question.explanation ?? "暂无说明"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" icon={<Edit3 className="h-4 w-4" />}>
              编辑
            </Button>
            <Button type="button" variant="primary" icon={<CheckCircle2 className="h-4 w-4" />}>
              通过审核
            </Button>
            <Button type="button" variant="danger" icon={<Archive className="h-4 w-4" />}>
              归档
            </Button>
          </div>
        </div>

        <section className="liuxiang-panel rounded-lg p-4">
          <h2 className="text-lg font-semibold text-ivory">练耳题结构</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <JsonBlock label="stimulus_json" value={question.stimulusJson} />
            <JsonBlock label="answer_key_json" value={question.answerKeyJson} />
            <JsonBlock label="choices_json" value={question.choicesJson} />
          </div>
        </section>

        <TrainingResourceManager
          resources={resources}
          bindingLabel={`练耳题 question_id: ${question.id}`}
          module="ear_training"
          questionId={question.id}
        />
      </div>
    </TeacherShell>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="text-sm text-muted">{label}</div>
      <pre className="mt-2 min-h-40 overflow-x-auto rounded-md border border-ivory/10 bg-ink-950/70 p-3 text-xs text-ivory">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
