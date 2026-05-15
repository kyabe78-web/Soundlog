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

function isValidCfg(c) {
  return !!(c.supabaseUrl && c.supabaseAnonKey && /^https?:\/\//i.test(c.supabaseUrl));
}

/** Lit supabaseUrl / supabaseAnonKey depuis un config.js déjà présent (repo ou local). */
function readExistingConfig(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  const url = text.match(/supabaseUrl:\s*["'](https?:\/\/[^"']+)["']/);
  const key = text.match(/supabaseAnonKey:\s*["']([^"']+)["']/);
  if (!url || !key || key[1].length < 8) return null;
  return {
    ...cfg,
    supabaseUrl: url[1].trim(),
    supabaseAnonKey: key[1].trim(),
  };
}

/** Après /api/sl-config : complète SLConfig sans écraser des clés déjà valides. */
function mergeConfigSnippet(baked) {
  return `/* Build Vercel — fusion avec /api/sl-config */
(function () {
  var baked = ${JSON.stringify(baked, null, 2)};
  var prev = window.SLConfig || {};
  var out = Object.assign({}, prev, baked);
  ["supabaseUrl", "supabaseAnonKey"].forEach(function (k) {
    if (baked[k]) out[k] = baked[k];
    else if (prev[k]) out[k] = prev[k];
  });
  window.SLConfig = out;
})();
`;
}

if (isVercel) {
  const fromFile = readExistingConfig(out);
  if (hasSecrets) {
    fs.writeFileSync(out, mergeConfigSnippet(cfg), "utf8");
    console.log("[generate-config] Build OK — clés SL_SUPABASE_* injectées dans config.js.");
    process.exit(0);
  }
  if (fromFile && isValidCfg(fromFile)) {
    console.log("[generate-config] Build OK — config.js versionné conservé (Supabase + options).");
    process.exit(0);
  }

  fs.writeFileSync(
    out,
    mergeConfigSnippet({ ...cfg, supabaseUrl: "", supabaseAnonKey: "" }),
    "utf8"
  );
  console.log(
    "[generate-config] Build OK — ajoute SL_SUPABASE_URL + SL_SUPABASE_ANON_KEY dans Vercel (ou config.js avec clés), puis Redeploy."
  );
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
