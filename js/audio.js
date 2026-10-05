export function createAudio() {
  let context = null;
  let enabled = true;

  function tone(frequency, duration, type = "sine", amount = 0.035) {
    if (!enabled || typeof AudioContext === "undefined") return;
    if (!context) context = new AudioContext();
    if (context.state === "suspended") context.resume();
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(amount, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  return {
    toggle() {
      enabled = !enabled;
      return enabled;
    },
    isOn() {
      return enabled;
    },
    pickup() {
      tone(540, 0.05);
    },
    place() {
      tone(320, 0.07);
    },
    success() {
      tone(620, 0.1);
      setTimeout(() => tone(860, 0.14), 90);
    },
    fail() {
      tone(160, 0.16, "triangle", 0.04);
    },
    complete() {
      tone(520, 0.08);
      setTimeout(() => tone(700, 0.12), 80);
    },
  };
}
