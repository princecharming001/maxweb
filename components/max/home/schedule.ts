/**
 * Home-screen schedule aggregation + display helpers — a trimmed browser port
 * of the mobile `utils/scheduleAggregation.ts` (+ the local helpers in
 * screens/home/HomeScreen.tsx). Turns the `getActiveSchedulesFull` payload
 * (schedules[].days[].tasks[]) into per-date merged habit rows, and carries the
 * per-Max colour/label tables so a habit card can tint itself by program.
 *
 * The web Home only feeds an EMPTY maxes map (the iOS screen also falls back to
 * these DEFAULT tables until the maxes query resolves), so native modules
 * (skinmax / hairmax / …) still get their real colours and creator courses get
 * a stable hashed fallback.
 */

/* ── Per-Max tables (must match backend seed naming) ─────────────────────── */

export const FALLBACK_MODULE_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
  "#0ea5e9",
];

const DEFAULT_MAXX_LABELS: Record<string, string> = {
  skinmax: "Skinmax",
  hairmax: "Hairmax",
  fitmax: "Fitmax",
  bonemax: "Bonemax",
  heightmax: "Heightmax",
  coloringmax: "Coloring Max",
};

const DEFAULT_MAXX_COLORS: Record<string, string> = {
  skinmax: "#8B5CF6",
  hairmax: "#3B82F6",
  fitmax: "#10B981",
  bonemax: "#F59E0B",
  heightmax: "#6366F1",
  coloringmax: "#BC7A3C",
};

/** Lowercase the trailing "Max" in product names (FitMax → Fitmax). */
export function normalizeMaxxNameSuffix(label: string): string {
  let s = String(label || "").trim();
  if (!s) return s;
  s = s.replace(/Max$/i, "max");
  s = s.replace(/([A-Za-z0-9])Max(?=\s*[—\-–])/g, "$1max");
  return s;
}

/** Normalize a DB/API maxx id (spacing, casing, hyphen variants). */
export function normalizeMaxxId(raw: unknown): string {
  if (raw == null) return "";
  const s = String(raw).trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return "";
  if (s === "skin-max" || s === "skinmax") return "skinmax";
  if (s === "hair-max" || s === "hairmax") return "hairmax";
  if (s === "fit-max" || s === "fitmax") return "fitmax";
  if (s === "bone-max" || s === "bonemax") return "bonemax";
  if (s === "height-max" || s === "heightmax") return "heightmax";
  if (s === "coloring-max" || s === "coloringmax") return "coloringmax";
  return s;
}

export function fallbackColor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h << 5) - h + key.charCodeAt(i);
  return FALLBACK_MODULE_COLORS[Math.abs(h) % FALLBACK_MODULE_COLORS.length];
}

/** The curated display label for a recognized module id, else null. Backs the
 *  "Ready to start on {Max}?" nudge (only personalized for a real module). */
export function knownMaxLabel(raw: unknown): string | null {
  const id = normalizeMaxxId(raw);
  return id && DEFAULT_MAXX_LABELS[id] ? DEFAULT_MAXX_LABELS[id] : null;
}

/* ── Raw payload shapes (loose — the API types `schedules` as unknown[]) ──── */

export interface RawTask {
  task_id?: string;
  title?: string;
  description?: string;
  time?: string;
  status?: string;
  duration_minutes?: number;
  task_type?: string;
  catalog_id?: string;
  [k: string]: unknown;
}
export interface RawDay {
  date?: string;
  tasks?: RawTask[];
}
export interface RawSchedule {
  id: string;
  maxx_id?: string;
  course_title?: string;
  days?: RawDay[];
  [k: string]: unknown;
}
export interface FullSchedules {
  schedules?: RawSchedule[];
  today_date?: string;
  day_number?: number;
  journey_start_date?: string;
  schedule_streak?: {
    current?: number;
    last_perfect_date?: string | null;
    today_date?: string;
    journey_start_date?: string;
    day_number?: number;
  };
  gamification?: unknown;
}

export type MergedScheduleTask = {
  task_id: string;
  time: string;
  title: string;
  description: string;
  task_type: string;
  duration_minutes: number;
  status: string;
  scheduleId: string;
  moduleLabel: string;
  moduleColor: string;
  catalog_id?: string;
};

/* ── Cross-program module inference + de-dup (mirrors the mobile merge) ───── */

