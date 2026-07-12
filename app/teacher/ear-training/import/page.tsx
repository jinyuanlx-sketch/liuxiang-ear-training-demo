import { Upload } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ImportEarQuestionPage() {
  return (
    <TeacherShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <Badge tone="success">导入练耳题</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">练耳题结构化导入</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            MIDI/audio 是播放层，stimulus_json 是题目内容，answer_key_json 是自动判分依据。
          </p>
        </div>

        <form className="liuxiang-panel rounded-lg p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <UploadBox label="MIDI 或音频" />
            <label className="space-y-2">
              <span className="text-sm text-muted">题型</span>
              <select className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-ivory outline-none focus:border-brass/70">
                <option value="single_note">single_note</option>
                <option value="interval">interval</option>
                <option value="chord">chord</option>
                <option value="rhythm_choice">rhythm_choice，预留</option>
                <option value="melody_dictation">melody_dictation，预留</option>
              </select>
            </label>
          </div>
          <JsonBox label="stimulus_json" value={'{"notes":["C4","E4"],"playback":"melodic_up"}'} />
          <JsonBox label="answer_key_json" value={'{"correctAnswer":"major_third","aliases":["大三度"]}'} />
          <JsonBox label="choices_json" value={'["minor_second","major_second","minor_third","major_third","perfect_fourth"]'} />
          <Button type="button" variant="primary" className="mt-5" icon={<Upload className="h-4 w-4" />}>
            保存为 draft
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
