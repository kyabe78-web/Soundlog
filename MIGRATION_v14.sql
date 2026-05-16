-- Soundlog v14 — Mignon (compagnon musical)
-- État principal : profiles.settings.mignon (jsonb)
-- Table optionnelle pour inventaire cosmétique / cadeaux (évolutif)

comment on column public.profiles.settings is
  'Extensions profil : favoriteAlbum, albumWall, mignon (compagnon musical), etc.';

-- Inventaire cosmétique (préparé pour échanges futurs — non requis côté client v1)
create table if not exists public.mignon_cosmetics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  item_type text not null default 'accessory',
  acquired_at timestamptz not null default now(),
  source text,
  unique (user_id, item_id)
);

create index if not exists mignon_cosmetics_user_idx on public.mignon_cosmetics(user_id);

alter table public.mignon_cosmetics enable row level security;

create policy "mignon_cosmetics_select_own"
  on public.mignon_cosmetics for select
  using (auth.uid() = user_id);

create policy "mignon_cosmetics_insert_own"
  on public.mignon_cosmetics for insert
  with check (auth.uid() = user_id);

create policy "mignon_cosmetics_delete_own"
  on public.mignon_cosmetics for delete
  using (auth.uid() = user_id);

-- Cadeaux entre utilisateurs (scalable)
create table if not exists public.mignon_gifts (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  message text,
  created_at timestamptz not null default now(),
  seen_at timestamptz
);

create index if not exists mignon_gifts_to_user_idx on public.mignon_gifts(to_user_id);

alter table public.mignon_gifts enable row level security;

create policy "mignon_gifts_select_involved"
  on public.mignon_gifts for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "mignon_gifts_insert_sender"
  on public.mignon_gifts for insert
  with check (auth.uid() = from_user_id);

create policy "mignon_gifts_update_recipient"
  on public.mignon_gifts for update
  using (auth.uid() = to_user_id);
