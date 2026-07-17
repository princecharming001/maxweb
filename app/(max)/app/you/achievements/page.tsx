"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Spinner } from "@/components/max/ui";
import ClayBadge from "@/components/max/achievements/ClayBadge";

interface Achievement {
  code: string;
  title: string;
  description: string;
  tier: "bronze" | "silver" | "gold";
  category: string;
  icon: string;
  earned: boolean;
  seen: boolean;
  progress?: { current: number; target: number } | null;
}

// iOS maps lowercase category keys → display labels, in this fixed order.
const CATEGORY_LABEL: Record<string, string> = {
  consistency: "Consistency",
  milestones: "Milestones",
  progress: "Progress",
  discovery: "Discovery",
};
const CATEGORY_ORDER = ["consistency", "milestones", "progress", "discovery"];
const GOLD = "#C9A24E";
const EARNED_SUB = "#B58A1E";
const TIER_LABEL: Record<string, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold" };

export default function AchievementsPage() {
  const q = useQuery({
    queryKey: queryKeys.achievements,
    queryFn: () => api.getAchievements(),
  });
  // XP/rank ride /schedules/active/full (same source as the iOS useGamificationQuery).
  const gq = useQuery({
    queryKey: queryKeys.schedulesActiveFull,
    queryFn: () => api.getActiveSchedulesFull(),
  });

  const data = q.data as
    | { achievements?: Achievement[]; earned_count?: number; total?: number }
    | undefined;
  const list = data?.achievements ?? [];
  const earned = data?.earned_count ?? list.filter((a) => a.earned).length;
  const total = data?.total ?? list.length;

  const gam = gq.data?.gamification as Record<string, unknown> | null | undefined;
  const rank = gam?.rank as string | undefined;
  const level = gam?.current_level as number | undefined;
  const xpToday = (gam?.xp_earned_today as number | undefined) ?? 0;

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
              <span className="text-mx-muted text-[24px] font-medium tracking-[-0.01em]">
                / {total}
              </span>
            </div>
            <div className="text-mx-ink-2 mt-0.5 text-[12.5px] tracking-[0.03em]">badges earned</div>
            <div className="bg-mx-surface mt-3.5 h-1.5 w-[70%] overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{ width: `${total ? (earned / total) * 100 : 0}%`, background: GOLD }}
              />
            </div>
            {rank ? (
              <div className="text-mx-muted mt-2.5 text-[12.5px]">
                {rank} · Level {level ?? 1}
                {xpToday > 0 ? ` · +${xpToday.toLocaleString()} XP today` : ""}
              </div>
            ) : null}
          </div>

          {/* Category sections */}
          {cats.map((cat) => (
            <div key={cat} className="mt-8">
              <div className="mx-label mb-3">{CATEGORY_LABEL[cat] ?? cat}</div>
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
  const frac =
    a.progress && a.progress.target > 0 ? a.progress.current / a.progress.target : null;
  const sub = a.earned
    ? TIER_LABEL[a.tier] ?? ""
    : a.progress && a.progress.target > 0
      ? `${a.progress.current}/${a.progress.target}`
      : "Locked";
  return (
    <div className="flex flex-col items-center px-1 text-center">
      <ClayBadge icon={a.icon} code={a.code} tier={a.tier} earned={a.earned} size={74} progress={frac} />
      <div
        className={`mt-2 line-clamp-2 text-[12.5px] font-semibold leading-4 ${
          a.earned ? "text-mx-ink" : "text-mx-ink-2"
        }`}
      >
        {a.title}
      </div>
      <div
        className={`mt-0.5 text-[11px] ${a.earned ? "font-medium" : ""}`}
        style={{ color: a.earned ? EARNED_SUB : "var(--color-mx-muted)" }}
      >
        {sub}
      </div>
    </div>
  );
}
