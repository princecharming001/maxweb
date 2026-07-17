"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Card, Spinner } from "@/components/max/ui";
import { Icon } from "@/components/max/icons";

// ── helpers ─────────────────────────────────────────────────────────────
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const keyOf = (iso?: string) => (iso ? dateKey(new Date(iso)) : "");
const fmtScore = (n?: number | null) =>
  n == null ? "—" : (n > 10 ? n / 10 : n).toFixed(1);
function scoreTint(n?: number | null) {
  if (n == null) return "var(--color-mx-muted)";
  const v = n > 10 ? n / 10 : n;
  if (v >= 8) return "var(--color-mx-success)";
  if (v >= 6) return "var(--color-mx-accent)";
  if (v >= 4) return "var(--color-mx-warning)";
  return "var(--color-mx-error)";
}

interface DayData {
  photo?: string;
  rating?: number;
  appeal?: number;
  potential?: number;
}

export default function YouPage() {
  const { user, isPaid, isScanUser } = useMaxAuth();
  const router = useRouter();
  const canSeeHistory = isPaid || isScanUser;

  const first = user?.first_name || user?.username || "you";

  const streakQ = useQuery({
    queryKey: queryKeys.schedulesActiveFull,
    queryFn: () => api.getActiveSchedulesFull(),
  });
  const streak =
    (streakQ.data as { schedule_streak?: { current?: number } } | undefined)
      ?.schedule_streak?.current ?? 0;

  const photosQ = useQuery({
    queryKey: ["progressPhotos"],
    queryFn: () => api.getProgressPhotos(),
    enabled: canSeeHistory,
  });
  const scansQ = useQuery({
    queryKey: queryKeys.scanHistory,
    queryFn: () => api.getScanHistory(),
    enabled: canSeeHistory,
  });
  const marketQ = useQuery({
    queryKey: queryKeys.marketplace,
    queryFn: () => api.getMarketplace(),
  });

  // Join photos + scans into a per-day map.
  const byDay = useMemo(() => {
    const map: Record<string, DayData> = {};
    const photos =
      (photosQ.data as { photos?: unknown[] } | unknown[] | undefined) ?? [];
    const plist = (Array.isArray(photos) ? photos : (photos as { photos?: unknown[] }).photos) ?? [];
    for (const p of plist as { created_at?: string; photo_url?: string; face_rating?: number }[]) {
      const k = keyOf(p.created_at);
      if (!k) continue;
      map[k] = { ...map[k], photo: api.resolveAttachmentUrl(p.photo_url), rating: p.face_rating };
    }
    const scans =
      (scansQ.data as { scans?: unknown[] } | unknown[] | undefined) ?? [];
    const slist = (Array.isArray(scans) ? scans : (scans as { scans?: unknown[] }).scans) ?? [];
    for (const s of slist as Record<string, unknown>[]) {
      const k = keyOf(s.created_at as string);
      if (!k) continue;
      const a = (s.analysis as Record<string, number>) ?? (s as Record<string, number>);
      map[k] = {
        ...map[k],
        rating: (a.overall_score as number) ?? map[k]?.rating,
        appeal: a.appeal_score as number,
        potential: a.potential_score as number,
      };
    }
    return map;
  }, [photosQ.data, scansQ.data]);

  const purchases = useMemo(() => {
    const m = marketQ.data as { maxxes?: unknown[]; courses?: unknown[] } | undefined;
    const all = [...(m?.maxxes ?? []), ...(m?.courses ?? [])] as {
      id: string;
      title?: string;
      name?: string;
      entered?: boolean;
    }[];
    return all.filter((x) => x.entered);
  }, [marketQ.data]);

  return (
    <div className="mx-auto max-w-[720px] pb-10">
      <div className="mx-label">you</div>
      <h1 className="font-mx-serif text-mx-ink mt-1 text-[40px] leading-none capitalize">
        {first}
      </h1>

      {/* Streak */}
      <Card className="mt-5 flex items-center gap-4 px-5 py-4">
        <div className="relative flex size-14 shrink-0 items-center justify-center">
          <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
            <circle cx="28" cy="28" r="25" fill="none" stroke="var(--color-mx-surface)" strokeWidth="4" />
            <circle
              cx="28"
              cy="28"
              r="25"
              fill="none"
              stroke="var(--color-mx-accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 25}
              strokeDashoffset={2 * Math.PI * 25 * (1 - Math.min(streak, 30) / 30)}
            />
          </svg>
          <span className="text-mx-ink text-[18px] font-semibold tabular-nums">{streak}</span>
        </div>
        <div>
          <div className="text-mx-ink text-[15px] font-medium">day streak</div>
          <div className="text-mx-muted text-[13px]">
            {streak > 0 ? "Showing up. That is the whole game." : "Close out today to start one."}
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="mx-label mt-8 mb-2">Progress</div>
      <Card className="p-4">
        {!canSeeHistory ? (
          <CalendarStatus
            icon="lock"
            title="Scan history is a paid feature"
            body="Upgrade to Chad or Chadlite to see your progress over time."
            action={{ label: "Upgrade →", onClick: () => router.push("/app/you/subscription") }}
          />
        ) : photosQ.isLoading || scansQ.isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : photosQ.isError || scansQ.isError ? (
          <CalendarStatus
            icon="wifi"
            title="Couldn't load your progress"
            action={{
              label: "Retry",
              onClick: () => {
                photosQ.refetch();
                scansQ.refetch();
              },
            }}
          />
        ) : Object.keys(byDay).length === 0 ? (
          <CalendarStatus
            icon="camera"
            title="No scans yet"
            body="Take your first scan to start your progress calendar."
            action={{ label: "Scan now →", onClick: () => router.push("/app/scan") }}
          />
        ) : (
          <ProgressCalendar byDay={byDay} onScan={() => router.push("/app/scan")} />
        )}
      </Card>

      <Section
        title="Achievements"
        rows={[
          { label: "Achievements", href: "/app/you/achievements" },
          { label: "Scan archive", href: "/app/you/scans" },
          { label: "Progress photos", href: "/app/you/photos" },
        ]}
      />
      <Section
        title="Plan"
        rows={[
          { label: "Week view", sub: "Your schedule", href: "/app/today" },
          { label: "Calendar & places", sub: "Busy blocks and the places in your day.", href: "/app/you/settings" },
        ]}
      />
      <Section
        title="Purchases"
        rows={
          purchases.length
            ? purchases.map((p) => ({
                label: p.title || p.name || "Program",
                href: `/app/explore/${p.id}`,
              }))
            : [{ label: "No programs yet", href: "/app/explore" }]
        }
      />
      <Section
        title="Account"
        rows={[
          { label: "Settings", href: "/app/you/settings" },
          { label: "Manage subscription", href: "/app/you/subscription" },
          { label: "Privacy policy", href: "/legal/privacy" },
          { label: "Terms of service", href: "/legal/terms" },
        ]}
      />
    </div>
  );
}

