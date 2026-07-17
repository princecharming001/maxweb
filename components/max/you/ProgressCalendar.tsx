"use client";

import { useMemo, useState } from "react";
import api from "@/lib/max/api";
import { YouIcon } from "./icons";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
/** iOS calendar accent — a darker forest green than the mx-success token. */
const SCAN_GREEN = "#2E7D52";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type ScanPoint = {
  score: number;
  appeal?: number;
  potential?: number;
  at?: string;
};
/** Mobile uses `image_url`; `photo_url` kept as a fallback for schema drift. */
export type ProgressPhoto = {
  image_url?: string;
  photo_url?: string;
  created_at?: string;
};
export type DayData = { photo?: ProgressPhoto; scan?: ScanPoint; dateStr: string };

export type CalStatus =
  | { kind: "loading" }
  | { kind: "paywall" }
  | { kind: "error"; msg: string; retry: () => void }
  | { kind: "empty" }
  | { kind: "ok" };

/* ─── Helpers ────────────────────────────────────────────────────────────── */
export function parseScanPoints(raw: unknown): ScanPoint[] {
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : null;
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : ((obj?.scans as unknown[]) ?? (obj?.history as unknown[]) ?? []);
  return list
    .map((item): ScanPoint | null => {
      const s = item as Record<string, unknown>;
      const score = Number(s.overall_score ?? s.rating ?? s.score);
      if (!Number.isFinite(score)) return null;
      const appeal = s.appeal != null ? Number(s.appeal) : undefined;
      const potential = s.potential != null ? Number(s.potential) : undefined;
      return {
        score,
        appeal: appeal != null && Number.isFinite(appeal) ? appeal : undefined,
        potential:
          potential != null && Number.isFinite(potential) ? potential : undefined,
        at: typeof s.created_at === "string" ? s.created_at : undefined,
      };
    })
    .filter((x): x is ScanPoint => x !== null)
    .sort(
      (a, b) =>
        new Date(a.at || 0).getTime() - new Date(b.at || 0).getTime(),
    );
}

export function httpStatus(err: unknown): number | null {
  const e = err as
    | { response?: { status?: number }; status?: number }
    | null
    | undefined;
  return e?.response?.status ?? e?.status ?? null;
}

function fmtScore(v: number | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(1);
}

function scoreTint(v: number | undefined): string {
  if (v == null) return "var(--color-mx-ink)";
  if (v >= 7.5) return "#1A6E42";
  if (v >= 5) return "#7A5C00";
  return "#8B1A1A";
}

function formatDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const suffix =
    d === 1 || d === 21 || d === 31
      ? "st"
      : d === 2 || d === 22
        ? "nd"
        : d === 3 || d === 23
          ? "rd"
          : "th";
  return `${SHORT_MONTHS[m - 1]} ${d}${suffix}, ${y}`;
}

