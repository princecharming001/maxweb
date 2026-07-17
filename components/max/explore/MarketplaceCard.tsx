"use client";

import Link from "next/link";
import type { MarketplaceItem } from "@/lib/max/api";
import api from "@/lib/max/api";

/** Grid card — mirrors the iOS marketplace GridCard: image on top, serif title,
 *  price on its own line, creator + rating footer. */
export default function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  const img = api.resolveAttachmentUrl(item.image_url);
  return (
    <Link
      href={`/app/explore/${item.id}`}
      className="rounded-mx-lg border border-mx-border bg-mx-card shadow-mx-sm hover:shadow-mx-md group flex flex-col overflow-hidden transition"
    >
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ background: item.color || "var(--color-mx-surface)" }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            className="size-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="font-mx-serif text-mx-ink/30 flex size-full items-center justify-center text-[52px]">
            {(item.title || "M")[0]}
          </div>
        )}
        {item.entered ? (
          <span className="bg-mx-success/90 absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
            Active
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="font-mx-serif text-mx-ink text-[17px] leading-tight">
          {item.title}
        </div>
        <div className="text-mx-muted mt-0.5 text-[12.5px] leading-snug">
          {item.price_label || item.tagline}
        </div>

        <div className="text-mx-muted mt-auto flex items-center gap-1.5 pt-2.5 text-[12px]">
          <span className="truncate">{item.creator?.name}</span>
          {item.creator?.verified ? <span className="text-mx-accent">✓</span> : null}
          {item.rating != null ? (
            <span className="ml-auto shrink-0">★ {item.rating.toFixed(1)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
