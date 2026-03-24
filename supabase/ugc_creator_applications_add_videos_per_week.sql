-- Run once if you already created `ugc_creator_applications` without this column.

alter table public.ugc_creator_applications
  add column if not exists videos_per_week text;

-- Optional: backfill existing rows (adjust default to match your product).
update public.ugc_creator_applications
set videos_per_week = coalesce(videos_per_week, '3-5')
where videos_per_week is null;

alter table public.ugc_creator_applications
  alter column videos_per_week set not null;
