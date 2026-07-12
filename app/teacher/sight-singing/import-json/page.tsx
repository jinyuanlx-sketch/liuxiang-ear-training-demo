import { FileJson } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sampleJson = `[
  {
    "title": "C大调二度三度基础视唱 01",
    "level": 1,
    "key_signature": "C major",
    "mode": "major",
    "time_signature": "2/4",
    "tempo": 72,
    "target_pitch_json": ["C4", "D4", "E4", "D4"],
    "target_rhythm_json": ["quarter", "quarter", "quarter", "quarter"],
    "review_status": "draft"
  }
]`;

export default function ImportSightJsonPage() {
  return (
    <TeacherShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <Badge tone="warning">JSON 批量导入</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">批量导入视唱题</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            导入前校验字段、音域、拍号、音高与节奏长度。导入后默认 review_status = draft。
          </p>
        </div>

        <div className="liuxiang-panel rounded-lg p-4">
          <textarea
            defaultValue={sampleJson}
            className="min-h-80 w-full rounded-md border border-ivory/10 bg-ink-950/70 p-3 font-mono text-xs text-ivory outline-none focus:border-brass/70"
          />
          <div className="mt-4 rounded-md border border-brass/20 bg-brass/10 p-3 text-sm text-brass">
            校验预留：每小节时值、音域、最大跳进、临时变化音、终止式、相似度、MusicXML 转换与谱面渲染。
          </div>
          <Button type="button" variant="primary" className="mt-5" icon={<FileJson className="h-4 w-4" />}>
            校验并导入 draft
          </Button>
        </div>
      </div>
    </TeacherShell>
  );
}
