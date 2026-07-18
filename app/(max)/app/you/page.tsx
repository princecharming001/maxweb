"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { GlassCard } from "@/components/max/you/GlassCard";
import { YouIcon } from "@/components/max/you/icons";
import {
  ProgressCalendar,
  CalendarStatusCard,
  parseScanPoints,
  httpStatus,
  type ScanPoint,
  type ProgressPhoto,
  type CalStatus,
} from "@/components/max/you/ProgressCalendar";
import { MaxesCard, type ActiveMax } from "@/components/max/profile/MaxesCard";
import { RankCard, type RankGamification } from "@/components/max/profile/RankCard";
import { WeeklyCard } from "@/components/max/profile/WeeklyCard";

/**
 * You — web port of the iOS ProfileScreen
 * (mobile/screens/profile/ProfileScreen.tsx). Top to bottom: header (back +
 * settings), identity (serif name + avatar + edit pill), "your maxes" card,
 * rank / XP card, "weekly progress" card, then the "progress" month calendar
 * (per-day photo thumbnails, scan dots, day-detail modal).
 */
export default function YouPage() {
  const router = useRouter();
  const { user, isPaid, isScanUser } = useMaxAuth();
  const canSeeScanHistory = isPaid || isScanUser;

  // ── Identity ──────────────────────────────────────────────────────────
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
    : user?.username || (user?.email ? user.email.split("@")[0] : "you");
  const initials = (
    user?.first_name?.[0] ??
    user?.username?.[0] ??
    user?.email?.[0] ??
    "M"
  ).toUpperCase();
  const avatarUrl = api.resolveAttachmentUrl(user?.profile?.avatar_url);

  // ── Data ──────────────────────────────────────────────────────────────
  const schedQ = useQuery({
    queryKey: queryKeys.schedulesActiveFull,
    queryFn: () => api.getActiveSchedulesFull(),
    staleTime: 60_000,
  });
  const streak = schedQ.data?.schedule_streak?.current ?? 0;
  // The api.ts `Gamification` type is a stale loose port (rank typed as a
  // number); the real backend returns the iOS rank shape (rank name string),
  // so cast through `unknown` into the contract RankCard owns.
  const gamification = (schedQ.data?.gamification ??
    null) as unknown as RankGamification | null;

  const marketQ = useQuery({
    queryKey: queryKeys.marketplace,
    queryFn: () => api.getMarketplace(),
    staleTime: 60_000,
  });
  const activeMaxes = useMemo<ActiveMax[]>(() => {
    const maxxes = marketQ.data?.maxxes ?? [];
    return maxxes
      .filter((m) => m.entered)
      .map((m) => ({ id: m.id, title: m.title, color: m.color }));
  }, [marketQ.data]);

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

  const progressPhotos = useMemo<ProgressPhoto[]>(() => {
    const d = photosQ.data as
      | { photos?: ProgressPhoto[] }
      | ProgressPhoto[]
      | undefined;
    if (Array.isArray(d)) return d;
    return d?.photos ?? [];
  }, [photosQ.data]);

  const scanPts = useMemo(() => parseScanPoints(scansQ.data), [scansQ.data]);
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

  const goScan = () => router.push("/app/scan");

  return (
    // Soft gray canvas (bleeds past the shell's padded column), white cards.
    <div className="bg-mx-surface -mx-5 -my-6 min-h-screen px-5 pb-12 pt-5">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-1 flex items-center justify-between">
        <Link
          href="/app/today"
          aria-label="Back"
          className="text-mx-ink -ml-2 flex size-9 items-center justify-center"
        >
          <YouIcon name="chevron-back" className="size-5" />
        </Link>
        <Link
          href="/app/you/settings"
          aria-label="Settings"
          className="text-mx-ink -mr-2 flex size-9 items-center justify-center"
        >
          <YouIcon name="settings" className="size-[22px]" />
        </Link>
      </div>

      {/* ── Identity ───────────────────────────────────────────────── */}
      <div className="mb-[18px] mt-1 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-mx-serif text-mx-ink text-[40px] lowercase leading-none tracking-[-0.5px]">
            {displayName}
          </h1>
          <Link
            href="/app/you/personal"
            className="bg-mx-ink mt-3 inline-block rounded-full px-[15px] py-[7px] text-[12.5px] font-medium text-white"
          >
            Edit Profile
          </Link>
        </div>
        <Link
          href="/app/you/personal"
          aria-label="Edit profile photo"
          className="shrink-0"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="bg-mx-surface size-[60px] rounded-full object-cover"
            />
          ) : (
            <div className="bg-mx-border-light flex size-[60px] items-center justify-center rounded-full">
              <span className="font-mx-serif text-mx-muted text-[22px]">
                {initials}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Cards ──────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <MaxesCard actives={activeMaxes} total={5} />

        <RankCard data={gamification} />

        <WeeklyCard streak={streak} />

        {/* Progress — month calendar with scan/photo history */}
        <GlassCard radius={18}>
          <div className="px-[18px] py-4">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="font-mx-serif text-mx-ink text-[17px] tracking-[-0.3px]">
                progress
              </h2>
              <Link
                href="/app/you/scans"
                className="text-mx-muted text-[13px] font-medium"
              >
                All scans →
              </Link>
            </div>
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
    </div>
  );
}
