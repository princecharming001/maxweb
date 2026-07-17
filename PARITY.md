# Max Web ↔ iOS Parity Matrix

Living doc tracking web-port parity against the iOS app (`/Users/home/maxapp/mobile`).
iOS = ground truth. Web may differ only in input idioms (hover vs long-press),
proportions, and payment rails (Stripe hosted checkout vs Apple IAP).

Legend: ✅ match · 🟡 partial · ⛔ missing · ⏸ deferred (tracked below)

## Reported issues — all resolved this pass

| Issue | Status | Fix |
|---|---|---|
| Camera doesn't work in face scan | ✅ | `CameraCapture.tsx`: `<video>` always mounted, stream attached in a dedicated effect, `autoPlay`, `videoWidth>0` capture guard (no more blank JPEGs), front-camera mirroring, quality 0.85, verbatim step copy, NotAllowed/NotFound/insecure error taxonomy → upload fallback. |
| Access codes don't work | ✅ | Two-step validate→redeem (`referral/validate` then `referral/redeem`), comp/discount branching, verbatim copy ("approved — premium is on us." / "code applied." / "that code isn't valid."), CTA flips to "Unlock access", discount promo code carried into checkout. |
| Payments misbehave | ✅ | Backend `payments_web.py` now accepts `promotion_code` (resolves code→promo id, `discounts=[]`); web carries the redeemed code into checkout; honest "coming soon" copy when billing disabled (prod). Committed local (branch `web-stripe-billing`), NOT deployed. |
| No coach selection in chat | ✅ | `CoachPicker.tsx`: Goggins / Clavicular / Big Daddy personas (verbatim, avatars from `/personas/*.png`), `PATCH users/coaching-tone` (optimistic + rollback), Length control (`PATCH users/response-length`). Lives in chat sidebar (desktop) + hamburger drawer (mobile). **Verified live: PATCH coaching-tone → 200.** |
| Profile page looks different | ✅ | `you/page.tsx` rebuilt to iOS structure: kicker+serif name → streak card (verbatim copy) → month progress calendar + day modal (/10 RATING/APPEAL/POTENTIAL, gated paywall/empty/error states) → Achievements / Plan / Purchases / Account. **Verified live.** |

## Screen-by-screen

| Screen | Status | Notes |
|---|---|---|
| Landing (`/`) | ✅ | remindmetrace.com clone, Max content, CTA → `/start` |
| Onboarding funnel `/start/*` | ✅ | scan-first → intro quiz (5, verbatim) → reveal → account → referral → paywall → schedule quiz (8) → today |
| Login / Signup / Forgot | ✅ | JSON login, Google feature-detected |
| Today `/app/today` | ✅ | optimistic task toggle + rollback |
| Coach `/app/coach` | ✅ | personas, length, drawer, starters ("What can I help with?" + 3 chips), image attach (`forums/upload`), Web-Speech voice, nudge seed, habit-picker widget, custom-chip focus, conversation delete |
| Scan capture | ✅ | camera fixed + upload fallback |
| Scan analyzing/results | ✅ | polling; free-tier potential blurred |
| Explore + item | ✅ | grid, detail, enter → hosted checkout redirect |
| You `/app/you` | ✅ | iOS structure + progress calendar |
| You → Achievements / Scans / Photos | ✅ | |
| You → Settings | ✅ | sectioned menu (Membership/Coaching/Profile/Support/Account); tone+length moved to chat drawer |
| Settings → Personal info / My products / Edit lifestyle | ✅ | new sub-pages |
| Legal `/legal/[doc]` | ✅ | privacy / terms |
| Subscribe / success / Manage sub | ✅ | env-gated web billing; Apple-billed → "manage on iPhone" |

## Deferred (matching iOS reachability/value; not in this pass)

Fitmax program suite (workout tracker / calorie log / progress), full DaySetup
(places/busy blocks), Google Calendar OAuth connect flow, WeeklyReview, Ranks
page, InAppNotifications center, achievement celebration overlays, Forums (a dead
"coming soon" tab on iOS too), Creator + Admin surfaces. Reply-to-message on chat
bubbles is a light idiom gap (swipe on iOS) — not yet ported.

## Verification done

- `tsc --noEmit`: app code clean (0 errors outside Next's generated types).
- Every route returns 200 in dev.
- Live smoke (fresh account): coach picker switch → `PATCH users/coaching-tone` 200 + `users/me` refresh; nudge endpoint fires; You page renders iOS structure with free-tier paywall gating.
- Backend `payments_web.py` syntax-checked + committed (local, not deployed).
