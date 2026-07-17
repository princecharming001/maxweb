"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/max/api";
import { loadAnswers, saveAnswers } from "@/lib/max/onboarding";
import { Button } from "@/components/max/ui";
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

  return (
    <div className="flex min-h-[86vh] flex-col items-center justify-center text-center">
      <div className="mx-label text-mx-accent">Totally optional</div>
      <h1 className="font-mx-serif text-mx-ink mt-4 text-[30px] leading-[1.15] whitespace-pre-line">
        {"A face scan tunes\nyour plan"}
      </h1>
      <p className="text-mx-muted mt-3 max-w-[360px] text-[15px] leading-relaxed">
        Three quick photos and Max reads your features — a rating, an appeal
        score, and where you can go — then points your plan at the highest-leverage
        changes. Skip it and you can scan anytime.
      </p>
      <div className="mt-8 w-full max-w-[320px] space-y-3">
        <Button full size="lg" variant="accent" onClick={() => setMode("capture")}>
          Scan my face
        </Button>
        <button onClick={skip} className="text-mx-muted w-full text-[14px]">
          Skip for now
        </button>
      </div>
    </div>
  );
}
