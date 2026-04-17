"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { networkErrorMessage } from "@/lib/networkErrorMessage";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.backgroundColor = "var(--color-background)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
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
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      } catch {
        setError(
          "The server returned an unexpected response. Please refresh and try again.",
        );
        return;
      }

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again.",
        );
        return;
      }

      const url = typeof data.url === "string" ? data.url : null;
      if (!url) {
        setError("Checkout link missing. Please try again.");
        return;
      }

      window.location.assign(url);
    } catch (e) {
      setError(networkErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

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
              Get early access
            </h1>
            <p className="mt-2 text-muted text-[14px] leading-relaxed">
              Create your account below, then you&apos;ll be taken to Stripe to
              pay securely.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="ea-email"
                className="block text-[13px] font-medium text-foreground/70 mb-2"
              >
                Username (email)
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
              <p className="mt-1.5 text-[11px] text-muted/90">
                We use this email as your login and to pre-fill Stripe checkout.
              </p>
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
              {loading ? "Saving…" : "Save account & pay on Stripe"}
            </button>

            <p className="text-[11px] text-muted text-center leading-relaxed pt-1">
              Your password is stored hashed in our database. Payment happens on
              Stripe&apos;s secure checkout page.
            </p>
          </form>
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
