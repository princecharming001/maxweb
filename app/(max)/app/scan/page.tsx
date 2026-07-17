"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { LinkButton, Spinner } from "@/components/max/ui";
import ScanResults, { type Scan } from "@/components/max/scan/ScanResults";

export default function ScanHubPage() {
  const { isPaid, isScanUser } = useMaxAuth();
  const q = useQuery({
    queryKey: queryKeys.scanLatest,
    queryFn: () => api.getLatestScan(),
  });
  const scan = q.data as Scan | null | undefined;

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mx-serif text-mx-ink text-[34px] leading-none">
            Scan
          </h1>
          <p className="text-mx-muted mt-2 text-[15px]">
            Track your looks over time with an AI facial analysis.
          </p>
        </div>
        <LinkButton href="/app/scan/capture" variant="accent">
          New scan
        </LinkButton>
      </div>

      <div className="mt-8">
        {q.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : scan?.analysis ? (
          <>
            <div className="mx-label mb-3">Your latest scan</div>
            <ScanResults scan={scan} locked={!isPaid && !isScanUser} />
            <div className="mt-5 text-center">
              <Link
                href="/app/you/scans"
                className="text-mx-accent text-[14px] font-medium"
              >
                See all scans →
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-mx-surface-light rounded-mx-lg flex flex-col items-center px-6 py-16 text-center">
            <div className="font-mx-serif text-mx-ink text-[22px]">
              No scan yet
            </div>
            <p className="text-mx-muted mt-2 max-w-[340px] text-[14px]">
              Take three quick photos and get a rating, appeal and potential
              read plus a feature breakdown.
            </p>
            <LinkButton
              href="/app/scan/capture"
              variant="accent"
              className="mt-5"
            >
              Start your scan
            </LinkButton>
          </div>
        )}
      </div>
    </div>
  );
}
