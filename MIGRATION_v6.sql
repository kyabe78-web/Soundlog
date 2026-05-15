-- =============================================================================
-- Soundlog — Migration v6 (Phase C)
-- Coller ce fichier ENTIER dans le SQL Editor puis Run (une seule fois).
-- =============================================================================

-- 1) Colonne MusicBrainz
alter table public.albums
  add column if not exists musicbrainz_release_id text;

create index if not exists albums_mb_release_idx
  on public.albums (musicbrainz_release_id)
  where musicbrainz_release_id is not null;

-- 2) Recréer recommendations_for (nouveau type de retour)
drop function if exists public.recommendations_for(uuid, int);

create function public.recommendations_for(uid uuid, limit_n int default 12)
returns table (
  album_id text,
  title text,
  artist text,
  score numeric,
  year int,
  genre text,
  artwork_url text,
  musicbrainz_release_id text
)
language sql
stable
as $rec$
  with my_artists as (
    select distinct lower(artist_name) as artist_key
    from public.imported_tracks
    where user_id = uid
    union
    select distinct lower(a.artist)
    from public.listenings l
    join public.albums a on a.id = l.album_id
    where l.user_id = uid
  ),
  my_albums as (
    select distinct album_id from public.listenings where user_id = uid
    union
    select distinct l.album_id
    from public.listenings l
    join public.albums a on a.id = l.album_id
    join public.imported_tracks t
      on lower(t.artist_name) = lower(a.artist)
     and lower(t.album_name) = lower(a.title)
    where t.user_id = uid
  )
  select
    a.id,
    a.title,
    a.artist,
    (
      count(distinct l.user_id)::numeric * 1.0
      + case when lower(a.artist) in (select artist_key from my_artists) then 5 else 0 end
    ) as score,
    a.year,
    a.genre,
    a.artwork_url,
    a.musicbrainz_release_id
  from public.albums a
  join public.listenings l on l.album_id = a.id
  where a.id not in (select album_id from my_albums)
  group by a.id, a.title, a.artist, a.year, a.genre, a.artwork_url, a.musicbrainz_release_id
  order by 4 desc, count(distinct l.user_id) desc
  limit limit_n;
$rec$;

grant execute on function public.recommendations_for(uuid, int) to anon, authenticated;
