-- Fix migration: the initial paid_waitlist.sql created a unique INDEX on
-- lower(email), but Supabase / Postgres upsert ON CONFLICT requires an exact
-- constraint match on the column. The API lowercases email before inserting,
-- so a plain unique constraint on email is both sufficient and correct.
--
-- Run this ONCE in your Supabase SQL Editor.

-- Add a plain unique constraint on email (no-op if it already exists).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'paid_waitlist_email_key'
  ) then
    alter table public.paid_waitlist
      add constraint paid_waitlist_email_key unique (email);
  end if;
end $$;

-- Drop the old expression-based unique index (it's redundant now).
drop index if exists public.paid_waitlist_email_lower_key;
