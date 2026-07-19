"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import api, { type MarketplaceItem } from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Spinner } from "@/components/max/ui";
import MarketplaceCard, { FeatureCard, MyMaxRow } from "@/components/max/explore/MarketplaceCard";

type Tab = "mine" | "all" | "native" | "creator";

/** iOS services/api.ts isCreatorMaxx(): first-class creator maxxes ride the
 *  courses[] payload with creator_maxx=true. Legacy seed "courses" (no flag)
 *  stay excluded from All — natives only, exactly like the app. */
function isCreatorMaxx(item: MarketplaceItem | null | undefined): boolean {
  return !!(item as (MarketplaceItem & { creator_maxx?: boolean }) | null | undefined)?.creator_maxx;
}

/**
 * iOS lib/personalization.ts rankByGoals(): stable goal-ranked reorder — items
 * whose id matches one of `goalIds` come first, in goal-priority order;
 * everything else keeps its original relative order. NEVER drops, hides, or
 * duplicates an item — pure reorder. With no goals the order is unchanged.
 */
function rankByGoals<T>(items: T[], goalIds: string[], idOf: (item: T) => string): T[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (!goalIds || goalIds.length === 0) return items.slice();
  const rankOf = new Map<string, number>();
  goalIds.forEach((g, i) => {
    const k = String(g || "").toLowerCase();
    if (k && !rankOf.has(k)) rankOf.set(k, i);
  });
  const FAR = Number.MAX_SAFE_INTEGER;
  return items
    .map((it, i) => {
      const key = String(idOf(it) || "").toLowerCase();
      return { it, i, r: rankOf.has(key) ? (rankOf.get(key) as number) : FAR };
    })
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.it);
}

