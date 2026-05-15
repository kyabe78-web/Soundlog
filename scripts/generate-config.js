#!/usr/bin/env node
/**
 * Génère config.js + injecte window.SLConfig dans index.html (build Vercel / CI).
 * Local : copie config.example.js → config.js et remplis à la main.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "config.js");
const indexPath = path.join(root, "index.html");
const CONFIG_MARKER = "<!-- @@SL_CONFIG@@ -->";

const isVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV);

const cfg = {
  supabaseUrl: String(process.env.SL_SUPABASE_URL || process.env.SUPABASE_URL || "").trim(),
  supabaseAnonKey: String(process.env.SL_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim(),
  appName: process.env.SL_APP_NAME || "Soundlog",
  spotifyClientId: process.env.SL_SPOTIFY_CLIENT_ID || "",
  spotifyRedirectUri: process.env.SL_SPOTIFY_REDIRECT_URI || "",
  youtubeApiKey: process.env.SL_YOUTUBE_API_KEY || "",
  lastfmApiKey: process.env.SL_LASTFM_API_KEY || "",
  edgeProxyUrl: process.env.SL_EDGE_PROXY_URL || "",
};

const hasSecrets = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && /^https?:\/\//i.test(cfg.supabaseUrl));

if (isVercel && !hasSecrets) {
  console.error(
    "[generate-config] ERREUR Vercel : définis SL_SUPABASE_URL et SL_SUPABASE_ANON_KEY dans Settings → Environment Variables, puis Redeploy."
  );
  process.exit(1);
}

if (!hasSecrets && fs.existsSync(out) && !isVercel) {
  console.log("[generate-config] Pas de variables Supabase en env — config.js local conservé.");
  process.exit(0);
}

const body = `/* Généré par scripts/generate-config.js — ne pas éditer à la main en CI */
window.SLConfig = ${JSON.stringify(cfg, null, 2)};
`;

fs.writeFileSync(out, body, "utf8");

/* Sur Vercel : injecter la config dans index.html (config.js n’est pas versionné et le SPA rewrite peut le masquer). */
if (isVercel && hasSecrets && fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf8");
  const inline = `<script>window.SLConfig=${JSON.stringify(cfg)};</script>`;
  if (html.includes(CONFIG_MARKER)) {
    html = html.replace(CONFIG_MARKER, `${inline}\n    ${CONFIG_MARKER}`);
    fs.writeFileSync(indexPath, html, "utf8");
  }
}

console.log(
  "[generate-config] Écrit",
  path.basename(out),
  hasSecrets ? "+ config inline dans index.html (cloud actif)" : "(mode invité / clés vides)"
);
