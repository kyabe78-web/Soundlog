#!/usr/bin/env node
/**
 * Génère config.js depuis les variables d’environnement (build Vercel / CI).
 * Local : copie config.example.js → config.js et remplis à la main.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "config.js");

const cfg = {
  supabaseUrl: process.env.SL_SUPABASE_URL || process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SL_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  appName: process.env.SL_APP_NAME || "Soundlog",
  spotifyClientId: process.env.SL_SPOTIFY_CLIENT_ID || "",
  spotifyRedirectUri: process.env.SL_SPOTIFY_REDIRECT_URI || "",
  youtubeApiKey: process.env.SL_YOUTUBE_API_KEY || "",
  lastfmApiKey: process.env.SL_LASTFM_API_KEY || "",
  edgeProxyUrl: process.env.SL_EDGE_PROXY_URL || "",
};

const body = `/* Généré par scripts/generate-config.js — ne pas éditer à la main en CI */
window.SLConfig = ${JSON.stringify(cfg, null, 2)};
`;

const hasSecrets = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
if (!hasSecrets && fs.existsSync(path.join(root, "config.js"))) {
  console.log("[generate-config] Pas de variables Supabase en env — config.js local conservé.");
  process.exit(0);
}

fs.writeFileSync(out, body, "utf8");
console.log("[generate-config] Écrit", out, hasSecrets ? "(cloud actif)" : "(mode invité / clés vides)");
