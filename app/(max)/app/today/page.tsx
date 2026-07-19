"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api, { type PlannerTask } from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Icon } from "@/components/max/icons";
import { Spinner } from "@/components/max/ui";
import HabitCard from "@/components/max/home/HabitCard";
import TaskSheet from "@/components/max/today/TaskSheet";
import {
  buildMaxxMaps,
  mergeSchedules,
  diffDaysISO,
  normalizeMaxxId,
  knownMaxLabel,
  formatScheduleDayLabel,
  type MergedScheduleTask,
  type FullSchedules,
} from "@/components/max/home/schedule";

type DayCell = {
  date: string;
  index: number;
  total: number;
  done: number;
  isToday: boolean;
};

/**
 * The iOS HOME tab, ported to the web. Kicker + big "DAY X / 365" headline, a
 * horizontal day strip with completion dots, the selected day's HABITS list,
 * an Explore nudge when no program is running, and the wellness disclaimer.
 * All data comes from `getActiveSchedulesFull` (the mobile `full` object).
 */
export default function HomePage() {
  const qc = useQueryClient();
  const { user } = useMaxAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState<PlannerTask | null>(null);
  const inFlight = useRef(new Set<string>());

  const schedulesQ = useQuery({
    queryKey: queryKeys.schedulesActiveFull,
    queryFn: () => api.getActiveSchedulesFull(),
    staleTime: 60_000,
  });

  // The API types `schedules` as unknown[]; the real payload also carries
  // day_number / journey_start_date, so read it through the loose Full shape.
  const full = schedulesQ.data as unknown as FullSchedules | undefined;

  // Merge schedules → per-date rows, and derive the day strip + "DAY X" index.
  const { byDate, today, todayIndex, days } = useMemo(() => {
    // LOCAL date, not toISOString() (UTC) — after 5pm PT the UTC date is
    // tomorrow, which mislabeled the kicker TOMORROW. iOS uses the local day.
    const now = new Date();
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (!full) {
      return {
        byDate: {} as Record<string, MergedScheduleTask[]>,
        today: todayISO,
        todayIndex: 1,
        days: [] as DayCell[],
      };
    }
    const { labels, colors } = buildMaxxMaps([]);
    const { byDate } = mergeSchedules(full.schedules ?? [], labels, colors);
    const today = full.today_date || full.schedule_streak?.today_date || todayISO;
    // Stable Day-1 anchor from the backend → real calendar day numbers; falls
    // back to positional indexing when an older backend omits it.
    const journeyStart =
      full.journey_start_date || full.schedule_streak?.journey_start_date || null;
    const backendDayNumber = full.day_number ?? full.schedule_streak?.day_number ?? null;
    const dayNumberFor = (d: string) =>
      journeyStart ? diffDaysISO(journeyStart, d) + 1 : null;
    const dates = Object.keys(byDate)
      .filter((d) => (byDate[d] || []).length > 0)
      .sort();
    const days: DayCell[] = dates.map((d, i) => {
      const rows = byDate[d] || [];
      return {
        date: d,
        index: dayNumberFor(d) ?? i + 1,
        total: rows.length,
        done: rows.filter((r) => r.status === "completed").length,
        isToday: d === today,
      };
    });
    const todayIndex =
      backendDayNumber ??
      dayNumberFor(today) ??
      (dates.filter((d) => d <= today).length || 1);
    return { byDate, today, todayIndex, days };
  }, [full]);

  // The strip is ALWAYS shown — synthesize a 30-day strip when there's no plan.
  const stripDays: DayCell[] =
    days.length > 0
      ? days
      : Array.from({ length: 30 }, (_, i) => ({
          date: `synthetic-${i + 1}`,
          index: i + 1,
          total: 0,
          done: 0,
          isToday: i === 0,
        }));

  const activeDate = selectedDate ?? today;
  const selectedRows = byDate[activeDate] ?? [];
  const activeDayIndex = selectedDate
    ? (stripDays.find((d) => d.date === selectedDate)?.index ?? todayIndex)
    : todayIndex;
  const activeLabel =
    formatScheduleDayLabel(selectedDate ?? today) ?? "Today";

  // Distinct running programs — drives the "no program yet" nudge.
  const activeProgramCount = useMemo(() => {
    const seen = new Set<string>();
    for (const s of full?.schedules ?? []) {
      const mid = normalizeMaxxId(s.maxx_id);
      const key = (mid || String(s.course_title || s.id || "")).toLowerCase();
      if (key) seen.add(key);
    }
    return seen.size;
  }, [full]);

  const primaryMaxLabel = useMemo(() => {
    const ob = user?.onboarding as
      | { goals?: string[]; facial_scan_summary?: { suggested_modules?: string[] } }
      | undefined;
    return (
      knownMaxLabel(ob?.facial_scan_summary?.suggested_modules?.[0]) ??
      knownMaxLabel(ob?.goals?.[0])
    );
  }, [user]);

  const initial = (
    user?.first_name?.[0] ||
    user?.email?.[0] ||
    "U"
  ).toUpperCase();
  const avatarUrl = user?.profile?.avatar_url
    ? api.resolveAttachmentUrl(user.profile.avatar_url)
    : undefined;

  const loading = schedulesQ.isPending && !schedulesQ.data;
  const errText = schedulesQ.isError
    ? (schedulesQ.error as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail || "Could not load today’s tasks."
    : null;

  async function toggleTask(row: MergedScheduleTask) {
    const key = `${row.scheduleId}:${row.task_id}`;
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);

    const completing = row.status !== "completed";
    const newStatus = completing ? "completed" : "pending";
    const prev = qc.getQueryData(queryKeys.schedulesActiveFull);
    // Optimistic flip FIRST (synchronous), then cancel in-flight refetches so
    // they can't clobber it — the mobile toggleTodayTask ordering.
    qc.setQueryData(queryKeys.schedulesActiveFull, (old: FullSchedules | undefined) => {
      if (!old?.schedules) return old;
      return {
        ...old,
        schedules: old.schedules.map((s) =>
          s.id !== row.scheduleId
            ? s
            : {
                ...s,
                days: (s.days ?? []).map((d) => ({
                  ...d,
                  tasks: (d.tasks ?? []).map((t) =>
                    t.task_id === row.task_id ? { ...t, status: newStatus } : t,
                  ),
                })),
              },
        ),
      };
    });
    void qc.cancelQueries({ queryKey: queryKeys.schedulesActiveFull });
    try {
      if (completing) await api.completeScheduleTask(row.scheduleId, row.task_id);
      else await api.uncompleteScheduleTask(row.scheduleId, row.task_id);
      void qc.invalidateQueries({ queryKey: queryKeys.schedulesActiveFull });
    } catch {
      qc.setQueryData(queryKeys.schedulesActiveFull, prev);
    } finally {
      inFlight.current.delete(key);
    }
  }

  return (
    <div className="bg-mx-surface -mx-5 -mt-6 min-h-screen px-6 pb-16 pt-5">
      {/* ── Top bar: bell + avatar (avatar → Profile) ─────────────────────── */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="shadow-mx-sm text-mx-ink flex size-[38px] items-center justify-center rounded-full bg-white"
        >
          <Icon name="bell" className="size-[19px]" />
        </button>
        <Link
          href="/app/you"
          aria-label="Open profile"
          className="bg-mx-ink flex size-[38px] items-center justify-center overflow-hidden rounded-full"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[15px] font-semibold text-white">{initial}</span>
          )}
        </Link>
      </div>

      {/* ── Header: kicker + DAY X / 365 ──────────────────────────────────── */}
      <div className="pb-[18px] pt-2.5">
        <div className="font-mx-sans text-mx-muted mb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em]">
          {activeLabel.toUpperCase()}
        </div>
        <h1 className="font-mx-sans text-mx-ink text-[44px] font-extrabold leading-none tracking-[-0.035em]">
          DAY {activeDayIndex}
          <span className="text-mx-muted font-bold"> / 365</span>
        </h1>
      </div>

      {/* ── Day strip (bleeds to the gray edges, scrolls horizontally) ────── */}
      <div className="-mx-6 flex gap-2.5 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stripDays.map((d) => {
          const onPill = selectedDate ? d.date === selectedDate : d.isToday;
          const complete = d.total > 0 && d.done >= d.total;
          const partial = d.done > 0 && d.done < d.total;
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedDate(d.date)}
              aria-label={`Day ${d.index}`}
              className={`rounded-mx-md flex h-[84px] w-[58px] shrink-0 flex-col items-center justify-center gap-3 border-[1.5px] transition ${
                complete
                  ? "bg-mx-ink border-transparent"
                  : onPill
                    ? "border-mx-ink bg-transparent"
                    : "border-mx-border-light bg-transparent"
              }`}
            >
              <span
                className={`text-[17px] font-semibold ${
                  complete ? "text-white" : onPill ? "text-mx-ink" : "text-mx-muted"
                }`}
              >
                {d.index}
              </span>
              <span
                className={`size-3 rounded-full ${
                  complete
                    ? "bg-white"
                    : partial
                      ? onPill
                        ? "bg-mx-ink"
                        : "bg-mx-muted"
                      : `border-[1.5px] ${onPill ? "border-mx-ink" : "border-mx-border-light"}`
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ── HABITS ────────────────────────────────────────────────────────── */}
      <div className="pt-[26px]">
        <div className="font-mx-sans text-mx-ink mb-4 text-[13px] font-extrabold uppercase tracking-[0.06em]">
          HABITS
        </div>

        {errText ? <div className="text-mx-error mb-2 text-[13px]">{errText}</div> : null}

        {loading && selectedRows.length === 0 ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : null}

        {!loading && !errText && selectedRows.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-mx-muted text-[14px]">
              {activeDate === today
                ? "No habits for today. Start a program to begin."
                : "No habits scheduled for this day."}
            </p>
          </div>
        ) : null}

        {selectedRows.map((row, i) => (
          <HabitCard
            key={`${row.scheduleId}:${row.task_id}:${i}`}
            row={row}
            done={row.status === "completed"}
            busy={false}
            onToggle={() => toggleTask(row)}
            onOpen={() =>
              setOpenTask({
                schedule_id: row.scheduleId,
                task_id: row.task_id,
                title: row.title,
                description: row.description,
                time: row.time,
                duration_minutes: row.duration_minutes,
              })
            }
          />
        ))}
      </div>

      {/* ── Empty: no program yet ─────────────────────────────────────────── */}
      {activeProgramCount === 0 && !loading ? (
        <Link
          href="/app/explore"
          className="text-mx-muted flex items-center justify-center gap-2.5 py-5 text-center"
        >
          <Icon name="explore" className="size-5" />
          <span className="text-[13px]">
            {primaryMaxLabel
              ? `Ready to start on ${primaryMaxLabel}? Explore has a plan.`
              : "Browse maxes in Explore"}
          </span>
        </Link>
      ) : null}

      <p className="text-mx-muted mx-auto mt-7 max-w-[320px] text-center text-[11px] leading-[15px]">
        General wellness only — not medical advice. Follow routines at your own risk.
      </p>

      {openTask ? <TaskSheet task={openTask} onClose={() => setOpenTask(null)} /> : null}
    </div>
  );
}
