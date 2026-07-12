import { AppShell } from "@/components/layout/app-shell";
import { EarTrainingSession } from "@/components/ear-training/ear-training-session";

export default function IntervalPage() {
  return (
    <AppShell>
      <EarTrainingSession
        kind="interval"
        title="音程听辨"
        description="系统播放两个音，学生识别音程名称，结果自动统计。"
      />
    </AppShell>
  );
}
