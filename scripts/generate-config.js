#!/usr/bin/env node
/**
 * Génère soundlog-config.js (déployé sur Vercel, hors .gitignore).
 * config.js reste pour le dev local (gitignored).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const localOut = path.join(root, "config.js");
const deployOut = path.join(root, "soundlog-config.js");
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

function isValidCfg(c) {
  return !!(c && c.supabaseUrl && c.supabaseAnonKey && /^https?:\/\//i.test(c.supabaseUrl));
}

function readExistingConfig(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  const pick = (key, re) => {
    const m = text.match(re);
    return m ? m[1].trim() : "";
  };
  const url = pick("supabaseUrl", /supabaseUrl:\s*["'](https?:\/\/[^"']+)["']/);
  const key = pick("supabaseAnonKey", /supabaseAnonKey:\s*["']([^"']+)["']/);
  if (!url || !key || key.length < 8) return null;
  return {
    supabaseUrl: url,
    supabaseAnonKey: key,
    appName: pick("appName", /appName:\s*["']([^"']*)["']/) || cfg.appName,
    spotifyClientId: pick("spotifyClientId", /spotifyClientId:\s*["']([^"']*)["']/),
    spotifyRedirectUri: pick("spotifyRedirectUri", /spotifyRedirectUri:\s*["']([^"']*)["']/),
    youtubeApiKey: pick("youtubeApiKey", /youtubeApiKey:\s*["']([^"']*)["']/),
    lastfmApiKey: pick("lastfmApiKey", /lastfmApiKey:\s*["']([^"']*)["']/),
    edgeProxyUrl: pick("edgeProxyUrl", /edgeProxyUrl:\s*["']([^"']*)["']/),
  };
}

function writeDeployConfig(baked, note) {
  const body = `/* ${note || "Config déployée"} — ne pas écraser les clés vides */
(function () {
  var baked = ${JSON.stringify(baked, null, 2)};
  var prev = window.SLConfig || {};
  var out = Object.assign({}, prev, baked);
  Object.keys(baked).forEach(function (k) {
    if (baked[k]) out[k] = baked[k];
  });
  window.SLConfig = out;
})();
`;
  fs.writeFileSync(deployOut, body, "utf8");
  console.log("[generate-config] Écrit soundlog-config.js", isValidCfg(baked) ? "(cloud actif)" : "(stub)");
}

function resolveBaked() {
  if (isValidCfg(cfg)) return cfg;
  const fromLocal = readExistingConfig(localOut);
  if (isValidCfg(fromLocal)) return fromLocal;
  const fromDeploy = readExistingConfig(deployOut);
  if (isValidCfg(fromDeploy)) return fromDeploy;
  return null;
}

const baked = resolveBaked();

if (isVercel) {
  if (baked) {
    writeDeployConfig(baked, "Build Vercel");
    console.log(
      isValidCfg(cfg)
        ? "[generate-config] Build OK — variables SL_SUPABASE_* → soundlog-config.js"
        : "[generate-config] Build OK — clés depuis config.js → soundlog-config.js"
    );
  } else {
    writeDeployConfig({ ...cfg, supabaseUrl: "", supabaseAnonKey: "" }, "Build Vercel (sans clés)");
    console.log("[generate-config] ATTENTION — pas de clés Supabase. Ajoute SL_SUPABASE_* sur Vercel ou config.js.");
  }
  process.exit(0);
}

if (baked) {
  writeDeployConfig(baked, "Généré pour dev / preview");
}

if (!isValidCfg(cfg) && fs.existsSync(localOut)) {
  console.log("[generate-config] config.js local conservé.");
  process.exit(0);
}

const body = `/* Généré par scripts/generate-config.js */
window.SLConfig = ${JSON.stringify(cfg, null, 2)};
`;
fs.writeFileSync(localOut, body, "utf8");
console.log("[generate-config] Écrit config.js", isValidCfg(cfg) ? "(cloud actif)" : "(mode invité)");
