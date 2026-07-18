"use client";

import Link from "next/link";
import { GlassCard } from "@/components/max/you/GlassCard";

/**
 * "your maxes" card — web port of the ProfileScreen "Your Maxes" block.
 * Left column: ACTIVE (enrolled max chips, or an "add your first max" prompt).
 * Right column: TRACKING count. Below: a row of thin segments, one per slot,
 * filled ink for each active max (empty slots read faint gray).
 */
export type ActiveMax = { id: string; title: string; color?: string };

export function MaxesCard({
  actives,
  total = 5,
}: {
  actives: ActiveMax[];
  total?: number;
}) {
  const activeCount = Math.min(actives.length, total);

  return (
    <GlassCard radius={18}>
      <div className="px-[18px] py-4">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="font-mx-serif text-mx-ink text-[17px] tracking-[-0.3px]">
            your maxes
          </h2>
          <Link
            href="/app/explore"
            className="text-mx-muted text-[13px] font-medium"
          >
            See all →
          </Link>
        </div>

        <div className="mb-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-mx-muted mb-1 text-[10px] font-medium uppercase tracking-[0.7px]">
              ACTIVE
            </div>
            {actives.length ? (
              <div className="flex flex-wrap gap-1.5">
                {actives.map((m) => (
                  <Link
                    key={m.id}
                    href={`/app/explore/${m.id}`}
                    className="bg-mx-surface flex items-center gap-1.5 rounded-full py-[5px] pl-2 pr-[11px]"
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: m.color || "var(--color-mx-accent)" }}
                    />
                    <span className="text-mx-ink text-[12.5px] font-medium tracking-[-0.1px]">
                      {m.title}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href="/app/explore"
                className="text-mx-ink text-[15px] font-semibold tracking-[-0.2px]"
              >
                Add your first max →
              </Link>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end">
            <div className="text-mx-muted mb-1 text-[10px] font-medium uppercase tracking-[0.7px]">
              TRACKING
            </div>
            <div className="text-mx-ink text-[15px] font-semibold tracking-[-0.2px] tabular-nums">
              {activeCount}/{total}
            </div>
          </div>
        </div>

        <div className="flex gap-[5px]">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-[5px] flex-1 rounded-[3px] ${
                i < activeCount ? "bg-mx-ink" : "bg-black/[0.08]"
              }`}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export default MaxesCard;
