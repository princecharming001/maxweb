"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/max/api";
import { loadAnswers, saveAnswers } from "@/lib/max/onboarding";
import CameraCapture, { type Captured } from "@/components/max/scan/CameraCapture";

/** ScanOffer — mirrors the iOS "TOTALLY OPTIONAL / A face scan tunes your plan"
 *  step. Scanning here analyzes in the background while the quiz runs. */
export default function StartScanPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"offer" | "capture">("offer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function mark(scanned: boolean, scanId?: string) {
    const a = loadAnswers();
    saveAnswers({ ...a, scan_skipped: !scanned, scan_id: scanId ?? null });
  }

  function onComplete(c: Captured) {
    // Funnel V4 behavior: upload + analyze run in the BACKGROUND while the
    // user moves straight on to the quiz. The reveal/results gate later polls
    // getLatestScan until the analysis lands — so we never block here.
    mark(true);
    api
      .uploadScanTripleBlobs(c.front, c.left, c.right)
      .then(({ scan_id }) => {
        mark(true, scan_id);
        return api.analyzeScan(scan_id).catch(() => undefined);
      })
      .catch(() => undefined);
    router.push("/start/quiz");
  }

  function skip() {
    mark(false);
    router.push("/start/quiz");
  }

  if (mode === "capture") {
    return (
      <div className="pt-6">
        <CameraCapture onComplete={onComplete} submitting={submitting} />
        {error ? (
          <p className="text-mx-error mt-4 text-center text-[14px]">{error}</p>
        ) : null}
        <div className="mt-6 text-center">
          <button onClick={skip} className="text-mx-muted text-[14px] underline">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // iOS ScanOffer verbatim: left-aligned kicker/serif/sub weighted into the
  // lower half of the screen (big top whitespace), black + white pill pair.
  return (
    <div className="flex min-h-[86vh] flex-col">
      <div className="flex-[1.1]" />
      <div>
        <div className="mx-label text-mx-ink">TOTALLY OPTIONAL</div>
        <h1 className="font-mx-serif text-mx-ink mt-2 text-[36px] font-normal leading-[42px] tracking-[-0.8px]">
          A face scan tunes
          <br />
          your plan
        </h1>
        <p className="mt-3 text-[15px] leading-[22px] text-[#6b6b6b]">
          It sharpens the skin and jaw parts of your routine. Do it later or
          never. Your plan works either way.
        </p>
        <div className="mt-7 flex flex-col gap-2.5">
          <button
            onClick={() => setMode("capture")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-mx-ink text-[16px] font-semibold tracking-[0.2px] text-white shadow-mx-md transition"
          >
            Scan now
          </button>
          <button
            onClick={skip}
            className="flex h-14 w-full items-center justify-center rounded-full border border-mx-border bg-white text-[16px] font-semibold tracking-[0.2px] text-mx-ink shadow-mx-md transition"
          >
            Skip for now
          </button>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
}
