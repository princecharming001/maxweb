-- Optional: store Stripe Checkout session id when using Payment Links + webhooks.
-- Run once in Supabase SQL Editor if the column does not exist yet.

alter table public.paid_waitlist
  add column if not exists stripe_checkout_session_id text;

create index if not exists paid_waitlist_checkout_session_idx
  on public.paid_waitlist (stripe_checkout_session_id);
