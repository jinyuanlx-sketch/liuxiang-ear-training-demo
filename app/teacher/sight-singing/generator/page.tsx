import { Sparkles } from "lucide-react";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SightQuestionGeneratorPage() {
  return (
    <TeacherShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <Badge tone="warning">question_generator</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">生成视唱候选题</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            第一版只预留接口与参数结构。AI 输出必须是结构化 JSON，经过程序校验和老师审核后才能入库。
          </p>
        </div>

        <section className="liuxiang-panel rounded-lg p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["level", "1"],
              ["key_signature", "C major"],
              ["mode", "major"],
              ["time_signature", "2/4"],
              ["measures_count", "4"],
              ["tempo", "72"],
              ["allowed_note_values", "quarter,eighth,half"],
              ["allowed_intervals", "m2,M2,m3,M3"],
              ["max_leap", "M3"],
              ["range_low", "C4"],
              ["range_high", "G4"],
              ["cadence_rule", "tonic_ending"]
            ].map(([label, value]) => (
              <label key={label} className="space-y-2">
                <span className="text-sm text-muted">{label}</span>
                <input
                  defaultValue={value}
                  className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none focus:border-brass/70"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {["allow_accidentals", "allow_syncopation", "allow_dotted_rhythm", "allow_triplets"].map((label) => (
              <label key={label} className="flex items-center gap-2 rounded-md border border-ivory/10 bg-ink-950/40 p-3 text-sm text-muted">
                <input type="checkbox" />
                {label}
              </label>
            ))}
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm text-muted">training_goal</span>
            <textarea
              defaultValue="训练 C 大调内二度级进与三度小跳的音准稳定"
              className="min-h-20 w-full rounded-md border border-ivory/10 bg-ink-950/70 p-3 text-sm text-ivory outline-none focus:border-brass/70"
            />
          </label>

          <div className="mt-4 rounded-md border border-brass/20 bg-brass/10 p-3 text-sm leading-6 text-brass">
            生成后进入 draft / pending_review。校验项包括拍号时值、音域、最大跳进、未允许节奏、临时变化音、终止式、相似度、MusicXML 转换和谱面渲染。
          </div>

          <Button type="button" variant="primary" className="mt-5" icon={<Sparkles className="h-4 w-4" />}>
            生成结构化候选 JSON
          </Button>
        </section>
      </div>
    </TeacherShell>
  );
}
