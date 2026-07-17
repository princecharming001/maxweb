"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import SubPageHeader from "@/components/max/SubPageHeader";
import { LinkButton, Spinner } from "@/components/max/ui";
import ScanResults, { type Scan } from "@/components/max/scan/ScanResults";

export default function ScanResultsPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = use(params);
  const { isPaid, isScanUser } = useMaxAuth();
  const q = useQuery({
    queryKey: queryKeys.scanById(scanId),
    queryFn: () => api.getScanById(scanId),
  });
  const scan = q.data as Scan | undefined;

  return (
    <div className="mx-auto max-w-[720px]">
      <SubPageHeader title="Your results" back="/app/scan" />
      {q.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : scan ? (
        <>
          <ScanResults scan={scan} locked={!isPaid && !isScanUser} />
          <div className="mt-6 flex justify-center gap-3">
            <LinkButton href="/app/today" variant="accent">
              Build my plan
            </LinkButton>
            <Link
              href="/app/scan"
              className="text-mx-muted flex items-center text-[14px]"
            >
              Back to Scan
            </Link>
          </div>
        </>
      ) : (
        <p className="text-mx-muted text-[14px]">Couldn&apos;t load your results.</p>
      )}
    </div>
  );
}