function ExploreInner() {
  const params = useSearchParams();
  const purchased = params.get("purchased");
  const { user } = useMaxAuth();
  const [tab, setTab] = useState<Tab>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const q = useQuery({
    queryKey: queryKeys.marketplace,
    queryFn: () => api.getMarketplace(),
  });

  const toggleSearch = () => {
    const opening = !searchOpen;
    setSearchOpen(opening);
    if (!opening) setQuery("");
    else setTimeout(() => inputRef.current?.focus(), 120);
  };

  // iOS matches(): title / tagline / category / creator name+handle.
  const qq = query.trim().toLowerCase();
  const matches = useCallback(
    (it: MarketplaceItem) =>
      !qq ||
      [it.title, it.tagline, it.category, it.creator?.name, it.creator?.handle].some((s) =>
        String(s || "").toLowerCase().includes(qq),
      ),
    [qq],
  );

  const maxxes = useMemo(() => (q.data?.maxxes ?? []).filter(matches), [q.data, matches]);
  const courses = useMemo(() => (q.data?.courses ?? []).filter(matches), [q.data, matches]);
  // iOS: creator maxxes are courses[] entries with creator_maxx=true — they
  // render on the Creator tab AND append to All; legacy seed courses don't.
  const creatorCards = useMemo(() => courses.filter(isCreatorMaxx), [courses]);
  const hasCreatorCards = (q.data?.courses ?? []).some(isCreatorMaxx);

  // The user's entered maxes power the "Active" tab (web proxy for iOS myMaxxes).
  const entered = useMemo(
    () => [...(q.data?.maxxes ?? []), ...(q.data?.courses ?? [])].filter((x) => x.entered).filter(matches),
    [q.data, matches],
  );

  // iOS usePersonalization().goalIds — the user's onboarding goals, lowercased,
  // deduped, in priority order (lib/personalization.ts asGoalIds).
  const goalIds = useMemo(() => {
    const raw = user?.onboarding?.goals;
    if (!Array.isArray(raw)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const g of raw) {
      const s = typeof g === "string" ? g.trim().toLowerCase() : "";
      if (s && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
    return out;
  }, [user]);

  // iOS baseCombined: All = natives + creator cards; Native = maxes; Creator = creator cards.
  const baseCombined = useMemo<MarketplaceItem[]>(() => {
    if (tab === "mine") return [];
    if (tab === "creator") return creatorCards;
    if (tab === "native") return maxxes;
    return [...maxxes, ...creatorCards];
  }, [tab, maxxes, creatorCards]);

  // iOS: quietly float the maxes matching the user's goals to the top — reorder
  // only, never hide; no goals → original order. (The app gates this on the
  // personalizedUI flag, default ON; the web client has no flags fetch, so it
  // follows the built-in default — exactly what an iOS client does offline.)
  const combined = useMemo<MarketplaceItem[]>(
    () => (goalIds.length ? rankByGoals(baseCombined, goalIds, (it) => it.id) : baseCombined),
    [goalIds, baseCombined],
  );

  // iOS: the "New" carousel is the first 5 of the goal-ranked combined list.
  const suggested = useMemo(() => combined.slice(0, 5), [combined]);
  const gridLabel = tab === "native" ? "All maxes" : tab === "creator" ? "Creators" : "All";
  const emptyMsg =
    tab !== "mine" && combined.length === 0 && !(tab === "creator" && !hasCreatorCards)
      ? qq
        ? `No matches for “${query.trim()}”.`
        : "Nothing here yet."
      : null;

  return (
    <div>
      {/* Title + sliding search */}
      <div className="relative flex min-h-[46px] items-center">
        <h1
          className={`font-mx-serif text-mx-ink text-[40px] leading-[44px] tracking-[-0.025em] transition-opacity duration-200 ${
            searchOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          Find your <span className="italic">max</span>
        </h1>

        <div
          className={`border-mx-border bg-mx-card absolute right-0 flex h-[42px] items-center overflow-hidden rounded-full border transition-[width] duration-300 ease-out ${
            searchOpen ? "w-full" : "w-[42px]"
          }`}
        >
          <button
            type="button"
            onClick={searchOpen ? undefined : toggleSearch}
            disabled={searchOpen}
            aria-label="Search"
            className="flex size-[42px] shrink-0 items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              className={`size-[18px] ${searchOpen ? "text-mx-muted" : "text-mx-ink"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            readOnly={!searchOpen}
            placeholder="Search maxes & creators"
            autoCorrect="off"
            autoCapitalize="none"
            className={`text-mx-ink placeholder:text-mx-muted min-w-0 flex-1 bg-transparent text-[15px] outline-none transition-opacity duration-200 ${
              searchOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          {searchOpen ? (
            <button
              type="button"
              onClick={toggleSearch}
              aria-label="Close search"
              className="text-mx-muted flex h-[42px] w-[38px] shrink-0 items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {purchased ? (
        <div className="bg-mx-success/10 text-mx-success rounded-mx-md mt-4 px-4 py-2.5 text-[14px]">
          You&apos;re in — it&apos;s been added to your plan.
        </div>
      ) : null}

      {/* Pill tabs — Active / All / Native / Creator */}
      <div className="mt-5 flex gap-2">
        {(
          [
            ["mine", "Active"],
            ["all", "All"],
            ["native", "Native"],
            ["creator", "Creator"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-[14.5px] tracking-[0.2px] transition ${
              tab === key ? "bg-mx-ink font-semibold text-white" : "text-mx-muted font-medium"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Active — the user's entered maxes */}
          {tab === "mine" ? (
            entered.length > 0 ? (
              <div className="mt-[18px] flex flex-col gap-3">
                {entered.map((m) => (
                  <MyMaxRow key={m.id} item={m} />
                ))}
              </div>
            ) : (
              <div className="mt-16 flex flex-col items-center text-center">
                <ComingSoonMark />
                <h2 className="font-mx-serif text-mx-ink mt-[18px] text-[26px] tracking-[-0.4px]">
                  No maxes yet
                </h2>
                <p className="text-mx-muted mt-2 max-w-[280px] text-[14.5px] leading-[21px]">
                  Start a max from All and it&apos;ll show up here with today&apos;s tasks.
                </p>
              </div>
            )
          ) : null}

          {/* Creator tab with no live creators — the genuine empty state */}
          {tab === "creator" && !hasCreatorCards ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <ComingSoonMark />
              <h2 className="font-mx-serif text-mx-ink mt-[18px] text-[26px] tracking-[-0.4px]">
                Creators coming soon
              </h2>
              <p className="text-mx-muted mt-2 max-w-[280px] text-[14.5px] leading-[21px]">
                We&apos;re lining up creator courses. Check back shortly.
              </p>
              <div className="border-mx-border bg-mx-card mt-7 flex h-[50px] items-center gap-2 rounded-full border px-[22px]">
                <span className="text-mx-ink text-[15.5px] font-semibold tracking-[0.2px]">
                  Host your own max
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="text-mx-ink size-[17px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
              <p className="text-mx-muted mt-3.5 max-w-[270px] text-[12.5px] leading-[18px]">
                First come, first served.
              </p>
            </div>
          ) : null}

          {emptyMsg ? <p className="text-mx-muted mt-10 text-[14.5px]">{emptyMsg}</p> : null}

          {/* New — horizontal carousel (All tab only) */}
          {tab === "all" && suggested.length > 0 ? (
            <>
              <div className="mt-[26px] mb-3.5">
                <span className="text-mx-ink text-[18px] font-semibold tracking-[-0.2px]">New</span>
              </div>
              <div className="-mx-1 flex snap-x gap-3.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {suggested.map((it) => (
                  <FeatureCard key={it.id} item={it} />
                ))}
              </div>
            </>
          ) : null}

          {/* Grid — 2-column poster grid */}
          {combined.length > 0 ? (
            <>
              <div className="mb-3.5 mt-[34px]">
                <span className="text-mx-ink text-[18px] font-semibold tracking-[-0.2px]">
                  {gridLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {combined.map((it) => (
                  <MarketplaceCard key={it.id} item={it} />
                ))}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

/** Small abstract mark for the empty states (no Apple emoji in UI). */
function ComingSoonMark() {
  return (
    <svg
      viewBox="0 0 88 88"
      className="text-mx-ink size-[84px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M44 12c14 6 22 16 22 32 0 12-9 22-22 22S22 56 22 44c0-7 3-13 8-17 1 5 4 8 8 9-4-9-2-17 6-24z" />
      <path d="M30 70c0-8 6-12 14-12s14 4 14 12" />
    </svg>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      }
    >
      <ExploreInner />
    </Suspense>
  );
}
