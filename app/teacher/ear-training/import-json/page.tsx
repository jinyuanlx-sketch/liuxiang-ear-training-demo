import { FileJson } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sampleJson = `[
  {
    "title": "大三度听辨 01",
    "level": 1,
    "type": "interval",
    "stimulus_json": {"notes": ["C4", "E4"], "playback": "melodic_up"},
    "answer_key_json": {"correctAnswer": "major_third"},
    "choices_json": ["minor_second", "major_second", "minor_third", "major_third"],
    "review_status": "draft"
  }
]`;

export default function ImportEarJsonPage() {
  return (
    <TeacherShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <Badge tone="success">JSON 批量导入</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">批量导入练耳题</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            导入后默认 draft，老师审核 approved 后才能布置给学生。
          </p>
        </div>
        <div className="liuxiang-panel rounded-lg p-4">
          <textarea
            defaultValue={sampleJson}
            className="min-h-80 w-full rounded-md border border-ivory/10 bg-ink-950/70 p-3 font-mono text-xs text-ivory outline-none focus:border-brass/70"
          />
          <Button type="button" variant="primary" className="mt-5" icon={<FileJson className="h-4 w-4" />}>
            校验并导入 draft
          </Button>
        </div>
      </div>
    </TeacherShell>
  );
}
