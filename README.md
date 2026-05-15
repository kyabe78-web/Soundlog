# Soundlog

Carnet d’écoutes et réseau social musical (inspiré Letterboxd), en **SPA statique** : HTML, CSS et JavaScript modulaires.

## Deux modes

| Mode | Comportement |
|------|----------------|
| **Invité** | Données dans `localStorage` sur cet appareil — ton carnet personnel uniquement. |
| **Connecté** | Compte **Supabase** : carnet, social, DM et imports synchronisés entre appareils. |

Sans `config.js` valide (Supabase), seul le mode invité est actif.

## Configuration

```bash
cp config.example.js config.js
# Remplis supabaseUrl, supabaseAnonKey, et les clés optionnelles (Spotify, YouTube…)
```

Voir [BACKEND.md](./BACKEND.md) pour le schéma SQL et [DEPLOY.md](./DEPLOY.md) pour Vercel.

**Production (Vercel)** : définir les variables d’environnement puis builder :

- `SL_SUPABASE_URL`, `SL_SUPABASE_ANON_KEY`
- `SL_SPOTIFY_CLIENT_ID` (optionnel)
- `SL_YOUTUBE_API_KEY` (optionnel)
- `SL_LASTFM_API_KEY`, `SL_EDGE_PROXY_URL` (optionnel)

Le script `npm run build` génère `config.js` depuis ces variables.

## Test en local

```bash
npm install   # optionnel (serve)
cp config.example.js config.js   # si pas encore fait
npm run preview
```

Ouvre http://localhost:4173

## Structure

```
soundlog/
├── index.html
├── app.js                 # routing, état, rendu principal
├── cloud.js               # Supabase (auth, sync, social)
├── social-premium.js      # hub Social (Cercle, Live)
├── music-search.js        # recherche multi-sources
├── log-listen.js          # modal « Logger une écoute »
├── config.js              # secrets (non versionné — voir config.example.js)
├── config.example.js
├── scripts/generate-config.js
├── SCHEMA.sql + MIGRATION_v*.sql
├── styles.css + *-carnet.css
└── vercel.json
```

## Navigation

- **Accueil** — fil Suivis / Tendances, murmures, activité du cercle
- **Explorer** — genres, recos communauté, import bibliothèques (Apple / Deezer / MusicBrainz)
- **Fiche album** — tracklist MusicBrainz, partage `#album/…`, écoutes cloud
- **Carnet** — journal, à écouter, listes
- **Social** — cercle (fil, personnes, concerts), I was there !

## Phase D (plateforme)

- **PWA** : `manifest.webmanifest` + `sw.js` (shell offline, installable sur mobile)
- **Recherche cloud** : après `MIGRATION_v7.sql`, albums et profils indexés côté Supabase
- **Concerts** : liens Carte (OpenStreetMap) + Billets sur les dates Live
- **Tests e2e** : `npm install && npx playwright install chromium && npm run test:e2e`

## Licence

Projet personnel.
