import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SightSingingWorkspace } from "@/components/sight-singing/sight-singing-workspace";
import { Badge } from "@/components/ui/badge";
import { getAssignmentById } from "@/lib/mock-data";
import type { SightSingingTargetData } from "@/types/assignment";

export default async function SightSingingDetailPage({
  params
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const assignment = getAssignmentById(assignmentId);

  if (!assignment || assignment.module !== "sight_singing") {
    notFound();
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Badge tone="warning">视唱任务</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">{assignment.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{assignment.description}</p>
        </div>
        <SightSingingWorkspace targetData={assignment.targetData as SightSingingTargetData} />
      </div>
    </AppShell>
  );
}
