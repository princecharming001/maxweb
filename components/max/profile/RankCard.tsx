"use client";

/**
 * Rank card — web port of the mobile XpProgressCard. Shows the earned RANK
 * (serif), current level, an olive-branch mark, a progress track toward the
 * next level, and the XP line. Fed by getActiveSchedulesFull().gamification.
 *
 * NOTE: the web lib/max/api.ts `Gamification` type is a stale, loose port
 * (it types `rank` as a number). The real backend — the SAME one iOS talks to —
 * returns the rank shape below (rank is a name string like "Mortal"). The page
 * casts through `unknown` into this type, so we own the field contract here.
 */
const GOLD = "#C29A4E"; // muted editorial gold (matches mobile XpProgressCard)
const TRACK = "#E4E3E0"; // warm progress track

export type RankGamification = {
  current_level?: number;
  rank?: string;
  xp_into_level?: number;
  xp_for_next_level?: number;
  xp_earned_today?: number;
  is_max_level?: boolean;
  streak_multiplier?: number;
};

/** Inline olive-branch illustration in a warm beige — no external asset. */
function OliveBranch() {
  const beige = "#C9BFA8";
  return (
    <svg
      viewBox="0 0 72 72"
      className="size-16 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      {/* stem */}
      <path
        d="M13 61 C 26 48, 41 35, 58 12"
        stroke={beige}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* leaves — paired along the stem */}
      <g fill={beige}>
        <ellipse cx="20" cy="52" rx="7.4" ry="3.1" transform="rotate(-40 20 52)" />
        <ellipse cx="29" cy="43" rx="7.6" ry="3.2" transform="rotate(-46 29 43)" />
        <ellipse cx="31" cy="42" rx="6.6" ry="2.9" transform="rotate(26 31 42)" />
        <ellipse cx="39" cy="33" rx="7.6" ry="3.2" transform="rotate(-48 39 33)" />
        <ellipse cx="41" cy="32" rx="6.6" ry="2.9" transform="rotate(22 41 32)" />
        <ellipse cx="49" cy="23" rx="7.4" ry="3.1" transform="rotate(-52 49 23)" />
        <ellipse cx="51" cy="21" rx="6.2" ry="2.7" transform="rotate(18 51 21)" />
        <ellipse cx="57" cy="12" rx="6.4" ry="2.8" transform="rotate(-56 57 12)" />
      </g>
      {/* olives */}
      <g fill="#B7A98A">
        <circle cx="25" cy="54" r="3.4" />
        <circle cx="44" cy="35" r="3.1" />
        <circle cx="59" cy="14" r="3" />
      </g>
    </svg>
  );
}

export function RankCard({ data }: { data?: RankGamification | null }) {
  const rank = typeof data?.rank === "string" && data.rank ? data.rank : "Mortal";
  const level = Number(data?.current_level ?? 1) || 1;
  const isMax = data?.is_max_level === true;
  const xpInto = Number(data?.xp_into_level ?? 0) || 0;
  const xpNext = Number(data?.xp_for_next_level ?? 4) || 4;
  const pct = isMax
    ? 1
    : Math.max(0, Math.min(1, xpNext > 0 ? xpInto / xpNext : 0));

  return (
    <div className="bg-mx-surface rounded-mx-lg px-[18px] py-[18px]">
      <div className="mb-3.5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-mx-serif text-mx-ink text-[32px] leading-none tracking-[-0.3px]">
            {rank}
          </div>
          <div className="text-mx-muted mt-1.5 text-[13px]">Level {level}</div>
        </div>
        <OliveBranch />
      </div>

      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ backgroundColor: TRACK }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: GOLD }}
        />
      </div>

      <div className="text-mx-muted mt-2.5 text-[12.5px]">
        {isMax
          ? "Max rank reached"
          : `${xpInto.toLocaleString()} / ${xpNext.toLocaleString()} XP to level ${level + 1}`}
      </div>
    </div>
  );
}

export default RankCard;
