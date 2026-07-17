"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { GlassCard } from "@/components/max/you/GlassCard";
import { YouIcon, type YouIconName } from "@/components/max/you/icons";
import {
  ProgressCalendar,
  CalendarStatusCard,
  parseScanPoints,
  httpStatus,
  type ScanPoint,
  type ProgressPhoto,
  type CalStatus,
} from "@/components/max/you/ProgressCalendar";

/**
 * You — web port of mobile/screens/you/YouScreen.tsx.
 * Top-to-bottom parity: kicker + name, streak card, progress calendar (with
 * per-day photo thumbnails, scan dots and a day-detail modal), then the
 * Achievements / Plan / Purchases / Account row sections.
 */

interface PurchaseItem {
  id: string;
  title?: string;
  price_label?: string;
  entered?: boolean;
  icon?: string;
}

type Row = {
  icon: YouIconName;
  label: string;
  sub?: string;
  href: string;
};

export default function YouPage() {
  const router = useRouter();
  const { user, isPaid, isScanUser } = useMaxAuth();
  // No web feature-flag layer; the /app/you/scans archive route exists, so the
  // "Scan archive" row is always shown (mirrors the mobile faceScan flag = on).
  const faceScanEnabled = true;
  const canSeeScanHistory = isPaid || isScanUser;

  const firstName = user?.first_name || user?.username || "you";

  const schedQ = useQuery({
    queryKey: queryKeys.schedulesActiveFull,
    queryFn: () => api.getActiveSchedulesFull(),
    staleTime: 60_000,
  });
  const streak = schedQ.data?.schedule_streak?.current ?? 0;

  const photosQ = useQuery({
    queryKey: queryKeys.progressPhotos,
    queryFn: () => api.getProgressPhotos(),
    staleTime: 60_000,
    retry: 1,
  });

  const scansQ = useQuery({
    queryKey: queryKeys.scanHistory,
    queryFn: () => api.getScanHistory(),
    staleTime: 60_000,
    retry: 1,
    enabled: canSeeScanHistory,
  });

  const marketQ = useQuery({
    queryKey: queryKeys.marketplace,
    queryFn: () => api.getMarketplace(),
    staleTime: 60_000,
  });

  const progressPhotos = useMemo<ProgressPhoto[]>(() => {
    const d = photosQ.data as
      | { photos?: ProgressPhoto[] }
      | ProgressPhoto[]
      | undefined;
    if (Array.isArray(d)) return d;
    return d?.photos ?? [];
  }, [photosQ.data]);

  const scanPts = useMemo(() => parseScanPoints(scansQ.data), [scansQ.data]);

  // date → most-recent scan metrics for that day
  const scanByDate = useMemo(() => {
    const map: Record<string, ScanPoint> = {};
    scanPts.forEach((pt) => {
      if (pt.at) map[pt.at.split("T")[0]] = pt;
    });
    return map;
  }, [scanPts]);

  // Drive the status card shown above/instead of the calendar (mirrors iOS).
  const calStatus = useMemo<CalStatus>(() => {
    if (photosQ.isPending || (canSeeScanHistory && scansQ.isPending))
      return { kind: "loading" };
    if (photosQ.isError) {
      const code = httpStatus(photosQ.error);
      if (code === 402 || code === 403) return { kind: "paywall" };
      return {
        kind: "error",
        msg: "Check your connection and try again.",
        retry: () => {
          void photosQ.refetch();
          void scansQ.refetch();
        },
      };
    }
    if (scansQ.isError && canSeeScanHistory) {
      const code = httpStatus(scansQ.error);
      if (code === 402 || code === 403) return { kind: "paywall" };
      return {
        kind: "error",
        msg: "Could not load your scan history. Check your connection.",
        retry: () => {
          void scansQ.refetch();
        },
      };
    }
    if (!canSeeScanHistory && progressPhotos.length === 0)
      return { kind: "empty" };
    if (
      canSeeScanHistory &&
      progressPhotos.length === 0 &&
      scanPts.length === 0
    )
      return { kind: "empty" };
    return { kind: "ok" };
  }, [
    photosQ.isPending,
    photosQ.isError,
    photosQ.error,
    photosQ.refetch,
    scansQ.isPending,
    scansQ.isError,
    scansQ.error,
    scansQ.refetch,
    canSeeScanHistory,
    progressPhotos.length,
    scanPts.length,
  ]);

  const purchases = useMemo<PurchaseItem[]>(() => {
    const m = marketQ.data as
      | { maxxes?: PurchaseItem[]; courses?: PurchaseItem[] }
      | undefined;
    return [...(m?.maxxes ?? []), ...(m?.courses ?? [])].filter(
      (item) => item.entered,
    );
  }, [marketQ.data]);

  const goScan = () => router.push("/app/scan");

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="text-mx-muted text-[12px] font-semibold uppercase tracking-[2px]">
        you
      </div>
      <h1 className="font-mx-serif text-mx-ink mt-0.5 text-[40px] leading-none">
        {firstName}
      </h1>

      {/* Streak */}
      <div className="mt-4">
        <GlassCard radius={20}>
          <div className="flex items-center p-[18px]">
            <div className="border-mx-accent flex size-14 items-center justify-center rounded-full border-[3px]">
              <span className="text-mx-ink text-[20px] font-semibold tabular-nums">
                {streak}
              </span>
            </div>
            <div className="ml-[14px] flex-1">
              <div className="text-mx-ink text-[15px] font-semibold">
                day streak
              </div>
              <div className="text-mx-muted mt-0.5 text-[13px]">
                {streak > 0
                  ? "Showing up. That is the whole game."
                  : "Close out today to start one."}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Progress calendar */}
      <div className="mt-6">
        <SectionTitle>PROGRESS</SectionTitle>
        <GlassCard radius={20}>
          <div className="p-[14px]">
            {calStatus.kind !== "ok" ? (
              <CalendarStatusCard
                status={calStatus}
                onUpgrade={() => router.push("/app/you/subscription")}
              />
            ) : (
              <ProgressCalendar
                progressPhotos={progressPhotos}
                scanByDate={scanByDate}
                onScan={goScan}
              />
            )}
          </div>
        </GlassCard>
      </div>

      <Section
        title="ACHIEVEMENTS"
        rows={[
          {
            icon: "trophy",
            label: "Achievements",
            sub: "Badges & milestones",
            href: "/app/you/achievements",
          },
          ...(faceScanEnabled
            ? ([
                {
                  icon: "images",
                  label: "Scan archive",
                  href: "/app/you/scans",
                },
              ] as Row[])
            : []),
          {
            icon: "trending-up",
            label: "Progress photos",
            href: "/app/you/photos",
          },
        ]}
      />

      <Section
        title="PLAN"
        rows={[
          {
            icon: "calendar",
            label: "Week view",
            sub: "Your schedule",
            href: "/app/today",
          },
          {
            icon: "map",
            label: "Calendar & places",
            sub: "Busy blocks and the places in your day.",
            href: "/app/you/settings",
          },
        ]}
      />

      <Section
        title="PURCHASES"
        rows={
          purchases.length
            ? purchases.map((p) => ({
                icon: "pricetag" as const,
                label: p.title ?? "Program",
                sub: p.price_label,
                href: `/app/explore/${p.id}`,
              }))
            : [
                {
                  icon: "compass" as const,
                  label: "No programs yet",
                  href: "/app/explore",
                },
              ]
        }
      />

      <Section
        title="ACCOUNT"
        rows={[
          { icon: "settings", label: "Settings", href: "/app/you/settings" },
          {
            icon: "card",
            label: "Manage subscription",
            href: "/app/you/subscription",
          },
          {
            icon: "document-text",
            label: "Privacy policy",
            href: "/legal/privacy",
          },
          {
            icon: "reader",
            label: "Terms of service",
            href: "/legal/terms",
          },
        ]}
      />
    </div>
  );
}

/* ─── Section list ───────────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-mx-muted mb-2 ml-1 text-[11px] font-semibold uppercase tracking-[1.6px]">
      {children}
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="mt-6">
      <SectionTitle>{title}</SectionTitle>
      <GlassCard radius={20}>
        <div className="px-1">
          {rows.map((row, i) => (
            <RowItem key={row.label} row={row} last={i === rows.length - 1} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function RowItem({ row, last }: { row: Row; last: boolean }) {
  return (
    <Link
      href={row.href}
      aria-label={row.label}
      className={`flex min-h-[44px] items-center px-3 py-3.5 ${last ? "" : "border-mx-border border-b"}`}
    >
      <div className="flex w-7 items-center justify-center">
        <YouIcon name={row.icon} className="text-mx-ink size-[19px]" />
      </div>
      <div className="ml-2.5 flex-1">
        <div className="text-mx-ink text-[15px]">{row.label}</div>
        {row.sub ? (
          <div className="text-mx-muted mt-px text-[12px]">{row.sub}</div>
        ) : null}
      </div>
      <YouIcon name="chevron-forward" className="text-mx-muted size-4" />
    </Link>
  );
}
