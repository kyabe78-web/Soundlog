# Déploiement Soundlog — guide rapide

## Ce qui bloque souvent

1. **`npm` absent** → normal sur ton Mac. Utilise `python3` pour tester en local.
2. **Commandes git collées pendant `python3 -m http.server`** → le terminal mélange tout. Fais `Ctrl+C` pour arrêter le serveur, puis lance git dans le même terminal.
3. **Pas de `git remote`** → le commit local existe, mais rien n’est sur GitHub tant que tu n’as pas ajouté `origin` et fait `push`.

## Test local (sans npm)

```bash
cd /Users/antonioautolitano/Documents/soundlog
python3 -m http.server 4173
```

Ouvre : **http://localhost:4173** (pas `file://`)

Arrêt : `Ctrl+C`

## GitHub + Vercel

Ton identifiant GitHub : **kyabe78-web**

### A. Créer le dépôt sur le site

1. https://github.com/new  
2. Name : `soundlog`  
3. Public  
4. **Ne pas** cocher README / .gitignore  
5. Create repository  

### B. Dans le terminal (après `Ctrl+C` si le serveur Python tourne)

```bash
cd /Users/antonioautolitano/Documents/soundlog
git remote add origin https://github.com/kyabe78-web/Soundlog.git
git branch -M main
git push -u origin main
```

GitHub **n’accepte plus ton mot de passe** pour `git push`. Il faut un **Personal Access Token** :

1. https://github.com/settings/tokens → **Generate new token (classic)**
2. Note : `soundlog-push` · coche **repo**
3. Copie le token (il ne s’affiche qu’une fois)
4. Au `git push` : **Username** `kyabe78-web` · **Password** = le **token** (pas ton mot de passe GitHub)

### C. Vercel

1. https://vercel.com → Add New → Project  
2. Import `Soundlog` (dépôt `kyabe78-web/Soundlog`)  
3. **Framework Preset** : Other (ou laisse Vercel lire `vercel.json`)  
4. **Build Command** : `npm run build` (déjà dans `vercel.json`)  
5. **Output Directory** : `.`  
6. **Environment Variables** (obligatoire pour la connexion) :

| Name | Value |
|------|--------|
| `SL_SUPABASE_URL` | `https://TON-ID.supabase.co` |
| `SL_SUPABASE_ANON_KEY` | clé **publishable** ou **anon** (Supabase → Settings → API) |

Coche **Production** et **Preview**.

7. **Deploy**, puis après toute modification de variables : **Deployments → ⋯ → Redeploy**

Lien public : `https://soundlog-nine.vercel.app`

Les variables sont lues **à l’exécution** par `/api/sl-config` (le build ne plante plus si elles manquent au moment du build, mais la connexion nécessite quand même ces deux clés dans Vercel).
