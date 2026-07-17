import Link from "next/link";
import type { ReactNode } from "react";

// The primary CTA now opens the Max web app's onboarding instead of a demo.
export const DEMO_URL = "/start";
export const SIGNIN_URL = "/login";

/** Arrow glyph used inside every CTA. */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * White pill with a dark circular arrow badge — the header's "Get started".
 * Padding is asymmetric (24px lead, 12px trail) so the badge sits flush.
 */
export function PillButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group cta-press inline-flex items-center gap-3 rounded-full bg-white py-3 pr-3 pl-6 text-[#0f1115] hover:scale-[1.02]"
    >
      <span className="label-mono">{children}</span>
      <span className="flex size-6 items-center justify-center rounded-full bg-[#0f1115] text-white">
        <Arrow className="size-3.5" />
      </span>
    </Link>
  );
}

/** Translucent glass CTA used over photography (hero + closing card). */
export function GlassButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group cta-press inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-[14px] font-medium text-white ring-1 ring-white/25 backdrop-blur-md hover:bg-white/25"
    >
      {children}
      <Arrow className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/**
 * Display headline. The target sets the emphasised run in Instrument Serif's
 * italic cut rather than a different family, so `italic` marks that run.
 */
export function Display({
  lines,
  className = "",
}: {
  lines: { text: string; italic?: boolean }[];
  className?: string;
}) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className={l.italic ? "italic" : undefined}>
          {l.text}
          {i < lines.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/** Section eyebrow + heading + lede, centred or left-aligned. */
export function SectionIntro({
  children,
  lede,
  align = "center",
}: {
  children: ReactNode;
  lede?: string;
  align?: "center" | "left";
}) {
  // Centred intros run a size larger than the left-aligned column intros.
  const isCenter = align === "center";
  const h2 = isCenter
    ? "text-[clamp(46px,8vw,88px)] leading-[1.0]"
    : "text-[clamp(40px,6vw,72px)] leading-[1.02]";
  const p = isCenter
    ? "mx-auto mt-10 max-w-[46ch] text-[clamp(15px,1.6vw,19px)] leading-[1.45]"
    : "mt-6 max-w-[44ch] text-[clamp(15px,1.5vw,18px)] leading-[1.55]";

  return (
    <div className={isCenter ? "text-center" : "text-left"}>
      <h2 className={`font-display text-ink tracking-[-0.01em] ${h2}`}>
        {children}
      </h2>
      {/* Section ledes are Mona Sans in ink-soft — not the body Inter. */}
      {lede ? <p className={`font-mona text-ink-soft ${p}`}>{lede}</p> : null}
    </div>
  );
}
