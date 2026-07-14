import type { PitchDetectionResult } from "@/types/audio";

export function WaveformChart({ waveform }: { waveform: number[] }) {
  const width = 720;
  const height = 150;
  const path = waveform
    .map((value, index) => {
      const x = (index / Math.max(1, waveform.length - 1)) * width;
      const y = height / 2 - value * (height / 2 - 8);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const mirror = waveform
    .map((value, index) => {
      const reverseIndex = waveform.length - 1 - index;
      const x = (reverseIndex / Math.max(1, waveform.length - 1)) * width;
      const y = height / 2 + value * (height / 2 - 8);
      return `L ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-hidden rounded-lg border border-ivory/10 bg-ink-950/45">
      <div className="border-b border-ivory/10 px-4 py-3 text-sm font-medium text-ivory">录音波形</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full">
        <line x1="0" x2={width} y1={height / 2} y2={height / 2} stroke="rgba(244,239,230,.12)" />
        {path ? <path d={`${path} ${mirror} Z`} fill="rgba(124,183,162,.35)" /> : null}
      </svg>
    </div>
  );
}

export function PitchDiagnosticsChart({ detection }: { detection: PitchDetectionResult }) {
  const width = 720;
  const height = 230;
  const padding = 24;
  const duration = Math.max(1, detection.duration);
  const midis = detection.rawPitchTrack
    .map((frame) => frame.midi)
    .filter((midi): midi is number => midi !== null);
  const minMidi = Math.min(...midis, 55);
  const maxMidi = Math.max(...midis, 76);
  const x = (time: number) => padding + (time / duration) * (width - padding * 2);
  const y = (midi: number) => height - padding - ((midi - minMidi) / Math.max(1, maxMidi - minMidi)) * (height - padding * 2);
  const rawDetectedPath = detection.rawDetectedPitchTrack
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.time)} ${y(point.midi)}`)
    .join(" ");
  const scoringAdjustedPath = detection.scoringAdjustedPitchTrack
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.time)} ${y(point.midi)}`)
    .join(" ");

  return (
    <div className="overflow-hidden rounded-lg border border-ivory/10 bg-ink-950/45">
      <div className="border-b border-ivory/10 px-4 py-3">
        <div className="text-sm font-medium text-ivory">检测前后音高曲线</div>
        <div className="mt-1 text-xs text-muted">灰点为全部 YIN 帧，绿色为真实发声音高，紫色虚线仅为评分内部修正轨迹。</div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        {detection.rawPitchTrack.map((frame, index) =>
          frame.midi === null ? null : (
            <circle
              key={index}
              cx={x(frame.time)}
              cy={y(frame.midi)}
              r="1.8"
              fill={frame.voiced ? "rgba(244,239,230,.32)" : "rgba(224,130,130,.55)"}
            />
          )
        )}
        {scoringAdjustedPath ? <path d={scoringAdjustedPath} fill="none" stroke="#9f7aea" strokeWidth="2" strokeDasharray="7 6" strokeLinecap="round" /> : null}
        {rawDetectedPath ? <path d={rawDetectedPath} fill="none" stroke="#65b18d" strokeWidth="3" strokeLinecap="round" /> : null}
      </svg>
    </div>
  );
}
