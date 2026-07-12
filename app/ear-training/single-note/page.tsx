import { AppShell } from "@/components/layout/app-shell";
import { EarTrainingSession } from "@/components/ear-training/ear-training-session";

export default function SingleNotePage() {
  return (
    <AppShell>
      <EarTrainingSession
        kind="single_note"
        title="单音听辨"
        description="固定音名模式：系统播放 C 到 B 的单音，学生选择答案并立即获得反馈。"
      />
    </AppShell>
  );
}
