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

Remplace `TON_USERNAME` par ton identifiant GitHub.

### A. Créer le dépôt sur le site

1. https://github.com/new  
2. Name : `soundlog`  
3. Public  
4. **Ne pas** cocher README / .gitignore  
5. Create repository  

### B. Dans le terminal (après `Ctrl+C` si le serveur Python tourne)

```bash
cd /Users/antonioautolitano/Documents/soundlog
git remote add origin https://github.com/TON_USERNAME/soundlog.git
git branch -M main
git push -u origin main
```

(GitHub te demandera de te connecter la première fois.)

### C. Vercel

1. https://vercel.com → Add New → Project  
2. Import `soundlog`  
3. **Build Command** : vide  
4. **Output Directory** : `.`  
5. Deploy  

Lien public : `https://soundlog-xxxxx.vercel.app`
