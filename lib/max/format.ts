/** Shared display helpers ported from the mobile Today/Planner screens. */

/** "16:30" | "4:30 PM" → "4:30p". Returns "" for empty/unknown. */
export function fmtTime(hhmm?: string): string {
  if (!hhmm) return "";
  const m = String(hhmm)
    .trim()
    .match(/^(\d{1,2}):(\d{2})/);
  if (!m) return String(hhmm);
  let h = parseInt(m[1], 10);
  const min = m[2];
  const suffix = h >= 12 ? "p" : "a";
  h = h % 12;
  if (h === 0) h = 12;
  return min === "00" ? `${h}${suffix}` : `${h}:${min}${suffix}`;
}

/** Minutes since midnight for sorting; unknown sorts last. */
export function toMin(hhmm?: string): number {
  if (!hhmm) return 24 * 60 + 1;
  const m = String(hhmm).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return 24 * 60 + 1;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** Strip a leading "Program — " style prefix the mobile app also trims. */
export function displayTitle(s?: string): string {
  if (!s) return "";
  return s.replace(/^[^—:]{0,24}[—:]\s*/, "").trim() || s.trim();
}

export function isDone(status?: string): boolean {
  return status === "completed";
}
export function isSkipped(status?: string): boolean {
  return status === "skipped";
}
