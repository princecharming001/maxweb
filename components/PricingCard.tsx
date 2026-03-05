"use client";

import { useState } from "react";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  priceId: string;
  popular?: boolean;
}

export default function PricingCard({
  name,
  price,
  period,
  features,
  priceId,
  popular,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative p-8 rounded-2xl border flex flex-col transition-all duration-300 ${
        popular
          ? "border-accent/30 bg-accent/[0.03] shadow-[0_0_0_1px_rgba(0,113,227,0.1)]"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-8 text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}

      <h3 className="text-lg font-semibold">{name}</h3>

      <div className="mt-5">
        <span className="text-5xl font-bold tracking-tight">{price}</span>
        <span className="text-muted ml-1.5 text-[15px]">/{period}</span>
      </div>

      <ul className="mt-8 space-y-3.5 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-[15px]">
            <svg
              className="w-4 h-4 text-accent flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-muted">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`mt-10 w-full py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer ${
          popular
            ? "bg-accent text-white hover:bg-accent-hover"
            : "border border-border text-foreground hover:bg-background"
        }`}
      >
        {loading ? "Processing..." : "Subscribe"}
      </button>
    </div>
  );
}
