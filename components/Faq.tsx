"use client";

import { useState } from "react";
import { Display } from "./ui";

const ITEMS = [
  {
    q: "What happens to our domain and reputation?",
    a: "Nothing, by design. Low volume, top ranks only, every message grounded in your knowledge base, and your team sees everything before it sends. Most AI outreach died by deliverability because it optimized for volume. We optimize for the handful of buyers most likely to close this quarter.",
  },
  {
    q: "Is this scraped data?",
    a: "No scraped lists. Clean walks your team's real LinkedIn graph and public buying signals, and surfaces the buyers you already share a path to. Warm paths convert. Cold CSVs don't.",
  },
  {
    q: "Will it sound like us?",
    a: "It writes like your team because it learned from your team. Clean is indexed on your calls, docs, and closed deals before it talks to anyone, and it keeps learning from every reply.",
  },
  {
    q: "Why not Clay or Apollo?",
    a: "Clay is a power tool that needs a GTM engineer. Apollo is a database. Clean is the motion: leads found in your network, profiled against 75 signals for under a dollar, ranked, and worked. Your team stays the closer.",
  },
  {
    q: "Is this another AI SDR?",
    a: "No. AI SDRs automate volume. Clean learns how your company sells and builds you a channel: the right buyers, profiled deeply, approached warm, with everything grounded in what your company knows.",
  },
  {
    q: "How fast is this live?",
    a: "One demo call. Indexed in a day. Replies in your pipeline inside a week.",
  },
  {
    q: "How do we get access?",
    a: "Book a demo. The closed beta takes on a few teams at a time.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-paper paper-grain py-24 sm:py-32">
      <div className="mx-auto w-full max-w-[920px] px-6">
        <h2 className="font-display text-ink text-[clamp(40px,5.5vw,72px)] leading-[1.02] tracking-[-0.015em]">
          <Display lines={[{ text: "The questions" }]} />
          <br />
          <Display lines={[{ text: "before the call.", italic: true }]} />
        </h2>

        <div className="border-paper-edge mt-14 border-t">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-paper-edge border-b">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-mona text-ink text-[19px]">
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 text-[20px] leading-none text-[#5eb1ff] transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-mona text-ink-2 max-w-[62ch] pr-12 pb-6 text-[18px] leading-[1.5]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
