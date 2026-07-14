import type {
  PitchComparisonResult,
  PitchPoint,
  TargetPitchTrackPoint,
  VoiceType
} from "@/types/audio";
import { midiToNoteName, noteNameToMidi } from "@/lib/pitch-detection/notes";
import { expectedSoundingMidiForVoice } from "@/lib/pitch-comparison/register";

export function PitchCurve({
  targetPitches,
  rawDetectedPitchTrack,
  comparison,
  voiceType = "female"
}: {
  targetPitches: string[];
  rawDetectedPitchTrack: PitchPoint[];
  comparison?: PitchComparisonResult | null;
  voiceType?: VoiceType;
}) {
  const previewTracks = buildPreviewTargetTracks(targetPitches, voiceType);
  const writtenTargetPitchTrack =
    comparison?.writtenTargetPitchTrack ?? previewTracks.writtenTargetPitchTrack;
  const expectedSoundingPitchTrack =
    comparison?.expectedSoundingPitchTrack ?? previewTracks.expectedSoundingPitchTrack;
  const actualRawTrack = comparison?.rawDetectedPitchTrack ?? rawDetectedPitchTrack;
  const allMidis = [
    ...writtenTargetPitchTrack.map((point) => point.midi),
    ...expectedSoundingPitchTrack.map((point) => point.midi),
    ...actualRawTrack.map((point) => point.midi)
  ].filter((midi): midi is number => midi !== null);

  let minMidi = Math.floor(Math.min(...allMidis, 55)) - 1;
  let maxMidi = Math.ceil(Math.max(...allMidis, 76)) + 1;
  if (maxMidi - minMidi < 8) {
    const center = (maxMidi + minMidi) / 2;
    minMidi = Math.floor(center - 4);
    maxMidi = Math.ceil(center + 4);
  }

  const width = 720;
  const paddingLeft = 54;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 24;
  const yTicks = buildNaturalNoteTicks(minMidi, maxMidi);
  const height = Math.max(280, yTicks.length * 25 + paddingTop + paddingBottom);
  const duration = Math.max(
    actualRawTrack[actualRawTrack.length - 1]?.time ?? 0,
    writtenTargetPitchTrack[writtenTargetPitchTrack.length - 1]?.endTime ?? 0,
    expectedSoundingPitchTrack[expectedSoundingPitchTrack.length - 1]?.endTime ?? 0,
    1
  );

  const yForMidi = (midi: number) => {
    const ratio = (midi - minMidi) / Math.max(1, maxMidi - minMidi);
    return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
  };
  const xForTime = (time: number) =>
    paddingLeft + (time / duration) * (width - paddingLeft - paddingRight);

  const writtenPath = buildTargetPath(writtenTargetPitchTrack, xForTime, yForMidi);
  const expectedPath = buildTargetPath(expectedSoundingPitchTrack, xForTime, yForMidi);
  const rawDetectedPath = buildDetectedPath(actualRawTrack, xForTime, yForMidi);
  const substitutionItems =
    comparison?.items.filter(
      (item) => item.noteRegisterStatus === "high_note_octave_substitution"
    ) ?? [];

  return (
    <div className="liuxiang-panel overflow-hidden rounded-lg">
      <div className="border-b border-ivory/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-ivory">实验性音高轨迹</div>
          {comparison ? (
            <div className="rounded-md border border-jade/20 bg-jade/10 px-2.5 py-1 text-xs text-jade">
              技术测试
            </div>
          ) : null}
        </div>
        <div className="mt-2 text-xs leading-5 text-muted">
          金色为谱面书写音高，蓝灰虚线为本次评分目标音区，绿色为录音中的真实检测音高。
        </div>
        {substitutionItems.length > 0 ? (
          <div className="mt-1 text-xs leading-5 text-[#b99ae8]">
            紫色标记表示允许的高音区低八度代唱。
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[680px] w-full"
          role="img"
          aria-label="谱面书写音高、评分目标音区与真实检测音高对比图"
        >
          {yTicks.map((midi) => {
            const y = yForMidi(midi);
            return (
              <g key={midi}>
                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={y}
                  y2={y}
                  stroke="rgba(244,239,230,0.09)"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(244,239,230,0.58)"
                  fontSize="11"
                >
                  {midiToNoteName(midi)}
                </text>
              </g>
            );
          })}

          {writtenPath ? (
            <path
              d={writtenPath}
              fill="none"
              stroke="#c8a15a"
              strokeLinecap="round"
              strokeWidth="5"
            />
          ) : null}
          {expectedPath ? (
            <path
              d={expectedPath}
              fill="none"
              stroke="#8295a8"
              strokeLinecap="round"
              strokeWidth="3"
              strokeDasharray="9 7"
            />
          ) : null}

          {substitutionItems.map((item, index) =>
            item.rawDetectedMidi === null ||
            item.rawDetectedMidi === undefined ||
            item.detectedStartTime === null ||
            item.detectedStartTime === undefined ||
            item.detectedEndTime === null ||
            item.detectedEndTime === undefined ? null : (
              <line
                key={`${item.targetPitch}-${index}`}
                x1={xForTime(item.detectedStartTime)}
                x2={xForTime(item.detectedEndTime)}
                y1={yForMidi(item.rawDetectedMidi)}
                y2={yForMidi(item.rawDetectedMidi)}
                stroke="#9f7aea"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.5"
              />
            )
          )}

          {rawDetectedPath ? (
            <path
              d={rawDetectedPath}
              fill="none"
              stroke="#65b18d"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          ) : (
            <text
              x={(paddingLeft + width - paddingRight) / 2}
              y={height / 2}
              textAnchor="middle"
              fill="rgba(244,239,230,0.48)"
              fontSize="18"
            >
              录音后生成真实检测轨迹
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}

function buildPreviewTargetTracks(targetPitches: string[], voiceType: VoiceType) {
  const writtenTargetPitchTrack: TargetPitchTrackPoint[] = targetPitches.map(
    (noteName, index) => {
      const isRest = /^(rest|r)$/i.test(noteName);
      return {
        index,
        noteName,
        midi: isRest ? null : noteNameToMidi(noteName),
        startTime: index,
        endTime: index + 1,
        isRest
      };
    }
  );
  const expectedSoundingPitchTrack = writtenTargetPitchTrack.map((point) => ({
    ...point,
    midi:
      point.midi === null
        ? null
        : expectedSoundingMidiForVoice(point.midi, voiceType)
  }));
  return { writtenTargetPitchTrack, expectedSoundingPitchTrack };
}

function buildTargetPath(
  track: TargetPitchTrackPoint[],
  xForTime: (time: number) => number,
  yForMidi: (midi: number) => number
) {
  return track
    .map((point) =>
      point.isRest || point.midi === null
        ? ""
        : `M ${xForTime(point.startTime)} ${yForMidi(point.midi)} L ${xForTime(point.endTime)} ${yForMidi(point.midi)}`
    )
    .filter(Boolean)
    .join(" ");
}

function buildDetectedPath(
  track: PitchPoint[],
  xForTime: (time: number) => number,
  yForMidi: (midi: number) => number
) {
  return track
    .map((point, index) => {
      const previous = track[index - 1];
      const command = !previous || point.time - previous.time > 0.14 ? "M" : "L";
      return `${command} ${xForTime(point.time)} ${yForMidi(point.midi)}`;
    })
    .join(" ");
}

function buildNaturalNoteTicks(minMidi: number, maxMidi: number) {
  const naturalPitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
  const ticks: number[] = [];
  for (let midi = Math.ceil(maxMidi); midi >= Math.floor(minMidi); midi -= 1) {
    const pitchClass = ((midi % 12) + 12) % 12;
    if (naturalPitchClasses.has(pitchClass)) ticks.push(midi);
  }
  return ticks;
}
