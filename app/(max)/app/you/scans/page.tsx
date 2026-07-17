"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import SubPageHeader from "@/components/max/SubPageHeader";
import { LinkButton, Spinner } from "@/components/max/ui";

interface ScanRow {
  id: string;
  created_at?: string;
  front_image_url?: string;
  thumbnail_url?: string;
  analysis?: { overall_score?: number; archetype?: string };
  overall_score?: number;
}

export default function ScanArchivePage() {
  const q = useQuery({
    queryKey: queryKeys.scanHistory,
    queryFn: () => api.getScanHistory(),
  });
  const raw = q.data as { scans?: ScanRow[] } | ScanRow[] | undefined;
  const scans: ScanRow[] = Array.isArray(raw) ? raw : (raw?.scans ?? []);

  return (
    <div className="mx-auto max-w-[720px]">
      <SubPageHeader title="Scan archive" />

      {q.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : scans.length === 0 ? (
        <div className="bg-mx-surface-light rounded-mx-lg flex flex-col items-center px-6 py-14 text-center">
          <p className="text-mx-muted text-[14px]">You haven&apos;t scanned yet.</p>
          <LinkButton href="/app/scan" variant="accent" className="mt-4">
            Run a scan
          </LinkButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {scans.map((scan) => {
            const img = api.resolveAttachmentUrl(
              scan.thumbnail_url || scan.front_image_url,
            );
            const score = scan.analysis?.overall_score ?? scan.overall_score;
            const date = scan.created_at
              ? new Date(scan.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "";
            return (
              <Link
                key={scan.id}
                href={`/app/you/scans/${scan.id}`}
                className="rounded-mx-md border border-mx-border overflow-hidden"
              >
                <div className="bg-mx-surface aspect-square">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="flex items-center justify-between px-2.5 py-2">
                  <span className="text-mx-muted text-[12px]">{date}</span>
                  {score != null ? (
                    <span className="text-mx-ink text-[13px] font-semibold">
                      {Math.round(score)}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
