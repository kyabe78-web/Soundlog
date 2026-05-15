-- =========================================================================
-- Soundlog migration v5 — Phase B : likes + notifications serveur
-- À exécuter dans Supabase SQL Editor après SCHEMA.sql (+ v2/v3/v4 si besoin).
-- Idempotent quand c’est possible.
-- =========================================================================

-- ---------- 1. Likes sur écoutes ----------
create table if not exists public.listening_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listening_id uuid not null references public.listenings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listening_id)
);

create index if not exists listening_likes_listening_idx on public.listening_likes(listening_id);

-- ---------- 2. Notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in (
    'like', 'comment', 'friend_request', 'friend_accepted', 'follow', 'concert'
  )),
  title text not null check (length(title) between 1 and 120),
  body text default '' check (length(body) <= 500),
  meta jsonb default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists notifications_recipient_idx on public.notifications(recipient_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(recipient_id) where read_at is null;

-- ---------- 3. RLS ----------
alter table public.listening_likes enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "listening_likes select all" on public.listening_likes;
create policy "listening_likes select all" on public.listening_likes for select using (true);

drop policy if exists "listening_likes write own" on public.listening_likes;
create policy "listening_likes write own" on public.listening_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notifications select own" on public.notifications;
create policy "notifications select own" on public.notifications
  for select using (auth.uid() = recipient_id);

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
  for update using (auth.uid() = recipient_id);

-- ---------- 4. Helper + triggers (notifications automatiques) ----------
-- Nettoyage si une exécution partielle a créé d’anciens noms de fonctions
drop function if exists public.trg_notify_friend_request() cascade;
drop function if exists public.trg_notify_friend_accepted() cascade;

create or replace function public.sl_notify_user(
  p_recipient uuid,
  p_actor uuid,
  p_type text,
  p_title text,
  p_body text default '',
  p_meta jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_recipient is null then return; end if;
  if p_actor is not null and p_recipient = p_actor then return; end if;
  insert into public.notifications(recipient_id, actor_id, type, title, body, meta)
  values (p_recipient, p_actor, p_type, left(p_title, 120), left(coalesce(p_body, ''), 500), coalesce(p_meta, '{}'::jsonb));
end;
$$;

create or replace function public.trg_notify_on_comment() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  actor_name text;
begin
  select l.user_id into owner_id from public.listenings l where l.id = new.listening_id;
  if owner_id is null then return new; end if;
  select p.name into actor_name from public.profiles p where p.id = new.author_id;
  perform public.sl_notify_user(
    owner_id,
    new.author_id,
    'comment',
    coalesce(actor_name, 'Quelqu''un') || ' a commenté ton écoute',
    left(new.text, 120),
    jsonb_build_object('listening_id', new.listening_id, 'comment_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists trg_comments_notify on public.comments;
create trigger trg_comments_notify
  after insert on public.comments
  for each row execute procedure public.trg_notify_on_comment();

create or replace function public.trg_notify_on_like() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  actor_name text;
begin
  select l.user_id into owner_id from public.listenings l where l.id = new.listening_id;
  if owner_id is null then return new; end if;
  select p.name into actor_name from public.profiles p where p.id = new.user_id;
  perform public.sl_notify_user(
    owner_id,
    new.user_id,
    'like',
    coalesce(actor_name, 'Quelqu''un') || ' a aimé ton écoute',
    '',
    jsonb_build_object('listening_id', new.listening_id)
  );
  return new;
end;
$$;

drop trigger if exists trg_likes_notify on public.listening_likes;
create trigger trg_likes_notify
  after insert on public.listening_likes
  for each row execute procedure public.trg_notify_on_like();

create or replace function public.trg_notify_on_friend_request() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
begin
  if new.status <> 'pending' then return new; end if;
  select p.name into actor_name from public.profiles p where p.id = new.from_user_id;
  perform public.sl_notify_user(
    new.to_user_id,
    new.from_user_id,
    'friend_request',
    'Demande d''ami',
    coalesce(actor_name, 'Quelqu''un') || ' souhaite se connecter.',
    jsonb_build_object('friend_request_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists trg_fr_notify on public.friend_requests;
create trigger trg_fr_notify
  after insert on public.friend_requests
  for each row execute procedure public.trg_notify_on_friend_request();

create or replace function public.trg_notify_on_friend_accepted() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
begin
  if new.status <> 'accepted' or old.status = 'accepted' then return new; end if;
  select p.name into actor_name from public.profiles p where p.id = new.to_user_id;
  perform public.sl_notify_user(
    new.from_user_id,
    new.to_user_id,
    'friend_accepted',
    'Demande acceptée',
    coalesce(actor_name, 'Quelqu''un') || ' est maintenant ton·ta ami·e.',
    jsonb_build_object('friend_request_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists trg_fr_accepted_notify on public.friend_requests;
create trigger trg_fr_accepted_notify
  after update on public.friend_requests
  for each row execute procedure public.trg_notify_on_friend_accepted();

create or replace function public.trg_notify_on_follow() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
begin
  select p.name into actor_name from public.profiles p where p.id = new.follower_id;
  perform public.sl_notify_user(
    new.followee_id,
    new.follower_id,
    'follow',
    'Nouveau follower',
    coalesce(actor_name, 'Quelqu''un') || ' te suit maintenant.',
  jsonb_build_object('follower_id', new.follower_id)
  );
  return new;
end;
$$;

drop trigger if exists trg_follows_notify on public.follows;
create trigger trg_follows_notify
  after insert on public.follows
  for each row execute procedure public.trg_notify_on_follow();

-- ---------- 5. Realtime ----------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'listening_likes') then
    alter publication supabase_realtime add table public.listening_likes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception when others then null;
end$$;
