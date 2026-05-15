-- =========================================================================
-- Soundlog — schéma Postgres pour Supabase
-- À exécuter une fois dans l'éditeur SQL de ton projet Supabase
-- (Auth est déjà fournie par auth.users)
-- =========================================================================

-- Activer pgcrypto (gen_random_uuid)
create extension if not exists "pgcrypto";

-- ---------- 1. Profils ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique not null check (length(handle) between 2 and 32 and handle ~ '^[a-z0-9_.-]+$'),
  name text not null check (length(name) between 1 and 80),
  bio text default '',
  hue int default 280 check (hue between 0 and 360),
  city text default '',
  avatar_url text,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_handle_idx on public.profiles using btree (lower(handle));
create index if not exists profiles_name_idx on public.profiles using btree (lower(name));

-- ---------- 2. Catalogue d'albums (partagé) ----------
-- Album id reste sous forme texte pour rester compatible avec le code
-- (a1, a2, ext-..., apple-..., deezer-...).
create table if not exists public.albums (
  id text primary key,
  title text not null,
  artist text not null,
  year int,
  genre text default '',
  artwork_url text,
  apple_collection_id text,
  deezer_album_id text,
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists albums_title_idx on public.albums using btree (lower(title));
create index if not exists albums_artist_idx on public.albums using btree (lower(artist));

-- ---------- 3. Écoutes (listenings) ----------
create table if not exists public.listenings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text default '',
  comment_at timestamptz,
  date date default current_date,
  created_at timestamptz default now()
);

create index if not exists listenings_user_idx on public.listenings(user_id, date desc);
create index if not exists listenings_album_idx on public.listenings(album_id);

-- ---------- 4. Listes ----------
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  is_public bool default true,
  created_at timestamptz default now()
);

create table if not exists public.list_items (
  list_id uuid not null references public.lists(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  position int default 0,
  added_at timestamptz default now(),
  primary key (list_id, album_id)
);

-- ---------- 5. Concerts (I was there) ----------
create table if not exists public.concerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  artist text not null,
  date date,
  venue text default '',
  city text default '',
  event_title text default '',
  notes text default '',
  created_at timestamptz default now()
);

create index if not exists concerts_user_idx on public.concerts(user_id, date desc);

-- ---------- 6. Wishlist (à écouter) ----------
create table if not exists public.wishlist (
  user_id uuid not null references public.profiles(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  reason text default '',
  added_at timestamptz default now(),
  primary key (user_id, album_id)
);

-- ---------- 7. Follows (asymétrique) ----------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index if not exists follows_followee_idx on public.follows(followee_id);

-- ---------- 8. Amitiés (symétriques) ----------
-- On stocke toujours (a_id < b_id) pour éviter les doublons
create table if not exists public.friends (
  a_id uuid not null references public.profiles(id) on delete cascade,
  b_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (a_id, b_id),
  check (a_id < b_id)
);

-- ---------- 9. Demandes d'ami ----------
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (from_user_id <> to_user_id)
);

create unique index if not exists friend_requests_unique_pending
  on public.friend_requests(from_user_id, to_user_id) where status = 'pending';

-- ---------- 10. Commentaires sur écoutes ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  listening_id uuid not null references public.listenings(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null check (length(text) between 1 and 800),
  created_at timestamptz default now()
);

create index if not exists comments_listening_idx on public.comments(listening_id);

-- ---------- 11. Shoutouts (murmures du disquaire) ----------
create table if not exists public.shoutouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null check (length(text) between 1 and 280),
  created_at timestamptz default now()
);

create index if not exists shoutouts_created_idx on public.shoutouts(created_at desc);

-- =========================================================================
-- RLS — sécurité par ligne
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.listenings enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.concerts enable row level security;
alter table public.wishlist enable row level security;
alter table public.follows enable row level security;
alter table public.friends enable row level security;
alter table public.friend_requests enable row level security;
alter table public.comments enable row level security;
alter table public.shoutouts enable row level security;

-- profiles : tout le monde voit ; seul le propriétaire édite
drop policy if exists "profiles select all" on public.profiles;
create policy "profiles select all" on public.profiles for select using (true);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

-- albums : tout le monde lit + insère ; modif/delete seulement par celui qui a ajouté
drop policy if exists "albums select all" on public.albums;
create policy "albums select all" on public.albums for select using (true);
drop policy if exists "albums insert auth" on public.albums;
create policy "albums insert auth" on public.albums for insert with check (auth.uid() is not null);
drop policy if exists "albums update own" on public.albums;
create policy "albums update own" on public.albums for update using (auth.uid() = added_by);

-- listenings : tout le monde lit (= public) ; seul l'auteur écrit
drop policy if exists "listenings select all" on public.listenings;
create policy "listenings select all" on public.listenings for select using (true);
drop policy if exists "listenings insert own" on public.listenings;
create policy "listenings insert own" on public.listenings for insert with check (auth.uid() = user_id);
drop policy if exists "listenings update own" on public.listenings;
create policy "listenings update own" on public.listenings for update using (auth.uid() = user_id);
drop policy if exists "listenings delete own" on public.listenings;
create policy "listenings delete own" on public.listenings for delete using (auth.uid() = user_id);

