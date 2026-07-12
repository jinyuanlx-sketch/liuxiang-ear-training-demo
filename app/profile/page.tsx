import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { students } from "@/lib/mock-data";

export default function ProfilePage() {
  const student = students[0];

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Badge tone="neutral">学生档案</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">{student.name}</h1>
          <p className="mt-2 text-sm text-muted">
            {student.grade} · {student.city} · {student.examDirection}
          </p>
        </div>

        <section className="liuxiang-panel rounded-lg p-4">
          <h2 className="text-lg font-semibold text-ivory">升学目标</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {student.targetSchools.map((school) => (
              <Badge key={school} tone="warning">
                {school}
              </Badge>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <ProfileField label="主项" value={student.major} />
            <ProfileField label="副项" value={student.minor} />
            <ProfileField label="训练阶段" value={student.trainingStage} />
            <ProfileField label="当前基础" value={student.currentLevel} />
          </div>
        </section>

        <section className="liuxiang-panel rounded-lg p-4">
          <h2 className="text-lg font-semibold text-ivory">当前训练重点</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{student.currentFocus}</p>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <Level label="视唱" value={student.sightLevel} />
          <Level label="练耳" value={student.earLevel} />
          <Level label="乐理" value={student.theoryLevel} />
        </section>
      </div>
    </AppShell>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ivory/10 bg-ink-950/40 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-ivory">{value}</div>
    </div>
  );
}

function Level({ label, value }: { label: string; value: number }) {
  return (
    <div className="liuxiang-panel rounded-lg p-4 text-center">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-ivory">{value}</div>
      <div className="mt-1 text-xs text-muted">1-5 级</div>
    </div>
  );
}
