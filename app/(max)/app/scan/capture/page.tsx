"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/max/api";
import SubPageHeader from "@/components/max/SubPageHeader";
import CameraCapture, { type Captured } from "@/components/max/scan/CameraCapture";

export default function ScanCapturePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onComplete(c: Captured) {
    setSubmitting(true);
    setError(null);
    try {
      const { scan_id } = await api.uploadScanTripleBlobs(c.front, c.left, c.right);
      // Kick off analysis, then hand off to the polling screen.
      await api.analyzeScan(scan_id).catch(() => undefined);
      router.replace(`/app/scan/analyzing/${scan_id}`);
    } catch (err: unknown) {
      const msg =
        (err as Error)?.message ||
        "Upload failed. Check your photos and try again.";
      setError(msg.includes("limit") ? "You've used your scans for now." : msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <SubPageHeader title="Face scan" back="/app/scan" />
      <CameraCapture onComplete={onComplete} submitting={submitting} />
      {error ? (
        <p className="text-mx-error mt-4 text-center text-[14px]">{error}</p>
      ) : null}
    </div>
  );
}
