"use client";

import Link from "next/link";
import { GlassCard } from "@/components/max/you/GlassCard";

/**
 * "weekly progress" card — web port of the ProfileScreen streak block. A
 * rolling 7-day window ending today: seven rounded-square day pills (labelled
 * by weekday initial), today rendered solid ink with a white dot, past days
 * within the current streak faint with an ink dot. Below: THIS WEEK count +
 * a link to the schedule.
 *
 * The web api client has no weekly-review endpoint, so — like the mobile
 * fallback path — the closed-day state is derived from the streak count.
 */
const DOW = ["S", "M", "T", "W", "T", "F", "S"]; // Sun … Sat initials

export function WeeklyCard({ streak }: { streak: number }) {
  const safeStreak = Math.max(0, Math.floor(streak) || 0);
  const today = new Date();

  const pills = Array.from({ length: 7 }).map((_, idx) => {
    const offset = 6 - idx; // 6 days ago … today (rightmost)
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const isToday = offset === 0;
    // A past day is "closed" if it falls inside the current streak run.
    const closed = !isToday && offset <= safeStreak;
    return { letter: DOW[d.getDay()], isToday, closed };
  });

  const weekCount = Math.min(safeStreak, 7);

  return (
    <GlassCard radius={18}>
      <div className="px-[18px] py-4">
        <h2 className="font-mx-serif text-mx-ink mb-3.5 text-[17px] tracking-[-0.3px]">
          weekly progress
        </h2>

        <div className="mb-4 flex gap-[7px]">
          {pills.map((p, i) => (
            <div
              key={i}
              className={`flex h-[52px] flex-1 flex-col items-center justify-center gap-1.5 rounded-[16px] ${
                p.isToday ? "bg-mx-ink" : "bg-mx-surface"
              }`}
            >
              <span
                className={`size-[5px] rounded-full ${
                  p.isToday
                    ? "bg-white"
                    : p.closed
                      ? "bg-mx-ink"
                      : "bg-transparent"
                }`}
              />
              <span
                className={`text-[12px] ${
                  p.isToday
                    ? "font-semibold text-white"
                    : "text-mx-ink-2"
                }`}
              >
                {p.letter}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-mx-muted mb-1 text-[10px] font-medium uppercase tracking-[0.7px]">
              THIS WEEK
            </div>
            <div className="text-mx-ink text-[16px] font-semibold tracking-[-0.3px]">
              {weekCount} day{weekCount === 1 ? "" : "s"}
            </div>
          </div>
          <Link href="/app/today" className="flex flex-col items-end">
            <div className="text-mx-muted mb-1 text-[10px] font-medium uppercase tracking-[0.7px]">
              SCHEDULE
            </div>
            <div className="text-mx-ink text-[16px] font-semibold tracking-[-0.3px]">
              Open →
            </div>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

export default WeeklyCard;
