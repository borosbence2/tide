import { useEffect, useRef } from "react";
import { breathScale, phaseAt, type BreathPattern, type Phase } from "./pattern";

export interface BreathFrame {
  phase: Phase;
  phaseProgress: number;
  secondsLeft: number;
  /** Eased orb scale, 0 (fully exhaled) .. 1 (fully inhaled). */
  scale: number;
  /** Seconds since the loop started (for ambient motion). */
  elapsed: number;
}

/**
 * Drives a breathing cycle with requestAnimationFrame and hands each frame to
 * `onFrame`. Callback-based on purpose: the orb is drawn on canvas, so we avoid
 * re-rendering React 60x/second (kinder to the phone battery during an attack).
 *
 * Pausing preserves the elapsed time so resuming doesn't jump mid-breath.
 */
export function useBreathCycle(
  pattern: BreathPattern,
  running: boolean,
  onFrame: (frame: BreathFrame) => void,
) {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const elapsedRef = useRef(0); // accumulated breathing time, seconds
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      lastTsRef.current = null;
      return;
    }
    let raf = 0;
    const tick = (ts: number) => {
      if (lastTsRef.current != null) {
        const dt = (ts - lastTsRef.current) / 1000;
        // Guard against huge jumps after the tab was backgrounded.
        elapsedRef.current += Math.min(dt, 0.1);
      }
      lastTsRef.current = ts;

      const elapsed = elapsedRef.current;
      const { phase, phaseProgress, secondsLeft } = phaseAt(pattern, elapsed);
      onFrameRef.current({
        phase,
        phaseProgress,
        secondsLeft,
        scale: breathScale(phase, phaseProgress),
        elapsed,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTsRef.current = null;
    };
  }, [pattern, running]);
}
