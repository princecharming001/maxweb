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

        {/* One card per real feature (maps to the app's tabs) — no overlap. */}
        <div className="mt-[60px] grid gap-[16px] md:grid-cols-3">
          {/* Coach */}
          <Card className="md:col-span-2" mock={<AudioBars />}>
            <h3 className="feat-title">A coach you just talk to.</h3>
            <p className="feat-body">
              Tell Max what&apos;s going on — a rough day, a new goal, a plateau —
              and it rewrites your plan on the spot. No forms, no menus. Just talk.
            </p>
          </Card>
          {/* Privacy */}
          <Card mock={<PhoneLock />}>
            <h3 className="feat-title">Yours alone.</h3>
            <p className="feat-body">
              Your scans, photos, and progress are private by default. Never a
              feed, never sold.
            </p>
          </Card>

          {/* Scan */}
          <Card mock={<ScanMock />}>
            <h3 className="feat-title">Scan your potential.</h3>
            <p className="feat-body">
              Three photos and Max reads 25+ features — a rating, an appeal score,
              and exactly where your ceiling is.
            </p>
          </Card>
          {/* Today / daily plan */}
          <Card mock={<ArtifactMock />}>
            <h3 className="feat-title">A plan that fits your day.</h3>
            <p className="feat-body">
              Every max becomes a daily routine that reshuffles around your real
              schedule — so today always has a plan you&apos;ll actually do.
            </p>
          </Card>
          {/* Progress */}
          <Card mock={<StreakMock />}>
            <h3 className="feat-title">See it working.</h3>
            <p className="feat-body">
              Streaks, levels, and progress photos turn small daily wins into
              momentum you can feel.
            </p>
          </Card>

          {/* The engine: 50+ courses stacked + hyperpersonalized */}
          <Card className="md:col-span-3" mock={<CoursesMock />} row>
            <h3 className="feat-title">50+ courses, stacked and tuned to you.</h3>
            <p className="feat-body max-w-[52ch]">
              Stack skinmax, jawmax, hairmax, fitmax — as many as you want. Max
              distills 50+ looksmaxxing courses into one engine, hyperpersonalizes
              it to your scan and goals, and weaves every step into a single daily
              plan that fits the hours you actually have. A routine built for your
              face — not a generic checklist.
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
function StackMock() {
  const maxes = ["Skinmax", "Jawmax", "Hairmax", "Fitmax"];
  return (
    <div className="relative h-[60px] w-[150px]">
      {maxes.map((m, i) => (
        <span
          key={m}
          className="absolute left-1/2 rounded-[8px] border border-white/12 bg-white/[0.05] px-[12px] py-[5px] text-[11.5px] text-white/85 backdrop-blur"
          style={{
            top: `${i * 11}px`,
            transform: `translateX(-50%) translateX(${(i - 1.5) * 10}px)`,
            zIndex: maxes.length - i,
          }}
        >
          {m}
        </span>
      ))}
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
function PhoneLock() {
  return (
    <svg viewBox="0 0 48 60" className="h-[60px] w-auto" fill="none" stroke="white" strokeWidth="1.6">
      <rect x="6" y="3" width="36" height="54" rx="6" />
      <rect x="17" y="26" width="14" height="12" rx="2.5" fill="white" stroke="none" />
      <path d="M20 26v-3a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function ArtifactMock() {
  return (
    <div className="tr-artifact-in flex items-center gap-[12px]">
      <div className="rounded-[7px] border border-white/10 bg-white/[0.04] p-[8px]">
        <div className="text-[10px] text-white/40">Max</div>
        <div className="text-[12px] text-white/90">Evening set</div>
      </div>
      <span className="text-white/40">→</span>
      <div className="rounded-[7px] border border-white/10 bg-white/[0.04] p-[8px]">
        <div className="text-[10px] text-white/40">Routine</div>
        <div className="text-[11.5px] text-white/85">Jaw set</div>
        <div className="text-[11.5px] text-white/85">Posture</div>
        <div className="text-[11.5px] text-white/85">Lift</div>
      </div>
    </div>
  );
}
function PillsMock() {
  return (
    <div className="flex flex-col items-center gap-[7px]">
      {["Plan", "Coach", "Scan"].map((p) => (
        <span key={p} className="rounded-full border border-white/[0.12] bg-white/[0.04] px-[14px] py-[5px] text-[12px] text-white/85">
          {p}
        </span>
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
