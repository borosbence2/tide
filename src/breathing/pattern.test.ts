import { describe, it, expect } from "vitest";
import {
  PRESETS,
  patternById,
  cycleDuration,
  phaseAt,
  breathScale,
  easeInOutSine,
} from "./pattern";

const calm = patternById("calm"); // 4-2-6, holdOut 0
const box = patternById("box"); // 4-4-4-4

describe("cycleDuration", () => {
  it("sums only non-zero phases", () => {
    expect(cycleDuration(calm)).toBe(12); // 4 + 2 + 6 + 0
    expect(cycleDuration(box)).toBe(16);
  });
});

describe("phaseAt", () => {
  it("starts in inhale at t=0", () => {
    const s = phaseAt(calm, 0);
    expect(s.phase).toBe("inhale");
    expect(s.phaseProgress).toBeCloseTo(0);
  });

  it("is mid-inhale at t=2 (4s inhale)", () => {
    const s = phaseAt(calm, 2);
    expect(s.phase).toBe("inhale");
    expect(s.phaseProgress).toBeCloseTo(0.5);
  });

  it("enters holdIn after inhale", () => {
    expect(phaseAt(calm, 4.5).phase).toBe("holdIn");
  });

  it("enters exhale after the hold", () => {
    expect(phaseAt(calm, 6.5).phase).toBe("exhale");
  });

  it("skips zero-duration holdOut and loops", () => {
    // calm has no holdOut; t=12 wraps back to a fresh inhale
    expect(phaseAt(calm, 12).phase).toBe("inhale");
    expect(phaseAt(calm, 12).phaseProgress).toBeCloseTo(0);
  });

  it("reports seconds left, counting down within a phase", () => {
    expect(phaseAt(calm, 0).secondsLeft).toBe(4);
    expect(phaseAt(calm, 3.1).secondsLeft).toBe(1);
  });

  it("handles negative elapsed gracefully", () => {
    expect(phaseAt(calm, -1).phase).toBe("exhale"); // wraps to last active phase region
  });
});

describe("breathScale", () => {
  it("is 0 fully exhaled, 1 fully inhaled", () => {
    expect(breathScale("inhale", 0)).toBeCloseTo(0);
    expect(breathScale("inhale", 1)).toBeCloseTo(1);
    expect(breathScale("holdIn", 0.5)).toBe(1);
    expect(breathScale("exhale", 0)).toBeCloseTo(1);
    expect(breathScale("exhale", 1)).toBeCloseTo(0);
    expect(breathScale("holdOut", 0.5)).toBe(0);
  });
});

describe("easeInOutSine", () => {
  it("is symmetric around the midpoint", () => {
    expect(easeInOutSine(0)).toBeCloseTo(0);
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5);
    expect(easeInOutSine(1)).toBeCloseTo(1);
  });
});

describe("presets", () => {
  it("exposes stable ids", () => {
    expect(PRESETS.map((p) => p.id)).toEqual(["calm", "box", "478"]);
  });
});
