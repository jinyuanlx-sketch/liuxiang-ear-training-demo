import type { EarQuestion } from "@/lib/ear-training-engine/generator";

export async function playEarQuestion(question: EarQuestion) {
  const audioContext = new AudioContext();
  const now = audioContext.currentTime;
  const output = createPianoOutput(audioContext);

  if (question.kind === "chord") {
    question.frequencies.forEach((frequency, index) => {
      playPianoMidiNote(audioContext, output, frequency, now + index * 0.014, 1.85);
    });
  } else {
    question.frequencies.forEach((frequency, index) => {
      playPianoMidiNote(audioContext, output, frequency, now + index * 0.82, 1.15);
    });
  }

  const totalDuration =
    question.kind === "chord" ? 2400 : Math.max(1900, question.frequencies.length * 820 + 1200);

  window.setTimeout(() => {
    void audioContext.close();
  }, totalDuration);
}

function createPianoOutput(audioContext: AudioContext) {
  const master = audioContext.createGain();
  const compressor = audioContext.createDynamicsCompressor();
  const room = audioContext.createDelay(0.18);
  const roomGain = audioContext.createGain();
  const roomFilter = audioContext.createBiquadFilter();

  master.gain.value = 0.78;
  compressor.threshold.value = -22;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.006;
  compressor.release.value = 0.18;
  room.delayTime.value = 0.055;
  roomGain.gain.value = 0.12;
  roomFilter.type = "lowpass";
  roomFilter.frequency.value = 3600;

  master.connect(compressor);
  compressor.connect(audioContext.destination);
  master.connect(room);
  room.connect(roomFilter);
  roomFilter.connect(roomGain);
  roomGain.connect(audioContext.destination);

  return master;
}

function playPianoMidiNote(
  audioContext: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  duration: number
) {
  const voice = audioContext.createGain();
  const body = audioContext.createBiquadFilter();
  const brightness = audioContext.createBiquadFilter();
  const stopTime = startTime + duration + 0.7;

  voice.gain.setValueAtTime(0.0001, startTime);
  voice.gain.exponentialRampToValueAtTime(0.36, startTime + 0.008);
  voice.gain.exponentialRampToValueAtTime(0.18, startTime + 0.12);
  voice.gain.exponentialRampToValueAtTime(0.022, startTime + duration);
  voice.gain.exponentialRampToValueAtTime(0.0001, stopTime);

  body.type = "peaking";
  body.frequency.value = 420;
  body.Q.value = 0.72;
  body.gain.value = 3.2;

  brightness.type = "lowpass";
  brightness.frequency.setValueAtTime(8200, startTime);
  brightness.frequency.exponentialRampToValueAtTime(2600, startTime + duration);
  brightness.Q.value = 0.42;

  voice.connect(body);
  body.connect(brightness);
  brightness.connect(destination);

  playPianoPartials(audioContext, voice, frequency, startTime, stopTime);
  playHammerTransient(audioContext, voice, startTime);
}

function playPianoPartials(
  audioContext: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  stopTime: number
) {
  const partials = [
    { ratio: 1, gain: 0.9, detune: 0 },
    { ratio: 2.003, gain: 0.34, detune: 3 },
    { ratio: 3.008, gain: 0.18, detune: -4 },
    { ratio: 4.021, gain: 0.1, detune: 6 },
    { ratio: 5.036, gain: 0.058, detune: -8 },
    { ratio: 6.052, gain: 0.032, detune: 9 }
  ];

  partials.forEach((partial, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = index === 0 ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency * partial.ratio, startTime);
    oscillator.detune.setValueAtTime(partial.detune, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(partial.gain, startTime + 0.006 + index * 0.002);
    gain.gain.exponentialRampToValueAtTime(partial.gain * 0.32, startTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(startTime);
    oscillator.stop(stopTime + 0.02);
  });
}

function playHammerTransient(
  audioContext: AudioContext,
  destination: AudioNode,
  startTime: number
) {
  const bufferSize = Math.floor(audioContext.sampleRate * 0.045);
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index += 1) {
    const decay = 1 - index / bufferSize;
    data[index] = (Math.random() * 2 - 1) * decay * decay;
  }

  const noise = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const highpass = audioContext.createBiquadFilter();
  const lowpass = audioContext.createBiquadFilter();

  noise.buffer = buffer;
  highpass.type = "highpass";
  highpass.frequency.value = 950;
  lowpass.type = "lowpass";
  lowpass.frequency.value = 7200;

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.085, startTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.045);

  noise.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(destination);
  noise.start(startTime);
  noise.stop(startTime + 0.05);
}
