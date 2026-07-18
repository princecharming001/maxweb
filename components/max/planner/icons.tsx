/**
 * Inline SVG glyphs for the planner top bar (no Apple emoji / icon fonts).
 * Stroke follows `currentColor` so the buttons can tint them via text color.
 */
import type { SVGProps } from "react";

const base = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="3" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v4M16 2.5v4" />
    </svg>
  );
}

export function RepeatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M17 2.5l3.5 3.5-3.5 3.5" />
      <path d="M3.5 11.5V10a4 4 0 014-4h13" />
      <path d="M7 21.5L3.5 18 7 14.5" />
      <path d="M20.5 12.5V14a4 4 0 01-4 4h-13" />
    </svg>
  );
}

export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M20.5 11.5a7.5 7.5 0 01-10.9 6.7L4 19.5l1.3-4.1A7.5 7.5 0 1120.5 11.5z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
