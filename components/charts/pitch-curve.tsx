import type { PitchComparisonResult, PitchPoint } from "@/types/audio";
import { noteNameToMidi } from "@/lib/pitch-detection/notes";

export function PitchCurve({
  targetPitches,
  detectedPitchTrack,
  comparison
}: {
  targetPitches: string[];
  detectedPitchTrack: PitchPoint[];
  comparison?: PitchComparisonResult | null;
}) {
  const targetMidis = targetPitches.map((pitch) => noteNameToMidi(pitch));
  const detectedMidis = detectedPitchTrack.map((point) => point.midi);
  const allMidis = [...targetMidis, ...detectedMidis];
  const minMidi = Math.min(...allMidis, 55);
  const maxMidi = Math.max(...allMidis, 76);
  const width = 720;
  const height = 260;
  const padding = 28;
  const duration = Math.max(
    detectedPitchTrack[detectedPitchTrack.length - 1]?.time ?? targetPitches.length,
    targetPitches.length
  );

  const yForMidi = (midi: number) => {
    const ratio = (midi - minMidi) / Math.max(1, maxMidi - minMidi);
    return height - padding - ratio * (height - padding * 2);
  };

  const xForTime = (time: number) => {
    const ratio = time / Math.max(1, duration);
    return padding + ratio * (width - padding * 2);
  };

  const detectedPath = detectedPitchTrack
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xForTime(point.time)} ${yForMidi(point.midi)}`)
    .join(" ");

  const targetStep = duration / Math.max(1, targetPitches.length);
  const targetPath = targetPitches
    .map((pitch, index) => {
      const x = xForTime(index * targetStep + targetStep * 0.5);
      const y = yForMidi(noteNameToMidi(pitch));
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="liuxiang-panel overflow-hidden rounded-lg">
      <div className="flex items-center justify-between gap-3 border-b border-ivory/10 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-ivory">音高曲线</div>
          <div className="text-xs text-muted">金色为目标音高，绿色为本次录音检测结果</div>
        </div>
        {comparison ? (
          <div className="rounded-md border border-jade/20 bg-jade/10 px-2.5 py-1 text-xs text-jade">
            {comparison.pitchAccuracy}%
          </div>
        ) : null}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <defs>
          <linearGradient id="pitchDetected" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#7cb7a2" />
            <stop offset="100%" stopColor="#f4efe6" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, index) => {
          const y = padding + index * ((height - padding * 2) / 4);
          return (
            <line
              key={index}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="rgba(244,239,230,0.1)"
              strokeWidth="1"
            />
          );
        })}
        {targetPath ? (
          <path
            d={targetPath}
            fill="none"
            stroke="#c8a15a"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            strokeDasharray="8 10"
          />
        ) : null}
        {detectedPath ? (
          <path
            d={detectedPath}
            fill="none"
            stroke="url(#pitchDetected)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        ) : (
          <text x="50%" y="50%" textAnchor="middle" fill="rgba(244,239,230,0.48)" fontSize="18">
            录音后生成音高曲线
          </text>
        )}
      </svg>
    </div>
  );
}
