"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Display, SectionIntro } from "./ui";

function SignalCard({
  logo,
  name,
  time,
  body,
  className = "",
}: {
  logo: string;
  name: string;
  time: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={`border-edge/60 sig-in w-[290px] rounded-xl border bg-[#1a1b1e] p-3.5 shadow-xl shadow-black/40 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-white/10 text-[10px]">
          {logo}
        </span>
        <span className="font-sans text-ink text-[13px]">{name}</span>
        <span className="font-body text-ink-4 ml-auto text-[11px]">{time}</span>
      </div>
      <p className="font-body text-ink-2 mt-2.5 text-[12px] leading-relaxed">
        {body}
      </p>
    </div>
  );
}

/**
 * "Clean is thinking…" agent trace. The target plays this as a staged loop
 * (~10s): each step fades up in order, the finished trace holds a beat,
 * then the sequence clears and replays. The step count gates rendering so
 * the animation runs fresh each cycle.
 */
export default function RealSignal() {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  // Only run the loop while the section is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setLive(e.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      // 6 build steps, then ~2 ticks of hold before the reset.
      setStep((s) => (s >= 8 ? 0 : s + 1));
    }, 1150);
    return () => clearInterval(id);
  }, [live]);

  return (
    <section className="bg-paper paper-grain relative w-full overflow-hidden">
      <div
        ref={ref}
        className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20"
      >
        <SectionIntro
          align="left"
          lede="Clean reads the open web in real time and catches what each company is doing: raising, hiring, shipping, so you reach out to the right person at exactly the right time."
        >
          <Display lines={[{ text: "No static database." }]} />
          <br />
          <Display lines={[{ text: "Real", italic: true }, { text: "signal." }]} />
        </SectionIntro>

        {/* Agent trace — steps gated by the loop counter. Fixed height so
            the section doesn't reflow as steps appear (matches target). */}
        <div className="relative min-h-[600px]">
          <p className="font-body text-ink-2 flex items-center gap-2 text-[13px]">
            <span className="sig-dot size-1.5 rounded-full bg-[#5eb1ff]" />
            Clean is thinking…
          </p>

          {step >= 1 && (
            <p className="font-body text-ink-4 sig-in mt-4 ml-4 flex items-center gap-2 text-[12px]">
              <span className="size-1 rounded-full bg-white/30" />
              Scanning corporate spend: press, job boards, filings…
            </p>
          )}

          {step >= 2 && (
            <SignalCard
              logo="B"
              name="Brex"
              time="2m ago"
              body="Launched embedded payments for enterprises."
              className="mt-4 ml-4"
            />
          )}
          {step >= 3 && (
            <SignalCard
              logo="M"
              name="Mercury"
              time="3h ago"
              body="Raised a $300M Series C at a $3.5B valuation."
              className="-mt-6 ml-auto"
            />
          )}

          {step >= 4 && (
            <p className="font-body text-ink-4 sig-in mt-8 ml-4 flex items-center gap-2 text-[12px]">
              <span className="size-1 rounded-full bg-white/30" />
              Ramp is moving fastest. Reading ramp.com…
            </p>
          )}

          {step >= 5 && (
            <div className="border-edge/60 sig-in mt-4 ml-4 w-[360px] rounded-xl border bg-[#1a1b1e] p-3.5 shadow-xl shadow-black/40">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-md bg-[#f5e14b] text-[11px] text-black">
                  R
                </span>
                <div>
                  <div className="font-sans text-ink text-[13px]">Ramp</div>
                  <div className="font-body text-ink-4 text-[10px]">
                    ramp.com
                  </div>
                </div>
                <div className="ml-auto flex gap-1.5">
                  {["Fintech", "1000+"].map((t) => (
                    <span
                      key={t}
                      className="font-body text-ink-2 rounded bg-white/[0.08] px-2 py-0.5 text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-edge/50 mt-3 border-t pt-2.5">
                <p className="font-body text-ink-4 text-[11px]">This week</p>
                <div className="mt-1.5 space-y-1.5">
                  {[
                    ["Shipped AI agents for expense review", "6h", "#71b89a"],
                    ["Opened 12 sales roles in New York", "2d", "#d9b03a"],
                  ].map(([t, when, c]) => (
                    <div key={t} className="flex items-center gap-2">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: c }}
                      />
                      <span className="font-body text-ink-2 text-[12px]">
                        {t}
                      </span>
                      <span className="font-body text-ink-4 ml-auto text-[10px]">
                        {when}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step >= 6 && (
            <div className="border-edge/60 sig-in -mt-4 ml-auto w-[300px] rounded-xl border bg-[#1a1b1e] p-3 shadow-xl shadow-black/40">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#71b89a]">✓</span>
                <span className="font-body text-[11px] text-[#71b89a]">
                  Found a perfect lead for your company
                </span>
                <span className="font-body text-ink-4 ml-auto text-[10px]">
                  just now
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2.5">
                <Image
                  src="https://www.tryclean.ai/faces/american-man.png"
                  alt=""
                  width={26}
                  height={26}
                  className="size-[26px] rounded-full object-cover"
                  unoptimized
                />
                <div>
                  <div className="font-sans text-ink text-[12px]">
                    Max Freeman
                  </div>
                  <div className="font-body text-ink-4 text-[10px]">
                    SVP of Sales, Ramp · added to your list
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
