# Importer ses playlists dans Soundlog

Soundlog accepte 5 sources pour alimenter ton profil + Sonar. Tu peux les combiner.

| Source | Setup | Auth utilisateur | Coût |
|---|---|---|---|
| **Deezer** | rien | URL publique | 0 € |
| **Spotify** | App developer + Premium côté owner | OAuth PKCE | Premium (~1-11 €/mois) |
| **YouTube / YouTube Music** | Clé Google Cloud | URL publique | 0 € (quota 10k req/jour) |
| **Last.fm** | Clé API Last.fm | Juste pseudo public | 0 € |
| **CSV / JSON manuel** | rien | Copier-coller | 0 € |
| Apple Music | bientôt — Apple Developer 99 €/an | OAuth Apple | n/a |
| Tidal | bientôt — pas d'API publique | n/a | n/a |

## Accéder à l'import

Sidebar → Compte → **Mon profil** → bouton **« Importer mes playlists »** → choisis ta plateforme.

---

## 1. Deezer (recommandé pour démarrer)

**Setup : aucun.** Marche immédiatement.

1. Ouvre Deezer (web ou app), ouvre une playlist publique.
2. Menu **…** → **Partager** → **Copier le lien**.
3. Sur Soundlog → modale Import → **Deezer** → colle l'URL → Importer.

L'URL peut être `https://www.deezer.com/playlist/123456` ou `https://www.deezer.com/fr/playlist/123456` ou juste l'ID `123456`.

> Marche aussi avec les playlists d'autres utilisateurs Deezer (du moment qu'elles sont publiques) — pratique pour importer la sélection de tes amis.

---

## 2. Spotify

### Setup app Spotify (3 min)

