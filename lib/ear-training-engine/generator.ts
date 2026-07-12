export type EarTrainingKind = "single_note" | "interval" | "chord";

export interface EarQuestion {
  id: string;
  kind: EarTrainingKind;
  prompt: string;
  answer: string;
  frequencies: number[];
  options: string[];
}

export const singleNoteOptions = ["C", "D", "E", "F", "G", "A", "B"];

export const intervalOptions = [
  "小二度",
  "大二度",
  "小三度",
  "大三度",
  "纯四度",
  "增四度 / 减五度",
  "纯五度",
  "小六度",
  "大六度",
  "小七度",
  "大七度",
  "纯八度"
];

export const chordOptions = ["大三和弦", "小三和弦", "减三和弦", "增三和弦"];

const noteFrequencyMap: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88
};

const intervalSemitones: Record<string, number> = {
  小二度: 1,
  大二度: 2,
  小三度: 3,
  大三度: 4,
  纯四度: 5,
  "增四度 / 减五度": 6,
  纯五度: 7,
  小六度: 8,
  大六度: 9,
  小七度: 10,
  大七度: 11,
  纯八度: 12
};

const chordSemitones: Record<string, number[]> = {
  大三和弦: [0, 4, 7],
  小三和弦: [0, 3, 7],
  减三和弦: [0, 3, 6],
  增三和弦: [0, 4, 8]
};

export function generateEarQuestion(kind: EarTrainingKind, index: number): EarQuestion {
  if (kind === "single_note") {
    const answer = pick(singleNoteOptions);

    return {
      id: `${kind}-${index}-${answer}`,
      kind,
      prompt: "听一个音，选择固定音名。",
      answer,
      frequencies: [noteFrequencyMap[answer]],
      options: singleNoteOptions
    };
  }

  if (kind === "interval") {
    const answer = pick(intervalOptions);
    const root = 261.63;
    const second = root * 2 ** (intervalSemitones[answer] / 12);

    return {
      id: `${kind}-${index}-${answer}`,
      kind,
      prompt: "听两个音，选择音程名称。",
      answer,
      frequencies: [root, second],
      options: intervalOptions
    };
  }

  const answer = pick(chordOptions);
  const root = 261.63;

  return {
    id: `${kind}-${index}-${answer}`,
    kind,
    prompt: "听一个和弦，选择和弦类型。",
    answer,
    frequencies: chordSemitones[answer].map((step) => root * 2 ** (step / 12)),
    options: chordOptions
  };
}

export function generateEarSession(kind: EarTrainingKind, questionCount = 10) {
  return Array.from({ length: questionCount }, (_, index) => generateEarQuestion(kind, index + 1));
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}
