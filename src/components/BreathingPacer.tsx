import { useEffect, useRef, useState } from "react";
import {
  PHASE_LABEL,
  easeInOutSine,
  type BreathPattern,
  type Phase,
} from "../breathing/pattern";
import { useBreathCycle, type BreathFrame } from "../breathing/useBreathCycle";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Lead-in when re-entering from an overlay: ease the orb down to rest, hold a
// calm beat ("Breathe with me"), then restart on a fresh inhale.
const SETTLE_MS = 900; // smooth shrink to the resting orb (no jump)
const HOLD_MS = 3000; // the pause itself

// Orb color tracks the breath: calm slate-blue when exhaled → soft teal when full.
const LOW: [number, number, number] = [96, 132, 178];
const HIGH: [number, number, number] = [143, 212, 201];
function mix(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}
function orbColor(scale: number, alpha: number): string {
  const r = mix(LOW[0], HIGH[0], scale);
  const g = mix(LOW[1], HIGH[1], scale);
  const b = mix(LOW[2], HIGH[2], scale);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface Size {
  w: number;
  h: number;
  dpr: number;
}

export default function BreathingPacer({
  pattern,
  running = true,
  dimmed = false,
  restartKey = 0,
  onPhaseChange,
}: {
  pattern: BreathPattern;
  running?: boolean;
  dimmed?: boolean;
  /** Bump this to replay the calm lead-in and restart on a fresh inhale. */
  restartKey?: number;
  onPhaseChange?: (phase: Phase) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef<Size>({ w: 0, h: 0, dpr: 1 });

  const [phase, setPhase] = useState<Phase>("inhale");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [leadIn, setLeadIn] = useState(false);
  const [breathReset, setBreathReset] = useState(0);
  const lastPhaseRef = useRef<Phase>("inhale");
  const lastSecRef = useRef(0);
  // The scale currently on screen, so the lead-in can ease from wherever the
  // orb actually is (no jump), even if re-triggered mid-transition.
  const currentScaleRef = useRef(0);

  // Canvas setup + responsive sizing.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d");
    const parent = canvas.parentElement!;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Pure canvas render of the orb at a given scale (0 exhaled .. 1 inhaled).
  const renderOrb = (scale: number, elapsed: number, withRings: boolean) => {
    const ctx = ctxRef.current;
    const { w, h, dpr } = sizeRef.current;
    if (!ctx || w === 0) return;
    currentScaleRef.current = scale;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const minDim = Math.min(w, h);
    const baseR = minDim * 0.15;
    const maxR = minDim * 0.34;
    const r = baseR + (maxR - baseR) * scale;
    const baseAlpha = dimmed ? 0.4 : 1;

    if (withRings && !prefersReducedMotion) {
      for (let i = 0; i < 3; i++) {
        const p = (((elapsed * 0.16 + i / 3) % 1) + 1) % 1;
        const ringR = r + minDim * 0.16 * p;
        const a = (1 - p) * 0.18 * baseAlpha;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = orbColor(scale, a);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.8);
    glow.addColorStop(0, orbColor(scale, 0.55 * baseAlpha));
    glow.addColorStop(0.5, orbColor(scale, 0.28 * baseAlpha));
    glow.addColorStop(1, orbColor(scale, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const core = ctx.createRadialGradient(
      cx - r * 0.25,
      cy - r * 0.3,
      r * 0.1,
      cx,
      cy,
      r,
    );
    core.addColorStop(0, `rgba(220, 245, 240, ${0.95 * baseAlpha})`);
    core.addColorStop(0.6, orbColor(scale, 0.92 * baseAlpha));
    core.addColorStop(1, orbColor(scale, 0.5 * baseAlpha));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();
  };

  const draw = (frame: BreathFrame) => {
    renderOrb(frame.scale, frame.elapsed, true);

    // Surface phase changes to the DOM without re-rendering every frame.
    if (frame.phase !== lastPhaseRef.current) {
      lastPhaseRef.current = frame.phase;
      setPhase(frame.phase);
      onPhaseChange?.(frame.phase);
    }
    if (frame.secondsLeft !== lastSecRef.current) {
      lastSecRef.current = frame.secondsLeft;
      setSecondsLeft(frame.secondsLeft);
    }
  };

  // Re-entering from an overlay: smoothly ease the orb down to rest, hold a
  // calm beat, then restart on a fresh inhale.
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false; // cold open begins breathing immediately
      return;
    }
    setLeadIn(true);
    const startScale = currentScaleRef.current;
    const t0 = performance.now();
    let raf = 0;
    const animate = (now: number) => {
      const t = now - t0;
      if (t < SETTLE_MS) {
        // Ease from wherever the orb is down to the resting size — no jump.
        const k = easeInOutSine(t / SETTLE_MS);
        renderOrb(startScale * (1 - k), 0, false);
        raf = requestAnimationFrame(animate);
      } else if (t < SETTLE_MS + HOLD_MS) {
        renderOrb(0, 0, false); // hold at rest
        raf = requestAnimationFrame(animate);
      } else {
        setBreathReset((n) => n + 1); // rewind cycle to a full inhale
        setLeadIn(false);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // renderOrb reads only refs; safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartKey]);

  useBreathCycle(pattern, running && !leadIn, draw, breathReset);

  return (
    <div className="pacer">
      <canvas ref={canvasRef} className="pacer__canvas" aria-hidden="true" />
      <div className={`pacer__label${dimmed ? " pacer__label--dim" : ""}`}>
        <span className="pacer__cue" aria-live="polite">
          {leadIn ? "Breathe with me" : PHASE_LABEL[phase]}
        </span>
        <span className="pacer__count" aria-hidden="true">
          {leadIn ? "" : secondsLeft}
        </span>
      </div>
    </div>
  );
}