// ── Progress calendar ───────────────────────────────────────────────────
function ProgressCalendar({
  byDay,
  onScan,
}: {
  byDay: Record<string, DayData>;
  onScan: () => void;
}) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [openDay, setOpenDay] = useState<string | null>(null);

  const first = new Date(view.y, view.m, 1);
  const startPad = first.getDay();
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const isCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();
  const monthLabel = first.toLocaleString("en-US", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysIn }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setView((v) => ({ ...(v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }) }))}
          className="text-mx-muted hover:text-mx-ink px-2 text-[18px]"
        >
          ‹
        </button>
        <div className="text-mx-ink text-[14px] font-medium">{monthLabel}</div>
        <button
          disabled={isCurrentMonth}
          onClick={() => setView((v) => ({ ...(v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }) }))}
          className="text-mx-muted hover:text-mx-ink px-2 text-[18px] disabled:opacity-30"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-mx-muted text-center text-[11px]">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day == null) return <div key={i} />;
          const k = `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const data = byDay[k];
          const isFuture = new Date(view.y, view.m, day) > today;
          return (
            <button
              key={i}
              disabled={isFuture}
              onClick={() => setOpenDay(k)}
              className={`relative aspect-square overflow-hidden rounded-mx-sm text-[11px] ${
                data?.photo ? "" : "bg-mx-surface"
              } ${isFuture ? "opacity-30" : ""}`}
            >
              {data?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.photo} alt="" className="absolute inset-0 size-full object-cover" />
              ) : null}
              <span
                className={`absolute left-1 top-0.5 ${data?.photo ? "text-white" : "text-mx-muted"}`}
              >
                {day}
              </span>
              {data?.rating != null ? (
                <span className="bg-mx-success absolute bottom-1 right-1 size-1.5 rounded-full" />
              ) : null}
            </button>
          );
        })}
      </div>

      {openDay ? (
        <DayModal day={openDay} data={byDay[openDay]} onClose={() => setOpenDay(null)} onScan={onScan} />
      ) : null}
    </div>
  );
}

function DayModal({
  day,
  data,
  onClose,
  onScan,
}: {
  day: string;
  data?: DayData;
  onClose: () => void;
  onScan: () => void;
}) {
  const label = new Date(day + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="bg-mx-card relative w-full max-w-[360px] rounded-mx-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-mx-ink text-[16px] font-semibold">{label}</div>
        <div className="bg-mx-surface mt-3 aspect-square overflow-hidden rounded-mx-lg">
          {data?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo} alt="" className="size-full object-cover" />
          ) : (
            <button onClick={onScan} className="flex size-full flex-col items-center justify-center gap-2">
              <Icon name="scan" className="text-mx-muted size-8" />
              <span className="text-mx-accent text-[14px]">Take a photo →</span>
            </button>
          )}
        </div>
        {data?.rating != null || data?.appeal != null || data?.potential != null ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["Rating", data?.rating],
              ["Appeal", data?.appeal],
              ["Potential", data?.potential],
            ].map(([l, v]) => (
              <div key={l as string} className="bg-mx-surface rounded-mx-md py-3 text-center">
                <div className="text-[20px] font-semibold" style={{ color: scoreTint(v as number) }}>
                  {fmtScore(v as number)}
                </div>
                <div className="mx-label mt-0.5">{l as string}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-center">
            <p className="text-mx-muted text-[14px]">No scan on this day</p>
            <button onClick={onScan} className="text-mx-accent mt-1 text-[14px]">
              Scan now →
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="bg-mx-surface text-mx-ink mt-4 w-full rounded-mx-md py-2.5 text-[14px]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function CalendarStatus({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <Icon name={icon === "lock" ? "settings" : "scan"} className="text-mx-muted size-8" />
      <div className="text-mx-ink mt-3 text-[15px] font-medium">{title}</div>
      {body ? <p className="text-mx-muted mt-1 max-w-[280px] text-[13px]">{body}</p> : null}
      {action ? (
        <button onClick={action.onClick} className="text-mx-accent mt-3 text-[14px] font-medium">
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

function Section({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; sub?: string; href: string }[];
}) {
  return (
    <div className="mt-8">
      <div className="mx-label mb-2">{title}</div>
      <div className="overflow-hidden rounded-mx-lg border border-mx-border">
        {rows.map((r, i) => (
          <Link
            key={r.href + r.label}
            href={r.href}
            className={`hover:bg-mx-surface flex items-center justify-between px-4 py-3.5 transition ${
              i > 0 ? "border-mx-border border-t" : ""
            }`}
          >
            <div>
              <div className="text-mx-ink text-[15px]">{r.label}</div>
              {r.sub ? <div className="text-mx-muted text-[13px]">{r.sub}</div> : null}
            </div>
            <Icon name="chevron" className="text-mx-muted size-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
