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
| Commentaires sur écoutes | locales | API prête (table `comments`) — UI à brancher en v2 |
| Shoutouts (murmures) | locales | API prête (table `shoutouts`) — UI à brancher en v2 |
| Notifications | locales | local (générées côté client) |
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

## 11. Aller plus loin

- **Realtime** : Supabase Realtime expose les changements en WebSocket. On peut s'abonner à `friend_requests` pour notifier en temps réel l'apparition d'une nouvelle demande. Hook dans `cloud.js` à ajouter.
- **Storage** : pour les avatars uploadés, créer un bucket `avatars` (public read) et utiliser `supabase.storage.from('avatars').upload(...)`.
- **Edge Functions** : pour appeler Apple Music / Deezer / Bandsintown sans CORS, déployer une edge function qui proxy ces APIs avec ta clé.
- **Email transactionnel** : configurer Resend ou Postmark dans Authentication → Email pour les emails de confirmation / reset password sur ton domaine.

---

## 12. Dépannage

| Symptôme | Cause probable | Remède |
|---|---|---|
| « Cloud non configuré » au clic | `config.js` vide ou mal chargé | Vérifier `index.html` et le contenu de `config.js` |
| Inscription échoue avec "duplicate key" | Handle déjà pris | Choisir un autre handle |
| Connexion échoue silencieusement | Confirm-email activé | Désactiver le `Confirm email` en dev, ou cliquer le lien reçu |
| Sync ne semble pas se faire | Cache localStorage stale | Vide le cache navigateur OU fais `localStorage.clear()` dans la console |
| Erreur CORS Supabase | Mauvaise URL ou clé invalide | Vérifie les valeurs dans Project Settings → API |
| Toast "Erreur cloud" sur demande d'ami | RLS bloque | Le target n'est pas un profil cloud — c'est un user fictif (u1/u2/u3) |

---

## TL;DR (3 minutes)

```bash
# 1. Crée le projet Supabase
# 2. SQL Editor → colle SCHEMA.sql → Run
# 3. Copie l'URL et l'anon key
# 4. Édite config.js avec les deux valeurs
# 5. python3 -m http.server 8765  (test local)
# 6. git push  (déploie sur Vercel)
```
