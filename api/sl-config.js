/**
 * Config runtime Vercel — fusionne les variables d’environnement sans écraser
 * soundlog-config.js quand les env sont vides.
 */
function buildConfig() {
  return {
    supabaseUrl: String(process.env.SL_SUPABASE_URL || process.env.SUPABASE_URL || "").trim(),
    supabaseAnonKey: String(process.env.SL_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim(),
    appName: process.env.SL_APP_NAME || "Soundlog",
    spotifyClientId: process.env.SL_SPOTIFY_CLIENT_ID || "",
    spotifyRedirectUri: process.env.SL_SPOTIFY_REDIRECT_URI || "",
    youtubeApiKey: process.env.SL_YOUTUBE_API_KEY || "",
    lastfmApiKey: process.env.SL_LASTFM_API_KEY || "",
    edgeProxyUrl: process.env.SL_EDGE_PROXY_URL || "",
  };
}

module.exports = (req, res) => {
  const cfg = buildConfig();
  const body =
    "(function () {\n" +
    "  var patch = " +
    JSON.stringify(cfg) +
    ";\n" +
    "  var prev = window.SLConfig || {};\n" +
    "  var out = Object.assign({}, prev, patch);\n" +
    "  Object.keys(patch).forEach(function (k) {\n" +
    "    if (patch[k]) out[k] = patch[k];\n" +
    "  });\n" +
    "  window.SLConfig = out;\n" +
    "})();\n";
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).send(body);
};
