"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="text-center">
        <h1 className="hero-title text-[clamp(4.5rem,16vw,12rem)] font-normal tracking-[-0.05em] leading-[0.85] select-none animate-fade-in text-black">
          max
        </h1>
        <p
          className="mt-6 text-[17px] md:text-lg text-muted max-w-sm mx-auto leading-relaxed animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          Your AI looksmaxxing coach.
          <br />
          Personalized advice, texted daily.
        </p>

        <div
          className="mt-10 flex flex-col items-center gap-3 animate-fade-in"
          style={{ animationDelay: "500ms" }}
        >
          <Link
            href="/early-access"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background pl-5 pr-2 py-2 text-[13px] font-medium shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] transition-all"
          >
            <span>Get Early Access</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-2.5 py-1 text-[11px] tracking-wide">
              <span className="opacity-60 line-through">$31.99</span>
              <span>$7.99/mo</span>
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted/80">
            Limited launch pricing
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in"
        style={{ animationDelay: "800ms" }}
      >
        <div className="animate-bounce-subtle">
          <svg
            className="w-4 h-4 text-muted/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
