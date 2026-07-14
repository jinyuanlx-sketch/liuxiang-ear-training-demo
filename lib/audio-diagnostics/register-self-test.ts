import type { NoteRegisterStatus, PitchPoint, VoiceType } from "@/types/audio";
import {
  midiToFrequency,
  midiToNoteName,
  noteNameToMidi
} from "@/lib/pitch-detection/notes";
import { comparePitchTrack } from "@/lib/pitch-comparison/compare";

export interface RegisterSelfTestCaseResult {
  name: string;
  passed: boolean;
  voiceType: VoiceType;
  writtenTargetMidi: number;
  expectedSoundingMidi: number;
  rawDetectedMidi: number;
  scoringAdjustedMidi: number;
  noteRegisterStatus: NoteRegisterStatus;
  scoringAccurate: boolean;
  rawTrackPreserved: boolean;
}

export function runRegisterSelfTests(): RegisterSelfTestCaseResult[] {
  const cases: Array<{
    name: string;
    voiceType: VoiceType;
    written: string;
    detected: string;
    expectedSounding: string;
    expectedScoring: string;
    expectedStatus: NoteRegisterStatus;
    expectedAccurate: boolean;
  }> = [
    {
      name: "男声 C5 / 实唱 C4",
      voiceType: "male",
      written: "C5",
      detected: "C4",
      expectedSounding: "C4",
      expectedScoring: "C4",
      expectedStatus: "normal_register",
      expectedAccurate: true
    },
    {
      name: "男声 C5 / 实唱 C5",
      voiceType: "male",
      written: "C5",
      detected: "C5",
      expectedSounding: "C4",
      expectedScoring: "C5",
      expectedStatus: "wrong_register",
      expectedAccurate: false
    },
    {
      name: "女声 G5 / 实唱 G4",
      voiceType: "female",
      written: "G5",
      detected: "G4",
      expectedSounding: "G5",
      expectedScoring: "G5",
      expectedStatus: "high_note_octave_substitution",
      expectedAccurate: true
    },
    {
      name: "女声 E5 / 实唱 E4",
      voiceType: "female",
      written: "E5",
      detected: "E4",
      expectedSounding: "E5",
      expectedScoring: "E4",
      expectedStatus: "wrong_register",
      expectedAccurate: false
    }
  ];

  return cases.map((testCase) => {
    const writtenTargetMidi = noteNameToMidi(testCase.written);
    const expectedRawMidi = noteNameToMidi(testCase.detected);
    const rawTrack = buildSyntheticTrack(expectedRawMidi);
    const scoringTrack = rawTrack.map((point) => ({ ...point }));
    const result = comparePitchTrack([testCase.written], rawTrack, {
      targetRhythms: ["quarter"],
      tempo: 60,
      timeSignature: "4/4",
      voiceType: testCase.voiceType,
      scoringAdjustedPitchTrack: scoringTrack
    });
    const item = result.items[0];
    const rawTrackPreserved =
      rawTrack.every((point) => point.midi === expectedRawMidi) &&
      (result.rawDetectedPitchTrack ?? []).every(
        (point) => point.midi === expectedRawMidi
      );
    const scoringAccurate = item.status === "accurate";
    const passed =
      rawTrackPreserved &&
      item.writtenTargetMidi === writtenTargetMidi &&
      item.expectedSoundingMidi === noteNameToMidi(testCase.expectedSounding) &&
      nearlyEqual(item.rawDetectedMidi, expectedRawMidi) &&
      nearlyEqual(item.scoringAdjustedMidi, noteNameToMidi(testCase.expectedScoring)) &&
      item.noteRegisterStatus === testCase.expectedStatus &&
      scoringAccurate === testCase.expectedAccurate;

    return {
      name: testCase.name,
      passed,
      voiceType: testCase.voiceType,
      writtenTargetMidi: item.writtenTargetMidi ?? 0,
      expectedSoundingMidi: item.expectedSoundingMidi ?? 0,
      rawDetectedMidi: item.rawDetectedMidi ?? 0,
      scoringAdjustedMidi: item.scoringAdjustedMidi ?? 0,
      noteRegisterStatus: item.noteRegisterStatus ?? "missed",
      scoringAccurate,
      rawTrackPreserved
    };
  });
}

function nearlyEqual(value: number | null | undefined, expected: number) {
  return value !== null && value !== undefined && Math.abs(value - expected) < 0.001;
}

function buildSyntheticTrack(midi: number): PitchPoint[] {
  return [0.1, 0.2, 0.3, 0.4, 0.5].map((time) => ({
    time,
    frequency: midiToFrequency(midi),
    noteName: midiToNoteName(midi),
    midi,
    centsFromNearest: 0,
    clarity: 0.99,
    confidence: 0.99,
    rms: 0.2,
    voiced: true
  }));
}
