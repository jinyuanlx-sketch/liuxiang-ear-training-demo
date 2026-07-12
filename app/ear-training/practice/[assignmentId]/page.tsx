import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AssignmentEarPractice } from "@/components/ear-training/assignment-ear-practice";
import { Badge } from "@/components/ui/badge";
import { getAssignmentById } from "@/lib/mock-data";
import { getEarTrainingQuestionById } from "@/lib/question-bank";
import { getTrainingResourceLinks } from "@/lib/training-resource-links";

export default async function EarTrainingPracticePage({
  params
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const assignment = getAssignmentById(assignmentId);

  if (!assignment || assignment.module !== "ear_training" || !assignment.questionId) {
    notFound();
  }

  const question = getEarTrainingQuestionById(assignment.questionId);

  if (!question) {
    notFound();
  }

  const beforeResources = getTrainingResourceLinks({
    module: "ear_training",
    questionId: question.id,
    assignmentId: assignment.id,
    position: "before_practice"
  });
  const afterResources = getTrainingResourceLinks({
    module: "ear_training",
    questionId: question.id,
    assignmentId: assignment.id,
    position: "after_practice"
  });

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Badge tone="success">今日练耳</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">{assignment.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            播放题目音频，选择答案后立即查看自动判分和练后复盘资源。
          </p>
        </div>
        <AssignmentEarPractice
          question={question}
          beforeResources={beforeResources}
          afterResources={afterResources}
          beforeResourceQuery={{
            module: "ear_training",
            questionId: question.id,
            assignmentId: assignment.id,
            position: "before_practice"
          }}
          afterResourceQuery={{
            module: "ear_training",
            questionId: question.id,
            assignmentId: assignment.id,
            position: "after_practice"
          }}
        />
      </div>
    </AppShell>
  );
}
