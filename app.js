(function () {
  "use strict";

  const STORAGE_KEY = "soundlog_v2";

  /** @type {{ from: string; to: string }[]} */
  const CATALOG = [
    { id: "a1", title: "Random Access Memories", artist: "Daft Punk", year: 2013, genre: "Électronique", from: "#1a1a2e", to: "#16213e" },
    { id: "a2", title: "To Pimp a Butterfly", artist: "Kendrick Lamar", year: 2015, genre: "Hip-hop", from: "#2d132c", to: "#801336" },
    { id: "a3", title: "Blonde", artist: "Frank Ocean", year: 2016, genre: "R&B", from: "#3d2c1e", to: "#1a1a1a" },
    { id: "a4", title: "Currents", artist: "Tame Impala", year: 2015, genre: "Psyché", from: "#4a1942", to: "#1f0d3a" },
    { id: "a5", title: "Melodrama", artist: "Lorde", year: 2017, genre: "Pop", from: "#1e3a5f", to: "#0d1b2a" },
    { id: "a6", title: "In Rainbows", artist: "Radiohead", year: 2007, genre: "Rock", from: "#2b2d42", to: "#1a1a2e" },
    { id: "a7", title: "Ctrl", artist: "SZA", year: 2017, genre: "R&B", from: "#4a0e0e", to: "#2d0a0a" },
    { id: "a8", title: "Homogenic", artist: "Björk", year: 1997, genre: "Expérimental", from: "#0f3460", to: "#16213e" },
    { id: "a9", title: "Discovery", artist: "Daft Punk", year: 2001, genre: "Électronique", from: "#1d2671", to: "#c33764" },
    { id: "a10", title: "The Rise and Fall of Ziggy Stardust", artist: "David Bowie", year: 1972, genre: "Rock", from: "#533483", to: "#21094e" },
    { id: "a11", title: "Rumours", artist: "Fleetwood Mac", year: 1977, genre: "Rock", from: "#3e2723", to: "#5d4037" },
    { id: "a12", title: "Back to Black", artist: "Amy Winehouse", year: 2006, genre: "Soul", from: "#212121", to: "#424242" },
    { id: "a13", title: "good kid, m.A.A.d city", artist: "Kendrick Lamar", year: 2012, genre: "Hip-hop", from: "#1b1b2f", to: "#162447" },
    { id: "a14", title: "Channel Orange", artist: "Frank Ocean", year: 2012, genre: "R&B", from: "#ff6f00", to: "#bf360c" },
    { id: "a15", title: "Lateralus", artist: "Tool", year: 2001, genre: "Metal", from: "#263238", to: "#37474f" },
    { id: "a16", title: "Illmatic", artist: "Nas", year: 1994, genre: "Hip-hop", from: "#3e2723", to: "#1b1b1b" },
    { id: "a17", title: "The Miseducation of Lauryn Hill", artist: "Lauryn Hill", year: 1998, genre: "Hip-hop", from: "#33691e", to: "#1b5e20" },
    { id: "a18", title: "Kid A", artist: "Radiohead", year: 2000, genre: "Rock", from: "#263238", to: "#000000" },
    { id: "a19", title: "Vespertine", artist: "Björk", year: 2001, genre: "Expérimental", from: "#eceff1", to: "#90a4ae" },
    { id: "a20", title: "After Hours", artist: "The Weeknd", year: 2020, genre: "Pop", from: "#b71c1c", to: "#1a0505" },
    { id: "a21", title: "Fetch the Bolt Cutters", artist: "Fiona Apple", year: 2020, genre: "Indie", from: "#3e2723", to: "#5d4037" },
    { id: "a22", title: "Punisher", artist: "Phoebe Bridgers", year: 2020, genre: "Indie", from: "#263238", to: "#455a64" },
    { id: "a23", title: "Visions", artist: "Grimes", year: 2012, genre: "Électronique", from: "#880e4f", to: "#311b92" },
    { id: "a24", title: "The ArchAndroid", artist: "Janelle Monáe", year: 2010, genre: "R&B", from: "#4a148c", to: "#311b92" },
    { id: "a25", title: "Remain in Light", artist: "Talking Heads", year: 1980, genre: "Rock", from: "#ff6f00", to: "#e65100" },
    { id: "a26", title: "Hounds of Love", artist: "Kate Bush", year: 1985, genre: "Pop", from: "#1a237e", to: "#0d47a1" },
    { id: "a27", title: "Aquemini", artist: "OutKast", year: 1998, genre: "Hip-hop", from: "#33691e", to: "#827717" },
    { id: "a28", title: "Low", artist: "David Bowie", year: 1977, genre: "Rock", from: "#37474f", to: "#212121" },
    { id: "a29", title: "The Low End Theory", artist: "A Tribe Called Quest", year: 1991, genre: "Hip-hop", from: "#3e2723", to: "#ffb300" },
    { id: "a30", title: "Dummy", artist: "Portishead", year: 1994, genre: "Trip-hop", from: "#263238", to: "#000000" },
    { id: "a31", title: "Selected Ambient Works 85-92", artist: "Aphex Twin", year: 1992, genre: "Électronique", from: "#004d40", to: "#1b5e20" },
    { id: "a32", title: "Blue", artist: "Joni Mitchell", year: 1971, genre: "Folk", from: "#0d47a1", to: "#01579b" },
  ];

  const USERS = [
    { id: "me", name: "Toi", handle: "moi", bio: "Amateur·rice de disques. Les notes restent sur ton appareil.", hue: 152 },
    { id: "u1", name: "Marie V.", handle: "mariev", bio: "Jazz, soul et vinyles trouvés en brocante.", hue: 320 },
    { id: "u2", name: "Léo Beats", handle: "leobeats", bio: "Hip-hop & expérimental. Playlists chaque dimanche.", hue: 28 },
    { id: "u3", name: "Adagio", handle: "adagio", bio: "Classique moderne et musiques de film.", hue: 200 },
  ];

  function defaultAdaptive() {
    return { v: 1, nav: {}, genreInterest: {}, listenLogs: 0 };
  }

  function defaultState() {
    return {
      listenings: [
        { id: "l1", userId: "u1", albumId: "a11", date: "2026-05-10", rating: 5, review: "Parfait du début à la fin. Buckingham Nicks energy." },
        { id: "l2", userId: "u2", albumId: "a13", date: "2026-05-09", rating: 5, review: "Un classique instantané du storytelling." },
        { id: "l3", userId: "u3", albumId: "a8", date: "2026-05-08", rating: 4.5, review: "J'ai écouté ça en boucle toute la semaine." },
        { id: "l4", userId: "u1", albumId: "a6", date: "2026-05-06", rating: 4.5, review: "" },
        { id: "l5", userId: "me", albumId: "a4", date: "2026-05-12", rating: 4, review: "Les basses sur Let It Happen 😮" },
      ],
      follows: ["u1", "u2", "u3"],
      friends: ["u2"],
      incomingFriendRequests: [{ id: "fr-seed", fromUserId: "u1", createdAt: "2026-05-10T12:00:00.000Z" }],
      outgoingFriendRequests: [],
      favoriteArtists: ["Radiohead", "Phoebe Bridgers"],
      notifications: [
        {
          id: "n-welcome",
          type: "system",
          title: "Communauté Soundlog",
          body: "Ouvre l’onglet Communauté pour les amis, les murmures et les alertes concerts près de chez toi.",
          read: false,
          at: "2026-05-12T10:00:00.000Z",
          meta: {},
        },
      ],
      tourAlertSeen: [],
      feedComments: [],
      shoutouts: [
        {
          id: "sh0",
          userId: "u1",
          text: "Ce week-end je creuse du trip-hop — des reco ?",
          at: "2026-05-11T18:00:00.000Z",
        },
      ],
      manualTourDates: [
        {
          id: "mtd-seed",
          artist: "Radiohead",
          datetime: "2026-10-18T20:00:00",
          venue: "Accor Arena",
          city: "Paris",
          url: "",
        },
      ],
      lastTourSyncAt: null,
      lists: [
        {
          id: "list1",
          userId: "u1",
          title: "Pluie & mélancolie",
          description: "Pour rester au chaud.",
          albumIds: ["a6", "a30", "a22", "a3"],
        },
        {
          id: "list2",
          userId: "u2",
          title: "90s essentials",
          description: "",
          albumIds: ["a16", "a29", "a27", "a17"],
        },
      ],
      wishlist: ["a15", "a31", "a28"],
      importedAlbums: [],
      settings: { youtubeApiKey: "", alertCity: "Paris", desktopAlerts: false, musicCountry: "FR" },
      profile: {
        displayName: "Toi",
        handle: "moi",
        bio: "Amateur·rice de disques. Les notes restent sur ton appareil.",
        performanceVideos: [],
      },
      concertLogs: [
        {
          id: "c1",
          userId: "u1",
          artist: "Nick Cave & The Bad Seeds",
          eventTitle: "European Tour",
          date: "2025-11-02",
          venue: "Le Zénith",
          city: "Paris",
          notes: "Son massif, setlist parfaite.",
        },
        {
          id: "c2",
          userId: "u2",
          artist: "Kendrick Lamar",
          eventTitle: "Big Steppers Tour",
          date: "2024-08-14",
          venue: "Accor Arena",
          city: "Paris",
          notes: "",
        },
        {
          id: "c3",
          userId: "u3",
          artist: "The Smile",
          eventTitle: "",
          date: "2023-06-20",
          venue: "Madison Square Garden",
          city: "New York",
          notes: "Première fois en live — énergie folle.",
        },
      ],
      invitedPeers: [],
      sentInvites: [],
      adaptive: defaultAdaptive(),
      previewByAlbumId: {},
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        listenings: parsed.listenings || base.listenings,
        follows: Array.isArray(parsed.follows) ? parsed.follows : base.follows,
        friends: Array.isArray(parsed.friends) ? parsed.friends : base.friends,
        incomingFriendRequests: Array.isArray(parsed.incomingFriendRequests)
          ? parsed.incomingFriendRequests
          : base.incomingFriendRequests,
        outgoingFriendRequests: Array.isArray(parsed.outgoingFriendRequests)
          ? parsed.outgoingFriendRequests
          : base.outgoingFriendRequests,
        favoriteArtists: Array.isArray(parsed.favoriteArtists) ? parsed.favoriteArtists : base.favoriteArtists,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : base.notifications,
        tourAlertSeen: Array.isArray(parsed.tourAlertSeen) ? parsed.tourAlertSeen : base.tourAlertSeen,
        feedComments: Array.isArray(parsed.feedComments) ? parsed.feedComments : base.feedComments,
        shoutouts: Array.isArray(parsed.shoutouts) ? parsed.shoutouts : base.shoutouts,
        manualTourDates: Array.isArray(parsed.manualTourDates) ? parsed.manualTourDates : base.manualTourDates,
        lastTourSyncAt: parsed.lastTourSyncAt != null ? parsed.lastTourSyncAt : base.lastTourSyncAt,
        lists: Array.isArray(parsed.lists) ? parsed.lists : base.lists,
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : base.wishlist,
        importedAlbums: Array.isArray(parsed.importedAlbums) ? parsed.importedAlbums : base.importedAlbums,
        settings: { ...base.settings, ...(parsed.settings || {}) },
        profile: (() => {
          const prof = { ...base.profile, ...(parsed.profile || {}) };
          prof.performanceVideos = Array.isArray(prof.performanceVideos) ? prof.performanceVideos : [];
          return prof;
        })(),
        concertLogs: Array.isArray(parsed.concertLogs) ? parsed.concertLogs : base.concertLogs,
        invitedPeers: Array.isArray(parsed.invitedPeers) ? parsed.invitedPeers : base.invitedPeers,
        sentInvites: Array.isArray(parsed.sentInvites) ? parsed.sentInvites : base.sentInvites,
        adaptive: (() => {
          const raw = parsed.adaptive && typeof parsed.adaptive === "object" ? parsed.adaptive : {};
          const a = { ...defaultAdaptive(), ...raw };
          a.nav = a.nav && typeof a.nav === "object" ? a.nav : {};
          a.genreInterest = a.genreInterest && typeof a.genreInterest === "object" ? a.genreInterest : {};
          a.listenLogs = typeof a.listenLogs === "number" && !Number.isNaN(a.listenLogs) ? a.listenLogs : 0;
          return a;
        })(),
        previewByAlbumId: (() => {
          const raw =
            parsed.previewByAlbumId && typeof parsed.previewByAlbumId === "object" ? parsed.previewByAlbumId : {};
          const cleaned = {};
          for (const [id, p] of Object.entries(raw)) {
            if (p && p.v === PREVIEW_CACHE_V && p.url && !p.unavailable) cleaned[id] = p;
          }
          return cleaned;
        })(),
      };
    } catch {
      return defaultState();
    }
  }

  let state = loadState();
  let previewAudio = null;
  let previewAlbumId = null;

  // Si une Edge Function proxy est configurée, on l'utilise pour les APIs externes
  // (élimine les CORS warnings côté Bandsintown/Deezer en prod).
  function viaEdgeProxy(externalUrl) {
    const cfg = window.SLConfig || {};
    if (!cfg.edgeProxyUrl) return externalUrl;
    return cfg.edgeProxyUrl + "?url=" + encodeURIComponent(externalUrl);
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof window.__slSchedulePushCloud === "function") window.__slSchedulePushCloud();
  }

  const route = { view: "home", albumId: null, userId: null, listId: null, discoverGenre: null, joinInviteRaw: null };

  /** Dernière « clé de route » déjà enregistrée par Sonar (évite les doublons entre deux rendus). */
  let adaptiveRouteKeySeen = "__init__";

  const $main = document.getElementById("app-main");
  const $modal = document.getElementById("modal-root");
  const $toast = document.getElementById("toast-root");
  const $search = document.getElementById("global-search");

  let libraryQuery = "";
  let libraryRemoteHits = [];
  let libraryRemoteLoading = false;
  let libraryRemoteError = null;
  let libSearchTimer = null;

  const PREVIEW_CACHE_V = 3;
  const MIN_ALBUM_MATCH_SCORE = 70;

  function normalizeText(s) {
    return normalizeArtistKey(
      String(s || "")
        .replace(/\([^)]*\)/g, " ")
        .replace(/\[[^\]]*\]/g, " ")
        .replace(/\s+/g, " ")
    );
  }

  function normalizeAlbumKey(artist, title) {
    const t = normalizeText(title)
      .replace(/\b(deluxe|remaster|remastered|edition|version|expanded|anniversary|bonus)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return `${normalizeText(artist)}|${t}`;
  }

  function normalizeKey(artist, title) {
    return normalizeAlbumKey(artist, title);
  }

  function musicCountry() {
    const c = (state.settings && state.settings.musicCountry) || "FR";
    return /^[A-Z]{2}$/i.test(c) ? c.toUpperCase() : "FR";
  }

  function softMatch(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;
    return false;
  }

  function scoreAlbumCandidate(al, candidateArtist, candidateTitle, candidateYear) {
    const wantArtist = normalizeText(al.artist);
    const wantTitle = normalizeAlbumKey(al.artist, al.title).split("|")[1];
    const gotArtist = normalizeText(candidateArtist);
    const gotTitle = normalizeAlbumKey(candidateArtist, candidateTitle).split("|")[1];

    const artistExact = wantArtist && gotArtist && wantArtist === gotArtist;
    const artistSoft = artistExact || softMatch(wantArtist, gotArtist);
    const titleExact = wantTitle && gotTitle && wantTitle === gotTitle;
    const titleSoft = titleExact || softMatch(wantTitle, gotTitle);

    if (!artistSoft || !titleSoft) return 0;

    let score = 0;
    score += artistExact ? 45 : 25;
    score += titleExact ? 45 : 25;

    const y = parseInt(String(al.year).replace(/\D/g, ""), 10);
    const cy = parseInt(String(candidateYear || "").replace(/\D/g, ""), 10);
    if (Number.isFinite(y) && Number.isFinite(cy)) {
      const diff = Math.abs(y - cy);
      if (diff === 0) score += 12;
      else if (diff <= 1) score += 8;
      else if (diff > 5) score -= 20;
    }
    return score;
  }

  function pickBestAlbumMatch(al, items, mapRow) {
    let best = null;
    let bestScore = 0;
    for (const row of items) {
      const mapped = mapRow(row);
      const s = scoreAlbumCandidate(al, mapped.artist, mapped.title, mapped.year);
      if (s > bestScore) {
        bestScore = s;
        best = mapped;
      }
    }
    if (!best || bestScore < MIN_ALBUM_MATCH_SCORE) return null;
    return best;
  }

  function parseAppleCollectionId(url) {
    if (!url) return null;
    try {
      const s = String(url);
      const m = s.match(/\/album\/[^/]+\/(\d{5,})/) || s.match(/[?&]i=(\d{5,})/);
      return m ? m[1] : null;
    } catch (_) {
      return null;
    }
  }

  function parseDeezerAlbumId(url) {
    if (!url) return null;
    try {
      const m = String(url).match(/deezer\.com\/(?:[a-z]{2}\/)?album\/(\d+)/i);
      return m ? m[1] : null;
    } catch (_) {
      return null;
    }
  }

  function albumPlatformIds(al) {
    const links = streamingLinksForAlbum(al);
    return {
      appleCollectionId: al.appleCollectionId || parseAppleCollectionId(links.apple),
      deezerAlbumId: al.deezerAlbumId || parseDeezerAlbumId(links.deezer),
    };
  }

  function persistPlatformIdsOnAlbum(al, ids) {
    if (!ids || !al) return;
    if (String(al.id).startsWith("ext-")) {
      const imp = (state.importedAlbums || []).find((a) => a.id === al.id);
      if (imp) {
        if (ids.appleCollectionId) imp.appleCollectionId = ids.appleCollectionId;
        if (ids.deezerAlbumId) imp.deezerAlbumId = ids.deezerAlbumId;
        persist();
      }
    }
  }

  function pickLeadItunesTrack(results) {
    const tracks = (results || [])
      .filter(
        (x) =>
          x.wrapperType === "track" &&
          (!x.kind || x.kind === "song") &&
          x.previewUrl &&
          x.trackName
      )
      .sort((a, b) => {
        const da = a.discNumber || 1;
        const db = b.discNumber || 1;
        if (da !== db) return da - db;
        return (a.trackNumber || 999) - (b.trackNumber || 999);
      });
    return tracks[0] || null;
  }

  function pickLeadDeezerTrack(tracks) {
    const sorted = (tracks || [])
      .filter((t) => t.preview && t.title)
      .sort((a, b) => {
        const da = a.disk_number || 1;
        const db = b.disk_number || 1;
        if (da !== db) return da - db;
        return (a.track_position || 999) - (b.track_position || 999);
      });
    return sorted[0] || null;
  }

  function buildPreviewRecord(al, track, source, platformIds) {
    return {
      v: PREVIEW_CACHE_V,
      url: track.url,
      trackName: track.trackName,
      trackNumber: track.trackNumber || 1,
      source,
      albumKey: normalizeAlbumKey(al.artist, al.title),
      albumTitle: al.title,
      artistName: al.artist,
      appleCollectionId: platformIds?.appleCollectionId || null,
      deezerAlbumId: platformIds?.deezerAlbumId || null,
      resolvedAt: new Date().toISOString(),
    };
  }

  function gradientFromKey(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) | 0;
    const hue = Math.abs(h) % 360;
    return { from: `hsl(${hue},42%,24%)`, to: `hsl(${(hue + 48) % 360},50%,14%)` };
  }

  function buildPlatformLinks(artist, title, youtubeVideoId) {
    const q = `${artist} ${title}`;
    const qEnc = encodeURIComponent(q);
    const vid = youtubeVideoId && String(youtubeVideoId).trim();
    return {
      apple: `https://music.apple.com/search?term=${qEnc}`,
      deezer: `https://www.deezer.com/search/album?q=${qEnc}`,
      spotify: `https://open.spotify.com/search/${encodeURIComponent(q)}`,
      youtube: vid
        ? `https://www.youtube.com/watch?v=${encodeURIComponent(vid)}`
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " album")}`,
    };
  }

  function streamingLinksForAlbum(al) {
    if (al.links && typeof al.links === "object") return al.links;
    return buildPlatformLinks(al.artist, al.title, null);
  }

  function allAlbums() {
    return CATALOG.concat(state.importedAlbums || []);
  }

  async function fetchItunesAlbums(q) {
    const country = musicCountry();
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=25&country=${country}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Apple / iTunes");
    const j = await r.json();
    return (j.results || []).map((x) => ({
      key: normalizeKey(x.artistName, x.collectionName),
      title: x.collectionName,
      artist: x.artistName,
      year: (x.releaseDate || "").slice(0, 4) || "—",
      artworkUrl: (x.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
      apple: x.collectionViewUrl || null,
      appleCollectionId: x.collectionId ? String(x.collectionId) : null,
      fromItunes: true,
    }));
  }

  async function fetchDeezerAlbums(q) {
    const url = viaEdgeProxy(`https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=25`);
    const r = await fetch(url);
    if (!r.ok) throw new Error("Deezer");
    const j = await r.json();
    return (j.data || []).map((x) => ({
      key: normalizeKey(x.artist.name, x.title),
      title: x.title,
      artist: x.artist.name,
      year: (x.release_date || "").slice(0, 4) || "—",
      artworkUrl: x.cover_medium || x.cover || "",
      deezer: x.link,
      deezerAlbumId: x.id ? String(x.id) : null,
      fromDeezer: true,
    }));
  }

  function ensurePreviewCache() {
    if (!state.previewByAlbumId || typeof state.previewByAlbumId !== "object") state.previewByAlbumId = {};
  }

  function getCachedAlbumPreview(albumId, al) {
    ensurePreviewCache();
    const p = state.previewByAlbumId[albumId];
    if (!p || p.unavailable || !p.url) return null;
    if (p.v !== PREVIEW_CACHE_V) return null;
    if (al && p.albumKey && p.albumKey !== normalizeAlbumKey(al.artist, al.title)) return null;
    return p;
  }

  function cacheAlbumPreview(albumId, preview) {
    ensurePreviewCache();
    state.previewByAlbumId[albumId] = preview;
    persist();
  }

  function invalidateAlbumPreview(albumId) {
    ensurePreviewCache();
    delete state.previewByAlbumId[albumId];
    persist();
  }

  async function fetchItunesPreviewByCollectionId(collectionId, al) {
    const country = musicCountry();
    const lr = await fetch(
      `https://itunes.apple.com/lookup?id=${encodeURIComponent(collectionId)}&entity=song&limit=100&country=${country}`
    );
    if (!lr.ok) throw new Error("iTunes lookup");
    const lj = await lr.json();
    const results = lj.results || [];
    if (al && al.artist) {
      const collection = results.find((x) => x.wrapperType === "collection");
      if (collection) {
        const wantArtist = normalizeText(al.artist);
        const gotArtist = normalizeText(collection.artistName || "");
        if (!softMatch(wantArtist, gotArtist)) return null;
        const wantTitle = normalizeAlbumKey(al.artist, al.title).split("|")[1];
        const gotTitle = normalizeAlbumKey(collection.artistName || "", collection.collectionName || "").split("|")[1];
        if (!softMatch(wantTitle, gotTitle)) return null;
      }
    }
    const cidStr = String(collectionId);
    const tracksOnly = results.filter(
      (x) => x.wrapperType === "track" && String(x.collectionId) === cidStr
    );
    const pool = tracksOnly.length ? tracksOnly : results;
    const pick = pickLeadItunesTrack(pool);
    if (!pick) return null;
    return {
      preview: {
        url: pick.previewUrl,
        trackName: pick.trackName,
        trackNumber: pick.trackNumber || 1,
        source: "apple",
      },
      appleCollectionId: cidStr,
    };
  }

  async function fetchDeezerPreviewByAlbumId(albumId, al) {
    const meta = await fetch(viaEdgeProxy(`https://api.deezer.com/album/${encodeURIComponent(albumId)}`));
    if (meta.ok && al && al.artist) {
      try {
        const mj = await meta.json();
        if (mj && mj.artist && mj.title) {
          const wantArtist = normalizeText(al.artist);
          const gotArtist = normalizeText(mj.artist.name || "");
          if (!softMatch(wantArtist, gotArtist)) return null;
          const wantTitle = normalizeAlbumKey(al.artist, al.title).split("|")[1];
          const gotTitle = normalizeAlbumKey(mj.artist.name || "", mj.title || "").split("|")[1];
          if (!softMatch(wantTitle, gotTitle)) return null;
        }
      } catch (_) {}
    }
    const tr = await fetch(viaEdgeProxy(`https://api.deezer.com/album/${encodeURIComponent(albumId)}/tracks`));
    if (!tr.ok) throw new Error("Deezer tracks");
    const tj = await tr.json();
    const pick = pickLeadDeezerTrack(tj.data);
    if (!pick) return null;
    return {
      preview: {
        url: pick.preview,
        trackName: pick.title,
        trackNumber: pick.track_position || 1,
        source: "deezer",
      },
      deezerAlbumId: String(albumId),
    };
  }

  async function fetchItunesAlbumPreview(al) {
    const country = musicCountry();
    const term = encodeURIComponent(`${al.artist} ${al.title}`);
    const searchUrl = `https://itunes.apple.com/search?term=${term}&entity=album&limit=12&country=${country}`;
    const r = await fetch(searchUrl);
    if (!r.ok) throw new Error("iTunes");
    const j = await r.json();
    const results = j.results || [];
    const match = pickBestAlbumMatch(al, results, (x) => ({
      artist: x.artistName,
      title: x.collectionName,
      year: (x.releaseDate || "").slice(0, 4),
      collectionId: x.collectionId,
    }));
    if (!match || !match.collectionId) return null;
    const resolved = await fetchItunesPreviewByCollectionId(match.collectionId, al);
    return resolved;
  }

  async function fetchDeezerAlbumPreview(al) {
    const searchUrl = viaEdgeProxy(`https://api.deezer.com/search/album?q=${encodeURIComponent(`${al.artist} ${al.title}`)}&limit=12`);
    const r = await fetch(searchUrl);
    if (!r.ok) throw new Error("Deezer");
    const j = await r.json();
    const data = j.data || [];
    const match = pickBestAlbumMatch(al, data, (x) => ({
      artist: x.artist.name,
      title: x.title,
      year: (x.release_date || "").slice(0, 4),
      albumId: x.id,
    }));
    if (!match || !match.albumId) return null;
    return fetchDeezerPreviewByAlbumId(match.albumId, al);
  }

  async function resolveAlbumPreview(al, opts) {
    const force = opts && opts.force;
    if (!force) {
      const cached = getCachedAlbumPreview(al.id, al);
      if (cached) return cached;
    }
    ensurePreviewCache();
    const stale = state.previewByAlbumId[al.id];
    if (stale && stale.unavailable && !force) {
      const age = Date.now() - new Date(stale.checkedAt || 0).getTime();
      if (age < 1000 * 60 * 60 * 12) return null;
    }

    const platformIds = albumPlatformIds(al);
    let resolvedIds = { ...platformIds };
    let track = null;
    let source = null;

    if (platformIds.appleCollectionId) {
      try {
        const r = await fetchItunesPreviewByCollectionId(platformIds.appleCollectionId, al);
        if (r) {
          track = r.preview;
          source = "apple";
          resolvedIds.appleCollectionId = r.appleCollectionId;
        }
      } catch (_) {}
    }
    if (!track && platformIds.deezerAlbumId) {
      try {
        const r = await fetchDeezerPreviewByAlbumId(platformIds.deezerAlbumId, al);
        if (r) {
          track = r.preview;
          source = "deezer";
          resolvedIds.deezerAlbumId = r.deezerAlbumId;
        }
      } catch (_) {}
    }
    if (!track) {
      try {
        const r = await fetchItunesAlbumPreview(al);
        if (r) {
          track = r.preview;
          source = "apple";
          resolvedIds.appleCollectionId = r.appleCollectionId;
        }
      } catch (_) {}
    }
    if (!track) {
      try {
        const r = await fetchDeezerAlbumPreview(al);
        if (r) {
          track = r.preview;
          source = "deezer";
          resolvedIds.deezerAlbumId = r.deezerAlbumId;
        }
      } catch (_) {}
    }

    if (track) {
      const record = buildPreviewRecord(al, track, source || track.source, resolvedIds);
      cacheAlbumPreview(al.id, record);
      persistPlatformIdsOnAlbum(al, resolvedIds);
      return record;
    }

    cacheAlbumPreview(al.id, {
      v: PREVIEW_CACHE_V,
      unavailable: true,
      albumKey: normalizeAlbumKey(al.artist, al.title),
      checkedAt: new Date().toISOString(),
    });
    return null;
  }

  function ensurePreviewAudio() {
    if (!previewAudio) {
      previewAudio = new Audio();
      previewAudio.preload = "none";
      previewAudio.addEventListener("ended", () => stopAlbumPreview());
      previewAudio.addEventListener("timeupdate", () => syncPreviewProgress());
      previewAudio.addEventListener("error", () => {
        const id = previewAlbumId;
        stopAlbumPreview();
        if (id) {
          invalidateAlbumPreview(id);
          toast("Extrait introuvable — clique à nouveau pour réessayer.");
        }
      });
    }
    return previewAudio;
  }

  function syncPreviewProgress() {
    if (!previewAudio || !previewAlbumId) return;
    const dur = previewAudio.duration && Number.isFinite(previewAudio.duration) ? previewAudio.duration : 30;
    const pct = Math.min(100, (previewAudio.currentTime / dur) * 100);
    document.querySelectorAll(`[data-preview-album="${previewAlbumId}"] .feed-preview__progress`).forEach((el) => {
      el.style.width = `${pct}%`;
    });
  }

  function updatePreviewUi(albumId, preview, playing) {
    const roots = document.querySelectorAll(`[data-preview-album="${albumId}"]`);
    roots.forEach((root) => {
      root.classList.toggle("is-preview-active", !!playing);
      const panel = root.querySelector(".feed-preview");
      const trackEl = root.querySelector(".feed-preview__track");
      const noteEl = root.querySelector("[data-preview-note]");
      const playBtn = root.querySelector("[data-preview-play]");
      if (panel) panel.hidden = !playing;
      if (trackEl && preview) trackEl.textContent = preview.trackName || "Extrait";
      if (noteEl && preview) {
        noteEl.innerHTML = `Extrait : <strong>${escapeHtml(preview.trackName)}</strong> <span class="feed-note">(${escapeHtml(
          preview.albumTitle || ""
        )})</span>`;
      }
      if (playBtn) {
        playBtn.classList.toggle("is-playing", !!playing);
        playBtn.classList.remove("is-loading");
        playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
        const label = playBtn.querySelector("[data-preview-btn-label]");
        if (label) label.textContent = playing ? "Pause" : "Extrait 30 s";
      }
    });
  }

  function stopAlbumPreview() {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.removeAttribute("src");
      previewAudio.load();
    }
    const old = previewAlbumId;
    previewAlbumId = null;
    if (old) updatePreviewUi(old, null, false);
    document.querySelectorAll("[data-preview-play].is-loading").forEach((b) => b.classList.remove("is-loading"));
  }

  async function playAlbumPreview(albumId, opts) {
    const force = opts && opts.force;
    const al = albumById(albumId);
    if (!al) return;
    if (previewAlbumId === albumId && previewAudio && !previewAudio.paused) {
      stopAlbumPreview();
      return;
    }
    stopAlbumPreview();
    document.querySelectorAll(`[data-preview-play="${albumId}"]`).forEach((b) => b.classList.add("is-loading"));
    const preview = await resolveAlbumPreview(al, { force });
    document.querySelectorAll(`[data-preview-play="${albumId}"]`).forEach((b) => b.classList.remove("is-loading"));
    if (!preview) {
      toast("Extrait indisponible pour cet album (Apple Music / Deezer).");
      return;
    }
    const audio = ensurePreviewAudio();
    previewAlbumId = albumId;
    audio.src = preview.url;
    try {
      await audio.play();
    } catch (_) {
      if (!force) {
        invalidateAlbumPreview(albumId);
        return playAlbumPreview(albumId, { force: true });
      }
      previewAlbumId = null;
      toast("Lecture bloquée — réessaie après un clic sur la page.");
      return;
    }
    updatePreviewUi(albumId, preview, true);
  }

  function feedPreviewSectionHtml(al) {
    const cached = getCachedAlbumPreview(al.id, al);
    const src = cached && cached.source === "deezer" ? "Deezer" : "Apple";
    return `<div class="feed-preview" hidden>
      <div class="feed-preview__bar">
        <button type="button" class="feed-preview__stop" data-preview-stop="${escapeHtml(al.id)}" aria-label="Arrêter l’extrait">×</button>
        <div class="feed-preview__progress-wrap" aria-hidden="true"><div class="feed-preview__progress" style="width:0%"></div></div>
        <span class="feed-preview__track">${cached ? escapeHtml(cached.trackName) : ""}</span>
        <button type="button" class="feed-preview__swap" data-preview-swap="${escapeHtml(al.id)}" title="Pas le bon morceau ? Réessayer">↺</button>
        <span class="feed-preview__badge">30 s · ${src}</span>
      </div>
    </div>`;
  }

  function previewNoteHtml(al) {
    const cached = getCachedAlbumPreview(al.id, al);
    if (cached) {
      return `<p class="feed-post__preview-note" data-preview-note="${escapeHtml(al.id)}">Extrait : <strong>${escapeHtml(
        cached.trackName
      )}</strong> <span class="feed-note">(${escapeHtml(al.title)})</span></p>`;
    }
    return `<p class="feed-post__preview-note feed-note" data-preview-note="${escapeHtml(al.id)}">Extrait du 1<sup>er</sup> morceau de <strong>${escapeHtml(
      al.title
    )}</strong></p>`;
  }

  async function tryYoutubeId(artist, title, apiKey) {
    const u = `https://www.googleapis.com/youtube/v3/search?part=id&snippet&type=video&maxResults=1&q=${encodeURIComponent(
      artist + " " + title + " full album"
    )}&key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(u);
    if (!r.ok) return null;
    const j = await r.json();
    const id = j.items && j.items[0] && j.items[0].id && j.items[0].id.videoId;
    return id || null;
  }

  async function mergeRemoteAlbums(q) {
    const ytKey = (state.settings && state.settings.youtubeApiKey) || "";
    const settled = await Promise.allSettled([fetchItunesAlbums(q), fetchDeezerAlbums(q)]);
    const map = new Map();
    for (const s of settled) {
      if (s.status !== "fulfilled") continue;
      for (const row of s.value) {
        const cur = map.get(row.key);
        if (!cur) map.set(row.key, { ...row });
        else {
          if (row.artworkUrl) {
            if (!cur.artworkUrl || (row.fromItunes && !cur.fromItunes)) cur.artworkUrl = row.artworkUrl;
          }
          if (row.apple) cur.apple = row.apple;
          if (row.deezer) cur.deezer = row.deezer;
          if (row.appleCollectionId) cur.appleCollectionId = row.appleCollectionId;
          if (row.deezerAlbumId) cur.deezerAlbumId = row.deezerAlbumId;
          cur.fromItunes = cur.fromItunes || row.fromItunes;
          cur.fromDeezer = cur.fromDeezer || row.fromDeezer;
        }
      }
    }
    const arr = [...map.values()].slice(0, 36);
    if (!arr.length) {
      const failed = settled.filter((s) => s.status === "rejected");
      if (failed.length) throw new Error("Impossible de joindre les catalogues (réseau ou blocage).");
      throw new Error("Aucun album pour cette requête.");
    }
    if (ytKey) {
      await Promise.all(
        arr.slice(0, 10).map(async (row) => {
          try {
            const id = await tryYoutubeId(row.artist, row.title, ytKey);
            if (id) row.youtubeId = id;
          } catch (_) {}
        })
      );
    }
    return arr.map((row) => {
      const links = buildPlatformLinks(row.artist, row.title, row.youtubeId);
      if (row.apple) links.apple = row.apple;
      if (row.deezer) links.deezer = row.deezer;
      return {
        title: row.title,
        artist: row.artist,
        year: row.year,
        artworkUrl: row.artworkUrl || "",
        links,
        appleCollectionId: row.appleCollectionId || null,
        deezerAlbumId: row.deezerAlbumId || null,
        flags: { apple: !!row.fromItunes, deezer: !!row.fromDeezer, yt: !!row.youtubeId },
      };
    });
  }

  function listenLinksHtml(links) {
    const items = [
      ["Apple Music", links.apple],
      ["Deezer", links.deezer],
      ["Spotify", links.spotify],
      ["YouTube", links.youtube],
    ];
    return `<div class="listen-links">${items
      .map(
        ([label, href]) =>
          `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      )
      .join("")}</div>`;
  }

  /** Pastilles compactes pour la vue Bibliothèques (couvertures en avant). */
  function listenPillsHtml(links) {
    const items = [
      ["A", "Apple Music", links.apple],
      ["D", "Deezer", links.deezer],
      ["S", "Spotify", links.spotify],
      ["▶", "YouTube", links.youtube],
    ];
    return `<div class="listen-pills">${items
      .map(
        ([abbr, title, href]) =>
          `<a class="listen-pill" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(
            title
          )}">${escapeHtml(abbr)}</a>`
      )
      .join("")}</div>`;
  }

  function importCatalogHit(hit) {
    const key = normalizeKey(hit.artist, hit.title);
    state.importedAlbums = state.importedAlbums || [];
    const dup = state.importedAlbums.some((a) => normalizeKey(a.artist, a.title) === key);
    if (dup) {
      toast("Cet album est déjà dans ta base locale.");
      const existing = state.importedAlbums.find((a) => normalizeKey(a.artist, a.title) === key);
      if (existing) navigate("album", { albumId: existing.id });
      return;
    }
    const id = "ext-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
    const g = gradientFromKey(id + key);
    const yearNum = parseInt(String(hit.year).replace(/\D/g, ""), 10);
    state.importedAlbums.push({
      id,
      title: hit.title,
      artist: hit.artist,
      year: Number.isFinite(yearNum) ? yearNum : new Date().getFullYear(),
      genre: "Import",
      from: g.from,
      to: g.to,
      artworkUrl: hit.artworkUrl || "",
      links: { ...hit.links },
      appleCollectionId: hit.appleCollectionId || parseAppleCollectionId(hit.links && hit.links.apple) || null,
      deezerAlbumId: hit.deezerAlbumId || parseDeezerAlbumId(hit.links && hit.links.deezer) || null,
    });
    persist();
    toast("Album importé — tu peux le noter comme les autres.");
    navigate("album", { albumId: id });
  }

  function openApiSettingsModal() {
    const cur = (state.settings && state.settings.youtubeApiKey) || "";
    const country = (state.settings && state.settings.musicCountry) || "FR";
    openModal(`<h2>Paramètres API (facultatif)</h2>
      <p class="api-note">Pour résoudre une <strong>vidéo</strong> automatiquement dans la vue Bibliothèques, coller une clé <strong>YouTube Data API v3</strong> (Google Cloud). Stockée uniquement dans ton navigateur.</p>
      <label>Clé API YouTube</label>
      <input type="password" id="yt-key" value="${escapeHtml(cur)}" autocomplete="off" placeholder="AIza…" />
      <label>Boutique Apple Music (extraits)</label>
      <input type="text" id="music-country" value="${escapeHtml(country)}" maxlength="2" placeholder="FR" autocomplete="off" />
      <p class="api-note">Code pays ISO à 2 lettres (ex. FR, BE, CA) pour les extraits iTunes / Apple Music.</p>
      <p style="margin-top:0.75rem">
        <button type="button" class="btn btn-primary" id="yt-save">Enregistrer</button>
        <button type="button" class="btn btn-ghost" id="yt-clear">Effacer la clé</button>
        <button type="button" class="btn btn-ghost" id="yt-cancel">Fermer</button>
      </p>`);
    document.getElementById("yt-cancel").addEventListener("click", closeModal);
    document.getElementById("yt-clear").addEventListener("click", () => {
      state.settings = state.settings || {};
      state.settings.youtubeApiKey = "";
      persist();
      closeModal();
      toast("Clé YouTube effacée.");
      render();
    });
    document.getElementById("yt-save").addEventListener("click", () => {
      state.settings = state.settings || {};
      state.settings.youtubeApiKey = document.getElementById("yt-key").value.trim();
      const cc = document.getElementById("music-country").value.trim().toUpperCase();
      if (cc && /^[A-Z]{2}$/.test(cc)) state.settings.musicCountry = cc;
      persist();
      closeModal();
      toast("Paramètres enregistrés.");
      render();
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Accepte une URL YouTube ou un ID vidéo brut (11 caractères). */
  function extractYoutubeVideoId(input) {
    const s = String(input || "").trim();
    if (!s) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
    try {
      const u = new URL(s, "https://www.youtube.com");
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id.slice(0, 11)) ? id.slice(0, 11) : null;
      }
      if (host === "m.youtube.com" || host.endsWith("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v.slice(0, 11))) return v.slice(0, 11);
        const parts = u.pathname.split("/").filter(Boolean);
        const embedI = parts.indexOf("embed");
        if (embedI >= 0 && parts[embedI + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[embedI + 1].slice(0, 11))) return parts[embedI + 1].slice(0, 11);
        for (const seg of ["live", "shorts"]) {
          const i = parts.indexOf(seg);
          if (i >= 0 && parts[i + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[i + 1].slice(0, 11))) return parts[i + 1].slice(0, 11);
        }
      }
    } catch (_) {}
    return null;
  }

  function normalizeArtistKey(name) {
    try {
      return String(name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    } catch {
      return String(name || "")
        .toLowerCase()
        .trim();
    }
  }

  function normalizeCityKey(c) {
    return normalizeArtistKey(c);
  }

  function ensureSocialArrays() {
    state.friends = state.friends || [];
    state.incomingFriendRequests = state.incomingFriendRequests || [];
    state.outgoingFriendRequests = state.outgoingFriendRequests || [];
    state.favoriteArtists = state.favoriteArtists || [];
    state.notifications = state.notifications || [];
    state.tourAlertSeen = state.tourAlertSeen || [];
    state.feedComments = state.feedComments || [];
    state.shoutouts = state.shoutouts || [];
    state.manualTourDates = state.manualTourDates || [];
    state.invitedPeers = state.invitedPeers || [];
    state.sentInvites = state.sentInvites || [];
  }

  function ensureProfileExtras() {
    state.profile = state.profile || {};
    if (!Array.isArray(state.profile.performanceVideos)) state.profile.performanceVideos = [];
  }

  function ensureAdaptive() {
    state.adaptive = state.adaptive && typeof state.adaptive === "object" ? state.adaptive : defaultAdaptive();
    state.adaptive.nav = state.adaptive.nav && typeof state.adaptive.nav === "object" ? state.adaptive.nav : {};
    state.adaptive.genreInterest =
      state.adaptive.genreInterest && typeof state.adaptive.genreInterest === "object" ? state.adaptive.genreInterest : {};
    if (typeof state.adaptive.listenLogs !== "number" || Number.isNaN(state.adaptive.listenLogs)) state.adaptive.listenLogs = 0;
  }

  function adaptiveTickAfterParse() {
    if ($search.value.trim() && route.view !== "join") return;
    const key =
      route.view === "album" && route.albumId
        ? "album:" + route.albumId
        : route.view === "profile" && route.userId
          ? "profile:" + route.userId
          : route.view === "list" && route.listId
            ? "list:" + route.listId
            : route.view;
    if (key === adaptiveRouteKeySeen) return;
    adaptiveRouteKeySeen = key;
    ensureAdaptive();
    state.adaptive.nav[route.view] = (state.adaptive.nav[route.view] || 0) + 1;
    if (route.view === "album" && route.albumId) {
      const al = albumById(route.albumId);
      if (al && al.genre) state.adaptive.genreInterest[al.genre] = (state.adaptive.genreInterest[al.genre] || 0) + 1;
    }
    persist();
  }

  function sortGenresByAdaptive(genres) {
    ensureAdaptive();
    const scores = state.adaptive.genreInterest || {};
    return [...genres].sort((a, b) => {
      const d = (scores[b] || 0) - (scores[a] || 0);
      if (d !== 0) return d;
      return a.localeCompare(b, "fr");
    });
  }

  function adaptiveBannerHtml() {
    ensureAdaptive();
    const nav = state.adaptive.nav || {};
    const gi = state.adaptive.genreInterest || {};
    const topGenre = Object.entries(gi).sort((a, b) => b[1] - a[1])[0];
    let line = "";
    if (topGenre && topGenre[1] >= 2) {
      line = `Tu explores souvent le genre <strong>${escapeHtml(topGenre[0])}</strong> : on le remonte dans les pastilles <strong>Découvrir</strong>.`;
    } else if ((nav.diary || 0) > (nav.home || 0) && (nav.diary || 0) > 3) {
      line = `Ton <strong>Journal</strong> est un passage clé — Sonar en tient compte pour les suggestions d’albums.`;
    } else if ((nav.libraries || 0) > 5) {
      line = `Les <strong>Bibliothèques</strong> reviennent souvent : la clé YouTube (réglages) peut affiner les liens vidéo.`;
    } else if ((state.adaptive.listenLogs || 0) > 2) {
      line = `Assez d’entrées au journal pour affiner les pistes : Sonar pondère tes genres à partir de tes notes et des disques que tu ouvres.`;
    } else {
      line = `<strong>Sonar</strong> observe tes trajets <em>sur cet appareil</em> (pas de cloud Soundlog) et ajuste l’exploration du catalogue au fil des visites.`;
    }
    return `<aside class="adapt-banner" aria-label="Sonar — adaptation locale">
      <div class="adapt-banner__glyph" aria-hidden="true">◎</div>
      <div class="adapt-banner__body">
        <p class="adapt-banner__kicker">Sonar · adaptation locale</p>
        <p class="adapt-banner__text">${line}</p>
        <p class="adapt-banner__meta">
          <button type="button" class="link" id="btn-adapt-learn-more">Comment ça marche ?</button>
          <span class="adapt-dot">·</span>
          <button type="button" class="link" id="btn-adapt-reset">Réinitialiser l’apprentissage</button>
        </p>
      </div>
    </aside>`;
  }

  function adaptivePickAlbumSuggestion() {
    ensureAdaptive();
    const scored = { ...(state.adaptive.genreInterest || {}) };
    for (const l of state.listenings) {
      if (l.userId !== "me") continue;
      const al = albumById(l.albumId);
      if (!al || !al.genre) continue;
      scored[al.genre] = (scored[al.genre] || 0) + 0.5;
    }
    const ranked = Object.entries(scored).sort((a, b) => b[1] - a[1]);
    const g = ranked.length ? ranked[0][0] : null;
    let pool = allAlbums().filter((a) => !state.listenings.some((item) => item.userId === "me" && item.albumId === a.id));
    if (g) {
      const gpool = pool.filter((a) => a.genre === g);
      if (gpool.length) pool = gpool;
    }
    if (!pool.length) return null;
    const seed = String(state.profile.handle || "x") + ":" + String(g || "all");
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) | 0;
    return pool[Math.abs(h) % pool.length];
  }

  function sonarSuggestHtml() {
    const al = adaptivePickAlbumSuggestion();
    if (!al) return "";
    return `<aside class="feed-side-card feed-side-card--sonar">
      <div class="feed-side-card__kicker">Sonar · suggestion</div>
      <h3 class="feed-side-card__title">Album à creuser</h3>
      <p class="feed-note sonar-suggest-lead">Basé sur tes fiches ouvertes et ton journal (local uniquement).</p>
      <div class="album-card sonar-suggest-card" data-album="${al.id}" style="max-width:168px">
        ${coverHtml(al, true)}
        <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)}</span></div>
      </div>
      <p class="sonar-suggest-actions"><button type="button" class="btn btn-ghost btn-sm" data-album-open="${al.id}">Ouvrir la fiche</button></p>
    </aside>`;
  }

  function openAdaptiveInfoModal() {
    ensureAdaptive();
    const navStr =
      Object.entries(state.adaptive.nav || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([k, v]) => k + ": " + v)
        .join(", ") || "—";
    const genreStr =
      Object.entries(state.adaptive.genreInterest || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([k, v]) => k + " (" + v + ")")
        .join(" · ") || "—";
    openModal(`<h2>Sonar — transparence</h2>
      <p class="feed-note">Ce module <strong>n’est pas</strong> une intelligence artificielle distante et <strong>ne réécrit pas</strong> le site tout seul. Le navigateur enregistre de petits <strong>compteurs</strong> (parcours, genres des disques consultés, écritures au journal). Des <strong>règles fixes</strong> en déduisent l’ordre des genres, une idée d’album et des messages d’accueil.</p>
      <p class="feed-note">Rien de tout cela n’est expédié vers un serveur « auto-apprenant » Soundlog : uniquement ton stockage local.</p>
      <hr style="border:0;border-top:1px solid var(--line);margin:1rem 0" />
      <p class="api-note" style="margin:0"><strong>Instantané</strong><br>Vues : ${escapeHtml(navStr)}<br>Genres (fiches albums) : ${escapeHtml(genreStr)}<br>Écritures journal comptées : ${state.adaptive.listenLogs}</p>
      <p style="margin-top:1rem"><button type="button" class="btn btn-primary" id="adapt-info-close">Fermer</button></p>`);
    document.getElementById("adapt-info-close").addEventListener("click", closeModal);
  }

  function isFriend(userId) {
    ensureSocialArrays();
    return state.friends.includes(userId);
  }

  function incomingRequestFrom(userId) {
    ensureSocialArrays();
    return state.incomingFriendRequests.find((r) => r.fromUserId === userId);
  }

  function outgoingRequestTo(userId) {
    ensureSocialArrays();
    return state.outgoingFriendRequests.find((r) => r.toUserId === userId);
  }

  function addFriend(userId) {
    ensureSocialArrays();
    if (!state.friends.includes(userId)) state.friends.push(userId);
  }

  function removeFriend(userId) {
    ensureSocialArrays();
    state.friends = state.friends.filter((id) => id !== userId);
    state.follows = (state.follows || []).filter((id) => id !== userId);
  }

  function addNotification({ type, title, body, meta }) {
    ensureSocialArrays();
    const id = "n-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    state.notifications.unshift({
      id,
      type: type || "info",
      title: String(title || ""),
      body: String(body || ""),
      read: false,
      at: new Date().toISOString(),
      meta: meta && typeof meta === "object" ? meta : {},
    });
    if (state.notifications.length > 100) state.notifications.length = 100;
    try {
      const desk = state.settings && state.settings.desktopAlerts;
      if (desk && typeof Notification !== "undefined" && Notification.permission === "granted" && title) {
        new Notification(title, { body: String(body || "").slice(0, 200) });
      }
    } catch (_) {}
  }

  function unreadNotificationCount() {
    ensureSocialArrays();
    return state.notifications.filter((n) => !n.read).length;
  }

  function markAllNotificationsRead() {
    ensureSocialArrays();
    state.notifications.forEach((n) => {
      n.read = true;
    });
  }

  function isFavoriteArtist(name) {
    ensureSocialArrays();
    const k = normalizeArtistKey(name);
    return state.favoriteArtists.some((a) => normalizeArtistKey(a) === k);
  }

  function toggleFavoriteArtist(name) {
    ensureSocialArrays();
    const raw = String(name || "").trim();
    if (!raw) return;
    const k = normalizeArtistKey(raw);
    const idx = state.favoriteArtists.findIndex((a) => normalizeArtistKey(a) === k);
    if (idx >= 0) {
      state.favoriteArtists.splice(idx, 1);
      toast("Artiste retiré des favoris (alertes concerts).");
    } else {
      state.favoriteArtists.push(raw);
      toast("Artiste ajouté — tu recevras des alertes pour les dates à proximité.");
    }
    persist();
    render();
  }

  function acceptIncomingFriendRequest(reqId) {
    ensureSocialArrays();
    const req = state.incomingFriendRequests.find((r) => r.id === reqId);
    if (!req) return;
    state.incomingFriendRequests = state.incomingFriendRequests.filter((r) => r.id !== reqId);
    state.outgoingFriendRequests = (state.outgoingFriendRequests || []).filter((r) => r.toUserId !== req.fromUserId);
    addFriend(req.fromUserId);
    if (!(state.follows || []).includes(req.fromUserId)) state.follows.push(req.fromUserId);
    const u = userById(req.fromUserId);
    addNotification({
      type: "friend",
      title: "Demande d’ami acceptée",
      body: u ? `Tu es maintenant ami·e avec ${u.name}.` : "Nouvelle connexion.",
      meta: { userId: req.fromUserId },
    });
    persist();
    toast("Demande acceptée.");
    render();
  }

  function declineIncomingFriendRequest(reqId) {
    ensureSocialArrays();
    state.incomingFriendRequests = state.incomingFriendRequests.filter((r) => r.id !== reqId);
    persist();
    toast("Demande refusée.");
    render();
  }

  function cancelOutgoingFriendRequest(toUserId) {
    ensureSocialArrays();
    state.outgoingFriendRequests = state.outgoingFriendRequests.filter((r) => r.toUserId !== toUserId);
    persist();
    toast("Demande annulée.");
    render();
  }

  /** @param {string} uid */
  function sendFriendRequest(uid) {
    if (uid === "me") return;
    ensureSocialArrays();
    const inc = incomingRequestFrom(uid);
    if (inc) {
      acceptIncomingFriendRequest(inc.id);
      return;
    }
    if (isFriend(uid)) {
      toast("Vous êtes déjà ami·es.");
      return;
    }
    if (outgoingRequestTo(uid)) {
      toast("Demande déjà envoyée.");
      return;
    }
    // Si target est un profil cloud (UUID dans cloudPeers Map), route via Supabase
    const cloudPeer = window.__slCloudPeers && window.__slCloudPeers.get && window.__slCloudPeers.get(uid);
    if (cloudPeer && window.SLCloud && window.SLCloud.isSignedIn && window.SLCloud.isSignedIn()) {
      window.SLCloud.sendFriendRequest(uid).then(() => {
        const id = "fr-cloud-" + Date.now().toString(36);
        state.outgoingFriendRequests.push({ id, toUserId: uid, createdAt: new Date().toISOString(), cloudId: id });
        persist();
        toast("Demande envoyée.");
        render();
      }).catch((e) => { toast("Erreur cloud : " + (e.message || "inconnue")); });
      return;
    }
    const demoIds = new Set(["u1", "u2", "u3"]);
    if (demoIds.has(uid)) {
      state.outgoingFriendRequests = (state.outgoingFriendRequests || []).filter((r) => r.toUserId !== uid);
      addFriend(uid);
      if (!(state.follows || []).includes(uid)) state.follows.push(uid);
      const u = userById(uid);
      addNotification({
        type: "friend",
        title: "Nouvelle connexion",
        body: u ? `Tu es maintenant ami·e avec ${u.name} (démo locale instantanée).` : "Connexion ajoutée.",
        meta: { userId: uid },
      });
      persist();
      toast("Connexion ajoutée — en démo, les profils fictifs acceptent tout de suite.");
      render();
      return;
    }
    const id = "fr-out-" + Date.now().toString(36);
    state.outgoingFriendRequests.push({ id, toUserId: uid, createdAt: new Date().toISOString() });
    persist();
    toast("Demande envoyée (stockée en local).");
    render();
  }

  function tourSeenKey(artist, whenIso, venueLine) {
    return normalizeArtistKey(artist) + "|" + String(whenIso) + "|" + normalizeArtistKey(venueLine);
  }

  function rememberTourAlert(key) {
    ensureSocialArrays();
    if (state.tourAlertSeen.includes(key)) return false;
    state.tourAlertSeen.push(key);
    if (state.tourAlertSeen.length > 400) state.tourAlertSeen.splice(0, state.tourAlertSeen.length - 400);
    return true;
  }

  function eventMatchesUserCity(ev, userCityRaw) {
    const u = normalizeCityKey(userCityRaw);
    if (!u) return true;
    const city = normalizeCityKey(ev.city || ev.venueCity || "");
    const region = normalizeCityKey(ev.region || ev.venueRegion || "");
    const country = normalizeCityKey(ev.country || "");
    return (
      (city && (city.includes(u) || u.includes(city))) ||
      (region && region.includes(u)) ||
      (country && u.length > 3 && country.includes(u))
    );
  }

  function withinAlertWindow(iso) {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return false;
    const now = Date.now();
    const max = now + 365 * 24 * 60 * 60 * 1000;
    return t >= now - 12 * 60 * 60 * 1000 && t <= max;
  }

  function maybeNotifyTour(artist, whenIso, venueName, city, url) {
    const cityLine = [venueName, city].filter(Boolean).join(" — ");
    const key = tourSeenKey(artist, whenIso, cityLine);
    if (!rememberTourAlert(key)) return;
    const whenHuman = whenIso.slice(0, 10);
    const zone = String((state.settings && state.settings.alertCity) || "").trim();
    addNotification({
      type: "show",
      title: `Date pour ${artist}`,
      body: `${whenHuman} · ${cityLine}${zone ? " — filtre ville : " + zone : ""}`,
      meta: { artist, whenIso, url: url || "" },
    });
  }

  async function fetchBandsintownEvents(artistName) {
    const q = encodeURIComponent(artistName);
    const url = viaEdgeProxy(`https://rest.bandsintown.com/artists/${q}/events?app_id=soundlog_web_client&date=upcoming`);
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  }

  function mapBitEvent(ev) {
    const v = ev.venue || {};
    const dt = ev.datetime || ev.starts_at || ev.startsAt || "";
    return {
      datetime: dt,
      venueName: v.name || "",
      city: v.city || "",
      region: v.region || "",
      country: v.country || "",
      url: ev.url || ev.link || "",
    };
  }

  /**
   * @param {{ force?: boolean }} opts
   */
  async function syncTourAlerts(opts) {
    ensureSocialArrays();
    const force = opts && opts.force;
    const now = Date.now();
    if (!force && state.lastTourSyncAt) {
      const prev = new Date(state.lastTourSyncAt).getTime();
      if (Number.isFinite(prev) && now - prev < 45 * 60 * 1000) return;
    }
    const userCity = (state.settings && state.settings.alertCity) || "";
    const favs = [...new Set(state.favoriteArtists.map((a) => String(a).trim()).filter(Boolean))].slice(0, 14);

    for (const row of state.manualTourDates) {
      if (!favs.some((f) => normalizeArtistKey(f) === normalizeArtistKey(row.artist))) continue;
      const m = mapBitEvent({
        datetime: row.datetime,
        venue: { name: row.venue, city: row.city, region: "", country: "" },
        url: row.url,
      });
      if (!withinAlertWindow(m.datetime)) continue;
      if (!eventMatchesUserCity({ city: m.city, region: m.region, country: m.country }, userCity)) continue;
      maybeNotifyTour(row.artist, m.datetime, m.venueName, m.city, m.url);
    }

    for (const artist of favs) {
      try {
        const events = await fetchBandsintownEvents(artist);
        for (const ev of events) {
          const m = mapBitEvent(ev);
          if (!m.datetime || !withinAlertWindow(m.datetime)) continue;
          if (!eventMatchesUserCity({ city: m.city, region: m.region, country: m.country }, userCity)) continue;
          const art = (ev.lineup && ev.lineup[0] && ev.lineup[0].name) || ev.artist_id || artist;
          maybeNotifyTour(String(art || artist), m.datetime, m.venueName, m.city, m.url);
        }
      } catch (_) {
        /* API souvent bloquée hors navigateur ou par rate-limit — dates manuelles restent disponibles */
      }
    }

    state.lastTourSyncAt = new Date().toISOString();
    persist();
    if (force) render();
  }

  function feedCommentsFor(listeningId) {
    ensureSocialArrays();
    return state.feedComments.filter((c) => c.listeningId === listeningId).sort((a, b) => (a.at < b.at ? -1 : 1));
  }

  function albumById(id) {
    return allAlbums().find((a) => a.id === id);
  }

  function hueFromHandle(s) {
    let h = 0;
    const str = String(s || "x");
    for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) | 0;
    return Math.abs(h) % 360;
  }

  function userById(id) {
    if (id === "me") {
      const cloudMe = window.SLCloud && window.SLCloud.me;
      if (cloudMe) {
        return {
          id: "me",
          cloudId: cloudMe.id,
          name: cloudMe.name,
          handle: cloudMe.handle,
          bio: cloudMe.bio || "",
          hue: cloudMe.hue != null ? cloudMe.hue : 152,
        };
      }
      return {
        id: "me",
        name: state.profile.displayName,
        handle: state.profile.handle,
        bio: state.profile.bio,
        hue: 152,
      };
    }
    const peer = (state.invitedPeers || []).find((p) => p.id === id);
    if (peer) {
      return {
        id: peer.id,
        name: peer.name,
        handle: peer.handle,
        bio: peer.bio || "",
        hue: peer.hue != null ? peer.hue : hueFromHandle(peer.handle || peer.name || "x"),
      };
    }
    const cloudPeer = window.__slCloudPeers && window.__slCloudPeers.get && window.__slCloudPeers.get(id);
    if (cloudPeer) {
      return {
        id: cloudPeer.id,
        cloudId: cloudPeer.id,
        name: cloudPeer.name,
        handle: cloudPeer.handle,
        bio: cloudPeer.bio || "",
        hue: cloudPeer.hue != null ? cloudPeer.hue : hueFromHandle(cloudPeer.handle || cloudPeer.name || "x"),
      };
    }
    return USERS.find((u) => u.id === id);
  }

  function inviteBaseUrl() {
    const base = window.location.origin + window.location.pathname.replace(/\/$/, "");
    return base || window.location.href.split("#")[0].replace(/\/$/, "");
  }

  function base64UrlEncodeJson(obj) {
    const json = JSON.stringify(obj);
    const b = btoa(unescape(encodeURIComponent(json)));
    return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlDecodeJson(s) {
    try {
      let b = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
      while (b.length % 4) b += "=";
      const json = decodeURIComponent(escape(atob(b)));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function buildInvitePayload() {
    const token =
      "t" +
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .slice(2, 10);
    const mine = state.listenings.filter((l) => l.userId === "me" && l.albumId).slice(0, 8);
    const s = mine
      .map((l) => ({
        d: l.date,
        a: l.albumId,
        r: l.rating,
        x: l.review ? String(l.review).slice(0, 100) : "",
      }))
      .filter((row) => !!albumById(row.a));
    return { v: 1, n: state.profile.displayName, h: state.profile.handle, t: token, s };
  }

  function peerIdFromInviteToken(t) {
    return "inv-" + String(t).replace(/[^a-zA-Z0-9_-]/g, "");
  }

  function listeningsFromSnapshot(peerId, rows) {
    if (!rows || !Array.isArray(rows)) return [];
    const out = [];
    rows.forEach((row, i) => {
      if (!row || !row.a || !albumById(row.a)) return;
      out.push({
        id: "snap-" + peerId + "-" + i + "-" + Math.random().toString(36).slice(2, 7),
        userId: peerId,
        albumId: row.a,
        date: row.d || new Date().toISOString().slice(0, 10),
        rating: typeof row.r === "number" ? row.r : parseFloat(row.r, 10) || 0,
        review: row.x || "",
      });
    });
    return out;
  }

  function applyInviteToFreshDevice(payload, profileName, profileHandle, profileBio, importSnapshot) {
    const peerId = peerIdFromInviteToken(payload.t);
    const fresh = JSON.parse(JSON.stringify(defaultState()));
    state = fresh;
    state.profile.displayName = profileName.trim() || "Nouveau·elle venu·e";
    state.profile.handle = (profileHandle.trim().replace(/\s+/g, "") || "nouveau").slice(0, 40);
    state.profile.bio = profileBio.trim();
    state.profile.joinedFrom = {
      inviterName: payload.n,
      inviterHandle: payload.h,
      token: payload.t,
      at: new Date().toISOString(),
    };
    state.invitedPeers = [
      {
        id: peerId,
        name: String(payload.n || "Inviteur·rice"),
        handle: String(payload.h || "invite"),
        bio: "",
        hue: hueFromHandle(String(payload.h || "x")),
        fromToken: payload.t,
      },
    ];
    state.follows = [peerId];
    state.friends = [];
    state.incomingFriendRequests = [];
    state.outgoingFriendRequests = [];
    state.listenings = importSnapshot ? listeningsFromSnapshot(peerId, payload.s) : [];
    persist();
    window.location.hash = "";
    toast("Ton carnet local est prêt — rien n’a été envoyé sur Internet.");
    navigate("home");
  }

  function applyInviteMergeIntoCurrent(payload, profileName, profileHandle, profileBio, importSnapshot) {
    ensureSocialArrays();
    const peerId = peerIdFromInviteToken(payload.t);
    if ((state.invitedPeers || []).some((p) => p.id === peerId || p.fromToken === payload.t)) {
      toast("Cette invitation est déjà dans ton carnet.");
      window.location.hash = "";
      navigate("home");
      return;
    }
    state.invitedPeers.push({
      id: peerId,
      name: String(payload.n || "Inviteur·rice"),
      handle: String(payload.h || "invite"),
      bio: "",
      hue: hueFromHandle(String(payload.h || "x")),
      fromToken: payload.t,
    });
    if (!state.follows.includes(peerId)) state.follows.push(peerId);
    if (profileName.trim()) state.profile.displayName = profileName.trim();
    if (profileHandle.trim()) state.profile.handle = profileHandle.trim().replace(/\s+/g, "");
    if (profileBio.trim()) state.profile.bio = profileBio.trim();
    state.profile.joinedFrom = {
      inviterName: payload.n,
      inviterHandle: payload.h,
      token: payload.t,
      at: new Date().toISOString(),
      mode: "merge",
    };
    if (importSnapshot) {
      state.listenings.push(...listeningsFromSnapshot(peerId, payload.s));
    }
    persist();
    window.location.hash = "";
    toast("Inviteur·rice ajouté·e à ton carnet local.");
    navigate("home");
  }

  function openInviteLinkModal() {
    const payload = buildInvitePayload();
    const enc = base64UrlEncodeJson(payload);
    const url = inviteBaseUrl() + "#rejoindre/" + enc;
    state.sentInvites = state.sentInvites || [];
    state.sentInvites.push({
      id: "out-" + payload.t,
      token: payload.t,
      createdAt: new Date().toISOString(),
    });
    persist();
    openModal(`<h2>Lien d’invitation</h2>
      <p class="feed-note">Copie ce lien et envoie-le (message, mail…). La personne ouvre Soundlog sur <strong>son</strong> navigateur : elle crée <strong>sa</strong> base locale. Aucun serveur Soundlog — pas de synchro automatique entre appareils.</p>
      <label>Lien</label>
      <textarea id="invite-url-ta" readonly rows="4" style="width:100%;font-size:0.82rem">${escapeHtml(url)}</textarea>
      <p style="margin-top:0.75rem">
        <button type="button" class="btn btn-primary" id="invite-copy">Copier le lien</button>
        <button type="button" class="btn btn-ghost" id="invite-close">Fermer</button>
      </p>`);
    document.getElementById("invite-close").addEventListener("click", closeModal);
    document.getElementById("invite-copy").addEventListener("click", async () => {
      const ta = document.getElementById("invite-url-ta");
      const text = ta ? ta.value : url;
      try {
        await navigator.clipboard.writeText(text);
        toast("Lien copié.");
      } catch {
        try {
          ta.select();
          document.execCommand("copy");
          toast("Copié (méthode de secours).");
        } catch {
          toast("Copie manuelle depuis la zone de texte.");
        }
      }
    });
  }

  function starString(rating) {
    if (rating == null || rating === 0) return "—";
    let out = "";
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) out += "★";
      else if (rating >= i - 0.5) out += "⯪";
      else out += "☆";
    }
    return out;
  }

  function coverStyle(album) {
    return `background:linear-gradient(135deg,${album.from},${album.to});`;
  }

  function coverHtml(album, small) {
    const lines = (album.title + " ").split(" ").slice(0, 4).join(" ");
    const grad = coverStyle(album);
    const art = album.artworkUrl
      ? `<img class="cover-img" src="${escapeHtml(album.artworkUrl)}" alt="" loading="lazy" onerror="this.remove();this.parentElement.classList.remove('has-img');" />`
      : "";
    const cls = album.artworkUrl ? "cover has-img" : "cover";
    return `<div class="${cls}" style="${grad}" role="img" aria-label="${escapeHtml(album.title)}">${art}<span class="cover-text">${escapeHtml(
      small ? album.title.slice(0, 18) : lines
    )}</span></div>`;
  }

  function toast(msg) {
    $toast.innerHTML = `<div class="toast">${escapeHtml(msg)}</div>`;
    setTimeout(() => {
      $toast.innerHTML = "";
    }, 2400);
  }

  function closeModal() {
    $modal.innerHTML = "";
  }

  function openModal(html) {
    $modal.innerHTML = `<div class="modal-backdrop" id="modal-bd"><div class="modal">${html}</div></div>`;
    document.getElementById("modal-bd").addEventListener("click", (e) => {
      if (e.target.id === "modal-bd") closeModal();
    });
  }

  const NAV_LABELS = {
    home: "Accueil",
    social: "Communauté",
    discover: "Découvrir",
    libraries: "Bibliothèques",
    diary: "Journal",
    lists: "Listes",
    iwas: "I was there !",
    wishlist: "À écouter",
    album: "Album",
    profile: "Profil",
    list: "Liste",
    join: "Invitation",
    search: "Recherche",
  };

  function setNavActive() {
    document.querySelectorAll(".nav-link[data-view]").forEach((b) => {
      b.classList.toggle("active", route.view !== "join" && b.dataset.view === route.view);
    });
    const titleEl = document.getElementById("topbar-title");
    if (titleEl) {
      if ($search.value.trim()) titleEl.textContent = "Recherche";
      else if (route.view === "album") titleEl.textContent = "Album";
      else if (route.view === "profile") titleEl.textContent = "Profil";
      else if (route.view === "list") titleEl.textContent = "Liste";
      else titleEl.textContent = NAV_LABELS[route.view] || "Soundlog";
    }
  }

  function openSidebar() {
    document.body.classList.add("sidebar-open");
    const toggle = document.getElementById("menu-toggle");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.setAttribute("aria-hidden", "false");
    }
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
    const toggle = document.getElementById("menu-toggle");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.setAttribute("aria-hidden", "true");
    }
  }

  function bindMobileShell() {
    const mq = window.matchMedia("(max-width: 1023px)");
    const syncViewport = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    const syncMobile = () => {
      document.body.classList.toggle("is-mobile", mq.matches);
      document.body.classList.toggle(
        "is-touch",
        mq.matches && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
      );
      if (!mq.matches) closeSidebar();
    };
    syncViewport();
    syncMobile();
    mq.addEventListener("change", syncMobile);
    window.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("resize", syncViewport);
  }

  function navigate(view, extra) {
    const pop = document.getElementById("notif-popover");
    const bell = document.getElementById("notif-bell");
    if (pop && bell) {
      pop.hidden = true;
      bell.setAttribute("aria-expanded", "false");
    }
    Object.assign(route, { view, albumId: null, userId: null, listId: null, discoverGenre: null }, extra || {});
    window.location.hash = buildHash();
    render();
  }

  function buildHash() {
    if (route.view === "album" && route.albumId) return `#album/${route.albumId}`;
    if (route.view === "profile" && route.userId) return `#profil/${route.userId}`;
    if (route.view === "list" && route.listId) return `#liste/${route.listId}`;
    if (route.view === "discover" && route.discoverGenre) return `#decouvrir/${encodeURIComponent(route.discoverGenre)}`;
    const map = {
      home: "",
      discover: "decouvrir",
      libraries: "bibliotheques",
      diary: "journal",
      lists: "listes",
      iwas: "i-was-there",
      wishlist: "a-ecouter",
      social: "communaute",
    };
    return "#" + (map[route.view] || "");
  }

  function parseHash() {
    route.albumId = null;
    route.userId = null;
    route.listId = null;
    route.discoverGenre = null;
    route.joinInviteRaw = null;
    const h = (window.location.hash || "#").slice(1);
    if (h.startsWith("album/")) {
      route.view = "album";
      route.albumId = h.slice(6);
    } else if (h.startsWith("profil/")) {
      route.view = "profile";
      route.userId = h.slice(7);
    } else if (h.startsWith("liste/")) {
      route.view = "list";
      route.listId = h.slice(6);
    } else if (h.startsWith("decouvrir/")) {
      route.view = "discover";
      route.discoverGenre = decodeURIComponent(h.slice(10));
    } else if (h === "decouvrir") route.view = "discover";
    else if (h === "bibliotheques") route.view = "libraries";
    else if (h === "journal") route.view = "diary";
    else if (h === "listes") route.view = "lists";
    else if (h === "i-was-there") route.view = "iwas";
    else if (h === "a-ecouter") route.view = "wishlist";
    else if (h === "communaute") route.view = "social";
    else if (h.startsWith("rejoindre/")) {
      route.view = "join";
      route.joinInviteRaw = h.slice("rejoindre/".length);
    } else route.view = "home";
  }

  function avgAlbumRating(albumId) {
    const list = state.listenings.filter((l) => l.albumId === albumId && l.rating);
    if (!list.length) return null;
    const sum = list.reduce((a, l) => a + l.rating, 0);
    return Math.round((sum / list.length) * 10) / 10;
  }

  function feedItems() {
    const ids = new Set(["me", ...state.follows]);
    return state.listenings
      .filter((l) => ids.has(l.userId))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  function concertFeedItems() {
    const ids = new Set(["me", ...state.follows]);
    return (state.concertLogs || [])
      .filter((c) => ids.has(c.userId))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  /**
   * Tampon visuel inspiré des grandes salles (repères textuels, pas de logo officiel).
   * @returns {{ id: string, ring: string, mid: string, sub: string, rot: number }}
   */
  function resolveVenueStamp(c) {
    const s = ((c.venue || "") + " " + (c.city || "")).toLowerCase();
    const themes = [
      { id: "msg", ring: "Madison Square Garden", mid: "MSG", sub: "New York", m: (x) => x.includes("madison") || (x.includes("square garden") && x.includes("york")) },
      { id: "albert", ring: "Royal Albert Hall", mid: "RAH", sub: "London", m: (x) => x.includes("albert hall") || x.includes("royal albert") },
      { id: "wembley", ring: "Wembley Stadium", mid: "WEM", sub: "London", m: (x) => x.includes("wembley") },
      { id: "o2london", ring: "The O₂ Arena", mid: "O₂", sub: "London", m: (x) => (x.includes(" o2") || x.includes("the o2")) && x.includes("london") },
      { id: "olympia", ring: "L'Olympia", mid: "PAR", sub: "Paris", m: (x) => x.includes("olympia") },
      { id: "zenith", ring: "Zénith", mid: "★", sub: "France", m: (x) => x.includes("zénith") || x.includes("zenith") },
      { id: "bercy", ring: "Accor Arena", mid: "PAR", sub: "Paris", m: (x) => x.includes("accor") || x.includes("bercy") || x.includes("popb") },
      { id: "bataclan", ring: "Bataclan", mid: "PAR", sub: "Paris", m: (x) => x.includes("bataclan") },
      { id: "cigale", ring: "La Cigale", mid: "PAR", sub: "Paris", m: (x) => x.includes("cigale") },
      { id: "pleyel", ring: "Salle Pleyel", mid: "PAR", sub: "Paris", m: (x) => x.includes("pleyel") },
      { id: "redrocks", ring: "Red Rocks Amph.", mid: "CO", sub: "Morrison", m: (x) => x.includes("red rock") },
      { id: "hollywood", ring: "Hollywood Bowl", mid: "LA", sub: "California", m: (x) => x.includes("hollywood bowl") },
      { id: "fillmore", ring: "The Fillmore", mid: "SF", sub: "San Francisco", m: (x) => x.includes("fillmore") },
      { id: "apollo", ring: "Apollo Theater", mid: "NYC", sub: "Harlem", m: (x) => x.includes("apollo") },
      { id: "carnegie", ring: "Carnegie Hall", mid: "NYC", sub: "New York", m: (x) => x.includes("carnegie") },
      { id: "bowery", ring: "Bowery Ballroom", mid: "NYC", sub: "New York", m: (x) => x.includes("bowery") },
      { id: "sydney", ring: "Sydney Opera House", mid: "SOH", sub: "Australia", m: (x) => x.includes("sydney") && x.includes("opera") },
      { id: "budokan", ring: "Nippon Budokan", mid: "東京", sub: "Tokyo", m: (x) => x.includes("budokan") },
      { id: "laScala", ring: "Teatro alla Scala", mid: "MIL", sub: "Milano", m: (x) => x.includes("scala") && (x.includes("milano") || x.includes("milan")) },
      { id: "musikverein", ring: "Musikverein", mid: "WIEN", sub: "Vienna", m: (x) => x.includes("musikverein") || x.includes("goldener saal") },
      { id: "elphi", ring: "Elbphilharmonie", mid: "HAM", sub: "Hamburg", m: (x) => x.includes("elbphilharmonie") || x.includes("elphi") },
      { id: "forest", ring: "Forest National", mid: "BRU", sub: "Brussels", m: (x) => x.includes("forest national") || x.includes("vorst") },
      { id: "primavera", ring: "Parc del Fòrum", mid: "BCN", sub: "Barcelona", m: (x) => x.includes("fòrum") || (x.includes("forum") && x.includes("barcelona")) },
      { id: "radiocity", ring: "Radio City Music Hall", mid: "RC", sub: "New York", m: (x) => x.includes("radio city") },
      { id: "greek", ring: "The Greek Theatre", mid: "LA", sub: "Los Angeles", m: (x) => x.includes("greek theatre") },
    ];
    for (const t of themes) {
      if (t.m(s)) return { id: t.id, ring: t.ring, mid: t.mid, sub: t.sub, rot: stampRotation(c.id) };
    }
    const city = (c.city || "").trim();
    const venue = (c.venue || "").trim();
    const mid =
      (venue ? venue.replace(/[^a-zA-ZÀ-ÿ0-9]/g, "").slice(0, 5) : "") || (city ? city.slice(0, 4) : "LIVE");
    const sub = city || venue || "Concert";
    const ring = venue ? venue.slice(0, 22) + (venue.length > 22 ? "…" : "") : "Salle";
    return { id: "generic", ring, mid: mid.toUpperCase() || "★", sub, rot: stampRotation(c.id) };
  }

  function stampRotation(id) {
    let n = 0;
    for (let i = 0; i < String(id).length; i++) n += String(id).charCodeAt(i);
    return (n % 19) - 9;
  }

  function renderIWasThere() {
    const items = concertFeedItems();
    const body =
      items.length === 0
        ? `<div class="passport-empty"><p class="empty">Aucun tampon pour l’instant. Ajoute un concert ou suis d’autres profils pour remplir ton passeport.</p></div>`
        : items
            .map((c) => {
              const u = userById(c.userId);
              if (!u) return "";
              const st = resolveVenueStamp(c);
              const where = [c.venue, c.city].filter(Boolean).join(" · ");
              const del =
                c.userId === "me"
                  ? `<button type="button" class="btn btn-ghost btn-sm" data-del-concert="${escapeHtml(c.id)}">Retirer ce tampon</button>`
                  : "";
              return `<article class="passport-entry" style="--pass-tilt:${(st.rot * 0.15).toFixed(2)}deg">
            <div class="venue-stamp venue-stamp--${escapeHtml(st.id)}" style="--stamp-rot:${st.rot}deg" aria-hidden="true" title="${escapeHtml(st.ring)}">
              <span class="venue-stamp-ring">${escapeHtml(st.ring)}</span>
              <span class="venue-stamp-mid">${escapeHtml(st.mid)}</span>
              <span class="venue-stamp-sub">${escapeHtml(st.sub)}</span>
              <span class="venue-stamp-was">I was there!</span>
            </div>
            <div class="passport-visa">
              <div class="visa-header">
                <span class="visa-badge">ENTRÉE</span>
                <span class="visa-date">${escapeHtml(c.date)}</span>
              </div>
              <div class="visa-line"><span class="visa-k">Voyageur</span> <button type="button" class="link visa-link" data-profile="${u.id}">${escapeHtml(u.name)}</button></div>
              <div class="visa-line"><span class="visa-k">Artiste</span> <strong>${escapeHtml(c.artist)}</strong>${
                c.eventTitle && String(c.eventTitle).trim() ? ` <span class="visa-muted">· ${escapeHtml(c.eventTitle)}</span>` : ""
              }</div>
              <div class="visa-line"><span class="visa-k">Lieu</span> ${escapeHtml(where || "—")}</div>
              ${
                c.notes && String(c.notes).trim()
                  ? `<div class="visa-memo"><span class="visa-k">Mémo</span> ${escapeHtml(c.notes)}</div>`
                  : `<div class="visa-memo visa-muted">Pas de souvenir écrit.</div>`
              }
              <div class="visa-footer">${del}</div>
            </div>
          </article>`;
            })
            .join("");
    return `<div class="iwas-view view-themed">
    <div class="passport-wrap">
      <header class="passport-hero">
        <div class="passport-crest" aria-hidden="true">♫</div>
        <div class="passport-hero-text">
          <p class="passport-kicker">Carnet officiel (fictif) du voyage musical</p>
          <h1 class="passport-title">Passeport musical</h1>
          <p class="passport-lead"><strong>I was there !</strong> — chaque concert laisse un tampon inspiré des plus grandes salles du monde (repères textuels, style philatélique).</p>
          <p><button type="button" class="btn btn-primary" id="btn-add-concert">+ Nouveau tampon</button></p>
        </div>
      </header>
      <div class="passport-page">
        <div class="passport-page-inner">
          <div class="passport-machine">
            <span>SOUNDLOG</span><span class="passport-dots">········</span><span>IWASTHERE</span>
          </div>
          ${body}
        </div>
      </div>
    </div>
    </div>`;
  }

  function renderLibraries() {
    const rowsHtml = (() => {
      if (libraryRemoteLoading) {
        return `<div class="lib-loading" role="status" aria-live="polite">
          <div class="lib-vinyl" aria-hidden="true"></div>
          <p class="lib-loading-text">On fouille les bacs…</p>
          <div class="lib-skel-grid">${Array.from({ length: 8 })
            .map(
              (_, i) =>
                `<div class="lib-skel-card" style="animation-delay:${(i * 0.04).toFixed(2)}s"><div class="lib-skel-cover"></div><div class="lib-skel-line"></div><div class="lib-skel-line short"></div></div>`
            )
            .join("")}</div>
        </div>`;
      }
      if (libraryRemoteError) {
        return `<div class="lib-empty lib-empty--err"><p>${escapeHtml(libraryRemoteError)}</p><p class="feed-note">Vérifie ta connexion ou réessaie dans un instant.</p></div>`;
      }
      const t = libraryQuery.trim();
      if (t.length < 2) {
        return `<div class="lib-empty lib-empty--hint">
          <div class="lib-empty-icon" aria-hidden="true">♫</div>
          <p><strong>2 lettres</strong> suffisent pour faire apparaître des <strong>pochettes</strong> depuis Apple Music &amp; Deezer.</p>
          <p class="feed-note">Ensuite : écoute rapide sur les services, puis « Importer » pour ranger le disque dans Soundlog.</p>
        </div>`;
      }
      if (!libraryRemoteHits.length) {
        return `<div class="lib-empty"><p>Aucun album pour <strong>${escapeHtml(t)}</strong>.</p><p class="feed-note">Essaie un autre mot-clé ou un nom d’artiste.</p></div>`;
      }
      return `<div class="lib-grid">${libraryRemoteHits
        .map((hit, idx) => {
          const g = gradientFromKey(hit.title + hit.artist);
          const fakeAlbum = {
            title: hit.title,
            artist: hit.artist,
            year: hit.year,
            genre: "Import",
            from: g.from,
            to: g.to,
            artworkUrl: hit.artworkUrl,
          };
          const pay = encodeURIComponent(JSON.stringify(hit));
          const tilt = ((idx % 7) - 3) * 0.9;
          const dots = [
            hit.flags.apple ? `<span class="lib-dot lib-dot-apple" title="Trouvé via Apple"></span>` : "",
            hit.flags.deezer ? `<span class="lib-dot lib-dot-deezer" title="Trouvé via Deezer"></span>` : "",
            `<span class="lib-dot lib-dot-spotify" title="Lien Spotify"></span>`,
            `<span class="lib-dot lib-dot-youtube" title="${hit.flags.yt ? "Vidéo YouTube" : "YouTube"}"></span>`,
          ].join("");
          return `<article class="lib-card" style="--lib-tilt:${tilt.toFixed(2)}deg">
          <div class="lib-card-inner">
            <div class="lib-cover-zone">
              <div class="lib-cover-frame">${coverHtml(fakeAlbum, true)}</div>
              <div class="lib-floating-dots" aria-hidden="true">${dots}</div>
              <span class="lib-year-chip">${escapeHtml(String(hit.year))}</span>
            </div>
            <div class="lib-card-body">
              <h3 class="lib-card-title">${escapeHtml(hit.title)}</h3>
              <p class="lib-card-artist">${escapeHtml(hit.artist)}</p>
              ${listenPillsHtml(hit.links)}
              <button type="button" class="btn btn-primary lib-import-btn" data-import-hit="${pay}">Importer</button>
            </div>
          </div>
        </article>`;
        })
        .join("")}</div>`;
    })();
    return `<div class="lib-studio view-libraries-themed">
      <header class="lib-hero">
        <div class="lib-hero-icon" aria-hidden="true">◎</div>
        <div class="lib-hero-copy">
          <p class="lib-hero-kicker">Mode disquaire</p>
          <h1 class="page-title lib-hero-title">Bibliothèques</h1>
          <p class="page-sub lib-hero-sub">Les résultats <strong>Apple Music</strong> et <strong>Deezer</strong> s’affichent en <strong>vraies pochettes</strong>. Spotify et YouTube ouvrent en un clic (recherche ou vidéo si tu as mis une clé YouTube).</p>
        </div>
        <button type="button" class="btn btn-ghost lib-api-btn" id="btn-api-settings">Clé YouTube</button>
      </header>
      <section class="lib-dig-section" aria-label="Recherche">
        <label for="lib-q" class="lib-dig-label">Chercher un album</label>
        <div class="lib-dig-row">
          <span class="lib-dig-glyph" aria-hidden="true"></span>
          <input type="search" id="lib-q" class="library-search lib-dig-input" placeholder="Artiste, album, n’importe quoi…" autocomplete="off" value="${escapeHtml(libraryQuery)}" />
        </div>
        <p class="lib-dig-hint">Astuce : mots simples = plus de covers qui débarquent.</p>
      </section>
      <div id="lib-results" class="lib-results">${rowsHtml}</div>
    </div>`;
  }

  function renderSocial() {
    ensureSocialArrays();
    const zone = String((state.settings && state.settings.alertCity) || "").trim();
    const desk = !!(state.settings && state.settings.desktopAlerts);
    const favChips =
      state.favoriteArtists.length === 0
        ? `<p class="empty">Aucun artiste suivi pour les concerts. Ouvre une fiche album et active « Suivre pour les concerts ».</p>`
        : `<div class="artist-chip-row">${state.favoriteArtists
            .map(
              (a) =>
                `<span class="artist-chip">${escapeHtml(a)}<button type="button" class="chip-x" data-rm-fav="${encodeURIComponent(
                  a
                )}" title="Retirer" aria-label="Retirer">×</button></span>`
            )
            .join("")}</div>`;

    const friendsHtml =
      state.friends.length === 0
        ? `<p class="empty">Pas encore d’ami·e — envoie une demande depuis un profil.</p>`
        : `<div class="social-card-grid">${state.friends
            .map((fid) => {
              const u = userById(fid);
              if (!u) return "";
              return `<div class="social-card">
            <div class="avatar" style="background:hsl(${u.hue},55%,42%)">${escapeHtml(u.name.charAt(0))}</div>
            <div class="social-card-text"><strong>${escapeHtml(u.name)}</strong><span class="feed-note">@${escapeHtml(u.handle)}</span></div>
            <button type="button" class="btn btn-ghost btn-sm" data-profile="${u.id}">Profil</button>
          </div>`;
            })
            .join("")}</div>`;

    const incomingHtml =
      state.incomingFriendRequests.length === 0
        ? `<p class="feed-note">Aucune demande en attente.</p>`
        : `<ul class="req-list">${state.incomingFriendRequests
            .map((r) => {
              const u = userById(r.fromUserId);
              if (!u) return "";
              return `<li class="req-row">
            <span><strong>${escapeHtml(u.name)}</strong> veut être ami·e</span>
            <span>
              <button type="button" class="btn btn-primary btn-sm" data-accept-friend="${escapeHtml(r.id)}">Accepter</button>
              <button type="button" class="btn btn-ghost btn-sm" data-decline-friend="${escapeHtml(r.id)}">Refuser</button>
            </span>
          </li>`;
            })
            .join("")}</ul>`;

    const outgoingHtml =
      state.outgoingFriendRequests.length === 0
        ? `<p class="feed-note">Aucune demande envoyée.</p>`
        : `<ul class="req-list">${state.outgoingFriendRequests
            .map((r) => {
              const u = userById(r.toUserId);
              if (!u) return "";
              return `<li class="req-row">
            <span>En attente chez <strong>${escapeHtml(u.name)}</strong></span>
            <button type="button" class="btn btn-ghost btn-sm" data-cancel-friend-out="${escapeHtml(r.toUserId)}">Annuler</button>
          </li>`;
            })
            .join("")}</ul>`;

    const discoverHtml = USERS.filter((u) => u.id !== "me")
      .map((u) => {
        const fol = (state.follows || []).includes(u.id);
        const fr = isFriend(u.id);
        return `<div class="social-card social-card--wide">
        <div class="avatar" style="background:hsl(${u.hue},55%,42%)">${escapeHtml(u.name.charAt(0))}</div>
        <div class="social-card-text">
          <strong>${escapeHtml(u.name)}</strong>
          <span class="feed-note">@${escapeHtml(u.handle)} — ${escapeHtml(u.bio)}</span>
        </div>
        <div class="social-card-actions">
          <button type="button" class="btn ${fol ? "btn-ghost" : "btn-primary"} btn-sm" data-follow="${u.id}">${fol ? "Abonné" : "Suivre"}</button>
          ${
            fr
              ? `<span class="friend-badge-inline">Ami·e</span>`
              : `<button type="button" class="btn btn-primary btn-sm" data-friend-req="${u.id}">Demande d’ami</button>`
          }
          <button type="button" class="btn btn-ghost btn-sm" data-profile="${u.id}">Profil</button>
        </div>
      </div>`;
      })
      .join("");

    const shoutForm = `<div class="panel shout-panel">
      <h3>Murmures du disquaire</h3>
      <p class="feed-note">Petit pavé public (démo locale) — partagé avec les profils fictifs du carnet.</p>
      <div class="shout-form-row">
        <input type="text" id="social-shout-text" maxlength="280" placeholder="Un mot sur une sortie, une envie…" />
        <button type="button" class="btn btn-primary" id="social-add-shout">Publier</button>
      </div>
      <ul class="shout-list">${(state.shoutouts || [])
        .slice()
        .sort((a, b) => (a.at < b.at ? 1 : -1))
        .slice(0, 12)
        .map((s) => {
          const u = userById(s.userId);
          return `<li><span class="feed-note">${escapeHtml((s.at || "").slice(0, 10))}</span> — <button type="button" class="link" data-profile="${u.id}">${escapeHtml(
            u.name
          )}</button> : ${escapeHtml(s.text)}</li>`;
        })
        .join("")}</ul>
    </div>`;

    const manualRows = (state.manualTourDates || [])
      .slice()
      .sort((a, b) => (a.datetime < b.datetime ? -1 : 1))
      .map(
        (row) =>
          `<tr>
        <td>${escapeHtml(row.artist)}</td>
        <td>${escapeHtml((row.datetime || "").slice(0, 16).replace("T", " "))}</td>
        <td>${escapeHtml(row.venue || "")}</td>
        <td>${escapeHtml(row.city || "")}</td>
        <td><button type="button" class="btn btn-ghost btn-sm" data-rm-manual-tour="${escapeHtml(row.id)}">Retirer</button></td>
      </tr>`
      )
      .join("");

    const sentInv = (state.sentInvites || []).slice().reverse().slice(0, 12);
    const sentInvitesHtml =
      sentInv.length === 0
        ? `<p class="feed-note">Aucun lien généré sur cet appareil pour l’instant.</p>`
        : `<ul class="invite-sent-list">${sentInv
            .map(
              (x) =>
                `<li><span class="feed-note">${escapeHtml((x.createdAt || "").slice(0, 16).replace("T", " "))}</span> — jeton <code>${escapeHtml(
                  String(x.token || "")
                )}</code></li>`
            )
            .join("")}</ul>`;

    const invitePanel = `<section class="panel social-section invite-panel">
      <h2>Inviter quelqu’un (local)</h2>
      <p class="feed-note">Génère un lien à copier (message, mail…). La personne l’ouvre sur <strong>son</strong> navigateur : elle crée <strong>son</strong> carnet local. Aucun serveur Soundlog — pas de synchro automatique entre machines.</p>
      <p><button type="button" class="btn btn-primary" id="btn-open-invite-modal">Créer un lien d’invitation</button></p>
      <h3 style="margin-top:1rem;font-size:1rem">Liens créés sur cet appareil</h3>
      ${sentInvitesHtml}
    </section>`;

    return `<div class="social-hub view-social-themed">
      <header class="social-hero">
        <div>
          <p class="social-kicker">Cercle &amp; alertes</p>
          <h1 class="page-title">Communauté</h1>
          <p class="page-sub">Ami·es, murmures, commentaires sur le fil d’accueil, et <strong>alertes concerts</strong> pour les artistes que tu suis (ville + API Bandsintown quand le navigateur y accède, sinon dates saisies à la main).</p>
        </div>
      </header>

      ${invitePanel}

      <section class="panel social-section">
        <h2>Concerts à proximité</h2>
        <p class="feed-note">On compare les prochaines dates (manuelles ou API) avec ta ville de référence.</p>
        <div class="social-tools">
          <label class="social-inline"><span>Ville / région</span><input type="text" id="social-city" value="${escapeHtml(zone)}" placeholder="ex. Paris" /></label>
          <label class="social-inline social-check"><input type="checkbox" id="social-desk" ${desk ? "checked" : ""} /> <span>Alertes bureau (navigateur)</span></label>
          <button type="button" class="btn btn-ghost btn-sm" id="social-notif-perm">Demander la permission</button>
          <button type="button" class="btn btn-primary" id="social-sync-tours">Vérifier les dates maintenant</button>
        </div>
        ${favChips}
        <h3 style="margin-top:1.25rem">Ajouter une date manuellement</h3>
        <p class="feed-note">Si l’API est bloquée, enregistre ici une annonce (festivals, salles, presse).</p>
        <div class="manual-tour-grid">
          <input type="text" id="social-man-artist" placeholder="Artiste" />
          <input type="datetime-local" id="social-man-date" />
          <input type="text" id="social-man-venue" placeholder="Salle" />
          <input type="text" id="social-man-city" placeholder="Ville" />
        </div>
        <p><button type="button" class="btn btn-primary" id="social-man-add">Ajouter cette date</button></p>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Artiste</th><th>Date</th><th>Lieu</th><th>Ville</th><th></th></tr></thead>
            <tbody>${manualRows || `<tr><td colspan="5" class="empty">Aucune date manuelle.</td></tr>`}</tbody>
          </table>
        </div>
      </section>

      <div class="social-two">
        <section class="panel social-section">
          <h2>Ami·es</h2>
          ${friendsHtml}
          <h3 style="margin-top:1.25rem">Demandes reçues</h3>
          ${incomingHtml}
          <h3 style="margin-top:1.25rem">Demandes envoyées</h3>
          ${outgoingHtml}
        </section>
        <section class="panel social-section">
          <h2>Repérer des profils</h2>
          <div class="social-card-stack">${discoverHtml}</div>
        </section>
      </div>

      ${shoutForm}
    </div>`;
  }

  function renderJoin() {
    const raw = route.joinInviteRaw || "";
    const payload = raw ? base64UrlDecodeJson(raw) : null;
    const ok =
      payload &&
      payload.v === 1 &&
      typeof payload.t === "string" &&
      payload.t.length > 0 &&
      payload.n != null &&
      payload.h != null;
    if (!ok) {
      return `<div class="join-view join-view--err">
        <h1 class="page-title">Lien d’invitation invalide</h1>
        <p class="page-sub">Le fragment d’URL est illisible ou incomplet. Demande un nouveau lien à la personne qui t’invite.</p>
        <p><button type="button" class="btn btn-primary" id="join-goto-home">Retour à l’accueil</button></p>
      </div>`;
    }
    const invName = escapeHtml(String(payload.n || "Ton invité"));
    const invHandle = escapeHtml(String(payload.h || "invite"));
    return `<div class="join-view">
      <header class="join-hero">
        <p class="join-hero__kicker">Invitation locale Soundlog</p>
        <h1 class="page-title join-hero__title">Bienvenue</h1>
        <p class="page-sub join-hero__lead"><strong>${invName}</strong> (@${invHandle}) t’invite à ouvrir ton propre carnet d’écoutes. Chaque navigateur garde <strong>sa propre base</strong> (localStorage) : ce n’est pas un compte en ligne et rien n’est synchronisé automatiquement entre appareils.</p>
      </header>
      <div class="panel join-panel">
        <h2>Créer ton profil local</h2>
        <label for="join-name">Pseudo affiché</label>
        <input type="text" id="join-name" autocomplete="nickname" placeholder="Ton prénom ou surnom" />
        <label for="join-handle">Handle</label>
        <input type="text" id="join-handle" autocomplete="username" placeholder="sans espaces" />
        <label for="join-bio">Bio (optionnel)</label>
        <textarea id="join-bio" rows="2" placeholder="Une ligne sur ton rapport à la musique…"></textarea>
        <label class="join-check"><input type="checkbox" id="join-import" checked /> Importer les dernières notes de ton invité dans ton fil (uniquement les albums reconnus dans Soundlog)</label>
        <fieldset class="join-fieldset">
          <legend class="feed-note">Tu es sur quel appareil ?</legend>
          <label class="join-radio"><input type="radio" name="join-mode" value="fresh" checked /> <span><strong>Carnet neuf</strong> — réinitialise Soundlog sur cette machine et repars avec l’invitation.</span></label>
          <label class="join-radio"><input type="radio" name="join-mode" value="merge" /> <span><strong>Ajouter l’inviteur·rice</strong> à mon carnet actuel (conserve tes données et suit son profil importé).</span></label>
        </fieldset>
        <p class="api-note">« Carnet neuf » remplace tout ce qui était stocké pour Soundlog dans ce navigateur sur ce site.</p>
        <p style="margin-top:0.75rem">
          <button type="button" class="btn btn-primary" id="join-submit">Valider et ouvrir mon carnet</button>
          <button type="button" class="btn btn-ghost" id="join-skip">Ignorer l’invitation</button>
        </p>
      </div>
    </div>`;
  }

  function feedStoryStripHtml() {
    const ids = ["me", ...new Set(state.follows || [])];
    return `<div class="feed-stories" aria-label="Raccourcis profils">
      ${ids
        .map((id) => {
          const u = userById(id);
          if (!u) return "";
          const label = id === "me" ? "Toi" : escapeHtml(u.name.split(/\s+/)[0] || u.name);
          return `<button type="button" class="feed-story" data-profile="${escapeHtml(u.id)}" title="${escapeHtml(u.name)}">
            <span class="feed-story__ring" aria-hidden="true"></span>
            <span class="feed-story__avatar" style="background:hsl(${u.hue},55%,42%)">${escapeHtml(u.name.charAt(0))}</span>
            <span class="feed-story__name">${label}</span>
          </button>`;
        })
        .join("")}
    </div>`;
  }

  function renderHome() {
    const items = feedItems();
    const body =
      items.length === 0
        ? `<div class="feed-empty-card"><p class="feed-empty-card__title">Ton fil est tout calme</p><p class="feed-empty-card__text">Suis des profils dans <strong>Communauté</strong> ou logue une écoute dans le <strong>Journal</strong>.</p></div>`
        : items
            .map((l) => {
              const al = albumById(l.albumId);
              const u = userById(l.userId);
              if (!al || !u) return "";
              const comments = feedCommentsFor(l.id);
              const commentsHtml =
                comments.length === 0
                  ? ""
                  : `<ul class="feed-comment-list">${comments
                      .map((c) => {
                        const cu = userById(c.userId);
                        return `<li><button type="button" class="link" data-profile="${cu.id}">${escapeHtml(cu.name)}</button> — ${escapeHtml(
                          c.text
                        )} <span class="feed-note">${escapeHtml((c.at || "").slice(0, 10))}</span></li>`;
                      })
                      .join("")}</ul>`;
              return `<article class="feed-post" data-album="${al.id}" data-preview-album="${escapeHtml(al.id)}" data-feed-listening-id="${escapeHtml(l.id)}">
            <header class="feed-post__head">
              <span class="feed-post__avatar" style="background:hsl(${u.hue},55%,42%)">${escapeHtml(u.name.charAt(0))}</span>
              <div class="feed-post__who">
                <button type="button" class="feed-post__user" data-profile="${u.id}">${escapeHtml(u.name)}</button>
                <span class="feed-post__verb">a noté un album</span>
              </div>
              <time class="feed-post__time" datetime="${escapeHtml(l.date)}">${escapeHtml(l.date)}</time>
            </header>
            <div class="feed-post__media">${coverHtml(al, false)}</div>
            <div class="feed-post__album">
              <button type="button" class="feed-post__album-title" data-album-open="${al.id}">${escapeHtml(al.title)}</button>
              <span class="feed-post__album-meta">${escapeHtml(al.artist)} · ${al.year}</span>
              ${previewNoteHtml(al)}
            </div>
            <div class="feed-post__stars">${starString(l.rating)}</div>
            ${feedPreviewSectionHtml(al)}
            <div class="feed-post__caption">${l.review ? `<p>${escapeHtml(l.review)}</p>` : `<p class="feed-note feed-post__muted">Pas de critique.</p>`}</div>
            ${commentsHtml}
            <footer class="feed-post__actions">
              <button type="button" class="feed-post__action-btn feed-post__action-btn--preview" data-preview-play="${escapeHtml(al.id)}" aria-pressed="false"><span class="feed-ic feed-ic--play" aria-hidden="true"></span> <span data-preview-btn-label>Extrait 30 s</span></button>
              <button type="button" class="feed-post__action-btn" data-comment-on="${escapeHtml(l.id)}"><span class="feed-ic feed-ic--bubble" aria-hidden="true"></span> Commenter</button>
              <button type="button" class="feed-post__action-btn" data-album-open="${escapeHtml(al.id)}"><span class="feed-ic feed-ic--disc" aria-hidden="true"></span> Fiche album</button>
            </footer>
          </article>`;
            })
            .join("");
    const concerts = concertFeedItems().slice(0, 3);
    const concertTeaser =
      concerts.length === 0
        ? ""
        : `<aside class="feed-side-card">
        <div class="feed-side-card__kicker">En direct du passeport</div>
        <h3 class="feed-side-card__title">I was there !</h3>
        <ul class="feed-side-card__list">
          ${concerts
            .map((c) => {
              const u = userById(c.userId);
              const line = `${c.artist}${c.eventTitle && c.eventTitle.trim() ? " — " + c.eventTitle : ""} · ${c.date}`;
              return `<li><button type="button" class="link" data-profile="${u.id}">${escapeHtml(u.name)}</button> — ${escapeHtml(line)}</li>`;
            })
            .join("")}
        </ul>
        <button type="button" class="btn btn-ghost btn-sm" data-nav-view="iwas">Voir tout</button>
      </aside>`;

    return `<div class="feed-page">
      <header class="feed-page__header">
        <div>
          <h1 class="feed-page__title">Fil</h1>
          <p class="feed-page__lead">Écoutes de ta communauté — style carnet, rythme réseau social.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm feed-page__cta" data-nav-view="social">Communauté</button>
      </header>
      ${feedStoryStripHtml()}
      <div class="feed-layout">
        <div class="feed-stream">${body}</div>
        <div class="feed-side-stack">
          ${adaptiveBannerHtml()}
          ${sonarSuggestHtml()}
          ${concertTeaser}
        </div>
      </div>
    </div>`;
  }

  function renderDiscover() {
    const combined = allAlbums();
    const genreSet = [...new Set(combined.map((a) => a.genre).filter(Boolean))];
    const genres = sortGenresByAdaptive(genreSet);
    const g = route.discoverGenre;
    const filtered = g ? combined.filter((a) => a.genre === g) : combined;
    const chips = genres
      .map(
        (genre) =>
          `<button type="button" class="chip${g === genre ? " active" : ""}" data-genre="${escapeHtml(genre)}">${escapeHtml(
            genre
          )}</button>`
      )
      .join("");
    const grid = filtered
      .map(
        (al) => `<div class="album-card" data-album="${al.id}">
        ${coverHtml(al)}
        <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)} · ${al.year}</span></div>
      </div>`
      )
      .join("");
    return `<div class="discover-view view-themed">
      <div class="discover-hero">
        <p class="discover-hero__kicker">Explorer le catalogue</p>
        <h1 class="page-title discover-hero__title">Découvrir</h1>
        <p class="page-sub discover-hero__sub">Pochettes, genres, imports — comme feuilleter les bacs du magasin. <span class="feed-note">Les pastilles de genre sont réordonnées par <strong>Sonar</strong> selon les disques que tu consultes (local).</span></p>
      </div>
      <div class="chip-row discover-chips"><button type="button" class="chip${!g ? " active" : ""}" data-genre="">Tout</button>${chips}</div>
      <div class="grid-albums discover-grid">${grid}</div>
    </div>`;
  }

  function renderDiary() {
    const mine = state.listenings
      .filter((l) => l.userId === "me")
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    const rows =
      mine.length === 0
        ? `<p class="empty">Ton journal est vide. Ajoute une écoute !</p>`
        : mine
            .map((l) => {
              const al = albumById(l.albumId);
              if (!al) return "";
              return `<article class="feed-item diary-entry" data-album="${al.id}" data-preview-album="${escapeHtml(al.id)}">
          ${coverHtml(al, true)}
          <div class="feed-body">
            <div class="feed-head"><strong>${escapeHtml(l.date)}</strong> — <button type="button" class="link" data-album="${al.id}">${escapeHtml(
                al.title
              )}</button></div>
            <div class="stars">${starString(l.rating)}</div>
            ${previewNoteHtml(al)}
            ${feedPreviewSectionHtml(al)}
            ${l.review ? `<p>${escapeHtml(l.review)}</p>` : ""}
            <button type="button" class="btn btn-ghost btn-sm feed-post__action-btn--preview" data-preview-play="${escapeHtml(al.id)}" aria-pressed="false">Extrait 30 s</button>
            <button type="button" class="btn btn-ghost btn-sm" data-edit-listen="${l.id}">Modifier</button>
            <button type="button" class="btn btn-ghost btn-sm" data-del-listen="${l.id}">Supprimer</button>
          </div>
        </article>`;
            })
            .join("");
    return `<div class="diary-view view-themed">
      <div class="diary-hero">
        <p class="diary-hero__kicker">Carnet daté</p>
        <h1 class="page-title diary-hero__title">Journal d’écoute</h1>
        <p class="page-sub diary-hero__sub">Date, note, critique — chaque ligne est une entrée de ton agenda musical.</p>
        <button type="button" class="btn btn-primary" id="btn-add-listen">+ Logger une écoute</button>
      </div>
      <div class="diary-timeline">
        <div class="diary-timeline__rail" aria-hidden="true"></div>
        <div class="diary-timeline__entries feed">${rows}</div>
      </div>
    </div>`;
  }

  function renderLists() {
    const mine = state.lists.filter((l) => l.userId === "me");
    const others = state.lists.filter((l) => l.userId !== "me");
    const row = (lst) => {
      const u = userById(lst.userId);
      return `<div class="list-row list-shelf-card" data-list="${lst.id}">
        <div><strong>${escapeHtml(lst.title)}</strong> <span class="feed-note">— ${escapeHtml(u.name)} · ${
        lst.albumIds.length
      } albums</span></div>
        <span>›</span>
      </div>`;
    };
    return `<div class="lists-view view-themed">
      <div class="lists-hero">
        <p class="lists-hero__kicker">Collections</p>
        <h1 class="page-title lists-hero__title">Listes</h1>
        <p class="page-sub lists-hero__sub">Tes rangées et celles de la communauté — étiquettes façon dos de boîte.</p>
        <button type="button" class="btn btn-primary" id="btn-new-list">+ Nouvelle liste</button>
      </div>
      <h3 class="lists-section-title">Tes listes</h3>
      <div class="lists-shelf">${mine.length ? mine.map(row).join("") : `<p class="empty">Aucune liste pour l’instant.</p>`}</div>
      <h3 class="lists-section-title">Communauté (démo)</h3>
      <div class="lists-shelf">${others.map(row).join("")}</div>
    </div>`;
  }

  const STOP_WORDS = new Set(
    "le la les un une des de du et ou en au aux ce ces cet cette son sa ses leur leurs mais plus pour que qui dans sur avec sans comme aussi bien très trop tout pas encore jamais donc alors ainsi même moins notre vos nos mon ma mes tu te il elle on nous ils elles est sont était été être avoir faire fait faireai avez avais ai a suis es est etre cest nest sest quoi quand comment pourquoi the and for are but not you all can her was one our out day get has him his how its may new now old see two way who boy did she use many from with that this they them their what when which while about after before into over such than then these those unto upon unto".split(
      /\s+/
    )
  );

  function stripAccents(s) {
    try {
      return String(s)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    } catch {
      return String(s);
    }
  }

  function tokenizeReview(text) {
    if (!text || !String(text).trim()) return [];
    const raw = stripAccents(String(text).toLowerCase()).split(/[^a-z0-9]+/i);
    const out = [];
    for (const w of raw) {
      const t = w.trim();
      if (t.length < 3) continue;
      if (STOP_WORDS.has(t)) continue;
      out.push(t);
    }
    return out;
  }

  /**
   * Suggestions basées sur les écoutes / notes / textes de l’utilisateur (moi).
   * @returns {{ album: object, score: number, reasons: string[] }[]}
   */
  function computeWishlistSuggestions() {
    const mine = state.listenings.filter((l) => l.userId === "me");
    const wish = new Set(state.wishlist || []);
    const listenedIds = new Set(mine.map((l) => l.albumId));

    const genreWeights = {};
    const tokenWeights = {};
    const lovedArtists = new Set();

    for (const l of mine) {
      const al = albumById(l.albumId);
      if (!al) continue;
      const r = Number(l.rating) || 0;
      const hasText = l.review && String(l.review).trim().length > 0;
      const textBoost = hasText ? 1.2 + Math.min(String(l.review).length / 350, 0.9) : 1;
      const base = Math.max(0.25, r) * textBoost;

      if (al.genre) genreWeights[al.genre] = (genreWeights[al.genre] || 0) + base;
      if (r >= 4) lovedArtists.add(stripAccents(String(al.artist)).toLowerCase());
      if (hasText) {
        for (const tok of tokenizeReview(l.review)) {
          tokenWeights[tok] = (tokenWeights[tok] || 0) + base;
        }
      }
    }

    const highYears = [];
    for (const l of mine) {
      if ((Number(l.rating) || 0) < 4) continue;
      const a = albumById(l.albumId);
      if (a && Number.isFinite(a.year)) highYears.push(a.year);
    }
    const eraMid = highYears.length ? highYears.reduce((x, y) => x + y, 0) / highYears.length : null;

    const candidates = [];
    for (const al of allAlbums()) {
      if (wish.has(al.id) || listenedIds.has(al.id)) continue;

      let score = 0;
      const reasons = [];

      if (al.genre && genreWeights[al.genre]) {
        const g = genreWeights[al.genre];
        score += g * 2.35;
        reasons.push(`Tu apprécies le genre « ${al.genre} » (poids ${g.toFixed(1)})`);
      }

      const hay = stripAccents(`${al.title} ${al.artist} ${al.genre || ""}`.toLowerCase());
      for (const [tok, w] of Object.entries(tokenWeights)) {
        if (tok.length < 3) continue;
        if (hay.includes(tok)) {
          score += w * 1.85;
          reasons.push(`Mot « ${tok} » proche de tes critiques`);
        }
      }

      const artKey = stripAccents(String(al.artist)).toLowerCase();
      if (lovedArtists.has(artKey)) {
        score += 6.5;
        reasons.push(`Même artiste qu’un album que tu as bien noté`);
      }

      if (eraMid != null && Number.isFinite(al.year)) {
        const dist = Math.abs(al.year - eraMid);
        if (dist <= 14) {
          const bump = ((14 - dist) / 14) * 2.8;
          score += bump;
          reasons.push(`Période proche de tes favoris (autour de ${Math.round(eraMid)})`);
        }
      }

      if (score > 0.01) {
        const uniq = [...new Set(reasons)].slice(0, 4);
        candidates.push({ album: al, score, reasons: uniq });
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    if (!candidates.length) {
      const pool = allAlbums().filter((a) => !wish.has(a.id) && !listenedIds.has(a.id));
      if (!pool.length) return [];
      const shuffled = pool
        .map((a) => ({ a, s: Math.sin((a.id + "x").split("").reduce((n, c) => n + c.charCodeAt(0), 0)) }))
        .sort((x, y) => x.s - y.s)
        .map((x) => x.a)
        .slice(0, 6);
      return shuffled.map((album) => ({
        album,
        score: 0,
        reasons: ["Pendant que ton profil de goût se construit, voici des pépites du catalogue."],
      }));
    }

    return candidates.slice(0, 10);
  }

  function renderWishlist() {
    const ids = state.wishlist || [];
    const mineCount = state.listenings.filter((l) => l.userId === "me").length;
    const suggestions = computeWishlistSuggestions();

    const suggestHtml = !suggestions.length
      ? `<p class="api-note" style="margin-top:1rem">Aucune suggestion pour l’instant : tout le catalogue disponible est déjà dans ta pile ou ton journal.</p>`
      : `<h2 class="section-title">Suggestions pour toi</h2>
      <p class="page-sub" style="margin-top:0">
        Calculées à partir de <strong>tes notes</strong>, des <strong>genres</strong> que tu favorises, des <strong>mots</strong> extraits de tes critiques (sans envoi vers un serveur) et de la <strong>période</strong> de tes albums préférés.
      </p>
      ${
        mineCount < 2
          ? `<p class="api-note">Ajoute quelques écoutes avec notes (et idéalement une petite critique) pour affiner ces recommandations.</p>`
          : ""
      }
      <div class="suggest-grid">
        ${suggestions
          .map(({ album: al, score, reasons }) => {
            const inW = (state.wishlist || []).includes(al.id);
            return `<div class="suggest-card" data-album="${al.id}">
            ${coverHtml(al, true)}
            <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)}</span></div>
            ${
              score > 0
                ? `<div class="suggest-score">Score ${score.toFixed(1)}</div>`
                : `<div class="suggest-score">Découverte</div>`
            }
            <ul class="suggest-reasons">${reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
            <div class="suggest-actions">
              ${
                inW
                  ? `<span class="feed-note">Déjà dans la pile</span>`
                  : `<button type="button" class="btn btn-primary btn-sm" data-add-wish-suggest="${escapeHtml(al.id)}">+ À écouter</button>`
              }
              <button type="button" class="btn btn-ghost btn-sm" data-album-open="${escapeHtml(al.id)}">Fiche</button>
            </div>
          </div>`;
          })
          .join("")}
      </div>`;

    const grid = ids.length
      ? ids
          .map((id) => {
            const al = albumById(id);
            if (!al) return "";
            return `<div class="album-card" data-album="${al.id}">
          ${coverHtml(al)}
          <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)}</span></div>
          <button type="button" class="btn btn-ghost btn-sm" data-rm-wish="${al.id}">Retirer</button>
        </div>`;
          })
          .join("")
      : `<p class="empty">Ta pile « à écouter » est vide. Ajoute depuis une fiche album ou via les suggestions ci-dessus.</p>`;

    return `<div class="wishlist-view view-themed">
      <div class="wishlist-hero">
        <p class="wishlist-hero__kicker">À déballer plus tard</p>
        <h1 class="page-title wishlist-hero__title">À écouter</h1>
        <p class="page-sub wishlist-hero__sub">Ta pile de disques « pas encore passés sur la platine ».</p>
      </div>
      ${suggestHtml}
      <h2 class="section-title wishlist-pile-title">Ta pile</h2>
      <div class="grid-albums wishlist-pile-grid">${grid}</div>
    </div>`;
  }

  function renderAlbum() {
    const al = albumById(route.albumId);
    if (!al) return `<p class="empty">Album introuvable.</p>`;
    const avg = avgAlbumRating(al.id);
    const reviews = state.listenings
      .filter((l) => l.albumId === al.id && (l.review || l.rating))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const inWish = (state.wishlist || []).includes(al.id);
    const mineListen = state.listenings.find((l) => l.userId === "me" && l.albumId === al.id);

    const favA = isFavoriteArtist(al.artist);
    const favPanel = `<div class="panel">
        <h3>Alertes concerts</h3>
        <p class="feed-note">Suis <strong>${escapeHtml(al.artist)}</strong> pour être notifié·e quand une date proche de ta ville est détectée (API + dates manuelles dans <strong>Communauté</strong>).</p>
        <button type="button" class="btn ${favA ? "btn-ghost" : "btn-primary"}" id="btn-fav-artist">${favA ? "Ne plus suivre (concerts)" : "Suivre pour les concerts"}</button>
      </div>`;

    const side = `<div class="panel">
        <h3>Ton activité</h3>
        ${
          mineListen
            ? `<p>Tu as noté ${starString(mineListen.rating)} le ${escapeHtml(mineListen.date)}</p>
            <button type="button" class="btn btn-ghost btn-sm" data-edit-listen="${mineListen.id}">Modifier</button>`
            : `<p>Tu n’as pas encore loggé cet album.</p>
            <button type="button" class="btn btn-primary" id="btn-log-this">Logger / noter</button>`
        }
        <hr style="border:0;border-top:1px solid var(--border);margin:1rem 0" />
        <button type="button" class="btn ${inWish ? "btn-ghost" : "btn-primary"}" id="btn-wish">${inWish ? "Retirer de la pile" : "+ À écouter"}</button>
      </div>
      ${favPanel}
      <div class="panel">
        <h3>Ajouter à une liste</h3>
        <select id="pick-list" style="width:100%;padding:0.5rem;border-radius:8px;background:var(--bg-elevated);color:var(--text);border:1px solid var(--border)">
          <option value="">Choisir une liste…</option>
          ${state.lists
            .filter((l) => l.userId === "me")
            .map((l) => `<option value="${l.id}">${escapeHtml(l.title)}</option>`)
            .join("")}
        </select>
        <button type="button" class="btn btn-primary" style="margin-top:0.5rem;width:100%" id="btn-add-to-list">Ajouter</button>
      </div>`;

    const revHtml = reviews.length
      ? reviews
          .map((l) => {
            const u = userById(l.userId);
            return `<div class="review-row">
            <button type="button" class="link" data-profile="${u.id}">${escapeHtml(u.name)}</button>
            <span class="stars">${starString(l.rating)}</span>
            <div class="feed-note">${escapeHtml(l.date)}</div>
            ${l.review ? `<p>${escapeHtml(l.review)}</p>` : ""}
          </div>`;
          })
          .join("")
      : `<p class="empty">Pas encore de critiques publiques.</p>`;

    const streamPanel = `<div class="panel album-preview-panel" data-preview-album="${escapeHtml(al.id)}">
        <h3>Extrait &amp; plateformes</h3>
        <p class="feed-note">Extrait officiel ~30&nbsp;s du <strong>1<sup>er</sup> morceau</strong> de <em>${escapeHtml(al.title)}</em> (Apple Music ou Deezer).</p>
        ${previewNoteHtml(al)}
        ${feedPreviewSectionHtml(al)}
        <p style="margin:0.65rem 0 0">
          <button type="button" class="btn btn-primary btn-sm feed-post__action-btn--preview" data-preview-play="${escapeHtml(al.id)}" aria-pressed="false"><span class="feed-ic feed-ic--play" aria-hidden="true"></span> <span data-preview-btn-label>Extrait 30 s</span></button>
        </p>
        <hr style="border:0;border-top:1px solid var(--border);margin:1rem 0" />
        <h4 style="margin:0 0 0.5rem;font-size:0.95rem">Écouter sur les services</h4>
        ${listenLinksHtml(streamingLinksForAlbum(al))}
      </div>`;

    return `<div class="album-detail-view view-themed">
      <div class="album-detail-backdrop" aria-hidden="true"></div>
      <div class="two-col album-detail-grid">
      <div>
        <div class="album-hero">
          ${coverHtml(al)}
          <div>
            <h1 class="page-title" style="margin-bottom:0.25rem">${escapeHtml(al.title)}</h1>
            <p class="page-sub" style="margin:0">${escapeHtml(al.artist)} · ${al.year} · ${escapeHtml(al.genre)}</p>
            <p>Note moyenne Soundlog : <strong class="stars">${avg != null ? starString(avg) + " (" + avg + "/5)" : "—"}</strong></p>
          </div>
        </div>
        ${streamPanel}
        <div class="panel">
          <h3>Critiques & écoutes</h3>
          ${revHtml}
        </div>
      </div>
      <div>${side}</div>
    </div>
    </div>`;
  }

  function performanceVideosForUser(uid) {
    if (uid === "me") {
      ensureProfileExtras();
      return state.profile.performanceVideos;
    }
    const peer = (state.invitedPeers || []).find((p) => p.id === uid);
    if (peer && Array.isArray(peer.performanceVideos)) return peer.performanceVideos;
    return [];
  }

  function perfVideoCardHtml(v, canEdit) {
    const vid = extractYoutubeVideoId(v.videoId);
    if (!vid) return "";
    const title = (v.title && String(v.title).trim()) || "Performance YouTube";
    const watchUrl = "https://www.youtube.com/watch?v=" + encodeURIComponent(vid);
    const thumb = "https://i.ytimg.com/vi/" + encodeURIComponent(vid) + "/mqdefault.jpg";
    const del = canEdit
      ? `<button type="button" class="btn btn-ghost btn-sm" data-del-perf-video="${escapeHtml(v.id)}">Retirer</button>`
      : "";
    const note = v.note && String(v.note).trim() ? `<p class="perf-video-note">${escapeHtml(v.note)}</p>` : "";
    const safeTitle = escapeHtml(title);
    return `<article class="perf-video-card">
      <a class="perf-video-thumb" href="${escapeHtml(watchUrl)}" target="_blank" rel="noopener noreferrer" title="Ouvrir sur YouTube">
        <img src="${escapeHtml(thumb)}" alt="" width="320" height="180" loading="lazy" decoding="async" />
        <span class="perf-video-badge" aria-hidden="true">▶</span>
      </a>
      <div class="perf-video-meta">
        <h4 class="perf-video-title">${safeTitle}</h4>
        ${note}
        <div class="perf-video-actions">
          <a class="btn btn-ghost btn-sm" href="${escapeHtml(watchUrl)}" target="_blank" rel="noopener noreferrer">Ouvrir sur YouTube</a>
          ${del}
        </div>
        <details class="perf-video-details">
          <summary>Lecture sur cette page</summary>
          <div class="perf-video-iframe-wrap">
            <iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(vid)}" title="${safeTitle}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
          </div>
        </details>
      </div>
    </article>`;
  }

  function renderProfile() {
    ensureProfileExtras();
    const uid = route.userId || "me";
    const u = userById(uid);
    if (!u) return `<p class="empty">Profil introuvable.</p>`;
    const listenings = state.listenings.filter((l) => l.userId === uid);
    const myConcerts = (state.concertLogs || []).filter((c) => c.userId === uid);
    const favs = [...new Set(listenings.map((l) => l.albumId))];
    const isMe = uid === "me";
    const stats = {
      albums: favs.length,
      reviews: listenings.filter((l) => l.review && l.review.trim()).length,
      lists: state.lists.filter((l) => l.userId === uid).length,
      concerts: myConcerts.length,
      avg:
        listenings.filter((l) => l.rating).length === 0
          ? "—"
          : (
              listenings.filter((l) => l.rating).reduce((a, l) => a + l.rating, 0) /
              listenings.filter((l) => l.rating).length
            ).toFixed(1),
    };

    ensureSocialArrays();
    let friendBlock = "";
    if (!isMe) {
      const inc = incomingRequestFrom(uid);
      const out = outgoingRequestTo(uid);
      if (isFriend(uid)) {
        friendBlock = `<span class="friend-badge-inline">Ami·e</span> <button type="button" class="btn btn-ghost btn-sm" data-friend-remove="${uid}">Retirer</button>`;
      } else if (inc) {
        friendBlock = `<button type="button" class="btn btn-primary btn-sm" data-accept-friend="${escapeHtml(inc.id)}">Accepter la demande</button> <button type="button" class="btn btn-ghost btn-sm" data-decline-friend="${escapeHtml(inc.id)}">Refuser</button>`;
      } else if (out) {
        friendBlock = `<span class="feed-note">Demande envoyée</span> <button type="button" class="btn btn-ghost btn-sm" data-cancel-friend-out="${uid}">Annuler</button>`;
      } else {
        friendBlock = `<button type="button" class="btn btn-primary btn-sm" data-friend-req="${uid}">Demande d’ami</button>`;
      }
    }

    const followBtn =
      !isMe && uid !== "me"
        ? `<button type="button" class="btn ${state.follows.includes(uid) ? "btn-ghost" : "btn-primary"}" data-follow="${uid}">${
            state.follows.includes(uid) ? "Ne plus suivre" : "Suivre"
          }</button>`
        : `<button type="button" class="btn btn-ghost" id="btn-edit-profile">Modifier le profil</button>`;

    const profileActions = `<div class="profile-actions-row">${followBtn}${friendBlock ? ` <span class="profile-actions-gap"></span> ${friendBlock}` : ""}</div>`;

    const recent = listenings
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 6)
      .map((l) => {
        const al = albumById(l.albumId);
        if (!al) return "";
        return `<div class="album-card" data-album="${al.id}" style="max-width:120px">${coverHtml(al, true)}<div class="album-meta"><span class="stars">${starString(
          l.rating
        )}</span></div></div>`;
      })
      .join("");

    const lists = state.lists
      .filter((l) => l.userId === uid)
      .map(
        (lst) =>
          `<div class="list-row" data-list="${lst.id}"><div><strong>${escapeHtml(lst.title)}</strong> <span class="feed-note">${
            lst.albumIds.length
          } albums</span></div><span>›</span></div>`
      )
      .join("");

    const perfVideos = performanceVideosForUser(uid);
    let perfVideosBlock = "";
    if (perfVideos.length) {
      perfVideosBlock = `<h3 class="profile-section-title">Lives &amp; captations YouTube</h3>
      <p class="feed-note perf-video-lead">${isMe ? "Concerts, sessions live ou captations — depuis une URL YouTube (données locales sur cet appareil)." : "Vidéos mises en avant par ce profil."}</p>
      <div class="perf-video-grid">${perfVideos
        .slice()
        .sort((a, b) => (String(a.addedAt || "") < String(b.addedAt || "") ? 1 : -1))
        .map((v) => perfVideoCardHtml(v, isMe))
        .filter(Boolean)
        .join("")}</div>`;
    } else if (isMe) {
      perfVideosBlock = `<h3 class="profile-section-title">Lives &amp; captations YouTube</h3>
      <p class="feed-note perf-video-lead">Partage une captation ou un live : colle le lien YouTube (watch, youtu.be, /live/, embed). Lecture possible directement sur ton profil.</p>
      <p class="empty perf-video-empty">Aucune vidéo pour l’instant.</p>`;
    }
    if (isMe) {
      perfVideosBlock += `<p class="perf-video-add-wrap"><button type="button" class="btn btn-primary btn-sm" id="btn-add-perf-video">+ Ajouter une vidéo YouTube</button></p>`;
    }

    return `<div class="profile-view view-themed">
      <div class="profile-cover" style="--ph:${u.hue}"></div>
      <div class="profile-sheet">
      <div class="profile-head">
        <div class="avatar profile-head__avatar" style="background:hsl(${u.hue},55%,42%)">${escapeHtml(u.name.charAt(0))}</div>
        <div>
          <h1 class="page-title profile-head__title">${escapeHtml(u.name)}</h1>
          <p class="page-sub profile-head__handle" style="margin:0">@${escapeHtml(u.handle)}</p>
          <p class="profile-head__bio">${escapeHtml(u.bio)}</p>
          ${profileActions}
        </div>
      </div>
      <div class="stats stats-5 profile-stats">
        <div class="stat"><b>${stats.albums}</b><span class="feed-note">albums notés</span></div>
        <div class="stat"><b>${stats.reviews}</b><span class="feed-note">critiques</span></div>
        <div class="stat"><b>${stats.lists}</b><span class="feed-note">listes</span></div>
        <div class="stat"><b>${stats.concerts}</b><span class="feed-note">I was there !</span></div>
        <div class="stat"><b>${stats.avg}</b><span class="feed-note">moyenne</span></div>
      </div>
      ${perfVideosBlock}
      <h3 class="profile-section-title">Écoutes récentes</h3>
      <div class="grid-albums profile-recent-grid">${recent || `<p class="empty">Rien pour l’instant.</p>`}</div>
      <h3 class="profile-section-title">I was there !</h3>
      ${
        myConcerts.length
          ? `<ul class="concert-profile-list">${myConcerts
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map(
                (c) =>
                  `<li><strong>${escapeHtml(c.date)}</strong> — ${escapeHtml(c.artist)}${
                    c.eventTitle && String(c.eventTitle).trim() ? " · " + escapeHtml(c.eventTitle) : ""
                  } <span class="feed-note">(${[c.venue, c.city].filter(Boolean).join(" · ") || "lieu ?"})</span></li>`
              )
              .join("")}</ul>`
          : `<p class="empty" style="padding:1rem">Aucun concert enregistré.</p>`
      }
      ${isMe ? `<p><button type="button" class="btn btn-primary btn-sm" data-nav-view="iwas">+ Ajouter un concert</button></p>` : ""}
      <h3 class="profile-section-title">Listes</h3>
      ${lists || `<p class="empty">Aucune liste.</p>`}
      </div>
    </div>`;
  }

  function renderListDetail() {
    const lst = state.lists.find((l) => l.id === route.listId);
    if (!lst) return `<p class="empty">Liste introuvable.</p>`;
    const u = userById(lst.userId);
    const grid = lst.albumIds
      .map((id) => {
        const al = albumById(id);
        if (!al) return "";
        return `<div class="album-card" data-album="${al.id}">
        ${coverHtml(al)}
        <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)}</span></div>
      </div>`;
      })
      .join("");
    return `<div class="list-detail-view view-themed">
      <div class="list-detail-hero">
        <p class="list-detail-hero__kicker">Liste</p>
        <p class="list-detail-hero__author"><button type="button" class="link" data-profile="${u.id}">@${escapeHtml(u.handle)}</button></p>
        <h1 class="page-title list-detail-hero__title">${escapeHtml(lst.title)}</h1>
        <p class="list-detail-hero__desc">${escapeHtml(lst.description || "")}</p>
      </div>
      <div class="grid-albums list-detail-grid">${grid || `<p class="empty">Liste vide.</p>`}</div>
    </div>`;
  }

  function renderSearchResults(q) {
    const qq = q.trim().toLowerCase();
    if (!qq) return "";
    const res = allAlbums().filter(
      (a) =>
        a.title.toLowerCase().includes(qq) ||
        a.artist.toLowerCase().includes(qq) ||
        (a.genre && a.genre.toLowerCase().includes(qq))
    );
    if (!res.length)
      return `<div class="search-view"><p class="empty">Aucun résultat local pour « ${escapeHtml(q)} ». Essaie l’onglet <strong>Bibliothèques</strong> pour interroger Apple Music et Deezer.</p></div>`;
    return `<div class="search-view view-themed">
      <div class="search-hero">
        <p class="search-hero__kicker">Recherche locale</p>
        <h2 class="page-title search-hero__title">Résultats</h2>
        <p class="page-sub search-hero__sub">Pour « <strong>${escapeHtml(q)}</strong> » — ${res.length} album${res.length > 1 ? "s" : ""}</p>
      </div>
      <div class="grid-albums search-grid">${res
        .map(
          (al) => `<div class="album-card" data-album="${al.id}">
        ${coverHtml(al)}
        <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)}</span></div>
      </div>`
        )
        .join("")}</div></div>`;
  }

  function render() {
    stopAlbumPreview();
    parseHash();
    adaptiveTickAfterParse();
    setNavActive();
    updateHeaderUser();
    let html = "";
    if ($search.value.trim() && route.view !== "join") {
      html = renderSearchResults($search.value);
    } else {
      switch (route.view) {
        case "discover":
          html = renderDiscover();
          break;
        case "libraries":
          html = renderLibraries();
          break;
        case "diary":
          html = renderDiary();
          break;
        case "lists":
          html = renderLists();
          break;
        case "iwas":
          html = renderIWasThere();
          break;
        case "wishlist":
          html = renderWishlist();
          break;
        case "social":
          html = renderSocial();
          break;
        case "join":
          html = renderJoin();
          break;
        case "album":
          html = renderAlbum();
          break;
        case "profile":
          html = renderProfile();
          break;
        case "list":
          html = renderListDetail();
          break;
        default:
          html = renderHome();
      }
    }
    $main.innerHTML = html;
    $main.setAttribute("data-route", $search.value.trim() ? "search" : route.view);
    $main.classList.remove("view-enter");
    void $main.offsetWidth;
    $main.classList.add("view-enter");
    bindMainEvents();
    if (route.view === "libraries") {
      const lq = document.getElementById("lib-q");
      if (lq) {
        requestAnimationFrame(() => {
          const n = lq.value.length;
          lq.focus();
          try {
            lq.setSelectionRange(n, n);
          } catch (_) {}
        });
      }
    }
    updateHeaderNotifications();
    injectCloudShoutoutsBlock();
    injectCloudCommentsButtons();
  }

  // Bloc "Murmures de la communauté" injecté sur la home quand cloud connecté
  function injectCloudShoutoutsBlock() {
    if (!(route.view === "home" || (route.view === "social"))) return;
    if (!window.SLCloud || !window.SLCloud.isSignedIn()) return;
    if (document.getElementById("cloud-shoutouts-block")) return;
    const wrap = document.createElement("section");
    wrap.id = "cloud-shoutouts-block";
    wrap.className = "panel feed-shoutouts";
    wrap.innerHTML = `<div class="feed-shoutouts__header">
        <h2 class="kicker" style="margin:0">Murmures du disquaire</h2>
        <button type="button" class="btn btn-ghost btn-sm" id="cloud-shoutouts-add">Publier</button>
      </div>
      <div id="cloud-shoutouts-list" class="cloud-shoutouts"><p class="feed-note">Chargement…</p></div>`;
    // insertion en tête du main contenu
    const heroEnd = $main.querySelector(".feed-page, .social-hub, .page-title")?.parentElement || $main;
    heroEnd.insertBefore(wrap, $main.firstChild);
    document.getElementById("cloud-shoutouts-add").addEventListener("click", () => {
      if (window.__sl && window.__sl.openShoutout) window.__sl.openShoutout();
    });
    if (window.__sl && window.__sl.cloudShoutouts && window.__sl.cloudShoutouts.length) {
      window.__sl.renderCloudShoutoutsInto(document.getElementById("cloud-shoutouts-list"));
    } else if (window.__sl && window.__sl.refreshShoutouts) {
      window.__sl.refreshShoutouts();
    }
  }

  // Sur le feed home, ajoute un bouton "Commentaires (live)" sur les feed cards quand cloud connecté
  function injectCloudCommentsButtons() {
    if (!window.SLCloud || !window.SLCloud.isSignedIn()) return;
    document.querySelectorAll("[data-feed-listening-id]").forEach((card) => {
      if (card.querySelector("[data-cloud-comments-on]")) return;
      const id = card.getAttribute("data-feed-listening-id");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost btn-sm";
      btn.setAttribute("data-cloud-comments-on", id);
      btn.textContent = "Commentaires en ligne";
      const actions = card.querySelector(".feed-post__actions, .modal-actions") || card;
      btn.className = "feed-post__action-btn";
      actions.appendChild(btn);
    });
  }

  function markNotificationRead(id) {
    ensureSocialArrays();
    const n = state.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  }

  function updateHeaderNotifications() {
    const badge = document.getElementById("notif-badge");
    const pop = document.getElementById("notif-popover");
    if (!badge || !pop) return;
    ensureSocialArrays();
    const n = unreadNotificationCount();
    badge.hidden = n === 0;
    badge.textContent = n > 99 ? "99+" : String(n);
    const rows = state.notifications.slice(0, 28).map((it) => {
      const unreadCls = it.read ? "" : " notif-item--unread";
      const linkShow =
        it.type === "show" && it.meta && it.meta.url
          ? ` <a href="${escapeHtml(it.meta.url)}" target="_blank" rel="noopener noreferrer" class="notif-link">Voir billetterie</a>`
          : "";
      const prof =
        it.meta && it.meta.userId
          ? ` <button type="button" class="link notif-profile" data-profile="${escapeHtml(it.meta.userId)}">Profil</button>`
          : "";
      return `<li class="notif-item${unreadCls}" data-notif-id="${escapeHtml(it.id)}">
        <strong>${escapeHtml(it.title)}</strong>
        <p>${escapeHtml(it.body)}</p>
        <div class="notif-item-meta"><span class="feed-note">${escapeHtml((it.at || "").slice(0, 16).replace("T", " "))}</span>${linkShow}${prof}</div>
      </li>`;
    });
    pop.innerHTML =
      rows.length === 0
        ? `<p class="notif-empty">Aucune notification pour l’instant.</p>`
        : `<ul class="notif-list">${rows.join("")}</ul>
        <p class="notif-footer"><button type="button" class="link" id="notif-mark-read">Tout marquer lu</button> · <button type="button" class="link" data-notif-nav="social">Communauté</button></p>`;
  }

  function bindNotifHub() {
    const wrap = document.getElementById("notif-wrap");
    const bell = document.getElementById("notif-bell");
    const pop = document.getElementById("notif-popover");
    if (!wrap || !bell || !pop || wrap.dataset.bound) return;
    wrap.dataset.bound = "1";
    bell.addEventListener("click", (e) => {
      e.stopPropagation();
      pop.hidden = !pop.hidden;
      bell.setAttribute("aria-expanded", pop.hidden ? "false" : "true");
      if (!pop.hidden) updateHeaderNotifications();
    });
    pop.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.closest("#notif-mark-read")) {
        markAllNotificationsRead();
        persist();
        updateHeaderNotifications();
        return;
      }
      const nav = e.target.closest("[data-notif-nav]");
      if (nav) {
        pop.hidden = true;
        bell.setAttribute("aria-expanded", "false");
        navigate(nav.getAttribute("data-notif-nav"));
        return;
      }
      const pb = e.target.closest(".notif-profile");
      if (pb) {
        pop.hidden = true;
        bell.setAttribute("aria-expanded", "false");
        navigate("profile", { userId: pb.getAttribute("data-profile") });
        return;
      }
      const li = e.target.closest("[data-notif-id]");
      if (li && !e.target.closest("a")) {
        markNotificationRead(li.getAttribute("data-notif-id"));
        persist();
        updateHeaderNotifications();
      }
    });
    document.addEventListener("click", () => {
      pop.hidden = true;
      bell.setAttribute("aria-expanded", "false");
    });
  }

  function updateHeaderUser() {
    const u = userById("me");
    document.getElementById("header-username").textContent = u.name;
    const av = document.getElementById("header-avatar");
    const cloudMe = window.SLCloud && window.SLCloud.me;
    if (cloudMe && cloudMe.avatar_url) {
      av.style.backgroundImage = `url("${cloudMe.avatar_url}")`;
      av.style.backgroundSize = "cover";
      av.style.backgroundPosition = "center";
      av.textContent = "";
      av.style.background = `center / cover no-repeat url("${cloudMe.avatar_url}")`;
    } else {
      av.style.backgroundImage = "";
      av.textContent = u.name.charAt(0).toUpperCase();
      av.style.background = "hsl(" + u.hue + ",55%,42%)";
    }
  }

  function bindMainEvents() {
    $main.querySelectorAll("[data-album]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        const id = el.getAttribute("data-album");
        navigate("album", { albumId: id });
      });
    });
    $main.querySelectorAll("[data-profile]").forEach((el) => {
      el.addEventListener("click", () => {
        navigate("profile", { userId: el.getAttribute("data-profile") });
      });
    });
    $main.querySelectorAll("[data-list]").forEach((el) => {
      el.addEventListener("click", () => navigate("list", { listId: el.getAttribute("data-list") }));
    });
    const btnWish = document.getElementById("btn-wish");
    if (btnWish) {
      btnWish.addEventListener("click", () => {
        const al = albumById(route.albumId);
        const i = state.wishlist.indexOf(al.id);
        if (i >= 0) state.wishlist.splice(i, 1);
        else state.wishlist.push(al.id);
        persist();
        toast(i >= 0 ? "Retiré de la pile." : "Ajouté à « À écouter ».");
        render();
      });
    }
    const addList = document.getElementById("btn-add-to-list");
    if (addList) {
      addList.addEventListener("click", () => {
        const sel = document.getElementById("pick-list");
        const lid = sel.value;
        if (!lid) return toast("Choisis une liste.");
        const lst = state.lists.find((l) => l.id === lid);
        if (lst && !lst.albumIds.includes(route.albumId)) {
          lst.albumIds.push(route.albumId);
          persist();
          toast("Album ajouté à la liste.");
        } else toast("Déjà dans cette liste.");
      });
    }
    const logThis = document.getElementById("btn-log-this");
    if (logThis) logThis.addEventListener("click", () => openListenModal(null, route.albumId));

    document.querySelectorAll("[data-edit-listen]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        openListenModal(b.getAttribute("data-edit-listen"), null);
      });
    });
    document.querySelectorAll("[data-del-listen]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.getAttribute("data-del-listen");
        state.listenings = state.listenings.filter((l) => l.id !== id);
        persist();
        toast("Entrée supprimée.");
        render();
      });
    });
    document.querySelectorAll("[data-rm-wish]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.getAttribute("data-rm-wish");
        state.wishlist = state.wishlist.filter((x) => x !== id);
        persist();
        render();
      });
    });
    document.querySelectorAll("[data-add-wish-suggest]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.getAttribute("data-add-wish-suggest");
        if (!id || (state.wishlist || []).includes(id)) return;
        state.wishlist = state.wishlist || [];
        state.wishlist.push(id);
        persist();
        toast("Ajouté à ta pile « à écouter ».");
        render();
      });
    });
    document.querySelectorAll("[data-album-open]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.getAttribute("data-album-open");
        if (id) navigate("album", { albumId: id });
      });
    });
    document.querySelectorAll("[data-follow]").forEach((b) => {
      b.addEventListener("click", () => {
        const uid = b.getAttribute("data-follow");
        const i = state.follows.indexOf(uid);
        if (i >= 0) state.follows.splice(i, 1);
        else state.follows.push(uid);
        persist();
        render();
      });
    });
    const btnAdd = document.getElementById("btn-add-listen");
    if (btnAdd) btnAdd.addEventListener("click", () => openListenModal(null, null));
    const btnNewList = document.getElementById("btn-new-list");
    if (btnNewList) btnNewList.addEventListener("click", openNewListModal);
    const btnAddConcert = document.getElementById("btn-add-concert");
    if (btnAddConcert) btnAddConcert.addEventListener("click", openAddConcertModal);
    document.querySelectorAll("[data-del-concert]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.getAttribute("data-del-concert");
        state.concertLogs = (state.concertLogs || []).filter((c) => c.id !== id);
        persist();
        toast("Concert retiré.");
        render();
      });
    });
    document.querySelectorAll("[data-nav-view]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const v = b.getAttribute("data-nav-view");
        if (v) navigate(v);
      });
    });
    const btnEditProf = document.getElementById("btn-edit-profile");
    if (btnEditProf) btnEditProf.addEventListener("click", openProfileModal);

    const btnAddPerfVideo = document.getElementById("btn-add-perf-video");
    if (btnAddPerfVideo) btnAddPerfVideo.addEventListener("click", () => openPerformanceVideoModal());
    document.querySelectorAll("[data-del-perf-video]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = b.getAttribute("data-del-perf-video");
        ensureProfileExtras();
        state.profile.performanceVideos = state.profile.performanceVideos.filter((x) => x.id !== id);
        persist();
        toast("Vidéo retirée du profil.");
        render();
      });
    });

    const adaptMore = document.getElementById("btn-adapt-learn-more");
    if (adaptMore) adaptMore.addEventListener("click", () => openAdaptiveInfoModal());
    const adaptReset = document.getElementById("btn-adapt-reset");
    if (adaptReset) {
      adaptReset.addEventListener("click", () => {
        if (!confirm("Effacer les signaux Sonar sur cet appareil ?")) return;
        state.adaptive = defaultAdaptive();
        adaptiveRouteKeySeen =
          route.view === "album" && route.albumId
            ? "album:" + route.albumId
            : route.view === "profile" && route.userId
              ? "profile:" + route.userId
              : route.view === "list" && route.listId
                ? "list:" + route.listId
                : route.view;
        persist();
        toast("Sonar remis à zéro.");
        render();
      });
    }

    $main.querySelectorAll(".chip[data-genre]").forEach((c) => {
      c.addEventListener("click", () => {
        const g = c.getAttribute("data-genre");
        navigate("discover", { discoverGenre: g || null });
      });
    });

    document.querySelectorAll("[data-preview-play]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        void playAlbumPreview(b.getAttribute("data-preview-play"));
      });
    });
    document.querySelectorAll("[data-preview-swap]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.getAttribute("data-preview-swap");
        if (!id) return;
        const al = albumById(id);
        if (!al) return;
        invalidateAlbumPreview(id);
        if (String(al.id).startsWith("ext-")) {
          const imp = (state.importedAlbums || []).find((a) => a.id === al.id);
          if (imp) {
            delete imp.appleCollectionId;
            delete imp.deezerAlbumId;
            persist();
          }
        }
        toast("Recherche d’un autre extrait pour cet album…");
        void playAlbumPreview(id, { force: true });
      });
    });
    document.querySelectorAll("[data-preview-stop]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        stopAlbumPreview();
      });
    });
    document.querySelectorAll("[data-comment-on]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        openCommentModal(b.getAttribute("data-comment-on"));
      });
    });
    document.querySelectorAll("[data-friend-req]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        sendFriendRequest(b.getAttribute("data-friend-req"));
      });
    });
    document.querySelectorAll("[data-friend-remove]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const uid = b.getAttribute("data-friend-remove");
        const u = userById(uid);
        removeFriend(uid);
        addNotification({
          type: "friend",
          title: "Ami·e retiré·e",
          body: u ? `${u.name} a été retiré·e de ta liste.` : "",
          meta: { userId: uid },
        });
        persist();
        toast("Retiré des ami·es.");
        render();
      });
    });
    document.querySelectorAll("[data-accept-friend]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        acceptIncomingFriendRequest(b.getAttribute("data-accept-friend"));
      });
    });
    document.querySelectorAll("[data-decline-friend]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        declineIncomingFriendRequest(b.getAttribute("data-decline-friend"));
      });
    });
    document.querySelectorAll("[data-cancel-friend-out]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        cancelOutgoingFriendRequest(b.getAttribute("data-cancel-friend-out"));
      });
    });
    document.querySelectorAll("[data-rm-fav]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        try {
          const a = decodeURIComponent(b.getAttribute("data-rm-fav"));
          ensureSocialArrays();
          const k = normalizeArtistKey(a);
          state.favoriteArtists = state.favoriteArtists.filter((x) => normalizeArtistKey(x) !== k);
          persist();
          toast("Artiste retiré.");
          render();
        } catch (_) {}
      });
    });
    document.querySelectorAll("[data-rm-manual-tour]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.getAttribute("data-rm-manual-tour");
        state.manualTourDates = (state.manualTourDates || []).filter((x) => x.id !== id);
        persist();
        toast("Date retirée.");
        render();
      });
    });

    const btnFav = document.getElementById("btn-fav-artist");
    if (btnFav) {
      btnFav.addEventListener("click", () => {
        const al = albumById(route.albumId);
        if (al) toggleFavoriteArtist(al.artist);
      });
    }

    const syncTours = document.getElementById("social-sync-tours");
    if (syncTours) {
      syncTours.addEventListener("click", async () => {
        const cityEl = document.getElementById("social-city");
        const deskEl = document.getElementById("social-desk");
        state.settings = state.settings || {};
        if (cityEl) state.settings.alertCity = cityEl.value.trim();
        if (deskEl) state.settings.desktopAlerts = !!deskEl.checked;
        persist();
        toast("Synchronisation des dates…");
        await syncTourAlerts({ force: true });
      });
    }
    const notifPerm = document.getElementById("social-notif-perm");
    if (notifPerm) {
      notifPerm.addEventListener("click", async () => {
        if (typeof Notification === "undefined") return toast("Pas supporté dans ce navigateur.");
        try {
          const p = await Notification.requestPermission();
          if (p === "granted") toast("Tu recevras des alertes bureau quand une date est détectée.");
          else toast("Permission refusée — les alertes restent dans la cloche.");
        } catch (_) {
          toast("Impossible de demander la permission.");
        }
      });
    }
    const addShout = document.getElementById("social-add-shout");
    if (addShout) {
      addShout.addEventListener("click", () => {
        const inp = document.getElementById("social-shout-text");
        const t = (inp && inp.value.trim()) || "";
        if (!t) return toast("Écris quelques mots.");
        ensureSocialArrays();
        state.shoutouts.unshift({
          id: "sh" + Date.now().toString(36),
          userId: "me",
          text: t,
          at: new Date().toISOString(),
        });
        if (inp) inp.value = "";
        persist();
        toast("Murmure publié.");
        render();
      });
    }
    const manAdd = document.getElementById("social-man-add");
    if (manAdd) {
      manAdd.addEventListener("click", () => {
        const artist = (document.getElementById("social-man-artist") && document.getElementById("social-man-artist").value.trim()) || "";
        const dt = document.getElementById("social-man-date") && document.getElementById("social-man-date").value;
        const venue = (document.getElementById("social-man-venue") && document.getElementById("social-man-venue").value.trim()) || "";
        const city = (document.getElementById("social-man-city") && document.getElementById("social-man-city").value.trim()) || "";
        if (!artist || !dt) return toast("Artiste et date sont requis.");
        ensureSocialArrays();
        const iso = dt.length === 16 ? dt + ":00" : dt;
        state.manualTourDates.push({
          id: "mtd-" + Date.now().toString(36),
          artist,
          datetime: iso,
          venue,
          city,
          url: "",
        });
        persist();
        toast("Date enregistrée.");
        render();
      });
    }

    const btnInvite = document.getElementById("btn-open-invite-modal");
    if (btnInvite) btnInvite.addEventListener("click", () => openInviteLinkModal());

    const jh = document.getElementById("join-goto-home");
    if (jh) jh.addEventListener("click", () => navigate("home"));
    const js = document.getElementById("join-skip");
    if (js) js.addEventListener("click", () => navigate("home"));
    const jsub = document.getElementById("join-submit");
    if (jsub) {
      jsub.addEventListener("click", () => {
        const raw = route.joinInviteRaw;
        const payload = raw ? base64UrlDecodeJson(raw) : null;
        if (!payload || payload.v !== 1 || !payload.t) return toast("Lien invalide.");
        const nameEl = document.getElementById("join-name");
        const handleEl = document.getElementById("join-handle");
        const bioEl = document.getElementById("join-bio");
        const impEl = document.getElementById("join-import");
        const name = nameEl ? nameEl.value : "";
        const handle = handleEl ? handleEl.value : "";
        const bio = bioEl ? bioEl.value : "";
        const importSnapshot = !!(impEl && impEl.checked);
        const modeEl = document.querySelector('input[name="join-mode"]:checked');
        const mode = modeEl ? modeEl.value : "fresh";
        if (mode === "merge") applyInviteMergeIntoCurrent(payload, name, handle, bio, importSnapshot);
        else applyInviteToFreshDevice(payload, name, handle, bio, importSnapshot);
      });
    }

    wireLibrarySearch();
  }

  function wireLibrarySearch() {
    const input = document.getElementById("lib-q");
    if (!input) return;
    input.addEventListener("input", () => {
      libraryQuery = input.value;
      clearTimeout(libSearchTimer);
      const t = libraryQuery.trim();
      if (t.length < 2) {
        libraryRemoteHits = [];
        libraryRemoteLoading = false;
        libraryRemoteError = null;
        render();
        return;
      }
      libraryRemoteLoading = true;
      libraryRemoteError = null;
      render();
      libSearchTimer = setTimeout(async () => {
        const q = libraryQuery.trim();
        if (q.length < 2) return;
        try {
          libraryRemoteHits = await mergeRemoteAlbums(q);
          libraryRemoteError = null;
        } catch (e) {
          libraryRemoteHits = [];
          libraryRemoteError = e.message || String(e);
        }
        libraryRemoteLoading = false;
        const h = (window.location.hash || "#").slice(1);
        if (h !== "bibliotheques") return;
        const still = document.getElementById("lib-q");
        if (still && still.value.trim() === q) render();
      }, 480);
    });
    const apiBtn = document.getElementById("btn-api-settings");
    if (apiBtn) apiBtn.addEventListener("click", () => openApiSettingsModal());
    document.querySelectorAll("[data-import-hit]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          const raw = decodeURIComponent(btn.getAttribute("data-import-hit"));
          importCatalogHit(JSON.parse(raw));
        } catch (_) {
          toast("Import impossible (données invalides).");
        }
      });
    });
  }

  function openPerformanceVideoModal() {
    ensureProfileExtras();
    openModal(`<h2>Ajouter une vidéo YouTube</h2>
      <p class="feed-note">Colle l’URL d’un live, d’un concert ou d’une session (youtube.com, youtu.be, lien /live/…). L’aperçu utilise le lecteur YouTube.</p>
      <label for="pv-url">URL ou ID vidéo</label>
      <input type="text" id="pv-url" placeholder="https://www.youtube.com/watch?v=…" autocomplete="off" />
      <label for="pv-title">Titre affiché (optionnel)</label>
      <input type="text" id="pv-title" maxlength="120" placeholder="ex. Live à La Cigale — 2024" />
      <label for="pv-note">Mémo (optionnel)</label>
      <input type="text" id="pv-note" maxlength="200" placeholder="Une ligne sur ce moment…" />
      <p style="margin-top:0.85rem">
        <button type="button" class="btn btn-primary" id="pv-save">Ajouter au profil</button>
        <button type="button" class="btn btn-ghost" id="pv-cancel" style="margin-left:0.5rem">Annuler</button>
      </p>`);
    document.getElementById("pv-cancel").addEventListener("click", closeModal);
    document.getElementById("pv-save").addEventListener("click", () => {
      const raw = (document.getElementById("pv-url") && document.getElementById("pv-url").value) || "";
      const vid = extractYoutubeVideoId(raw);
      if (!vid) return toast("Lien ou ID YouTube non reconnu.");
      ensureProfileExtras();
      if (state.profile.performanceVideos.some((x) => x.videoId === vid)) return toast("Cette vidéo est déjà sur ton profil.");
      if (state.profile.performanceVideos.length >= 20) return toast("Tu peux enregistrer au plus 20 vidéos.");
      const title = (document.getElementById("pv-title") && document.getElementById("pv-title").value.trim()) || "";
      const note = (document.getElementById("pv-note") && document.getElementById("pv-note").value.trim()) || "";
      state.profile.performanceVideos.push({
        id: "pv" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        videoId: vid,
        title,
        note,
        addedAt: new Date().toISOString(),
      });
      persist();
      closeModal();
      toast("Vidéo ajoutée au profil.");
      render();
    });
  }

  function openProfileModal() {
    const zone = String((state.settings && state.settings.alertCity) || "");
    const desk = !!(state.settings && state.settings.desktopAlerts);
    openModal(`<h2>Profil</h2>
      <label>Pseudo affiché</label>
      <input type="text" id="pf-name" value="${escapeHtml(state.profile.displayName)}" />
      <label>Handle</label>
      <input type="text" id="pf-handle" value="${escapeHtml(state.profile.handle)}" />
      <label>Bio</label>
      <textarea id="pf-bio">${escapeHtml(state.profile.bio)}</textarea>
      <hr style="border:0;border-top:1px solid var(--line);margin:1rem 0" />
      <h3 style="margin:0 0 0.5rem;font-size:1rem">Alertes concerts</h3>
      <label>Ville ou région de référence</label>
      <input type="text" id="pf-city" value="${escapeHtml(zone)}" placeholder="ex. Paris, Lyon, Bruxelles…" />
      <label style="display:flex;align-items:center;gap:0.5rem;margin-top:0.65rem">
        <input type="checkbox" id="pf-desk" ${desk ? "checked" : ""} /> Notifications bureau (si le navigateur l’autorise)
      </label>
      <p class="feed-note" style="margin-top:0.5rem">Les dates sont croisées avec <strong>Communauté</strong> (API Bandsintown + saisie manuelle).</p>
      <button type="button" class="btn btn-primary" id="pf-save">Enregistrer</button>
      <button type="button" class="btn btn-ghost" id="pf-cancel" style="margin-left:0.5rem">Annuler</button>`);
    document.getElementById("pf-cancel").addEventListener("click", closeModal);
    document.getElementById("pf-save").addEventListener("click", () => {
      state.profile.displayName = document.getElementById("pf-name").value.trim() || "Toi";
      state.profile.handle = document.getElementById("pf-handle").value.trim().replace(/\s+/g, "") || "moi";
      state.profile.bio = document.getElementById("pf-bio").value.trim();
      state.settings = state.settings || {};
      state.settings.alertCity = document.getElementById("pf-city").value.trim();
      state.settings.desktopAlerts = !!(document.getElementById("pf-desk") && document.getElementById("pf-desk").checked);
      persist();
      closeModal();
      toast("Profil mis à jour.");
      render();
    });
  }

  function openCommentModal(listeningId) {
    openModal(`<h2>Commentaire</h2>
      <p class="feed-note">Réaction sur cette écoute — stockée uniquement dans ton navigateur (démo locale).</p>
      <textarea id="fc-body" rows="4" placeholder="Ton mot…"></textarea>
      <p style="margin-top:0.75rem">
        <button type="button" class="btn btn-primary" id="fc-save">Publier</button>
        <button type="button" class="btn btn-ghost" id="fc-cancel">Annuler</button>
      </p>`);
    document.getElementById("fc-cancel").addEventListener("click", closeModal);
    document.getElementById("fc-save").addEventListener("click", () => {
      const text = document.getElementById("fc-body").value.trim();
      if (!text) return toast("Écris un message.");
      ensureSocialArrays();
      state.feedComments.push({
        id: "fc" + Date.now().toString(36),
        listeningId,
        userId: "me",
        text,
        at: new Date().toISOString(),
      });
      persist();
      closeModal();
      toast("Commentaire ajouté.");
      render();
    });
  }

  function openAddConcertModal() {
    const today = new Date().toISOString().slice(0, 10);
    openModal(`<h2>J’y étais — I was there !</h2>
      <label for="cc-artist">Artiste ou groupe *</label>
      <input type="text" id="cc-artist" placeholder="ex. Christine and the Queens" autocomplete="off" />
      <label for="cc-event">Tournée ou spectacle (optionnel)</label>
      <input type="text" id="cc-event" placeholder="ex. Paranoïa, Angels, True Love Tour" autocomplete="off" />
      <label for="cc-date">Date du concert *</label>
      <input type="date" id="cc-date" value="${today}" />
      <label for="cc-venue">Salle / lieu</label>
      <input type="text" id="cc-venue" placeholder="ex. Olympia" autocomplete="off" />
      <label for="cc-city">Ville</label>
      <input type="text" id="cc-city" placeholder="ex. Paris" autocomplete="off" />
      <label for="cc-notes">Souvenir, setlist…</label>
      <textarea id="cc-notes" placeholder="Ce qui t’a marqué ce soir-là…"></textarea>
      <p style="margin-top:0.5rem">
        <button type="button" class="btn btn-primary" id="cc-save">Enregistrer</button>
        <button type="button" class="btn btn-ghost" id="cc-cancel">Annuler</button>
      </p>`);
    document.getElementById("cc-cancel").addEventListener("click", closeModal);
    document.getElementById("cc-save").addEventListener("click", () => {
      const artist = document.getElementById("cc-artist").value.trim();
      const eventTitle = document.getElementById("cc-event").value.trim();
      const date = document.getElementById("cc-date").value;
      const venue = document.getElementById("cc-venue").value.trim();
      const city = document.getElementById("cc-city").value.trim();
      const notes = document.getElementById("cc-notes").value.trim();
      if (!artist || !date) {
        toast("Artiste et date sont requis.");
        return;
      }
      state.concertLogs = state.concertLogs || [];
      state.concertLogs.push({
        id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        userId: "me",
        artist,
        eventTitle,
        date,
        venue,
        city,
        notes,
      });
      persist();
      closeModal();
      toast("Concert ajouté — I was there !");
      navigate("iwas");
    });
  }

  function openNewListModal() {
    openModal(`<h2>Nouvelle liste</h2>
      <input type="text" id="nl-title" placeholder="Titre" />
      <textarea id="nl-desc" placeholder="Description (optionnel)"></textarea>
      <button type="button" class="btn btn-primary" id="nl-save">Créer</button>
      <button type="button" class="btn btn-ghost" id="nl-cancel" style="margin-left:0.5rem">Annuler</button>`);
    document.getElementById("nl-cancel").addEventListener("click", closeModal);
    document.getElementById("nl-save").addEventListener("click", () => {
      const title = document.getElementById("nl-title").value.trim();
      if (!title) return toast("Ajoute un titre.");
      const id = "L" + Date.now();
      state.lists.push({
        id,
        userId: "me",
        title,
        description: document.getElementById("nl-desc").value.trim(),
        albumIds: [],
      });
      persist();
      closeModal();
      toast("Liste créée.");
      navigate("list", { listId: id });
    });
  }

  function openListenModal(editId, presetAlbumId) {
    const existing = editId ? state.listenings.find((l) => l.id === editId) : null;
    const albumOptions = allAlbums()
      .map((a) => {
      const sel =
        (existing && existing.albumId === a.id) || (!existing && presetAlbumId === a.id) ? " selected" : "";
      return `<option value="${a.id}"${sel}>${escapeHtml(a.title)} — ${escapeHtml(a.artist)}</option>`;
    }).join("");
    const today = new Date().toISOString().slice(0, 10);
    openModal(`<h2>${existing ? "Modifier l’écoute" : "Logger une écoute"}</h2>
      <label>Album</label>
      <select id="ln-album" style="width:100%;padding:0.5rem;border-radius:8px;margin-bottom:0.75rem;background:var(--bg-elevated);color:var(--text);border:1px solid var(--border)">${albumOptions}</select>
      <label>Date</label>
      <input type="date" id="ln-date" value="${existing ? existing.date : today}" />
      <label>Note (clique pour 0.5 à 5)</label>
      <div class="star-picker" id="ln-stars"></div>
      <input type="hidden" id="ln-rating" value="${existing ? existing.rating : 4}" />
      <label>Critique (optionnel)</label>
      <textarea id="ln-review" placeholder="Ton avis…">${existing && existing.review ? escapeHtml(existing.review) : ""}</textarea>
      <button type="button" class="btn btn-primary" id="ln-save">${existing ? "Mettre à jour" : "Enregistrer"}</button>
      <button type="button" class="btn btn-ghost" id="ln-cancel" style="margin-left:0.5rem">Annuler</button>`);
    const hid = document.getElementById("ln-rating");
    const wrap = document.getElementById("ln-stars");
    const steps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
    function paintStars() {
      const r = parseFloat(hid.value, 10);
      wrap.innerHTML = steps
        .map(
          (s) =>
            `<button type="button" data-s="${s}" class="${r >= s ? "on" : ""}">${s % 1 ? "½" : Math.floor(s)}</button>`
        )
        .join("");
      wrap.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          hid.value = btn.getAttribute("data-s");
          paintStars();
        });
      });
    }
    paintStars();
    document.getElementById("ln-cancel").addEventListener("click", closeModal);
    document.getElementById("ln-save").addEventListener("click", () => {
      const albumId = document.getElementById("ln-album").value;
      const date = document.getElementById("ln-date").value;
      const rating = parseFloat(document.getElementById("ln-rating").value, 10);
      const review = document.getElementById("ln-review").value.trim();
      if (!albumId || !date) return toast("Album et date requis.");
      if (existing) {
        existing.albumId = albumId;
        existing.date = date;
        existing.rating = rating;
        existing.review = review;
      } else {
        const dup = state.listenings.find((l) => l.userId === "me" && l.albumId === albumId);
        if (dup) {
          dup.date = date;
          dup.rating = rating;
          dup.review = review;
        } else {
          state.listenings.push({
            id: "l" + Date.now(),
            userId: "me",
            albumId,
            date,
            rating,
            review,
          });
        }
      }
      ensureAdaptive();
      state.adaptive.listenLogs = (state.adaptive.listenLogs || 0) + 1;
      persist();
      closeModal();
      toast("Journal mis à jour.");
      navigate("diary");
    });
  }

  function bindShellNavigation() {
    document.querySelectorAll("#sidebar-nav, #bottom-nav").forEach((nav) => {
      nav.addEventListener("click", (e) => {
        const btn = e.target.closest(".nav-link[data-view]");
        if (btn) {
          navigate(btn.dataset.view);
          if (window.matchMedia("(max-width: 1023px)").matches) closeSidebar();
          return;
        }
        if (e.target.closest("#nav-more, .nav-link--menu")) {
          openSidebar();
        }
      });
    });
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        if (document.body.classList.contains("sidebar-open")) closeSidebar();
        else openSidebar();
      });
    }
    const backdrop = document.getElementById("sidebar-backdrop");
    if (backdrop) backdrop.addEventListener("click", () => closeSidebar());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("sidebar-open")) closeSidebar();
    });
  }

  bindMobileShell();
  bindShellNavigation();
  document.getElementById("logo-link").addEventListener("click", (e) => {
    e.preventDefault();
    $search.value = "";
    navigate("home");
  });
  const userChip = document.getElementById("user-chip");
  userChip.addEventListener("click", () => navigate("profile", { userId: "me" }));
  userChip.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate("profile", { userId: "me" });
    }
  });
  $search.addEventListener("input", () => render());
  $search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      $search.value = "";
      render();
    }
  });

  window.addEventListener("hashchange", () => {
    $search.value = "";
    render();
  });

  bindNotifHub();
  render();
  void syncTourAlerts({}).then(() => updateHeaderNotifications());

  // =======================================================================
  // Intégration cloud (Supabase) — non-invasive
  // =======================================================================
  const SLCloud = window.SLCloud;
  const cloudPeers = new Map();
  window.__slCloudPeers = cloudPeers;

  function syncMeFromCloud() {
    if (!SLCloud || !SLCloud.me) return;
    state.profile = {
      ...state.profile,
      displayName: SLCloud.me.name,
      handle: SLCloud.me.handle,
      bio: SLCloud.me.bio || "",
      cloudId: SLCloud.me.id,
    };
    persistLocalOnly();
    updateHeaderUser();
    updateSidebarAccount();
  }

  function persistLocalOnly() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  // Debounced cloud push (exposé pour persist())
  let cloudPushTimer = null;
  function schedulePushCloud() {
    if (!SLCloud || !SLCloud.isSignedIn || !SLCloud.isSignedIn()) return;
    clearTimeout(cloudPushTimer);
    cloudPushTimer = setTimeout(pushCloudFull, 800);
  }
  window.__slSchedulePushCloud = schedulePushCloud;
  async function pushCloudFull() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    const cloudId = SLCloud.me.id;
    try {
      // 1. Albums référencés par les écoutes/listes/wishlist : upsert dans le catalogue partagé
      const referencedAlbumIds = new Set();
      state.listenings.filter((l) => l.userId === "me").forEach((l) => referencedAlbumIds.add(l.albumId));
      state.lists.filter((l) => l.userId === "me").forEach((l) => (l.albumIds || []).forEach((a) => referencedAlbumIds.add(a)));
      (state.wishlist || []).forEach((a) => referencedAlbumIds.add(a));
      for (const aid of referencedAlbumIds) {
        const al = albumById(aid);
        if (al) await SLCloud.upsertAlbum(al);
      }
      // 2. Écoutes
      for (const l of state.listenings.filter((l) => l.userId === "me")) {
        await SLCloud.upsertListening({
          id: l.id,
          userId: cloudId,
          albumId: l.albumId,
          rating: l.rating,
          comment: l.comment,
          commentAt: l.commentAt,
          date: l.date,
        });
      }
      // 3. Listes
      for (const lst of state.lists.filter((l) => l.userId === "me")) {
        await SLCloud.upsertList({
          id: lst.id,
          userId: cloudId,
          title: lst.title,
          description: lst.description,
          isPublic: lst.isPublic !== false,
          albumIds: lst.albumIds || [],
        });
      }
      // 4. Concerts
      for (const c of (state.concertLogs || []).filter((c) => c.userId === "me")) {
        await SLCloud.upsertConcert({
          id: c.id,
          userId: cloudId,
          artist: c.artist,
          date: c.date,
          venue: c.venue,
          city: c.city,
          eventTitle: c.eventTitle,
          notes: c.notes,
        });
      }
      // 5. Wishlist : reset+insert
      const remoteWishlist = new Set(await SLCloud.listWishlist(cloudId));
      const localWishlist = new Set(state.wishlist || []);
      for (const aid of localWishlist) if (!remoteWishlist.has(aid)) await SLCloud.addToWishlist(aid);
      for (const aid of remoteWishlist) if (!localWishlist.has(aid)) await SLCloud.removeFromWishlist(aid);
    } catch (e) {
      console.warn("[cloud push] failed", e);
    }
  }

  // Initial pull au login
  async function pullCloudIntoState() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    const cloudId = SLCloud.me.id;
    const data = await SLCloud.pullEverything();
    if (!data) return;
    // Profil → state.profile
    state.profile.displayName = SLCloud.me.name;
    state.profile.handle = SLCloud.me.handle;
    state.profile.bio = SLCloud.me.bio || "";
    state.profile.cloudId = cloudId;
    // Albums référencés : on les ajoute en cache local (importedAlbums) si pas déjà connus
    const knownIds = new Set();
    state.listenings = [];
    for (const l of data.listenings || []) {
      knownIds.add(l.album_id);
      state.listenings.push({
        id: l.id,
        userId: "me",
        albumId: l.album_id,
        rating: l.rating,
        comment: l.comment,
        commentAt: l.comment_at,
        date: l.date,
      });
    }
    state.lists = (data.lists || []).map((lst) => ({
      id: lst.id,
      userId: "me",
      title: lst.title,
      description: lst.description,
      isPublic: lst.is_public,
      albumIds: ((lst.list_items || []).sort((a, b) => (a.position || 0) - (b.position || 0)).map((it) => it.album_id)),
    }));
    state.concertLogs = (data.concerts || []).map((c) => ({
      id: c.id,
      userId: "me",
      artist: c.artist,
      date: c.date,
      venue: c.venue,
      city: c.city,
      eventTitle: c.event_title,
      notes: c.notes,
    }));
    state.wishlist = data.wishlist || [];
    state.follows = data.following || [];
    // Pull metadata for unknown albums
    for (const aid of knownIds) {
      if (!albumById(aid)) {
        const remote = await SLCloud.getAlbumById(aid);
        if (remote) {
          state.importedAlbums = state.importedAlbums || [];
          state.importedAlbums.push({
            id: remote.id,
            title: remote.title,
            artist: remote.artist,
            year: remote.year,
            genre: remote.genre,
            artworkUrl: remote.artwork_url,
            appleCollectionId: remote.apple_collection_id,
            deezerAlbumId: remote.deezer_album_id,
          });
        }
      }
    }
    persistLocalOnly();
    updateHeaderUser();
    updateSidebarAccount();
    render();
  }

  function updateSidebarAccount() {
    const btn = document.getElementById("sidebar-account");
    const label = document.getElementById("sidebar-account-label");
    const note = document.getElementById("sidebar-note");
    if (!btn) return;
    if (!SLCloud || !SLCloud.available) {
      btn.style.display = "none";
      if (note) note.textContent = "Mode invité — données locales sur cet appareil.";
      return;
    }
    btn.style.display = "";
    if (SLCloud.isSignedIn() && SLCloud.me) {
      btn.classList.add("is-signed-in");
      label.innerHTML = `<span>${escapeHtml(SLCloud.me.name)}</span><small>@${escapeHtml(SLCloud.me.handle)} · gérer</small>`;
      if (note) note.textContent = "Synchronisé · accessible sur tous tes appareils.";
    } else {
      btn.classList.remove("is-signed-in");
      label.innerHTML = `<span>Se connecter</span><small>ou créer un compte</small>`;
      if (note) note.textContent = "Mode invité — clique « Se connecter » pour synchroniser.";
    }
  }

  function openAccountModal(initialTab) {
    const signedIn = SLCloud && SLCloud.isSignedIn() && SLCloud.me;
    const tab = initialTab || (signedIn ? "profile" : "signin");
    const tabsHtml = signedIn
      ? `<div class="auth-tabs"><button type="button" class="auth-tab is-active" data-auth-tab="profile">Mon profil</button><button type="button" class="auth-tab" data-auth-tab="signout">Déconnexion</button></div>`
      : `<div class="auth-tabs"><button type="button" class="auth-tab ${tab === "signin" ? "is-active" : ""}" data-auth-tab="signin">Connexion</button><button type="button" class="auth-tab ${tab === "signup" ? "is-active" : ""}" data-auth-tab="signup">Inscription</button></div>`;

    openModal(`<h2>Compte Soundlog</h2>
      <p class="feed-note">${
        signedIn
          ? "Tu es connecté·e — tes écoutes, listes et concerts sont sauvegardés sur tous tes appareils."
          : "Crée un compte pour retrouver ton carnet sur tous tes appareils et rencontrer la communauté."
      }</p>
      ${tabsHtml}
      <div id="auth-panel"></div>`);

    function renderPanel(which) {
      const panel = document.getElementById("auth-panel");
      if (!panel) return;
      if (which === "signin") {
        panel.innerHTML = `
          <label>Email <input type="email" id="auth-email" autocomplete="email" /></label>
          <label>Mot de passe <input type="password" id="auth-pw" autocomplete="current-password" /></label>
          <p class="auth-error" id="auth-err" hidden></p>
          <p class="modal-actions">
            <button type="button" class="btn btn-primary" id="auth-do-signin">Se connecter</button>
            <button type="button" class="btn btn-ghost" id="auth-do-magic">Recevoir un lien magique</button>
            <button type="button" class="btn btn-ghost" id="auth-cancel">Fermer</button>
          </p>`;
        document.getElementById("auth-cancel").addEventListener("click", closeModal);
        document.getElementById("auth-do-signin").addEventListener("click", async () => {
          const email = document.getElementById("auth-email").value.trim();
          const pw = document.getElementById("auth-pw").value;
          if (!email || !pw) return showAuthErr("Email + mot de passe requis.");
          try {
            await SLCloud.signIn({ email, password: pw });
            toast("Connecté·e !");
            closeModal();
            await pullCloudIntoState();
            updateSidebarAccount();
          } catch (e) {
            showAuthErr(e.message || "Connexion impossible.");
          }
        });
        document.getElementById("auth-do-magic").addEventListener("click", async () => {
          const email = document.getElementById("auth-email").value.trim();
          if (!email) return showAuthErr("Email requis.");
          try {
            await SLCloud.signInWithMagicLink({ email });
            toast("Lien envoyé — clique-le dans ta boîte mail.");
          } catch (e) {
            showAuthErr(e.message || "Envoi impossible.");
          }
        });
      } else if (which === "signup") {
        panel.innerHTML = `
          <label>Handle (a-z, 0-9, _, -, .) <input type="text" id="auth-handle" autocomplete="username" /></label>
          <label>Nom affiché <input type="text" id="auth-name" /></label>
          <label>Email <input type="email" id="auth-email" autocomplete="email" /></label>
          <label>Mot de passe (8+ caractères) <input type="password" id="auth-pw" autocomplete="new-password" /></label>
          <p class="auth-error" id="auth-err" hidden></p>
          <p class="modal-actions">
            <button type="button" class="btn btn-primary" id="auth-do-signup">Créer le compte</button>
            <button type="button" class="btn btn-ghost" id="auth-cancel">Fermer</button>
          </p>`;
        document.getElementById("auth-cancel").addEventListener("click", closeModal);
        document.getElementById("auth-do-signup").addEventListener("click", async () => {
          const handle = document.getElementById("auth-handle").value.trim().toLowerCase();
          const name = document.getElementById("auth-name").value.trim();
          const email = document.getElementById("auth-email").value.trim();
          const pw = document.getElementById("auth-pw").value;
          if (!handle || !name || !email || !pw) return showAuthErr("Tous les champs sont requis.");
          if (pw.length < 8) return showAuthErr("Le mot de passe doit faire 8 caractères ou plus.");
          if (!/^[a-z0-9_.\-]{2,32}$/.test(handle)) return showAuthErr("Handle invalide.");
          try {
            await SLCloud.signUp({ email, password: pw, handle, name, hue: state.profile && hueFromHandle(handle) });
            toast("Compte créé !");
            closeModal();
            await pushCloudFull(); // pousse l'état local existant vers le nouveau compte
            await pullCloudIntoState();
            updateSidebarAccount();
          } catch (e) {
            showAuthErr(e.message || "Inscription impossible.");
          }
        });
      } else if (which === "profile") {
        const me = SLCloud.me;
        panel.innerHTML = `
          <div class="profile-avatar-row">
            ${me.avatar_url
              ? `<img class="avatar-preview" src="${escapeHtml(me.avatar_url)}" alt="Avatar de ${escapeHtml(me.name)}" />`
              : `<div class="avatar-preview avatar-preview--placeholder" style="background:hsl(${me.hue || 220},55%,50%)">${escapeHtml((me.name||"?").slice(0,1).toUpperCase())}</div>`}
            <button type="button" class="btn btn-ghost btn-sm" id="profile-avatar-btn">Changer mon avatar</button>
          </div>
          <label>Nom affiché <input type="text" id="auth-name" value="${escapeHtml(me.name)}" /></label>
          <label>Handle <input type="text" id="auth-handle" value="${escapeHtml(me.handle)}" /></label>
          <label>Bio <textarea id="auth-bio">${escapeHtml(me.bio || "")}</textarea></label>
          <label>Ville / région <input type="text" id="auth-city" value="${escapeHtml(me.city || "")}" /></label>
          <p class="feed-note">Email : <strong>${escapeHtml((SLCloud.session && SLCloud.session.user && SLCloud.session.user.email) || "—")}</strong></p>
          <p class="auth-error" id="auth-err" hidden></p>
          <p class="modal-actions">
            <button type="button" class="btn btn-primary" id="auth-save">Enregistrer</button>
            <button type="button" class="btn btn-ghost" id="auth-cancel">Fermer</button>
          </p>
          <hr />
          <h3 class="kicker">Plus</h3>
          <p class="modal-actions modal-actions--wrap">
            <button type="button" class="btn btn-ghost" id="profile-open-stats">Mes statistiques</button>
            <button type="button" class="btn btn-primary" id="profile-open-imports">Importer mes playlists</button>
            <button type="button" class="btn btn-ghost" id="profile-post-shoutout">Publier un murmure</button>
          </p>`;
        document.getElementById("profile-avatar-btn").addEventListener("click", () => { closeModal(); (window.__sl && window.__sl.openAvatar)(); });
        document.getElementById("profile-open-stats").addEventListener("click", () => { closeModal(); (window.__sl && window.__sl.openStats)(); });
        document.getElementById("profile-open-imports").addEventListener("click", () => { closeModal(); openPlatformPickerModal(); });
        document.getElementById("profile-post-shoutout").addEventListener("click", () => { closeModal(); openShoutoutModal(); });
        document.getElementById("auth-cancel").addEventListener("click", closeModal);
        document.getElementById("auth-save").addEventListener("click", async () => {
          const patch = {
            name: document.getElementById("auth-name").value.trim(),
            handle: document.getElementById("auth-handle").value.trim().toLowerCase(),
            bio: document.getElementById("auth-bio").value.trim(),
            city: document.getElementById("auth-city").value.trim(),
          };
          try {
            await SLCloud.updateProfile(patch);
            syncMeFromCloud();
            toast("Profil mis à jour.");
            closeModal();
            render();
          } catch (e) {
            showAuthErr(e.message || "Mise à jour impossible.");
          }
        });
      } else if (which === "signout") {
        panel.innerHTML = `
          <p>Tu vas être déconnecté·e. Tes données restent disponibles en mode invité sur cet appareil.</p>
          <p class="modal-actions">
            <button type="button" class="btn btn-danger" id="auth-do-signout">Se déconnecter</button>
            <button type="button" class="btn btn-ghost" id="auth-cancel">Annuler</button>
          </p>`;
        document.getElementById("auth-cancel").addEventListener("click", closeModal);
        document.getElementById("auth-do-signout").addEventListener("click", async () => {
          await SLCloud.signOut();
          toast("Déconnecté·e.");
          updateSidebarAccount();
          closeModal();
          render();
        });
      }
    }

    function showAuthErr(msg) {
      const el = document.getElementById("auth-err");
      if (el) { el.textContent = msg; el.hidden = false; }
    }

    document.querySelectorAll("[data-auth-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-auth-tab]").forEach((b) => b.classList.toggle("is-active", b === btn));
        renderPanel(btn.getAttribute("data-auth-tab"));
      });
    });

    renderPanel(tab);
  }

  window.openAccountModal = openAccountModal; // permettre des hooks externes (debug)

  // Brancher le bouton "Compte" de la sidebar
  const sidebarAccount = document.getElementById("sidebar-account");
  if (sidebarAccount) {
    sidebarAccount.addEventListener("click", (e) => {
      e.preventDefault();
      if (!SLCloud || !SLCloud.available) {
        toast("Cloud non configuré — voir BACKEND.md");
        return;
      }
      openAccountModal();
    });
  }

  // Réagir aux changements d'auth
  if (SLCloud && SLCloud.on) {
    SLCloud.on(async (evt) => {
      if (evt === "ready" || evt === "auth") {
        if (SLCloud.isSignedIn()) await pullCloudIntoState();
        updateSidebarAccount();
        updateHeaderUser();
      } else if (evt === "profile") {
        syncMeFromCloud();
        render();
      }
    });
  }

  updateSidebarAccount();

  // Charger les profils cloud et les fusionner dans l'annuaire local
  async function refreshCloudPeers() {
    if (!SLCloud || !SLCloud.ready) return;
    try {
      const profiles = await SLCloud.searchProfiles("", 50);
      cloudPeers.clear();
      for (const p of profiles) if (!SLCloud.me || p.id !== SLCloud.me.id) cloudPeers.set(p.id, p);
    } catch (e) {
      console.warn("[cloud peers]", e);
    }
  }
  if (SLCloud && SLCloud.available) {
    setTimeout(refreshCloudPeers, 1200);
    setInterval(refreshCloudPeers, 60000);
  }

  // =======================================================================
  // Realtime, commentaires, shoutouts, avatars, stats, Spotify import
  // =======================================================================
  const cloudShoutouts = [];
  let realtimeChannel = null;

  function setupRealtimeHooks() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    if (realtimeChannel) SLCloud.unsubscribe(realtimeChannel);
    realtimeChannel = SLCloud.realtimeSubscribe({
      onListening: (p) => {
        if (p.eventType !== "INSERT") return;
        // si c'est une écoute d'un·e ami·e, on toast & on rafraîchit le fil
        const newRow = p.new || {};
        if (newRow.user_id === SLCloud.me.id) return;
        const peer = cloudPeers.get(newRow.user_id);
        if (peer) toast(`${peer.name} vient de noter un album.`);
        scheduleSoftRender();
      },
      onComment: (p) => {
        if (p.eventType !== "INSERT") return;
        const newRow = p.new || {};
        // si commentaire sur une de mes écoutes
        const mine = state.listenings.find((l) => l.id === newRow.listening_id);
        if (mine && newRow.author_id !== SLCloud.me.id) {
          const peer = cloudPeers.get(newRow.author_id);
          toast(`${peer ? peer.name : "Quelqu'un"} a commenté ton écoute.`);
          addNotification({
            type: "comment",
            title: "Nouveau commentaire",
            body: (peer ? peer.name : "Un·e ami·e") + " : " + (newRow.text || "").slice(0, 80),
            meta: { listeningId: newRow.listening_id },
          });
          updateHeaderNotifications();
        }
        if (currentCommentsListeningId === newRow.listening_id) refreshCommentsPanel();
      },
      onShoutout: (p) => {
        if (p.eventType !== "INSERT") return;
        refreshCloudShoutouts();
      },
      onFriendRequest: (p) => {
        if (p.eventType !== "INSERT") return;
        const newRow = p.new || {};
        if (newRow.to_user_id === SLCloud.me.id) {
          const peer = cloudPeers.get(newRow.from_user_id);
          toast(`${peer ? peer.name : "Quelqu'un"} t'a envoyé une demande d'ami.`);
          addNotification({
            type: "friend",
            title: "Demande d'ami",
            body: (peer ? peer.name : "Un·e utilisateur·trice") + " veut se connecter.",
          });
          updateHeaderNotifications();
        }
      },
    });
  }

  let softRenderTimer = null;
  function scheduleSoftRender() {
    clearTimeout(softRenderTimer);
    softRenderTimer = setTimeout(() => { try { render(); } catch (_) {} }, 600);
  }

  async function refreshCloudShoutouts() {
    if (!SLCloud || !SLCloud.ready) return;
    try {
      const list = await SLCloud.listShoutouts(25);
      cloudShoutouts.length = 0;
      cloudShoutouts.push(...list);
      const node = document.getElementById("cloud-shoutouts-list");
      if (node) renderCloudShoutoutsInto(node);
    } catch (e) { console.warn("[shoutouts]", e); }
  }

  function renderCloudShoutoutsInto(node) {
    if (!cloudShoutouts.length) {
      node.innerHTML = `<p class="feed-note">Personne n'a encore murmuré aujourd'hui. Sois la première voix.</p>`;
      return;
    }
    node.innerHTML = cloudShoutouts.slice(0, 8).map((s) => {
      const author = s.profiles || {};
      const initials = (author.name || "?").slice(0, 1).toUpperCase();
      return `<article class="cloud-shoutout">
        <span class="cloud-shoutout__avatar" style="background:hsl(${author.hue || 220},55%,50%)">${escapeHtml(initials)}</span>
        <div class="cloud-shoutout__body">
          <strong>${escapeHtml(author.name || "?")}</strong>
          <span class="cloud-shoutout__time">${timeAgo(s.created_at)}</span>
          <p>${escapeHtml(s.text)}</p>
        </div>
      </article>`;
    }).join("");
  }

  function timeAgo(iso) {
    const t = new Date(iso).getTime();
    const d = Date.now() - t;
    if (d < 60000) return "à l'instant";
    if (d < 3600000) return Math.floor(d / 60000) + " min";
    if (d < 86400000) return Math.floor(d / 3600000) + " h";
    return Math.floor(d / 86400000) + " j";
  }

  // ---------- Commentaires cross-appareils ----------
  let currentCommentsListeningId = null;
  async function openCloudCommentsModal(listeningId) {
    if (!SLCloud || !SLCloud.isSignedIn()) {
      toast("Connecte-toi pour commenter en ligne.");
      return;
    }
    currentCommentsListeningId = listeningId;
    openModal(`<h2>Commentaires</h2>
      <div id="cloud-comments-list" class="cloud-comments"><p class="feed-note">Chargement…</p></div>
      <form id="cloud-comment-form" class="cloud-comment-form">
        <label class="visually-hidden" for="cloud-comment-input">Ton commentaire</label>
        <textarea id="cloud-comment-input" placeholder="Ajouter un commentaire (max 800 caractères)" maxlength="800" rows="3"></textarea>
        <p class="modal-actions">
          <button type="submit" class="btn btn-primary">Publier</button>
          <button type="button" class="btn btn-ghost" id="cloud-comments-close">Fermer</button>
        </p>
      </form>`);
    document.getElementById("cloud-comments-close").addEventListener("click", () => { currentCommentsListeningId = null; closeModal(); });
    document.getElementById("cloud-comment-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = document.getElementById("cloud-comment-input").value.trim();
      if (!text) return;
      try {
        await SLCloud.postComment(listeningId, text);
        document.getElementById("cloud-comment-input").value = "";
        await refreshCommentsPanel();
      } catch (err) { toast("Erreur : " + (err.message || "inconnue")); }
    });
    await refreshCommentsPanel();
  }
  async function refreshCommentsPanel() {
    const list = document.getElementById("cloud-comments-list");
    if (!list || !currentCommentsListeningId) return;
    const items = await SLCloud.listCommentsForListening(currentCommentsListeningId);
    if (!items.length) {
      list.innerHTML = `<p class="feed-note">Aucun commentaire pour l'instant.</p>`;
      return;
    }
    list.innerHTML = items.map((c) => {
      const a = c.profiles || {};
      return `<article class="cloud-comment">
        <span class="cloud-comment__avatar" style="background:hsl(${a.hue || 220},55%,50%)">${escapeHtml((a.name || "?").slice(0,1).toUpperCase())}</span>
        <div class="cloud-comment__body">
          <strong>${escapeHtml(a.name || "?")}</strong> <span class="cloud-comment__time">${timeAgo(c.created_at)}</span>
          <p>${escapeHtml(c.text)}</p>
        </div>
      </article>`;
    }).join("");
  }

  // Interception du bouton "Commenter" sur le feed quand cloud connecté
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cloud-comments-on]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    openCloudCommentsModal(btn.getAttribute("data-cloud-comments-on"));
  });

  // ---------- Stats personnelles ----------
  async function openCloudStatsModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    const uid = SLCloud.me.id;
    openModal(`<h2>Mes statistiques</h2>
      <div id="cloud-stats" class="cloud-stats"><p class="feed-note">Calcul…</p></div>
      <p class="modal-actions"><button type="button" class="btn btn-ghost" id="cloud-stats-close">Fermer</button></p>`);
    document.getElementById("cloud-stats-close").addEventListener("click", closeModal);
    try {
      const [stats, top, recos] = await Promise.all([
        SLCloud.getUserStats(uid),
        SLCloud.getTopArtists(uid, 12),
        SLCloud.getRecommendations(uid, 12),
      ]);
      const node = document.getElementById("cloud-stats");
      node.innerHTML = `
        <section class="cloud-stats-grid">
          <article><strong>${stats?.total_listenings || 0}</strong><span>écoutes</span></article>
          <article><strong>${stats?.unique_albums || 0}</strong><span>albums uniques</span></article>
          <article><strong>${stats?.avg_rating || "—"}</strong><span>note moyenne</span></article>
          <article><strong>${stats?.total_lists || 0}</strong><span>listes</span></article>
          <article><strong>${stats?.total_concerts || 0}</strong><span>concerts vus</span></article>
          <article><strong>${stats?.total_wishlist || 0}</strong><span>à écouter</span></article>
          <article><strong>${stats?.total_imported_tracks || 0}</strong><span>titres importés</span></article>
          <article><strong>${stats?.imported_unique_artists || 0}</strong><span>artistes ext.</span></article>
        </section>
        <h3>Top artistes</h3>
        ${top.length ? `<ol class="cloud-top-artists">${top.map((a) => `<li><span>${escapeHtml(a.artist_name)}</span><em>${a.track_count}</em></li>`).join("")}</ol>` : `<p class="feed-note">Importe une playlist ou note des albums pour générer ton top artistes.</p>`}
        <h3>Recommandé pour toi</h3>
        ${recos.length ? `<ul class="cloud-recos">${recos.map((r) => `<li><strong>${escapeHtml(r.title)}</strong> — ${escapeHtml(r.artist)} <em>(score ${Number(r.score).toFixed(1)})</em></li>`).join("")}</ul>` : `<p class="feed-note">Pas assez de données collectives pour reco — invite des ami·es !</p>`}`;
    } catch (e) {
      document.getElementById("cloud-stats").innerHTML = `<p class="auth-error">${escapeHtml(e.message || "Erreur de chargement")}</p>`;
    }
  }

  // ---------- Avatar upload ----------
  function openAvatarUploadModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    const me = SLCloud.me;
    const current = me.avatar_url
      ? `<img class="avatar-preview" src="${escapeHtml(me.avatar_url)}" alt="" />`
      : `<div class="avatar-preview avatar-preview--placeholder" style="background:hsl(${me.hue || 220},55%,50%)">${escapeHtml((me.name || "?").slice(0,1).toUpperCase())}</div>`;
    openModal(`<h2>Avatar</h2>
      ${current}
      <label class="cloud-upload">
        <span>Choisir une image (PNG/JPG, max 2 Mo)</span>
        <input type="file" id="avatar-file" accept="image/png,image/jpeg,image/webp" />
      </label>
      <p class="auth-error" id="avatar-err" hidden></p>
      <p class="modal-actions">
        <button type="button" class="btn btn-primary" id="avatar-save">Téléverser</button>
        <button type="button" class="btn btn-ghost" id="avatar-cancel">Fermer</button>
      </p>`);
    document.getElementById("avatar-cancel").addEventListener("click", closeModal);
    document.getElementById("avatar-save").addEventListener("click", async () => {
      const f = document.getElementById("avatar-file").files[0];
      if (!f) return;
      if (f.size > 2 * 1024 * 1024) {
        const err = document.getElementById("avatar-err");
        err.textContent = "Image trop lourde (max 2 Mo).";
        err.hidden = false;
        return;
      }
      try {
        await SLCloud.uploadAvatar(f);
        toast("Avatar mis à jour.");
        closeModal();
        render();
      } catch (e) {
        const err = document.getElementById("avatar-err");
        err.textContent = e.message || "Échec du téléversement.";
        err.hidden = false;
      }
    });
  }

  // ---------- Shoutouts (murmures) ----------
  function openShoutoutModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    openModal(`<h2>Publier un murmure</h2>
      <p class="feed-note">Une phrase, une humeur, une pépite — visible de toute la communauté.</p>
      <label class="visually-hidden" for="shoutout-text">Texte</label>
      <textarea id="shoutout-text" maxlength="280" placeholder="Ce que ton oreille pense ce matin..." rows="4"></textarea>
      <p class="auth-error" id="shoutout-err" hidden></p>
      <p class="modal-actions">
        <button type="button" class="btn btn-primary" id="shoutout-post">Publier</button>
        <button type="button" class="btn btn-ghost" id="shoutout-cancel">Annuler</button>
      </p>`);
    document.getElementById("shoutout-cancel").addEventListener("click", closeModal);
    document.getElementById("shoutout-post").addEventListener("click", async () => {
      const txt = document.getElementById("shoutout-text").value.trim();
      if (!txt) return;
      try {
        await SLCloud.postShoutout(txt);
        toast("Murmure publié.");
        closeModal();
        refreshCloudShoutouts();
      } catch (e) {
        const err = document.getElementById("shoutout-err");
        err.textContent = e.message || "Erreur";
        err.hidden = false;
      }
    });
  }
  window.__sl = window.__sl || {}; window.__sl.openShoutout = openShoutoutModal;

  // ---------- Import Spotify ----------
  async function openSpotifyImportModal() {
    if (!SLCloud) return;
    if (!SLCloud.spotify.isConfigured()) {
      openModal(`<h2>Spotify non configuré</h2>
        <p class="feed-note">Pour activer l'import de tes playlists Spotify, ajoute ton <code>spotifyClientId</code> dans <code>config.js</code> (voir PLAYLISTS.md).</p>
        <p class="modal-actions"><button type="button" class="btn btn-ghost" id="sp-close">Fermer</button></p>`);
      document.getElementById("sp-close").addEventListener("click", closeModal);
      return;
    }
    if (!SLCloud.isSignedIn()) {
      toast("Connecte-toi d'abord à Soundlog.");
      return;
    }
    if (!SLCloud.spotify.hasToken()) {
      openModal(`<h2>Connecter Spotify</h2>
        <p>Tu vas être redirigé·e vers Spotify pour autoriser Soundlog à lire tes playlists. Aucune donnée n'est partagée avec d'autres utilisateurs.</p>
        <p class="modal-actions">
          <button type="button" class="btn btn-primary" id="sp-auth">Autoriser Spotify</button>
          <button type="button" class="btn btn-ghost" id="sp-close">Annuler</button>
        </p>`);
      document.getElementById("sp-close").addEventListener("click", closeModal);
      document.getElementById("sp-auth").addEventListener("click", () => SLCloud.spotify.authorize());
      return;
    }
    openModal(`<h2>Importer depuis Spotify</h2>
      <p class="feed-note">Sélectionne les playlists à fusionner dans ton profil. Les artistes/albums alimenteront Sonar pour personnaliser tes recommandations.</p>
      <div id="sp-playlists"><p class="feed-note">Chargement…</p></div>
      <p class="modal-actions">
        <button type="button" class="btn btn-primary" id="sp-import">Importer la sélection</button>
        <button type="button" class="btn btn-ghost" id="sp-liked">Importer mes titres aimés</button>
        <button type="button" class="btn btn-ghost" id="sp-disconnect">Déconnecter Spotify</button>
        <button type="button" class="btn btn-ghost" id="sp-close">Fermer</button>
      </p>
      <p id="sp-status" class="feed-note"></p>`);
    document.getElementById("sp-close").addEventListener("click", closeModal);
    document.getElementById("sp-disconnect").addEventListener("click", () => { SLCloud.spotify.clearToken(); closeModal(); openSpotifyImportModal(); });
    let playlists = [];
    try {
      playlists = await SLCloud.spotify.listMyPlaylists();
    } catch (e) {
      document.getElementById("sp-playlists").innerHTML = `<p class="auth-error">${escapeHtml(e.message || "Erreur Spotify")}</p>`;
      return;
    }
    document.getElementById("sp-playlists").innerHTML = playlists.length
      ? `<ul class="sp-playlists">${playlists.map((p) => `
        <li>
          <label>
            <input type="checkbox" value="${escapeHtml(p.id)}" />
            <span>${escapeHtml(p.name)}</span>
            <em>${p.tracks?.total || 0} titres</em>
          </label>
        </li>`).join("")}</ul>`
      : `<p class="feed-note">Aucune playlist trouvée sur ce compte Spotify.</p>`;
    const setStatus = (s) => { document.getElementById("sp-status").textContent = s; };
    async function importPlaylist(p) {
      setStatus(`Import de « ${p.name} »…`);
      const tracks = await SLCloud.spotify.listTracksOfPlaylist(p.id);
      const playlistRow = {
        id: "spotify:" + p.id,
        source: "spotify",
        remoteId: p.id,
        name: p.name,
        description: p.description || "",
        artworkUrl: (p.images && p.images[0] && p.images[0].url) || null,
        raw: { tracks: tracks.length },
      };
      await SLCloud.upsertImportedPlaylist(playlistRow);
      const rows = tracks.map((t) => ({
        playlistId: playlistRow.id,
        source: "spotify",
        trackName: t.name,
        artistName: (t.artists || []).map((a) => a.name).join(", "),
        albumName: t.album?.name || "",
        albumYear: t.album?.release_date ? Number((t.album.release_date || "").slice(0, 4)) : null,
        albumArtworkUrl: (t.album?.images && t.album.images[0] && t.album.images[0].url) || null,
        remoteTrackId: t.id,
        remoteAlbumId: t.album?.id,
      }));
      await SLCloud.insertImportedTracks(rows);
      // Ajoute aussi les albums uniques dans le catalogue Soundlog (mode importé)
      const uniqueAlbums = new Map();
      rows.forEach((r) => {
        const k = `${(r.albumName || "").toLowerCase()}|${(r.artistName || "").toLowerCase()}`;
        if (!uniqueAlbums.has(k) && r.albumName) uniqueAlbums.set(k, r);
      });
      state.importedAlbums = state.importedAlbums || [];
      uniqueAlbums.forEach((r) => {
        const id = "spotify-" + (r.remoteAlbumId || cryptoRandomId());
        if (!state.importedAlbums.find((a) => a.id === id)) {
          state.importedAlbums.push({
            id,
            title: r.albumName,
            artist: r.artistName,
            year: r.albumYear,
            genre: "",
            artworkUrl: r.albumArtworkUrl,
            from: "#444",
            to: "#222",
          });
        }
      });
      persist();
    }
    document.getElementById("sp-import").addEventListener("click", async () => {
      const checked = Array.from(document.querySelectorAll("#sp-playlists input:checked")).map((c) => c.value);
      if (!checked.length) { setStatus("Aucune playlist sélectionnée."); return; }
      try {
        for (const id of checked) {
          const p = playlists.find((x) => x.id === id);
          if (p) await importPlaylist(p);
        }
        setStatus("Import terminé !");
        toast("Playlists importées.");
        render();
      } catch (e) { setStatus("Erreur : " + (e.message || "inconnue")); }
    });
    document.getElementById("sp-liked").addEventListener("click", async () => {
      try {
        setStatus("Import des titres aimés…");
        const tracks = await SLCloud.spotify.listLikedTracks();
        const fakePlaylist = { id: "liked", name: "Spotify — Mes titres aimés", description: "Import auto" };
        await SLCloud.upsertImportedPlaylist({
          id: "spotify:liked",
          source: "spotify",
          remoteId: "liked",
          name: fakePlaylist.name,
          description: fakePlaylist.description,
          raw: { tracks: tracks.length },
        });
        const rows = tracks.map((t) => ({
          playlistId: "spotify:liked",
          source: "spotify",
          trackName: t.name,
          artistName: (t.artists || []).map((a) => a.name).join(", "),
          albumName: t.album?.name || "",
          albumYear: t.album?.release_date ? Number((t.album.release_date || "").slice(0, 4)) : null,
          albumArtworkUrl: (t.album?.images && t.album.images[0] && t.album.images[0].url) || null,
          remoteTrackId: t.id,
          remoteAlbumId: t.album?.id,
        }));
        await SLCloud.insertImportedTracks(rows);
        setStatus(`Importé : ${rows.length} titres aimés.`);
        toast("Titres aimés importés.");
        render();
      } catch (e) { setStatus("Erreur : " + (e.message || "inconnue")); }
    });
  }

  function cryptoRandomId() {
    const a = new Uint8Array(8); crypto.getRandomValues(a);
    return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Helper JSONP pour Deezer (contourne CORS sans Edge Function)
  function deezerJsonp(url) {
    return new Promise((resolve, reject) => {
      const cb = "_dz_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
      window[cb] = (data) => {
        try { delete window[cb]; } catch (_) { window[cb] = null; }
        const s = document.getElementById(cb);
        if (s) s.remove();
        resolve(data);
      };
      const sep = url.includes("?") ? "&" : "?";
      const script = document.createElement("script");
      script.id = cb;
      script.src = `${url}${sep}output=jsonp&callback=${cb}`;
      script.onerror = () => { reject(new Error("Échec JSONP Deezer")); };
      document.head.appendChild(script);
      setTimeout(() => {
        if (window[cb]) { try { delete window[cb]; } catch (_) {} reject(new Error("Timeout Deezer")); }
      }, 15000);
    });
  }

  // ---------- Import Deezer (URL publique, zéro auth) ----------
  async function openDeezerImportModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) { toast("Connecte-toi d'abord."); return; }
    openModal(`<h2>Importer une playlist Deezer</h2>
      <p class="feed-note">Colle l'URL d'une playlist Deezer publique (ex. <code>https://www.deezer.com/fr/playlist/3155776842</code>) ou seulement son ID.</p>
      <p class="feed-note">Astuce : depuis Deezer, ouvre une playlist (la tienne ou celle de quelqu'un d'autre tant qu'elle est publique), clique « Partager » → « Copier le lien ».</p>
      <label class="visually-hidden" for="dz-url">URL Deezer</label>
      <input type="url" id="dz-url" placeholder="https://www.deezer.com/playlist/..." />
      <p class="modal-actions">
        <button type="button" class="btn btn-primary" id="dz-import">Importer</button>
        <button type="button" class="btn btn-ghost" id="dz-cancel">Annuler</button>
      </p>
      <p class="feed-note" id="dz-status"></p>`);
    const setStatus = (s) => { const n = document.getElementById("dz-status"); if (n) n.textContent = s; };
    document.getElementById("dz-cancel").addEventListener("click", closeModal);
    document.getElementById("dz-import").addEventListener("click", async () => {
      const raw = document.getElementById("dz-url").value.trim();
      // Détection des liens raccourcis Deezer (deezer.page.link, link.deezer.com)
      if (/link\.deezer\.com|deezer\.page\.link/.test(raw)) {
        setStatus("");
        const n = document.getElementById("dz-status");
        if (n) {
          n.innerHTML = `Lien raccourci détecté. Soundlog ne peut pas le déplier (CORS).
            <br><a href="${escapeHtml(raw)}" target="_blank" rel="noopener" class="link">Ouvrir le lien dans un nouvel onglet</a>,
            puis copie l'URL longue (<code>deezer.com/.../playlist/<i>NNNN</i></code>) depuis la barre d'adresse et recolle-la ici.`;
        }
        return;
      }
      const m = raw.match(/playlist[\/=](\d+)/) || raw.match(/^(\d+)$/);
      if (!m) { setStatus("URL ou ID invalide. Format attendu : https://www.deezer.com/playlist/123 ou juste 123."); return; }
      const playlistId = m[1];
      try {
        setStatus("Récupération de la playlist...");
        const meta = await deezerJsonp(`https://api.deezer.com/playlist/${playlistId}`);
        if (meta.error) throw new Error(meta.error.message || "Playlist introuvable (privée ?)");
        // Collecte tous les tracks (pagination)
        let tracks = (meta.tracks && meta.tracks.data) || [];
        let next = meta.tracks && meta.tracks.next;
        while (next) {
          const j = await deezerJsonp(next);
          tracks.push(...(j.data || []));
          next = j.next;
        }
        setStatus(`Trouvé ${tracks.length} titres. Sauvegarde...`);
        const playlistRow = {
          id: "deezer:" + playlistId,
          source: "deezer",
          remoteId: String(playlistId),
          name: meta.title || "Playlist Deezer",
          description: meta.description || "",
          artworkUrl: meta.picture_xl || meta.picture_big || meta.picture || null,
          raw: { tracks: tracks.length, creator: meta.creator && meta.creator.name },
        };
        await SLCloud.upsertImportedPlaylist(playlistRow);
        const rows = tracks.map((t) => ({
          playlistId: playlistRow.id,
          source: "deezer",
          trackName: t.title || "",
          artistName: (t.artist && t.artist.name) || "",
          albumName: (t.album && t.album.title) || "",
          albumYear: null,
          albumArtworkUrl: (t.album && (t.album.cover_xl || t.album.cover_big || t.album.cover_medium)) || null,
          remoteTrackId: t.id ? String(t.id) : null,
          remoteAlbumId: t.album && t.album.id ? String(t.album.id) : null,
        }));
        await SLCloud.insertImportedTracks(rows);
        // Fusion albums uniques dans le catalogue local
        const uniq = new Map();
        rows.forEach((r) => {
          if (!r.albumName) return;
          const k = `${r.albumName.toLowerCase()}|${r.artistName.toLowerCase()}`;
          if (!uniq.has(k)) uniq.set(k, r);
        });
        state.importedAlbums = state.importedAlbums || [];
        uniq.forEach((r) => {
          const id = "deezer-" + (r.remoteAlbumId || cryptoRandomId());
          if (!state.importedAlbums.find((a) => a.id === id)) {
            state.importedAlbums.push({
              id, title: r.albumName, artist: r.artistName, year: null, genre: "",
              artworkUrl: r.albumArtworkUrl, from: "#444", to: "#222",
            });
          }
        });
        persist();
        setStatus(`Import terminé — ${rows.length} titres, ${uniq.size} albums uniques.`);
        toast("Playlist importée !");
        render();
      } catch (e) {
        setStatus("Erreur : " + (e.message || "inconnue"));
      }
    });
  }
  window.__sl.openDeezer = openDeezerImportModal;

  // ---------- Sélecteur de plateformes ----------
  function openPlatformPickerModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) { toast("Connecte-toi d'abord."); return; }
    const cfg = window.SLConfig || {};
    const platforms = [
      { id: "deezer", name: "Deezer", desc: "URL d'une playlist publique. Aucune inscription.", ok: true, color: "#a238ff" },
      { id: "spotify", name: "Spotify", desc: cfg.spotifyClientId ? "OAuth — nécessite Premium côté owner de l'app dev." : "Configure spotifyClientId dans config.js.", ok: !!cfg.spotifyClientId, color: "#1db954" },
      { id: "youtube", name: "YouTube / YouTube Music", desc: cfg.youtubeApiKey ? "URL d'une playlist publique." : "Configure youtubeApiKey dans config.js.", ok: !!cfg.youtubeApiKey, color: "#ff0033" },
      { id: "lastfm", name: "Last.fm", desc: cfg.lastfmApiKey ? "Pseudo Last.fm + top tracks/albums." : "Configure lastfmApiKey dans config.js.", ok: !!cfg.lastfmApiKey, color: "#d51007" },
      { id: "manual", name: "CSV / JSON (Soundiiz, Exportify…)", desc: "Colle un export universel.", ok: true, color: "#888" },
      { id: "apple", name: "Apple Music", desc: "Bientôt — signature Apple Developer requise.", ok: false, color: "#fa243c" },
      { id: "tidal", name: "Tidal", desc: "Bientôt — pas d'API publique.", ok: false, color: "#000" },
    ];
    openModal(`<h2>Importer mes playlists</h2>
      <p class="feed-note">Choisis ta plateforme. Les pistes alimenteront tes recommandations et ton top artistes.</p>
      <ul class="platform-grid">${platforms.map((p) => `
        <li>
          <button type="button" class="platform-card ${p.ok ? "" : "platform-card--disabled"}" data-platform="${p.id}" ${p.ok ? "" : "disabled"}>
            <span class="platform-card__badge" style="background:${p.color}">${escapeHtml(p.name[0])}</span>
            <span class="platform-card__name">${escapeHtml(p.name)}</span>
            <span class="platform-card__desc">${escapeHtml(p.desc)}</span>
          </button>
        </li>`).join("")}</ul>
      <p class="modal-actions"><button type="button" class="btn btn-ghost" id="pp-close">Fermer</button></p>`);
    document.getElementById("pp-close").addEventListener("click", closeModal);
    document.querySelectorAll("[data-platform]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-platform");
        closeModal();
        if (id === "deezer") openDeezerImportModal();
        else if (id === "spotify") openSpotifyImportModal();
        else if (id === "youtube") openYoutubeImportModal();
        else if (id === "lastfm") openLastfmImportModal();
        else if (id === "manual") openManualImportModal();
      });
    });
  }
  window.__sl.openPlatformPicker = openPlatformPickerModal;

  // ---------- YouTube / YouTube Music ----------
  async function openYoutubeImportModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    const cfg = window.SLConfig || {};
    if (!cfg.youtubeApiKey) {
      openModal(`<h2>YouTube non configuré</h2>
        <p class="feed-note">Ajoute <code>youtubeApiKey</code> dans <code>config.js</code> (clé Google Cloud, gratuite — voir IMPORTS.md).</p>
        <p class="modal-actions"><button type="button" class="btn btn-ghost" id="yt-close">Fermer</button></p>`);
      document.getElementById("yt-close").addEventListener("click", closeModal);
      return;
    }
    openModal(`<h2>Importer une playlist YouTube / YouTube Music</h2>
      <p class="feed-note">Colle l'URL d'une playlist publique (ex. <code>https://music.youtube.com/playlist?list=PL...</code> ou <code>https://www.youtube.com/playlist?list=PL...</code>).</p>
      <label class="visually-hidden" for="yt-url">URL YouTube</label>
      <input type="url" id="yt-url" placeholder="https://www.youtube.com/playlist?list=..." />
      <p class="modal-actions">
        <button type="button" class="btn btn-primary" id="yt-import">Importer</button>
        <button type="button" class="btn btn-ghost" id="yt-cancel">Annuler</button>
      </p>
      <p class="feed-note" id="yt-status"></p>`);
    const setS = (s) => { const n = document.getElementById("yt-status"); if (n) n.textContent = s; };
    document.getElementById("yt-cancel").addEventListener("click", closeModal);
    document.getElementById("yt-import").addEventListener("click", async () => {
      const raw = document.getElementById("yt-url").value.trim();
      const m = raw.match(/[?&]list=([A-Za-z0-9_-]+)/) || raw.match(/^([A-Za-z0-9_-]{10,})$/);
      if (!m) { setS("URL ou ID invalide."); return; }
      const listId = m[1];
      try {
        setS("Récupération de la playlist...");
        let metaJ;
        const metaR = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${listId}&key=${encodeURIComponent(cfg.youtubeApiKey)}`);
        metaJ = await metaR.json();
        if (metaJ.error) throw new Error(metaJ.error.message);
        const plMeta = (metaJ.items || [])[0];
        const playlistName = plMeta?.snippet?.title || "Playlist YouTube";
        const playlistArt = plMeta?.snippet?.thumbnails?.high?.url || plMeta?.snippet?.thumbnails?.default?.url || null;
        const playlistRow = {
          id: "youtube:" + listId,
          source: "youtube",
          remoteId: listId,
          name: playlistName,
          description: plMeta?.snippet?.description || "",
          artworkUrl: playlistArt,
          raw: { provider: "youtube" },
        };
        await SLCloud.upsertImportedPlaylist(playlistRow);
        // Pagination items
        const items = [];
        let pageToken = "";
        do {
          const r = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${listId}&maxResults=50&key=${encodeURIComponent(cfg.youtubeApiKey)}${pageToken ? `&pageToken=${pageToken}` : ""}`);
          const j = await r.json();
          if (j.error) throw new Error(j.error.message);
          items.push(...(j.items || []));
          pageToken = j.nextPageToken || "";
        } while (pageToken);
        // Heuristique : si le channel est "Artiste - Topic", on prend "Artiste" + title du clip = piste
        const rows = items.map((it) => {
          const sn = it.snippet || {};
          const title = sn.title || "";
          let artist = (sn.videoOwnerChannelTitle || "").replace(/ - Topic$/i, "").trim();
          let track = title;
          // Si pas de "Topic", essaie de parser "Artist - Track"
          if (!artist && title.includes(" - ")) {
            const [a, t] = title.split(" - ", 2);
            artist = a.trim(); track = t.trim();
          }
          return {
            playlistId: playlistRow.id,
            source: playlistRow.source,
            trackName: track,
            artistName: artist || "—",
            albumName: track, // pas d'info d'album fiable
            albumYear: null,
            albumArtworkUrl: sn.thumbnails?.high?.url || sn.thumbnails?.default?.url || null,
            remoteTrackId: sn.resourceId?.videoId || null,
            remoteAlbumId: null,
          };
        });
        await SLCloud.insertImportedTracks(rows);
        setS(`Import terminé — ${rows.length} titres.`);
        toast("Playlist YouTube importée.");
        render();
      } catch (e) { setS("Erreur : " + (e.message || "inconnue")); }
    });
  }
  window.__sl.openYoutube = openYoutubeImportModal;

  // ---------- Last.fm ----------
  async function openLastfmImportModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    const cfg = window.SLConfig || {};
    if (!cfg.lastfmApiKey) {
      openModal(`<h2>Last.fm non configuré</h2>
        <p class="feed-note">Ajoute <code>lastfmApiKey</code> dans <code>config.js</code> (clé instantanée et gratuite — voir IMPORTS.md).</p>
        <p class="modal-actions"><button type="button" class="btn btn-ghost" id="lf-close">Fermer</button></p>`);
      document.getElementById("lf-close").addEventListener("click", closeModal);
      return;
    }
    openModal(`<h2>Importer depuis Last.fm</h2>
      <p class="feed-note">Renseigne ton pseudo Last.fm. On récupère ton top 200 titres + top 100 albums sur toute ta période d'écoute.</p>
      <label>Pseudo Last.fm <input type="text" id="lf-user" placeholder="ex. lewis-the-melodious" /></label>
      <p class="modal-actions">
        <button type="button" class="btn btn-primary" id="lf-import">Importer</button>
        <button type="button" class="btn btn-ghost" id="lf-cancel">Annuler</button>
      </p>
      <p class="feed-note" id="lf-status"></p>`);
    const setS = (s) => { const n = document.getElementById("lf-status"); if (n) n.textContent = s; };
    document.getElementById("lf-cancel").addEventListener("click", closeModal);
    document.getElementById("lf-import").addEventListener("click", async () => {
      const user = document.getElementById("lf-user").value.trim();
      if (!user) { setS("Pseudo requis."); return; }
      try {
        setS("Récupération du top tracks...");
        const tt = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(cfg.lastfmApiKey)}&format=json&limit=200`);
        const ttJ = await tt.json();
        if (ttJ.error) throw new Error(ttJ.message);
        setS("Récupération du top albums...");
        const ta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(cfg.lastfmApiKey)}&format=json&limit=100`);
        const taJ = await ta.json();
        if (taJ.error) throw new Error(taJ.message);
        const tracks = ttJ.toptracks?.track || [];
        const albums = taJ.topalbums?.album || [];
        const playlistRow = {
          id: "lastfm:user:" + user,
          source: "lastfm",
          remoteId: user,
          name: `Last.fm — Top de ${user}`,
          description: `Top ${tracks.length} titres + top ${albums.length} albums`,
          artworkUrl: null,
          raw: { provider: "lastfm", username: user },
        };
        await SLCloud.upsertImportedPlaylist(playlistRow);
        const rows = tracks.map((t) => ({
          playlistId: playlistRow.id,
          source: playlistRow.source,
          trackName: t.name || "",
          artistName: (t.artist && t.artist.name) || "",
          albumName: "",
          albumYear: null,
          albumArtworkUrl: (t.image && t.image.find && (t.image.find((i) => i.size === "extralarge") || t.image[0]) || {})["#text"] || null,
          remoteTrackId: t.mbid || null,
          remoteAlbumId: null,
        }));
        // Ajoute aussi les albums (en track virtuel = même album)
        albums.forEach((a) => {
          rows.push({
            playlistId: playlistRow.id,
            source: playlistRow.source,
            trackName: "(album)",
            artistName: (a.artist && a.artist.name) || "",
            albumName: a.name || "",
            albumYear: null,
            albumArtworkUrl: (a.image && a.image.find && (a.image.find((i) => i.size === "extralarge") || a.image[0]) || {})["#text"] || null,
            remoteTrackId: null,
            remoteAlbumId: a.mbid || null,
          });
        });
        await SLCloud.insertImportedTracks(rows);
        // Fusion albums uniques
        const uniq = new Map();
        rows.forEach((r) => {
          if (!r.albumName) return;
          const k = `${r.albumName.toLowerCase()}|${r.artistName.toLowerCase()}`;
          if (!uniq.has(k)) uniq.set(k, r);
        });
        state.importedAlbums = state.importedAlbums || [];
        uniq.forEach((r) => {
          const id = "lastfm-" + cryptoRandomId();
          state.importedAlbums.push({
            id, title: r.albumName, artist: r.artistName, year: null, genre: "",
            artworkUrl: r.albumArtworkUrl, from: "#444", to: "#222",
          });
        });
        persist();
        setS(`Import terminé — ${rows.length} entrées.`);
        toast("Last.fm importé !");
        render();
      } catch (e) { setS("Erreur : " + (e.message || "inconnue")); }
    });
  }
  window.__sl.openLastfm = openLastfmImportModal;

  // ---------- CSV / JSON manuel ----------
  function openManualImportModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    openModal(`<h2>Import manuel — CSV ou JSON</h2>
      <p class="feed-note">Colle un export depuis Soundiiz, Exportify, Tune My Music… Format accepté :</p>
      <ul class="feed-note">
        <li><strong>CSV</strong> avec colonnes <code>Track Name,Artist Name,Album Name</code> (en-tête obligatoire).</li>
        <li><strong>JSON</strong> = tableau d'objets <code>{ track, artist, album, year? }</code>.</li>
      </ul>
      <textarea id="mi-data" rows="10" placeholder="Colle ici ton CSV ou JSON…" style="width:100%;min-height:180px;font:inherit;padding:.55rem;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-elevated);color:var(--text);"></textarea>
      <label>Nom de la playlist (optionnel) <input type="text" id="mi-name" placeholder="Mon export" /></label>
      <p class="modal-actions">
        <button type="button" class="btn btn-primary" id="mi-import">Importer</button>
        <button type="button" class="btn btn-ghost" id="mi-cancel">Annuler</button>
      </p>
      <p class="feed-note" id="mi-status"></p>`);
    const setS = (s) => { const n = document.getElementById("mi-status"); if (n) n.textContent = s; };
    document.getElementById("mi-cancel").addEventListener("click", closeModal);
    document.getElementById("mi-import").addEventListener("click", async () => {
      const raw = document.getElementById("mi-data").value.trim();
      const name = document.getElementById("mi-name").value.trim() || "Import manuel";
      if (!raw) { setS("Vide."); return; }
      let parsed = [];
      try {
        if (raw.startsWith("[") || raw.startsWith("{")) {
          const j = JSON.parse(raw);
          parsed = Array.isArray(j) ? j : (j.tracks || j.items || []);
          parsed = parsed.map((r) => ({
            trackName: r.track || r.title || r.name || "",
            artistName: r.artist || r.artistName || "",
            albumName: r.album || r.albumName || "",
            albumYear: r.year ? Number(r.year) : null,
          }));
        } else {
          // CSV simple : on parse virgules avec gestion guillemets
          const lines = raw.split(/\r?\n/).filter((l) => l.trim());
          const header = parseCsvRow(lines[0]).map((c) => c.toLowerCase().trim());
          const idxTrack = header.findIndex((h) => /track|titre|song/i.test(h));
          const idxArtist = header.findIndex((h) => /artist|artiste/i.test(h));
          const idxAlbum = header.findIndex((h) => /album/i.test(h));
          const idxYear = header.findIndex((h) => /year|année|ann/i.test(h));
          if (idxTrack < 0 || idxArtist < 0) throw new Error("Colonnes Track et Artist requises");
          parsed = lines.slice(1).map((l) => {
            const c = parseCsvRow(l);
            return {
              trackName: c[idxTrack] || "",
              artistName: c[idxArtist] || "",
              albumName: idxAlbum >= 0 ? c[idxAlbum] || "" : "",
              albumYear: idxYear >= 0 && c[idxYear] ? Number(c[idxYear]) : null,
            };
          });
        }
      } catch (e) { setS("Parsing impossible : " + e.message); return; }
      if (!parsed.length) { setS("Aucune ligne."); return; }
      try {
        const pid = "manual:" + Date.now();
        await SLCloud.upsertImportedPlaylist({
          id: pid, source: "manual", remoteId: String(Date.now()), name, description: "Import manuel",
          artworkUrl: null, raw: { provider: "manual", count: parsed.length },
        });
        const rows = parsed.map((p) => ({
          playlistId: pid,
          source: "manual",
          trackName: p.trackName,
          artistName: p.artistName,
          albumName: p.albumName,
          albumYear: p.albumYear,
          albumArtworkUrl: null,
          remoteTrackId: null,
          remoteAlbumId: null,
        }));
        await SLCloud.insertImportedTracks(rows);
        setS(`Import terminé — ${rows.length} pistes.`);
        toast("Import manuel réussi.");
        render();
      } catch (e) { setS("Erreur : " + (e.message || "inconnue")); }
    });
  }
  function parseCsvRow(line) {
    const out = []; let cur = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"' ) { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (c === "," && !inQ) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur); return out.map((s) => s.trim());
  }
  window.__sl.openManual = openManualImportModal;

  // ---------- Hooks au login / route Spotify ----------
  window.addEventListener("sl-spotify-connected", () => {
    toast("Spotify connecté.");
    openSpotifyImportModal();
  });

  // Au login, lancer realtime + premier pull shoutouts
  if (SLCloud && SLCloud.on) {
    SLCloud.on(async (evt) => {
      if (evt === "auth" && SLCloud.isSignedIn()) {
        setupRealtimeHooks();
        refreshCloudShoutouts();
      } else if (evt === "auth" && !SLCloud.isSignedIn()) {
        if (realtimeChannel) { SLCloud.unsubscribe(realtimeChannel); realtimeChannel = null; }
      } else if (evt === "ready" && SLCloud.isSignedIn()) {
        setupRealtimeHooks();
        refreshCloudShoutouts();
      }
    });
  }
  setInterval(refreshCloudShoutouts, 90000);

  // ---------- Hash routes pour les nouvelles vues ----------
  function maybeHandleCloudHash() {
    const h = (location.hash || "").replace(/^#/, "");
    if (h === "spotify-import" && SLCloud && SLCloud.isSignedIn()) {
      location.hash = "";
      openSpotifyImportModal();
    } else if (h === "stats" && SLCloud && SLCloud.isSignedIn()) {
      location.hash = "";
      openCloudStatsModal();
    }
  }
  window.addEventListener("hashchange", maybeHandleCloudHash);
  maybeHandleCloudHash();

  // Expose pour la modale Compte
  window.__sl = window.__sl || {};
  window.__sl.openStats = openCloudStatsModal;
  window.__sl.openAvatar = openAvatarUploadModal;
  window.__sl.openSpotify = openSpotifyImportModal;
  window.__sl.refreshShoutouts = refreshCloudShoutouts;
  window.__sl.cloudShoutouts = cloudShoutouts;
  window.__sl.renderCloudShoutoutsInto = renderCloudShoutoutsInto;
})();