const SKIN_TASK_RE =
  /\b(skinmax|skincare|skin care|spf\b|sunscreen|retinoid|retinol|\bam\s+skincare|\bpm\s+skincare|cleanser?\b|niacinamide|exfoliat|your skinmax|moisturiz\w*|moisturis\w*|evening routine:\s*cleanse)\b/i;
const HAIR_TASK_RE =
  /\b(hairmax|minoxidil|finasteride|dutasteride|hair loss|ketoconazole\s+shampoo|microneedl(?:e|ing)\s+(?:for\s+)?hair|dermaroll(?:er)?\s+(?:for\s+)?(?:hair|scalp))\b/i;

function normalizeRoutineTitle(title: string): string {
  let s = (title || "").toLowerCase().replace(/\s+/g, " ").trim();
  s = s.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  return s.slice(0, 56);
}

function skincareRoutineFingerprint(title: string, desc: string): string {
  const blob = `${title || ""} ${desc || ""}`;
  if (!SKIN_TASK_RE.test(blob)) return "";
  let core = (title || "")
    .toLowerCase()
    .replace(
      /\b(pm|am|p\.?m\.?|a\.?m\.?|evening|night|morning|bedtime|skincare|skin care|routine|daily)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
  if (core.length < 2) core = "skincare_routine";
  return core.slice(0, 48);
}

function skincareAmPmBucket(task: MergedScheduleTask): "am" | "pm" | "x" {
  const blob = `${task.title || ""} ${task.description || ""}`;
  if (/\b(pm|evening|night|bedtime|before bed)\b/i.test(blob)) return "pm";
  if (/\b(am|morning)\b/i.test(blob)) return "am";
  const time = (task.time || "").trim();
  if (time.includes(":")) {
    const h = parseInt(time.split(":")[0], 10);
    if (!isNaN(h)) return h < 12 ? "am" : "pm";
  }
  return "x";
}

function dedupeKeyForTask(t: MergedScheduleTask): string {
  const fp = skincareRoutineFingerprint(t.title || "", t.description || "");
  if (fp) return `${t.moduleLabel}|SC|${skincareAmPmBucket(t)}|${fp}`;
  return `${t.moduleLabel}|${(t.time || "").trim()}|${normalizeRoutineTitle(t.title || "")}`;
}

const STATUS_RANK: Record<string, number> = { completed: 3, skipped: 2, pending: 1 };
const statusRank = (t: MergedScheduleTask): number =>
  STATUS_RANK[String(t.status || "pending").toLowerCase()] ?? 0;

function dedupeTasksForDay(tasks: MergedScheduleTask[]): MergedScheduleTask[] {
  const best = new Map<string, MergedScheduleTask>();
  for (const t of tasks) {
    const key = dedupeKeyForTask(t);
    const prev = best.get(key);
    if (!prev) {
      best.set(key, t);
      continue;
    }
    const nr = statusRank(t);
    const pr = statusRank(prev);
    if (nr !== pr) {
      best.set(key, nr > pr ? t : prev);
      continue;
    }
    const nextLen = (t.description || "").length;
    const prevLen = (prev.description || "").length;
    best.set(key, nextLen >= prevLen ? t : prev);
  }
  return Array.from(best.values()).sort((a, b) =>
    (a.time || "").localeCompare(b.time || ""),
  );
}

function displayModuleForTask(
  task: RawTask,
  scheduleMid: string,
  baseLabel: string,
  baseColor: string,
  activeMaxxIds: Set<string>,
  maxxLabels: Record<string, string>,
  maxxColors: Record<string, string>,
): { moduleLabel: string; moduleColor: string } {
  const blob = `${task.title || ""} ${task.description || ""}`;
  const skinish = SKIN_TASK_RE.test(blob);
  const hairish = HAIR_TASK_RE.test(blob);
  if (scheduleMid === "skinmax" && hairish && !skinish && activeMaxxIds.has("hairmax")) {
    return {
      moduleLabel: maxxLabels["hairmax"] || DEFAULT_MAXX_LABELS.hairmax,
      moduleColor: maxxColors["hairmax"] || DEFAULT_MAXX_COLORS.hairmax,
    };
  }
  return { moduleLabel: baseLabel, moduleColor: baseColor };
}

export function buildMaxxMaps(maxxes: { id?: unknown; label?: unknown; color?: unknown }[]): {
  labels: Record<string, string>;
  colors: Record<string, string>;
} {
  const labels: Record<string, string> = {};
  const colors: Record<string, string> = {};
  for (const x of maxxes || []) {
    if (!x?.id) continue;
    const id = normalizeMaxxId(x.id);
    if (!id) continue;
    labels[id] = normalizeMaxxNameSuffix(
      String(x.label || DEFAULT_MAXX_LABELS[id] || x.id),
    );
    if (x.color) colors[id] = String(x.color);
  }
  return { labels, colors };
}

export function mergeSchedules(
  schedules: RawSchedule[],
  maxxLabels: Record<string, string>,
  maxxColors: Record<string, string>,
): { byDate: Record<string, MergedScheduleTask[]>; dates: string[] } {
  const byDate: Record<string, MergedScheduleTask[]> = {};
  const activeMaxxIds = new Set<string>();
  for (const s of schedules || []) {
    const m = normalizeMaxxId(s.maxx_id);
    if (m) activeMaxxIds.add(m);
  }

  for (const s of schedules || []) {
    const mid = normalizeMaxxId(s.maxx_id);
    const label = normalizeMaxxNameSuffix(
      String(
        mid
          ? maxxLabels[mid] || DEFAULT_MAXX_LABELS[mid] || s.maxx_id || mid
          : s.course_title || s.maxx_id || "Program",
      ),
    );
    const color = mid
      ? maxxColors[mid] || DEFAULT_MAXX_COLORS[mid] || fallbackColor(mid)
      : fallbackColor(String(s.course_title || s.maxx_id || "program").toLowerCase());

    for (const day of s.days || []) {
      const d = day.date;
      if (!d) continue;
      for (const t of day.tasks || []) {
        const blob = `${t.title || ""} ${t.description || ""}`;
        // Skincare copy that landed on the hair schedule (bad AI) is dropped.
        if (mid === "hairmax" && SKIN_TASK_RE.test(blob) && !HAIR_TASK_RE.test(blob)) continue;

        if (!byDate[d]) byDate[d] = [];
        const { moduleLabel, moduleColor } = displayModuleForTask(
          t,
          mid,
          label,
          color,
          activeMaxxIds,
          maxxLabels,
          maxxColors,
        );
        byDate[d].push({
          task_id: String(t.task_id ?? ""),
          time: String(t.time ?? ""),
          title: String(t.title ?? ""),
          description: String(t.description ?? ""),
          task_type: String(t.task_type ?? ""),
          duration_minutes: Number(t.duration_minutes ?? 0),
          status: String(t.status ?? "pending"),
          catalog_id: t.catalog_id != null ? String(t.catalog_id) : undefined,
          scheduleId: String(s.id),
          moduleLabel,
          moduleColor,
        });
      }
    }
  }

  const dates = Object.keys(byDate).sort();
  for (const d of dates) byDate[d] = dedupeTasksForDay(byDate[d]);
  return { byDate, dates };
}

/* ── Small display helpers (ported from HomeScreen.tsx) ──────────────────── */

/** Whole calendar days between two 'YYYY-MM-DD' dates (UTC-anchored). */
export function diffDaysISO(fromISO: string, toISO: string): number {
  return Math.round(
    (Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) / 86400000,
  );
}

export function formatTimeTo12Hour(time24?: string): string {
  if (!time24 || typeof time24 !== "string" || !time24.includes(":")) return time24 || "";
  const [hoursStr, minutesStr] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/** Relative label for a nearby ISO date ("Today" / "Tomorrow" / full date). */
export function formatScheduleDayLabel(isoDate?: string | null): string | null {
  if (!isoDate || typeof isoDate !== "string") return null;
  const parts = isoDate.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dt.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return dt.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

/* ── Habit-card gradient colour math (ported from HomeScreen GradientHabit) ─ */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = (hex || "").replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f || "6b6b6b", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
/** amt > 0 lightens toward white, amt < 0 darkens toward black. */
export function shade(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const t = amt >= 0 ? 255 : 0;
  const p = Math.abs(amt);
  return `rgb(${Math.round(r + (t - r) * p)},${Math.round(g + (t - g) * p)},${Math.round(
    b + (t - b) * p,
  )})`;
}
