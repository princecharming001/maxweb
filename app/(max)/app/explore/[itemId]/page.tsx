"use client";

/**
 * Explore detail — a faithful web port of the iOS MaxDetailScreen.
 *
 * Same section order + verbatim copy as mobile: hero → header (kicker · serif
 * title · accent rule · tagline) → lead paragraph → creator/instructor → stats
 * → daily program → What's inside/curriculum → outcomes → for-you-if →
 * instructor → reviews → FAQ → guarantee, with the sticky bottom CTA and the
 * exact label logic. The page ADAPTS to what it shows (native max vs course vs
 * creator maxx) just like the source.
 */
import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxPaywallGate } from "@/hooks/useMaxPaywallGate";
import { Spinner } from "@/components/max/ui";
import {
  Accordion,
  fmtK,
  habitMetaLine,
  hexA,
  IconArrowRight,
  IconBook,
  IconCheck,
  IconLock,
  IconPlay,
  IconShield,
  IconVerified,
  Monogram,
  Section,
  StatsGridCreator,
  Stars,
  type ExHabit,
  type ExItem,
} from "@/components/max/explore/detail-parts";

const GOLD = "#2C6BED";
/**
 * Creator-authored courses that open into the reader ("Add to schedule" CTA,
 * unlocked lessons, no "Free preview" badge). Mirrors the mobile registry
 * `isCreatorCourse(getCourseForMaxx(id))` — currently only Clay's coloringmax.
 */
const CREATOR_COURSE_IDS = new Set(["coloringmax"]);

/** Brief, looksmax-native description of what this max actually is (verbatim). */
const LOOKSMAX_BLURB: Record<string, string> = {
  skinmax:
    "Skin is your #1 halo — clear, even, glassy skin lifts how your whole face reads. Skinmax repairs your barrier, kills texture, redness and marks, and dials in that lit-from-within glow.",
  hairmax:
    "Hair frames the entire face — one of the highest-impact halos there is. Hairmax works your density, hairline and scalp health so you keep, and grow, a thick, frame-defining mane.",
  fitmax:
    "Body fat hides your bone structure; leanness reveals it. Fitmax leans you out and builds the right muscle so your jaw, cheekbones and frame come forward and mog.",
  bonemax:
    "Bone structure sets your ceiling. Bonemax trains your jaw, masseter, neck and posture — mewing and tension work — to sharpen your profile and harden your frame.",
  heightmax:
    "Height and posture carry presence. Heightmax is decompression, posture and frame work to decompress your spine, stand taller and own more space.",
};

