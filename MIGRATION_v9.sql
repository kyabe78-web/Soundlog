-- Soundlog v9 — notes demi-étoiles (4.5) + index feed
-- Exécuter dans Supabase SQL Editor après SCHEMA / v2–v8.

alter table public.listenings drop constraint if exists listenings_rating_check;

alter table public.listenings
  alter column rating type numeric(3,1)
  using (
    case
      when rating is null then null
      else least(5::numeric, greatest(1::numeric, round(rating::numeric, 0)))
    end
  );

alter table public.listenings
  add constraint listenings_rating_range
  check (rating is null or (rating >= 0.5 and rating <= 5));

create index if not exists listenings_created_idx
  on public.listenings (created_at desc);

create index if not exists listenings_user_created_idx
  on public.listenings (user_id, created_at desc);

-- Rafraîchir la vue feed (dépend de listenings.rating)
create or replace view public.public_feed as
  select l.id as listening_id,
         l.user_id,
         p.handle,
         p.name,
         p.hue,
         l.album_id,
         a.title as album_title,
         a.artist as album_artist,
         a.year as album_year,
         a.artwork_url,
         l.rating,
         l.comment,
         l.date,
         l.created_at
    from public.listenings l
    join public.profiles p on p.id = l.user_id
    join public.albums a on a.id = l.album_id
order by l.created_at desc
   limit 200;

grant select on public.public_feed to anon, authenticated;
