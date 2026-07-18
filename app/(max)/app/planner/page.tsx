"use client";

/**
 * Planner — the web port of the iOS DayPlannerScreen. Pick a day from the rolling
 * week strip (today leftmost) and see it as a vertical hour timeline: each active
 * schedule task laid onto the axis by its start time, sized to its duration.
 *
 * Data: the same getActiveSchedulesFull() the Today tab loads, flattened
 * schedules[].days[].tasks[] → date → timed events. No planner-specific endpoint
 * is needed, so it degrades to the same layout with an empty grid on error.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { Spinner } from "@/components/max/ui";
import PlannerHeader from "@/components/max/planner/PlannerHeader";
import DayStrip from "@/components/max/planner/DayStrip";
import ScheduleTimeline from "@/components/max/planner/ScheduleTimeline";
import {
  buildWeekFromToday,
  flattenByDate,
  type ScheduleRaw,
} from "@/components/max/planner/schedule";

export default function PlannerPage() {
  const days = useMemo(() => buildWeekFromToday(7), []);
  const todayIso = days[0].iso;
  const [selectedIso, setSelectedIso] = useState(todayIso);

  // Shares the Today tab's cache key so schedules are fetched once across tabs.
  const schedulesQ = useQuery({
    queryKey: queryKeys.schedulesActiveFull,
    queryFn: () => api.getActiveSchedulesFull(),
    staleTime: 60_000,
  });

  const byDate = useMemo(
    () => flattenByDate((schedulesQ.data?.schedules ?? []) as ScheduleRaw[]),
    [schedulesQ.data?.schedules],
  );
  const events = byDate[selectedIso] ?? [];
  const selected = days.find((d) => d.iso === selectedIso) ?? days[0];

  return (
    <div className="pb-4">
      <PlannerHeader onToday={() => setSelectedIso(todayIso)} />

      <h1 className="font-mx-serif mt-6 text-[40px] leading-none tracking-[-0.02em] text-mx-ink">
        Your <span className="italic">week</span>
      </h1>

      <div className="mt-6">
        <DayStrip days={days} selectedIso={selectedIso} onSelect={setSelectedIso} />
      </div>

      <div className="mt-7">
        {schedulesQ.isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <ScheduleTimeline events={events} isToday={selected.isToday} />
        )}
      </div>

      <p className="mt-6 text-center text-[12px] text-mx-muted">
        {schedulesQ.isError
          ? "Couldn't load your schedule — showing an empty week."
          : "Your scheduled routine, laid out by the hour."}
      </p>
    </div>
  );
}
