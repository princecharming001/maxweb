"use client";

import { Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import api, { type MarketplaceItem } from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { Spinner } from "@/components/max/ui";
import MarketplaceCard from "@/components/max/explore/MarketplaceCard";

function ExploreInner() {
  const params = useSearchParams();
  const purchased = params.get("purchased");
  const [tab, setTab] = useState<"mine" | "all" | "native" | "creator">("all");

  const q = useQuery({
    queryKey: queryKeys.marketplace,
    queryFn: () => api.getMarketplace(),
  });

  const items: MarketplaceItem[] = useMemo(() => {
    const m = q.data?.maxxes ?? [];
    const c = q.data?.courses ?? [];
    const all = [...m, ...c];
    if (tab === "mine") return all.filter((x) => (x as { entered?: boolean }).entered);
    if (tab === "native") return m;
    if (tab === "creator") return c;
    return all;
  }, [q.data, tab]);

  return (
    <div>
      <h1 className="font-mx-serif text-mx-ink text-[40px] leading-none tracking-[-0.02em]">
        Find your <span className="italic">max</span>
      </h1>

      {purchased ? (
        <div className="bg-mx-success/10 text-mx-success rounded-mx-md mt-4 px-4 py-2.5 text-[14px]">
          You&apos;re in — it&apos;s been added to your plan.
        </div>
      ) : null}

      <div className="mt-5 flex gap-2">
        {[
          { key: "mine", label: "Active" },
          { key: "all", label: "All" },
          { key: "native", label: "Native" },
          { key: "creator", label: "Creator" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`rounded-full px-4 py-1.5 text-[14.5px] transition ${
              tab === t.key
                ? "bg-mx-ink font-semibold text-white"
                : "text-mx-muted font-medium"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <p className="text-mx-muted mt-10 text-[14px]">Nothing here yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MarketplaceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
      <ExploreInner />
    </Suspense>
  );
}
