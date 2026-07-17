"use client";

/**
 * ClayBadge — web port of the iOS AchievementBadge (matte-black clay 3D icons).
 *
 * iOS ships animated clay WebPs (a soft matte-black 3D object per achievement).
 * The web can't bundle those assets, so we replicate the look in pure CSS/SVG:
 *
 *   EARNED — a matte-black "clay" medallion (radial-lit dark disc + soft drop
 *            shadow) with a light embossed glyph. Mirrors the iOS earned state
 *            (ink-filled object, cream glyph) and reads as one deliberate set.
 *   LOCKED — a hairline ring (#D8D1C4) on the warm canvas with an optional ink
 *            progress arc, and the glyph dimmed back (muted, smaller) — 1:1 with
 *            the iOS locked state (ring + faded glyph + arc).
 *
 * Each achievement gets a UNIQUE glyph keyed by its `code` (falling back to the
 * `icon` family, then a medal), so no two badges look alike — same intent as the
 * iOS BADGE_BY_CODE map. `tier` is kept for parity but never recolors: the whole
 * strip is ink-on-cream.
 */

export type Tier = "bronze" | "silver" | "gold";

// Clay ink + warm canvas (matches iOS AchievementBadge).
const HAIRLINE = "#D8D1C4"; // locked ring on the cream canvas
const ARC = "#1C1A17"; // ink progress arc
const LOCKED_GLYPH = "#B4AB9C"; // dimmed glyph when locked
const CLAY_GLYPH = "#EFEBE3"; // warm cream glyph on the earned clay

// Per-achievement UNIQUE glyph, keyed by achievement code (preferred).
const GLYPH_BY_CODE: Record<string, string> = {
  first_routine: "spark",
  streak_3: "flame",
  streak_7: "bolt",
  streak_30: "diamond",
  streak_100: "crown",
  comeback: "phoenix",
  freeze_earned: "shield",
  perfect_day: "check",
  tasks_10: "leaf",
  tasks_50: "target",
  tasks_100: "mountain",
  two_maxxes: "layers",
  first_scan: "camera",
  three_scans: "photo",
  knows_me: "book",
  well_known: "key",
};

// Icon family → glyph (fallback when a code has no unique glyph).
const GLYPH_BY_ICON: Record<string, string> = {
  spark: "spark",
  flame: "flame",
  bolt: "bolt",
  diamond: "diamond",
  crown: "crown",
  phoenix: "phoenix",
  shield: "shield",
  check: "check",
  leaf: "leaf",
  target: "target",
  mountain: "mountain",
  layers: "layers",
  camera: "camera",
  photo: "photo",
  book: "book",
  key: "key",
};

