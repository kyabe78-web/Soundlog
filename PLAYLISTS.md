# Importer des playlists depuis les plateformes de streaming

Soundlog peut importer tes playlists Spotify (et titres aimés) pour alimenter ton profil et personnaliser tes recommandations. L'auth se passe **côté navigateur** via OAuth PKCE — aucune clé secrète à exposer.

> Apple Music et Deezer nécessitent une signature côté serveur ou un OAuth gardé : ils sont prévus pour une v2 (Edge Function dédiée). Spotify est dispo dès maintenant.

---

## 1. Créer une app Spotify Developer (3 min, gratuit)

1. Va sur [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) et connecte-toi avec ton compte Spotify habituel.
2. Clique **Create app**.
3. Remplis :
   - **App name** : `Soundlog`
   - **App description** : `Carnet d'écoutes — import playlists pour personnaliser les recommandations`
   - **Website** : ton URL Vercel (ex. `https://soundlog-nine.vercel.app`)
   - **Redirect URIs** : ajoute les deux suivants :
     - `https://soundlog-nine.vercel.app/`
     - `http://localhost:8765/`
   - Coche **Web API** dans "Which API/SDKs are you planning to use".
   - Accepte les conditions.
4. **Save**.
5. Sur la page de l'app, clique **Settings** (en haut à droite).
6. Copie le **Client ID** (juste sous le nom de l'app).

> ⚠️ Ne copie **PAS** le Client Secret. PKCE permet à Soundlog de fonctionner sans secret.

## 2. Coller dans `config.js`

Ouvre `config.js` à la racine du repo et complète :

```javascript
window.SLConfig = {
  // ...Supabase déjà rempli...
  spotifyClientId: "abc123...colle-ton-client-id-ici",
  spotifyRedirectUri: "", // laisse vide, ça utilise l'URL actuelle
};
```

Sauvegarde. Si tu es déployé sur Vercel :

```bash
git add config.js
git commit -m "Ajout Spotify Client ID"
git push
```

## 3. Importer

1. Connecte-toi à Soundlog.
2. Ouvre la sidebar → ton compte → **Mon profil**.
3. Clique **« Importer depuis Spotify »** dans la section "Plus".
4. Tu es redirigé·e vers Spotify → autorise Soundlog (lecture seule).
5. Au retour, la modale s'ouvre avec la liste de tes playlists.
6. Coche celles à importer → **Importer la sélection**.
   Ou bien clique **« Importer mes titres aimés »** pour récupérer ta bibliothèque sauvegardée.
7. Soundlog :
   - Crée une entrée `imported_playlists` côté cloud
   - Insère tous les titres dans `imported_tracks`
   - Fusionne les albums uniques dans ton catalogue Soundlog local (préfixés `spotify-…`)

## 4. Effet sur Soundlog

- Onglet **Mes statistiques** → affiche les compteurs (titres importés, artistes uniques) + ton top artistes basé sur les playlists.
- Recommandations (RPC `recommendations_for`) : les albums vus par des utilisateurs qui partagent tes artistes Spotify reçoivent un score boosté. La home affiche tes recos personnalisées dans la modale Stats.
- Le moteur Sonar local prend en compte les artistes/genres importés au prochain refresh.

## 5. Confidentialité

- Les `imported_tracks` sont lisibles publiquement par les autres utilisateurs Soundlog (cf. RLS). C'est ce qui permet le matching collectif des recommandations.
- Tu peux supprimer une playlist importée à tout moment via la modale Spotify → **Déconnecter Spotify** efface le token côté navigateur.
- Pour supprimer toutes les données importées côté serveur : SQL Editor → `delete from imported_tracks where user_id = '<ton-uuid>'; delete from imported_playlists where user_id = '<ton-uuid>';`

## 6. Limites connues

- Spotify ne fournit pas les extraits 30 s via cette API publique — Soundlog continue d'utiliser Apple Music et Deezer pour ça.
- Token d'accès expire après ~1 h. Soundlog le refresh automatiquement tant que tu ne te déconnectes pas.
- L'import est **incrémental** côté serveur (upsert sur l'id playlist) : ré-importer met à jour sans dupliquer.

## 7. Spotify → recommandations collectives

La fonction Postgres `recommendations_for(uid)` croise :
- tes écoutes Soundlog
- tes tracks Spotify importées
- les écoutes/imports de la communauté

Et te propose les albums populaires chez les utilisateurs qui partagent **tes artistes**. Plus la communauté grandit, plus c'est pertinent.

```sql
-- Test depuis le SQL Editor (remplace par ton UUID)
select * from public.recommendations_for('00000000-0000-0000-0000-000000000000', 20);
```
