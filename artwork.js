/* Soundlog — pipeline pochettes (cache, fallback, résolution API) */
(function (root) {
  "use strict";

  const CACHE_KEY = "soundlog_artwork_v1";
  const MAX_CACHE_ENTRIES = 800;
  const DEBUG_KEY = "sl_artwork_debug";

  let deps = {};
  const inflight = new Map();
  const attemptByAlbum = new Map();
  let memoryCache = {};
  let catalogBootstrapStarted = false;

  function debug(...args) {
    try {
      if (localStorage.getItem(DEBUG_KEY) === "1" || root.SL_ARTWORK_DEBUG) {
        console.log("[SLArtwork]", ...args);
      }
    } catch (_) {}
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      memoryCache = raw ? JSON.parse(raw) : {};
      if (typeof memoryCache !== "object" || !memoryCache) memoryCache = {};
    } catch (_) {
      memoryCache = {};
    }
  }

  function saveCache() {
    try {
      const keys = Object.keys(memoryCache);
      if (keys.length > MAX_CACHE_ENTRIES) {
        keys.sort((a, b) => (memoryCache[a].at || 0) - (memoryCache[b].at || 0));
        keys.slice(0, keys.length - MAX_CACHE_ENTRIES).forEach((k) => delete memoryCache[k]);
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
    } catch (e) {
      debug("cache save failed", e);
    }
  }

  function normalizeKey(artist, title) {
    return String(artist || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .concat(" ", String(title || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim());
  }

  function isHttpUrl(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url.trim());
  }

  function upgradeArtworkUrl(url) {
    let u = String(url || "").trim();
    if (!u) return "";
    u = u
      .replace(/100x100bb/gi, "600x600bb")
      .replace(/\/100x100-/gi, "/600x600-")
      .replace(/cover_small/gi, "cover_xl")
      .replace(/cover_medium/gi, "cover_xl")
      .replace(/cover_big/gi, "cover_xl")
      .replace(/\/front-250\b/gi, "/front-500");
    return u;
  }

  function uniqUrls(list) {
    const seen = new Set();
    const out = [];
    for (const raw of list || []) {
      const u = upgradeArtworkUrl(raw);
      if (!isHttpUrl(u) || seen.has(u)) continue;
      seen.add(u);
      out.push(u);
    }
    return out;
  }

  function getCached(albumId) {
    const row = memoryCache[albumId];
    if (!row || !row.url) return "";
    if (row.fail && row.fail > 2) return "";
    return upgradeArtworkUrl(row.url);
  }

  function setCached(albumId, url, meta) {
    if (!albumId || !isHttpUrl(url)) return;
    memoryCache[albumId] = {
      url: upgradeArtworkUrl(url),
      at: Date.now(),
      src: (meta && meta.src) || "unknown",
      fail: 0,
    };
    saveCache();
  }

  function markUrlFailed(url) {
    if (!url) return;
    for (const id of Object.keys(memoryCache)) {
      if (memoryCache[id].url === url) {
        memoryCache[id].fail = (memoryCache[id].fail || 0) + 1;
      }
    }
    saveCache();
  }

  function pickAlbumFields(album) {
    if (!album) return [];
    return uniqUrls([
      album.artworkUrl,
      album.artwork_url,
      album.coverUrl,
      album.cover,
      album.image,
      album.thumbnail,
    ]);
  }

  function buildUrlChain(album) {
    if (!album) return [];
    const id = album.id;
    const fromCache = id ? getCached(id) : "";
    const fields = pickAlbumFields(album);
    const mbFixed =
      album.musicbrainzReleaseId || album.musicbrainzId
        ? "https://coverartarchive.org/release/" + String(album.musicbrainzReleaseId || album.musicbrainzId) + "/front-500"
        : "";
    return uniqUrls([fromCache, ...fields, mbFixed]);
  }

  function applyToAlbum(album, url, meta) {
    if (!album || !isHttpUrl(url)) return;
    const u = upgradeArtworkUrl(url);
    album.artworkUrl = u;
    if (album.id) setCached(album.id, u, meta);
    if (typeof deps.onApplied === "function") deps.onApplied(album.id, u);
    document.querySelectorAll('.cover-frame[data-cover-id="' + album.id + '"]').forEach((frame) => {
      injectImg(frame, u);
    });
    debug("applied", album.id, u.slice(0, 72), meta && meta.src);
  }

  function proxyUrl(externalUrl) {
    if (typeof deps.edgeProxy === "function") return deps.edgeProxy(externalUrl);
    const cfg = root.SLConfig || {};
    if (cfg.edgeProxyUrl) return cfg.edgeProxyUrl + "?url=" + encodeURIComponent(externalUrl);
    return externalUrl;
  }

  function musicCountry() {
    if (typeof deps.musicCountry === "function") return deps.musicCountry();
    return "FR";
  }

  async function fetchItunesArtwork(artist, title) {
    const q = `${artist || ""} ${title || ""}`.trim();
    if (!q) return "";
    const country = musicCountry();
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=8&country=${country}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("iTunes search " + r.status);
    const j = await r.json();
    const key = normalizeKey(artist, title);
    const hit =
      (j.results || []).find((x) => x.wrapperType === "collection" && normalizeKey(x.artistName, x.collectionName) === key) ||
      (j.results || []).find((x) => x.wrapperType === "collection");
    if (!hit) return "";
    return upgradeArtworkUrl(hit.artworkUrl100 || hit.artworkUrl60 || "");
  }

  async function fetchDeezerArtwork(artist, title) {
    const q = `${artist || ""} ${title || ""}`.trim();
    if (!q) return "";
    const url = proxyUrl(`https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=8`);
    const r = await fetch(url);
    if (!r.ok) throw new Error("Deezer search " + r.status);
    const j = await r.json();
    const key = normalizeKey(artist, title);
    const hit =
      (j.data || []).find((x) => normalizeKey(x.artist && x.artist.name, x.title) === key) || (j.data || [])[0];
    if (!hit) return "";
    return upgradeArtworkUrl(hit.cover_xl || hit.cover_big || hit.cover_medium || hit.cover);
  }

  async function fetchDeezerByAlbumId(deezerAlbumId) {
    if (!deezerAlbumId) return "";
    const url = proxyUrl(`https://api.deezer.com/album/${encodeURIComponent(String(deezerAlbumId))}`);
    const r = await fetch(url);
    if (!r.ok) return "";
    const j = await r.json();
    return upgradeArtworkUrl(j.cover_xl || j.cover_big || j.cover_medium || j.cover);
  }

  async function resolveRemote(album) {
    if (!album) return "";
    const chain = buildUrlChain(album);
    if (chain.length) return chain[0];

    const tries = [];
    if (album.deezerAlbumId) tries.push(() => fetchDeezerByAlbumId(album.deezerAlbumId));
    tries.push(() => fetchItunesArtwork(album.artist, album.title));
    tries.push(() => fetchDeezerArtwork(album.artist, album.title));

    for (const fn of tries) {
      try {
        const url = await fn();
        if (isHttpUrl(url)) {
          applyToAlbum(album, url, { src: "resolve" });
          return url;
        }
      } catch (e) {
        debug("resolve fail", album.id, e.message || e);
      }
    }
    return "";
  }

  async function ensureArtworkForAlbum(album) {
    if (!album) return "";
    const chain = buildUrlChain(album);
    if (chain[0]) return chain[0];
    if (inflight.has(album.id)) return inflight.get(album.id);
    const p = resolveRemote(album).finally(() => inflight.delete(album.id));
    inflight.set(album.id, p);
    return p;
  }

  function injectImg(frame, url) {
    if (!frame || !isHttpUrl(url)) return;
    const cover = frame.querySelector(".cover");
    if (!cover) return;
    let img = frame.querySelector(".cover-img");
    if (!img) {
      img = document.createElement("img");
      img.className = "cover-img";
      img.alt = cover.getAttribute("aria-label") || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 600;
      img.height = 600;
      cover.insertBefore(img, cover.firstChild);
    }
    frame.classList.add("has-art", "cover-frame--loading");
    cover.classList.add("has-img");
    img.src = url;
    if (img.complete && img.naturalWidth > 0) {
      frame.classList.remove("cover-frame--loading");
      img.classList.add("is-loaded");
    }
  }

  function showFallback(frame, img) {
    if (frame) {
      frame.classList.add("is-broken");
      frame.classList.remove("has-art", "cover-frame--loading", "needs-artwork");
    }
    const cover = img && img.closest(".cover");
    if (cover) cover.classList.remove("has-img");
    if (img) img.remove();
  }

  async function onCoverImgError(img) {
    const frame = img && img.closest(".cover-frame");
    if (!frame) return;
    const id = frame.getAttribute("data-cover-id");
    const album = id && typeof deps.getAlbum === "function" ? deps.getAlbum(id) : null;
    const failedUrl = img.src;
    markUrlFailed(failedUrl);
    debug("img error", id, failedUrl.slice(0, 80));

    const idx = (attemptByAlbum.get(id) || 0) + 1;
    attemptByAlbum.set(id, idx);
    const chain = album ? buildUrlChain(album) : [];
    const next = chain[idx];
    if (next && next !== failedUrl) {
      img.src = next;
      return;
    }

    if (album) {
      const resolved = await ensureArtworkForAlbum(album);
      if (resolved && resolved !== failedUrl) {
        img.src = resolved;
        return;
      }
    }
    showFallback(frame, img);
  }

  function wireCoverImages(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(".cover-frame[data-cover-id]").forEach((frame) => {
      const id = frame.getAttribute("data-cover-id");
      if (!id) return;
      const img = frame.querySelector(".cover-img");
      if (img && !img.dataset.slCoverBound) {
        img.dataset.slCoverBound = "1";
        img.addEventListener("load", () => {
          frame.classList.remove("cover-frame--loading", "needs-artwork");
          frame.classList.add("has-art");
          img.classList.add("is-loaded");
        });
        img.addEventListener("error", () => void onCoverImgError(img));
        if (img.complete && img.naturalWidth > 0) {
          frame.classList.remove("cover-frame--loading");
          img.classList.add("is-loaded");
        }
      }
      if (frame.classList.contains("needs-artwork") && !inflight.has("wire:" + id)) {
        inflight.set("wire:" + id, true);
        const album = typeof deps.getAlbum === "function" ? deps.getAlbum(id) : null;
        void (async () => {
          try {
            if (!album) return;
            const url = await ensureArtworkForAlbum(album);
            if (url) injectImg(frame, url);
          } finally {
            inflight.delete("wire:" + id);
          }
        })();
      }
    });
  }

  async function bootstrapCatalogArtwork() {
    if (catalogBootstrapStarted) return;
    catalogBootstrapStarted = true;
    const list = typeof deps.allAlbums === "function" ? deps.allAlbums() : [];
    const pending = list.filter((a) => a && a.id && !buildUrlChain(a).length);
    debug("bootstrap catalog", pending.length);
    for (let i = 0; i < pending.length; i++) {
      const al = pending[i];
      try {
        await ensureArtworkForAlbum(al);
      } catch (_) {}
      if (i % 4 === 3) await new Promise((r) => setTimeout(r, 80));
    }
    if (typeof deps.onBatchDone === "function") deps.onBatchDone();
  }

  function patchAlbumArtwork(album, url) {
    if (!album || !isHttpUrl(url)) return false;
    const u = upgradeArtworkUrl(url);
    if (pickAlbumFields(album).includes(u)) return false;
    applyToAlbum(album, u, { src: "patch" });
    if (typeof deps.persist === "function") {
      const imp = typeof deps.findImported === "function" ? deps.findImported(album.id) : null;
      if (imp) deps.persist();
    }
    return true;
  }

  loadCache();

  const api = {
    install(d) {
      deps = d || {};
      loadCache();
    },
    injectImg,
    debug,
    isHttpUrl,
    upgradeArtworkUrl,
    buildUrlChain,
    getCached,
    setCached,
    ensureArtworkForAlbum,
    resolveRemote,
    wireCoverImages,
    bootstrapCatalogArtwork,
    onCoverImgError,
    patchAlbumArtwork,
    applyToAlbum,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.SLArtwork = api;
})(typeof window !== "undefined" ? window : globalThis);
