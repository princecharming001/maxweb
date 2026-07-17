"use client";

import Reveal from "./Reveal";

/** Dark bento feature grid (geometry cloned from remindmetrace.com; px = target's rem×10). */
export default function TraceFeatures() {
  return (
    <section id="features" className="relative bg-[#0a0a0a] py-[140px] text-white">
      <div className="mx-auto max-w-[1200px] px-[4.8vw]">
        <Reveal>
          <div className="text-[13px] uppercase tracking-[0.14em] text-white/40">
            Features
          </div>
          <h2 className="mt-[14px] max-w-[16ch] text-[clamp(32px,5vw,44px)] font-light leading-[1.05] tracking-[-0.02em]">
            Built around the way you actually live.
          </h2>
          <p className="mt-[16px] max-w-[56ch] text-[15px] leading-[1.45] text-white/50">
            Max reads the best of 50+ looksmaxxing courses and rebuilds them
            around <em className="not-italic text-white/75">you</em> — your face,
            your goals, your schedule. No spreadsheets, no guesswork. Just the
            moves that move your needle, stacked into one daily plan.
          </p>
        </Reveal>

        <div className="mt-[60px] grid gap-[16px] md:grid-cols-3">
          {/* 1 — Facial analysis */}
          <Card className="md:col-span-2" mock={<ScanMock />}>
            <h3 className="feat-title">Facial analysis, every day.</h3>
            <p className="feat-body">
              Max reads 25+ features and shows you exactly where you&apos;re strong
              and where you&apos;re weak. Scan again any day and watch your progress
              move — the flaws shrinking, the strengths climbing.
            </p>
          </Card>
          {/* 2 — Coach */}
          <Card mock={<AudioBars />}>
            <h3 className="feat-title">A coach you can talk to.</h3>
            <p className="feat-body">
              Ask Max anything, like texting a friend who happens to be a looksmax
              expert. It answers and adjusts your plan on the spot.
            </p>
          </Card>

          {/* 3 — Daily reminders */}
          <Card mock={<ReminderMock />}>
            <h3 className="feat-title">Reminders that keep you on it.</h3>
            <p className="feat-body">
              Timed nudges for every step, so nothing slips — the plan actually
              happens instead of sitting in a notes app.
            </p>
          </Card>
          {/* 5 — Schedule + Google Cal */}
          <Card mock={<CalMock />}>
            <h3 className="feat-title">Fits your real schedule.</h3>
            <p className="feat-body">
              Max shapes your routine around the hours you actually have — and
              syncs it straight to your Google Calendar.
            </p>
          </Card>
          {/* 6 — Streak */}
          <Card mock={<StreakMock />}>
            <h3 className="feat-title">Keep your streak alive.</h3>
            <p className="feat-body">
              Every day you show up builds a streak worth protecting. Small wins,
              stacked into momentum you can feel.
            </p>
          </Card>

          {/* 4 — 50+ courses → hyperpersonalized routine (the engine) */}
          <Card className="md:col-span-3" mock={<CoursesMock />} row>
            <h3 className="feat-title">50+ courses, distilled into one routine — built for you.</h3>
            <p className="feat-body max-w-[54ch]">
              No more grinding through 20-page looksmax PDFs or 30 hours of Skool
              videos. Max reads the best of 50+ courses and rebuilds them into a
              single hyperpersonalized routine — tuned to your scan, your goals,
              and your day. You just do the next thing.
            </p>
          </Card>
        </div>
      </div>

      <style>{`
        .feat-title { font-size: 20px; font-weight: 300; letter-spacing: -0.02em; margin-top: 4px; }
        .feat-body { font-size: 15px; line-height: 1.45; color: rgba(255,255,255,0.5); margin-top: 9px; }
      `}</style>
    </section>
  );
}

function Card({
  children,
  mock,
  className = "",
  row = false,
}: {
  children: React.ReactNode;
  mock: React.ReactNode;
  className?: string;
  row?: boolean;
}) {
  return (
    <Reveal className={className}>
      <div className="flex h-full flex-col justify-between rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-[24px]">
        <div
          className={`mb-[30px] flex min-h-[100px] flex-1 items-center ${row ? "justify-start" : "justify-center"}`}
        >
          {mock}
        </div>
        <div>{children}</div>
      </div>
    </Reveal>
  );
}

/* ── Mini mockups ─────────────────────────────────────────────────────── */
function ReminderMock() {
  return (
    <div className="w-[190px] rounded-[10px] border border-white/12 bg-white/[0.05] p-[10px]">
      <div className="flex items-center gap-[8px]">
        <svg viewBox="0 0 24 24" className="size-[16px]" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
          <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
        </svg>
        <span className="text-[11px] text-white/40">Max · now</span>
      </div>
      <div className="mt-[7px] text-[12.5px] text-white/90">Mewing hold — 10 min</div>
      <div className="text-[11px] text-white/45">Time to lock it in.</div>
    </div>
  );
}
function CalMock() {
  return (
    <div className="flex flex-col items-center gap-[8px]">
      <div className="grid grid-cols-4 gap-[4px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="size-[14px] rounded-[3px] border border-white/12"
            style={{ background: i === 2 || i === 5 ? "rgba(0,113,227,0.35)" : "rgba(255,255,255,0.04)" }}
          />
        ))}
      </div>
      <span className="rounded-full border border-white/12 bg-white/[0.05] px-[10px] py-[3px] text-[10.5px] text-white/70">
        Synced · Google Calendar
      </span>
    </div>
  );
}
function CoursesMock() {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="grid grid-cols-4 gap-[3px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="size-[8px] rounded-[2px]"
            style={{ background: `rgba(255,255,255,${0.12 + (i % 4) * 0.08})` }}
          />
        ))}
      </div>
      <span className="text-white/40">→</span>
      <div className="rounded-[8px] border border-white/12 bg-white/[0.05] px-[10px] py-[8px]">
        <div className="text-[10px] text-white/40">For you</div>
        <div className="text-[11.5px] text-white/90">Jaw · Skin · Posture</div>
        <div className="text-[10px] text-white/45">fit to your day</div>
      </div>
    </div>
  );
}
function AudioBars() {
  const bars = [0.5, 0.8, 0.35, 1, 0.6, 0.9, 0.45, 1, 0.55, 0.85, 0.4, 0.7];
  return (
    <div className="flex h-[60px] items-center gap-[3.5px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="block w-[3.2px] rounded-full bg-white/85"
          style={{ height: `${h * 100}%`, animation: `barPulse ${0.9 + (i % 5) * 0.15}s ease-in-out ${i * 0.06}s infinite` }}
        />
      ))}
    </div>
  );
}
function StreakMock() {
  return (
    <svg viewBox="0 0 64 64" className="h-[60px] w-auto -rotate-90">
      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="#0071e3" strokeWidth="5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * 0.32} />
    </svg>
  );
}
function ScanMock() {
  return (
    <div className="rounded-[9px] border border-white/10 bg-white/[0.04] px-[14px] py-[11px]">
      <div className="text-[12px] text-white/90">Overall · 88</div>
      <div className="mt-[4px] text-[11px] text-white/45">Potential · unlock to see</div>
    </div>
  );
}
