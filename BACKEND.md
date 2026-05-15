# Backend Soundlog — guide d'installation

Soundlog reste **utilisable sans backend** (mode invité, 100 % local — la promesse d'origine). Pour activer les comptes utilisateurs, la synchronisation cross-appareils et la communauté réelle, on s'appuie sur **Supabase** (Postgres + Auth en SaaS, gratuit jusqu'à ~50 000 utilisateurs actifs / mois).

Le code reste 100 % côté navigateur — pas de serveur Node à déployer.

---

## 1. Créer un projet Supabase

1. Va sur [https://supabase.com](https://supabase.com) et crée un compte (gratuit).
2. Clique **New Project**.
   - Name : `soundlog` (ou autre)
   - Database password : génère et garde-le (peu utile au quotidien, garde-le en backup)
   - Region : la plus proche de tes utilisateurs (Paris/Frankfurt pour l'Europe)
3. Attends ~2 minutes que le projet provisionne.

---

## 2. Installer le schéma

1. Dans le menu de gauche, ouvre **SQL Editor**.
2. Clique **New query**.
3. Colle l'intégralité du fichier `SCHEMA.sql` (à la racine du repo).
4. Clique **Run** (ou `Ctrl/⌘ + Enter`).
5. Tu dois voir « Success. No rows returned. » — toutes les tables, indexes, policies RLS, la procédure `accept_friend_request` et la vue `public_feed` sont créées.

> ⚠️ Si tu réexécutes le script, il est **idempotent** : `create table if not exists`, `drop policy if exists`. Tu peux le rejouer sans casser la base.

---

## 3. Configurer l'authentification

Dans **Authentication → Providers** :

- **Email** : activé par défaut ✅
- Décide si tu exiges la **confirmation par email** :
  - Settings → Email → "Confirm email" = `OFF` pour un démarrage frictionless (recommandé en démo)
  - Activer plus tard quand tu as un nom de domaine + email transactionnel propre.
- Pour les **magic links**, configure l'URL de redirection : Authentication → URL Configuration → Site URL = `https://ton-domaine-vercel.app` (et ajoute `http://localhost:8765` en dev).

> Soundlog propose par défaut signup **email + mot de passe** et **lien magique**. Pour ajouter Google/GitHub/Apple, c'est en quelques clics dans Authentication → Providers.

---

## 4. Récupérer les clés et configurer Soundlog

Dans **Project Settings → API** :

- Copie **Project URL** (ex. `https://abcdefgh.supabase.co`)
- Copie **anon public** key (long JWT)

Édite `config.js` à la racine du repo :

```js
window.SLConfig = {
  supabaseUrl: "https://abcdefgh.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIs...",
  appName: "Soundlog",
};
```

> 💡 L'**anon key** est **publique par design** — elle est protégée par les **Row Level Security policies** que le schéma installe. Ne JAMAIS exposer la clé `service_role`.

---

## 5. Déployer

### Vercel

Si tu utilises déjà Vercel (cf. `DEPLOY.md`) :

1. Commit + push :
   ```bash
   git add SCHEMA.sql BACKEND.md cloud.js config.js
   git commit -m "Add Supabase cloud backend"
   git push
   ```
2. Vercel détecte le push et redéploie automatiquement.
3. Visite ton URL Vercel — le bouton **Se connecter** apparaît dans la sidebar.

### Local (test)

```bash
cd soundlog
python3 -m http.server 8765
```

Ouvre `http://localhost:8765`. Si `config.js` contient des clés valides, le mode cloud s'active.

---

## 6. Premier compte

1. Clique **Se connecter** dans la sidebar.
2. Choisis l'onglet **Inscription**.
3. Renseigne :
   - Handle (unique, format `a-z0-9_.-`, 2-32 caractères)
   - Nom affiché
   - Email + mot de passe (8+ caractères)
4. Le compte est créé, la session ouverte, et tes éventuelles écoutes locales sont **automatiquement poussées au cloud**.

À partir de là, sur n'importe quel autre appareil :

1. Connecte-toi avec le même email/mot de passe.
2. Toutes tes écoutes, listes, concerts, wishlist sont **pulled** depuis le cloud.
3. Les modifications locales sont **pushed** automatiquement (debounce 800 ms).

---

## 7. Ce qui est synchronisé

| Donnée | Local seul | Cloud |
|---|---|---|
| Profil (nom, handle, bio, ville, hue) | ✓ | ✓ |
| Écoutes (rating, commentaire, date) | ✓ | ✓ |
| Listes (titre + items ordonnés) | ✓ | ✓ |
| Concerts (I was there) | ✓ | ✓ |
| Wishlist (à écouter) | ✓ | ✓ |
| Catalogue d'albums (partagé entre utilisateurs) | local-only | ✓ (table `albums` mutualisée) |
| Follows | ✓ | ✓ |
| Demandes d'ami | locales uniquement | cross-appareil pour les profils cloud |
| Commentaires sur écoutes | locales | cloud (table `comments`) + realtime |
| Shoutouts (murmures) | locales | cloud (table `shoutouts`) + realtime |
| Likes sur écoutes | locales | cloud (`listening_likes`, migration v5) |
| Notifications | locales | cloud (`notifications`, migration v5) + triggers SQL |
| Préférences Sonar | locales | local |

> En mode **invité** (non connecté), tout reste 100 % local comme avant — aucune requête réseau vers Supabase.

---

## 8. Sécurité

Le schéma installe des **Row Level Security** policies strictes :

- **profiles** : lecture publique, écriture uniquement par le propriétaire
- **listenings / concerts** : lecture publique, écriture uniquement par l'auteur
- **lists** : lecture si `is_public` ou propriétaire, écriture uniquement par le propriétaire
- **wishlist** : strictement privée (visible uniquement par le propriétaire)
- **follows** : lecture publique, follower contrôle ses follows
- **friend_requests** : seuls le sender et le recipient peuvent voir/agir
- **friends** : symétriques, écriture par l'un des deux participants
- **albums** : lecture publique, insertion par tout utilisateur authentifié

L'anon key ne peut **rien faire** qui ne soit explicitement permis par ces policies.

---

## 9. Coûts

Le tier gratuit Supabase couvre largement Soundlog jusqu'à ~50k MAU :
- 500 MB Postgres
- 1 GB stockage fichiers (pas utilisé pour l'instant)
- 50 000 utilisateurs actifs mensuels en Auth
- 2 GB transfert / mois
- Pause automatique après 7 jours sans activité (relance instantanée à la prochaine requête)

Au-delà : 25 €/mois pour le plan Pro avec backups automatiques et SLA.

---

## 10. Backups & exports

Dans Supabase → Database → Backups :
- Plan gratuit : backups quotidiens conservés 7 jours, restauration à la demande
- Pro : retention 30 jours + PITR (point-in-time recovery)

Pour exporter en CSV : Table Editor → table → menu `…` → **Export as CSV**.

---

## 11. Migration v6 — Phase C (MusicBrainz + recos enrichies)

Après `MIGRATION_v5.sql`, exécute **une fois** `MIGRATION_v6.sql` dans le SQL Editor :

- Colonne `musicbrainz_release_id` sur `albums`
- RPC `recommendations_for` enrichie : `year`, `genre`, `artwork_url`, `musicbrainz_release_id` (cartes cliquables côté app)

Côté app : fiches album avec tracklist MusicBrainz, grille de recommandations dans **Découvrir** et **Mes statistiques**, partage `#album/<id>`.

## 12. Migration v2 — features avancées (avatars, playlists, realtime, stats)

Après le `SCHEMA.sql` initial, joue **une fois** le fichier `MIGRATION_v2.sql` dans le SQL Editor. Il ajoute :

- Bucket Storage `avatars` (public, écriture limitée au propriétaire via folder UUID)
- Tables `imported_playlists` + `imported_tracks` (Spotify, Deezer, Apple)
- Vues agrégées `user_stats` et `user_top_artists`
- Procédure `recommendations_for(uid)` qui croise écoutes communauté + tracks importées
- Publications Realtime (`listenings`, `comments`, `shoutouts`, `friend_requests`, `follows`)

Idempotent : peut être rejoué sans casser.

### Migration v4 — durée d’écoute estimée & classement

Toujours dans le SQL Editor, après `MIGRATION_v2.sql`, exécute **une fois** `MIGRATION_v4.sql` :

- Colonne `duration_ms` sur les titres importés (durée du morceau côté Spotify / Deezer).
- Table `streaming_play_events` pour enregistrer l’API Spotify *Recently Played* (fenêtre limitée par Spotify, synchronisable depuis la modale **Mes statistiques**).
- Vue `user_stats` enrichie (`imported_library_ms`, `streaming_recent_ms`, `streaming_recent_plays`).
- Vue `leaderboard_listening` : rang des comptes selon la durée cumulée (imports + historique récent).

> Spotify n’expose pas le « temps d’écoute total » historique ; le score est une **approximation** (somme des durées des morceaux importés + une passe paginée sur *recently played*). Les utilisateurs doivent **réautoriser Spotify** après mise à jour pour la scope `user-read-recently-played`.

## 12. Realtime

Soundlog s'abonne automatiquement à 5 tables après le login. Tu reçois en direct :

- les écoutes des utilisateurs (toast + soft refresh du feed)
- les commentaires sur tes propres écoutes (notification + push dans la modale ouverte)
- les nouveaux murmures (shoutouts) → rafraîchissement automatique
- les demandes d'ami entrantes (notification dans le hub)
- les follows

Tout ça en WebSocket sans rechargement. Gratuit jusqu'à 200 connexions simultanées sur le plan free.

## 13. Edge Function `preview-proxy` (élimine les warnings CORS)

Le code source est dans `supabase/functions/preview-proxy/index.ts`. Il proxie Apple/Deezer/Bandsintown en injectant les bons en-têtes CORS.

### Déploiement (10 min)

```bash
# 1. Installer la CLI Supabase
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet (PROJECT_REF = ID au début de l'URL : ex. srrpnyvytopgxqxwnomd)
supabase link --project-ref <PROJECT_REF>

# 4. Déployer la fonction (no-verify-jwt = endpoint public)
supabase functions deploy preview-proxy --no-verify-jwt
```

L'URL du déploiement s'affiche : `https://<PROJECT_REF>.functions.supabase.co/preview-proxy`.

### Activer dans Soundlog

Édite `config.js` :

```javascript
edgeProxyUrl: "https://srrpnyvytopgxqxwnomd.functions.supabase.co/preview-proxy",
```

À partir de là, tous les appels Bandsintown/Deezer/iTunes passent par cette fonction → CORS clean en prod, console propre.

## 14. Importer ses playlists Spotify

Voir le guide dédié `PLAYLISTS.md`. En résumé : crée une app Spotify Developer (gratuit), copie le Client ID dans `config.js`, et utilise la modale Compte → Mon profil → "Importer depuis Spotify".

## 15. Avatars personnalisés

Une fois `MIGRATION_v2.sql` joué, n'importe quel utilisateur peut uploader son avatar via la modale Compte → Mon profil → "Changer mon avatar". Stocké dans le bucket `avatars/<user-uuid>/`, lecture publique, écriture limitée au propriétaire (RLS Storage). Max 10 Mo côté UI (compression automatique si l’image est très grande).

## 16. Statistiques utilisateur

La modale Compte → Mon profil → **Mes statistiques** affiche :
- Compteurs (écoutes, albums uniques, listes, concerts, wishlist, tracks importées)
- Top 12 artistes (via vue `user_top_artists`)
- 12 recommandations cross-utilisateurs (via RPC `recommendations_for`)

Données toujours fraîches, calculées côté Postgres.

## 17. Murmures (shoutouts) live

Le bouton "Publier un murmure" (modale profil) poste dans la table `shoutouts`. Le bloc "Murmures du disquaire" en tête de la home affiche les 8 derniers de la communauté, mis à jour en realtime + refresh périodique 90 s.

## 18. Confirmation email + email transactionnel

### Activer la confirmation email (recommandé en prod)

1. Supabase → Authentication → Providers → Email
2. Toggle **`Confirm email`** = ON
3. Sauvegarde

⚠️ Avec confirm email ON, l'inscription fonctionne quand même côté Soundlog (le profil est créé après confirmation au prochain login). Si tu veux un compte instant, garde-le OFF en démo.

### Configurer Resend pour les emails (5 min)

1. Crée un compte sur [https://resend.com](https://resend.com) (gratuit, 3000 emails/mois).
2. Ajoute et vérifie ton domaine (DNS).
3. Génère une **API Key**.
4. Dans Supabase → **Authentication → Email → SMTP Settings** :
   - Host : `smtp.resend.com`
   - Port : `465`
   - Username : `resend`
   - Password : ta Resend API Key
   - Sender name : `Soundlog`
   - Sender email : `noreply@ton-domaine.com`
5. Save.

Les emails de confirmation, reset password, magic link partent maintenant depuis ton domaine — crédibilité maximale.

## 19. Domaine perso

1. Achète un domaine (Namecheap, OVH, Cloudflare Registrar).
2. Vercel → Project → Settings → Domains → **Add**.
3. Suis les instructions DNS (CNAME ou A record). Vercel gère le SSL automatiquement.
4. Une fois le domaine actif, ajoute-le aussi dans :
   - Supabase → Authentication → URL Configuration → Site URL
   - Spotify Developer → Redirect URIs

Coût indicatif : 10-15 € / an pour un `.com`, gratuit en sous-domaine.

---

## 12. Dépannage

| Symptôme | Cause probable | Remède |
|---|---|---|
| « Connexion cloud indisponible » | Variables Vercel manquantes ou pas de redeploy | Vercel → Environment Variables → `SL_SUPABASE_URL` + `SL_SUPABASE_ANON_KEY` → Redeploy |
| Inscription échoue avec "duplicate key" | Handle déjà pris | Choisir un autre handle |
| Connexion échoue silencieusement | Confirm-email activé | Désactiver le `Confirm email` en dev, ou cliquer le lien reçu |
| Sync ne semble pas se faire | Cache localStorage stale | Vide le cache navigateur OU fais `localStorage.clear()` dans la console |
| Erreur CORS Supabase | Mauvaise URL ou clé invalide | Vérifie les valeurs dans Project Settings → API |
| Toast "Erreur cloud" sur demande d'ami | RLS bloque | Le target n'est pas un profil cloud valide — vérifie l'UUID du profil |

---

## TL;DR (3 minutes)

```bash
# 1. Crée le projet Supabase
# 2. SQL Editor → colle SCHEMA.sql → Run
# 3. SQL Editor → colle MIGRATION_v2.sql → Run  (avatars, playlists, stats, realtime)
# 3b. SQL Editor → colle MIGRATION_v4.sql → Run  (durées streaming, classement)
# 3c. SQL Editor → colle MIGRATION_v5.sql → Run  (likes + notifications serveur)
# 4. Copie Project URL et anon key dans config.js
# 5. (Optionnel) Crée app Spotify Developer → Client ID dans config.js
# 6. (Optionnel) supabase functions deploy preview-proxy --no-verify-jwt
# 7. python3 -m http.server 8765  (test local)
# 8. git push  (déploie sur Vercel)
```
