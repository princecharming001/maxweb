"use client";

/**
 * The rolling week strip — weekday label above a calendar-day ring. Today (and
 * every day after it this week) is a cell; the selected day fills with ink, an
 * unselected today keeps a thin accent ring, the rest are hairline outlines.
 */
import type { StripDay } from "./schedule";

export default function DayStrip({
  days,
  selectedIso,
  onSelect,
}: {
  days: StripDay[];
  selectedIso: string;
  onSelect: (iso: string) => void;
}) {
  return (
    <div className="flex justify-between">
      {days.map((d) => {
        const selected = d.iso === selectedIso;
        return (
          <button
            key={d.iso}
            type="button"
            onClick={() => onSelect(d.iso)}
            aria-pressed={selected}
            aria-label={`${d.weekdayLong} ${d.date}${d.isToday ? ", today" : ""}`}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <span
              className={`text-[11px] tracking-wide ${
                selected ? "font-semibold text-mx-ink" : "font-medium text-mx-muted"
              }`}
            >
              {d.short}
            </span>
            <span
              className={`flex size-10 items-center justify-center rounded-full border-2 text-[15px] font-semibold tabular-nums transition ${
                selected
                  ? "border-mx-ink bg-mx-ink text-white"
                  : d.isToday
                    ? "border-mx-accent text-mx-ink"
                    : "border-mx-border text-mx-ink"
              }`}
            >
              {d.date}
            </span>
          </button>
        );
      })}
    </div>
  );
}
