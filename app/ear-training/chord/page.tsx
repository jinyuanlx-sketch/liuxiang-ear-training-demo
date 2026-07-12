import { AppShell } from "@/components/layout/app-shell";
import { EarTrainingSession } from "@/components/ear-training/ear-training-session";

export default function ChordPage() {
  return (
    <AppShell>
      <EarTrainingSession
        kind="chord"
        title="和弦听辨"
        description="第一版支持大三、小三、减三、增三和弦，后续预留七和弦与转位。"
      />
    </AppShell>
  );
}
