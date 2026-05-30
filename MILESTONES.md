# Tide — milestones

Live tracker for the MVP. Plan: `~/.claude/plans/curious-stargazing-boot.md`.

## MVP (in progress)

- [x] **1. Scaffold** — Vite + React + TS, PWA plugin, calm theme, single-screen
      `App` shell with `mode` state. Builds + runs.
- [x] **2. Breathing pacer v1** — `pattern.ts` (+ unit tests), `useBreathCycle`,
      Canvas2D `BreathingPacer` with extended-exhale timing.
- [x] **3. Pacer polish** — easeInOutSine, glow + core gradient, expanding halo
      rings, `prefers-reduced-motion`, screen wake lock.
- [x] **4. Grounding** — 5-4-3-2-1 flow, tap-to-advance, progress dots, breath
      dimmed behind.
- [x] **5. Reassurance** — slow-fading cards, user's own messages first.
- [x] **6. Settings + persistence** — preset picker, optional breath chime,
      message editor, localStorage, JSON export/import backup.
- [x] **7. PWA finish** — manifest + generated icons, offline precache,
      standalone display. Build + 11 unit tests green.
- [ ] **8. Real-device test** — deploy to GitHub Pages (HTTPS), Add-to-Home-Screen
      on iPhone, then tune wording / timing / colors *with her*.

## Stretch (later)

- [ ] Ambient audio polish
- [ ] WebGPU visual upgrade for the orb
- [ ] Panic diary / pattern tracking
- [ ] Richer timed "ride the wave" visualization