-- lists / list_items
drop policy if exists "lists select public or own" on public.lists;
create policy "lists select public or own" on public.lists for select using (is_public or auth.uid() = user_id);
drop policy if exists "lists insert own" on public.lists;
create policy "lists insert own" on public.lists for insert with check (auth.uid() = user_id);
drop policy if exists "lists update own" on public.lists;
create policy "lists update own" on public.lists for update using (auth.uid() = user_id);
drop policy if exists "lists delete own" on public.lists;
create policy "lists delete own" on public.lists for delete using (auth.uid() = user_id);

drop policy if exists "list_items select via parent" on public.list_items;
create policy "list_items select via parent" on public.list_items for select
  using (exists (select 1 from public.lists l where l.id = list_id and (l.is_public or l.user_id = auth.uid())));
drop policy if exists "list_items write own" on public.list_items;
create policy "list_items write own" on public.list_items for all
  using (exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()))
  with check (exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));

-- concerts : public en lecture, propriétaire en écriture
drop policy if exists "concerts select all" on public.concerts;
create policy "concerts select all" on public.concerts for select using (true);
drop policy if exists "concerts write own" on public.concerts;
create policy "concerts write own" on public.concerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- wishlist : privée (chacun voit seulement la sienne)
drop policy if exists "wishlist self" on public.wishlist;
create policy "wishlist self" on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- follows : tout le monde lit, follower contrôle
drop policy if exists "follows select all" on public.follows;
create policy "follows select all" on public.follows for select using (true);
drop policy if exists "follows write follower" on public.follows;
create policy "follows write follower" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- friends : tout le monde lit, écriture limitée aux participants
drop policy if exists "friends select all" on public.friends;
create policy "friends select all" on public.friends for select using (true);
drop policy if exists "friends write party" on public.friends;
create policy "friends write party" on public.friends for all using (auth.uid() in (a_id, b_id)) with check (auth.uid() in (a_id, b_id));

-- friend_requests : visibles uniquement par from/to
drop policy if exists "fr select party" on public.friend_requests;
create policy "fr select party" on public.friend_requests for select
  using (auth.uid() in (from_user_id, to_user_id));
drop policy if exists "fr insert as sender" on public.friend_requests;
create policy "fr insert as sender" on public.friend_requests for insert
  with check (auth.uid() = from_user_id);
drop policy if exists "fr update as recipient" on public.friend_requests;
create policy "fr update as recipient" on public.friend_requests for update
  using (auth.uid() in (from_user_id, to_user_id));
drop policy if exists "fr delete as sender" on public.friend_requests;
create policy "fr delete as sender" on public.friend_requests for delete
  using (auth.uid() = from_user_id);

-- comments : lecture publique (vu sur le fil), écriture pour l'auteur, delete owner ou auteur de l'écoute
drop policy if exists "comments select all" on public.comments;
create policy "comments select all" on public.comments for select using (true);
drop policy if exists "comments insert auth" on public.comments;
create policy "comments insert auth" on public.comments for insert with check (auth.uid() = author_id);
drop policy if exists "comments delete owner" on public.comments;
create policy "comments delete owner" on public.comments for delete
  using (auth.uid() = author_id
    or auth.uid() in (select user_id from public.listenings where id = listening_id));

-- shoutouts : lecture publique, écriture pour le user
drop policy if exists "shoutouts select all" on public.shoutouts;
create policy "shoutouts select all" on public.shoutouts for select using (true);
drop policy if exists "shoutouts write own" on public.shoutouts;
create policy "shoutouts write own" on public.shoutouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- Procédure : accepter une demande d'ami (transactionnelle)
-- =========================================================================
create or replace function public.accept_friend_request(req_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  req record;
  a uuid;
  b uuid;
begin
  select * into req from public.friend_requests where id = req_id;
  if req is null then raise exception 'request not found'; end if;
  if auth.uid() <> req.to_user_id then raise exception 'not authorized'; end if;
  if req.status <> 'pending' then raise exception 'not pending'; end if;

  a := least(req.from_user_id, req.to_user_id);
  b := greatest(req.from_user_id, req.to_user_id);

  update public.friend_requests set status = 'accepted', updated_at = now() where id = req_id;
  insert into public.friends(a_id, b_id) values (a, b) on conflict do nothing;
end;
$$;

grant execute on function public.accept_friend_request(uuid) to authenticated;

-- =========================================================================
-- Trigger : updated_at
-- =========================================================================
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
for each row execute procedure public.touch_updated_at();

-- =========================================================================
-- Vue agrégée : feed public (50 derniers écoutes des comptes publics)
-- =========================================================================
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
