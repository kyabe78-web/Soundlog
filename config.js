/* Configuration cloud Soundlog.
   Crée un projet sur https://supabase.com puis colle ici :
     - Project URL  (Settings → API)
     - Anon public key (Settings → API)
   Laisser les valeurs ci-dessous vides garde le mode 100% local.
   Voir BACKEND.md pour le setup pas-à-pas. */
window.SLConfig = {
  supabaseUrl: "https://srrpnyvytopgxqxwnomd.supabase.co",
  supabaseAnonKey: "sb_publishable_-nHoYLqaCtFbLOsXh8b1nA_7N_su1eu",
  appName: "Soundlog",

  // --- Spotify (optionnel) : voir PLAYLISTS.md
  // Crée une app sur https://developer.spotify.com/dashboard
  // Redirect URI à enregistrer : <ton-domaine-vercel>/ + http://localhost:8765/
  spotifyClientId: "b3265ae98929481281f63aa077ef68ed",
  // Laisse vide pour utiliser window.location.origin + pathname automatiquement
  spotifyRedirectUri: "",

  // --- YouTube / YouTube Music (optionnel)
  // Crée une clé sur https://console.cloud.google.com (gratuit, 10000 req/jour)
  // Voir IMPORTS.md
  youtubeApiKey: "AIzaSyDyrNdQH8wHsrL6FRZRczieTH8KnuPvE0U",

  // --- Last.fm (optionnel)
  // Crée une clé sur https://www.last.fm/api/account/create (instantané, gratuit)
  lastfmApiKey: "",

  // --- Edge Function proxy (optionnel) : voir BACKEND.md §13
  // ex. "https://srrpnyvytopgxqxwnomd.functions.supabase.co/preview-proxy"
  edgeProxyUrl: "",
};