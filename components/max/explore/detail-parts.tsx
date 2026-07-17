"use client";

/**
 * Leaf UI + helpers for the Explore detail page — a faithful web port of the
 * iOS MaxDetailScreen sub-components (Monogram, Stars, Accordion, the creator
 * stats grid, and the small icon set). Colours come from the item's brand
 * colour; everything else maps to the mx-* theme tokens.
 */
import type { ReactNode } from "react";
import type { MarketplaceItem } from "@/lib/max/api";

/* ── Loose runtime extensions the web MarketplaceItem type doesn't declare ── */
export type ExItem = MarketplaceItem & {
  /** True when this card is a first-class creator maxx (mobile: isCreatorMaxx). */
  creator_maxx?: boolean;
  published_lesson_count?: number;
  habit_count?: number;
};
/** Creator-maxx daily-program row (richer than the web detail.habits type). */
export type ExHabit = {
  title: string;
  time?: string;
  description?: string;
  icon?: string;
  duration_minutes?: number;
  frequency?: { type: "daily" | "n_per_week"; n?: number };
  window?: "morning" | "evening" | "any" | string;
};

/* ── Colour + number helpers (ports of mobile hexA / fmtK) ─────────────── */
export function hexA(hex: string, a: number): string {
  const h = (hex || "#000000").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function fmtK(n?: number): string {
  if (!n) return "";
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`;
}

/** "12m · daily · morning" — the right-hand meta line for a daily-program row. */
export function habitMetaLine(h: ExHabit): string {
  const parts: string[] = [];
  if (h.duration_minutes) parts.push(`${h.duration_minutes}m`);
  const f = h.frequency;
  if (f) parts.push(f.type === "n_per_week" && f.n ? `${f.n}×/wk` : "daily");
  else if (!h.duration_minutes && h.time) return h.time;
  if (h.window && h.window !== "any") parts.push(h.window);
  return parts.join(" · ") || h.time || "daily";
}

/* ── Icons (inline SVG, currentColor) ──────────────────────────────────── */
type IconProps = { className?: string; color?: string };

export function IconCheck({ className = "size-4", color }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
export function IconChevron({ open, className = "size-4", color }: IconProps & { open?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {open ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
    </svg>
  );
}
export function IconLock({ className = "size-4", color }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
export function IconPlay({ className = "size-4", color }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4z" fill={color ?? "currentColor"} stroke="none" />
    </svg>
  );
}
export function IconShield({ className = "size-4", color }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
export function IconArrowRight({ className = "size-4", color }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function IconBook({ className = "size-4", color }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </svg>
  );
}
export function IconStar({ filled, className = "size-3.5", color = "#E0A500" }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? color : "none"} stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" />
    </svg>
  );
}
export function IconVerified({ className = "size-4", color }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color ?? "currentColor"} aria-hidden>
      <path d="M12 2 9.8 4.2 6.7 4l-1 3-3 1 1.3 2.9-1.3 3 3 1 1 3 3.1-.2L12 22l2.2-2.2 3.1.2 1-3 3-1-1.3-3 1.3-2.9-3-1-1-3-3.1.2z" />
      <path d="m8.5 12 2.2 2.2L15.5 9.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Monogram — brand-tinted serif initial (replaces every avatar) ─────── */
export function Monogram({ name, color, size = 42 }: { name?: string; color: string; size?: number }) {
  const ch = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className="font-mx-serif inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: hexA(color, 0.14),
        border: `1px solid ${hexA(color, 0.42)}`,
        color,
        fontSize: Math.round(size * 0.44),
        lineHeight: 1,
      }}
    >
      <span style={{ marginTop: -1 }}>{ch}</span>
    </span>
  );
}

/* ── Star row ──────────────────────────────────────────────────────────── */
export function Stars({ n, className }: { n: number; className?: string }) {
  return (
    <span className={`inline-flex gap-px ${className ?? ""}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar key={i} filled={i <= Math.round(n)} />
      ))}
    </span>
  );
}

/* ── Accordion — matches the iOS Accordion (title, optional badge, chevron) */
export function Accordion({
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string;
  badge?: string;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="border-mx-border border-b">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 py-[15px] text-left"
      >
        <span className="text-mx-ink flex-1 text-[15px] font-semibold">{title}</span>
        {badge ? (
          <span className="text-mx-accent text-[11px] font-semibold">{badge}</span>
        ) : null}
        <IconChevron open={open} className="text-mx-muted size-4" />
      </button>
      {open ? <div className="space-y-2.5 pb-[15px]">{children}</div> : null}
    </div>
  );
}

/* ── Creator-maxx stats grid (Lessons / Updates / Members-or-Daily habits) */
export function StatsGridCreator({ item, postCount }: { item: ExItem; postCount?: number | null }) {
  const lessons = item.published_lesson_count ?? 0;
  const members = item.participants ?? 0;
  const stats: { value: string; label: string }[] = [
    { value: lessons ? String(lessons) : "—", label: "Lessons" },
    { value: postCount != null ? String(postCount) : "—", label: "Updates" },
    members >= 10
      ? { value: fmtK(members) || "—", label: "Members" }
      : { value: item.habit_count ? String(item.habit_count) : "—", label: "Daily habits" },
  ];
  return (
    <div className="bg-mx-card rounded-mx-lg border-mx-border flex border py-[18px]">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-1 flex-col items-center ${i < stats.length - 1 ? "border-mx-border border-r" : ""}`}
        >
          <span className="font-mx-serif text-mx-ink text-[26px] tracking-[-0.5px]">{s.value}</span>
          <span className="text-mx-muted mt-[5px] text-[11px] font-medium uppercase tracking-[0.3px]">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Section wrapper — label + body, matches the iOS `block` spacing ───── */
export function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <div className="text-mx-ink mb-[15px] text-[13.5px] font-semibold">{label}</div>
      {children}
    </section>
  );
}
