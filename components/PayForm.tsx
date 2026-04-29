"use client";

import Link from "next/link";

export default function PayForm() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-background py-16 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-foreground/[0.04] blur-3xl animate-soft-float-delayed" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block text-xl font-bold tracking-tighter text-foreground hover:opacity-70 transition-opacity"
          >
            max
          </Link>
        </div>

        <div className="bg-white/80 border border-white/60 rounded-3xl px-8 py-10 shadow-[0_20px_70px_rgba(0,0,0,0.07)] backdrop-blur-xl animate-fade-in-up">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Register &amp; pay
          </h1>
          <p className="mt-2 text-muted text-[14px] text-center leading-relaxed">
            We&apos;re rolling out this flow right now.
          </p>
          <div className="mt-8 rounded-2xl border border-border/50 bg-background/80 px-6 py-9 text-center">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted/70">
              Status
            </p>
            <p className="mt-4 text-[clamp(1.8rem,5vw,2.2rem)] font-semibold tracking-[-0.03em] text-foreground">
              Coming this week
            </p>
            <p className="mt-3 text-[14px] text-muted leading-relaxed">
              Registration and checkout open shortly.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[13px] text-muted">
          <Link href="/" className="text-foreground font-medium hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
