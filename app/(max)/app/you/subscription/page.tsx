"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Button, Card, LinkButton, Spinner } from "@/components/max/ui";

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubscriptionPage() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const statusQ = useQuery({
    queryKey: queryKeys.paymentsStatus,
    queryFn: () => api.getSubscriptionStatus(),
  });
  const cfgQ = useQuery({
    queryKey: queryKeys.webBillingConfig,
    queryFn: () => api.getWebBillingConfig(),
  });

  const s = statusQ.data;
  const webBilling = cfgQ.data?.enabled ?? false;

  async function cancel() {
    setBusy(true);
    try {
      await api.cancelWebSubscription();
      await qc.invalidateQueries({ queryKey: queryKeys.paymentsStatus });
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }
  async function resume() {
    setBusy(true);
    try {
      await api.resumeWebSubscription();
      await qc.invalidateQueries({ queryKey: queryKeys.paymentsStatus });
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <SubPageHeader title="Subscription" />

      {statusQ.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : !s?.is_active ? (
        // ── Not subscribed ──
        <Card className="px-5 py-8 text-center">
          <div className="font-mx-serif text-mx-ink text-[22px]">
            You&apos;re on the free plan
          </div>
          <p className="text-mx-muted mt-2 text-[14px]">
            Go Pro to unlock your coach, plan, and full scan results.
          </p>
          <LinkButton href="/subscribe" variant="accent" className="mt-5">
            Upgrade to Pro
          </LinkButton>
        </Card>
      ) : !s.has_stripe_subscription ? (
        // ── Active but not a Stripe sub → billed through Apple ──
        <Card className="px-5 py-6">
          <div className="text-mx-ink text-[16px] font-semibold">Pro — active</div>
          <p className="text-mx-ink-2 mt-2 text-[14px]">
            Your subscription is managed through the App Store on your iPhone.
            Open Settings → your name → Subscriptions on iOS to make changes.
          </p>
        </Card>
      ) : (
        // ── Active Stripe (web) sub ──
        <Card className="px-5 py-6">
          <div className="flex items-center justify-between">
            <div className="text-mx-ink text-[16px] font-semibold">
              Pro — active
            </div>
            <span className="bg-mx-success/15 text-mx-success rounded-full px-2.5 py-1 text-[12px] font-medium">
              {s.cancel_at_period_end ? "Ends soon" : "Renewing"}
            </span>
          </div>
          {s.current_period_end_iso ? (
            <p className="text-mx-ink-2 mt-2 text-[14px]">
              {s.cancel_at_period_end
                ? `Access ends ${fmtDate(s.current_period_end_iso)}.`
                : `Renews ${fmtDate(s.current_period_end_iso)}.`}
            </p>
          ) : null}

          {webBilling ? (
            <div className="mt-5">
              {s.cancel_at_period_end ? (
                <Button onClick={resume} disabled={busy}>
                  {busy ? "…" : "Resume subscription"}
                </Button>
              ) : (
                <Button variant="ghost" onClick={cancel} disabled={busy}>
                  {busy ? "…" : "Cancel subscription"}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-mx-muted mt-4 text-[13px]">
              Manage or cancel from your billing email receipt.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
