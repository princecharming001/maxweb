"use client";

/**
 * The day as a vertical hour grid — a quiet hour gutter on the left, a hairline
 * per hour, and each scheduled task floated onto the time axis as a soft block
 * (top = start time, height ∝ duration). The web port of ScheduleGrid, minus the
 * gap-compression (every hour renders at full scale, per the reference). Empty
 * hours just show the grid; a fully empty day shows a quiet caption.
 */
import { useEffect, useState } from "react";
import { hourLabel, label12, layoutColumns, type TimedEvent } from "./schedule";

const HOUR_H = 56; // px per hour
const PX_PER_MIN = HOUR_H / 60;
const GUTTER = 58; // hour-label column width
const TOP_PAD = 8;
const BOTTOM_PAD = 12;
const MIN_CARD_H = 30;

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export default function ScheduleTimeline({
  events,
  isToday,
}: {
  events: TimedEvent[];
  isToday: boolean;
}) {
  // Live "now" line — only ticks while viewing today.
  const [now, setNow] = useState(nowMinutes);
  useEffect(() => {
    if (!isToday) return;
    setNow(nowMinutes());
    const id = setInterval(() => setNow(nowMinutes()), 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  const hasEvents = events.length > 0;
  // Data-driven window; a quiet default morning grid when the day is empty.
  const minStart = hasEvents ? Math.min(...events.map((e) => e.startMin)) : 7 * 60;
  const maxEnd = hasEvents ? Math.max(...events.map((e) => e.endMin)) : 14 * 60;
  const startHour = Math.floor(minStart / 60);
  const endHour = Math.max(Math.ceil(maxEnd / 60), startHour + 1);
  const gridStartMin = startHour * 60;
  const gridEndMin = endHour * 60;

  const y = (min: number) => TOP_PAD + (min - gridStartMin) * PX_PER_MIN;
  const height = y(gridEndMin) + BOTTOM_PAD;

  const lay = layoutColumns(events);
  const showNow = isToday && hasEvents && now >= gridStartMin && now <= gridEndMin;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Hour lines + labels — every visible hour, so the first is anchored. */}
      {hours.map((h) => (
        <div
          key={h}
          className="pointer-events-none absolute inset-x-0 flex -translate-y-1/2 items-center"
          style={{ top: y(h * 60) }}
        >
          <span className="w-[48px] text-[12px] font-medium tabular-nums tracking-wide text-mx-muted">
            {hourLabel(h)}
          </span>
          <span className="h-px flex-1 bg-mx-border" />
        </div>
      ))}

      {/* Empty-day caption sits centered over the grid. */}
      {!hasEvents ? (
        <div
          className="pointer-events-none absolute inset-x-0 flex justify-center"
          style={{ top: height / 2 - 12 }}
        >
          <span className="rounded-full bg-mx-surface-light px-3 py-1 text-[12px] text-mx-muted">
            Nothing scheduled
          </span>
        </div>
      ) : null}

      {/* Event lane — blocks positioned on the time axis. */}
      <div className="absolute inset-y-0 right-0" style={{ left: GUTTER }}>
        {events.map((e, idx) => {
          const { col, cols } = lay[idx];
          const top = y(e.startMin);
          const cardH = Math.max(y(e.endMin) - top, MIN_CARD_H);
          const showTime = cardH >= 44;
          const success = e.accent === "success";
          const done = e.status === "completed";
          return (
            <div
              key={e.key}
              className="absolute"
              style={{
                top,
                height: cardH,
                left: `${(col / cols) * 100}%`,
                width: `${(1 / cols) * 100}%`,
              }}
            >
              <div
                className={`relative mb-1 mr-1.5 flex h-full overflow-hidden rounded-[12px] border shadow-mx-sm ${
                  success
                    ? "border-mx-success/30 bg-mx-success/10"
                    : "border-mx-border bg-mx-surface-light"
                } ${done ? "opacity-50" : ""}`}
              >
                <span
                  className={`my-[7px] ml-[7px] w-[3px] shrink-0 rounded-full ${
                    success ? "bg-mx-success" : "bg-mx-ink"
                  }`}
                />
                <div className="flex min-w-0 flex-col justify-center px-2.5 py-1.5">
                  <span
                    className={`truncate font-mx-serif text-[15px] leading-tight text-mx-ink ${
                      done ? "line-through" : ""
                    }`}
                  >
                    {e.title}
                  </span>
                  {showTime ? (
                    <span className="mt-0.5 truncate text-[11.5px] tabular-nums text-mx-muted">
                      {label12(e.startMin)} – {label12(e.endMin)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* "Now" indicator — today only: a dot near the lane + a thin ink line. */}
      {showNow ? (
        <div
          className="pointer-events-none absolute inset-x-0 flex -translate-y-1/2 items-center"
          style={{ top: y(now) }}
        >
          <span className="ml-[51px] size-[7px] rounded-full bg-mx-ink" />
          <span className="h-[1.5px] flex-1 rounded-full bg-mx-ink/90" />
        </div>
      ) : null}
    </div>
  );
}
