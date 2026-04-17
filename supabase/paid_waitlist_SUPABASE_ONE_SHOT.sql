-- =============================================================================
-- paid_waitlist — ONE SHOT FIX (Supabase Dashboard → SQL → New query → Run)
-- =============================================================================
-- Fixes:
--   • Table + columns if missing
--   • UNIQUE(email) for API upsert onConflict:"email"
--   • Drops legacy unique index on lower(email) if present
--   • RLS ON + policy for role `service_role` + revoke public API roles
--   • updated_at trigger
--
-- After this runs: in Vercel, set SUPABASE_SERVICE_ROLE_KEY to the
-- **service_role** secret (not anon). SQL cannot fix a wrong Vercel key.
-- =============================================================================

-- 1) Table
create table if not exists public.paid_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  password_hash text not null,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null default 799,
  currency text not null default 'usd',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'canceled')),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

-- 2) Unique on plain `email` (required for Supabase upsert onConflict: "email")
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'paid_waitlist_email_key'
  ) then
    alter table public.paid_waitlist
      add constraint paid_waitlist_email_key unique (email);
  end if;
end $$;

-- 3) Remove old expression unique index (conflicts with onConflict:"email")
drop index if exists public.paid_waitlist_email_lower_key;

-- 4) Helpful index for webhook / finalize lookups
create index if not exists paid_waitlist_stripe_pi_idx
  on public.paid_waitlist (stripe_payment_intent_id);

-- 5) updated_at trigger
create or replace function public.paid_waitlist_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists paid_waitlist_set_updated_at on public.paid_waitlist;
create trigger paid_waitlist_set_updated_at
  before update on public.paid_waitlist
  for each row
  execute function public.paid_waitlist_set_updated_at();

-- 6) RLS: explicit allow for service_role; lock out anon/authenticated
alter table public.paid_waitlist enable row level security;

drop policy if exists "paid_waitlist_service_role_all" on public.paid_waitlist;

create policy "paid_waitlist_service_role_all"
  on public.paid_waitlist
  for all
  to service_role
  using (true)
  with check (true);

revoke all on table public.paid_waitlist from anon, authenticated;
grant select, insert, update, delete on table public.paid_waitlist to service_role;

-- Done. You should see: Success. No rows returned (or similar).
