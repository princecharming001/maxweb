-- Run in Supabase SQL Editor (Dashboard → SQL).
-- Used by POST /api/max-waitlist (service role from server; RLS locked to service_role).

create table if not exists public.max_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  password_hash text not null
);

create unique index if not exists max_waitlist_email_lower_idx
  on public.max_waitlist (lower(email));

alter table public.max_waitlist enable row level security;

drop policy if exists "max_waitlist_service_role_all" on public.max_waitlist;
create policy "max_waitlist_service_role_all"
  on public.max_waitlist
  for all
  to service_role
  using (true)
  with check (true);

revoke all on table public.max_waitlist from anon, authenticated;
grant select, insert, update, delete on table public.max_waitlist to service_role;
