/**
 * Recherche musicale multi-sources pour le logging Soundlog.
 * iTunes · Deezer · MusicBrainz · Last.fm · Spotify (si connecté)
 */
(function () {
  "use strict";

  const MB_UA = "Soundlog/1.0 (+https://github.com/kyabe78-web/Soundlog)";
  const CACHE_TTL_MS = 120000;
  const cache = new Map();

  function cfg() {
    return window.SLConfig || {};
  }

  function viaEdgeProxy(url) {
    const base = (cfg().edgeProxyUrl || "").trim();
    if (!base) return url;
    return base + (base.includes("?") ? "&" : "?") + "url=" + encodeURIComponent(url);
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function normKey(artist, title) {
    return norm(artist) + "|" + norm(title);
  }

  function typeLabel(type) {
    const m = {
      album: "Album",
      single: "Single",
      ep: "EP",
      playlist: "Playlist",
      artist: "Artiste",
      track: "Morceau",
    };
    return m[type] || "Release";
  }

  function platformLabel(sources) {
    if (!sources || !sources.length) return "Catalogue";
    const names = {
      apple: "Apple Music",
      deezer: "Deezer",
      spotify: "Spotify",
      musicbrainz: "MusicBrainz",
      lastfm: "Last.fm",
      local: "Ton carnet",
    };
    return sources.map((s) => names[s] || s).slice(0, 2).join(" · ");
  }

  function formatDuration(ms) {
    if (!ms || !Number.isFinite(ms)) return "";
    const sec = Math.round(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  /** @returns {import('./types').MusicSearchResult} */
  function makeResult(partial) {
    return {
      uid: partial.uid,
      type: partial.type || "album",
      title: partial.title || "",
      artist: partial.artist || "",
      year: partial.year || "",
      artworkUrl: partial.artworkUrl || "",
      durationMs: partial.durationMs || null,
      genres: partial.genres || [],
      sources: partial.sources || [],
      platform: platformLabel(partial.sources),
      typeLabel: typeLabel(partial.type),
      importPayload: partial.importPayload || null,
      localAlbumId: partial.localAlbumId || null,
      meta: partial.meta || {},
    };
  }

  async function fetchJson(url, opts) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }

  async function fetchItunes(q, entity) {
    const country =
      (window.__slMusicCountry && window.__slMusicCountry()) ||
      (cfg().musicCountry || "FR");
    const c = /^[A-Z]{2}$/i.test(country) ? country.toUpperCase() : "FR";
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${entity}&limit=20&country=${c}`;
    const j = await fetchJson(url);
    return j.results || [];
  }

  async function fetchDeezer(path) {
    const url = viaEdgeProxy("https://api.deezer.com/" + path);
    const j = await fetchJson(url);
    return j.data || [];
  }

  function itunesToResults(rows, defaultType) {
    return rows.map((x) => {
      const isArtist = x.wrapperType === "artist" || defaultType === "artist";
      const isTrack = x.wrapperType === "song" || defaultType === "single";
      const type = isArtist ? "artist" : isTrack ? "single" : "album";
      const title = isArtist ? x.artistName : isTrack ? x.trackName : x.collectionName;
      const artist = isArtist ? "" : x.artistName;
      const artwork = (x.artworkUrl100 || x.artworkUrl60 || "").replace("100x100bb", "600x600bb");
      return makeResult({
        uid: "itunes:" + (x.collectionId || x.artistId || x.trackId),
        type,
        title,
        artist,
        year: (x.releaseDate || "").slice(0, 4) || "",
        artworkUrl: artwork,
        durationMs: isTrack ? x.trackTimeMillis : null,
        genres: [],
        sources: ["apple"],
        importPayload: {
          title: isTrack ? x.collectionName || x.trackName : title,
          artist: artist || x.artistName,
          year: (x.releaseDate || "").slice(0, 4) || "",
          artworkUrl: artwork,
          appleCollectionId: x.collectionId ? String(x.collectionId) : null,
          fromItunes: true,
        },
      });
    });
  }

  function deezerAlbumRow(x) {
    const artwork = x.cover_big || x.cover_medium || x.cover || "";
    return makeResult({
      uid: "deezer:album:" + x.id,
      type: x.record_type === "ep" ? "ep" : "album",
      title: x.title,
      artist: x.artist?.name || "",
      year: (x.release_date || "").slice(0, 4) || "",
      artworkUrl: artwork,
      genres: x.genres?.data?.map((g) => g.name).filter(Boolean) || [],
      sources: ["deezer"],
      importPayload: {
        title: x.title,
        artist: x.artist?.name || "",
        year: (x.release_date || "").slice(0, 4) || "",
        artworkUrl: artwork,
        deezerAlbumId: x.id ? String(x.id) : null,
        deezer: x.link,
        fromDeezer: true,
      },
    });
  }

  function deezerTrackRow(x) {
    const artwork = x.album?.cover_big || x.album?.cover_medium || "";
    return makeResult({
      uid: "deezer:track:" + x.id,
      type: "single",
      title: x.title,
      artist: x.artist?.name || "",
      year: (x.album?.release_date || "").slice(0, 4) || "",
      artworkUrl: artwork,
      durationMs: x.duration ? x.duration * 1000 : null,
      genres: [],
      sources: ["deezer"],
      importPayload: {
        title: x.album?.title || x.title,
        artist: x.artist?.name || "",
        year: (x.album?.release_date || "").slice(0, 4) || "",
        artworkUrl: artwork,
        deezerAlbumId: x.album?.id ? String(x.album.id) : null,
        fromDeezer: true,
      },
    });
  }

  function deezerPlaylistRow(x) {
    return makeResult({
      uid: "deezer:playlist:" + x.id,
      type: "playlist",
      title: x.title,
      artist: x.user?.name || "Playlist",
      year: (x.creation_date || "").slice(0, 4) || "",
      artworkUrl: x.picture_big || x.picture_medium || "",
      durationMs: null,
      genres: [],
      sources: ["deezer"],
      importPayload: {
        title: x.title,
        artist: x.user?.name || "Playlist",
        year: new Date().getFullYear(),
        artworkUrl: x.picture_big || x.picture_medium || "",
        fromDeezer: true,
      },
    });
  }

  function deezerArtistRow(x) {
    return makeResult({
      uid: "deezer:artist:" + x.id,
      type: "artist",
      title: x.name,
      artist: "",
      year: "",
      artworkUrl: x.picture_big || x.picture_medium || "",
      genres: [],
      sources: ["deezer"],
      importPayload: {
        title: "Écoute — " + x.name,
        artist: x.name,
        year: new Date().getFullYear(),
        artworkUrl: x.picture_big || x.picture_medium || "",
        fromDeezer: true,
      },
    });
  }

  async function fetchMusicBrainz(q) {
    const url =
      "https://musicbrainz.org/ws/2/release?fmt=json&limit=18&query=" +
      encodeURIComponent('release:"' + q.replace(/"/g, "") + '" OR artist:"' + q.replace(/"/g, "") + '"');
    const j = await fetchJson(url, { headers: { "User-Agent": MB_UA } });
    const releases = j.releases || [];
    const out = [];
    for (const rel of releases) {
      const artist = (rel["artist-credit"] || []).map((ac) => ac.name).filter(Boolean).join(", ");
      const year = (rel.date || "").slice(0, 4);
      let artworkUrl = "";
      if (rel.id) {
        artworkUrl = "https://coverartarchive.org/release/" + rel.id + "/front-250";
      }
      const primary = (rel["release-group"] && rel["release-group"]["primary-type"]) || "";
      const type = primary === "EP" ? "ep" : primary === "Single" ? "single" : "album";
      out.push(
        makeResult({
          uid: "mb:" + rel.id,
          type,
          title: rel.title,
          artist,
          year,
          artworkUrl,
          genres: (rel.tags || []).map((t) => t.name).slice(0, 3),
          sources: ["musicbrainz"],
          importPayload: {
            title: rel.title,
            artist,
            year: year || "",
            artworkUrl,
            musicbrainzId: rel.id,
            fromMusicBrainz: true,
          },
        })
      );
    }
    return out;
  }

  async function fetchLastfm(q) {
    const key = (cfg().lastfmApiKey || "").trim();
    if (!key) return [];
    const base = "https://ws.audioscrobbler.com/2.0/?format=json&api_key=" + encodeURIComponent(key);
    const [albums, tracks] = await Promise.all([
      fetchJson(base + "&method=album.search&album=" + encodeURIComponent(q)).catch(() => ({ results: {} })),
      fetchJson(base + "&method=track.search&track=" + encodeURIComponent(q)).catch(() => ({ results: {} })),
    ]);
    const out = [];
    const albMatches = albums.results?.albummatches?.album || [];
    const listA = Array.isArray(albMatches) ? albMatches : albMatches ? [albMatches] : [];
    for (const a of listA.slice(0, 12)) {
      if (!a.name) continue;
      const img = Array.isArray(a.image) ? a.image[a.image.length - 1] : null;
      out.push(
        makeResult({
          uid: "lastfm:album:" + normKey(a.artist, a.name),
          type: "album",
          title: a.name,
          artist: a.artist,
          year: "",
          artworkUrl: (img && img["#text"]) || "",
          sources: ["lastfm"],
          importPayload: { title: a.name, artist: a.artist, artworkUrl: (img && img["#text"]) || "", fromLastfm: true },
        })
      );
    }
    const trMatches = tracks.results?.trackmatches?.track || [];
    const listT = Array.isArray(trMatches) ? trMatches : trMatches ? [trMatches] : [];
    for (const t of listT.slice(0, 8)) {
      if (!t.name) continue;
      out.push(
        makeResult({
          uid: "lastfm:track:" + normKey(t.artist, t.name),
          type: "single",
          title: t.name,
          artist: t.artist,
          durationMs: null,
          sources: ["lastfm"],
          importPayload: { title: t.name, artist: t.artist, fromLastfm: true },
        })
      );
    }
    return out;
  }

  async function fetchSpotify(q) {
    const sp = window.SLCloud && window.SLCloud.spotify;
    if (!sp || !sp.isConfigured || !sp.isConfigured() || !sp.hasToken || !sp.hasToken()) return [];
    const enc = encodeURIComponent(q);
    const j = await sp.api("/search?q=" + enc + "&type=album,track,playlist,artist&limit=12");
    const out = [];
    for (const a of j.albums?.items || []) {
      const img = (a.images && a.images[0] && a.images[0].url) || "";
      const type = a.album_type === "single" ? "single" : a.album_type === "ep" ? "ep" : "album";
      out.push(
        makeResult({
          uid: "spotify:album:" + a.id,
          type,
          title: a.name,
          artist: (a.artists || []).map((x) => x.name).join(", "),
          year: (a.release_date || "").slice(0, 4),
          artworkUrl: img,
          genres: [],
          sources: ["spotify"],
          importPayload: {
            title: a.name,
            artist: (a.artists || []).map((x) => x.name).join(", "),
            year: (a.release_date || "").slice(0, 4),
            artworkUrl: img,
            spotifyId: a.id,
            fromSpotify: true,
          },
        })
      );
    }
    for (const t of (j.tracks?.items || []).slice(0, 8)) {
      const img = t.album?.images?.[0]?.url || "";
      out.push(
        makeResult({
          uid: "spotify:track:" + t.id,
          type: "single",
          title: t.name,
          artist: (t.artists || []).map((x) => x.name).join(", "),
          year: (t.album?.release_date || "").slice(0, 4),
          artworkUrl: img,
          durationMs: t.duration_ms,
          sources: ["spotify"],
          importPayload: {
            title: t.album?.name || t.name,
            artist: (t.artists || []).map((x) => x.name).join(", "),
            year: (t.album?.release_date || "").slice(0, 4),
            artworkUrl: img,
            fromSpotify: true,
          },
        })
      );
    }
    for (const p of (j.playlists?.items || []).slice(0, 6)) {
      out.push(
        makeResult({
          uid: "spotify:playlist:" + p.id,
          type: "playlist",
          title: p.name,
          artist: p.owner?.display_name || "Spotify",
          artworkUrl: p.images?.[0]?.url || "",
          sources: ["spotify"],
          importPayload: {
            title: p.name,
            artist: p.owner?.display_name || "Playlist",
            artworkUrl: p.images?.[0]?.url || "",
            fromSpotify: true,
          },
        })
      );
    }
    for (const ar of (j.artists?.items || []).slice(0, 6)) {
      out.push(
        makeResult({
          uid: "spotify:artist:" + ar.id,
          type: "artist",
          title: ar.name,
          artist: "",
          artworkUrl: ar.images?.[0]?.url || "",
          sources: ["spotify"],
          importPayload: {
            title: "Écoute — " + ar.name,
            artist: ar.name,
            artworkUrl: ar.images?.[0]?.url || "",
            fromSpotify: true,
          },
        })
      );
    }
    return out;
  }

  function mergeResults(chunks) {
    const map = new Map();
    for (const list of chunks) {
      for (const r of list) {
        const k =
          r.type === "artist"
            ? "artist:" + norm(r.title)
            : r.type === "playlist"
              ? "pl:" + norm(r.title)
              : normKey(r.artist, r.title);
        const cur = map.get(k);
        if (!cur) {
          map.set(k, { ...r, sources: [...(r.sources || [])] });
          continue;
        }
        cur.sources = [...new Set([...(cur.sources || []), ...(r.sources || [])])];
        cur.platform = platformLabel(cur.sources);
        if (r.artworkUrl && (!cur.artworkUrl || r.artworkUrl.length > cur.artworkUrl.length)) {
          cur.artworkUrl = r.artworkUrl;
        }
        if (!cur.durationMs && r.durationMs) cur.durationMs = r.durationMs;
        if ((!cur.genres || !cur.genres.length) && r.genres?.length) cur.genres = r.genres;
        if (r.importPayload && !cur.importPayload) cur.importPayload = r.importPayload;
      }
    }
    return [...map.values()];
  }

  function searchLocalCatalog(q, localAlbums) {
    const qq = norm(q);
    if (!qq || qq.length < 1) return [];
    return (localAlbums || [])
      .filter((a) => {
        const hay = norm((a.title || "") + " " + (a.artist || "") + " " + (a.genre || ""));
        return hay.includes(qq);
      })
      .slice(0, 12)
      .map((a) =>
        makeResult({
          uid: "local:" + a.id,
          type: "album",
          title: a.title,
          artist: a.artist,
          year: String(a.year || ""),
          artworkUrl: a.artworkUrl || "",
          genres: a.genre ? [a.genre] : [],
          sources: ["local"],
          localAlbumId: a.id,
        })
      );
  }

  async function search(q, opts) {
    opts = opts || {};
    const query = String(q || "").trim();
    if (query.length < 2) return { results: [], local: [], error: null };

    const cacheKey = query.toLowerCase();
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

    const local = opts.localAlbums ? searchLocalCatalog(query, opts.localAlbums) : [];

    const tasks = await Promise.allSettled([
      fetchItunes(query, "album").then((r) => itunesToResults(r, "album")),
      fetchItunes(query, "song").then((r) => itunesToResults(r, "single")),
      fetchItunes(query, "musicArtist").then((r) => itunesToResults(r, "artist")),
      fetchDeezer("search/album?q=" + encodeURIComponent(query) + "&limit=18").then((rows) =>
        rows.map(deezerAlbumRow)
      ),
      fetchDeezer("search/track?q=" + encodeURIComponent(query) + "&limit=14").then((rows) =>
        rows.map(deezerTrackRow)
      ),
      fetchDeezer("search/playlist?q=" + encodeURIComponent(query) + "&limit=8").then((rows) =>
        rows.map(deezerPlaylistRow)
      ),
      fetchDeezer("search/artist?q=" + encodeURIComponent(query) + "&limit=8").then((rows) =>
        rows.map(deezerArtistRow)
      ),
      fetchMusicBrainz(query),
      fetchLastfm(query),
      fetchSpotify(query),
    ]);

    const remote = mergeResults(tasks.filter((t) => t.status === "fulfilled").map((t) => t.value));
    const merged = mergeResults([local, remote]);
    const results = merged.slice(0, 48);

    const data = {
      results,
      local,
      error: results.length ? null : "Aucun résultat — essaie un autre terme ou vérifie ta connexion.",
    };
    cache.set(cacheKey, { at: Date.now(), data });
    return data;
  }

  window.SLMusicSearch = {
    search,
    searchLocalCatalog,
    formatDuration,
    typeLabel,
    platformLabel,
    clearCache() {
      cache.clear();
    },
  };
})();
