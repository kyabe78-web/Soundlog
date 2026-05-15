-- =============================================================================
-- Soundlog — Migration v7 (Phase D)
-- Recherche full-text albums + profils (pg_trgm)
-- Coller le fichier ENTIER dans le SQL Editor puis Run.
-- =============================================================================

create extension if not exists pg_trgm;

drop function if exists public.search_catalog(text, int);

create function public.search_catalog(q text, limit_n int default 24)
returns jsonb
language sql
stable
as $search$
  with qq as (
    select trim(coalesce(q, '')) as raw, lower(trim(coalesce(q, ''))) as term
  )
  select jsonb_build_object(
    'albums',
    coalesce(
      (
        select jsonb_agg(to_jsonb(x) order by x.rank desc, x.title)
        from (
          select
            a.id,
            a.title,
            a.artist,
            a.year,
            a.genre,
            a.artwork_url,
            a.musicbrainz_release_id,
            greatest(
              similarity(lower(a.title), (select term from qq)),
              similarity(lower(a.artist), (select term from qq))
            ) as rank
          from public.albums a, qq
          where (select raw from qq) <> ''
            and (
              lower(a.title) like '%' || (select term from qq) || '%'
              or lower(a.artist) like '%' || (select term from qq) || '%'
              or lower(coalesce(a.genre, '')) like '%' || (select term from qq) || '%'
              or similarity(lower(a.title), (select term from qq)) > 0.18
              or similarity(lower(a.artist), (select term from qq)) > 0.18
            )
          order by rank desc, a.title
          limit limit_n
        ) x
      ),
      '[]'::jsonb
    ),
    'profiles',
    coalesce(
      (
        select jsonb_agg(to_jsonb(p) order by p.rank desc, p.name)
        from (
          select
            pr.id,
            pr.handle,
            pr.name,
            pr.bio,
            pr.avatar_url,
            pr.hue,
            greatest(
              similarity(lower(coalesce(pr.name, '')), (select term from qq)),
              similarity(lower(coalesce(pr.handle, '')), (select term from qq))
            ) as rank
          from public.profiles pr, qq
          where (select raw from qq) <> ''
            and (
              lower(coalesce(pr.name, '')) like '%' || (select term from qq) || '%'
              or lower(coalesce(pr.handle, '')) like '%' || (select term from qq) || '%'
              or similarity(lower(coalesce(pr.name, '')), (select term from qq)) > 0.22
              or similarity(lower(coalesce(pr.handle, '')), (select term from qq)) > 0.22
            )
          order by rank desc, pr.name
          limit limit_n
        ) p
      ),
      '[]'::jsonb
    )
  );
$search$;

grant execute on function public.search_catalog(text, int) to anon, authenticated;

create index if not exists albums_title_trgm_idx on public.albums using gin (lower(title) gin_trgm_ops);
create index if not exists albums_artist_trgm_idx on public.albums using gin (lower(artist) gin_trgm_ops);
create index if not exists profiles_name_trgm_idx on public.profiles using gin (lower(name) gin_trgm_ops);
create index if not exists profiles_handle_trgm_idx on public.profiles using gin (lower(handle) gin_trgm_ops);
