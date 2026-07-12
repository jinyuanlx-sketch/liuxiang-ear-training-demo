import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SightSingingWorkspace } from "@/components/sight-singing/sight-singing-workspace";
import { TrainingResourceList } from "@/components/training-resources/training-resource-list";
import { Badge } from "@/components/ui/badge";
import { getAssignmentById } from "@/lib/mock-data";
import { getSightSingingQuestionById, sightQuestionToLegacyTargetData } from "@/lib/question-bank";
import { getTrainingResourceLinks } from "@/lib/training-resource-links";

export default async function SightSingingPracticePage({
  params
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const assignment = getAssignmentById(assignmentId);

  if (!assignment || assignment.module !== "sight_singing" || !assignment.questionId) {
    notFound();
  }

  const question = getSightSingingQuestionById(assignment.questionId);

  if (!question) {
    notFound();
  }

  const beforeResources = getTrainingResourceLinks({
    module: "sight_singing",
    questionId: question.id,
    assignmentId: assignment.id,
    position: "before_practice"
  });
  const resultResources = getTrainingResourceLinks({
    module: "sight_singing",
    questionId: question.id,
    assignmentId: assignment.id,
    position: "result_page"
  });

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Badge tone="warning">今日视唱</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">{assignment.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            跟随谱面完成录音，系统会生成基础音准曲线；最终训练判断以老师反馈为准。
          </p>
        </div>
        <TrainingResourceList
          title="对应训练"
          helper="这是与本题训练点相关的讲解资源。观看后可返回继续练习。"
          resources={beforeResources}
          resourceQuery={{
            module: "sight_singing",
            questionId: question.id,
            assignmentId: assignment.id,
            position: "before_practice"
          }}
        />
        <SightSingingWorkspace
          targetData={sightQuestionToLegacyTargetData(question)}
          question={question}
          resultResources={resultResources}
          resultResourceQuery={{
            module: "sight_singing",
            questionId: question.id,
            assignmentId: assignment.id,
            position: "result_page"
          }}
        />
      </div>
    </AppShell>
  );
}
