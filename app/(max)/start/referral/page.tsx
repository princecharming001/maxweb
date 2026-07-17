"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/max/api";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Button, Input } from "@/components/max/ui";

type Status = "idle" | "checking" | "comp" | "discount" | "invalid";

/** ReferralCode step — two-step validate→redeem, mirroring iOS ReferralCodeField. */
export default function ReferralPage() {
  const router = useRouter();
  const { refreshUser } = useMaxAuth();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const compReady = status === "comp";
  const ctaLabel = compReady ? "Unlock access" : "Continue to checkout";

  const validate = useCallback(async () => {
    const c = code.trim();
    if (!c) return;
    setStatus("checking");
    setNote(null);
    try {
      const res = await api.validateReferral(c);
      if (res.valid && res.free) {
        setStatus("comp");
        setNote(res.message || "approved — premium is on us.");
      } else if (res.valid) {
        setStatus("discount");
        setNote(res.message || "code applied.");
      } else {
        setStatus("invalid");
        setNote(res.message || "that code isn't valid.");
      }
    } catch {
      setStatus("invalid");
      setNote("that code isn't valid.");
    }
  }, [code]);

  // Auto-validate a deep-linked prefilled code once.
  useEffect(() => {
    const pre = new URLSearchParams(window.location.search).get("code");
    if (pre) {
      setCode(pre.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function proceed() {
    setBusy(true);
    const c = code.trim();
    // No code entered / invalid → straight to checkout.
    if (!c || status === "invalid") {
      router.replace("/subscribe?funnel=1");
      return;
    }
    try {
      const res = await api.redeemReferral(c, "web");
      if (res.free || res.result === "comped") {
        await refreshUser();
        // Comp confirmed by server → continue the funnel (schedule → app).
        router.replace("/start/schedule");
        return;
      }
      // Discount: carry the promotion code into checkout.
      if (res.stripe_promotion_code) {
        try {
          sessionStorage.setItem("max_promo_code", res.stripe_promotion_code);
        } catch {
          /* ignore */
        }
      }
      router.replace("/subscribe?funnel=1");
    } catch {
      setNote("couldn't redeem that code.");
      setBusy(false);
    }
  }

  const pill =
    status === "comp"
      ? { text: "Approved ✓", cls: "bg-mx-success/15 text-mx-success" }
      : status === "invalid"
        ? { text: "Invalid", cls: "bg-mx-error/15 text-mx-error" }
        : null;

  return (
    <div className="flex min-h-[86vh] flex-col items-center justify-center text-center">
      <h1 className="font-mx-serif text-mx-ink text-[30px] leading-tight">
        Have an access code?
      </h1>
      <p className="text-mx-muted mt-3 max-w-[340px] text-[15px]">
        Enter it to unlock access. No code? Continue to checkout.
      </p>

      <div className="mt-8 w-full max-w-[340px] space-y-3">
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setStatus("idle");
              setNote(null);
            }}
            placeholder="Have a referral code?"
            className="flex-1 text-center tracking-[0.15em]"
          />
          <button
            onClick={validate}
            disabled={!code.trim() || status === "checking"}
            className="border-mx-border text-mx-ink hover:bg-mx-surface rounded-mx-md border px-4 text-[14px] font-medium disabled:opacity-40"
          >
            {status === "checking" ? "…" : "Apply"}
          </button>
        </div>

        {pill ? (
          <div className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${pill.cls}`}>
            {pill.text}
          </div>
        ) : null}
        {note ? (
          <p
            className={`text-[13px] ${
              status === "invalid" ? "text-mx-error" : status === "comp" ? "text-mx-success" : "text-mx-muted"
            }`}
          >
            {note}
          </p>
        ) : null}

        <Button full size="lg" onClick={proceed} disabled={busy}>
          {busy ? "…" : ctaLabel}
        </Button>
        <button
          onClick={() => router.replace("/subscribe?funnel=1")}
          className="text-mx-muted w-full text-[14px]"
        >
          I don&apos;t have a code
        </button>
      </div>
    </div>
  );
}
