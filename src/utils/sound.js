// Web Audio API Synthesizer for subtle luxury UI ticks (zero external audio files)
let audioCtx = null;
let soundEnabled = false;

export const isSoundEnabled = () => soundEnabled;

export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    playClickSound(660, 0.04);
  }
  window.dispatchEvent(new CustomEvent("sound-toggle", { detail: soundEnabled }));
  window.dispatchEvent(
    new CustomEvent("show-toast", {
      detail: soundEnabled ? "UI Sound Enabled" : "UI Sound Muted",
    })
  );
  return soundEnabled;
};

export const playHoverTick = () => {
  if (!soundEnabled) return;
  playClickSound(420, 0.025);
};

export const playClickSound = (freq = 520, duration = 0.035) => {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      freq * 0.5,
      audioCtx.currentTime + duration
    );

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Ignore audio context restrictions if not yet interacted
  }
};
