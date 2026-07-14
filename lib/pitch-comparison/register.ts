import type {
  NoteRegisterStatus,
  TargetNoteTimelineItem,
  TargetPitchTrackPoint,
  VoiceType
} from "@/types/audio";
import { noteNameToMidi } from "@/lib/pitch-detection/notes";

const OCTAVE = 12;
const REGISTER_TOLERANCE = 0.75;
const WRONG_REGISTER_MIN_DISTANCE = 6;
const HIGH_NOTE_SUBSTITUTION_MIN_MIDI = noteNameToMidi("G5");

export interface RegisterEvaluation {
  writtenTargetMidi: number;
  expectedSoundingMidi: number;
  rawDetectedMidi: number;
  scoringAdjustedMidi: number;
  voiceType: VoiceType;
  noteRegisterStatus: NoteRegisterStatus;
}

export function expectedSoundingMidiForVoice(writtenTargetMidi: number, voiceType: VoiceType) {
  return voiceType === "male" ? writtenTargetMidi - OCTAVE : writtenTargetMidi;
}

export function evaluateNoteRegister({
  writtenTargetMidi,
  rawDetectedMidi,
  scoringCandidateMidi = rawDetectedMidi,
  voiceType,
  allowHighNoteOctaveSubstitution = true
}: {
  writtenTargetMidi: number;
  rawDetectedMidi: number;
  scoringCandidateMidi?: number;
  voiceType: VoiceType;
  allowHighNoteOctaveSubstitution?: boolean;
}): RegisterEvaluation {
  const expectedSoundingMidi = expectedSoundingMidiForVoice(writtenTargetMidi, voiceType);
  const registerDistance = rawDetectedMidi - expectedSoundingMidi;
  const isAllowedHighSubstitution =
    voiceType === "female" &&
    allowHighNoteOctaveSubstitution &&
    writtenTargetMidi >= HIGH_NOTE_SUBSTITUTION_MIN_MIDI &&
    Math.abs(rawDetectedMidi - (writtenTargetMidi - OCTAVE)) <= REGISTER_TOLERANCE;

  if (isAllowedHighSubstitution) {
    return {
      writtenTargetMidi,
      expectedSoundingMidi,
      rawDetectedMidi,
      scoringAdjustedMidi: scoringCandidateMidi + OCTAVE,
      voiceType,
      noteRegisterStatus: "high_note_octave_substitution"
    };
  }

  const noteRegisterStatus: NoteRegisterStatus =
    Math.abs(registerDistance) >= WRONG_REGISTER_MIN_DISTANCE
      ? "wrong_register"
      : "normal_register";

  return {
    writtenTargetMidi,
    expectedSoundingMidi,
    rawDetectedMidi,
    scoringAdjustedMidi: scoringCandidateMidi,
    voiceType,
    noteRegisterStatus
  };
}

export function buildRegisterTargetTracks(
  writtenTimeline: TargetNoteTimelineItem[],
  voiceType: VoiceType,
  actualStart = 0,
  tempoScale = 1
): {
  writtenTargetPitchTrack: TargetPitchTrackPoint[];
  expectedSoundingPitchTrack: TargetPitchTrackPoint[];
} {
  const writtenTargetPitchTrack = writtenTimeline.map((item) => ({
    index: item.index,
    noteName: item.targetPitch,
    midi: item.targetMidi,
    startTime: actualStart + item.startTime * tempoScale,
    endTime: actualStart + item.endTime * tempoScale,
    isRest: item.isRest
  }));
  const expectedSoundingPitchTrack = writtenTargetPitchTrack.map((item) => ({
    ...item,
    midi: item.midi === null ? null : expectedSoundingMidiForVoice(item.midi, voiceType)
  }));

  return { writtenTargetPitchTrack, expectedSoundingPitchTrack };
}
