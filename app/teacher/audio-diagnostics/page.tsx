import { AlertTriangle } from "lucide-react";
import { AudioDiagnosticsLab } from "@/components/audio/audio-diagnostics-lab";
import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";

export default function TeacherAudioDiagnosticsPage() {
  return (
    <TeacherShell>
      <div className="space-y-5">
        <div>
          <Badge tone="warning">内部诊断</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">音频录制与音高诊断</h1>
          <p className="mt-2 text-sm leading-6 text-muted">用于比较设备录音设置、YIN 原始轨迹、过滤结果和逐音对齐，不面向学生成绩展示。</p>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-brass/25 bg-brass/10 p-3 text-sm text-brass">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>实验性音高检测，仅用于技术测试，暂不作为训练评价。</span>
        </div>
        <AudioDiagnosticsLab />
      </div>
    </TeacherShell>
  );
}
