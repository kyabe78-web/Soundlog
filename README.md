# Soundlog

Carnet d’écoutes et critiques musicales (inspiré Letterboxd), 100 % **front-end** : HTML, CSS et JavaScript. Aucun serveur Soundlog — les données restent dans le navigateur (`localStorage`).

## Déploiement (Vercel)

- Site **statique** : `index.html`, `styles.css`, `app.js` à la racine.
- Navigation par **hash** (`#decouvrir`, `#album/…`, etc.) — compatible hébergement gratuit.
- APIs externes optionnelles (navigateur) : Apple iTunes, Deezer, YouTube (clé utilisateur), Bandsintown.

## Test en local avant mise en ligne

```bash
cd /chemin/vers/soundlog
npm run preview
```

Ouvre http://localhost:4173

## Structure

```
soundlog/
├── index.html    # point d’entrée
├── styles.css    # styles
├── app.js        # application
├── vercel.json   # config Vercel
├── package.json  # scripts de prévisualisation locale
└── README.md
```

## Phase test — à savoir pour tes amis

- Chaque personne a **son propre carnet** sur son appareil (pas de compte centralisé).
- Les **liens d’invitation** (`#rejoindre/…`) transportent des données dans l’URL, pas sur un serveur.
- La recherche **Bibliothèques** dépend des APIs publiques (connexion Internet requise).

## Licence

Projet personnel — phase de test.
