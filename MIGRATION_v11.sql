-- Soundlog v11 — Album favori de tous les temps (settings JSON)
-- Exécuter dans Supabase SQL Editor après SCHEMA + v2–v10.
-- Les données vivent dans profiles.settings.favoriteAlbum (pas de colonne dédiée).

comment on column public.profiles.settings is
  'JSON libre : favoriteAlbum { albumId, trackTitle, theme, savedAt }, autres préférences UI.';

-- Index optionnel pour requêtes futures (album favori renseigné)
create index if not exists profiles_settings_favorite_album_idx
  on public.profiles ((settings->'favoriteAlbum'->>'albumId'))
  where (settings->'favoriteAlbum'->>'albumId') is not null;
