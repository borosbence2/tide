// Optional, very soft breath chime via Web Audio (no audio files). A gentle
// sine with a slow attack/release so it never startles. Off by default.

import type { Phase } from "../breathing/pattern";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // iOS suspends until a user gesture; resume is a no-op once running.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

const FREQ: Partial<Record<Phase, number>> = {
  inhale: 392, // G4 — a touch brighter on the in-breath
  exhale: 294, // D4 — settles lower on the out-breath
};

export function playChime(phase: Phase) {
  const c = getCtx();
  const freq = FREQ[phase];
  if (!c || !freq) return; // holds are silent

  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  // Soft swell: ~0.4s in, ~1.6s out, peak volume kept low.
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2);

  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 2.1);
}
