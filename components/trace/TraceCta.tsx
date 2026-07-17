"use client";

import Link from "next/link";
import Reveal from "./Reveal";

/** Closing CTA — dark section (geometry cloned; wired to the Max app). */
export default function TraceCta() {
  return (
    <section className="relative bg-[#0a0a0a] py-[220px] text-white">
      <div className="mx-auto max-w-[1200px] px-[4.8vw] text-center">
        <Reveal>
          <h2 className="mx-auto max-w-[18ch] text-[clamp(34px,5.5vw,50px)] font-light leading-[1.05] tracking-[-0.02em]">
            Start looking your best today.
          </h2>
          <p className="mx-auto mt-[20px] max-w-[46ch] text-[16px] leading-[1.45] text-white/50">
            Answer a few questions and Max builds your plan, your coach, and your
            baseline — free to start.
          </p>
          <div className="mt-[32px] flex items-center justify-center gap-[10px]">
            <Link
              href="/start"
              className="inline-flex h-[50px] items-center rounded-[10px] bg-white px-[24px] text-[16px] text-[#0a0a0a] transition-transform hover:scale-[1.02]"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex h-[50px] items-center rounded-[10px] border border-white/15 px-[24px] text-[16px] text-white/80 transition-colors hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
