"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teacherFeedbackDimensions } from "@/lib/teacher-review/feedback";

export function TeacherFeedbackForm() {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="liuxiang-panel rounded-lg p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <div>
        <h2 className="text-lg font-semibold text-ivory">老师诊断反馈</h2>
        <p className="mt-1 text-sm text-muted">自动分析只做训练参考，最终诊断由老师确认。</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        {teacherFeedbackDimensions.map((dimension) => (
          <label key={dimension.key} className="space-y-2">
            <span className="text-xs text-muted">{dimension.label}</span>
            <select
              name={dimension.key}
              defaultValue="3"
              className="h-10 w-full rounded-md border border-ivory/10 bg-ink-950 px-2 text-sm text-ivory outline-none focus:border-brass/70"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-sm text-muted">错误小结</span>
        <textarea
          name="feedback"
          rows={4}
          placeholder="例如：第三个音进入偏高，句尾主音支撑不足。"
          className="w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 py-3 text-sm text-ivory outline-none transition placeholder:text-muted/60 focus:border-brass/70"
        />
      </label>

      <label className="mt-4 block space-y-2">
        <span className="text-sm text-muted">下一步练习建议</span>
        <textarea
          name="nextSteps"
          rows={3}
          placeholder="例如：明天先慢速唱音名，再回到原速提交一次。"
          className="w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 py-3 text-sm text-ivory outline-none transition placeholder:text-muted/60 focus:border-brass/70"
        />
      </label>

      {saved ? (
        <div className="mt-4 rounded-md border border-jade/20 bg-jade/10 px-3 py-2 text-sm text-jade">
          本地原型已保存状态。接入 Supabase 后将写入 `feedback` 表。
        </div>
      ) : null}

      <Button type="submit" variant="primary" className="mt-4 w-full sm:w-auto" icon={<Save className="h-4 w-4" />}>
        保存反馈
      </Button>
    </form>
  );
}
