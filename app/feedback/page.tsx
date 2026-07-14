import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { feedbackItems } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function FeedbackPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Badge tone="warning">老师诊断</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">反馈记录</h1>
          <p className="mt-2 text-sm leading-6 text-muted">实验性技术检测之外的专业判断和下一步训练建议。</p>
        </div>

        {feedbackItems.map((feedback) => (
          <article key={feedback.id} className="liuxiang-panel rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <Badge tone="warning">陈老师</Badge>
              <span className="text-xs text-muted">{formatDate(feedback.createdAt)}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-ivory/80">{feedback.textFeedback}</p>
            <div className="mt-4 grid grid-cols-5 gap-2 text-center">
              {Object.entries(feedback.ratingJson).map(([key, value]) => (
                <div key={key} className="rounded-md border border-ivory/10 bg-ivory/5 p-2">
                  <div className="text-xs text-muted">
                    {key === "pitch"
                      ? "音准"
                      : key === "rhythm"
                        ? "节奏"
                        : key === "tonality"
                          ? "调性"
                          : key === "tempo"
                            ? "速度"
                            : "乐句"}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-ivory">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md border border-jade/20 bg-jade/10 p-3 text-sm text-jade">
              {feedback.nextSteps}
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
