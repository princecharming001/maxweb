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

// Verbatim from iOS PaymentScreen feature checklist.
const FEATURES = [
  ["Max Chat Pro", "Unlimited AI coaching conversations"],
  ["3 Active Routines", "Run up to 3 looksmaxxing programs at once"],
  ["Daily Face Scans", "AI face analysis every single day"],
  ["Full Course Library", "Every creator course and piece of content"],
  ["Priority Support", "Faster responses and dedicated help"],
];
const WEEKLY_PRICE = "$5.99";

function SubscribeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const inFunnel = params.get("funnel") === "1";
  const afterPaywall = inFunnel ? "/start/schedule" : "/app/today";
  const { chooseFreeTier, refreshUser } = useMaxAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeNote, setCodeNote] = useState<string | null>(null);
  const [plan, setPlan] = useState<"trial" | "now">("trial");

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

  async function applyCode() {
    setCodeNote(null);
    try {
      const res = await api.redeemReferral(code.trim(), "web");
      if (res.granted_entitlement) {
        await refreshUser();
        router.replace(afterPaywall);
        return;
      }
      setCodeNote(res.message || "Code applied.");
    } catch {
      setCodeNote("That code didn't work.");
    }
  }

  function goFree() {
    chooseFreeTier();
    router.replace(afterPaywall);
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto max-w-[460px] px-5 pt-14 pb-10">
        {/* Pulsing dot-ring mark */}
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="size-2 animate-pulse rounded-full bg-white/80"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </div>

        <h1 className="font-mx-serif mt-6 text-center text-[32px] leading-tight tracking-[-0.02em]">
          Unlock your <span className="italic">potential</span>
        </h1>
        <div className="mt-4 flex justify-center">
          <span className="mx-label rounded-full border border-white/25 px-3 py-1 text-white/80">
            Premium
          </span>
        </div>

        {/* Feature checklist */}
        <div className="mt-7 overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.04]">
          {FEATURES.map(([title, sub], i) => (
            <div
              key={title}
              className={`flex items-start gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-white/[0.06]" : ""}`}
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon name="check" className="size-3.5 text-white" />
              </span>
              <div>
                <div className="text-[14.5px] font-medium">{title}</div>
                <div className="text-[12px] text-white/50">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan choice */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setPlan("trial")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              plan === "trial" ? "border-white/55 bg-white/[0.08]" : "border-white/12 bg-white/[0.03]"
            }`}
          >
            <div className="text-[13px] text-white/60">3-day trial</div>
            <div className="mt-1 text-[22px] font-semibold">Free</div>
            <div className="text-[12px] text-white/50">then {WEEKLY_PRICE}/wk</div>
          </button>
          <button
            onClick={() => setPlan("now")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              plan === "now" ? "border-white/55 bg-white/[0.08]" : "border-white/12 bg-white/[0.03]"
            }`}
          >
            <div className="text-[13px] text-white/60">Subscribe now</div>
            <div className="mt-1 text-[22px] font-semibold">{WEEKLY_PRICE}</div>
            <div className="text-[12px] text-white/50">/wk · start today</div>
          </button>
        </div>

        {/* CTA */}
        <div className="mt-5">
          {cfgQ.isLoading ? (
            <div className="flex justify-center py-3">
              <Spinner />
            </div>
          ) : enabled ? (
            <button
              onClick={subscribe}
              disabled={busy}
              className="h-14 w-full rounded-full bg-white text-[16px] font-semibold text-[#0B0B0D] disabled:opacity-60"
            >
              {busy ? "Processing…" : plan === "trial" ? "Start my 3-day free trial" : "Subscribe now"}
            </button>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center">
              <p className="text-[14px] font-medium">Subscriptions are coming to web</p>
              <p className="mt-1 text-[13px] text-white/50">
                For now, subscribe in the Max iOS app — your plan syncs here.
              </p>
            </div>
          )}
          {error ? <p className="mt-3 text-center text-[13px] text-[#ff6b6b]">{error}</p> : null}
          <p className="mt-3 text-center text-[12px] text-white/45">
            {plan === "trial" ? "No payment due today · cancel anytime" : "Cancel anytime in Settings"}
          </p>
        </div>

        {/* Referral code */}
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
          {codeNote ? <p className="mt-2 text-[13px] text-white/60">{codeNote}</p> : null}
        </div>

        {/* Free plan escape (web funnel) */}
        <div className="mt-7 text-center">
          <button onClick={goFree} className="text-[14px] text-white/55 underline hover:text-white/80">
            Continue with the free plan
          </button>
        </div>

        {/* Legal */}
        <div className="mt-6 flex justify-center gap-5 text-[12px] text-white/40">
          <Link href="/legal/terms" className="underline">
            Terms of Service
          </Link>
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
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
      <SubscribeInner />
    </Suspense>
  );
}
