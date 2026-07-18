"use client";

import Link from "next/link";
import type { MarketplaceItem } from "@/lib/max/api";
import api from "@/lib/max/api";

/**
 * Explore cards — web port of the iOS MarketplaceScreen (see
 * mobile/screens/marketplace/MarketplaceScreen.tsx).
 *
 * iOS renders native maxes as LIGHT gray cards with a 3D "jelly blob" figure —
 * NOT dark photo posters. The blob lives on the left of the big "New" carousel
 * card (serif title + tagline + a black price pill on the right) and centered in
 * the upper image area of the 2-column grid card (serif title + muted price
 * below). Creator courses keep their cover photo but sit in the SAME light card
 * shape with a serif title, @handle and price. Art-less items fall back to an
 * accent-tinted field with a large serif monogram.
 */

/* ---------- native 3D blob thumbnails (iOS NATIVE_THUMBS / NATIVE_THUMBS_CUT) ---------- */
// The bespoke iOS assets are copied to public/maxxThumbs/*.png (+ cut/*.png).
const NATIVE_IDS = ["skinmax", "hairmax", "fitmax", "bonemax", "heightmax"];

/** iOS nativeThumb — max id → local 3D "jelly blob" PNG (non-cut, own backdrop). */
function maxxThumb(id: string): string | null {
  const key = String(id || "").toLowerCase();
  return NATIVE_IDS.includes(key) ? `/maxxThumbs/${key}.png` : null;
}

/** iOS nativeThumbCut — background-removed blob that floats on a surface (no seam). */
function maxxThumbCut(id: string): string | null {
  const key = String(id || "").toLowerCase();
  return NATIVE_IDS.includes(key) ? `/maxxThumbs/cut/${key}.png` : null;
}

/** iOS utils/scheduleAggregation.hexA — hex → rgba string (art-less monogram tint). */
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

// iOS THUMB_BG — the light-gray card surface that replaces the old dark poster.
const LIGHT_CARD = "#EDEDED";
// Faint gradient behind the floating blob in the grid image area.
const BLOB_GRADIENT = "linear-gradient(160deg, #F4F4F4 0%, #ECECEC 58%, #E4E4E4 100%)";

function monogram(item: MarketplaceItem): string {
  return ((item.title || "?").trim().charAt(0) || "?").toUpperCase();
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

/** Black price pill — iOS nativePricePill (bg INK, white label). */
function PricePill({ label }: { label: string }) {
  return (
    <span className="bg-mx-ink inline-block self-start rounded-full px-3 py-[5px]">
      <span className="text-[12px] font-semibold tracking-[0.2px] text-white">{label}</span>
    </span>
  );
}

/** Small 2-column light card — the iOS GridCard. (Default export keeps the name.) */
export default function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  const isCreator = !item.native;
  const blob = item.native ? maxxThumbCut(item.id) : null; // cut variant floats on the gradient
  const cover = api.resolveAttachmentUrl(item.image_url);
  const base = item.color || "#111113";
  return (
    <Link
      href={`/app/explore/${item.id}`}
      className="border-mx-border block overflow-hidden rounded-mx-lg border"
      style={{ background: LIGHT_CARD }}
    >
      {/* Image area — blob centered on a faint gradient / cover photo / monogram. */}
      <div className="relative h-[150px] w-full overflow-hidden">
        {blob ? (
          <>
            <div className="absolute inset-0" style={{ background: BLOB_GRADIENT }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={blob} alt="" className="absolute inset-0 size-full object-contain p-2.5" />
          </>
        ) : cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: hexA(base, 0.16) }}
          >
            <span className="font-mx-serif text-[54px] leading-none tracking-[-1px]" style={{ color: base }}>
              {monogram(item)}
            </span>
          </div>
        )}
        {isCreator && item.creator?.handle ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/70 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-mx-ink text-[11.5px] font-medium tracking-[0.2px]">
              @{item.creator.handle}
            </span>
          </span>
        ) : null}
      </div>

      {/* Body — serif title + muted price (or Subscribed). Left-aligned, no scrim. */}
      <div className="px-3.5 pb-3 pt-2.5">
        <div className="font-mx-serif text-mx-ink truncate text-[22px] leading-[26px] tracking-[-0.3px]">
          {item.title}
        </div>
        {item.entered && isCreator ? (
          <div className="mt-1.5">
            <SubscribedPill />
          </div>
        ) : (
          <div className="text-mx-muted mt-0.5 truncate text-[13px] font-medium">{item.price_label}</div>
        )}
      </div>
    </Link>
  );
}

/** Large "New" carousel light card — the iOS FeatureCard (blob left, text right). */
export function FeatureCard({ item }: { item: MarketplaceItem }) {
  const isCreator = !item.native;
  const blob = item.native ? maxxThumb(item.id) : null; // non-cut fills the left panel
  const cover = api.resolveAttachmentUrl(item.image_url);
  const base = item.color || "#111113";
  return (
    <Link
      href={`/app/explore/${item.id}`}
      className="border-mx-border relative flex h-[200px] w-[340px] shrink-0 items-center gap-2 overflow-hidden rounded-mx-xl border"
      style={{ background: LIGHT_CARD }}
    >
      {/* Left media — the 3D blob / cover photo / monogram. */}
      <div className="relative h-full w-[150px] shrink-0 overflow-hidden">
        {blob ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blob} alt="" className="absolute inset-0 size-full scale-[1.12] object-contain" />
        ) : cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: hexA(base, 0.16) }}
          >
            <span className="font-mx-serif text-[60px] leading-none tracking-[-1px]" style={{ color: base }}>
              {monogram(item)}
            </span>
          </div>
        )}
      </div>

      {/* Right body — serif title + @handle (creators) + tagline + price pill. */}
      <div className="flex min-w-0 flex-1 flex-col justify-center pl-1 pr-5">
        <div className="font-mx-serif text-mx-ink truncate text-[26px] tracking-[-0.4px]">
          {item.title}
        </div>
        {isCreator && item.creator?.handle ? (
          <div className="text-mx-muted mt-0.5 truncate text-[12.5px] font-medium">
            @{item.creator.handle}
          </div>
        ) : null}
        <div className="text-mx-muted mt-0.5 line-clamp-2 text-[13px] leading-[18px]">{item.tagline}</div>
        <div className="mt-2">
          {item.entered && isCreator ? <SubscribedPill /> : <PricePill label={item.price_label} />}
        </div>
      </div>
    </Link>
  );
}

/** "Active" tab row — the iOS MyMaxCard (blob/cover thumb + serif title + tagline). */
export function MyMaxRow({ item }: { item: MarketplaceItem }) {
  const blob = item.native ? maxxThumb(item.id) : null;
  const cover = api.resolveAttachmentUrl(item.image_url);
  const base = item.color || "#111113";
  return (
    <Link
      href={`/app/explore/${item.id}`}
      className="border-mx-border bg-mx-card flex items-center gap-3.5 rounded-mx-lg border p-3"
    >
      <div
        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[13px]"
        style={{ background: blob || cover ? "#EFEFEF" : hexA(base, 0.13) }}
      >
        {blob ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blob} alt="" className="size-full object-cover" />
        ) : cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-mx-serif text-[24px] leading-none" style={{ color: base }}>
            {monogram(item)}
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
