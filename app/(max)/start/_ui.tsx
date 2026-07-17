"use client";

/**
 * Shared funnel primitives — a faithful web port of the iOS OnboardingV2 /
 * ScanOffer visual system (Cal AI × Stoic): soft gray canvas, white soft-shadow
 * pill cards, black-fill selection, a thin top progress bar with a back chevron
 * in a white circle, and a compact centered black "Continue" pill.
 *
 * No external icon dep and no emoji (house rule) — every glyph is an inline
 * stroke SVG, colored by `currentColor` so cards can flip label + icon to white
 * on the black selected state.
 */
import type { ReactNode } from "react";

// ── Inline icon set (Ionicons-style line glyphs) ───────────────────────────
const PATHS: Record<string, ReactNode> = {
  "chevron-left": <path d="M15 6l-6 6 6 6" />,
  check: <path d="M5 12.5 10 17l9-10" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.4l2.4 2.4 4.6-5" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="9" />,
  // goals
  sparkles: (
    <>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
      <path d="M18.5 15l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" />
    </>
  ),
  barbell: <path d="M4 9v6M7 7.5v9M17 7.5v9M20 9v6M7 12h10" />,
  cut: (
    <>
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="6" cy="17" r="2.2" />
      <path d="M8 8.4 20 18M8 15.6 20 6" />
    </>
  ),
  resize: <path d="M12 4v16M8.5 7.5 12 4l3.5 3.5M8.5 16.5 12 20l3.5-3.5" />,
  body: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </>
  ),
  // schedule
  bed: <path d="M3 9v9M21 18v-4a3 3 0 00-3-3H3M3 15h18" />,
  repeat: (
    <>
      <path d="M4 10V9a3 3 0 013-3h10M20 14v1a3 3 0 01-3 3H7" />
      <path d="M14 3l3 3-3 3M10 21l-3-3 3-3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M19.1 4.9l-1.5 1.5M6.4 17.6l-1.5 1.5" />
    </>
  ),
  moon: <path d="M21 13A8.5 8.5 0 1111 3a6.5 6.5 0 0010 10z" />,
  water: <path d="M12 3s6 6.4 6 10.5A6 6 0 016 13.5C6 9.4 12 3 12 3z" />,
  briefcase: (
    <>
      <rect x="3" y="8" width="18" height="11" rx="2" />
      <path d="M8 8V6.5A2.5 2.5 0 0110.5 4h3A2.5 2.5 0 0116 6.5V8M3 13h18" />
    </>
  ),
  car: (
    <>
      <path d="M5 12l1.4-4.2A2 2 0 018.3 6.5h7.4a2 2 0 011.9 1.3L19 12" />
      <rect x="3" y="12" width="18" height="5" rx="1.5" />
      <path d="M7 17v1.5M17 17v1.5" />
    </>
  ),
  cafe: (
    <>
      <path d="M4 8h13v4a5 5 0 01-5 5H9a5 5 0 01-5-5z" />
      <path d="M17 9h1.5a2.5 2.5 0 010 5H17" />
      <path d="M7 3v2M11 3v2" />
    </>
  ),
  restaurant: (
    <>
      <path d="M7 3v6M10 3v6M8.5 9v12" />
      <path d="M16.5 3C15 4 14.5 6.5 14.5 8.5c0 1.7.8 2.5 2 2.5V21" />
    </>
  ),
  wine: (
    <>
      <path d="M8 3h8l-.6 5.5a3.4 3.4 0 01-6.8 0z" />
      <path d="M12 15v5M9 20h6" />
    </>
  ),
};

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
  className = "",
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? null}
    </svg>
  );
}

// ── Top row: back chevron in a white circle · thin funnel progress bar ──────
export function FunnelHeader({
  progress,
  showBack,
  onBack,
}: {
  progress: number; // 0–100
  showBack: boolean;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3.5 pt-1">
      {showBack ? (
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-mx-ink shadow-mx-sm"
        >
          <Icon name="chevron-left" size={22} strokeWidth={2} />
        </button>
      ) : (
        <div className="size-9 shrink-0" />
      )}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e2e1de]">
        <div
          className="h-full rounded-full bg-mx-ink transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ── Centered bold sans title (iOS Matter-Bold, NOT serif) + muted subhead ───
export function StepHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="w-full">
      <h1 className="font-mx-sans text-mx-ink text-center text-[30px] font-bold leading-9 tracking-[-0.6px] whitespace-pre-line">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-[340px] text-center text-[15px] leading-[21px] text-[#6b6b6b]">
        {sub}
      </p>
    </div>
  );
}

// ── Compact, centered black "Continue" pill; solid gray when inactive ───────
export function ContinueButton({
  label,
  onClick,
  disabled = false,
  loading = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex justify-center pt-2">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="flex h-14 min-w-[200px] items-center justify-center rounded-full bg-mx-ink px-14 text-[16px] font-semibold tracking-[0.2px] text-white shadow-mx-md transition disabled:bg-[#dad9d6] disabled:text-[#a4a29d] disabled:shadow-none"
      >
        {loading ? "…" : label}
      </button>
    </div>
  );
}

// ── Stoic switch — black when on, gray when off ─────────────────────────────
export function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-mx-ink" : "bg-[#e2e1de]"}`}
    >
      <span
        className={`absolute top-[3px] size-[22px] rounded-full bg-white shadow transition-all ${on ? "left-[23px]" : "left-[3px]"}`}
      />
    </button>
  );
}
