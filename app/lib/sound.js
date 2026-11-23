let ctx = null;

// เรียกจากการกดปุ่มของผู้ใช้ เพื่อให้เบราว์เซอร์อนุญาตเล่นเสียง
export function unlockAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
  } catch {}
}

export function beep(times = 1) {
  try {
    unlockAudio();
    if (!ctx) return;
    for (let i = 0; i < times; i++) {
      const t = ctx.currentTime + i * 0.28;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  } catch {}
}