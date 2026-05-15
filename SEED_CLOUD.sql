-- =============================================================================
-- Soundlog — Seed cloud (catalogue + démo communauté optionnelle)
-- À exécuter dans le SQL Editor Supabase (rôle postgres → bypass RLS).
--
-- Partie 1 : albums publics (référencés par les écoutes, id a1, a2… comme l’app).
-- Partie 2 : contenu démo — crée d’abord 3 comptes dans Authentication (email/mot de passe),
--          puis copie-colle leurs UUID ici et relance le bloc DO $$ … $$;
-- =============================================================================

-- ---------- Partie 1 : catalogue minimal (idempotent) ----------
INSERT INTO public.albums (id, title, artist, year, genre, artwork_url, added_by)
VALUES
  ('a1', 'Random Access Memories', 'Daft Punk', 2013, 'Électronique', NULL, NULL),
  ('a2', 'To Pimp a Butterfly', 'Kendrick Lamar', 2015, 'Hip-hop', NULL, NULL),
  ('a3', 'Blonde', 'Frank Ocean', 2016, 'R&B', NULL, NULL),
  ('a4', 'Currents', 'Tame Impala', 2015, 'Psyché', NULL, NULL),
  ('a6', 'In Rainbows', 'Radiohead', 2007, 'Rock', NULL, NULL),
  ('a9', 'Discovery', 'Daft Punk', 2001, 'Électronique', NULL, NULL),
  ('a12', 'Back to Black', 'Amy Winehouse', 2006, 'Soul', NULL, NULL),
  ('a13', 'good kid, m.A.A.d city', 'Kendrick Lamar', 2012, 'Hip-hop', NULL, NULL),
  ('a22', 'Punisher', 'Phoebe Bridgers', 2020, 'Indie', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------- Partie 2 : profils + fil public + murmures (optionnel) ----------
DO $$
DECLARE
  -- ▼ Remplace NULL par l’UUID Auth (Authentication → Users → copier l’id)
  uid_maya uuid := NULL;
  uid_noah uuid := NULL;
  uid_ines uuid := NULL;
BEGIN
  IF uid_maya IS NULL OR uid_noah IS NULL OR uid_ines IS NULL THEN
    RAISE NOTICE 'Soundlog seed : albums insérés. Pour le fil « Découvrir », édite SEED_CLOUD.sql et renseigne uid_maya, uid_noah, uid_ines (UUID Auth), puis réexécute ce fichier.';
    RETURN;
  END IF;

  INSERT INTO public.profiles (id, handle, name, bio, hue, city)
  VALUES
    (uid_maya, 'mayamix', 'Maya Chen', 'Playlists, radio et R&B.', 278, ''),
    (uid_noah, 'nightwax', 'Noah Mercier', 'Électronique après minuit.', 198, ''),
    (uid_ines, 'inesvinyl', 'Inès Duval', 'Carnets rock & pop.', 32, '')
  ON CONFLICT (id) DO UPDATE SET
    handle = excluded.handle,
    name = excluded.name,
    bio = excluded.bio,
    hue = excluded.hue;

  DELETE FROM public.shoutouts WHERE user_id IN (uid_maya, uid_noah, uid_ines);
  DELETE FROM public.listenings WHERE user_id IN (uid_maya, uid_noah, uid_ines);

  INSERT INTO public.listenings (user_id, album_id, rating, comment, date)
  VALUES
    (uid_maya, 'a3', 5, 'Une claque douce — chaque transition compte.', CURRENT_DATE - 1),
    (uid_noah, 'a4', 4, 'Psyché moderne, parfait pour la nuit.', CURRENT_DATE - 2),
    (uid_ines, 'a6', 4, 'Radiohead au sommet de leur art.', CURRENT_DATE - 3),
    (uid_maya, 'a13', 5, 'Le chef-d’œuvre narratif de Kendrick.', CURRENT_DATE - 4),
    (uid_noah, 'a9', 5, 'Discovery en boucle depuis 2001.', CURRENT_DATE - 5),
    (uid_ines, 'a12', 4, 'Soul intemporel.', CURRENT_DATE - 6),
    (uid_maya, 'a22', 5, 'Indie fragile et lumineux.', CURRENT_DATE - 7);

  INSERT INTO public.shoutouts (user_id, text)
  VALUES
    (uid_noah, 'Quelqu’un pour un live Tame Impala cet été ?'),
    (uid_ines, 'Je redécouvre Radiohead — In Rainbows ce soir.');

  RAISE NOTICE 'Soundlog seed : profils, écoutes et murmures démo insérés.';
END $$;
