// Pure, framework-free breathing model. All timing logic lives here so it can
// be unit-tested independently of rendering.

export type Phase = "inhale" | "holdIn" | "exhale" | "holdOut";

export interface BreathPattern {
  id: string;
  name: string;
  /** Phase durations in seconds. A duration of 0 means the phase is skipped. */
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

export const PRESETS: BreathPattern[] = [
  // Default: extended exhale — the most effective at calming the nervous system.
  { id: "calm", name: "Calm · 4-2-6", inhale: 4, holdIn: 2, exhale: 6, holdOut: 0 },
  { id: "box", name: "Box · 4-4-4-4", inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { id: "478", name: "4-7-8", inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
];

export const DEFAULT_PATTERN_ID = "calm";

export function patternById(id: string): BreathPattern {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

export const PHASE_LABEL: Record<Phase, string> = {
  inhale: "Breathe in",
  holdIn: "Hold",
  exhale: "Breathe out",
  holdOut: "Rest",
};

const ORDER: Phase[] = ["inhale", "holdIn", "exhale", "holdOut"];

/** Phases with a non-zero duration, in order. */
function activePhases(p: BreathPattern): { phase: Phase; duration: number }[] {
  return ORDER.map((phase) => ({ phase, duration: p[phase] })).filter(
    (x) => x.duration > 0,
  );
}

export function cycleDuration(p: BreathPattern): number {
  return activePhases(p).reduce((sum, x) => sum + x.duration, 0);
}

export interface PhaseState {
  phase: Phase;
  /** Progress through the current phase, 0..1. */
  phaseProgress: number;
  /** Seconds remaining in the current phase (rounded up for display). */
  secondsLeft: number;
}

/**
 * Given a pattern and elapsed seconds since the cycle began, return the current
 * phase and how far through it we are. Loops automatically.
 */
export function phaseAt(p: BreathPattern, elapsedSeconds: number): PhaseState {
  const phases = activePhases(p);
  const total = cycleDuration(p);
  if (total <= 0) {
    return { phase: "rest" as Phase, phaseProgress: 0, secondsLeft: 0 } as PhaseState;
  }
  let t = elapsedSeconds % total;
  if (t < 0) t += total;
  for (const { phase, duration } of phases) {
    if (t < duration) {
      return {
        phase,
        phaseProgress: duration === 0 ? 1 : t / duration,
        secondsLeft: Math.max(1, Math.ceil(duration - t)),
      };
    }
    t -= duration;
  }
  // Floating-point edge: land on the last phase fully complete.
  const last = phases[phases.length - 1];
  return { phase: last.phase, phaseProgress: 1, secondsLeft: 1 };
}

/** easeInOutSine — gentle, symmetric, breath-like. */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Maps a phase + progress to an orb scale in 0..1, where 0 is fully exhaled
 * (smallest) and 1 is fully inhaled (largest). Inhale grows, exhale shrinks,
 * holds stay put.
 */
export function breathScale(phase: Phase, phaseProgress: number): number {
  switch (phase) {
    case "inhale":
      return easeInOutSine(phaseProgress);
    case "holdIn":
      return 1;
    case "exhale":
      return 1 - easeInOutSine(phaseProgress);
    case "holdOut":
      return 0;
  }
}
