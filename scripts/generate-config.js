#!/usr/bin/env node
/**
 * Prépare config.js pour le dev local. Sur Vercel, la config prod vient de /api/sl-config.js.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "config.js");
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

if (isVercel) {
  const stub = `/* Build Vercel — config runtime via /api/sl-config */
window.SLConfig = window.SLConfig || ${JSON.stringify({ ...cfg, supabaseUrl: "", supabaseAnonKey: "" }, null, 2)};
`;
  fs.writeFileSync(out, stub, "utf8");
  if (hasSecrets) {
    console.log("[generate-config] Build OK — clés vues au build + /api/sl-config en prod.");
  } else {
    console.log(
      "[generate-config] Build OK — config chargée à l'exécution via /api/sl-config (vérifie SL_SUPABASE_* dans Vercel → Environment Variables)."
    );
  }
  process.exit(0);
}

if (!hasSecrets && fs.existsSync(out)) {
  console.log("[generate-config] Pas de variables en env — config.js local conservé.");
  process.exit(0);
}

const body = `/* Généré par scripts/generate-config.js */
window.SLConfig = ${JSON.stringify(cfg, null, 2)};
`;
fs.writeFileSync(out, body, "utf8");
console.log("[generate-config] Écrit config.js", hasSecrets ? "(cloud actif)" : "(mode invité)");
