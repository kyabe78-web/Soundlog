-- =========================================================================
-- Soundlog migration v4 — stats streaming (durée + classement)
-- À exécuter dans Supabase SQL Editor APRÈS SCHEMA.sql + MIGRATION_v2.sql.
-- =========================================================================

-- Durée des titres importés (Spotify, etc.)
alter table public.imported_tracks
  add column if not exists duration_ms int;

comment on column public.imported_tracks.duration_ms is 'Durée du morceau en ms (API source), pour estimer le volume de bibliothèque importée.';

-- Historique des lectures remontées depuis Spotify (Recently Played)
create table if not exists public.streaming_play_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null,
  remote_track_id text not null default '',
  track_name text not null default '',
  artist_name text not null default '',
  duration_ms int,
  played_at timestamptz not null,
  created_at timestamptz default now(),
  unique (user_id, source, remote_track_id, played_at)
);

create index if not exists streaming_play_events_user_idx
  on public.streaming_play_events(user_id, played_at desc);

alter table public.streaming_play_events enable row level security;

drop policy if exists "streaming_play_events self" on public.streaming_play_events;
create policy "streaming_play_events self" on public.streaming_play_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "streaming_play_events read public" on public.streaming_play_events;
create policy "streaming_play_events read public" on public.streaming_play_events
  for select using (true);

-- Recréer user_stats : CREATE OR REPLACE ne peut pas ajouter des colonnes au milieu
-- (erreur 42P16 si la vue v2 existait déjà avec created_at en dernière position).
drop view if exists public.leaderboard_listening;
drop view if exists public.user_stats;

create view public.user_stats as
  select
    p.id as user_id,
    p.handle,
    p.name,
    (select count(*) from public.listenings l where l.user_id = p.id) as total_listenings,
    (select count(distinct l.album_id) from public.listenings l where l.user_id = p.id) as unique_albums,
    (select round(avg(l.rating)::numeric, 2) from public.listenings l where l.user_id = p.id and l.rating is not null) as avg_rating,
    (select count(*) from public.lists li where li.user_id = p.id) as total_lists,
    (select count(*) from public.concerts c where c.user_id = p.id) as total_concerts,
    (select count(*) from public.wishlist w where w.user_id = p.id) as total_wishlist,
    (select count(*) from public.imported_tracks t where t.user_id = p.id) as total_imported_tracks,
    (select count(distinct t.artist_name) from public.imported_tracks t where t.user_id = p.id) as imported_unique_artists,
    coalesce((
      select sum(t.duration_ms)::bigint
      from public.imported_tracks t
      where t.user_id = p.id and t.duration_ms is not null and t.duration_ms > 0
    ), 0)::bigint as imported_library_ms,
    coalesce((
      select sum(e.duration_ms)::bigint
      from public.streaming_play_events e
      where e.user_id = p.id and e.duration_ms is not null and e.duration_ms > 0
    ), 0)::bigint as streaming_recent_ms,
    coalesce((
      select count(*)::bigint from public.streaming_play_events e where e.user_id = p.id
    ), 0)::bigint as streaming_recent_plays,
    p.created_at
  from public.profiles p;

grant select on public.user_stats to anon, authenticated;

-- Classement : score = bibliothèque importée + lectures récentes (Spotify)
create view public.leaderboard_listening as
  select
    s.user_id,
    s.handle,
    s.name,
    round((s.imported_library_ms::numeric / 60000), 1) as library_minutes,
    round((s.streaming_recent_ms::numeric / 60000), 1) as recent_listen_minutes,
    round(((s.imported_library_ms + s.streaming_recent_ms)::numeric / 60000), 1) as combined_minutes,
    rank() over (
      order by (s.imported_library_ms + s.streaming_recent_ms) desc nulls last
    ) as rank_listen,
    count(*) over () as leaderboard_size
  from public.user_stats s
  where (s.imported_library_ms + s.streaming_recent_ms) > 0;

grant select on public.leaderboard_listening to anon, authenticated;
