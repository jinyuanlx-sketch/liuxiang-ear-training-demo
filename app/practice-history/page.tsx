import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { practiceRecords } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function PracticeHistoryPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Badge tone="neutral">练习记录</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">历史练习</h1>
          <p className="mt-2 text-sm text-muted">查看近期练耳与视唱训练结果，后续可扩展错题本与阶段报告。</p>
        </div>

        <div className="space-y-3">
          {practiceRecords.map((record) => (
            <article key={record.id} className="liuxiang-panel rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-ivory">
                    {record.type === "single_note" ? "单音听辨" : "音程听辨"}
                  </h2>
                  <div className="mt-1 text-xs text-muted">{formatDate(record.practicedAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-ivory">{record.accuracy}%</div>
                  <div className="text-xs text-muted">
                    {record.correctCount}/{record.totalQuestions}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
