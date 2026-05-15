-- =========================================================================
-- Soundlog migration v3 — social : intérêts concerts + messagerie ami·e
-- À exécuter dans Supabase SQL Editor après SCHEMA.sql (+ migrations précédentes).
-- Idempotent quand c’est possible.
-- =========================================================================

-- ---------- 1. Intérêts pour concerts / dates à venir ----------
create table if not exists public.event_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_key text not null,
  artist text not null default '',
  datetime_iso text not null default '',
  venue text not null default '',
  city text not null default '',
  event_url text not null default '',
  created_at timestamptz default now(),
  unique (user_id, event_key)
);

create index if not exists event_interests_event_key_idx on public.event_interests(event_key);
create index if not exists event_interests_user_idx on public.event_interests(user_id);

-- ---------- 2. Fils de discussion 1:1 (ami·es) ----------
create table if not exists public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  updated_at timestamptz default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create index if not exists dm_threads_user_a_idx on public.dm_threads(user_a);
create index if not exists dm_threads_user_b_idx on public.dm_threads(user_b);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dm_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz default now()
);

create index if not exists dm_messages_thread_idx on public.dm_messages(thread_id, created_at desc);

-- ---------- 3. RLS ----------
alter table public.event_interests enable row level security;
alter table public.dm_threads enable row level security;
alter table public.dm_messages enable row level security;

drop policy if exists "event_interests read all" on public.event_interests;
create policy "event_interests read all" on public.event_interests
  for select using (true);

drop policy if exists "event_interests write own" on public.event_interests;
create policy "event_interests write own" on public.event_interests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "dm_threads read members" on public.dm_threads;
create policy "dm_threads read members" on public.dm_threads
  for select using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "dm_threads insert members" on public.dm_threads;
create policy "dm_threads insert members" on public.dm_threads
  for insert with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "dm_threads update members" on public.dm_threads;
create policy "dm_threads update members" on public.dm_threads
  for update using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "dm_messages read thread" on public.dm_messages;
create policy "dm_messages read thread" on public.dm_messages
  for select using (
    exists (
      select 1 from public.dm_threads t
      where t.id = dm_messages.thread_id
        and (t.user_a = auth.uid() or t.user_b = auth.uid())
    )
  );

drop policy if exists "dm_messages insert self" on public.dm_messages;
create policy "dm_messages insert self" on public.dm_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.dm_threads t
      where t.id = thread_id
        and (t.user_a = auth.uid() or t.user_b = auth.uid())
    )
  );

-- ---------- 4. Realtime ----------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'event_interests') then
    alter publication supabase_realtime add table public.event_interests;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'dm_messages') then
    alter publication supabase_realtime add table public.dm_messages;
  end if;
exception when others then null;
end$$;
