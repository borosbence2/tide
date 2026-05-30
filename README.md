# Tide 🌊

A calm companion for panic attacks — it opens straight into a breathing
exercise, with grounding and reassurance one gentle tap away.

Tide is a **PWA**: install it from the browser ("Add to Home Screen") and it
runs fullscreen and offline, with everything stored on your device. No account,
no servers, nothing uploaded.

## What it does

- **Breathing pacer** — a calming animated orb you breathe with. Default rhythm
  is an extended exhale (4-2-6), the most effective at settling the nervous
  system. Box (4-4-4-4) and 4-7-8 are also available.
- **Grounding** — the 5-4-3-2-1 sensory exercise for when things feel unreal.
- **Reassurance** — gentle cards, led by *your own* "letter from calm-you".
- **Calm by design** — opens to breathing in under a second, dark and
  low-stimulation, large tap targets, keeps the screen awake, no notifications.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run test     # unit tests for the breathing timing logic
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build (test the PWA / offline)
```

## Publish (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` builds and deploys on every push to
`main`/`master`. It auto-sets the base path to `/<repo>/` for project sites.

One-time setup: in the GitHub repo, **Settings → Pages → Build and deployment →
Source: GitHub Actions**. The app will be live at
`https://<user>.github.io/<repo>/` over HTTPS (required for the PWA/offline
service worker to work — including on iOS).

For a custom domain or a `<user>.github.io` root site, the base stays `/`.

## A note

Tide is a supportive companion, not a substitute for care. If panic attacks are
frequent or severe, please reach out to a doctor or therapist — CBT is very
effective for panic.
