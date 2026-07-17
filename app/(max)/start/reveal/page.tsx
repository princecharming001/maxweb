"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { loadAnswers } from "@/lib/max/onboarding";
import { Button, MetricRing, Spinner } from "@/components/max/ui";

/** Results gate + reveal — mirrors the locked FaceScanResults → RevealV2 step.
 *  If a scan was taken, show the rating (potential locked); otherwise a plain
 *  "your plan is ready" reveal. Completion is marked later, after the schedule
 *  phase, exactly like iOS. */
function RevealInner() {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = loadAnswers();
    setScanned(!a.scan_skipped && !!a.scan_id);
    const t = setTimeout(() => setReady(true), 1100);
    return () => clearTimeout(t);
  }, []);

  const scanQ = useQuery({
    queryKey: ["onboardingLatestScan"],
    queryFn: () => api.getLatestScan(),
    enabled: scanned && ready,
    retry: false,
  });
  const analysis = (scanQ.data as { analysis?: { overall_score?: number; appeal_score?: number } } | null)?.analysis;

  if (!ready) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <Spinner className="size-8" />
        <div className="font-mx-serif text-mx-ink mt-6 text-[24px]">
          {scanned ? "Reading your scan" : "Building your plan"}
        </div>
        <p className="text-mx-muted mt-2 text-[14px]">
          {scanned
            ? "Mapping your features to a routine…"
            : "Matching your goals to a daily routine…"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      {scanned && analysis ? (
        <>
          <div className="mx-label text-mx-accent">Your baseline</div>
          <div className="mt-6 flex items-center gap-6">
            <RingBlock label="Rating" value={analysis.overall_score} />
            <RingBlock label="Appeal" value={analysis.appeal_score} />
            <RingBlock label="Potential" value={0} locked />
          </div>
          <h1 className="font-mx-serif text-mx-ink mt-8 text-[28px] leading-tight">
            Your plan is ready
          </h1>
          <p className="text-mx-muted mt-3 max-w-[360px] text-[15px]">
            We read your scan and mapped your goals to a daily routine. Unlock to
            see your full potential and feature breakdown.
          </p>
        </>
      ) : (
        <>
          <div className="bg-mx-success/15 text-mx-success flex size-16 items-center justify-center rounded-full">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5 10 17l9-10" />
            </svg>
          </div>
          <h1 className="font-mx-serif text-mx-ink mt-6 text-[30px] leading-tight">
            Your plan is ready
          </h1>
          <p className="text-mx-muted mt-3 max-w-[360px] text-[15px]">
            We mapped your goals to a daily routine you can start today.
          </p>
        </>
      )}

      <div className="mt-8 w-full max-w-[320px]">
        <Button full size="lg" onClick={() => router.push("/start/account")}>
          Save my plan
        </Button>
      </div>
    </div>
  );
}

function RingBlock({
  label,
  value,
  locked,
}: {
  label: string;
  value?: number;
  locked?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={locked ? "blur-[6px]" : ""}>
        <MetricRing value={value ?? 0} max={100} size={78} label={value != null ? Math.round(value) : "—"} />
      </div>
      <div className="mx-label mt-1">{label}</div>
    </div>
  );
}

export default function RevealPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
      <RevealInner />
    </Suspense>
  );
}
