import { Upload } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ImportSightQuestionPage() {
  return (
    <TeacherShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <Badge tone="warning">导入视唱题</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">谱面与评分 JSON 绑定</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            五线谱图片/PDF 是展示层，JSON 是机器评分层，MIDI/audio 是播放层。三者通过同一个 question_id 绑定。
          </p>
        </div>

        <form className="liuxiang-panel rounded-lg p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <UploadBox label="score_image 或 PDF" />
            <UploadBox label="MusicXML，可选" />
            <UploadBox label="MIDI，可选" />
            <Field label="保存状态" value="draft" />
          </div>
          <JsonBox label="target_pitch_json" value={'["C4","D4","E4","D4","C4","E4","D4","C4"]'} />
          <JsonBox label="target_rhythm_json" value={'["quarter","quarter","quarter","quarter","quarter","quarter","quarter","quarter"]'} />
          <Button type="button" variant="primary" className="mt-5" icon={<Upload className="h-4 w-4" />}>
            导入为 draft
          </Button>
        </form>
      </div>
    </TeacherShell>
  );
}

function UploadBox({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-ivory/15 bg-ink-950/40 p-4">
      <div className="text-sm text-ivory">{label}</div>
      <div className="mt-2 text-xs text-muted">接入 Supabase Storage 后上传到 question-assets bucket。</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-muted">{label}</span>
      <input
        defaultValue={value}
        className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none focus:border-brass/70"
      />
    </label>
  );
}

function JsonBox({ label, value }: { label: string; value: string }) {
  return (
    <label className="mt-4 block space-y-2">
      <span className="text-sm text-muted">{label}</span>
      <textarea
        defaultValue={value}
        className="min-h-24 w-full rounded-md border border-ivory/10 bg-ink-950/70 p-3 font-mono text-xs text-ivory outline-none focus:border-brass/70"
      />
    </label>
  );
}
