"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Spinner } from "@/components/max/ui";
import ScanResults, { type Scan } from "@/components/max/scan/ScanResults";

export default function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isPaid, isScanUser } = useMaxAuth();
  const q = useQuery({
    queryKey: queryKeys.scanById(id),
    queryFn: () => api.getScanById(id),
  });
  const scan = q.data as Scan | undefined;

  return (
    <div className="mx-auto max-w-[720px]">
      <SubPageHeader title="Scan" back="/app/you/scans" />
      {q.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : scan ? (
        <ScanResults scan={scan} locked={!isPaid && !isScanUser} />
      ) : (
        <p className="text-mx-muted text-[14px]">Scan not found.</p>
      )}
    </div>
  );
}