1. [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → connecte-toi → **Create app**.
2. Champs :
   - App name : `Soundlog`
   - App description : `Carnet d'écoutes`
   - Website : `https://soundlog-nine.vercel.app`
   - Redirect URIs (clique Add après chaque) :
     - `https://soundlog-nine.vercel.app/`
     - `http://127.0.0.1:8765/`   ← pour le dev local (Spotify refuse `localhost`)
3. Save.
4. Copie le **Client ID** affiché en haut de la fiche.
5. Édite `config.js` → `spotifyClientId: "ton-client-id"` → commit + push.

### ⚠️ Limitation Spotify 2024

Spotify exige que **le propriétaire de l'app dev** ait Spotify Premium pour que l'API renvoie autre chose qu'un 403. Si tu n'es pas Premium :
- L'autorisation OAuth marche (tu vois bien la page Spotify avec les permissions)
- Mais `/me/playlists` renvoie **403 active premium subscription required**
- Utilise Deezer ou Last.fm en attendant

Solutions :
- Essai Premium 1 mois (~1 €), tu actives l'app et tu peux annuler après
- Demande à un proche Premium de créer l'app pour toi (il te file juste le Client ID)
- Reste sur les autres plateformes

### Flow utilisateur

1. Modale Import → Spotify → **Autoriser Spotify**.
2. Tu es redirigé sur Spotify → autorise → retour sur Soundlog.
3. La liste de tes playlists s'affiche → coche + Importer.
4. Tu peux aussi cliquer **Importer mes titres aimés** pour ta bibliothèque sauvegardée.

---

## 3. YouTube / YouTube Music

### Setup clé Google Cloud (5 min, gratuit)

1. [https://console.cloud.google.com](https://console.cloud.google.com) → connecte-toi.
2. Crée un projet (ou réutilise un existant).
3. Barre latérale → **APIs & Services** → **Library**.
4. Cherche **YouTube Data API v3** → **Enable**.
5. **APIs & Services → Credentials → Create credentials → API key**.
6. Copie la clé (40 caractères, type `AIzaSyA...`).
7. (Recommandé) Clique **Edit API key** → **Application restrictions: HTTP referrers** → ajoute :
   - `https://soundlog-nine.vercel.app/*`
   - `http://127.0.0.1:8765/*`
8. **API restrictions** → restrict to **YouTube Data API v3** only.
9. Save.
10. Édite `config.js` → `youtubeApiKey: "AIzaSy..."` → commit + push.

### Flow utilisateur

1. Modale Import → YouTube / YouTube Music.
2. Colle l'URL d'une playlist (web YouTube OU YouTube Music — les deux marchent, l'ID `list=PL...` est le même).
3. Importer.

> Limitation : YouTube ne fournit pas toujours l'artiste/album proprement. On extrait depuis le titre de la vidéo (`Artiste - Titre`) et le nom du channel (`Artiste - Topic`). Données moins précises que Spotify/Deezer mais utilisables pour les tendances.

> Quota : 10 000 unités / jour gratuit. Une playlist de 100 titres coûte ~3 unités. Largement suffisant.

---

## 4. Last.fm

### Setup clé Last.fm (1 min, instantané, gratuit)

1. [https://www.last.fm/api/account/create](https://www.last.fm/api/account/create)
2. Connecte-toi avec un compte Last.fm (crée-en un gratuit si besoin — tu peux ne jamais scrobbler, seule la clé importe).
3. Remplis :
   - Contact email : ton email
   - Application name : `Soundlog`
   - Application description : `Carnet d'écoutes`
   - Callback URL : `https://soundlog-nine.vercel.app/`
   - Application homepage : `https://soundlog-nine.vercel.app/`
4. Submit. Tu vois **API key** (32 caractères) immédiatement.
5. Édite `config.js` → `lastfmApiKey: "ta-cle"` → commit + push.

### Flow utilisateur

1. Modale Import → Last.fm.
2. Tape ton pseudo Last.fm (ou celui de n'importe quel utilisateur public).
3. Importer.

→ Récupère ton **top 200 titres** + **top 100 albums** sur toute ta période d'écoute. Idéal pour booster les recommandations dès le premier import.

---

## 5. CSV / JSON manuel (universel)

Utile si tu as un export depuis :
- **Soundiiz** (gratuit jusqu'à 200 titres / playlist)
- **Exportify** ([exportify.net](https://exportify.net)) — export Spotify en CSV sans Premium
- **Tune My Music**
- Ton propre script

### Formats acceptés

**CSV** avec en-tête (insensible à la casse) :

```csv
Track Name,Artist Name,Album Name,Year
"Get Lucky","Daft Punk","Random Access Memories",2013
"Borderline","Tame Impala","Currents",2015
```

Les colonnes acceptées : `track|title|song`, `artist`, `album`, `year` (optionnel).

**JSON** = tableau ou objet `{tracks: [...]}` :

```json
[
  { "track": "Get Lucky", "artist": "Daft Punk", "album": "Random Access Memories", "year": 2013 },
  { "track": "Borderline", "artist": "Tame Impala", "album": "Currents" }
]
```

Le bouton **Importer** parse côté navigateur et insère via Supabase.

---

## Effet sur Soundlog

Toutes les sources alimentent la même table `imported_tracks`. Du coup :

- **Modale Stats** → tu vois `total_imported_tracks` et `imported_unique_artists` cumulés
- **Top artistes** → croisé entre toutes les sources
- **Recommandations cross-utilisateurs** (`recommendations_for` RPC) → boost si un autre user a écouté un album d'un artiste que tu as importé
- **Catalogue Soundlog local** → les albums uniques apparaissent dans tes Bibliothèques / Découvrir

Tu peux importer plusieurs fois la même playlist : la table `imported_playlists` upsert par ID, les `imported_tracks` sont remplacés à chaque import propre.

## Supprimer des imports

SQL Editor Supabase :

```sql
-- Supprimer une playlist + ses tracks
delete from public.imported_tracks where playlist_id = 'spotify:abc123';
delete from public.imported_playlists where id = 'spotify:abc123';

-- Tout reset
delete from public.imported_tracks where user_id = '<ton-uuid>';
delete from public.imported_playlists where user_id = '<ton-uuid>';
```

Ton `<ton-uuid>` est visible dans Supabase → Authentication → Users.

## Tableau récap config.js

```javascript
window.SLConfig = {
  supabaseUrl: "...",
  supabaseAnonKey: "...",
  appName: "Soundlog",

  spotifyClientId: "",   // optionnel
  spotifyRedirectUri: "", // laisse vide
  youtubeApiKey: "",     // optionnel
  lastfmApiKey: "",      // optionnel
  edgeProxyUrl: "",      // optionnel
};
```

Toutes les sources sont **optionnelles et indépendantes**. Renseigne uniquement celles que tu veux activer.
