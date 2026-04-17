"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
    if (!key) {
      console.warn(
        "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Stripe Elements will not load.",
      );
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(key).catch((err: unknown) => {
        console.error("Stripe loadStripe() failed (often ad blocker or bad key):", err);
        return null;
      });
    }
  }
  return stripePromise;
}
