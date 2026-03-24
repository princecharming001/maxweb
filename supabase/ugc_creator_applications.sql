-- Run in Supabase SQL Editor (Dashboard → SQL).
-- API routes use the service role key, which bypasses RLS.

create table if not exists public.ugc_creator_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  primary_platform text not null,
  videos_per_week text not null,
  social_handle text not null,
  portfolio_url text,
  experience_notes text
);

create unique index if not exists ugc_creator_applications_email_lower_key
  on public.ugc_creator_applications (lower(email));

alter table public.ugc_creator_applications enable row level security;
