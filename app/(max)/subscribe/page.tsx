"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Spinner } from "@/components/max/ui";
import { Icon } from "@/components/max/icons";

// Verbatim from iOS PaymentScreen (the Cosmos paywall) — CHAD_FEATURES.
const FEATURES: readonly [string, string][] = [
  ["Max Chat Pro", "Unlimited AI coaching conversations"],
  ["3 Active Routines", "Run up to 3 looksmaxxing programs at once"],
  ["Daily Face Scans", "AI face analysis every single day"],
  ["Full Course Library", "Every creator course and piece of content"],
  ["Priority Support", "Faster responses and dedicated help"],
];
const WEEKLY_PRICE = "$5.99";

// Pulsing 6-dot ring mark (Cosmos animated mark). Positions mirror iOS:
// radius 13 in a 30x30 box, each dot's opacity pulse phase-offset by 300ms.
// Round positions to 2dp so the server-rendered string matches the client's
// (raw floats like -6.500000000000005 vs -6.5 cause a hydration mismatch).
const r2 = (n: number) => Math.round(n * 100) / 100;
const RING_DOTS = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2;
  return { x: r2(Math.cos(a) * 13), y: r2(Math.sin(a) * 13), delay: -(i * 0.3) };
});

function PlanCard({
  selected,
  onClick,
  title,
  price,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  price: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${title}, ${price} ${sub}`}
      onClick={onClick}
      className={`relative rounded-2xl border px-3.5 py-3.5 text-left transition ${
        selected
          ? "border-white/55 bg-white/[0.09]"
          : "border-white/[0.08] bg-white/[0.05]"
      }`}
    >
      {selected ? (
        <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-white">
          <Icon name="check" className="size-3 text-[#0B0B0D]" />
        </span>
      ) : null}
      <div className="text-[12.5px] font-medium text-white/60">{title}</div>
      <div className="mt-1.5 text-[19px] font-semibold tracking-[-0.3px] text-white">
        {price}
      </div>
      <div className="mt-0.5 text-[11.5px] text-white/40">{sub}</div>
    </button>
  );
}

function SubscribeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const inFunnel = params.get("funnel") === "1";
  const afterPaywall = inFunnel ? "/start/schedule" : "/app/today";
  const { refreshUser } = useMaxAuth();
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeNote, setCodeNote] = useState<string | null>(null);
  // "trial" is the default; "now" is the subscribe-immediately presentation.
  // Both run the SAME checkout (parity with iOS: Apple applies the 3-day
  // intro offer per eligibility either way) — this is a presentation choice.
  const [plan, setPlan] = useState<"trial" | "now">("trial");
  const payNow = plan === "now";

  const cfgQ = useQuery({
    queryKey: queryKeys.webBillingConfig,
    queryFn: () => api.getWebBillingConfig(),
  });
  const enabled = cfgQ.data?.enabled ?? false;

  async function subscribe() {
    setBusy(true);
    setError(null);
    try {
      // Carry any promotion code applied on the referral step into checkout.
      let promo: string | null = null;
      try {
        promo = sessionStorage.getItem("max_promo_code");
      } catch {
        /* ignore */
      }
      const { checkout_url } = await api.createWebCheckout(
        "premium",
        "/subscribe/success",
        "/subscribe",
        promo,
      );
      window.location.href = checkout_url;
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      if (detail === "apple_billing") {
        setError("You're already subscribed through the App Store on iPhone.");
      } else if (detail === "already_subscribed") {
        setError("You're already Pro.");
      } else {
        setError("Checkout isn't available right now. Try again later.");
      }
      setBusy(false);
    }
  }

  // Restore (Apple Guideline 3.1.1 parity): re-check entitlement for this
  // account. If the subscription is now active, advance the funnel.
  async function restore() {
    if (restoring) return;
    setRestoring(true);
    setError(null);
    try {
      const u = await refreshUser();
      if (u?.is_paid) {
        router.replace(afterPaywall);
        return;
      }
      setError("No active subscription found for this account.");
    } catch {
      setError("Couldn't check your subscription. Try again.");
    } finally {
      setRestoring(false);
    }
  }

  async function applyCode() {
    setCodeNote(null);
    try {
      const res = await api.redeemReferral(code.trim(), "web");
      // Full comp → server granted access; advance the funnel.
      if (res.free || res.result === "comped" || res.granted_entitlement) {
        await refreshUser();
        router.replace(afterPaywall);
        return;
      }
      // Discount → carry the promo code into checkout.
      if (res.stripe_promotion_code) {
        try {
          sessionStorage.setItem("max_promo_code", res.stripe_promotion_code);
        } catch {
          /* ignore */
        }
        setCodeNote("Code applied — your discount is ready at checkout.");
        return;
      }
      setCodeNote(res.message || "That code isn't valid.");
    } catch {
      setCodeNote("That code didn't work.");
    }
  }

  return (
    <div className="font-mx-sans relative min-h-screen overflow-hidden bg-[#0B0B0D] text-white">
      {/* Cosmos background — a blue-smoke bloom over near-black (CSS gradients,
          no image), slow Ken-Burns drift, then a vertical dark vignette so the
          copy stays legible while the "photo" reads through the middle. */}
      <style>{`
        @keyframes mxCosmosDrift {
          0%   { transform: scale(1) translateX(0px); }
          50%  { transform: scale(1.07) translateX(9px); }
          100% { transform: scale(1) translateX(0px); }
        }
        @keyframes mxDotPulse {
          0%, 100% { opacity: 0.28; }
          50%      { opacity: 1; }
        }
        .mx-cosmos-smoke { animation: mxCosmosDrift 12s ease-in-out infinite; }
        .mx-ring-dot     { animation: mxDotPulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mx-cosmos-smoke, .mx-ring-dot { animation: none !important; }
        }
      `}</style>
      <div
        aria-hidden
        className="mx-cosmos-smoke pointer-events-none absolute -inset-[8%] z-0"
        style={{
          background:
            "radial-gradient(115% 75% at 50% 34%, rgba(58,120,240,0.30) 0%, rgba(44,107,237,0.12) 34%, rgba(11,11,13,0) 64%)," +
            "radial-gradient(80% 55% at 50% 24%, rgba(150,185,255,0.16) 0%, rgba(11,11,13,0) 60%)," +
            "radial-gradient(140% 100% at 50% 96%, rgba(34,66,150,0.18) 0%, rgba(11,11,13,0) 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,11,13,0.86) 0%, rgba(11,11,13,0.30) 32%, rgba(11,11,13,0.40) 60%, rgba(11,11,13,0.94) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[460px] px-5 pt-14 pb-10">
        {/* Pulsing 6-dot ring mark */}
        <div className="flex justify-center">
          <div className="relative h-[30px] w-[30px]">
            {RING_DOTS.map((d, i) => (
              <span
                key={i}
                className="mx-ring-dot absolute left-1/2 top-1/2 -ml-[2.5px] -mt-[2.5px] size-[5px] rounded-full bg-white"
                style={{
                  transform: `translate(${d.x}px, ${d.y}px)`,
                  animationDelay: `${d.delay}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Headline + PREMIUM pill */}
        <h1 className="font-mx-serif mt-3.5 text-center text-[32px] leading-[36px] tracking-[-0.8px] text-white">
          Unlock your <span className="italic">potential</span>
        </h1>
        <div className="mx-auto mt-2.5 mb-[22px] w-fit rounded-full border border-white/15 px-3.5 py-[5px]">
          <span className="text-[11px] font-semibold tracking-[1.4px] text-white">
            PREMIUM
          </span>
        </div>

        {/* Feature checklist — bordered glass card, uniform checkmarks */}
        <div className="overflow-hidden rounded-mx-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          {FEATURES.map(([title, sub], i) => (
            <div
              key={title}
              className={`flex items-center gap-3 px-[18px] py-3.5 ${
                i > 0 ? "border-t border-white/[0.06]" : ""
              }`}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/20">
                <Icon name="check" className="size-3.5 text-white" />
              </span>
              <div className="flex-1">
                <div className="text-[14.5px] font-semibold tracking-[-0.1px] text-white">
                  {title}
                </div>
                <div className="mt-0.5 text-[12px] leading-4 text-white/55">
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan choice — two side-by-side boxes, free trial default */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <PlanCard
            selected={!payNow}
            onClick={() => setPlan("trial")}
            title="3-day trial"
            price="Free"
            sub={`then ${WEEKLY_PRICE}/wk`}
          />
          <PlanCard
            selected={payNow}
            onClick={() => setPlan("now")}
            title="Subscribe now"
            price={`${WEEKLY_PRICE}/wk`}
            sub="start today"
          />
        </div>

        {/* CTA — solid white pill (Cosmos's inverted-on-dark button) */}
        <div className="mt-4">
          {cfgQ.isLoading ? (
            <div className="flex justify-center py-3">
              <Spinner />
            </div>
          ) : enabled ? (
            <button
              onClick={subscribe}
              disabled={busy}
              className="h-14 w-full rounded-full bg-white text-[16px] font-semibold tracking-[0.1px] text-[#0B0B0D] shadow-[0_6px_16px_rgba(0,0,0,0.30)] transition active:opacity-90 disabled:opacity-50"
            >
              {busy
                ? "Processing…"
                : payNow
                  ? "Subscribe now"
                  : "Start my 3-day free trial"}
            </button>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center">
              <p className="text-[14px] font-medium">
                Subscriptions are coming to web
              </p>
              <p className="mt-1 text-[13px] text-white/50">
                For now, subscribe in the Max iOS app — your plan syncs here.
              </p>
            </div>
          )}
          {error ? (
            <p className="mt-3 text-center text-[13px] text-[#ff6b6b]">{error}</p>
          ) : null}
          {/* The one line a hesitant thumb needs, right under the CTA. */}
          <p className="mt-2.5 text-center text-[13px] font-medium text-white/58">
            {payNow
              ? "Cancel anytime in Settings"
              : "No payment due today · cancel anytime"}
          </p>
        </div>

        {/* Referral code (web funnel) — carries a promo/comp into checkout */}
        <div className="mt-6">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Have a code?"
              className="flex-1 rounded-mx-md border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/40 outline-none focus:border-white/40"
            />
            <button
              onClick={applyCode}
              disabled={!code.trim()}
              className="rounded-mx-md border border-white/20 px-4 text-[14px] font-medium text-white disabled:opacity-40"
            >
              Apply
            </button>
          </div>
          {codeNote ? (
            <p className="mt-2 text-[13px] text-white/60">{codeNote}</p>
          ) : null}
        </div>

        {/* Fine print — Restore · Terms · Privacy */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] text-white/40">
          <button
            type="button"
            onClick={restore}
            disabled={restoring}
            className="transition hover:text-white/70 disabled:opacity-60"
          >
            {restoring ? "Restoring…" : "Restore"}
          </button>
          <span aria-hidden>·</span>
          <Link href="/legal/terms" className="underline">
            Terms of Service
          </Link>
          <span aria-hidden>·</span>
          <Link href="/legal/privacy" className="underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0B0D]">
          <Spinner />
        </div>
      }
    >
      <SubscribeInner />
    </Suspense>
  );
}