/* ─── Calendar status card (loading / paywall / error / empty) ───────────── */
export function CalendarStatusCard({
  status,
  onUpgrade,
}: {
  status: CalStatus;
  onUpgrade: () => void;
}) {
  if (status.kind === "ok") return null;

  if (status.kind === "loading") {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-8">
        <span className="border-mx-muted inline-block size-5 animate-spin rounded-full border-2 border-t-transparent" />
        <p className="text-mx-muted text-[13px]">Loading your progress…</p>
      </div>
    );
  }

  if (status.kind === "paywall") {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
        <div className="bg-mx-surface mb-1 flex size-12 items-center justify-center rounded-full">
          <YouIcon name="lock" className="text-mx-ink size-[22px]" />
        </div>
        <p className="text-mx-ink text-[15px] font-semibold tracking-[-0.2px]">
          Scan history is a paid feature
        </p>
        <p className="text-mx-muted max-w-[300px] text-[13px] leading-[19px]">
          Upgrade to Chad or Chadlite to unlock face analysis, see your appeal /
          rating / potential over time, and track progress in this calendar.
        </p>
        <button
          onClick={onUpgrade}
          className="bg-mx-ink mt-2.5 rounded-full px-[22px] py-2.5 text-[13px] font-semibold tracking-[0.2px] text-white"
        >
          Upgrade →
        </button>
      </div>
    );
  }

  if (status.kind === "error") {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
        <div className="bg-mx-surface mb-1 flex size-12 items-center justify-center rounded-full">
          <YouIcon name="wifi" className="text-mx-ink size-[22px]" />
        </div>
        <p className="text-mx-ink text-[15px] font-semibold tracking-[-0.2px]">
          Couldn&apos;t load progress data
        </p>
        <p className="text-mx-muted max-w-[300px] text-[13px] leading-[19px]">
          {status.msg}
        </p>
        <button
          onClick={status.retry}
          className="bg-mx-ink mt-2.5 rounded-full px-[22px] py-2.5 text-[13px] font-semibold tracking-[0.2px] text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  // empty
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
      <div className="bg-mx-surface mb-1 flex size-12 items-center justify-center rounded-full">
        <YouIcon name="camera" className="text-mx-ink size-[22px]" />
      </div>
      <p className="text-mx-ink text-[15px] font-semibold tracking-[-0.2px]">
        No scans yet
      </p>
      <p className="text-mx-muted max-w-[300px] text-[13px] leading-[19px]">
        Tap the scan button at the bottom of the screen to take your first face
        scan. Your photo and scores will appear here.
      </p>
    </div>
  );
}

/* ─── Metric tile (RATING / APPEAL / POTENTIAL) ──────────────────────────── */
function MetricTile({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-1 py-5">
      <span className="text-mx-muted mb-1.5 text-[9px] font-semibold tracking-[1.4px]">
        {label}
      </span>
      <span
        className="font-mx-serif text-[28px] leading-[30px]"
        style={{ color: scoreTint(value) }}
      >
        {fmtScore(value)}
      </span>
      <span className="text-mx-muted mt-px text-[10px]">/10</span>
    </div>
  );
}

