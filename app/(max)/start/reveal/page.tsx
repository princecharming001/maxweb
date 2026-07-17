"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { loadAnswers } from "@/lib/max/onboarding";
import { Button, Spinner } from "@/components/max/ui";
import { useMaxAuth } from "@/context/MaxAuthContext";
import ScanResults, { type Scan } from "@/components/max/scan/ScanResults";

/** Results gate + reveal — mirrors the iOS locked FaceScanResults teaser.
 *  Shows the FULL breakdown (every metric, locked → "—"/lock). Polls the
 *  background scan until its analysis lands. */
function RevealInner() {
  const router = useRouter();
  const { isPaid } = useMaxAuth();
  const [scanned, setScanned] = useState(false);
  const [waited, setWaited] = useState(0);

  useEffect(() => {
    const a = loadAnswers();
    setScanned(!a.scan_skipped);
  }, []);

  // Poll the latest scan while it analyzes in the background (~up to 60s).
  const scanQ = useQuery({
    queryKey: ["onboardingLatestScan"],
    queryFn: () => api.getLatestScan(),
    enabled: scanned,
    refetchInterval: (q) => {
      const s = q.state.data as Scan | null;
      return s?.analysis ? false : 2500;
    },
  });
  const scan = scanQ.data as Scan | null;
  const analysisReady = !!scan?.analysis;

  useEffect(() => {
    if (!scanned || analysisReady) return;
    const t = setInterval(() => setWaited((w) => w + 1), 1000);
    return () => clearInterval(t);
  }, [scanned, analysisReady]);

  // No scan taken → simple "plan ready" reveal.
  if (!scanned) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
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
        <div className="mt-8 w-full max-w-[320px]">
          <Button full size="lg" onClick={() => router.push("/start/account")}>
            Save my plan
          </Button>
        </div>
      </div>
    );
  }

  // Scan still analyzing.
  if (!analysisReady && waited < 60) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <Spinner className="size-8" />
        <div className="font-mx-serif text-mx-ink mt-6 text-[24px]">
          Building your facial profile
        </div>
        <p className="text-mx-muted mt-2 text-[14px]">
          Reading your scan and mapping it to a routine…
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {scan?.analysis ? (
        <ScanResults
          scan={scan}
          locked={!isPaid}
          onUnlock={() => router.push("/start/account")}
          ctaLabel="Save my plan"
        />
      ) : (
        // Timed out — still let them continue.
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="font-mx-serif text-mx-ink text-[26px]">Your plan is ready</h1>
          <p className="text-mx-muted mt-2 max-w-[340px] text-[14px]">
            Your scan is still finishing — it&apos;ll be waiting in Scan. Let&apos;s save your plan.
          </p>
          <div className="mt-6 w-full max-w-[320px]">
            <Button full size="lg" onClick={() => router.push("/start/account")}>
              Save my plan
            </Button>
          </div>
        </div>
      )}
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
