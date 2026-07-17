# Keeping the web app in sync with the iOS app (`maxapp`)

The web app and the iOS app are **two clients on one backend**. Most "sync" is
therefore automatic; a small amount is scripted; and one layer (the UI) can never
be fully automated because the two use different rendering technologies. Here is
the whole picture and how to keep them aligned.

## Source of truth

- **iOS / backend repo:** `princecharming001/maxapp` (checkout: `/Users/home/maxapp`).
  The current branch is `web-stripe-billing` (= `origin/main` + the web-billing
  commits). Its `mobile/` screens are the parity reference. There are several
  **stale** maxapp clones on disk (`Downloads/maxapp-main`, `yooo/maxapp`, …) —
  do **not** port from those.
- **Web repo:** `princecharming001/maxweb` (checkout: `/Users/home/tryclean-clone`).

## Four layers, four sync strategies

| Layer | Examples | How it stays in sync |
|---|---|---|
| **1. Dynamic data** | scans, marketplace, chat replies, schedules, user, subscription | **Automatic.** The web is a thin client on the *same* prod backend (`maxapp-api.onrender.com`) via the `/maxapi` proxy. Same API → identical data. Nothing to maintain. |
| **2. Shared content modules** | course curricula, habit catalog, task-step catalog, tone copy | **Scripted.** `npm run sync:maxapp` copies the RN-free pure-TS modules from the maxapp checkout into `lib/max/{courses,shared}/`. Re-run whenever iOS updates them. `npm run sync:maxapp:check` reports drift without writing (CI-friendly, exits non-zero on drift). |
| **3. Design tokens** | ink/accent/cream palette, Fraunces + Matter, radii | **Manual, rarely changes.** Encoded once in `app/globals.css` + Tailwind `mx-` tokens, mirrored from the iOS theme. |
| **4. UI screens** | Coach, You, Scan, Explore, onboarding, paywall | **Hand-ported — cannot be automated.** iOS renders React Native `StyleSheet`; web renders the DOM with Tailwind. There is no tool that turns one into the other. Each screen is a faithful translation tracked in `PARITY.md`. |

### What `npm run sync:maxapp` does
Reads `scripts/sync-from-maxapp.mjs` → pulls these from `$MAXAPP_DIR` (default
`/Users/home/maxapp`):
`data/courseContent.ts`, `data/courses/*`, `data/habitCatalog.ts`,
`data/taskStepCatalog.ts`, `lib/toneCopy.ts`. Each copy gets a provenance banner
and deterministic import-path rewrites. Anything carrying a `react-native` / asset
import (e.g. `data/courseIcons.ts`, which `require()`s PNGs) is skipped and
reported — the web keeps its own icon set for those.

## The ideal long-term option: a monorepo

Today the two apps are separate repos, so layer 2 needs a copy step. The cleaner
end state is to **move the web app into the maxapp repo** as `maxapp/web/`, next to
`mobile/` and `backend/`. Then:

- Layer 2 becomes **direct imports** (`web/` imports `../mobile/data/courses`) — the
  copy step disappears, one repo is the single source of truth.
- Layers 1 and 3 are unchanged; layer 4 is still hand-ported (unavoidable).
- **Cost:** the web would deploy from a subdirectory (point Vercel/host at `web/`),
  and the `maxweb` history would fold into `maxapp`. That's a deploy-topology change,
  so it's a decision to make deliberately — not done automatically.

Until then, `npm run sync:maxapp` after any iOS content change keeps layer 2 honest,
and `PARITY.md` tracks layer 4 screen by screen.
