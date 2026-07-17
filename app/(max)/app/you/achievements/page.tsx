"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Spinner } from "@/components/max/ui";

interface Achievement {
  code: string;
  title: string;
  description: string;
  tier: "bronze" | "silver" | "gold";
  category: string;
  icon: string;
  earned: boolean;
  seen: boolean;
  progress?: { current: number; target: number };
}

// iOS renders categories in this fixed order.
const CATEGORY_ORDER = ["Consistency", "Milestones", "Progress", "Discovery"];
const GOLD = "#C9A24E";
const TIER_LABEL: Record<string, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold" };

export default function AchievementsPage() {
  const q = useQuery({
    queryKey: queryKeys.achievements,
    queryFn: () => api.getAchievements(),
  });
  const data = q.data as
    | {
        achievements?: Achievement[];
        earned_count?: number;
        total?: number;
        gamification?: { rank?: string; level?: number; xp_today?: number };
      }
    | undefined;
  const list = data?.achievements ?? [];
  const earned = data?.earned_count ?? list.filter((a) => a.earned).length;
  const total = data?.total ?? list.length;
  const gam = data?.gamification;

  useEffect(() => {
    const unseen = list.filter((a) => a.earned && !a.seen).map((a) => a.code);
    if (unseen.length) api.markAchievementsSeen(unseen).catch(() => undefined);
  }, [list]);

  // Group by category, preserving the fixed order (unknowns appended).
  const cats = [
    ...CATEGORY_ORDER,
    ...Array.from(new Set(list.map((a) => a.category))).filter((c) => !CATEGORY_ORDER.includes(c)),
  ].filter((c) => list.some((a) => a.category === c));

  return (
    <div className="mx-auto max-w-[460px]">
      <SubPageHeader title="Achievements" />

      {q.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="flex flex-col items-center pb-2 text-center">
            <div className="flex items-baseline gap-1">
              <span className="text-mx-ink text-[46px] font-semibold leading-none tracking-[-0.03em]">
                {earned}
              </span>
              <span className="text-mx-muted text-[24px] font-medium">/ {total}</span>
            </div>
            <div className="text-mx-ink-2 mt-1 text-[12.5px]">badges earned</div>
            <div className="bg-mx-surface mt-4 h-1.5 w-[70%] overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{ width: `${total ? (earned / total) * 100 : 0}%`, background: GOLD }}
              />
            </div>
            {gam?.rank ? (
              <div className="text-mx-muted mt-3 text-[12.5px]">
                {gam.rank} · Level {gam.level ?? 1}
                {gam.xp_today ? ` · +${gam.xp_today} XP today` : ""}
              </div>
            ) : null}
          </div>

          {/* Category sections */}
          {cats.map((cat) => (
            <div key={cat} className="mt-8">
              <div className="mx-label mb-3">{cat}</div>
              <div className="grid grid-cols-3 gap-x-2 gap-y-6">
                {list
                  .filter((a) => a.category === cat)
                  .map((a) => (
                    <BadgeCell key={a.code} a={a} />
                  ))}
              </div>
            </div>
          ))}

          <p className="text-mx-muted mt-10 text-center text-[12.5px] leading-relaxed">
            Every badge is for showing up — never for how you look. Keep going.
          </p>
        </>
      )}
    </div>
  );
}

function BadgeCell({ a }: { a: Achievement }) {
  const pct =
    a.progress && a.progress.target > 0
      ? Math.min(100, (a.progress.current / a.progress.target) * 100)
      : 0;
  const r = 34;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex size-[74px] items-center justify-center">
        {a.earned ? (
          <span className="bg-mx-ink flex size-[74px] items-center justify-center rounded-full text-white">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5 10 17l9-10" />
            </svg>
          </span>
        ) : (
          <>
            <svg viewBox="0 0 74 74" className="absolute inset-0 -rotate-90">
              <circle cx="37" cy="37" r={r} fill="none" stroke="#D8D1C4" strokeWidth="2" />
              {pct > 0 ? (
                <circle
                  cx="37" cy="37" r={r} fill="none"
                  stroke="#1C1A17" strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * r}
                  strokeDashoffset={2 * Math.PI * r * (1 - pct / 100)}
                />
              ) : null}
            </svg>
            <span className="text-[22px] opacity-30">🔒</span>
          </>
        )}
      </div>
      <div
        className={`mt-2 line-clamp-2 text-[12.5px] font-semibold ${a.earned ? "text-mx-ink" : "text-mx-ink-2"}`}
      >
        {a.title}
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: a.earned ? "#B58A1E" : "var(--color-mx-muted)" }}>
        {a.earned
          ? TIER_LABEL[a.tier] ?? ""
          : a.progress && a.progress.target > 0
            ? `${a.progress.current}/${a.progress.target}`
            : "Locked"}
      </div>
    </div>
  );
}
