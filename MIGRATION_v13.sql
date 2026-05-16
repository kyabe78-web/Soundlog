-- MIGRATION v13 — Amitiés : realtime + RPC refuse + intégrité
-- Exécuter dans Supabase SQL Editor après v12.

-- Realtime : table friends (accept / remove visibles des deux côtés)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'friends'
  ) then
    execute 'alter publication supabase_realtime add table public.friends';
  end if;
end $$;

-- Refus explicite (recipient) — évite les updates ambigus côté client
create or replace function public.decline_friend_request(req_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
begin
  select * into req from public.friend_requests where id = req_id;
  if req is null then raise exception 'request not found'; end if;
  if auth.uid() <> req.to_user_id then raise exception 'not authorized'; end if;
  if req.status <> 'pending' then raise exception 'not pending'; end if;
  update public.friend_requests set status = 'rejected', updated_at = now() where id = req_id;
end;
$$;

grant execute on function public.decline_friend_request(uuid) to authenticated;

-- Renforcer accept (idempotent si déjà acceptée côté client)
create or replace function public.accept_friend_request(req_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
  a uuid;
  b uuid;
begin
  select * into req from public.friend_requests where id = req_id for update;
  if req is null then raise exception 'request not found'; end if;
  if auth.uid() <> req.to_user_id then raise exception 'not authorized'; end if;
  if req.status = 'accepted' then
    a := least(req.from_user_id, req.to_user_id);
    b := greatest(req.from_user_id, req.to_user_id);
    insert into public.friends(a_id, b_id) values (a, b) on conflict do nothing;
    return;
  end if;
  if req.status <> 'pending' then raise exception 'not pending'; end if;

  a := least(req.from_user_id, req.to_user_id);
  b := greatest(req.from_user_id, req.to_user_id);

  update public.friend_requests set status = 'accepted', updated_at = now() where id = req_id;
  insert into public.friends(a_id, b_id) values (a, b) on conflict do nothing;
end;
$$;
