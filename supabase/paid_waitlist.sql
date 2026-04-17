-- Run in Supabase SQL Editor (Dashboard → SQL).
-- API routes use the service role key, which bypasses RLS.

create table if not exists public.paid_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  password_hash text not null,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null default 799,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled')),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Note: the API always lowercases email before inserting, so a plain unique
-- constraint on email is sufficient (and required for upsert onConflict:"email").
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'paid_waitlist_email_key'
  ) then
    alter table public.paid_waitlist
      add constraint paid_waitlist_email_key unique (email);
  end if;
end $$;

-- Drop the legacy expression-based index if it was created by a prior migration.
drop index if exists public.paid_waitlist_email_lower_key;

create index if not exists paid_waitlist_stripe_pi_idx
  on public.paid_waitlist (stripe_payment_intent_id);

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
  for each row execute function public.paid_waitlist_set_updated_at();

alter table public.paid_waitlist enable row level security;
