/**
 * Default Stripe Payment Link for Max early access (override via env).
 *
 * In Stripe Dashboard → Payment Links → your link → Settings, enable passing a
 * client reference ID from the URL if available, so `client_reference_id`
 * (the paid_waitlist row UUID) is sent on checkout.session.completed webhooks.
 */
export const DEFAULT_EARLY_ACCESS_PAYMENT_LINK =
  "https://buy.stripe.com/7sY4gAgxe9tE3kn6qU8IU00";

export function getEarlyAccessPaymentLinkBase(): string {
  const u =
    process.env.STRIPE_EARLY_ACCESS_PAYMENT_LINK?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_EARLY_ACCESS_PAYMENT_LINK?.trim() ||
    DEFAULT_EARLY_ACCESS_PAYMENT_LINK;
  return u.replace(/\/+$/, "");
}

/** Stripe Checkout / Payment Link URL with row id + email (no secrets). */
export function buildEarlyAccessCheckoutUrl(rowId: string, email: string): string {
  const base = getEarlyAccessPaymentLinkBase();
  const q = new URLSearchParams({
    client_reference_id: rowId,
    prefilled_email: email,
  });
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${q.toString()}`;
}
