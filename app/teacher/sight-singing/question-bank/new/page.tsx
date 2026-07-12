import { Save } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function NewSightQuestionPage() {
  return (
    <TeacherShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <Badge tone="warning">手动创建</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">新增视唱题</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            保存为 draft。审核通过前不会出现在老师布置任务的 approved 题目列表中。
          </p>
        </div>

        <form className="liuxiang-panel rounded-lg p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="标题" placeholder="C 大调二度三度基础视唱 01" />
            <Field label="level" placeholder="1" />
            <Field label="key_signature" placeholder="C major" />
            <Field label="mode" placeholder="major" />
            <Field label="time_signature" placeholder="2/4" />
            <Field label="tempo" placeholder="72" />
            <Field label="measures_count" placeholder="4" />
            <Field label="clef" placeholder="treble" />
            <Field label="range_low" placeholder="C4" />
            <Field label="range_high" placeholder="G4" />
            <Field label="谱面图片 / PDF" placeholder="上传后写入 URL" />
            <Field label="MIDI / MusicXML" placeholder="可选上传后写入 URL" />
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm text-muted">training_goal</span>
            <textarea className="min-h-24 w-full rounded-md border border-ivory/10 bg-ink-950/70 p-3 text-sm text-ivory outline-none focus:border-brass/70" />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-sm text-muted">target_pitch_json</span>
            <textarea
              defaultValue={'["C4","D4","E4","D4","C4","E4","D4","C4"]'}
              className="min-h-24 w-full rounded-md border border-ivory/10 bg-ink-950/70 p-3 font-mono text-xs text-ivory outline-none focus:border-brass/70"
            />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-sm text-muted">target_rhythm_json</span>
            <textarea
              defaultValue={'["quarter","quarter","quarter","quarter","quarter","quarter","quarter","quarter"]'}
              className="min-h-24 w-full rounded-md border border-ivory/10 bg-ink-950/70 p-3 font-mono text-xs text-ivory outline-none focus:border-brass/70"
            />
          </label>

          <Button type="button" variant="primary" className="mt-5" icon={<Save className="h-4 w-4" />}>
            保存为 draft
          </Button>
        </form>
      </div>
    </TeacherShell>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-muted">{label}</span>
      <input
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none placeholder:text-muted/60 focus:border-brass/70"
      />
    </label>
  );
}
