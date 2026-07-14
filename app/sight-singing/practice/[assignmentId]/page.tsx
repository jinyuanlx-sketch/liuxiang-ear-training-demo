import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SightSingingWorkspace } from "@/components/sight-singing/sight-singing-workspace";
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
        </div>
        <SightSingingWorkspace
          key={assignment.id}
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
