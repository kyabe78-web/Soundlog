/* Généré pour dev / preview — ne pas écraser les clés vides */
(function () {
  var baked = {
  "supabaseUrl": "https://srrpnyvytopgxqxwnomd.supabase.co",
  "supabaseAnonKey": "sb_publishable_-nHoYLqaCtFbLOsXh8b1nA_7N_su1eu",
  "appName": "Soundlog",
  "spotifyClientId": "b3265ae98929481281f63aa077ef68ed",
  "spotifyRedirectUri": "",
  "youtubeApiKey": "AIzaSyDyrNdQH8wHsrL6FRZRczieTH8KnuPvE0U",
  "lastfmApiKey": "",
  "edgeProxyUrl": ""
};
  var prev = window.SLConfig || {};
  var out = Object.assign({}, prev, baked);
  Object.keys(baked).forEach(function (k) {
    if (baked[k]) out[k] = baked[k];
  });
  window.SLConfig = out;
})();
