"use client";

import Link from "next/link";
import type { MarketplaceItem } from "@/lib/max/api";
import api from "@/lib/max/api";

/**
 * Explore cards — web port of the iOS MarketplaceScreen posters.
 *
 * iOS renders every maxx as a cover-image poster: art + a dark bottom scrim +
 * a serif title, with the creator's @handle tagged top-left and the price on a
 * pill. Art-less cards fall back to an accent-tinted field with a large serif
 * monogram. Native maxes on iOS use bespoke 3D thumbnails (local assets the web
 * can't bundle), so on web they share the same poster treatment via image_url /
 * monogram fallback.
 */

/** iOS utils/scheduleAggregation.hexA — hex → rgba string. */
function hexA(hex: string, alpha: number): string {
  let h = (hex || "").replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h || "000000", 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Cover image (or monogram field) + dark scrim + @handle — the shared poster. */
function PosterContent({ item }: { item: MarketplaceItem }) {
  const isCreator = !item.native;
  const cover = api.resolveAttachmentUrl(item.image_url);
  const base = item.color || "#111113";
  const letter = ((item.title || "?").trim().charAt(0) || "?").toUpperCase();
  return (
    <>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: hexA(base, 0.16) }}
        >
          <span
            className="font-mx-serif pb-4 text-[64px] leading-none tracking-[-1px]"
            style={{ color: base }}
          >
            {letter}
          </span>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,18,23,0) 0%, rgba(20,18,23,0.35) 45%, rgba(20,18,23,0.88) 100%)",
        }}
      />
      {isCreator && item.creator?.handle ? (
        <div className="absolute left-3 top-3 rounded-full bg-white/[0.18] px-2.5 py-1">
          <span className="text-[11.5px] font-medium tracking-[0.2px] text-white">
            @{item.creator.handle}
          </span>
        </div>
      ) : null}
    </>
  );
}

/** "Subscribed" mini-pill — replaces the price on entered creator-maxx cards. */
function SubscribedPill() {
  return (
    <span className="inline-flex items-center gap-1 self-start rounded-full border border-white/40 bg-[#111113] px-2.5 py-[5px]">
      <svg
        viewBox="0 0 24 24"
        className="size-3 text-[#F1F1EF]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span className="text-[11.5px] font-semibold tracking-[0.2px] text-[#F1F1EF]">Subscribed</span>
    </span>
  );
}

/** Small 2-column poster — the iOS GridCard. (Default export keeps the name.) */
export default function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  const isCreator = !item.native;
  return (
    <Link
      href={`/app/explore/${item.id}`}
      className="bg-mx-ink relative block h-[168px] overflow-hidden rounded-[16px]"
    >
      <PosterContent item={item} />
      <div className="absolute inset-x-0 bottom-0 p-[13px]">
        <div className="font-mx-serif line-clamp-2 text-[18px] leading-[22px] tracking-[-0.3px] text-white">
          {item.title}
        </div>
        {item.entered && isCreator ? (
          <div className="mt-1.5">
            <SubscribedPill />
          </div>
        ) : (
          <div className="mt-1 text-[12px] font-medium text-white/80">{item.price_label}</div>
        )}
      </div>
    </Link>
  );
}

/** Large "New" carousel poster — the iOS FeatureCard. */
export function FeatureCard({ item }: { item: MarketplaceItem }) {
  const isCreator = !item.native;
  return (
    <Link
      href={`/app/explore/${item.id}`}
      className="bg-mx-ink relative block h-[220px] w-[300px] shrink-0 overflow-hidden rounded-[20px]"
    >
      <PosterContent item={item} />
      <div className="absolute inset-x-0 bottom-0 p-[18px]">
        <div className="font-mx-serif line-clamp-1 text-[26px] tracking-[-0.4px] text-white">
          {item.title}
        </div>
        <div className="mt-1 line-clamp-2 text-[13.5px] leading-[19px] text-white/80">
          {item.tagline}
        </div>
        {item.entered && isCreator ? (
          <div className="mt-3">
            <SubscribedPill />
          </div>
        ) : (
          <div className="mt-3 inline-block self-start rounded-full bg-white/90 px-3 py-[5px]">
            <span className="text-mx-ink text-[12px] font-semibold tracking-[0.2px]">
              {item.price_label}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

/** "Active" tab row — the iOS MyMaxCard (thumb + serif title + tagline). */
export function MyMaxRow({ item }: { item: MarketplaceItem }) {
  const cover = api.resolveAttachmentUrl(item.image_url);
  const base = item.color || "#111113";
  const letter = ((item.title || "?").trim().charAt(0) || "?").toUpperCase();
  return (
    <Link
      href={`/app/explore/${item.id}`}
      className="border-mx-border bg-mx-card flex items-center gap-3.5 rounded-mx-lg border p-3"
    >
      <div
        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[13px]"
        style={{ background: cover ? "#EFEFEF" : hexA(base, 0.13) }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-mx-serif text-[24px] leading-none" style={{ color: base }}>
            {letter}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mx-serif text-mx-ink truncate text-[19px] tracking-[-0.3px]">
          {item.title}
        </div>
        <div className="text-mx-ink-2 mt-0.5 truncate text-[13px]">{item.tagline}</div>
      </div>
      <svg
        viewBox="0 0 24 24"
        className="text-mx-muted size-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}
