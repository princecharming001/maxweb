"use client";

import Link from "next/link";
import type { MarketplaceItem } from "@/lib/max/api";
import api from "@/lib/max/api";

export default function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  const img = api.resolveAttachmentUrl(item.image_url);
  return (
    <Link
      href={`/app/explore/${item.id}`}
      className="rounded-mx-lg border border-mx-border bg-mx-card shadow-mx-sm hover:shadow-mx-md group overflow-hidden transition"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ background: item.color || "var(--mx-surface)" }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            className="size-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[40px]">
            {item.icon || "✦"}
          </div>
        )}
        {item.entered ? (
          <span className="bg-mx-success/90 absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium text-white">
            Entered
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-mx-ink text-[15px] font-semibold leading-tight">
            {item.title}
          </div>
          <span className="text-mx-ink-2 shrink-0 text-[13px] font-medium">
            {item.price_label}
          </span>
        </div>
        <p className="text-mx-muted mt-1 line-clamp-2 text-[13px]">
          {item.tagline}
        </p>
        <div className="text-mx-muted mt-3 flex items-center gap-2 text-[12px]">
          <span className="truncate">{item.creator?.name}</span>
          {item.creator?.verified ? (
            <span className="text-mx-accent">✓</span>
          ) : null}
          {item.rating != null ? (
            <span className="ml-auto">★ {item.rating.toFixed(1)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
