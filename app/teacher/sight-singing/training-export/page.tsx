import { Download } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SightTrainingExportPage() {
  return (
    <TeacherShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <Badge tone="warning">training_dataset_export</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">训练数据导出</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            第一版只预留 JSONL 导出，不训练模型。未来可接 OpenAI fine-tuning 或本地 LoRA。
          </p>
        </div>

        <section className="liuxiang-panel rounded-lg p-4">
          <h2 className="text-lg font-semibold text-ivory">JSONL 样本结构</h2>
          <pre className="mt-4 overflow-x-auto rounded-md border border-ivory/10 bg-ink-950/70 p-3 text-xs text-ivory">
{`{
  "input": {
    "params": {"level": 1, "key_signature": "C major"},
    "style": "流响音乐视唱训练题"
  },
  "output": {
    "question_json": {},
    "target_pitch_json": [],
    "target_rhythm_json": [],
    "teacher_tags": [],
    "teacher_style_notes": ""
  }
}`}
          </pre>
          <Button type="button" variant="primary" className="mt-5" icon={<Download className="h-4 w-4" />}>
            生成导出任务
          </Button>
        </section>
      </div>
    </TeacherShell>
  );
}
