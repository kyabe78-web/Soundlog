/**
 * Soundlog edge function `preview-proxy`
 *
 * Sert de proxy CORS-friendly pour les APIs externes utilisées côté client
 * (Bandsintown, Deezer, iTunes) afin d'éviter les warnings dans la console.
 *
 * Déploiement :
 *   1. Installer Supabase CLI : npm install -g supabase
 *   2. Se connecter : supabase login
 *   3. Lier le projet : supabase link --project-ref <PROJECT_REF>
 *   4. Déployer : supabase functions deploy preview-proxy --no-verify-jwt
 *   5. Récupérer l'URL : https://<PROJECT_REF>.functions.supabase.co/preview-proxy
 *   6. La coller dans config.js → edgeProxyUrl
 *
 * Usage : GET /preview-proxy?url=<URL ENCODEE>
 */
const ALLOWED = [
  /^https:\/\/rest\.bandsintown\.com\//,
  /^https:\/\/api\.deezer\.com\//,
  /^https:\/\/itunes\.apple\.com\//,
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// @ts-ignore — Deno fournit serve()
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const u = new URL(req.url);
  const target = u.searchParams.get("url");
  if (!target) {
    return new Response(JSON.stringify({ error: "missing url" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!ALLOWED.some((re) => re.test(target))) {
    return new Response(JSON.stringify({ error: "domain not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Soundlog/1.0 (+https://soundlog.app)" },
    });
    const body = await upstream.arrayBuffer();
    const headers = new Headers(corsHeaders);
    const ct = upstream.headers.get("content-type");
    if (ct) headers.set("Content-Type", ct);
    headers.set("Cache-Control", "public, max-age=300");
    return new Response(body, { status: upstream.status, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
