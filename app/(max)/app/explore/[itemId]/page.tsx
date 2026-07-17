"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { type MarketplaceItem } from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxPaywallGate } from "@/hooks/useMaxPaywallGate";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Button, Card, Spinner } from "@/components/max/ui";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = use(params);
  const qc = useQueryClient();
  const router = useRouter();
  const gate = useMaxPaywallGate();
  const [note, setNote] = useState<string | null>(null);

  const q = useQuery({
    queryKey: queryKeys.marketplaceItem(itemId),
    queryFn: () => api.getMarketplaceItem(itemId),
  });
  const item = q.data as MarketplaceItem | undefined;
  const d = item?.detail;

  const enterMut = useMutation({
    mutationFn: () => api.enterMarketplaceItem(itemId),
    onSuccess: (res) => {
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      if (res.entered) {
        qc.invalidateQueries({ queryKey: queryKeys.marketplace });
        qc.invalidateQueries({ queryKey: queryKeys.marketplaceItem(itemId) });
        router.push(`/app/explore?purchased=${itemId}`);
        return;
      }
      // Priced item but no checkout URL → web billing not configured yet.
      setNote(
        "Purchases aren't available on web yet — get this in the Max iOS app.",
      );
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      // Backend gates all maxx entry behind a subscription → route to paywall.
      if (status === 403 || /subscribe/i.test(detail || "")) {
        router.push("/subscribe?src=marketplace");
        return;
      }
      setNote(detail || "Couldn't complete that. Try again.");
    },
  });

  function onEnter() {
    if (!item) return;
    // Free items enter directly; priced items go through the paywall gate.
    const priced = item.price_cents > 0 && item.price_model !== "included";
    if (priced && gate("marketplace")) return;
    enterMut.mutate();
  }

  if (q.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!item) {
    return (
      <div className="mx-auto max-w-[720px]">
        <SubPageHeader title="Not found" back="/app/explore" />
        <p className="text-mx-muted text-[14px]">This program isn&apos;t available.</p>
      </div>
    );
  }

  const img = api.resolveAttachmentUrl(item.image_url);

  return (
    <div className="mx-auto max-w-[960px]">
      <SubPageHeader title="Explore" back="/app/explore" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Content */}
        <div>
          <div
            className="rounded-mx-lg relative aspect-[16/9] overflow-hidden"
            style={{ background: item.color || "var(--mx-surface)" }}
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-[64px]">
                {item.icon || "✦"}
              </div>
            )}
          </div>

          <h1 className="font-mx-serif text-mx-ink mt-5 text-[28px] leading-tight">
            {item.title}
          </h1>
          <div className="text-mx-muted mt-1 flex items-center gap-2 text-[14px]">
            <span>{item.creator?.name}</span>
            {item.creator?.verified ? (
              <span className="text-mx-accent">✓</span>
            ) : null}
          </div>

          {d?.long_description ? (
            <p className="text-mx-ink-2 mt-5 text-[15px] leading-relaxed">
              {d.long_description}
            </p>
          ) : (
            <p className="text-mx-ink-2 mt-5 text-[15px] leading-relaxed">
              {item.tagline}
            </p>
          )}

          {d?.outcomes?.length ? (
            <Section title="What you'll get">
              <ul className="space-y-2">
                {d.outcomes.map((o, i) => (
                  <li key={i} className="text-mx-ink-2 flex gap-2 text-[14px]">
                    <span className="text-mx-success">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {d?.for_you_if?.length ? (
            <Section title="For you if">
              <ul className="space-y-2">
                {d.for_you_if.map((o, i) => (
                  <li key={i} className="text-mx-ink-2 flex gap-2 text-[14px]">
                    <span className="text-mx-accent">•</span>
                    {o}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {d?.curriculum?.length ? (
            <Section title="Curriculum">
              <div className="space-y-3">
                {d.curriculum.map((c, i) => (
                  <div key={i}>
                    <div className="text-mx-ink text-[14px] font-medium">
                      {c.title}
                    </div>
                    <ul className="mt-1 space-y-1">
                      {c.lessons.map((l, j) => (
                        <li key={j} className="text-mx-muted text-[13px]">
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {d?.habits?.length ? (
            <Section title="The daily program">
              <div className="space-y-2">
                {d.habits.map((h, i) => (
                  <div
                    key={i}
                    className="bg-mx-surface-light rounded-mx-md flex items-center justify-between px-3.5 py-2.5"
                  >
                    <span className="text-mx-ink text-[14px]">{h.title}</span>
                    {h.time ? (
                      <span className="text-mx-muted text-[12px]">{h.time}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {d?.faqs?.length ? (
            <Section title="FAQ">
              <div className="space-y-3">
                {d.faqs.map((f, i) => (
                  <div key={i}>
                    <div className="text-mx-ink text-[14px] font-medium">
                      {f.q}
                    </div>
                    <div className="text-mx-muted mt-0.5 text-[13px]">{f.a}</div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
        </div>

        {/* Sticky purchase card */}
        <aside>
          <div className="lg:sticky lg:top-8">
            <Card className="p-5">
              <div className="text-mx-ink text-[24px] font-semibold">
                {item.price_label}
              </div>
              {item.weeks ? (
                <div className="text-mx-muted text-[13px]">
                  {item.weeks}-week program
                </div>
              ) : null}

              <div className="mt-4">
                {item.entered ? (
                  <Button variant="ghost" full disabled>
                    Entered
                  </Button>
                ) : (
                  <Button
                    variant="accent"
                    full
                    onClick={onEnter}
                    disabled={enterMut.isPending}
                  >
                    {enterMut.isPending
                      ? "…"
                      : item.price_cents > 0 && item.price_model !== "included"
                        ? "Get this program"
                        : "Add to my plan"}
                  </Button>
                )}
              </div>

              {note ? (
                <p className="text-mx-muted mt-3 text-[13px]">{note}</p>
              ) : null}

              {d?.guarantee ? (
                <p className="text-mx-muted mt-4 text-[12px]">{d.guarantee}</p>
              ) : null}
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-7">
      <div className="mx-label mb-3">{title}</div>
      {children}
    </div>
  );
}
