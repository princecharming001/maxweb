/**
 * Planner data helpers — the web port of the mobile planner's day math.
 *
 * The iOS DayPlannerScreen edits an onboarding "day shape"; the web port instead
 * reads the same active-schedule data the Today tab already loads
 * (getActiveSchedulesFull → schedules[].days[].tasks[]) and lays each timed task
 * onto an hour grid. Mirrors utils/scheduleAggregation (flatten by date) +
 * components/planner/ScheduleGrid (position by start, height ∝ duration).
 *
 * Pure functions only — no React, no api. Imported by the client components.
 */

/** A single task inside schedules[].days[].tasks[] (loosely typed — the web
 *  api client returns schedules as unknown[]). */
export type ScheduleTaskRaw = {
  task_id?: string;
  time?: string; // "HH:MM" start
  end?: string; // "HH:MM" end (optional; else derived from duration)
  title?: string;
  description?: string;
  task_type?: string;
  duration_minutes?: number;
  status?: string;
  catalog_id?: string;
};
export type ScheduleDayRaw = {
  date?: string; // "YYYY-MM-DD"
  weekday?: string;
  tasks?: ScheduleTaskRaw[];
};
export type ScheduleRaw = {
  id?: string;
  maxx_id?: string;
  course_title?: string;
  days?: ScheduleDayRaw[];
};

/** One cell in the rolling week strip (today leftmost, six days after). */
export type StripDay = {
  iso: string;
  short: string; // "Fri"
  weekdayLong: string; // "Friday"
  date: number; // 17
  isToday: boolean;
};

/** A task resolved onto the time axis. */
export type TimedEvent = {
  key: string;
  startMin: number;
  endMin: number;
  title: string;
  accent: "ink" | "success";
  status?: string;
};

const WD_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Local-date YYYY-MM-DD — a stable per-date identity (matches mobile isoOf). */
export function isoOf(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The current week starting today: index 0 is today, then the next six days. */
export function buildWeekFromToday(count = 7): StripDay[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const out: StripDay[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      iso: isoOf(d),
      short: WD_SHORT[d.getDay()],
      weekdayLong: WD_LONG[d.getDay()],
      date: d.getDate(),
      isToday: i === 0,
    });
  }
  return out;
}

/** "HH:MM" → minutes since midnight, or null when unparseable. */
export function parseMin(hhmm?: string): number | null {
  if (!hhmm) return null;
  const m = String(hhmm)
    .trim()
    .match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mn = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(mn)) return null;
  return h * 60 + mn;
}

/** minutes → "7 AM" / "9:30 AM" (spaced, matching the reference). */
export function label12(min: number): string {
  const mm = ((Math.round(min) % 1440) + 1440) % 1440;
  let h = Math.floor(mm / 60);
  const n = mm % 60;
  const suffix = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return n === 0 ? `${h} ${suffix}` : `${h}:${String(n).padStart(2, "0")} ${suffix}`;
}

/** whole hour → "7 AM". */
export function hourLabel(h: number): string {
  const hh = ((h % 24) + 24) % 24;
  const suffix = hh < 12 ? "AM" : "PM";
  return `${hh % 12 || 12} ${suffix}`;
}

// Workout-type tasks get the one restrained green accent; everything else is ink.
const WORKOUT_RE =
  /\b(workout|work[ -]?out|gym|training|train|fitness|lift|cardio|exercise|run|running|hiit|yoga|mobility|stretch)\b/i;
export function eventAccent(title?: string, taskType?: string): "ink" | "success" {
  return WORKOUT_RE.test(`${title ?? ""} ${taskType ?? ""}`) ? "success" : "ink";
}

const DEFAULT_DURATION = 30; // minutes, when a task carries no end/duration

/** Flatten active schedules into date → chronological, de-duped timed events. */
export function flattenByDate(
  schedules: ScheduleRaw[] | undefined | null,
): Record<string, TimedEvent[]> {
  const byDate: Record<string, TimedEvent[]> = {};
  for (const s of schedules ?? []) {
    for (const day of s?.days ?? []) {
      const d = day?.date;
      if (!d) continue;
      for (const t of day?.tasks ?? []) {
        const startMin = parseMin(t?.time);
        if (startMin == null) continue; // untimed tasks don't sit on the axis
        const endField = parseMin(t?.end);
        const dur =
          typeof t?.duration_minutes === "number" && t.duration_minutes > 0
            ? t.duration_minutes
            : null;
        let endMin = endField ?? (dur != null ? startMin + dur : startMin + DEFAULT_DURATION);
        if (endMin <= startMin) endMin = startMin + DEFAULT_DURATION;
        (byDate[d] ||= []).push({
          key: `${s?.id ?? "s"}-${t?.task_id ?? `${d}-${t?.time}-${t?.title}`}`,
          startMin,
          endMin,
          title: (t?.title ?? "Task").trim() || "Task",
          accent: eventAccent(t?.title, t?.task_type),
          status: t?.status,
        });
      }
    }
  }
  for (const d of Object.keys(byDate)) {
    byDate[d].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
    // Collapse identical title+start+end (two schedules emitting the same block).
    const seen = new Set<string>();
    byDate[d] = byDate[d].filter((e) => {
      const sig = `${e.title.toLowerCase()}|${e.startMin}|${e.endMin}`;
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  }
  return byDate;
}

/**
 * Greedy column assignment so events that actually overlap in time render
 * side-by-side instead of stacking. Degrades to a single column when nothing
 * overlaps. Ported from ScheduleGrid's cluster layout. `evs` must be sorted by
 * start (as flattenByDate returns).
 */
export function layoutColumns(evs: TimedEvent[]): { col: number; cols: number }[] {
  const lay: { col: number; cols: number }[] = new Array(evs.length);
  let i = 0;
  while (i < evs.length) {
    let clusterEnd = evs[i].endMin;
    const idxs = [i];
    let j = i + 1;
    while (j < evs.length && evs[j].startMin < clusterEnd) {
      clusterEnd = Math.max(clusterEnd, evs[j].endMin);
      idxs.push(j);
      j++;
    }
    const colEnd: number[] = [];
    const colOf: number[] = [];
    for (const k of idxs) {
      let c = colEnd.findIndex((en) => evs[k].startMin >= en);
      if (c === -1) {
        c = colEnd.length;
        colEnd.push(0);
      }
      colEnd[c] = evs[k].endMin;
      colOf.push(c);
    }
    const cols = colEnd.length;
    idxs.forEach((k, t) => {
      lay[k] = { col: colOf[t], cols };
    });
    i = j;
  }
  return lay;
}
