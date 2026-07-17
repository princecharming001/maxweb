"use client";

import Link from "next/link";
import api from "@/lib/max/api";
import { Card, MetricRing } from "@/components/max/ui";

export interface ScanAnalysis {
  overall_score?: number;
  appeal_score?: number;
  potential_score?: number;
  archetype?: string;
  psl_tier?: string;
  suggested_modules?: string[];
  features?: Record<string, number>;
  scores?: Record<string, number>;
}
export interface Scan {
  id: string;
  created_at?: string;
  front_image_url?: string;
  analysis?: ScanAnalysis;
}

/** Shared scan results view. Free users see the potential ring blurred. */
export default function ScanResults({
  scan,
  locked,
}: {
  scan: Scan;
  locked: boolean;
}) {
  const a = scan.analysis ?? {};
  const features = a.features ?? a.scores ?? {};
  const featureEntries = Object.entries(features).slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Ring trio */}
      <Card className="flex items-center justify-around gap-2 px-4 py-6">
        <Ring label="Rating" value={a.overall_score} />
        <Ring label="Appeal" value={a.appeal_score} />
        <Ring label="Potential" value={a.potential_score} locked={locked} />
      </Card>

      {/* Archetype / PSL */}
      {(a.archetype || a.psl_tier) && (
        <Card className="px-5 py-4">
          {a.archetype ? (
            <>
              <div className="mx-label">Archetype</div>
              <div className="font-mx-serif text-mx-ink mt-1 text-[22px]">
                {a.archetype}
              </div>
            </>
          ) : null}
          {a.psl_tier ? (
            <div className="text-mx-ink-2 mt-2 text-[14px]">
              Tier: <span className="font-medium">{a.psl_tier}</span>
            </div>
          ) : null}
        </Card>
      )}

      {/* Feature breakdown (blur for free tier) */}
      {featureEntries.length ? (
        <Card className="px-5 py-4">
          <div className="mx-label mb-3">Feature breakdown</div>
          <div className={`grid gap-3 sm:grid-cols-2 ${locked ? "blur-[5px]" : ""}`}>
            {featureEntries.map(([k, v]) => (
              <div key={k}>
                <div className="text-mx-ink-2 flex justify-between text-[13px]">
                  <span className="capitalize">{k.replace(/_/g, " ")}</span>
                  <span className="font-medium">{Math.round(v)}</span>
                </div>
                <div className="bg-mx-surface mt-1 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-mx-accent h-full rounded-full"
                    style={{ width: `${Math.min(100, v)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {locked ? (
            <div className="mt-4 text-center">
              <Link
                href="/subscribe?src=scan"
                className="bg-mx-accent inline-flex rounded-mx-md px-5 py-2.5 text-[14px] font-medium text-white"
              >
                Unlock full results
              </Link>
            </div>
          ) : null}
        </Card>
      ) : null}

      {/* Suggested modules */}
      {a.suggested_modules?.length ? (
        <Card className="px-5 py-4">
          <div className="mx-label mb-2">Suggested for you</div>
          <div className="flex flex-wrap gap-2">
            {a.suggested_modules.map((m) => (
              <span
                key={m}
                className="bg-mx-accent-muted text-mx-accent rounded-full px-3 py-1 text-[13px] capitalize"
              >
                {m.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );

  function Ring({
    label,
    value,
    locked: ringLocked,
  }: {
    label: string;
    value?: number;
    locked?: boolean;
  }) {
    return (
      <div className="text-center">
        <div className={ringLocked ? "blur-[6px]" : ""}>
          <MetricRing
            value={value ?? 0}
            max={100}
            size={92}
            label={value != null ? Math.round(value) : "—"}
          />
        </div>
        <div className="mx-label mt-1">{label}</div>
      </div>
    );
  }
}

/** Convenience: pull the front image URL for a scan (already resolved). */
export function scanImage(scan: Scan): string | undefined {
  return api.resolveAttachmentUrl(scan.front_image_url);
}
