-- Soundlog v10 — réactions, réponses aux commentaires, notifications étendues
-- Exécuter dans Supabase SQL Editor après SCHEMA + v2–v9.

-- ---------- 1. Réponses aux commentaires ----------
alter table public.comments
  add column if not exists parent_id uuid references public.comments(id) on delete cascade;

create index if not exists comments_parent_idx on public.comments(parent_id);

-- ---------- 2. Réactions emoji sur écoutes ----------
create table if not exists public.listening_reactions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listening_id uuid not null references public.listenings(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 8),
  created_at timestamptz default now(),
  primary key (user_id, listening_id, emoji)
);

create index if not exists listening_reactions_listening_idx on public.listening_reactions(listening_id);

-- ---------- 3. Likes sur commentaires (optionnel léger) ----------
create table if not exists public.comment_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, comment_id)
);

create index if not exists comment_likes_comment_idx on public.comment_likes(comment_id);

-- ---------- 4. RLS ----------
alter table public.listening_reactions enable row level security;
alter table public.comment_likes enable row level security;

drop policy if exists "listening_reactions select all" on public.listening_reactions;
create policy "listening_reactions select all" on public.listening_reactions for select using (true);

drop policy if exists "listening_reactions write own" on public.listening_reactions;
create policy "listening_reactions write own" on public.listening_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "comment_likes select all" on public.comment_likes;
create policy "comment_likes select all" on public.comment_likes for select using (true);

drop policy if exists "comment_likes write own" on public.comment_likes;
create policy "comment_likes write own" on public.comment_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- 5. Notifications — types étendus ----------
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'like', 'comment', 'comment_reply', 'reaction', 'friend_request', 'friend_accepted', 'follow', 'concert'
));

create or replace function public.trg_notify_on_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
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
    'reaction',
    coalesce(actor_name, 'Quelqu''un') || ' a réagi ' || new.emoji,
    '',
    jsonb_build_object('listening_id', new.listening_id, 'emoji', new.emoji)
  );
  return new;
end;
$$;

drop trigger if exists trg_reactions_notify on public.listening_reactions;
create trigger trg_reactions_notify
  after insert on public.listening_reactions
  for each row execute procedure public.trg_notify_on_reaction();

create or replace function public.trg_notify_on_comment_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  parent_author uuid;
  owner_id uuid;
  actor_name text;
begin
  if new.parent_id is null then return new; end if;
  select c.author_id into parent_author from public.comments c where c.id = new.parent_id;
  if parent_author is null or parent_author = new.author_id then return new; end if;
  select p.name into actor_name from public.profiles p where p.id = new.author_id;
  perform public.sl_notify_user(
    parent_author,
    new.author_id,
    'comment_reply',
    coalesce(actor_name, 'Quelqu''un') || ' a répondu à ton commentaire',
    left(new.text, 120),
    jsonb_build_object('listening_id', new.listening_id, 'comment_id', new.id, 'parent_id', new.parent_id)
  );
  return new;
end;
$$;

drop trigger if exists trg_comments_reply_notify on public.comments;
create trigger trg_comments_reply_notify
  after insert on public.comments
  for each row execute procedure public.trg_notify_on_comment_reply();

-- ---------- 6. Realtime ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'listening_reactions'
  ) then
    alter publication supabase_realtime add table public.listening_reactions;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comment_likes'
  ) then
    alter publication supabase_realtime add table public.comment_likes;
  end if;
exception when others then null;
end$$;
