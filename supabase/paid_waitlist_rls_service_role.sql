-- Run once in Supabase SQL Editor if inserts/updates to paid_waitlist fail with
-- "new row violates row-level security policy" while using the service_role key.
--
-- RLS is ON with no policies → only roles that bypass RLS (service_role) or
-- roles with matching policies can write. These policies explicitly allow the
-- database role `service_role` (used by the Supabase JS client when you pass
-- the service_role API secret).

alter table public.paid_waitlist enable row level security;

drop policy if exists "paid_waitlist_service_role_all" on public.paid_waitlist;

create policy "paid_waitlist_service_role_all"
  on public.paid_waitlist
  for all
  to service_role
  using (true)
  with check (true);

-- Do not grant anon/authenticated access to this table (sensitive password hashes).
revoke all on public.paid_waitlist from anon, authenticated;
grant select, insert, update, delete on public.paid_waitlist to service_role;
