/* Soundlog — service worker (offline shell, network-first for app code) */
const CACHE = "soundlog-shell-v19";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
];

const NETWORK_FIRST = [
  "/app.js",
  "/design-system.css",
  "/design-harmony.css",
  "/persistence.js",
  "/artwork.js",
  "/cloud.js",
  "/music-search.js",
  "/log-listen.js",
  "/carnet-social.js",
  "/carnet-social.css",
  "/social-premium.js",
  "/styles.css",
  "/ui-premium.css",
  "/theme-carnet.css",
  "/libraries-carnet.css",
  "/social-carnet.css",
  "/dm-carnet.css",
  "/app-shell.css",
  "/home-carnet.css",
  "/diary-carnet.css",
  "/sonar-carnet.css",
  "/mobile-shell.css",
  "/log-listen-carnet.css",
  "/profile-carnet.css",
  "/mobile-safe.css",
  "/mobile-shell.css",
];

function isNetworkFirst(pathname) {
  return NETWORK_FIRST.some((p) => pathname === p || pathname.endsWith(p));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => undefined)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (isNetworkFirst(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
