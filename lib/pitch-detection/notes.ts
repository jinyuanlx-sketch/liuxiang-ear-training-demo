const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#"
};

export function frequencyToMidi(frequency: number) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

export function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function midiToNoteName(midi: number) {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function noteNameToMidi(noteName: string) {
  const match = noteName.trim().match(/^([A-Ga-g])([#b]?)(-?\d)$/);

  if (!match) {
    throw new Error(`Invalid note name: ${noteName}`);
  }

  const note = `${match[1].toUpperCase()}${match[2]}`;
  const normalized = FLAT_TO_SHARP[note] ?? note;
  const noteIndex = NOTE_NAMES.indexOf(normalized);
  const octave = Number(match[3]);

  if (noteIndex < 0) {
    throw new Error(`Unsupported note name: ${noteName}`);
  }

  return (octave + 1) * 12 + noteIndex;
}

export function frequencyToNote(frequency: number) {
  const midi = frequencyToMidi(frequency);
  const targetFrequency = midiToFrequency(midi);
  const centsFromNearest = 1200 * Math.log2(frequency / targetFrequency);

  return {
    midi,
    noteName: midiToNoteName(midi),
    centsFromNearest
  };
}

export function centDeviation(frequency: number, targetMidi: number) {
  return 1200 * Math.log2(frequency / midiToFrequency(targetMidi));
}
