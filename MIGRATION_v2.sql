-- =========================================================================
-- Soundlog migration v2
-- À jouer dans Supabase SQL Editor APRÈS SCHEMA.sql.
-- Idempotent : peut être rejoué sans casser.
-- =========================================================================

-- ---------- 1. Storage bucket "avatars" ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Policies pour le bucket avatars
drop policy if exists "Avatar lecture publique" on storage.objects;
create policy "Avatar lecture publique" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Avatar upload propri\u00e9taire" on storage.objects;
create policy "Avatar upload propri\u00e9taire" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Avatar update propri\u00e9taire" on storage.objects;
create policy "Avatar update propri\u00e9taire" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Avatar delete propri\u00e9taire" on storage.objects;
create policy "Avatar delete propri\u00e9taire" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------- 2. Playlists importées (Spotify/Deezer/Apple) ----------
create table if not exists public.imported_playlists (
  id text primary key, -- 'spotify:<id>' / 'deezer:<id>'
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('spotify','deezer','apple')),
  remote_id text not null,
  name text not null,
  description text default '',
  artwork_url text,
  imported_at timestamptz default now(),
  raw jsonb default '{}'::jsonb
);

create index if not exists imported_playlists_user_idx on public.imported_playlists(user_id);

create table if not exists public.imported_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  playlist_id text references public.imported_playlists(id) on delete set null,
  source text not null,
  track_name text not null,
  artist_name text not null,
  album_name text not null,
  album_year int,
  album_artwork_url text,
  remote_track_id text,
  remote_album_id text,
  added_at timestamptz default now()
);

create index if not exists imported_tracks_user_idx on public.imported_tracks(user_id);
create index if not exists imported_tracks_artist_idx on public.imported_tracks(user_id, lower(artist_name));
create index if not exists imported_tracks_album_idx on public.imported_tracks(user_id, lower(album_name), lower(artist_name));

alter table public.imported_playlists enable row level security;
alter table public.imported_tracks enable row level security;

drop policy if exists "imported_playlists self" on public.imported_playlists;
create policy "imported_playlists self" on public.imported_playlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "imported_playlists read public" on public.imported_playlists;
create policy "imported_playlists read public" on public.imported_playlists
  for select using (true);

drop policy if exists "imported_tracks self" on public.imported_tracks;
create policy "imported_tracks self" on public.imported_tracks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "imported_tracks read public" on public.imported_tracks;
create policy "imported_tracks read public" on public.imported_tracks
  for select using (true);

-- ---------- 3. Profil : champ avatar_url déjà présent, on ajoute is_email_confirmed ----------
alter table public.profiles
  add column if not exists onboarded bool default false;

-- ---------- 4. Realtime : on s'assure que les tables d'intérêt sont broadcastées ----------
-- Supabase Realtime utilise la publication "supabase_realtime"
do $$
begin
  -- listenings
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='listenings') then
    execute 'alter publication supabase_realtime add table public.listenings';
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='comments') then
    execute 'alter publication supabase_realtime add table public.comments';
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='shoutouts') then
    execute 'alter publication supabase_realtime add table public.shoutouts';
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='friend_requests') then
    execute 'alter publication supabase_realtime add table public.friend_requests';
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='follows') then
    execute 'alter publication supabase_realtime add table public.follows';
  end if;
end$$;

-- ---------- 5. Vue stats personnelles ----------
create or replace view public.user_stats as
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
    p.created_at
  from public.profiles p;

grant select on public.user_stats to anon, authenticated;

-- ---------- 6. Vue : top artistes par user (basée sur tracks importées + écoutes) ----------
create or replace view public.user_top_artists as
  select
    user_id,
    artist_name,
    count(*) as track_count,
    max(added_at) as last_seen
  from (
    select user_id, artist_name, added_at from public.imported_tracks
    union all
    select l.user_id, a.artist as artist_name, l.created_at as added_at
      from public.listenings l join public.albums a on a.id = l.album_id
  ) merged
  group by user_id, artist_name;

grant select on public.user_top_artists to anon, authenticated;

-- ---------- 7. Index supplémentaires pour le feed realtime ----------
create index if not exists listenings_created_idx on public.listenings(created_at desc);
create index if not exists comments_created_idx on public.comments(created_at desc);

-- ---------- 8. Fonction utilitaire : recos hybrides ----------
-- (renvoie top albums vus chez les amis ou les artistes en commun)
create or replace function public.recommendations_for(uid uuid, limit_n int default 12)
returns table (album_id text, title text, artist text, score numeric)
language plpgsql
stable
as $$
begin
  return query
    with my_artists as (
      select distinct lower(artist_name) as a from public.imported_tracks where user_id = uid
      union
      select distinct lower(a.artist) from public.listenings l join public.albums a on a.id=l.album_id where l.user_id = uid
    ),
    my_albums as (
      select distinct album_id from public.listenings where user_id = uid
      union
      select distinct l.album_id
        from public.listenings l
        join public.albums a on a.id = l.album_id
        join public.imported_tracks t on lower(t.artist_name) = lower(a.artist) and lower(t.album_name) = lower(a.title)
        where t.user_id = uid
    )
    select a.id, a.title, a.artist,
           (count(distinct l.user_id) * 1.0
            + case when lower(a.artist) in (select a from my_artists) then 5 else 0 end) as score
      from public.albums a
      join public.listenings l on l.album_id = a.id
     where a.id not in (select album_id from my_albums)
  group by a.id, a.title, a.artist
  order by score desc, count(distinct l.user_id) desc
     limit limit_n;
end;
$$;

grant execute on function public.recommendations_for(uuid, int) to anon, authenticated;
