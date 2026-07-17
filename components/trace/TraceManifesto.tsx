"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const FOUNDER = {
  name: "Sameer Bicha",
  role: "Founder",
  photo: "/founders/sameer-bicha.jpg",
  initials: "SB",
};

const NOTE = [
  "Max started with a simple frustration: the looksmaxxing advice was all out there, but none of it was built for you.",
  "There are 50+ courses telling you what to do — then leaving you to guess when, how, and whether any of it even fits your face or your week. Most people stall out, not from lack of effort, but from following a plan that was never theirs.",
  "So we built one engine that reads the best of those courses and rebuilds them around you: your scan, your goals, your real schedule. Every step is hyperpersonalized, and it reshuffles the moment your day changes.",
  "Your progress shouldn't be scattered across a dozen apps and a camera roll. Max is the one place that holds the plan, the coaching, and the proof — tuned to you, so you stop guessing and start seeing change.",
];

/** Founder / manifesto section. */
export default function TraceManifesto() {
  return (
    <section id="manifesto" className="relative bg-white py-[220px] text-[#0f1012]">
      <div className="mx-auto max-w-[1200px] px-[4.8vw]">
        <Reveal>
          <div className="text-center">
            <h2 className="text-[clamp(32px,5vw,44px)] font-light leading-[1.05] tracking-[-0.02em]">
              Why we built Max.
            </h2>
            <p className="mt-[12px] text-[15px] text-[#0f1012]/45">
              A note from the founder.
            </p>
          </div>
        </Reveal>

        <div className="mt-[80px] grid gap-[60px] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <Reveal>
            <div>
              <FounderPhoto />
              <div className="mt-[20px] text-[22px] leading-tight">{FOUNDER.name}</div>
              <div className="mt-[4px] text-[13.5px] text-[#0f1012]/45">{FOUNDER.role}</div>
              <div className="mt-[16px] flex gap-[14px] text-[13.5px] text-[#0f1012]/55">
                <span className="cursor-pointer hover:text-[#0f1012]">LinkedIn</span>
                <span className="cursor-pointer hover:text-[#0f1012]">X</span>
                <span className="cursor-pointer hover:text-[#0f1012]">Instagram</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="space-y-[16px]">
              {NOTE.map((p, i) => (
                <p
                  key={i}
                  className={`text-[17px] leading-[1.5] ${
                    i === NOTE.length - 1 ? "text-[#0f1012]" : "text-[#0f1012]/55"
                  }`}
                >
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Founder portrait with a graceful initials fallback if the photo is missing. */
function FounderPhoto() {
  const [ok, setOk] = useState(true);
  return (
    <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-[20px] bg-[#0f1012]/[0.06]">
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={FOUNDER.photo}
          alt={FOUNDER.name}
          className="absolute inset-0 size-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-[42px] text-[#0f1012]/30">
          {FOUNDER.initials}
        </div>
      )}
    </div>
  );
}
