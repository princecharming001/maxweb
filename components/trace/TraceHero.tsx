"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PLAN = [
  "Mewing hold",
  "Jaw + posture set",
  "Evening lift",
  "Skincare PM",
  "Cold shower",
  "Collagen + water",
  "Sunlight walk",
  "Sleep by 11",
];
const UPNEXT = [
  ["Mewing hold", "Now", false],
  ["Jaw + posture set", "6:00 PM", true],
  ["Evening lift", "7:15 PM", false],
  ["Skincare PM", "10:30 PM", false],
  ["Progress photo", "Sun", false],
] as const;

const BARS = [1.1, 1.4, 0.95, 1.55, 1.2, 1.35, 1.0, 1.5, 1.15];

export default function TraceHero() {
  const [phase, setPhase] = useState<"mic" | "bubble">("mic");
  // Gate the card entrance on mount so the blurResolve animation reliably
  // plays a beat after the hero paints (otherwise it can finish before the
  // user is looking, or not replay on client navigation).
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const tp = setTimeout(() => setPlay(true), 120);
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    const loop = () => {
      setPhase("mic");
      t1 = setTimeout(() => setPhase("bubble"), 3200);
      t2 = setTimeout(loop, 8000);
    };
    loop();
    return () => {
      clearTimeout(tp);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] overflow-hidden pt-[30px] pb-[43px]"
    >
      {/* Centered backlit portrait — h-[128%] w-auto, exactly like the target */}
      <img
        src="https://remindmetrace.com/hero.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[4%] h-[128%] w-auto max-w-none -translate-x-1/2 select-none object-fill"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fdfdfd] via-transparent to-[#fdfdfd]" />

      {/* Left glass card — 320px, at 5vw / top 32% */}
      <GlassCard className={`${play ? "tr-card-blur" : "opacity-0"} absolute left-[5vw] top-[32%] w-[320px]`}>
        <div className="mb-[12px] text-[11.5px] text-white/45">Today&apos;s plan</div>
        <ul className="space-y-[23px]">
          {PLAN.map((t) => (
            <li key={t} className="flex items-center gap-[10px]">
              <span className="size-[14px] shrink-0 rounded-full border border-white/30" />
              <span className="text-[14px] text-white/90">{t}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Right glass card — 360px, at 5vw / top 16% */}
      <GlassCard
        className={`${play ? "tr-card-blur" : "opacity-0"} absolute right-[5vw] top-[16%] w-[360px]`}
        style={{ animationDelay: "0.12s" }}
      >
        <div className="mb-[12px] text-[11.5px] text-white/45">Up next</div>
        <ul className="space-y-[29px]">
          {UPNEXT.map(([t, when, artifact]) => (
            <li key={t} className="flex items-start gap-[10px]">
              <span className="mt-[2px] size-[14px] shrink-0 rounded-full border border-white/30" />
              <div>
                <div className="text-[14px] text-white/90">{t}</div>
                <div className="mt-[3px] flex items-center gap-[6px]">
                  <span className="rounded-[4px] bg-[rgba(255,69,58,0.14)] px-[5.5px] py-[1.5px] text-[10.5px] text-[#ff453a]">
                    {when}
                  </span>
                  {artifact ? (
                    <span className="rounded-[4px] bg-[rgba(0,113,227,0.16)] px-[5.5px] py-[1.5px] text-[10.5px] text-[#6cb6ff]">
                      Artifact
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Bottom center — cycling mic visualizer ↔ coach bubble */}
      <div className="absolute inset-x-0 bottom-[9%] z-[3] flex justify-center px-4">
        {phase === "mic" ? (
          <div
            key="mic"
            className="flex h-[60px] items-center gap-[4px] rounded-[14px] border border-white/[0.08] bg-[rgba(15,16,18,0.72)] px-[20px] backdrop-blur-[24px] backdrop-saturate-[1.8]"
            style={{ animation: "micIn 0.45s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {BARS.map((d, i) => (
              <span
                key={i}
                className="block w-[2.8px] rounded-full bg-white/80"
                style={{ height: "60%", animation: `barPulse ${d}s ease-in-out ${i * 0.08}s infinite` }}
              />
            ))}
          </div>
        ) : (
          <div
            key="bubble"
            className="max-w-[460px] rounded-[14px] border border-white/[0.08] bg-[rgba(15,16,18,0.72)] px-[20px] py-[14px] text-center backdrop-blur-[24px] backdrop-saturate-[1.8]"
            style={{ animation: "bubbleIn 0.75s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <div className="mb-[4px] text-[11.5px] text-white/45">Max</div>
            <p className="text-[15px] leading-[1.4] text-white/90">
              Locked in your evening set and pushed your lift to 7:15 — you&apos;ll
              still hit your streak.
            </p>
          </div>
        )}
      </div>

      <h1 className="sr-only">Max — look your best, one day at a time.</h1>
      <Link href="/start" className="sr-only">
        Get started
      </Link>
    </section>
  );
}

function GlassCard({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`z-[2] rounded-[14px] border border-white/[0.08] bg-[rgba(15,16,18,0.72)] p-[14px] backdrop-blur-[24px] backdrop-saturate-[1.8] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
