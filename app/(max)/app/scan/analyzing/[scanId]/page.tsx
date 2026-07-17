"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/max/api";
import { Button, Spinner } from "@/components/max/ui";

const POLL_MS = 2500;
const MAX_MS = 60_000;

export default function AnalyzingPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = use(params);
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    // Deterministic-ish start marker without Date.now dependency in render.
    const start = performance.now();
    startRef.current = start;

    async function poll() {
      if (!active) return;
      try {
        const scan = await api.getScanById(scanId);
        if (scan?.analysis) {
          router.replace(`/app/scan/results/${scanId}`);
          return;
        }
      } catch {
        /* keep polling */
      }
      if (performance.now() - start > MAX_MS) {
        setTimedOut(true);
        return;
      }
      if (active) setTimeout(poll, POLL_MS);
    }
    poll();
    return () => {
      active = false;
    };
  }, [scanId, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[420px] flex-col items-center justify-center text-center">
      {!timedOut ? (
        <>
          <Spinner className="size-8" />
          <div className="font-mx-serif text-mx-ink mt-6 text-[24px]">
            Analyzing your scan
          </div>
          <p className="text-mx-muted mt-2 text-[14px]">
            Reading your features — this takes a few seconds.
          </p>
        </>
      ) : (
        <>
          <div className="font-mx-serif text-mx-ink text-[24px]">
            Still working…
          </div>
          <p className="text-mx-muted mt-2 text-[14px]">
            This is taking longer than usual. Check your results in a moment.
          </p>
          <div className="mt-5 flex gap-3">
            <Button onClick={() => router.replace(`/app/scan/results/${scanId}`)}>
              View results
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setTimedOut(false);
                router.refresh();
              }}
            >
              Keep waiting
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