function BackChip() {
  return (
    <Link
      href="/app/explore"
      aria-label="Back"
      className="text-mx-ink absolute left-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 6-6 6 6 6" />
      </svg>
    </Link>
  );
}

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
  const [openWeek, setOpenWeek] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const q = useQuery({
    queryKey: queryKeys.marketplaceItem(itemId),
    queryFn: () => api.getMarketplaceItem(itemId),
  });
  const item = q.data as ExItem | undefined;

  const enterMut = useMutation({
    mutationFn: () => api.enterMarketplaceItem(itemId),
  });
  const busy = enterMut.isPending;

  function handleEnterError(err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    const detail = (err as { response?: { data?: { detail?: string } } })?.response
      ?.data?.detail;
    // Backend gates all maxx/course entry behind a subscription → paywall.
    if (status === 403 || /subscribe/i.test(detail || "")) {
      router.push("/subscribe?src=marketplace");
      return;
    }
    setNote(detail || "Couldn't complete that. Try again.");
  }

  function afterEntered(isCourse: boolean) {
    qc.invalidateQueries({ queryKey: queryKeys.marketplace });
    qc.invalidateQueries({ queryKey: queryKeys.marketplaceItem(itemId) });
    // Native max → coach; course → today (schedule). Mirrors goToChat/goToSchedule.
    router.push(isCourse ? "/app/today" : "/app/coach");
  }

  async function onCta() {
    if (!item || busy) return;
    const creatorMaxx = !!item.creator_maxx;
    const isCourse = !item.native;

    // ── Creator maxx: its own state machine (entry is subscription-gated). ──
    if (creatorMaxx) {
      // Already in → open the member home (no web Studio route → today).
      if (item.entered) {
        router.push("/app/today");
        return;
      }
      if (gate("start_plan")) return;
      try {
        const res = await enterMut.mutateAsync();
        if (res.checkout_url) {
          window.location.href = res.checkout_url;
          return;
        }
        if (res.entered) {
          afterEntered(true);
        } else {
          router.push("/subscribe?src=marketplace"); // requires creator_subscription
        }
      } catch (e) {
        handleEnterError(e);
      }
      return;
    }

    // ── Native max / course ────────────────────────────────────────────────
    if (!item.entered && gate("start_plan")) return;
    // Already in → open the max (no web reader → today).
    if (item.entered) {
      router.push("/app/today");
      return;
    }
    try {
      const res = await enterMut.mutateAsync();
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      if (res.entered) {
        afterEntered(isCourse);
        return;
      }
      // Priced item but no checkout URL → web billing not configured yet.
      setNote(
        "Purchases aren't available on web yet — get this in the Max iOS app.",
      );
    } catch (e) {
      handleEnterError(e);
    }
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
      <div>
        <div className="mb-6 flex items-center gap-3">
          <Link href="/app/explore" aria-label="Back" className="text-mx-muted hover:text-mx-ink -ml-1 flex size-8 items-center justify-center">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </Link>
          <h1 className="font-mx-serif text-mx-ink text-[26px] leading-none">Not found</h1>
        </div>
        <p className="text-mx-muted text-[14px]">This program isn&apos;t available.</p>
      </div>
    );
  }

  const d = item.detail;
  const creatorMaxx = !!item.creator_maxx;
  const isCourse = !item.native;
  const isOwner = false; // web has no getCreatorByMaxx → non-owner ("Open").
  const base = item.color || GOLD;
  const readerCourseId = CREATOR_COURSE_IDS.has(item.id) ? item.id : null;

  const art =
    creatorMaxx && item.image_url
      ? api.resolveAttachmentUrl(item.image_url)
      : undefined;
  const avatar = item.creator?.avatar
    ? api.resolveAttachmentUrl(item.creator.avatar)
    : undefined;

  const kicker = (
    item.category ||
    (creatorMaxx ? "Creator max" : isCourse ? "Course" : "Max")
  ).toUpperCase();
  const maxBlurb =
    LOOKSMAX_BLURB[item.id.toLowerCase()] ||
    d?.long_description ||
    item.tagline ||
    "";
  const habits = (d?.habits ?? []) as ExHabit[];

  const ctaLabel = creatorMaxx
    ? item.entered
      ? isOwner
        ? "Open Studio"
        : "Open"
      : item.price_cents > 0
        ? `Subscribe · ${item.price_label}`
        : "Start free"
    : item.entered
      ? "Open"
      : readerCourseId
        ? "Add to schedule"
        : isCourse
          ? "Enroll"
          : "Start my plan";

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {art ? (
        <div className="relative -mx-5 -mt-6 mb-1 h-[300px] overflow-hidden bg-mx-card">
          <BackChip />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} alt="" className="absolute inset-0 size-full object-cover" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 55%, rgba(255,255,255,0.65) 84%, var(--mx-card) 100%)",
            }}
          />
        </div>
      ) : (
        <div
          className="relative -mx-5 -mt-6 mb-1 flex h-[300px] items-center justify-center overflow-hidden"
          style={{
            background: `radial-gradient(120% 85% at 50% 32%, ${hexA(base, 0.24)} 0%, ${hexA(base, 0.08)} 44%, var(--mx-card) 100%)`,
          }}
        >
          <BackChip />
          <Monogram name={item.title} color={base} size={120} />
        </div>
      )}

      {/* ── Header — type-led ────────────────────────────────────────────── */}
      <div className="pt-1">
        <div className="mb-[14px] flex items-center gap-[7px]">
          <span className="size-[7px] rounded-full" style={{ background: base }} />
          <span className="text-mx-muted text-[11px] font-semibold uppercase tracking-[1.8px]">
            {kicker}
          </span>
        </div>
        <h1 className="font-mx-serif text-mx-ink text-[42px] leading-[1.05] tracking-[-0.02em]">
          {item.title}
        </h1>
        <div className="mt-[18px] h-[3px] w-[38px] rounded-full" style={{ background: base }} />
        <p className="text-mx-ink-2 mt-4 text-[16.5px] leading-[24px]">{item.tagline}</p>
      </div>

      {/* Lead paragraph — looksmax-native description. */}
      {maxBlurb ? (
        <p className="text-mx-ink-2 mt-[22px] text-[16px] leading-[24px]">{maxBlurb}</p>
      ) : null}

      {/* ── Identity ─────────────────────────────────────────────────────── */}
      {creatorMaxx ? (
        <div className="mt-[22px] flex items-center gap-3">
          <span className="flex shrink-0 items-center justify-center rounded-full p-[2px]" style={{ border: `2px solid ${base}` }}>
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="size-[46px] rounded-full object-cover" />
            ) : (
              <Monogram name={item.creator?.name} color={base} size={44} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[5px]">
              <span className="text-mx-ink truncate text-[15px] font-semibold">
                {item.creator?.name}
              </span>
              {item.creator?.verified ? <IconVerified className="size-[15px] shrink-0" color={base} /> : null}
            </div>
            <div className="text-mx-muted text-[12.5px]">@{item.creator?.handle}</div>
            {item.tagline ? (
              <div className="text-mx-ink-2 mt-[3px] line-clamp-2 text-[12.5px] leading-[17px]">
                {item.tagline}
              </div>
            ) : null}
          </div>
        </div>
      ) : isCourse ? (
        <div className="mt-[22px] flex items-center gap-3">
          <Monogram name={item.creator?.name} color={base} size={42} />
          <div className="flex-1">
            <div className="text-mx-ink text-[15px] font-semibold">
              {item.creator?.name}
              {item.creator?.verified ? "  ✓" : ""}
            </div>
            <div className="text-mx-muted mt-px text-[12.5px]">@{item.creator?.handle}</div>
          </div>
          {item.rating ? (
            <div className="flex flex-col items-end">
              <Stars n={item.rating} />
              <div className="text-mx-muted mt-[3px] text-[11px]">
                {item.rating.toFixed(1)} · {fmtK(item.participants)} members
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Creator maxx — real program stats. */}
      {creatorMaxx ? (
        <div className="mt-7">
          <StatsGridCreator item={item} postCount={null} />
        </div>
      ) : null}

      {/* Creator maxx — the daily program. */}
      {creatorMaxx && habits.length ? (
        <Section label="The daily program">
          <div className="bg-mx-card rounded-mx-lg border-mx-border space-y-[14px] border p-[17px]">
            {habits.map((h, i) => (
              <div key={i} className="flex items-center gap-[11px]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ background: hexA(base, 0.14) }}>
                  <span className="size-2 rounded-full" style={{ background: base }} />
                </span>
                <span className="text-mx-ink flex-1 truncate text-[14.5px] font-medium">{h.title}</span>
                <span className="text-mx-muted shrink-0 text-[12px]">{habitMetaLine(h)}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Creator maxx — curriculum (locked rows). */}
      {creatorMaxx && d?.curriculum?.length ? (
        <Section label="What's inside">
          <div className="border-mx-border border-t">
            {d.curriculum.map((w, i) => (
              <Accordion
                key={i}
                title={w.title}
                open={openWeek === i}
                onToggle={() => setOpenWeek(openWeek === i ? -1 : i)}
              >
                {w.lessons.map((l, j) => (
                  <div key={j} className="flex items-center gap-[9px]">
                    <IconLock className="text-mx-muted size-3.5 shrink-0" />
                    <span className="text-mx-ink-2 flex-1 text-[13.5px]">{l}</span>
                  </div>
                ))}
              </Accordion>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Creator maxx — bio. */}
      {creatorMaxx && d?.bio ? (
        <Section label={`About ${item.creator?.name}`}>
          <p className="text-mx-ink-2 text-[15px] leading-[23px]">{d.bio}</p>
        </Section>
      ) : null}

      {/* What you'll get. */}
      {d?.outcomes?.length ? (
        <Section label="What you'll get">
          <div className="space-y-[13px]">
            {d.outcomes.map((o, i) => (
              <div key={i} className="flex items-start gap-[11px]">
                <IconCheck className="mt-0.5 size-[17px] shrink-0" color={base} />
                <span className="text-mx-ink flex-1 text-[15px] leading-[22px]">{o}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Course-only depth ────────────────────────────────────────────── */}
      {isCourse && d?.for_you_if?.length ? (
        <Section label="This is for you if">
          <div className="space-y-[11px]">
            {d.for_you_if.map((o, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="bg-mx-muted mt-2 size-1.5 shrink-0 rounded-full" />
                <span className="text-mx-ink-2 flex-1 text-[15px] leading-[22px]">{o}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {isCourse && !creatorMaxx && d?.curriculum?.length ? (
        <Section label="What's inside">
          {readerCourseId ? (
            <button
              type="button"
              onClick={() => router.push("/app/today")}
              className="bg-mx-card mb-0.5 mt-[14px] flex w-full items-center justify-center gap-2 rounded-[14px] border py-[13px]"
              style={{ borderColor: base }}
            >
              <IconBook className="size-4" color={base} />
              <span className="text-mx-ink text-[14.5px] font-semibold">Open the full course</span>
              <IconArrowRight className="size-[15px]" color={base} />
            </button>
          ) : null}
          <div className="border-mx-border border-t">
            {d.curriculum.map((w, i) => {
              const unlocked = !!readerCourseId || i === 0;
              return (
                <Accordion
                  key={i}
                  title={w.title}
                  badge={!readerCourseId && i === 0 ? "Free preview" : undefined}
                  open={openWeek === i}
                  onToggle={() => setOpenWeek(openWeek === i ? -1 : i)}
                >
                  {w.lessons.map((l, j) => (
                    <div key={j} className="flex items-center gap-[9px]">
                      {unlocked ? (
                        <IconPlay className="size-[15px] shrink-0" color={base} />
                      ) : (
                        <IconLock className="text-mx-muted size-[15px] shrink-0" />
                      )}
                      <span className="text-mx-ink-2 flex-1 text-[13.5px]">{l}</span>
                    </div>
                  ))}
                </Accordion>
              );
            })}
          </div>
        </Section>
      ) : null}

      {isCourse && !creatorMaxx && d?.bio ? (
        <Section label="Your instructor">
          <div className="flex items-center gap-3">
            <Monogram name={item.creator?.name} color={base} size={50} />
            <div className="flex-1">
              <div className="text-mx-ink text-[15px] font-semibold">
                {item.creator?.name}
                {item.creator?.verified ? "  ✓" : ""}
              </div>
              <div className="text-mx-muted mt-px text-[12.5px]">@{item.creator?.handle}</div>
            </div>
          </div>
          <p className="text-mx-ink-2 mt-[14px] text-[15px] leading-[23px]">{d.bio}</p>
          {d.credentials?.length ? (
            <div className="mt-[14px] flex flex-wrap gap-2">
              {d.credentials.map((c, i) => (
                <span
                  key={i}
                  className="border-mx-border text-mx-ink-2 rounded-full border bg-[#F2F2F2] px-[11px] py-1.5 text-[12px] font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}

      {isCourse && d?.reviews?.length ? (
        <Section label={item.rating ? `Reviews · ${item.rating.toFixed(1)} ★` : "Reviews"}>
          <div className="space-y-4">
            {d.reviews.map((r, i) => (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <Monogram name={r.name} color={base} size={28} />
                  <span className="text-mx-ink text-[13.5px] font-semibold">{r.name}</span>
                  <span className="flex-1" />
                  <Stars n={r.rating} />
                </div>
                <p className="text-mx-ink-2 mt-[9px] text-[14.5px] leading-[22px]">{r.text}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {isCourse && d?.faqs?.length ? (
        <Section label="Questions">
          <div className="border-mx-border border-t">
            {d.faqs.map((f, i) => (
              <Accordion
                key={i}
                title={f.q}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <p className="text-mx-ink-2 text-[14.5px] leading-[22px]">{f.a}</p>
              </Accordion>
            ))}
          </div>
        </Section>
      ) : null}

      {d?.guarantee ? (
        <div className="mt-7 flex items-center gap-2">
          <IconShield className="size-4 shrink-0" color="var(--mx-success)" />
          <span className="text-mx-ink-2 flex-1 text-[13px] font-medium leading-[19px]">
            {d.guarantee}
          </span>
        </div>
      ) : null}

      {/* ── Sticky CTA — one floating pill, content fades in behind it. ───── */}
      <div
        className="pointer-events-none sticky bottom-0 z-40 -mx-5 mt-8 px-5 pb-[76px] pt-8 lg:pb-6"
        style={{ background: "linear-gradient(to top, var(--mx-card) 62%, transparent)" }}
      >
        {note ? (
          <p className="text-mx-muted pointer-events-auto mb-2.5 text-center text-[12.5px]">
            {note}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onCta}
          disabled={busy}
          className="text-mx-ink pointer-events-auto flex h-[58px] w-full items-center justify-center rounded-full border border-black/[0.06] bg-white text-[16px] font-semibold tracking-[0.2px] shadow-[0_10px_28px_rgba(58,46,85,0.18)] transition active:scale-[0.98] disabled:opacity-70"
        >
          {busy ? <Spinner className="size-5" /> : <span className="truncate px-4">{ctaLabel}</span>}
        </button>
      </div>
    </div>
  );
}
