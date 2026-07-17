"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "ghost" | "danger";

const VARIANT: Record<Variant, string> = {
  primary: "bg-mx-ink text-white hover:opacity-90",
  accent: "bg-mx-accent text-white hover:brightness-110",
  ghost:
    "bg-transparent text-mx-ink ring-1 ring-inset ring-mx-border hover:bg-mx-surface",
  danger: "bg-mx-error text-white hover:brightness-110",
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizing =
    size === "lg"
      ? "h-12 px-6 text-[15px]"
      : size === "sm"
        ? "h-9 px-3.5 text-[13px]"
        : "h-11 px-5 text-[14px]";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-mx-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${sizing} ${VARIANT[variant]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  full,
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const sizing =
    size === "lg"
      ? "h-12 px-6 text-[15px]"
      : size === "sm"
        ? "h-9 px-3.5 text-[13px]"
        : "h-11 px-5 text-[14px]";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-mx-md font-medium transition ${sizing} ${VARIANT[variant]} ${full ? "w-full" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`bg-mx-card rounded-mx-lg border border-mx-border shadow-mx-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mx-label">{children}</div>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-mx-ink-2 mb-1.5 block text-[13px] font-medium">
        {label}
      </span>
      {children}
      {hint ? <span className="text-mx-muted mt-1 block text-[12px]">{hint}</span> : null}
    </label>
  );
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string },
) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`bg-mx-surface-light text-mx-ink placeholder:text-mx-muted h-11 w-full rounded-mx-md border border-mx-border px-3.5 text-[15px] outline-none transition focus:border-mx-accent focus:ring-2 focus:ring-mx-accent-muted ${className}`}
      {...rest}
    />
  );
}

export function Spinner({ className = "size-5" }: { className?: string }) {
  return (
    <span
      className={`border-mx-accent inline-block animate-spin rounded-full border-2 border-t-transparent ${className}`}
      aria-label="Loading"
    />
  );
}

/** A ring gauge (RATING / streak / XP) — the SVG port of the iOS MetricRing. */
export function MetricRing({
  value,
  max = 100,
  size = 96,
  stroke = 8,
  color = "var(--mx-accent)",
  track = "var(--mx-border-light)",
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: ReactNode;
  sublabel?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label ? (
          <span className="font-mx-serif text-mx-ink text-[24px] leading-none">
            {label}
          </span>
        ) : null}
        {sublabel ? (
          <span className="text-mx-muted mt-0.5 text-[10px]">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