/* ─── Day detail modal ───────────────────────────────────────────────────── */
export function DayModal({
  data,
  onClose,
  onNewScan,
}: {
  data: DayData | null;
  onClose: () => void;
  onNewScan: () => void;
}) {
  if (!data) return null;
  const { photo, scan, dateStr } = data;
  const photoUrl = photo
    ? api.resolveAttachmentUrl(photo.image_url ?? photo.photo_url)
    : undefined;
  const hasMetrics =
    !!scan &&
    (scan.score != null || scan.appeal != null || scan.potential != null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[360px] overflow-hidden rounded-[24px] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        {photoUrl ? (
          <div className="relative aspect-[1/1.1] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute bottom-3 left-3 rounded-[10px] bg-black/50 px-2.5 py-1">
              <span className="text-[12px] font-medium tracking-[0.2px] text-white">
                {formatDayLabel(dateStr)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-9">
            <YouIcon name="camera" className="text-mx-muted size-8" />
            <p className="text-mx-ink mt-1 text-[15px] font-semibold">
              {formatDayLabel(dateStr)}
            </p>
            <button
              onClick={onNewScan}
              className="bg-mx-ink mt-1.5 rounded-full px-[18px] py-[9px] text-[13px] font-medium tracking-[0.2px] text-white"
            >
              Take a photo →
            </button>
          </div>
        )}

        {/* Metrics */}
        {hasMetrics ? (
          <div className="border-mx-border flex border-t">
            <MetricTile label="RATING" value={scan!.score} />
            <div className="bg-mx-border my-[14px] w-px" />
            <MetricTile label="APPEAL" value={scan!.appeal} />
            <div className="bg-mx-border my-[14px] w-px" />
            <MetricTile label="POTENTIAL" value={scan!.potential} />
          </div>
        ) : scan ? (
          <div className="border-mx-border flex border-t">
            <MetricTile label="SCORE" value={scan.score} />
          </div>
        ) : (
          <div className="border-mx-border flex items-center justify-between border-t px-5 py-4">
            <span className="text-mx-muted text-[13px]">No scan on this day</span>
            <button
              onClick={onNewScan}
              className="text-mx-ink text-[13px] font-semibold"
            >
              Scan now →
            </button>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-[30px] items-center justify-center rounded-full bg-white/85"
        >
          <YouIcon name="close" className="text-mx-ink size-[18px]" />
        </button>
      </div>
    </div>
  );
}

/* ─── Progress calendar ──────────────────────────────────────────────────── */
export function ProgressCalendar({
  progressPhotos,
  scanByDate,
  onScan,
}: {
  progressPhotos: ProgressPhoto[];
  scanByDate: Record<string, ScanPoint>;
  onScan: () => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [openDay, setOpenDay] = useState<DayData | null>(null);

  const goBack = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const isFuture =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());
  const goForward = () => {
    if (isFuture) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const photoByDate = useMemo(() => {
    const map: Record<string, ProgressPhoto> = {};
    progressPhotos.forEach((ph) => {
      if (ph.created_at) {
        const d = ph.created_at.split("T")[0];
        if (!map[d]) map[d] = ph;
      }
    });
    return map;
  }, [progressPhotos]);

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstWeekday + 6) % 7; // Monday-first
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: number[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(0);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(0);

  return (
    <div>
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between">
        <button
          onClick={goBack}
          aria-label="Previous month"
          className="text-mx-ink flex size-[30px] items-center justify-center"
        >
          <YouIcon name="chevron-back" className="size-[18px]" />
        </button>
        <span className="text-mx-ink text-[14px] font-semibold tracking-[-0.2px]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={goForward}
          disabled={isFuture}
          aria-label="Next month"
          className={`flex size-[30px] items-center justify-center ${isFuture ? "text-mx-border-light" : "text-mx-ink"}`}
        >
          <YouIcon name="chevron-forward" className="size-[18px]" />
        </button>
      </div>

      {/* Weekday heads (Mon-first) */}
      <div className="mb-1 grid grid-cols-7 gap-[3px]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            className="text-mx-muted text-center text-[10.5px] font-medium tracking-[0.2px]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-[3px]">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="aspect-square" />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const photo = photoByDate[dateStr];
          const scan = scanByDate[dateStr];
          const isToday = dateStr === todayStr;
          const hasContent = !!photo || !!scan;
          const photoUrl = photo
            ? api.resolveAttachmentUrl(photo.image_url ?? photo.photo_url)
            : undefined;

          return (
            <button
              key={dateStr}
              onClick={() => {
                if (hasContent) setOpenDay({ photo, scan, dateStr });
                else if (isToday) onScan();
              }}
              className="flex aspect-square items-center justify-center"
            >
              {photoUrl ? (
                <div
                  className={`relative size-[92%] overflow-hidden rounded-[5px] ${isToday ? "border-mx-ink border-[1.5px]" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                  {scan ? (
                    <span
                      className="absolute bottom-[3px] right-[3px] size-[6px] rounded-full border border-white"
                      style={{ backgroundColor: SCAN_GREEN }}
                    />
                  ) : null}
                </div>
              ) : (
                <div
                  className={`flex size-[80%] flex-col items-center justify-center rounded-[5px] ${
                    isToday
                      ? "bg-mx-ink"
                      : scan
                        ? "bg-[rgba(46,125,82,0.10)]"
                        : ""
                  }`}
                >
                  <span
                    className={`text-[11.5px] ${isToday ? "font-semibold text-white" : "text-mx-ink"}`}
                  >
                    {day}
                  </span>
                  {scan && !isToday ? (
                    <span
                      className="mt-px size-[4px] rounded-full"
                      style={{ backgroundColor: SCAN_GREEN }}
                    />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <DayModal
        data={openDay}
        onClose={() => setOpenDay(null)}
        onNewScan={() => {
          setOpenDay(null);
          onScan();
        }}
      />
    </div>
  );
}