/** The stroke/inner geometry for each glyph (24×24 viewBox, currentColor). */
function GlyphPaths({ name }: { name: string }) {
  switch (name) {
    case "spark":
      return (
        <>
          <path d="M12 3 13.7 8.3 19 10 13.7 11.7 12 17 10.3 11.7 5 10 10.3 8.3Z" />
          <path d="M18.5 14.5 19.2 16.4 21 17 19.2 17.6 18.5 19.5 17.8 17.6 16 17 17.8 16.4Z" />
        </>
      );
    case "flame":
      return (
        <path d="M12 2.5c2.5 3 4.5 5 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.6 .6-2.8 1.5-4 .3 1 .9 1.6 1.7 1.9C11 7.5 10.8 5 12 2.5z" />
      );
    case "bolt":
      return <path d="M11 2 4 14h6l-1 8 10-13h-6l1-7z" />;
    case "diamond":
      return (
        <>
          <path d="M6 3h12l3.5 6L12 21.5 2.5 9z" />
          <path d="M2.5 9h19M9 3l3 6 3-6M12 9v12.5" />
        </>
      );
    case "crown":
      return <path d="M3 8 6.5 11 12 5 17.5 11 21 8 19.2 18 4.8 18Z" />;
    case "phoenix":
      return (
        <>
          <path d="M12 3c1.8 2.5 3.5 4.2 3.5 7a3.5 3.5 0 0 1-7 0c0-1.2 .4-2.1 1-3 .2 .8 .7 1.2 1.3 1.4C11.2 6.7 11 5 12 3z" />
          <path d="M8 15l4 6 4-6" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3l7 2.5v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V5.5z" />
          <path d="M9 12l2 2 4-4.5" />
        </>
      );
    case "check":
      return (
        <>
          <path d="M2.5 12.5l4 4 8-9" />
          <path d="M10 15.5l1 1 8-9" />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M4 20c0-8 6-14 16-15 1 8-4 15-13 15-1 0-2-.2-3-.5" />
          <path d="M4 20c3-4 7-6 11-7" />
        </>
      );
    case "target":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </>
      );
    case "mountain":
      return <path d="M2.5 19.5 9.5 6.5 14 14.5 16.5 10.5 21.5 19.5Z" />;
    case "layers":
      return (
        <>
          <path d="M12 3 3 8l9 5 9-5z" />
          <path d="M3 12l9 5 9-5M3 16l9 5 9-5" />
        </>
      );
    case "camera":
      return (
        <>
          <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="13" r="3.3" />
        </>
      );
    case "photo":
      return (
        <>
          <rect x="3" y="4" width="18" height="15" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.8" />
          <path d="M21 15l-4.5-4.5L6 21" />
        </>
      );
    case "book":
      return (
        <>
          <path d="M6 3.5h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1-1.5z" />
          <path d="M9 3.5V20" />
        </>
      );
    case "key":
      return (
        <>
          <circle cx="8" cy="8" r="4.5" />
          <path d="M11.2 11.2 20 20M17 17l2-2M14.5 14.5l2-2" />
        </>
      );
    default: // medal
      return (
        <>
          <circle cx="12" cy="9" r="5.5" />
          <path d="M8.5 13.5 7 21l5-2.8 5 2.8-1.5-7.5" />
        </>
      );
  }
}

export default function ClayBadge({
  icon,
  code,
  earned,
  size = 74,
  progress,
}: {
  icon: string;
  /** Achievement code — preferred for a unique per-achievement glyph. */
  code?: string;
  /** Kept for parity with iOS; does not recolor. */
  tier?: Tier;
  earned: boolean;
  size?: number;
  /** 0..1 fill toward earning, shown as an arc on locked badges only. */
  progress?: number | null;
}) {
  const name =
    (code && GLYPH_BY_CODE[code]) || GLYPH_BY_ICON[icon] || "medal";

  if (earned) {
    // Matte-black clay medallion + embossed cream glyph.
    const glyph = Math.round(size * 0.46);
    return (
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background:
            "radial-gradient(120% 120% at 32% 26%, #4a4a4d 0%, #26262a 40%, #151517 74%, #0d0d0f 100%)",
          boxShadow:
            "inset 0 2px 3px rgba(255,255,255,0.22), inset 0 -7px 12px rgba(0,0,0,0.55), 0 8px 15px rgba(17,17,19,0.30), 0 2px 4px rgba(17,17,19,0.22)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={glyph}
          height={glyph}
          fill="none"
          stroke={CLAY_GLYPH}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.55))" }}
        >
          <GlyphPaths name={name} />
        </svg>
      </div>
    );
  }

  // Locked — hairline ring (+ ink progress arc) with a dimmed glyph.
  const c = size / 2;
  const ringW = Math.max(2, size * 0.04);
  const r = c - ringW / 2 - 1;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, progress ?? 0));
  const glyph = Math.round(size * 0.4);
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <circle cx={c} cy={c} r={r} fill="none" stroke={HAIRLINE} strokeWidth={ringW} />
        {pct > 0 ? (
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={ARC}
            strokeWidth={ringW}
            strokeLinecap="round"
            strokeDasharray={`${circ * pct} ${circ}`}
            transform={`rotate(-90 ${c} ${c})`}
          />
        ) : null}
      </svg>
      <svg
        viewBox="0 0 24 24"
        width={glyph}
        height={glyph}
        fill="none"
        stroke={LOCKED_GLYPH}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative"
      >
        <GlyphPaths name={name} />
      </svg>
    </div>
  );
}
