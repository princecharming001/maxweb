"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripeClient } from "@/lib/stripeClient";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "details" | "payment";

function formatPrice(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function PaymentStep({
  paymentIntentId,
  email,
  amount,
  currency,
  onBack,
}: {
  paymentIntentId: string;
  email: string;
  amount: number;
  currency: string;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Please check your payment details.");
      setSubmitting(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        receipt_email: email,
        return_url: `${window.location.origin}/?early_access=success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment could not be completed.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        await fetch("/api/early-access/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId }),
        });
      } catch {
        // The webhook is the source of truth; ignore client-side finalize errors.
      }
      router.push("/?early_access=success");
      return;
    }

    setError("Payment is still processing. Please wait a moment and try again.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleConfirm} className="space-y-5">
      <div className="rounded-xl border border-border/70 bg-background/60 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-wide text-muted">
            Paying as
          </p>
          <p className="text-[14px] text-foreground font-medium truncate max-w-[220px]">
            {email}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          Edit
        </button>
      </div>

      <div className="rounded-xl border border-border/70 bg-card px-4 py-4">
        <PaymentElement
          options={{
            layout: { type: "tabs", defaultCollapsed: false },
          }}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full bg-foreground text-background py-3.5 rounded-xl text-[14px] font-medium hover:bg-foreground/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? "Processing…" : `Pay ${formatPrice(amount, currency)}`}
      </button>

      <p className="text-[11px] text-muted text-center leading-relaxed">
        Payments are securely processed by Stripe. Your card details never touch
        our servers. By confirming you agree to the{" "}
        <Link href="/legal" className="underline hover:text-foreground">
          Terms
        </Link>
        .
      </p>
    </form>
  );
}

export default function EarlyAccessForm() {
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(799);
  const [currency, setCurrency] = useState<string>("usd");

  const stripePromise = useMemo(() => getStripeClient(), []);

  useEffect(() => {
    document.body.style.backgroundColor = "var(--color-background)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  async function handleDetailsSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/early-access/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setAmount(data.amount ?? 799);
      setCurrency(data.currency ?? "usd");
      setPassword("");
      setConfirm("");
      setStep("payment");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const elementsOptions: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1d1d1f",
            colorBackground: "#ffffff",
            colorText: "#1d1d1f",
            colorTextSecondary: "#86868b",
            colorDanger: "#e11d48",
            fontFamily:
              "Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            fontSizeBase: "14px",
            borderRadius: "12px",
          },
          rules: {
            ".Input": {
              border: "1px solid #d2d2d7",
              boxShadow: "none",
              padding: "12px",
            },
            ".Input:focus": {
              borderColor: "#1d1d1f",
              boxShadow: "0 0 0 3px rgba(29,29,31,0.08)",
            },
            ".Tab": { border: "1px solid #d2d2d7", padding: "10px 14px" },
            ".Tab--selected": { borderColor: "#1d1d1f" },
            ".Label": { fontWeight: "500", color: "#4b4b52" },
          },
        },
      }
    : undefined;

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/40 transition-all placeholder:text-muted/50";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden py-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-accent/[0.06] to-transparent blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-foreground/[0.04] to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block text-xl font-bold tracking-tighter text-foreground hover:opacity-70 transition-opacity"
          >
            max
          </Link>
        </div>

        <div className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-3xl px-8 py-10 shadow-[0_4px_40px_rgba(0,0,0,0.06)]">
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-3 py-1 text-[11px] font-medium text-accent tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Early Access · Limited Launch Pricing
            </div>
            <h1 className="mt-4 text-[26px] font-semibold tracking-tight">
              {step === "details" ? "Get early access" : "Confirm payment"}
            </h1>
            <p className="mt-2 text-muted text-[14px] leading-relaxed">
              {step === "details" ? (
                <>
                  One month of Max for{" "}
                  <span className="text-foreground font-medium">$7.99</span>.
                  <br />
                  Create your account to claim your spot.
                </>
              ) : (
                <>
                  One month of Max — billed once, no auto-renewal.
                  <br />
                  Finish checkout to activate your account.
                </>
              )}
            </p>
          </div>

          <div className="mb-7 flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
            <div>
              <p className="text-[12px] text-muted">Max — Early Access</p>
              <p className="text-[13px] text-foreground">1 month · limited launch pricing</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted line-through">$31.99</p>
              <p className="text-[18px] font-semibold tracking-tight">$7.99</p>
            </div>
          </div>

          {step === "details" ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="ea-email"
                  className="block text-[13px] font-medium text-foreground/70 mb-2"
                >
                  Email
                </label>
                <input
                  id="ea-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="ea-password"
                  className="block text-[13px] font-medium text-foreground/70 mb-2"
                >
                  Password
                </label>
                <input
                  id="ea-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label
                  htmlFor="ea-confirm"
                  className="block text-[13px] font-medium text-foreground/70 mb-2"
                >
                  Confirm password
                </label>
                <input
                  id="ea-confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background py-3.5 rounded-xl text-[14px] font-medium hover:bg-foreground/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
              >
                {loading ? "Preparing checkout…" : "Continue to payment"}
              </button>

              <p className="text-[11px] text-muted text-center leading-relaxed pt-1">
                $7.99 one-time charge for one month of early access. No
                auto-renewal.
              </p>
            </form>
          ) : clientSecret && elementsOptions ? (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentStep
                paymentIntentId={paymentIntentId!}
                email={email}
                amount={amount}
                currency={currency}
                onBack={() => {
                  setStep("details");
                  setClientSecret(null);
                }}
              />
            </Elements>
          ) : null}
        </div>

        <p className="mt-7 text-center text-[13px] text-muted">
          <Link
            href="/"
            className="text-foreground font-medium hover:opacity-70 transition-opacity"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
