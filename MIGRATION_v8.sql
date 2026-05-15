-- =============================================================================
-- Soundlog — Migration v8
-- Réactions sur messages DM (🔥 💿 🎧)
-- Coller le fichier ENTIER dans le SQL Editor Supabase puis Run.
-- =============================================================================

create table if not exists public.dm_message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.dm_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('🔥', '💿', '🎧')),
  created_at timestamptz not null default now(),
  unique (message_id, user_id)
);

create index if not exists dm_message_reactions_message_idx
  on public.dm_message_reactions(message_id);

alter table public.dm_message_reactions enable row level security;

drop policy if exists "dm_reactions read thread members" on public.dm_message_reactions;
create policy "dm_reactions read thread members" on public.dm_message_reactions
  for select using (
    exists (
      select 1
      from public.dm_messages m
      join public.dm_threads t on t.id = m.thread_id
      where m.id = dm_message_reactions.message_id
        and (t.user_a = auth.uid() or t.user_b = auth.uid())
    )
  );

drop policy if exists "dm_reactions insert self" on public.dm_message_reactions;
create policy "dm_reactions insert self" on public.dm_message_reactions
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.dm_messages m
      join public.dm_threads t on t.id = m.thread_id
      where m.id = message_id
        and (t.user_a = auth.uid() or t.user_b = auth.uid())
    )
  );

drop policy if exists "dm_reactions update self" on public.dm_message_reactions;
create policy "dm_reactions update self" on public.dm_message_reactions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dm_reactions delete self" on public.dm_message_reactions;
create policy "dm_reactions delete self" on public.dm_message_reactions
  for delete using (user_id = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'dm_message_reactions'
  ) then
    alter publication supabase_realtime add table public.dm_message_reactions;
  end if;
end $$;
