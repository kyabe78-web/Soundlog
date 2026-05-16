-- Soundlog v12 — Album Wall (Top 10) dans profiles.settings.albumWall
-- Exécuter après SCHEMA + v2–v11.

comment on column public.profiles.settings is
  'JSON : favoriteAlbum, albumWall { albumIds[], pinnedId, entries{}, updatedAt }, …';

create index if not exists profiles_settings_album_wall_idx
  on public.profiles ((settings->'albumWall'->'pinnedId'))
  where (settings->'albumWall'->'pinnedId') is not null;
