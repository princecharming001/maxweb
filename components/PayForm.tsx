"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { networkErrorMessage } from "@/lib/networkErrorMessage";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRIPE_PAY_URL = "https://buy.stripe.com/7sY4gAgxe9tE3kn6qU8IU00";

export default function PayForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      setError("Please enter a valid email.");
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
      const res = await fetch("/api/max-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      } catch {
        setError("Unexpected server response. Please try again.");
        return;
      }
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong.",
        );
        return;
      }
      window.location.assign(STRIPE_PAY_URL);
    } catch (err) {
      setError(networkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/40 transition-all placeholder:text-muted/50";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block text-xl font-bold tracking-tighter text-foreground hover:opacity-70 transition-opacity"
          >
            max
          </Link>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl px-8 py-10 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Register &amp; pay
          </h1>
          <p className="mt-2 text-muted text-[14px] text-center leading-relaxed">
            Create your account. You&apos;ll be sent to Stripe to complete payment.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
            <div>
              <label
                htmlFor="pay-email"
                className="block text-[13px] font-medium text-foreground/70 mb-2"
              >
                Email
              </label>
              <input
                id="pay-email"
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
                htmlFor="pay-password"
                className="block text-[13px] font-medium text-foreground/70 mb-2"
              >
                Password
              </label>
              <input
                id="pay-password"
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
                htmlFor="pay-confirm"
                className="block text-[13px] font-medium text-foreground/70 mb-2"
              >
                Confirm password
              </label>
              <input
                id="pay-confirm"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
                placeholder="Repeat password"
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
              className="w-full bg-foreground text-background py-3 rounded-xl text-[14px] font-medium hover:bg-foreground/85 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving…" : "Continue to Stripe"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[13px] text-muted">
          <Link href="/" className="text-foreground font-medium hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
