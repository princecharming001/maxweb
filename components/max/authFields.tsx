/** Password show/hide glyph shared by the Login + Signup screens. */
export function EyeIcon({ off }: { off: boolean }) {
  const common = {
    className: "size-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (off) {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 3l18 18M10.6 5.1A9.9 9.9 0 0 1 12 5c5 0 9 4.5 9 7 0 1-1 2.6-2.7 4M6.6 6.6C4.3 8 3 10 3 12c0 2.5 4 7 9 7 1.5 0 2.9-.4 4.1-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
