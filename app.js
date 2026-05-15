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
  ];

  /** Anciens profils fictifs (Marie, Léo, Adagio) — retirés, données purgées au chargement. */
  const LEGACY_DEMO_USER_IDS = new Set(["u1", "u2", "u3"]);
  const LEGACY_DEMO_NOTIFICATION_IDS = new Set(["n-circle", "n-live", "fr-seed"]);

  function isLegacyDemoUserId(userId) {
    return LEGACY_DEMO_USER_IDS.has(userId);
  }

  function includeUserInCircle(userId) {
    if (isLegacyDemoUserId(userId)) return false;
    return true;
  }

  /** Retire posts, notifs et relations des comptes fictifs (migration testeurs). */
  function purgeLegacyDemoContent(s) {
    if (!s || typeof s !== "object") return false;
    const isDemo = (id) => id && LEGACY_DEMO_USER_IDS.has(id);
    let changed = false;
    const strip = (arr, pickUserId) => {
      if (!Array.isArray(arr)) return arr;
      const next = arr.filter((row) => !isDemo(pickUserId(row)));
      if (next.length !== arr.length) changed = true;
      return next;
    };
    s.listenings = strip(s.listenings, (l) => l.userId);
    s.lists = strip(s.lists, (l) => l.userId);
    s.concertLogs = strip(s.concertLogs, (c) => c.userId);
    s.shoutouts = strip(s.shoutouts, (x) => x.userId);
    s.feedComments = strip(s.feedComments, (c) => c.userId);
    if (Array.isArray(s.follows)) {
      const next = s.follows.filter((id) => !isDemo(id));
      if (next.length !== s.follows.length) changed = true;
      s.follows = next;
    }
    if (Array.isArray(s.friends)) {
      const next = s.friends.filter((id) => !isDemo(id));
      if (next.length !== s.friends.length) changed = true;
      s.friends = next;
    }
    s.incomingFriendRequests = strip(s.incomingFriendRequests, (r) => r.fromUserId);
    s.outgoingFriendRequests = strip(s.outgoingFriendRequests, (r) => r.toUserId);
    if (Array.isArray(s.notifications)) {
      const next = s.notifications.filter((n) => {
        if (n && LEGACY_DEMO_NOTIFICATION_IDS.has(n.id)) return false;
        if (n && n.meta && isDemo(n.meta.userId)) return false;
        return true;
      });
      if (next.length !== s.notifications.length) changed = true;
      s.notifications = next;
    }
    if (s.settings && "showDemoCarnet" in s.settings) {
      delete s.settings.showDemoCarnet;
      changed = true;
    }
    if (s.socialReactions && typeof s.socialReactions === "object") {
      ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"].forEach((lid) => {
        if (s.socialReactions[lid]) {
          delete s.socialReactions[lid];
          changed = true;
        }
      });
    }
    return changed;
  }

  function defaultAdaptive() {
    return { v: 1, nav: {}, genreInterest: {}, listenLogs: 0 };
  }

  function defaultState() {
    return {
      listenings: [],
      follows: [],
      friends: [],
      incomingFriendRequests: [],
      outgoingFriendRequests: [],
      favoriteArtists: [],
      notifications: [],
      tourAlertSeen: [],
      feedComments: [],
      shoutouts: [],
      manualTourDates: [],
      lastTourSyncAt: null,
      lists: [],
      wishlist: [],
      importedAlbums: [],
      settings: {
        youtubeApiKey: "",
        alertCity: "Paris",
        desktopAlerts: false,
        musicCountry: "FR",
      },
      profile: {
        displayName: "Toi",
        handle: "moi",
        bio: "Amateur·rice de disques. Les notes restent sur ton appareil.",
        performanceVideos: [],
      },
      concertLogs: [],
      invitedPeers: [],
      sentInvites: [],
      adaptive: defaultAdaptive(),
      previewByAlbumId: {},
      eventInterestLocal: {},
      upcomingTourPreview: [],
      feedHomeTab: "following",
      feedHomeShown: 15,
      exploreTab: "albums",
      carnetTab: "journal",
      diaryFilter: "all",
      socialTab: "community",
      socialCircleTab: "feed",
      socialFeedFilter: "all",
      socialReactions: {},
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      const merged = {
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
        eventInterestLocal:
          parsed.eventInterestLocal && typeof parsed.eventInterestLocal === "object" ? parsed.eventInterestLocal : base.eventInterestLocal,
        upcomingTourPreview: Array.isArray(parsed.upcomingTourPreview) ? parsed.upcomingTourPreview : base.upcomingTourPreview,
        feedHomeTab: parsed.feedHomeTab === "discover" ? "discover" : base.feedHomeTab,
        feedHomeShown: Math.min(80, Math.max(10, parseInt(parsed.feedHomeShown, 10) || base.feedHomeShown)),
      };
      purgeLegacyDemoContent(merged);
      return merged;
    } catch {
      return defaultState();
    }
  }

  let state = loadState();
  if (purgeLegacyDemoContent(state)) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }
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

  const THEME_KEY = "sl-theme";

  function getTheme() {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.dataset.theme = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#e8e4dc" : "#08090e");
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      const light = t === "light";
      btn.setAttribute("aria-pressed", light ? "true" : "false");
      btn.title = light ? "Passer en mode sombre" : "Passer en mode clair";
      const label = btn.querySelector(".theme-toggle__label");
      if (label) label.textContent = light ? "Mode sombre" : "Mode clair";
    }
  }

  function toggleTheme() {
    applyTheme(getTheme() === "light" ? "dark" : "light");
  }

  function hexToRgb(hex) {
    const h = String(hex || "").replace("#", "").trim();
    if (h.length !== 6) return null;
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function applyAlbumBackdropTint() {
    const view = document.querySelector(".album-detail-view");
    if (!view || route.view !== "album") return;
    const backdrop = view.querySelector(".album-detail-backdrop");
    if (!backdrop) return;
    const al = albumById(route.albumId);
    const paint = (r, g, b) => {
      backdrop.style.setProperty("--album-tint-r", String(r));
      backdrop.style.setProperty("--album-tint-g", String(g));
      backdrop.style.setProperty("--album-tint-b", String(b));
      view.classList.add("has-artwork-tint");
    };
    const gradientFallback = () => {
      if (!al) return;
      const a = hexToRgb(al.from) || { r: 36, g: 36, b: 44 };
      const b = hexToRgb(al.to) || { r: 72, g: 56, b: 88 };
      paint(Math.round((a.r + b.r) / 2), Math.round((a.g + b.g) / 2), Math.round((a.b + b.b) / 2));
    };
    const sampleImg = (img) => {
      try {
        const canvas = document.createElement("canvas");
        const s = 28;
        canvas.width = s;
        canvas.height = s;
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        ctx.drawImage(img, 0, 0, s, s);
        const d = ctx.getImageData(0, 0, s, s).data;
        let r = 0,
          g = 0,
          b = 0,
          n = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 48) continue;
          r += d[i];
          g += d[i + 1];
          b += d[i + 2];
          n++;
        }
        if (!n) return false;
        paint(Math.round(r / n), Math.round(g / n), Math.round(b / n));
        return true;
      } catch (_) {
        return false;
      }
    };
    const img = view.querySelector(".album-hero .cover-img");
    if (!img) {
      gradientFallback();
      return;
    }
    if (img.complete && img.naturalWidth) {
      if (!sampleImg(img)) gradientFallback();
    } else {
      gradientFallback();
      img.addEventListener(
        "load",
        () => {
          if (!sampleImg(img)) gradientFallback();
        },
        { once: true }
      );
    }
  }

  const route = { view: "home", hubTab: null, albumId: null, userId: null, listId: null, discoverGenre: null, joinInviteRaw: null, dmThreadId: null, inboxDrawer: false, searchQuery: null };

  /** Dernière « clé de route » déjà enregistrée par Sonar (évite les doublons entre deux rendus). */
  let adaptiveRouteKeySeen = "__init__";

  const $main = document.getElementById("app-main");
  const $modal = document.getElementById("modal-root");
  const $toast = document.getElementById("toast-root");
  const $search = document.getElementById("global-search");

  /** cloud.js est chargé avant app.js — doit exister avant le premier render(). */
  const SLCloud = window.SLCloud;
  const cloudPeers = new Map();
  window.__slCloudPeers = cloudPeers;

  function cloudSignedIn() {
    return !!(SLCloud && SLCloud.isSignedIn && SLCloud.isSignedIn());
  }

  function cloudMeRow() {
    return cloudSignedIn() && SLCloud.me ? SLCloud.me : null;
  }

  function syncAccountChrome() {
    updateHeaderUser();
    updateSidebarAccount();
    updateSiteFooter();
  }

  function updateSiteFooter() {
    const el = document.getElementById("site-footer-text");
    if (!el) return;
    if (!SLCloud || !SLCloud.available) {
      el.textContent =
        "Mode invité — carnet et écoutes sur cet appareil. Extraits 30 s via Apple Music et Deezer.";
      return;
    }
    if (cloudSignedIn()) {
      el.textContent =
        "Compte synchronisé — carnet, social et messages sur tes appareils. Extraits 30 s · liens Spotify et YouTube.";
    } else {
      el.textContent =
        "Connecte-toi pour synchroniser ton carnet et rejoindre la communauté. Extraits 30 s · données locales en attendant.";
    }
  }

  let libraryQuery = "";
  let libraryRemoteHits = [];
  let libraryRemoteLoading = false;
  let libraryRemoteError = null;
  let libSearchTimer = null;
  const LIB_RECENTS_KEY = "soundlog.libraryRecents";
  const LIB_MOOD_CHIPS = [
    { label: "Indie du dimanche", q: "phoebe bridgers" },
    { label: "Électro hypnotique", q: "aphex twin" },
    { label: "Soul & R&B", q: "frank ocean" },
    { label: "Rock culte", q: "radiohead" },
    { label: "Hip-hop classique", q: "kendrick lamar" },
    { label: "Pop nocturne", q: "the weeknd" },
    { label: "Trip-hop", q: "portishead" },
    { label: "French touch", q: "daft punk" },
  ];

  const PREVIEW_CACHE_V = 3;
  const MIN_ALBUM_MATCH_SCORE = 70;
  /** Taille max fichier avatar avant envoi (photos téléphone). */
  const AVATAR_MAX_BYTES = 10 * 1024 * 1024;
  const AVATAR_MAX_MB = 10;

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

  function upsertAlbumFromRemoteHit(hit) {
    const key = normalizeKey(hit.artist, hit.title);
    const found = allAlbums().find((a) => normalizeKey(a.artist, a.title) === key);
    if (found) return found.id;
    state.importedAlbums = state.importedAlbums || [];
    const id = "ext-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
    const g = gradientFromKey(id + key);
    const yearNum = parseInt(String(hit.year).replace(/\D/g, ""), 10);
    state.importedAlbums.push({
      id,
      title: hit.title,
      artist: hit.artist,
      year: Number.isFinite(yearNum) ? yearNum : new Date().getFullYear(),
      genre: hit.genre || "Catalogue",
      from: g.from,
      to: g.to,
      artworkUrl: hit.artworkUrl || "",
      links: { ...(hit.links || {}) },
      appleCollectionId: hit.appleCollectionId || parseAppleCollectionId(hit.links && hit.links.apple) || null,
      deezerAlbumId: hit.deezerAlbumId || parseDeezerAlbumId(hit.links && hit.links.deezer) || null,
      musicbrainzReleaseId: hit.musicbrainzReleaseId || hit.musicbrainzId || null,
    });
    persist();
    return id;
  }

  function mergeCloudAlbumFromRow(row) {
    if (!row || !row.id) return null;
    const existing = albumById(row.id);
    if (existing) return existing;
    state.importedAlbums = state.importedAlbums || [];
    const g = gradientFromKey(String(row.id));
    state.importedAlbums.push({
      id: row.id,
      title: row.title || "?",
      artist: row.artist || "?",
      year: row.year || new Date().getFullYear(),
      genre: row.genre || "",
      artworkUrl: row.artwork_url || "",
      musicbrainzReleaseId: row.musicbrainz_release_id || null,
      appleCollectionId: row.apple_collection_id || null,
      deezerAlbumId: row.deezer_album_id || null,
      from: g.from,
      to: g.to,
    });
    persist();
    return albumById(row.id);
  }

  function recoCoverHtml(r) {
    const url = r.artwork_url || r.artworkUrl || "";
    if (url) {
      return `<img class="reco-card__cover" src="${escapeHtml(url)}" alt="" loading="lazy" decoding="async" />`;
    }
    const g = gradientFromKey((r.artist || "") + (r.title || ""));
    return `<span class="reco-card__cover reco-card__cover--ph" style="background:linear-gradient(135deg,${g.from},${g.to})" aria-hidden="true"></span>`;
  }

  function renderRecoCardsHtml(recos, opts) {
    opts = opts || {};
    if (!recos || !recos.length) {
      return opts.emptyHtml || `<p class="empty">Pas assez de données pour des recommandations — importe une playlist et invite des ami·es.</p>`;
    }
    return `<div class="reco-grid${opts.compact ? " reco-grid--compact" : ""}">${recos
      .map((r) => {
        const score = r.score != null ? Number(r.score).toFixed(1) : "";
        const year = r.year ? ` · ${r.year}` : "";
        const genre = r.genre ? `<span class="reco-card__genre">${escapeHtml(r.genre)}</span>` : "";
        return `<button type="button" class="reco-card" data-reco-open="${escapeHtml(r.album_id)}" data-reco-title="${escapeHtml(
          r.title || ""
        )}" data-reco-artist="${escapeHtml(r.artist || "")}" data-reco-year="${escapeHtml(String(r.year || ""))}" data-reco-genre="${escapeHtml(
          r.genre || ""
        )}" data-reco-artwork="${escapeHtml(r.artwork_url || "")}" data-reco-mb="${escapeHtml(
          r.musicbrainz_release_id || ""
        )}">
          ${recoCoverHtml(r)}
          <span class="reco-card__meta">
            <strong class="reco-card__title">${escapeHtml(r.title || "?")}</strong>
            <span class="reco-card__artist">${escapeHtml(r.artist || "?")}${year}</span>
            ${genre}
            ${score ? `<span class="reco-card__score">Score ${score}</span>` : ""}
          </span>
        </button>`;
      })
      .join("")}</div>`;
  }

  async function openCloudReco(btn) {
    const albumId = btn.getAttribute("data-reco-open");
    if (!albumId) return;
    if (albumById(albumId)) {
      navigate("album", { albumId });
      return;
    }
    if (window.SLCloud && SLCloud.getAlbumById) {
      try {
        const row = await SLCloud.getAlbumById(albumId);
        if (row && mergeCloudAlbumFromRow(row)) {
          navigate("album", { albumId });
          return;
        }
      } catch (_) {}
    }
    const id = upsertAlbumFromRemoteHit({
      title: btn.getAttribute("data-reco-title") || "?",
      artist: btn.getAttribute("data-reco-artist") || "?",
      year: btn.getAttribute("data-reco-year") || "",
      genre: btn.getAttribute("data-reco-genre") || "Communauté",
      artworkUrl: btn.getAttribute("data-reco-artwork") || "",
      musicbrainzReleaseId: btn.getAttribute("data-reco-mb") || null,
    });
    navigate("album", { albumId: id });
  }

  function bindRecoCardEvents(root) {
    (root || document).querySelectorAll("[data-reco-open]").forEach((btn) => {
      btn.addEventListener("click", () => void openCloudReco(btn));
    });
  }

  const albumMbCache = new Map();

  async function hydrateAlbumMusicBrainz(al) {
    const panel = document.getElementById("album-mb-panel");
    if (!panel || !al) return;
    const body = panel.querySelector(".album-mb-panel__body");
    if (!body) return;
    const ms = window.SLMusicSearch;
    if (!ms || !ms.fetchReleaseDetail) {
      body.innerHTML = `<p class="feed-note">Module MusicBrainz indisponible.</p>`;
      return;
    }
    let mbId = al.musicbrainzReleaseId || al.musicbrainzId || null;
    let detail = mbId ? albumMbCache.get(mbId) : null;
    try {
      if (!detail) {
        if (mbId) detail = await ms.fetchReleaseDetail(mbId);
        else if (ms.lookupReleaseByArtistTitle) detail = await ms.lookupReleaseByArtistTitle(al.artist, al.title);
        if (detail && detail.releaseId) {
          mbId = detail.releaseId;
          albumMbCache.set(mbId, detail);
          if (!al.musicbrainzReleaseId) {
            al.musicbrainzReleaseId = mbId;
            if (String(al.id).startsWith("ext-")) persist();
            if (window.SLCloud && SLCloud.isSignedIn && SLCloud.isSignedIn()) {
              void SLCloud.upsertAlbum({
                id: al.id,
                title: al.title,
                artist: al.artist,
                year: al.year,
                genre: al.genre,
                artworkUrl: al.artworkUrl || detail.artworkUrl,
                musicbrainzReleaseId: mbId,
              });
            }
          }
        }
      }
      if (!detail) {
        body.innerHTML = `<p class="feed-note">Aucune release MusicBrainz trouvée pour cet album.</p>`;
        return;
      }
      const tracks = detail.tracks || [];
      const trackHtml = tracks.length
        ? `<ol class="album-mb-tracklist">${tracks
            .map((t) => {
              const dur = t.lengthMs && ms.formatDuration ? ms.formatDuration(t.lengthMs) : "";
              return `<li><span class="album-mb-tracklist__n">${t.position || ""}</span><span class="album-mb-tracklist__t">${escapeHtml(
                t.title
              )}</span>${dur ? `<span class="album-mb-tracklist__d">${dur}</span>` : ""}</li>`;
            })
            .join("")}</ol>`
        : `<p class="feed-note">Tracklist non disponible pour cette édition.</p>`;
      const tags =
        detail.genres && detail.genres.length
          ? `<p class="feed-note">Tags : ${detail.genres.map((g) => escapeHtml(g)).join(" · ")}</p>`
          : "";
      body.innerHTML = `
        <p class="feed-note">${escapeHtml(detail.type || "Album")}${detail.year ? ` · ${escapeHtml(detail.year)}` : ""} — identifiant <code>${escapeHtml(detail.releaseId)}</code></p>
        ${tags}
        ${trackHtml}
        <p style="margin-top:0.75rem"><a class="btn btn-ghost btn-sm" href="${escapeHtml(detail.mbUrl)}" target="_blank" rel="noopener noreferrer">Voir sur MusicBrainz</a></p>`;
    } catch (e) {
      body.innerHTML = `<p class="feed-note">MusicBrainz temporairement indisponible.</p>`;
      console.warn("[album-mb]", e);
    }
  }

  function importCatalogHit(hit) {
    const id = upsertAlbumFromRemoteHit({ ...hit, genre: hit.genre || "Import" });
    if (!id) return;
    const key = normalizeKey(hit.artist, hit.title);
    const wasDup = allAlbums().some((a) => a.id !== id && normalizeKey(a.artist, a.title) === key);
    if (wasDup) {
      toast("Cet album est déjà dans ta base locale.");
    } else {
      toast("Album importé — tu peux le noter comme les autres.");
    }
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
    state.eventInterestLocal = state.eventInterestLocal && typeof state.eventInterestLocal === "object" ? state.eventInterestLocal : {};
    state.upcomingTourPreview = Array.isArray(state.upcomingTourPreview) ? state.upcomingTourPreview : [];
  }

  function isCloudUuid(id) {
    return (
      typeof id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    );
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

  function sonarIsDismissed() {
    try {
      return sessionStorage.getItem("sl_sonar_chip") === "1";
    } catch {
      return false;
    }
  }

  function dismissSonarChip() {
    try {
      sessionStorage.setItem("sl_sonar_chip", "1");
    } catch (_) {}
    toast("Astuce Sonar masquée sur cet appareil.");
    render();
  }

  function sonarContextLine() {
    ensureAdaptive();
    const nav = state.adaptive.nav || {};
    const gi = state.adaptive.genreInterest || {};
    const topGenre = Object.entries(gi).sort((a, b) => b[1] - a[1])[0];
    const placement = route.view === "explore" || route.view === "discover" || route.view === "libraries" ? "explore" : route.view;
    if (placement === "explore") {
      if (topGenre && topGenre[1] >= 2) {
        return `Les pastilles mettent en avant <strong>${escapeHtml(topGenre[0])}</strong> selon tes fiches consultées.`;
      }
      return `Les genres se réordonnent localement quand tu explores des albums.`;
    }
    if (placement === "carnet" || route.view === "diary") {
      if ((state.adaptive.listenLogs || 0) > 2) {
        return `<strong>${state.adaptive.listenLogs}</strong> écritures au journal — Sonar affine les pistes à te proposer.`;
      }
      return `Logue des écoutes pour que Sonar personnalise tes suggestions.`;
    }
    if (placement === "home") {
      if (topGenre && topGenre[1] >= 2) {
        return `Piste du jour alignée sur <strong>${escapeHtml(topGenre[0])}</strong> et ton historique local.`;
      }
      return `Suggestion basée sur ton carnet — rien n’est envoyé vers un serveur Sonar.`;
    }
    if ((nav.carnet || 0) + (nav.diary || 0) > (nav.home || 0)) {
      return `Tu passes souvent par le <strong>Carnet</strong> : les reco restent locales à cet appareil.`;
    }
    return `<strong>Sonar</strong> observe tes parcours sur cet appareil uniquement (compteurs + règles fixes).`;
  }

  function sonarChipHtml(placement) {
    if (sonarIsDismissed()) return "";
    return `<aside class="sonar-chip" data-sonar-placement="${escapeHtml(placement || route.view)}">
      <span class="sonar-chip__dot" aria-hidden="true">◎</span>
      <span class="sonar-chip__text">${sonarContextLine()}</span>
      <button type="button" class="sonar-chip__info link" data-sonar-info>?</button>
      <button type="button" class="sonar-chip__dismiss" aria-label="Masquer" data-sonar-dismiss>×</button>
    </aside>`;
  }

  function sonarSuggestReason(placement) {
    ensureAdaptive();
    const gi = state.adaptive.genreInterest || {};
    const top = Object.entries(gi).sort((a, b) => b[1] - a[1])[0];
    if (placement === "explore" && top) return `Genre favori : ${top[0]}`;
    if (placement === "carnet" && (state.adaptive.listenLogs || 0) > 0) return `D’après ton journal`;
    if ((state.cloudImportedTracks || []).length) return `Imports + journal`;
    return `Historique local`;
  }

  function adaptivePickAlbumSuggestion() {
    ensureAdaptive();
    const genreScored = { ...(state.adaptive.genreInterest || {}) };
    for (const l of state.listenings) {
      if (l.userId !== "me") continue;
      const al = albumById(l.albumId);
      if (!al || !al.genre) continue;
      genreScored[al.genre] = (genreScored[al.genre] || 0) + 0.5;
    }
    // Boost par artiste depuis les playlists importées (Spotify/Deezer/YouTube/Last.fm/CSV)
    const artistBoost = Object.create(null);
    const imported = state.cloudImportedTracks || [];
    imported.forEach((t) => {
      const a = String(t.artist_name || "").toLowerCase().trim();
      if (!a) return;
      // Si l'artiste contient plusieurs noms (Spotify multi-artistes), on splitte
      a.split(/[,&;\/]| feat\.| featuring | x | & /i).map((s) => s.trim()).filter(Boolean).forEach((tok) => {
        artistBoost[tok] = (artistBoost[tok] || 0) + 1;
      });
    });
    const ranked = Object.entries(genreScored).sort((a, b) => b[1] - a[1]);
    const g = ranked.length ? ranked[0][0] : null;
    let pool = allAlbums().filter((a) => !state.listenings.some((item) => item.userId === "me" && item.albumId === a.id));
    // Score chaque album : genre + artistBoost
    const scored = pool.map((a) => {
      let s = 0;
      if (g && a.genre === g) s += 3;
      if (a.genre) s += (genreScored[a.genre] || 0);
      const aa = String(a.artist || "").toLowerCase();
      Object.keys(artistBoost).forEach((tok) => { if (tok && aa.includes(tok)) s += 5 * artistBoost[tok]; });
      return { a, s };
    });
    scored.sort((x, y) => y.s - x.s);
    if (!scored.length) return null;
    if (scored[0].s > 0) {
      // Garde un peu de variation : pick parmi top 5
      const top = scored.slice(0, Math.min(5, scored.length));
      const seed = String(state.profile.handle || "x") + ":" + (new Date().toISOString().slice(0, 10));
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) | 0;
      return top[Math.abs(h) % top.length].a;
    }
    // fallback : ancien comportement
    return scored[0].a;
  }

  function sonarSuggestHtml(placement) {
    const place = placement || "home";
    const al = adaptivePickAlbumSuggestion();
    if (!al) return "";
    const hasImports = (state.cloudImportedTracks || []).length > 0;
    const lead =
      place === "carnet"
        ? "Une piste à ajouter à ton carnet selon tes notes et critiques."
        : place === "explore"
          ? hasImports
            ? "Album à explorer — issu de tes imports et de ton activité locale."
            : "Album à explorer selon les genres que tu consultes."
          : hasImports
            ? "Basé sur ton journal et tes playlists importées."
            : "Basé sur ton journal et les fiches que tu ouvres.";
  return `<aside class="feed-side-card feed-side-card--sonar">
      <div class="feed-side-card__kicker">Sonar</div>
      <h3 class="feed-side-card__title">À creuser</h3>
      <p class="sonar-suggest-reason">${escapeHtml(sonarSuggestReason(place))}</p>
      <p class="feed-note sonar-suggest-lead">${escapeHtml(lead)}</p>
      <div class="album-card sonar-suggest-card" data-album="${al.id}"${albumCardStyle(al, "max-width:168px;")}>
        ${coverHtml(al, true)}
        <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)}</span></div>
      </div>
      <p class="sonar-suggest-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-album-open="${al.id}">Fiche</button>
        <button type="button" class="btn btn-primary btn-sm" data-sonar-log="${al.id}">Logger</button>
      </p>
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
    if (isCloudUuid(userId) && window.SLCloud && window.SLCloud.isSignedIn()) {
      void window.SLCloud.removeFriend(userId).catch((e) => {
        toast("Erreur serveur : " + (e.message || ""));
      });
    }
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
    if (cloudSignedIn() && SLCloud && SLCloud.markAllNotificationsRead) {
      void SLCloud.markAllNotificationsRead();
    }
  }

  function mapServerNotification(row) {
    const meta = row.meta && typeof row.meta === "object" ? { ...row.meta } : {};
    if (row.actor_id && !meta.userId) meta.userId = row.actor_id;
    if (meta.listening_id && !meta.listeningId) meta.listeningId = meta.listening_id;
    return {
      id: row.id,
      type: row.type || "info",
      title: String(row.title || ""),
      body: String(row.body || ""),
      read: !!row.read_at,
      at: row.created_at || new Date().toISOString(),
      meta,
      server: true,
    };
  }

  async function syncNotificationsFromCloud() {
    if (!SLCloud || !SLCloud.isSignedIn() || !SLCloud.listNotifications) return;
    try {
      const rows = await SLCloud.listNotifications(50);
      const serverIds = new Set((rows || []).map((r) => r.id));
      const localOnly = (state.notifications || []).filter((n) => !n.server && !serverIds.has(n.id));
      state.notifications = [...(rows || []).map(mapServerNotification), ...localOnly].slice(0, 100);
      updateHeaderNotifications();
    } catch (e) {
      console.warn("[notifications sync]", e);
    }
  }

  const likeState = { counts: {}, mine: new Set() };

  function isCloudListeningId(id) {
    return isCloudUuid(id);
  }

  function isListeningLiked(id) {
    if (isCloudListeningId(id) && cloudSignedIn()) {
      if (likeState.mine.has(id)) return true;
    }
    return !!(state.socialReactions && state.socialReactions[id] && state.socialReactions[id].like);
  }

  function likeCountSuffix(id) {
    const n = isCloudListeningId(id) ? likeState.counts[id] || 0 : 0;
    return n > 0 ? " · " + n : "";
  }

  async function refreshLikeStateForIds(ids) {
    const cloudIds = [...new Set((ids || []).filter(isCloudListeningId))];
    if (!cloudIds.length || !SLCloud || !SLCloud.isSignedIn()) return;
    try {
      const { counts, mine } = await SLCloud.fetchLikeState(cloudIds);
      Object.assign(likeState.counts, counts || {});
      (mine || new Set()).forEach((lid) => likeState.mine.add(lid));
      cloudIds.forEach((lid) => {
        state.socialReactions = state.socialReactions || {};
        state.socialReactions[lid] = state.socialReactions[lid] || {};
        state.socialReactions[lid].like = likeState.mine.has(lid);
      });
    } catch (e) {
      console.warn("[likes]", e);
    }
  }

  async function toggleListeningLike(id) {
    if (!id) return;
    if (isCloudListeningId(id) && SLCloud && SLCloud.isSignedIn()) {
      try {
        const r = await SLCloud.toggleListeningLike(id);
        state.socialReactions = state.socialReactions || {};
        state.socialReactions[id] = state.socialReactions[id] || {};
        state.socialReactions[id].like = !!r.liked;
        const prev = likeState.counts[id] || 0;
        if (r.liked) {
          likeState.mine.add(id);
          likeState.counts[id] = prev + 1;
        } else {
          likeState.mine.delete(id);
          likeState.counts[id] = Math.max(0, prev - 1);
        }
        document.querySelectorAll('[data-soc-react="' + id + '"]').forEach((btn) => {
          btn.classList.toggle("is-on", !!r.liked);
          const base = "♥ J’aime";
          btn.textContent = base + likeCountSuffix(id);
        });
        return;
      } catch (e) {
        toast("Erreur : " + (e.message || "like"));
        return;
      }
    }
    ensureSocialArrays();
    state.socialReactions = state.socialReactions || {};
    const cur = state.socialReactions[id] || {};
    cur.like = !cur.like;
    state.socialReactions[id] = cur;
    persist();
    document.querySelectorAll('[data-soc-react="' + id + '"]').forEach((btn) => {
      btn.classList.toggle("is-on", !!cur.like);
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

  async function acceptIncomingFriendRequest(reqId) {
    ensureSocialArrays();
    const req = state.incomingFriendRequests.find((r) => r.id === reqId);
    if (!req) return;
    try {
      if (isCloudUuid(req.id) && window.SLCloud && window.SLCloud.isSignedIn()) {
        await window.SLCloud.respondFriendRequest(req.id, true);
      }
    } catch (e) {
      toast("Erreur : " + (e.message || "impossible d’accepter"));
      return;
    }
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

  async function declineIncomingFriendRequest(reqId) {
    ensureSocialArrays();
    const req = state.incomingFriendRequests.find((r) => r.id === reqId);
    try {
      if (req && isCloudUuid(req.id) && window.SLCloud && window.SLCloud.isSignedIn()) {
        await window.SLCloud.respondFriendRequest(req.id, false);
      }
    } catch (e) {
      toast("Erreur : " + (e.message || "impossible de refuser"));
      return;
    }
    state.incomingFriendRequests = state.incomingFriendRequests.filter((r) => r.id !== reqId);
    persist();
    toast("Demande refusée.");
    render();
  }

  async function cancelOutgoingFriendRequest(toUserId) {
    ensureSocialArrays();
    try {
      if (isCloudUuid(toUserId) && window.SLCloud && window.SLCloud.isSignedIn()) {
        await window.SLCloud.cancelFriendRequest(toUserId);
      }
    } catch (e) {
      toast("Erreur : " + (e.message || "impossible d’annuler"));
      return;
    }
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
      void acceptIncomingFriendRequest(inc.id);
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
    if (isLegacyDemoUserId(uid)) {
      toast("Ce profil n’existe plus. Cherche un·e utilisateur·trice dans Communauté.");
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
    const preview = [];
    const previewSeen = new Set();
    function pushPreview(artist, datetime, venue, city, url, source) {
      if (!datetime || !withinAlertWindow(datetime)) return;
      const cityLine = [venue, city].filter(Boolean).join(" — ");
      const key = tourSeenKey(artist, datetime, cityLine);
      if (previewSeen.has(key)) return;
      previewSeen.add(key);
      preview.push({ key, artist, datetime, venue: venue || "", city: city || "", url: url || "", source });
    }

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
      pushPreview(row.artist, m.datetime, m.venueName, m.city, m.url, "manual");
    }

    for (const artist of favs) {
      try {
        const events = await fetchBandsintownEvents(artist);
        for (const ev of events) {
          const m = mapBitEvent(ev);
          if (!m.datetime || !withinAlertWindow(m.datetime)) continue;
          if (!eventMatchesUserCity({ city: m.city, region: m.region, country: m.country }, userCity)) continue;
          const art = (ev.lineup && ev.lineup[0] && ev.lineup[0].name) || ev.artist_id || artist;
          const name = String(art || artist);
          maybeNotifyTour(name, m.datetime, m.venueName, m.city, m.url);
          pushPreview(name, m.datetime, m.venueName, m.city, m.url, "bit");
        }
      } catch (_) {
        /* API souvent bloquée hors navigateur ou par rate-limit — dates manuelles restent disponibles */
      }
    }

    preview.sort((a, b) => String(a.datetime).localeCompare(String(b.datetime)));
    state.upcomingTourPreview = preview.slice(0, 48);

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

  const HANDLE_RE = /^[a-z0-9_.\-]{2,32}$/;
  const HANDLE_HINT =
    "Ton identifiant unique sur Soundlog, affiché avec un @ devant (profil, recherche, ajout d’amis). Minuscules, chiffres, point, tiret ou souligné — entre 2 et 32 caractères.";
  const HANDLE_HINT_SHORT =
    "Ton @ sur Soundlog (sans espaces). Ex. mariev, leo_beats — 2 à 32 caractères.";

  function normalizeHandleInput(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function validateHandleInput(raw) {
    const handle = normalizeHandleInput(raw);
    if (!handle) return { ok: false, handle: "", message: "Choisis un identifiant @ (ex. mariev)." };
    if (!HANDLE_RE.test(handle)) {
      return {
        ok: false,
        handle,
        message:
          "Identifiant invalide : uniquement des minuscules, chiffres, point (.), tiret (-) ou souligné (_), entre 2 et 32 caractères.",
      };
    }
    return { ok: true, handle, message: "" };
  }

  function handleFieldHtml({ inputId, previewId, value = "", readonly = false, shortHint = false }) {
    const hint = shortHint ? HANDLE_HINT_SHORT : HANDLE_HINT;
    const ro = readonly ? " readonly" : "";
    const val = escapeHtml(String(value || ""));
    return `<div class="handle-field">
      <label for="${escapeHtml(inputId)}">Identifiant @</label>
      <p class="field-hint">${escapeHtml(hint)}</p>
      <input type="text" id="${escapeHtml(inputId)}" autocomplete="username" spellcheck="false" autocapitalize="off" placeholder="mariev" value="${val}"${ro} />
      <p class="handle-preview handle-preview--empty" id="${escapeHtml(previewId)}" aria-live="polite"></p>
    </div>`;
  }

  function wireHandleFieldPreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    const update = () => {
      const handle = normalizeHandleInput(input.value);
      preview.textContent = handle
        ? `Aperçu sur ton profil : @${handle}`
        : "Aperçu : @ton_identifiant";
      preview.classList.toggle("handle-preview--empty", !handle);
    };
    input.addEventListener("input", update);
    update();
  }

  function userInitial(name) {
    return String(name || "?").trim().charAt(0).toUpperCase() || "?";
  }

  function userAvatarHtml(u, extraClass) {
    if (!u) return "";
    const hue = u.hue != null ? u.hue : hueFromHandle(u.handle || u.name || "x");
    const cls = ["avatar", extraClass].filter(Boolean).join(" ");
    const alt = escapeHtml(String(u.name || u.handle || "Profil"));
    const url = String(u.avatar_url || "").trim();
    if (url) {
      return `<div class="${cls} profile-head__avatar--has-img" style="background:hsl(${hue},55%,42%)"><img src="${escapeHtml(url)}" alt="${alt}" loading="lazy" decoding="async" onerror="this.remove();this.closest('.profile-head__avatar')&&this.closest('.profile-head__avatar').classList.remove('profile-head__avatar--has-img');" /></div>`;
    }
    return `<div class="${cls}" style="background:hsl(${hue},55%,42%)">${escapeHtml(userInitial(u.name))}</div>`;
  }

  function userById(id) {
    if (id === "me") {
      const cloudMe = cloudMeRow();
      if (cloudMe) {
        return {
          id: "me",
          cloudId: cloudMe.id,
          name: cloudMe.name,
          handle: cloudMe.handle,
          bio: cloudMe.bio || "",
          hue: cloudMe.hue != null ? cloudMe.hue : 152,
          avatar_url: cloudMe.avatar_url || "",
        };
      }
      if (cloudSignedIn()) {
        return {
          id: "me",
          name: state.profile.displayName || "Compte",
          handle: state.profile.handle || "…",
          bio: state.profile.bio || "",
          hue: 152,
          avatar_url: "",
        };
      }
      return {
        id: "me",
        name: state.profile.displayName,
        handle: state.profile.handle,
        bio: state.profile.bio,
        hue: 152,
        avatar_url: "",
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
        avatar_url: peer.avatar_url || "",
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
        avatar_url: cloudPeer.avatar_url || "",
      };
    }
    if (isLegacyDemoUserId(id)) return null;
    return null;
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
    const payload = { v: 1, n: state.profile.displayName, h: state.profile.handle, t: token, s };
    const cloudMe = cloudMeRow();
    if (cloudMe && cloudMe.id) payload.c = cloudMe.id;
    return payload;
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
    const cloudHint = cloudSignedIn()
      ? "<p class=\"feed-note\">Lien avec ton <strong>compte en ligne</strong> : la personne pourra t'ajouter en ami·e après connexion, et vos carnets se synchronisent.</p>"
      : "<p class=\"feed-note\">Copie ce lien (mode local). Pour des invitations avec compte synchronisé, connecte-toi d'abord.</p>";
    openModal(`<h2>Lien d’invitation</h2>
      ${cloudHint}
      <p class="feed-note">La personne ouvre Soundlog sur son navigateur.</p>
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
    return `background:linear-gradient(145deg,${album.from},${album.to});`;
  }

  function albumTintStyle(album, extra) {
    if (!album) return extra || "";
    const from = album.from || "#2a3142";
    const to = album.to || "#141820";
    let s = `--tint-from:${from};--tint-to:${to};`;
    if (extra) s += extra;
    return s;
  }

  function albumCardStyle(al, extraCss) {
    const s = albumTintStyle(al, extraCss);
    return s ? ` style="${s}"` : "";
  }

  const COVER_FALLBACK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';

  function bestArtworkUrl(album) {
    let url = String((album && album.artworkUrl) || "").trim();
    if (!url) return "";
    return url
      .replace(/100x100bb/gi, "600x600bb")
      .replace(/\/100x100-/gi, "/600x600-")
      .replace(/cover_medium/gi, "cover_big");
  }

  function coverHtml(album, small, sizeHint) {
    if (!album) return "";
    const size = sizeHint || (small ? "sm" : "md");
    const artUrl = bestArtworkUrl(album);
    const grad = coverStyle(album);
    const label = escapeHtml(`${album.title} — ${album.artist || ""}`.trim());
    const titleBit = escapeHtml(small ? album.title.slice(0, 20) : album.title);
    const frameCls = ["cover-frame", "cover-frame--" + size, artUrl ? "has-art" : ""].filter(Boolean).join(" ");
    const coverCls = artUrl ? "cover has-img" : "cover is-fallback";
    const img = artUrl
      ? `<img class="cover-img" src="${escapeHtml(artUrl)}" alt="${label}" loading="lazy" decoding="async" width="600" height="600" />`
      : "";
    return `<div class="${frameCls}" data-album="${escapeHtml(album.id || "")}" style="${albumTintStyle(album)}">
      <div class="cover-glow" style="${grad}" aria-hidden="true"></div>
      <div class="${coverCls}" style="${grad}" role="img" aria-label="${label}">
        ${img}
        <span class="cover-fallback-icon" aria-hidden="true">${COVER_FALLBACK_SVG}</span>
        <span class="cover-text">${titleBit}</span>
      </div>
    </div>`;
  }

  function toast(msg) {
    $toast.innerHTML = `<div class="toast">${escapeHtml(msg)}</div>`;
    setTimeout(() => {
      $toast.innerHTML = "";
    }, 2400);
  }

  let modalKeydownHandler = null;

  function closeModal() {
    document.body.classList.remove("modal-open", "modal-open--log-listen");
    if (typeof window.__slLogListenCleanup === "function") {
      window.__slLogListenCleanup();
      window.__slLogListenCleanup = null;
    }
    if (modalKeydownHandler) {
      document.removeEventListener("keydown", modalKeydownHandler);
      modalKeydownHandler = null;
    }
    $modal.innerHTML = "";
  }

  function openModal(html, opts) {
    opts = opts || {};
    document.body.classList.add("modal-open");
    if (opts.variant === "log-listen") document.body.classList.add("modal-open--log-listen");
    const modalCls = opts.variant === "log-listen" ? " modal--log-listen" : "";
    $modal.innerHTML = `<div class="modal-backdrop" id="modal-bd"><div class="modal${modalCls}">${html}</div></div>`;
    document.getElementById("modal-bd").addEventListener("click", (e) => {
      if (e.target.id === "modal-bd") closeModal();
    });
  }

/* ---- UX v2 : hubs, drawer ---- */
  function navViewForRoute() {
    const v = route.view;
    if (v === "discover" || v === "libraries" || v === "explore") return "explore";
    if (v === "diary" || v === "wishlist" || v === "lists" || v === "carnet") return "carnet";
    if (v === "iwas") return "social";
    return v;
  }

  function normalizeRouteToHubs() {
    const map = {
      discover: { view: "explore", hubTab: "albums" },
      libraries: { view: "explore", hubTab: "import" },
      diary: { view: "carnet", hubTab: "journal" },
      wishlist: { view: "carnet", hubTab: "pile" },
      lists: { view: "carnet", hubTab: "lists" },
      iwas: { view: "social", hubTab: "live" },
    };
    const m = map[route.view];
    if (m) {
      Object.assign(route, m);
      if (m.hubTab === "albums" || m.hubTab === "import") state.exploreTab = m.hubTab;
      if (m.hubTab === "journal" || m.hubTab === "pile" || m.hubTab === "lists") state.carnetTab = m.hubTab;
      if (m.hubTab === "community" || m.hubTab === "live") state.socialTab = m.hubTab;
    }
  }

  function hubTabsHtml(tabs, activeId, hubName) {
    return `<div class="hub-tabs" role="tablist" data-hub="${escapeHtml(hubName)}">${tabs
      .map(
        (t) =>
          `<button type="button" role="tab" class="hub-tab${activeId === t.id ? " is-active" : ""}" data-hub-tab="${escapeHtml(t.id)}" aria-selected="${activeId === t.id}">${escapeHtml(t.label)}</button>`
      )
      .join("")}</div>`;
  }

  function wireHubTabs(hubName, onPick) {
    document.querySelectorAll(`[data-hub="${hubName}"] [data-hub-tab]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-hub-tab");
        if (tab) onPick(tab);
      });
    });
  }

  function renderExploreHub() {
    const tab = route.hubTab || state.exploreTab || "albums";
    const tabs = hubTabsHtml(
      [
        { id: "albums", label: "Albums" },
        { id: "import", label: "Importer" },
      ],
      tab,
      "explore"
    );
    const title = tab === "import" ? "Bibliothèques" : "Découvrir";
    const body = tab === "import" ? renderLibraries() : renderDiscover();
    return `<div class="hub-page view-themed" data-hub-page="explore"><header class="hub-page__head"><p class="hub-page__kicker">Explorer</p><h1 class="hub-page__title">${title}</h1>${tabs}${tab === "albums" ? sonarChipHtml("explore") : ""}</header><div class="hub-page__body hub-page__body--nested">${body}</div></div>`;
  }

  function renderCarnetHub() {
    const tab = route.hubTab || state.carnetTab || "journal";
    const tabs = hubTabsHtml(
      [
        { id: "journal", label: "Journal" },
        { id: "pile", label: "À écouter" },
        { id: "lists", label: "Listes" },
      ],
      tab,
      "carnet"
    );
    let body = "";
    let title = "Journal";
    if (tab === "pile") {
      body = renderWishlist();
      title = "À écouter";
    } else if (tab === "lists") {
      body = renderLists();
      title = "Listes";
    } else {
      body = renderDiary();
      title = "Journal";
    }
    const sonarHint = tab === "journal" ? sonarChipHtml("carnet") : "";
    return `<div class="hub-page view-themed" data-hub-page="carnet"><header class="hub-page__head"><p class="hub-page__kicker">Mon carnet</p><h1 class="hub-page__title">${title}</h1>${tabs}${sonarHint}</header><div class="hub-page__body hub-page__body--nested">${body}</div></div>`;
  }

  function renderSocialHub() {
    const tab = route.hubTab || state.socialTab || "community";
    const tabs = hubTabsHtml(
      [
        { id: "community", label: "Cercle" },
        { id: "live", label: "Live" },
      ],
      tab,
      "social"
    );
    const body = tab === "live" ? renderIWasThere() : renderSocial();
    const title = tab === "live" ? "I was there !" : "Communauté";
    return `<div class="hub-page view-social-themed" data-hub-page="social"><header class="hub-page__head"><p class="hub-page__kicker">Social</p><h1 class="hub-page__title">${title}</h1>${tabs}</header><div class="hub-page__body hub-page__body--nested">${body}</div></div>`;
  }

  function openInboxDrawer(threadId) {
    route.inboxDrawer = true;
    if (threadId) route.dmThreadId = threadId;
    document.body.classList.add("inbox-drawer-open");
    const backdrop = document.getElementById("inbox-drawer-backdrop");
    const drawer = document.getElementById("inbox-drawer");
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.setAttribute("aria-hidden", "false");
    }
    if (drawer) drawer.hidden = false;
    const mount = document.getElementById("inbox-drawer-mount");
    if (mount) {
      mount.innerHTML = renderInbox();
      void injectInboxHydration();
    }
    const btn = document.getElementById("topbar-messages");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  function closeInboxDrawer() {
    route.inboxDrawer = false;
    route.dmThreadId = null;
    document.body.classList.remove("inbox-drawer-open");
    const backdrop = document.getElementById("inbox-drawer-backdrop");
    const drawer = document.getElementById("inbox-drawer");
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.setAttribute("aria-hidden", "true");
    }
    if (drawer) drawer.hidden = true;
    const mount = document.getElementById("inbox-drawer-mount");
    if (mount) mount.innerHTML = "";
    const btn = document.getElementById("topbar-messages");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if ((window.location.hash || "").includes("messagerie")) {
      navigate(route.view === "inbox" ? "home" : route.view);
    }
  }

  function bindInboxDrawerShell() {
    const closeBtn = document.getElementById("inbox-drawer-close");
    const backdrop = document.getElementById("inbox-drawer-backdrop");
    const openBtn = document.getElementById("topbar-messages");
    if (closeBtn) closeBtn.addEventListener("click", closeInboxDrawer);
    if (backdrop) backdrop.addEventListener("click", closeInboxDrawer);
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        if (document.body.classList.contains("inbox-drawer-open")) closeInboxDrawer();
        else openInboxDrawer(route.dmThreadId);
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("inbox-drawer-open")) closeInboxDrawer();
    });
  }

  const NAV_LABELS = {
    home: "Accueil",
    explore: "Explorer",
    carnet: "Carnet",
    social: "Social",
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
    inbox: "Messages",
  };

  function setNavActive() {
    document.querySelectorAll(".nav-link[data-view]").forEach((b) => {
      const navV = navViewForRoute();
      const active = route.view !== "join" && b.dataset.view === navV;
      b.classList.toggle("active", active);
    });
    const msgBtn = document.getElementById("topbar-messages");
    if (msgBtn) msgBtn.classList.toggle("is-active", document.body.classList.contains("inbox-drawer-open"));
    const titleEl = document.getElementById("topbar-title");
    if (titleEl) {
      if (getSearchQuery()) titleEl.textContent = "Recherche";
      else if (route.view === "album") titleEl.textContent = "Album";
      else if (route.view === "profile") titleEl.textContent = "Profil";
      else if (route.view === "list") titleEl.textContent = "Liste";
      else if (route.view === "explore") titleEl.textContent = "Explorer";
      else if (route.view === "carnet") titleEl.textContent = "Carnet";
      else if (route.view === "inbox") titleEl.textContent = "Messages";
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


  function getSearchQuery() {
    return String(route.searchQuery || $search.value || "").trim();
  }

  function applySearchQuery(q, opts) {
    opts = opts || {};
    const t = String(q || "").trim();
    route.searchQuery = t || null;
    $search.value = t;
    if (opts.pushHash !== false) {
      if (t) window.location.hash = "#recherche/" + encodeURIComponent(t);
      else window.location.hash = buildHash();
    }
    if (opts.render !== false) render();
  }

  function clearSearchQuery(opts) {
    opts = opts || {};
    route.searchQuery = null;
    $search.value = "";
    closePopover();
    if (opts.pushHash !== false) window.location.hash = buildHash();
    if (opts.render !== false) render();
  }

  function navigate(view, extra) {
    const legacyNav = {
      discover: { view: "explore", hubTab: "albums" },
      libraries: { view: "explore", hubTab: "import" },
      diary: { view: "carnet", hubTab: "journal" },
      wishlist: { view: "carnet", hubTab: "pile" },
      lists: { view: "carnet", hubTab: "lists" },
      iwas: { view: "social", hubTab: "live" },
    };
    if (legacyNav[view]) {
      const m = legacyNav[view];
      view = m.view;
      extra = Object.assign({}, m, extra || {});
    }

    const pop = document.getElementById("notif-popover");
    const bell = document.getElementById("notif-bell");
    if (pop && bell) {
      pop.hidden = true;
      bell.setAttribute("aria-expanded", "false");
    }
    Object.assign(route, { view, albumId: null, userId: null, listId: null, discoverGenre: null, dmThreadId: null, inboxDrawer: false, searchQuery: null }, extra || {});
    if (!(extra && extra.keepSearch)) {
      route.searchQuery = null;
      $search.value = "";
    }
    if (extra && extra.hubTab != null) route.hubTab = extra.hubTab;
    else if (view === "explore") route.hubTab = route.hubTab || state.exploreTab || "albums";
    else if (view === "carnet") route.hubTab = route.hubTab || state.carnetTab || "journal";
    else if (view === "social") route.hubTab = route.hubTab || state.socialTab || "community";
    window.location.hash = buildHash();
    render();
  }

  function buildHash() {
    if (route.searchQuery) return "#recherche/" + encodeURIComponent(route.searchQuery);
    if (route.view === "album" && route.albumId) return `#album/${route.albumId}`;
    if (route.view === "profile" && route.userId) return `#profil/${route.userId}`;
    if (route.view === "list" && route.listId) return `#liste/${route.listId}`;
    if (route.view === "inbox" && route.dmThreadId) return `#messagerie/${route.dmThreadId}`;
    if (route.view === "inbox") return "#messagerie";
    if (route.view === "discover" && route.discoverGenre) return `#decouvrir/${encodeURIComponent(route.discoverGenre)}`;
    if (route.view === "explore") {
      const t = route.hubTab || "albums";
      if (t === "import") return "#bibliotheques";
      if (route.discoverGenre) return `#decouvrir/${encodeURIComponent(route.discoverGenre)}`;
      return "#decouvrir";
    }
    if (route.view === "carnet") {
      const t = route.hubTab || "journal";
      if (t === "pile") return "#a-ecouter";
      if (t === "lists") return "#listes";
      return "#journal";
    }
    if (route.view === "social" && route.hubTab === "live") return "#i-was-there";
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
    route.dmThreadId = null;
    route.joinInviteRaw = null;
    route.searchQuery = null;
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
    else if (h.startsWith("messagerie/")) {
      route.view = "inbox";
      route.dmThreadId = h.slice("messagerie/".length);
    } else if (h === "messagerie") route.view = "inbox";
    else if (h.startsWith("recherche/")) {
      route.searchQuery = decodeURIComponent(h.slice("recherche/".length).replace(/\+/g, " "));
    } else if (h.startsWith("rejoindre/")) {
      route.view = "join";
      route.joinInviteRaw = h.slice("rejoindre/".length);
    } else {
      route.view = "home";
    }
    normalizeRouteToHubs();
    if (route.searchQuery) $search.value = route.searchQuery;
  }

  function avgAlbumRating(albumId) {
    const list = state.listenings.filter((l) => l.albumId === albumId && l.rating);
    if (!list.length) return null;
    const sum = list.reduce((a, l) => a + l.rating, 0);
    return Math.round((sum / list.length) * 10) / 10;
  }

  function feedCircleIds() {
    const ids = new Set(["me"]);
    (state.follows || []).forEach((id) => {
      if (includeUserInCircle(id)) ids.add(id);
    });
    (state.friends || []).forEach((id) => {
      if (includeUserInCircle(id)) ids.add(id);
    });
    return ids;
  }

  function formatRelativeFeedTime(iso) {
    if (!iso) return "";
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return String(iso).slice(0, 10);
    const d = Date.now() - t;
    if (d < 60000) return "à l'instant";
    if (d < 3600000) return Math.floor(d / 60000) + " min";
    if (d < 86400000) return Math.floor(d / 3600000) + " h";
    if (d < 604800000) return Math.floor(d / 86400000) + " j";
    return String(iso).slice(0, 10);
  }

  /** @type {{ rows: object[]; at: number; err?: string } | null} */
  let homeDiscoverFeedCache = null;
  let homeDiscoverFeedFetchPromise = null;
  /** @type {{ rows: object[]; at: number } | null} */
  let homeCircleFeedCache = null;
  let homeCircleFeedFetchPromise = null;

  function triggerHomeCircleFeedFetch() {
    const maxAge = 75000;
    const W = window.SLCloud;
    const now = Date.now();
    if (!W || !W.ready || !cloudSignedIn()) {
      homeCircleFeedCache = null;
      return;
    }
    if (homeCircleFeedCache && now - homeCircleFeedCache.at < maxAge) return;
    if (homeCircleFeedFetchPromise) return;
    homeCircleFeedFetchPromise = W.publicFeed(96)
      .then((rows) => {
        homeCircleFeedCache = { rows: rows || [], at: Date.now() };
        const ids = (rows || []).map((r) => r.listening_id).filter(Boolean);
        void refreshLikeStateForIds(ids);
      })
      .catch((e) => {
        console.warn("[home circle feed]", e);
        homeCircleFeedCache = { rows: [], at: Date.now() };
      })
      .finally(() => {
        homeCircleFeedFetchPromise = null;
        if (route.view === "home" && state.feedHomeTab !== "discover") render();
      });
  }

  function listeningFromPublicRow(row) {
    registerPeerFromPublicRow(row);
    ensureAlbumFromPublicFeedRow(row);
    return {
      id: row.listening_id,
      userId: row.user_id,
      albumId: row.album_id,
      rating: row.rating,
      review: row.comment || "",
      date: row.date || row.created_at,
      cloud: true,
    };
  }

  function unifiedFeedItems() {
    triggerHomeCircleFeedFetch();
    const ids = feedCircleIds();
    const local = state.listenings.filter((l) => ids.has(l.userId));
    const seen = new Set(local.map((l) => l.id));
    const merged = [...local];
    if (cloudSignedIn() && homeCircleFeedCache && homeCircleFeedCache.rows) {
      homeCircleFeedCache.rows.forEach((row) => {
        if (!row.user_id || !ids.has(row.user_id)) return;
        const lid = row.listening_id;
        if (!lid || seen.has(lid)) return;
        seen.add(lid);
        merged.push(listeningFromPublicRow(row));
      });
    }
    return merged.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  function registerPeerFromPublicRow(row) {
    const uid = row.user_id;
    if (!uid || !window.__slCloudPeers) return;
    if (window.__slCloudPeers.has(uid)) return;
    window.__slCloudPeers.set(uid, {
      id: uid,
      name: row.name,
      handle: row.handle,
      hue: row.hue,
      bio: "",
    });
  }

  function ensureAlbumFromPublicFeedRow(row) {
    const id = row.album_id;
    if (!id) return null;
    let al = albumById(id);
    if (al) return al;
    state.importedAlbums = state.importedAlbums || [];
    if (!state.importedAlbums.some((a) => a.id === id)) {
      state.importedAlbums.push({
        id,
        title: row.album_title || "?",
        artist: row.album_artist || "?",
        year: row.album_year,
        genre: "",
        artworkUrl: row.artwork_url || "",
        from: "#2a2a35",
        to: "#121218",
      });
    }
    return albumById(id);
  }

  function publicFeedPostHtml(row) {
    registerPeerFromPublicRow(row);
    const al = ensureAlbumFromPublicFeedRow(row);
    if (!al) return "";
    const uid = row.user_id;
    const u = userById(uid);
    if (!u) return "";
    const whenIso = String(row.date || row.created_at || "");
    const when = formatRelativeFeedTime(whenIso);
    const listenId = row.listening_id;
    const signed = window.SLCloud && window.SLCloud.isSignedIn && window.SLCloud.isSignedIn();
    const liked = isListeningLiked(listenId);
    const likeBtn =
      signed && listenId
        ? `<button type="button" class="feed-post__action-btn soc-react-btn${liked ? " is-on" : ""}" data-soc-react="${escapeHtml(listenId)}">♥ J’aime${escapeHtml(likeCountSuffix(listenId))}</button>`
        : "";
    const commentBtn = signed
      ? `<button type="button" class="feed-post__action-btn" data-cloud-comments-on="${escapeHtml(listenId)}"><span class="feed-ic feed-ic--bubble" aria-hidden="true"></span> Commenter</button>`
      : `<span class="feed-post__action-btn feed-post__action-btn--disabled" title="Connecte-toi pour commenter"><span class="feed-ic feed-ic--bubble" aria-hidden="true"></span> Commenter</span>`;
    return `<article class="feed-post feed-post--cloud-public" data-album="${al.id}" data-preview-album="${escapeHtml(al.id)}" data-feed-listening-id="${escapeHtml(listenId)}">
            <header class="feed-post__head">
              <span class="feed-post__avatar" style="background:hsl(${u.hue},55%,42%)">${escapeHtml(u.name.charAt(0))}</span>
              <div class="feed-post__who">
                <button type="button" class="feed-post__user" data-profile="${escapeHtml(u.id)}">${escapeHtml(u.name)}</button>
                <span class="feed-post__verb">a noté un album</span>
                <span class="feed-post__cloud-tag" title="Écoute en ligne">Cloud</span>
              </div>
              <time class="feed-post__time" datetime="${escapeHtml(whenIso)}" title="${escapeHtml(whenIso)}">${escapeHtml(when)}</time>
            </header>
            <div class="feed-post__media">${coverHtml(al, false)}</div>
            <div class="feed-post__album">
              <button type="button" class="feed-post__album-title" data-album-open="${al.id}">${escapeHtml(al.title)}</button>
              <span class="feed-post__album-meta">${escapeHtml(al.artist)} · ${al.year}</span>
              ${previewNoteHtml(al)}
            </div>
            <div class="feed-post__stars">${starString(row.rating)}</div>
            ${feedPreviewSectionHtml(al)}
            <div class="feed-post__caption">${row.comment ? `<p>${escapeHtml(row.comment)}</p>` : `<p class="feed-note feed-post__muted">Pas de critique.</p>`}</div>
            <footer class="feed-post__actions">
              <button type="button" class="feed-post__action-btn feed-post__action-btn--preview" data-preview-play="${escapeHtml(al.id)}" aria-pressed="false"><span class="feed-ic feed-ic--play" aria-hidden="true"></span> <span data-preview-btn-label>Extrait 30 s</span></button>
              ${likeBtn}
              ${commentBtn}
              <button type="button" class="feed-post__action-btn" data-album-open="${escapeHtml(al.id)}"><span class="feed-ic feed-ic--disc" aria-hidden="true"></span> Fiche album</button>
            </footer>
          </article>`;
  }

  function triggerHomeDiscoverFeedFetch() {
    const maxAge = 75000;
    const W = window.SLCloud;
    const now = Date.now();
    if (homeDiscoverFeedCache && homeDiscoverFeedCache.err === "no-cloud" && W && W.ready) {
      homeDiscoverFeedCache = null;
    }
    if (homeDiscoverFeedCache && now - homeDiscoverFeedCache.at < maxAge && !homeDiscoverFeedCache.err) return;
    if (homeDiscoverFeedFetchPromise) return;
    if (!W || !W.ready) {
      homeDiscoverFeedCache = { rows: [], at: now, err: "no-cloud" };
      return;
    }
    homeDiscoverFeedFetchPromise = W.publicFeed(48)
      .then((rows) => {
        homeDiscoverFeedCache = { rows: rows || [], at: Date.now() };
        const ids = (rows || []).map((r) => r.listening_id).filter(Boolean);
        void refreshLikeStateForIds(ids);
      })
      .catch((e) => {
        homeDiscoverFeedCache = { rows: [], at: Date.now(), err: String(e.message || e || "erreur") };
      })
      .finally(() => {
        homeDiscoverFeedFetchPromise = null;
        if (route.view === "home" && state.feedHomeTab === "discover") render();
      });
  }

  function renderHomeDiscoverBody() {
    triggerHomeDiscoverFeedFetch();
    if (homeDiscoverFeedFetchPromise && !homeDiscoverFeedCache) {
      return `<div class="feed-empty-card feed-empty-card--loading"><p class="feed-empty-card__title">Chargement du fil…</p><p class="feed-empty-card__text">Les dernières écoutes publiques arrivent.</p></div>`;
    }
    const c = homeDiscoverFeedCache;
    if (!c) {
      return `<div class="feed-empty-card feed-empty-card--loading"><p class="feed-empty-card__title">Chargement du fil…</p><p class="feed-empty-card__text">Préparation…</p></div>`;
    }
    if (c.err === "no-cloud") {
      return `<div class="feed-empty-card"><p class="feed-empty-card__title">Découvrir & connecté·es</p><p class="feed-empty-card__text">Ouvre une session Soundlog (Supabase) pour voir le flux public des écoutes.</p><p class="feed-empty-card__actions"><button type="button" class="btn btn-primary btn-sm" id="feed-open-account">Se connecter</button></p></div>`;
    }
    if (c.err) {
      return `<div class="feed-empty-card"><p class="feed-empty-card__title">Fil indisponible</p><p class="feed-empty-card__text">${escapeHtml(c.err)}</p></div>`;
    }
    if (!c.rows.length) {
      return `<div class="feed-empty-card"><p class="feed-empty-card__title">C’est tout calme</p><p class="feed-empty-card__text">Les notes des comptes synchronisés apparaîtront ici.</p></div>`;
    }
    return c.rows.map((row) => publicFeedPostHtml(row)).filter(Boolean).join("");
  }

  function feedItems() {
    if (cloudSignedIn()) return unifiedFeedItems();
    const ids = feedCircleIds();
    return state.listenings
      .filter((l) => ids.has(l.userId))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  function concertFeedItems() {
    const ids = feedCircleIds();
    return (state.concertLogs || [])
      .filter((c) => ids.has(c.userId))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  function collectMyTasteAlbumIds() {
    const s = new Set();
    state.listenings.filter((l) => l.userId === "me").forEach((l) => s.add(l.albumId));
    (state.wishlist || []).forEach((id) => s.add(id));
    state.lists.filter((l) => l.userId === "me").forEach((l) => (l.albumIds || []).forEach((id) => s.add(id)));
    return s;
  }

  function collectLocalTasteAlbumIdsForUser(userId) {
    const s = new Set();
    state.listenings.filter((l) => l.userId === userId).forEach((l) => s.add(l.albumId));
    state.lists.filter((l) => l.userId === userId).forEach((l) => (l.albumIds || []).forEach((id) => s.add(id)));
    if (userId === "me") (state.wishlist || []).forEach((id) => s.add(id));
    return s;
  }

  function tasteOverlapScore(setA, setB) {
    if (!setA.size && !setB.size) return { score: 0, shared: 0, union: 0, j: 0 };
    let inter = 0;
    for (const x of setA) if (setB.has(x)) inter++;
    const union = new Set([...setA, ...setB]).size;
    const j = union ? inter / union : 0;
    const denom = Math.max(setA.size, setB.size, 1);
    const score = Math.min(100, Math.round(100 * (0.55 * j + 0.45 * (inter / denom))));
    return { score, shared: inter, union, j };
  }

  async function computeMusicCompatibilityWith(uid) {
    const mine = collectMyTasteAlbumIds();
    const uuidPeer =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(uid));
    if (!uuidPeer || !window.SLCloud || !SLCloud.ready || !SLCloud.client) {
      const peerLocal = collectLocalTasteAlbumIdsForUser(uid);
      return { ...tasteOverlapScore(mine, peerLocal), sharedAlbumIds: [...mine].filter((a) => peerLocal.has(a)).slice(0, 12) };
    }
    const peer = new Set();
    try {
      const [lis, listRows] = await Promise.all([SLCloud.listListeningsByUser(uid), SLCloud.listListsByUser(uid)]);
      (lis || []).forEach((l) => peer.add(l.album_id));
      (listRows || []).forEach((lst) => (lst.list_items || []).forEach((it) => peer.add(it.album_id)));
    } catch (_) {}
    const ov = tasteOverlapScore(mine, peer);
    const sharedAlbumIds = [...mine].filter((a) => peer.has(a)).slice(0, 16);
    return { ...ov, sharedAlbumIds };
  }

  function myEventInterestKeys() {
    ensureSocialArrays();
    const keys = new Set();
    Object.keys(state.eventInterestLocal || {}).forEach((k) => {
      if (state.eventInterestLocal[k]) keys.add(k);
    });
    return keys;
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
    if (window.SLSocial && window.SLSocial.renderLive) return window.SLSocial.renderLive();
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
          <p class="passport-kicker">Carnet officiel du voyage musical</p>
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
    if (window.SLSocial && window.SLSocial.renderCircle) return window.SLSocial.renderCircle();
    return `<div class="view-page social-hub soc-page"><p class="empty">Module social indisponible — recharge la page.</p></div>`;
  }

  const DM_PAYLOAD_PREFIX = "SLDM:";
  const DM_PINNED_KEY = "soundlog.dmPinned";

  function getDmPinned() {
    try {
      const raw = localStorage.getItem(DM_PINNED_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
    } catch (_) {
      return [];
    }
  }

  function toggleDmPinned(threadId) {
    const id = String(threadId || "");
    if (!id) return;
    let pins = getDmPinned();
    if (pins.includes(id)) pins = pins.filter((x) => x !== id);
    else pins = [id, ...pins].slice(0, 12);
    try {
      localStorage.setItem(DM_PINNED_KEY, JSON.stringify(pins));
    } catch (_) {}
  }

  function encodeDmPayload(payload) {
    return DM_PAYLOAD_PREFIX + JSON.stringify(payload);
  }

  function parseDmPayload(body) {
    const s = String(body || "");
    if (!s.startsWith(DM_PAYLOAD_PREFIX)) return null;
    try {
      const o = JSON.parse(s.slice(DM_PAYLOAD_PREFIX.length));
      if (!o || o.v !== 1 || !o.type) return null;
      return o;
    } catch (_) {
      return null;
    }
  }

  function dmPreviewText(body) {
    const p = parseDmPayload(body);
    if (!p) return String(body || "").replace(/\s+/g, " ").trim().slice(0, 72) || "…";
    switch (p.type) {
      case "album":
        return `💿 ${p.title || "Album"} — ${p.artist || ""}`.trim();
      case "listening":
        return `🎧 ${p.title || "Écoute"} · ${p.artist || ""}`.trim();
      case "concert":
        return `🎤 ${p.artist || "Live"} · ${p.date || ""}`.trim();
      case "preview":
        return `▶ Extrait · ${p.title || "Album"}`;
      case "discovery":
        return `✨ Découverte · ${p.label || p.title || "Musique"}`;
      case "moment":
        return `🌙 Moment · ${p.text || ""}`.trim().slice(0, 60);
      default:
        return "🎵 Partage musical";
    }
  }

  function dmAlbumFromPayload(p) {
    if (p.albumId) {
      const al = albumById(p.albumId);
      if (al) return al;
    }
    if (p.title && p.artist) {
      const g = gradientFromKey(p.title + p.artist);
      return {
        id: p.albumId || "",
        title: p.title,
        artist: p.artist,
        year: p.year || "",
        genre: p.genre || "",
        from: g.from,
        to: g.to,
        artworkUrl: p.artworkUrl || "",
      };
    }
    return null;
  }

  function dmShareCardHtml(p) {
    if (p.type === "album" || p.type === "listening" || p.type === "preview") {
      const al = dmAlbumFromPayload(p);
      if (!al) return `<p class="dm-card-fallback">Album partagé</p>`;
      const rating = p.rating != null ? `<span class="dm-card__rating">${starString(p.rating)}</span>` : "";
      const note = p.note ? `<p class="dm-card__note">${escapeHtml(p.note)}</p>` : "";
      const previewBtn =
        p.type === "preview" || p.albumId
          ? `<button type="button" class="dm-card__play" data-preview-play="${escapeHtml(al.id)}">▶ 30 s</button>`
          : "";
      return `<div class="dm-music-card" data-album="${escapeHtml(al.id)}"${albumCardStyle(al)}>
        <div class="dm-music-card__cover">${coverHtml(al, true, "md")}</div>
        <div class="dm-music-card__meta">
          ${rating}
          <strong class="dm-music-card__title">${escapeHtml(al.title)}</strong>
          <span class="dm-music-card__artist">${escapeHtml(al.artist)} · ${escapeHtml(String(al.year))}</span>
          ${note}
          <div class="dm-music-card__actions">
            ${previewBtn}
            <button type="button" class="dm-card__open" data-album-open="${escapeHtml(al.id)}">Ouvrir</button>
          </div>
        </div>`;
    }
    if (p.type === "concert") {
      const g = gradientFromKey((p.artist || "") + (p.city || ""));
      const fake = { title: p.artist || "Live", artist: p.venue || p.city || "Concert", from: g.from, to: g.to, artworkUrl: "" };
      return `<div class="dm-music-card dm-music-card--gig">
        <div class="dm-music-card__cover">${coverHtml(fake, true, "sm")}</div>
        <div class="dm-music-card__meta">
          <span class="dm-card__badge">Live</span>
          <strong class="dm-music-card__title">${escapeHtml(p.artist || "Artiste")}</strong>
          <span class="dm-music-card__artist">${escapeHtml(p.date || "")} · ${escapeHtml([p.venue, p.city].filter(Boolean).join(" · "))}</span>
        </div>
      </div>`;
    }
    if (p.type === "discovery") {
      return `<div class="dm-music-card dm-music-card--discover">
        <p class="dm-card__badge">Découverte</p>
        <strong>${escapeHtml(p.label || p.title || "Un son pour toi")}</strong>
        ${p.text ? `<p class="dm-card__note">${escapeHtml(p.text)}</p>` : ""}
      </div>`;
    }
    if (p.type === "moment") {
      return `<div class="dm-music-card dm-music-card--moment">
        <p class="dm-card__badge">Moment</p>
        <p class="dm-card__note">${escapeHtml(p.text || "")}</p>
      </div>`;
    }
    return "";
  }

  function dmMessageBubbleHtml(m, meId) {
    const isMe = m.sender_id === meId;
    const p = parseDmPayload(m.body);
    const time = escapeHtml((m.created_at || "").slice(11, 16));
    const reactions = `<div class="dm-bubble__reacts">
      <button type="button" class="dm-react" data-dm-react="${escapeHtml(m.id)}" data-emoji="🔥" title="Feu">🔥</button>
      <button type="button" class="dm-react" data-dm-react="${escapeHtml(m.id)}" data-emoji="💿" title="Disque">💿</button>
      <button type="button" class="dm-react" data-dm-react="${escapeHtml(m.id)}" data-emoji="🎧" title="Écoute">🎧</button>
    </div>`;
    if (p) {
      return `<div class="dm-bubble dm-bubble--card ${isMe ? "dm-bubble--me" : "dm-bubble--them"}" data-msg-id="${escapeHtml(m.id)}">
        ${dmShareCardHtml(p)}
        <div class="dm-bubble__foot"><span class="dm-bubble__time">${time}</span>${isMe ? reactions : ""}</div>
      </div>`;
    }
    return `<div class="dm-bubble ${isMe ? "dm-bubble--me" : "dm-bubble--them"}" data-msg-id="${escapeHtml(m.id)}">
        <p class="dm-bubble__text">${escapeHtml(m.body)}</p>
        <div class="dm-bubble__foot"><span class="dm-bubble__time">${time}</span>${isMe ? reactions : ""}</div>
      </div>`;
  }

  async function sendDmPayload(threadId, payload) {
    const body = encodeDmPayload(payload);
    if (body.length > 2000) throw new Error("Partage trop volumineux.");
    return SLCloud.sendDmMessage(threadId, body);
  }

  function dmShareTrayHtml() {
    return `<div class="dm-share-tray" id="dm-share-tray">
      <button type="button" class="dm-share-chip" data-dm-share-kind="listening">🎧 Écoute</button>
      <button type="button" class="dm-share-chip" data-dm-share-kind="album">💿 Album</button>
      <button type="button" class="dm-share-chip" data-dm-share-kind="preview">▶ Extrait</button>
      <button type="button" class="dm-share-chip" data-dm-share-kind="moment">🌙 Moment</button>
      <button type="button" class="dm-share-chip" data-dm-share-kind="discovery">✨ Découverte</button>
    </div>`;
  }

  function dmThreadPanelShell(threadId) {
    return `<div class="dm-chat" id="inbox-thread-panel" data-thread-id="${escapeHtml(threadId)}">
        <header class="dm-chat__head">
          <button type="button" class="dm-chat__back" data-inbox-back aria-label="Retour">←</button>
          <div class="dm-chat__peer" id="dm-chat-peer">
            <span class="dm-chat__peer-avatar" id="dm-peer-avatar">♫</span>
            <div>
              <strong class="dm-chat__peer-name" id="dm-peer-name">…</strong>
              <span class="dm-chat__peer-status feed-note" id="dm-peer-status">Ami·e Soundlog</span>
            </div>
          </div>
          <button type="button" class="dm-chat__pin" id="dm-pin-thread" data-thread-pin="${escapeHtml(threadId)}" title="Épingler">📌</button>
        </header>
        <div class="dm-chat__messages" id="inbox-messages" role="log" aria-live="polite"></div>
        ${dmShareTrayHtml()}
        <form class="dm-compose" id="inbox-compose">
          <button type="button" class="dm-compose__attach" id="dm-toggle-share" title="Partager de la musique">+</button>
          <label class="visually-hidden" for="inbox-msg-input">Message</label>
          <input type="text" id="inbox-msg-input" class="dm-compose__input" maxlength="2000" placeholder="Message ou partage un son…" autocomplete="off" />
          <button type="submit" class="dm-compose__send" aria-label="Envoyer">↑</button>
        </form>
      </div>`;
  }

  function openDmShareModal(threadId, kind) {
    const recent = state.listenings
      .filter((l) => l.userId === "me")
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 8);
    if (kind === "moment" || kind === "discovery") {
      openModal(`<h2>${kind === "moment" ? "Moment musical" : "Découverte"}</h2>
        <label>Message</label>
        <input type="text" id="dm-share-text" maxlength="200" placeholder="Ce morceau me fait penser à…" />
        <p style="margin-top:0.85rem">
          <button type="button" class="btn btn-primary" id="dm-share-send">Envoyer</button>
          <button type="button" class="btn btn-ghost" id="dm-share-cancel">Annuler</button>
        </p>`);
      document.getElementById("dm-share-cancel").onclick = closeModal;
      document.getElementById("dm-share-send").onclick = async () => {
        const text = (document.getElementById("dm-share-text") && document.getElementById("dm-share-text").value.trim()) || "";
        if (!text) return toast("Écris quelques mots.");
        try {
          await sendDmPayload(threadId, { v: 1, type: kind, text });
          closeModal();
          toast("Envoyé.");
          if (route.dmThreadId === threadId) void hydrateInboxThread(threadId);
        } catch (e) {
          toast(e.message || "Erreur");
        }
      };
      return;
    }
    const rows = recent
      .map((l) => {
        const al = albumById(l.albumId);
        if (!al) return "";
        return `<button type="button" class="dm-pick-row" data-dm-pick-album="${escapeHtml(l.albumId)}" data-dm-pick-rating="${l.rating || ""}">
          ${coverHtml(al, true, "sm")}
          <span><strong>${escapeHtml(al.title)}</strong><span class="feed-note">${escapeHtml(al.artist)}</span></span>
        </button>`;
      })
      .join("");
    openModal(`<h2>Partager ${kind === "preview" ? "un extrait" : kind === "listening" ? "une écoute" : "un album"}</h2>
      <p class="feed-note">Choisis un disque de ton carnet récent.</p>
      <div class="dm-pick-list">${rows || "<p class=\"empty\">Logue une écoute dans ton Journal d'abord.</p>"}</div>
      <p style="margin-top:0.85rem"><button type="button" class="btn btn-ghost" id="dm-share-cancel">Fermer</button></p>`);
    document.getElementById("dm-share-cancel").onclick = closeModal;
    document.querySelectorAll("[data-dm-pick-album]").forEach((btn) => {
      btn.onclick = async () => {
        const albumId = btn.getAttribute("data-dm-pick-album");
        const al = albumById(albumId);
        if (!al) return;
        const rating = btn.getAttribute("data-dm-pick-rating");
        const payload = {
          v: 1,
          type: kind === "preview" ? "preview" : kind === "listening" ? "listening" : "album",
          albumId: al.id,
          title: al.title,
          artist: al.artist,
          year: al.year,
          genre: al.genre,
          artworkUrl: bestArtworkUrl(al),
          rating: rating ? Number(rating) : null,
        };
        try {
          await sendDmPayload(threadId, payload);
          closeModal();
          toast("Partagé dans la conversation.");
          if (route.dmThreadId === threadId) void hydrateInboxThread(threadId);
        } catch (e) {
          toast(e.message || "Erreur");
        }
      };
    });
  }

  function dmSortThreads(items) {
    const pins = getDmPinned();
    return [...items].sort((a, b) => {
      const ap = pins.includes(a.thread.id) ? 0 : 1;
      const bp = pins.includes(b.thread.id) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      const at = (a.lastMessage && a.lastMessage.created_at) || "";
      const bt = (b.lastMessage && b.lastMessage.created_at) || "";
      return at < bt ? 1 : -1;
    });
  }

  function dmThreadRowHtml({ thread, other, lastMessage }, activeId) {
    const tid = thread.id;
    const pinned = getDmPinned().includes(tid);
    const name = other ? escapeHtml(other.name) : "…";
    const handle = other ? escapeHtml(other.handle) : "";
    const preview = lastMessage ? escapeHtml(dmPreviewText(lastMessage.body)) : "Nouvelle conversation";
    const avatar = other
      ? userAvatarHtml(other, "dm-thread__avatar")
      : `<span class="dm-thread__avatar">?</span>`;
    return `<li>
      <button type="button" class="dm-thread${activeId === tid ? " is-active" : ""}${pinned ? " is-pinned" : ""}" data-open-thread="${escapeHtml(tid)}">
        ${avatar}
        <span class="dm-thread__body">
          <span class="dm-thread__top"><strong>${name}</strong>${pinned ? '<span class="dm-thread__pin" aria-hidden="true">📌</span>' : ""}</span>
          <span class="dm-thread__handle">@${handle}</span>
          <span class="dm-thread__preview">${preview}</span>
        </span>
      </button>
    </li>`;
  }

  function wireDmChatActions(root) {
    if (!root) return;
    root.querySelectorAll("[data-preview-play]").forEach((b) => {
      if (b.dataset.dmWired) return;
      b.dataset.dmWired = "1";
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        void playAlbumPreview(b.getAttribute("data-preview-play"));
      });
    });
    root.querySelectorAll("[data-album-open]").forEach((b) => {
      if (b.dataset.dmWired) return;
      b.dataset.dmWired = "1";
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.getAttribute("data-album-open");
        if (id) navigate("album", { albumId: id });
      });
    });
    root.querySelectorAll("[data-dm-react]").forEach((b) => {
      if (b.dataset.dmWired) return;
      b.dataset.dmWired = "1";
      b.addEventListener("click", () => toast(b.getAttribute("data-emoji") + " — réaction enregistrée"));
    });
  }

  function renderInbox() {
    const signed = window.SLCloud && SLCloud.isSignedIn && SLCloud.isSignedIn();
    if (!signed) {
      return `<div class="dm-page dm-page--gate view-themed">
        <div class="dm-gate">
          <p class="dm-gate__kicker">Messages privés</p>
          <h1 class="dm-gate__title">Tes conversations musicales</h1>
          <p class="dm-gate__text">Connecte-toi pour échanger des albums, des extraits et des découvertes avec tes ami·es.</p>
          <button type="button" class="btn btn-primary" id="inbox-open-account">Se connecter</button>
        </div>
      </div>`;
    }
    const threadId = route.dmThreadId;
    const mainContent = threadId
      ? dmThreadPanelShell(threadId)
      : `<div class="dm-chat dm-chat--empty" id="dm-empty-state">
          <div class="dm-empty-state__icon" aria-hidden="true">♫</div>
          <h2 class="dm-empty-state__title">Choisis une conversation</h2>
          <p class="dm-empty-state__text">Partage un album, un extrait de 30 secondes ou un moment musical — comme un message vocal, mais pour la musique.</p>
        </div>`;
    return `<div class="dm-page view-themed${threadId ? " dm-page--thread" : ""}">
      <aside class="dm-sidebar" id="dm-sidebar">
        <header class="dm-sidebar__head">
          <div>
            <p class="dm-sidebar__kicker">Nuit sociale</p>
            <h1 class="dm-sidebar__title">Messages</h1>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-nav-view="social">Communauté</button>
        </header>
        <div class="dm-sidebar__search-wrap">
          <input type="search" class="dm-sidebar__search" id="dm-thread-filter" placeholder="Rechercher…" autocomplete="off" />
        </div>
        <div class="dm-sidebar__list" id="inbox-list-panel">
          <p class="feed-note">Chargement des conversations…</p>
        </div>
      </aside>
      <main class="dm-main${threadId ? " dm-main--active" : ""}" id="dm-main">
        ${mainContent}
      </main>
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
    const inviterCloudId = payload.c && isCloudUuid(payload.c) ? String(payload.c) : "";
    const cloudInviteBlock = inviterCloudId
      ? `<div class="panel join-panel join-panel--cloud"><h2>Compte en ligne</h2><p class="feed-note">Connecte-toi pour envoyer une demande d'ami à ${invName}.</p><p style="margin-top:0.5rem"><button type="button" class="btn btn-primary" id="join-cloud-friend" data-inviter-id="${escapeHtml(inviterCloudId)}">Demande d'ami</button> <button type="button" class="btn btn-ghost" id="join-open-account">Se connecter</button></p></div>`
      : "";
    return `<div class="join-view">
      <header class="join-hero">
        <p class="join-hero__kicker">${inviterCloudId ? "Invitation Soundlog" : "Invitation locale Soundlog"}</p>
        <h1 class="page-title join-hero__title">Bienvenue</h1>
        <p class="page-sub join-hero__lead"><strong>${invName}</strong> (@${invHandle}) t’invite à rejoindre Soundlog.${inviterCloudId ? " Connecte-toi pour synchroniser ton carnet." : " Mode local : données sur cet appareil uniquement."}</p>
      </header>
      ${cloudInviteBlock}
      <div class="panel join-panel">
        <h2>Créer ton profil local</h2>
        <label for="join-name">Nom affiché</label>
        <input type="text" id="join-name" autocomplete="nickname" placeholder="Ton prénom ou surnom" />
        ${handleFieldHtml({ inputId: "join-handle", previewId: "join-handle-preview", shortHint: true })}
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
    const ids = [
      "me",
      ...new Set([...(state.follows || []), ...(state.friends || [])].filter((id) => includeUserInCircle(id))),
    ];
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


  function renderHomeQuickStrip() {
    return `<div class="home-quick-strip" role="toolbar" aria-label="Actions rapides">
      <button type="button" class="home-quick-chip home-quick-chip--accent" id="home-log-listen">+ Logger</button>
      <button type="button" class="home-quick-chip" data-nav-view="explore">Explorer</button>
      <button type="button" class="home-quick-chip" id="home-open-messages">Messages</button>
      <button type="button" class="home-quick-chip" data-nav-view="carnet">Carnet</button>
    </div>`;
  }

  function renderLocalShoutCards() {
    ensureSocialArrays();
    const rows = (state.shoutouts || [])
      .slice()
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 4);
    if (!rows.length) return "";
    const badge = cloudSignedIn()
      ? `<span class="home-murmurs__badge">Sur cet appareil</span>`
      : `<span class="home-murmurs__badge">Local</span>`;
    return `<section class="home-murmurs home-murmurs--local"><header class="home-murmurs__head"><h2 class="home-murmurs__title">Murmures</h2>${badge}</header><div class="home-murmurs__list">${rows
      .map((s) => {
        const u = userById(s.userId);
        if (!u) return "";
        return `<article class="home-murmur-card"><span class="home-murmur-card__avatar" style="background:hsl(${u.hue},55%,42%)">${escapeHtml(u.name.charAt(0))}</span><div class="home-murmur-card__body"><strong>${escapeHtml(u.name)}</strong><p>${escapeHtml(s.text)}</p><span class="feed-note">${escapeHtml((s.at || "").slice(0, 16).replace("T", " "))}</span></div></article>`;
      })
      .join("")}</div></section>`;
  }

  function renderHomeMurmursBlock() {
    const signed = cloudSignedIn();
    if (signed) {
      return `<div class="home-murmurs-wrap"><section class="home-murmurs home-murmurs--cloud"><header class="home-murmurs__head"><h2 class="home-murmurs__title">Murmures</h2><span class="home-murmurs__badge">Communauté</span><button type="button" class="btn btn-ghost btn-sm" id="home-shoutouts-add">Publier</button></header><div id="home-cloud-shoutouts" class="home-murmurs__list"><p class="feed-note">Chargement…</p></div></section>${renderLocalShoutCards()}</div>`;
    }
    const local = renderLocalShoutCards();
    if (local) return `<div class="home-murmurs-wrap">${local}</div>`;
    return `<div class="home-murmurs-wrap home-murmurs-wrap--hint"><p class="feed-note">Connecte-toi pour publier des murmures visibles par la communauté.</p></div>`;
  }

  function injectHomeFeedExtras() {
    if (route.view !== "home") return;
    const log = document.getElementById("home-log-listen");
    if (log) log.addEventListener("click", () => openListenModal(null, null));
    const msg = document.getElementById("home-open-messages");
    if (msg) msg.addEventListener("click", () => openInboxDrawer());
    const add = document.getElementById("home-shoutouts-add");
    if (add) add.addEventListener("click", () => { if (window.__sl && window.__sl.openShoutout) window.__sl.openShoutout(); });
    const node = document.getElementById("home-cloud-shoutouts");
    if (node && window.__sl && window.__sl.renderCloudShoutoutsInto) {
      if (window.__sl.cloudShoutouts && window.__sl.cloudShoutouts.length) window.__sl.renderCloudShoutoutsInto(node);
      else if (window.__sl.refreshShoutouts) window.__sl.refreshShoutouts();
    }
  }

  function renderHome() {
    const tab = state.feedHomeTab === "discover" ? "discover" : "following";
    const allItems = tab === "following" ? feedItems() : [];
    const shownLimit = Math.max(10, state.feedHomeShown || 15);
    const items = tab === "following" ? allItems.slice(0, shownLimit) : [];
    const hasMore = tab === "following" && allItems.length > shownLimit;
    const followingBody =
      allItems.length === 0 && tab === "following"
        ? `<div class="feed-empty-card"><p class="feed-empty-card__title">Ton fil est tout calme</p><p class="feed-empty-card__text">Ajoute des <strong>ami·es</strong>, suis des profils dans <strong>Communauté</strong>, ou logue une écoute dans le <strong>Journal</strong>.</p></div>`
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
              const whenRel = formatRelativeFeedTime(l.date);
              const liked = isListeningLiked(l.id);
              return `<article class="feed-post soc-feed-card" data-album="${al.id}" data-preview-album="${escapeHtml(al.id)}" data-feed-listening-id="${escapeHtml(l.id)}">
            <header class="feed-post__head">
              <span class="feed-post__avatar" style="background:hsl(${u.hue},55%,42%)">${escapeHtml(u.name.charAt(0))}</span>
              <div class="feed-post__who">
                <button type="button" class="feed-post__user" data-profile="${u.id}">${escapeHtml(u.name)}</button>
                <span class="feed-post__verb">a noté un album</span>
              </div>
              <time class="feed-post__time" datetime="${escapeHtml(l.date)}" title="${escapeHtml(l.date)}">${escapeHtml(whenRel)}</time>
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
            <footer class="feed-post__actions soc-feed-card__actions">
              <button type="button" class="feed-post__action-btn feed-post__action-btn--preview" data-preview-play="${escapeHtml(al.id)}" aria-pressed="false"><span class="feed-ic feed-ic--play" aria-hidden="true"></span> <span data-preview-btn-label>Extrait 30 s</span></button>
              <button type="button" class="feed-post__action-btn soc-react-btn${liked ? " is-on" : ""}" data-soc-react="${escapeHtml(l.id)}">♥ J’aime${escapeHtml(likeCountSuffix(l.id))}</button>
              <button type="button" class="feed-post__action-btn" data-comment-on="${escapeHtml(l.id)}"><span class="feed-ic feed-ic--bubble" aria-hidden="true"></span> Commenter</button>
              <button type="button" class="feed-post__action-btn" data-album-open="${escapeHtml(al.id)}"><span class="feed-ic feed-ic--disc" aria-hidden="true"></span> Fiche album</button>
            </footer>
          </article>`;
            })
            .join("") +
      (hasMore
        ? `<p class="feed-load-more-wrap"><button type="button" class="btn btn-ghost" id="feed-load-more">Charger plus (${allItems.length - shownLimit} restantes)</button></p>`
        : "");
    const streamBody = tab === "discover" ? renderHomeDiscoverBody() : followingBody;
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
    const tabFollowingActive = tab === "following" ? " is-active" : "";
    const tabDiscoverActive = tab === "discover" ? " is-active" : "";

    const railSonar = sonarSuggestHtml("home");
    const railLive =
      concerts.length === 0
        ? ""
        : `<aside class="feed-rail-card feed-rail-card--live">
        <p class="feed-rail-card__kicker">Live</p>
        <h3 class="feed-rail-card__title">I was there !</h3>
        <ul class="feed-rail-card__list">${concerts
          .map((c) => {
            const u = userById(c.userId);
            const line = `${c.artist}${c.eventTitle && c.eventTitle.trim() ? " — " + c.eventTitle : ""} · ${c.date}`;
            return `<li><button type="button" class="link" data-profile="${u.id}">${escapeHtml(u.name)}</button> — ${escapeHtml(line)}</li>`;
          })
          .join("")}</ul>
        <button type="button" class="btn btn-ghost btn-sm" data-nav-view="social" data-hub-live="1">Tout voir</button>
      </aside>`;
    return `<div class="feed-page feed-page--unified">
      <header class="feed-page__header feed-page__header--compact">
        <div>
          <p class="feed-page__kicker">Ton fil</p>
          <h1 class="feed-page__title">Accueil</h1>
          <p class="feed-page__lead">Écoutes de ton cercle, tendances et murmures — tout au même endroit.</p>
        </div>
      </header>
      ${renderHomeQuickStrip()}
      <div class="feed-home-tabs" role="tablist" aria-label="Fil d'accueil">
        <button type="button" role="tab" class="feed-home-tab${tabFollowingActive}" aria-selected="${tab === "following"}" data-feed-tab="following">Suivis &amp; ami·es</button>
        <button type="button" role="tab" class="feed-home-tab${tabDiscoverActive}" aria-selected="${tab === "discover"}" data-feed-tab="discover">Tendances</button>
      </div>
      ${feedStoryStripHtml()}
      ${window.SLSocial && window.SLSocial.renderActivityRail ? window.SLSocial.renderActivityRail() : ""}
      ${renderHomeMurmursBlock()}
      <div class="feed-layout feed-layout--unified">
        <div class="feed-stream feed-stream--main">${streamBody}</div>
        <aside class="feed-rail">${railSonar}${railLive}</aside>
      </div>
    </div>`;  }

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
        (al) => `<div class="album-card" data-album="${al.id}"${albumCardStyle(al)}>
        ${coverHtml(al)}
        <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)} · ${al.year}</span></div>
      </div>`
      )
      .join("");
    return `<div class="discover-view view-themed discover-view--carnet">
      <div class="discover-hero">
        <p class="discover-hero__kicker">Explorer le catalogue</p>
        <h1 class="page-title discover-hero__title">Découvrir</h1>
        <p class="page-sub discover-hero__sub">Pochettes, genres, imports — comme feuilleter les bacs du magasin. <span class="feed-note">Les pastilles de genre sont réordonnées par <strong>Sonar</strong> selon les disques que tu consultes (local).</span></p>
      </div>
      <div class="chip-row discover-chips"><button type="button" class="chip${!g ? " active" : ""}" data-genre="">Tout</button>${chips}</div>
      <div class="grid-albums discover-grid">${grid}</div>
    </div>`;
  }

  function computeDiaryStats(listenings) {
    const rated = listenings.filter((l) => l.rating);
    const withReview = listenings.filter((l) => l.review && String(l.review).trim());
    const uniqueAlbums = new Set(listenings.map((l) => l.albumId));
    const avg =
      rated.length === 0
        ? "—"
        : (rated.reduce((a, l) => a + Number(l.rating), 0) / rated.length).toFixed(1);
    const now = new Date();
    const thisMonth = listenings.filter((l) => {
      if (!l.date) return false;
      const d = new Date(l.date + "T12:00:00");
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return {
      total: listenings.length,
      albums: uniqueAlbums.size,
      reviews: withReview.length,
      avg,
      thisMonth,
    };
  }

  function diaryMonthLabel(dateStr) {
    if (!dateStr) return "Sans date";
    const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
    if (Number.isNaN(d.getTime())) return "Sans date";
    const s = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function diaryDateLabel(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
    if (Number.isNaN(d.getTime())) return escapeHtml(dateStr);
    return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  }

  function filterDiaryListenings(listenings) {
    const f = state.diaryFilter || "all";
    if (f === "reviewed") return listenings.filter((l) => l.review && String(l.review).trim());
    if (f === "loved") return listenings.filter((l) => Number(l.rating) >= 4);
    return listenings;
  }

  function renderDiaryCard(l) {
    const al = albumById(l.albumId);
    if (!al) return "";
    const rating = Number(l.rating) || 0;
    const ratingCls = rating >= 4 ? " diary-card__rating--high" : "";
    const review = l.review && String(l.review).trim();
    return `<article class="diary-card" data-album="${al.id}" data-preview-album="${escapeHtml(al.id)}">
      <div class="diary-card__cover-wrap">
        ${coverHtml(al, true)}
        <span class="diary-card__rating${ratingCls}" title="Note">${rating ? rating.toFixed(1) : "—"}</span>
      </div>
      <div class="diary-card__body">
        <p class="diary-card__date">${escapeHtml(diaryDateLabel(l.date))}</p>
        <h3 class="diary-card__title"><button type="button" class="link" data-album="${al.id}">${escapeHtml(al.title)}</button></h3>
        <p class="diary-card__artist">${escapeHtml(al.artist)}${al.year ? ` · ${al.year}` : ""}</p>
        <div class="diary-card__meta">
          <span class="diary-card__stars" aria-label="Note">${starString(l.rating)}</span>
          ${al.genre ? `<span class="diary-card__genre">${escapeHtml(al.genre)}</span>` : ""}
        </div>
        <p class="diary-card__review${review ? "" : " diary-card__review--empty"}">${review ? escapeHtml(review) : "Pas de critique — ajoute ton avis depuis Modifier."}</p>
        ${previewNoteHtml(al)}
        <div class="diary-card__actions">
          <button type="button" class="btn btn-ghost btn-sm feed-post__action-btn--preview" data-preview-play="${escapeHtml(al.id)}" aria-pressed="false">Extrait</button>
          <button type="button" class="btn btn-ghost btn-sm" data-edit-listen="${l.id}">Modifier</button>
          <button type="button" class="btn btn-ghost btn-sm" data-del-listen="${l.id}">Supprimer</button>
        </div>
      </div>
    </article>`;
  }

  function renderDiary() {
    const mine = state.listenings
      .filter((l) => l.userId === "me")
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    const filtered = filterDiaryListenings(mine);
    const stats = computeDiaryStats(mine);
    const filter = state.diaryFilter || "all";
    const filters = [
      { id: "all", label: "Tout" },
      { id: "reviewed", label: "Avec critique" },
      { id: "loved", label: "Notes 4+" },
    ];
    const filtersHtml = filters
      .map(
        (f) =>
          `<button type="button" class="diary-filter${filter === f.id ? " is-active" : ""}" data-diary-filter="${f.id}">${f.label}</button>`
      )
      .join("");

    let timelineHtml = "";
    if (!filtered.length) {
      timelineHtml = `<div class="diary-empty">
        <p class="diary-empty__title">${mine.length ? "Aucune entrée pour ce filtre" : "Ton journal est vide"}</p>
        <p class="feed-note">${mine.length ? "Essaie un autre filtre ou ajoute une nouvelle écoute." : "Logue un album pour commencer ton carnet daté."}</p>
        <p style="margin-top:1rem"><button type="button" class="btn btn-primary" id="btn-add-listen">+ Logger une écoute</button></p>
      </div>`;
    } else {
      const groups = new Map();
      for (const l of filtered) {
        const key = (l.date || "").slice(0, 7) || "0000-00";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(l);
      }
      const keys = [...groups.keys()].sort((a, b) => (a < b ? 1 : -1));
      timelineHtml = keys
        .map((key) => {
          const entries = groups.get(key);
          const label = key === "0000-00" ? "Sans date" : diaryMonthLabel(entries[0].date);
          const cards = entries.map((l) => renderDiaryCard(l)).join("");
          return `<section class="diary-month" id="diary-month-${escapeHtml(key)}">
            <header class="diary-month__head">
              <h2 class="diary-month__title">${escapeHtml(label)}</h2>
              <span class="diary-month__count">${entries.length} écoute${entries.length > 1 ? "s" : ""}</span>
            </header>
            <div class="diary-month__cards">${cards}</div>
          </section>`;
        })
        .join("");
    }

    return `<div class="diary-carnet view-themed">
      <header class="diary-carnet__masthead">
        <p class="diary-carnet__lead">Chaque carte est une page de ton agenda — date, note, critique et extrait.</p>
        <button type="button" class="btn btn-primary" id="btn-add-listen">+ Logger</button>
        <div class="diary-stats" aria-label="Statistiques du journal">
          <div class="diary-stat"><b>${stats.total}</b><span>écoutes</span></div>
          <div class="diary-stat"><b>${stats.albums}</b><span>albums</span></div>
          <div class="diary-stat"><b>${stats.reviews}</b><span>critiques</span></div>
          <div class="diary-stat"><b>${stats.avg}</b><span>moyenne</span></div>
          <div class="diary-stat"><b>${stats.thisMonth}</b><span>ce mois</span></div>
        </div>
        <div class="diary-carnet__toolbar">
          <div class="diary-filters" role="tablist" aria-label="Filtrer le journal">${filtersHtml}</div>
        </div>
      </header>
      <div class="diary-timeline diary-timeline--carnet">${timelineHtml}</div>
    </div>`;
  }


  function renderLists() {
    const mine = state.lists.filter((l) => l.userId === "me");
    const others = state.lists.filter((l) => l.userId !== "me");
    const inCarnet = route.view === "carnet" || route.view === "lists";
    const row = (lst, carnet) => {
      const u = userById(lst.userId);
      const coverStrip =
        carnet && lst.albumIds && lst.albumIds.length
          ? `<div class="list-shelf-card__covers">${lst.albumIds
              .slice(0, 4)
              .map((aid) => {
                const al = albumById(aid);
                return al ? coverHtml(al, true) : "";
              })
              .filter(Boolean)
              .join("")}</div>`
          : "";
      const cardCls = carnet ? "list-row list-shelf-card list-shelf-card--carnet" : "list-row list-shelf-card";
      return `<div class="${cardCls}" data-list="${lst.id}">
        ${coverStrip}
        <div><strong>${escapeHtml(lst.title)}</strong> <span class="feed-note">— ${escapeHtml(u.name)} · ${
        lst.albumIds.length
      } album${lst.albumIds.length !== 1 ? "s" : ""}</span>
        ${lst.description ? `<p class="feed-note" style="margin:0.25rem 0 0">${escapeHtml(lst.description)}</p>` : ""}
        </div>
        <span aria-hidden="true">›</span>
      </div>`;
    };
    const intro = inCarnet
      ? `<div class="carnet-lists-intro">
          <div class="carnet-lists-intro__stats">
            <span class="carnet-lists-stat"><b>${mine.length}</b> à toi</span>
            <span class="carnet-lists-stat"><b>${others.length}</b> communauté</span>
          </div>
          <button type="button" class="btn btn-primary" id="btn-new-list">+ Nouvelle liste</button>
        </div>`
      : "";
    return `<div class="lists-view view-themed">
      <div class="lists-hero">
        <p class="lists-hero__kicker">Collections</p>
        <h1 class="page-title lists-hero__title">Listes</h1>
        <p class="page-sub lists-hero__sub">Tes rangées et celles de la communauté — étiquettes façon dos de boîte.</p>
        <button type="button" class="btn btn-primary" id="btn-new-list">+ Nouvelle liste</button>
      </div>
      ${intro}
      <h3 class="lists-section-title">Tes listes</h3>
      <div class="lists-shelf">${mine.length ? mine.map((l) => row(l, inCarnet)).join("") : `<p class="empty">Aucune liste pour l’instant.</p>`}</div>
      ${others.length ? `<h3 class="lists-section-title">Communauté</h3>
      <div class="lists-shelf">${others.map((l) => row(l, inCarnet)).join("")}</div>` : ""}
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
            return `<div class="album-card" data-album="${al.id}"${albumCardStyle(al)}>
          ${coverHtml(al)}
          <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)}</span></div>
          <button type="button" class="btn btn-ghost btn-sm" data-rm-wish="${al.id}">Retirer</button>
        </div>`;
          })
          .join("")
      : `<p class="empty">Ta pile « à écouter » est vide. Ajoute depuis une fiche album ou via les suggestions ci-dessus.</p>`;

    const inCarnet = route.view === "carnet" || route.view === "wishlist";
    const pileIntro = inCarnet
      ? `<div class="carnet-pile-intro">
          <div class="carnet-pile-intro__stats">
            <span class="carnet-pile-stat"><b>${ids.length}</b> dans la pile</span>
            <span class="carnet-pile-stat"><b>${suggestions.length}</b> suggestions</span>
          </div>
        </div>`
      : "";
    return `<div class="wishlist-view view-themed">
      <div class="wishlist-hero">
        <p class="wishlist-hero__kicker">À déballer plus tard</p>
        <h1 class="page-title wishlist-hero__title">À écouter</h1>
        <p class="page-sub wishlist-hero__sub">Ta pile de disques « pas encore passés sur la platine ».</p>
      </div>
      ${pileIntro}
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

    return `<div class="album-detail-view view-themed view-page">
      <div class="album-detail-backdrop" aria-hidden="true"></div>
      <div class="two-col album-detail-grid">
      <div>
        <div class="album-hero">
          ${coverHtml(al, false, "lg")}
          <div>
            <h1 class="page-title" style="margin-bottom:0.25rem">${escapeHtml(al.title)}</h1>
            <p class="page-sub" style="margin:0">${escapeHtml(al.artist)} · ${al.year} · ${escapeHtml(al.genre)}</p>
            <p>Note moyenne Soundlog : <strong class="stars">${avg != null ? starString(avg) + " (" + avg + "/5)" : "—"}</strong></p>
            <p style="margin:0.65rem 0 0">
              <button type="button" class="btn btn-ghost btn-sm" id="btn-share-album">Partager la fiche</button>
            </p>
          </div>
        </div>
        <div class="panel album-mb-panel" id="album-mb-panel" data-album-mb="${escapeHtml(al.id)}">
          <h3>Tracklist MusicBrainz</h3>
          <div class="album-mb-panel__body"><p class="feed-note">Chargement de la tracklist officielle…</p></div>
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

    const uuidPeer =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(uid));
    const canDm =
      !isMe && isFriend(uid) && uuidPeer && window.SLCloud && SLCloud.isSignedIn && SLCloud.isSignedIn();
    const friendTools =
      !isMe && isFriend(uid)
        ? `<div class="profile-friend-tools">
             <div class="compat-meter" aria-label="Compatibilité musicale">
               <span class="compat-meter__label">Compat</span>
               <div class="compat-meter__track"><span class="compat-meter__fill" data-compat-fill style="width:0%"></span></div>
               <strong class="compat-meter__pct" data-compat-pct>…</strong>
             </div>
             <button type="button" class="btn btn-ghost btn-sm" data-compat-detail="${escapeHtml(uid)}">Test détaillé</button>
             ${canDm ? `<button type="button" class="btn btn-primary btn-sm" data-open-dm="${escapeHtml(uid)}">Message</button>` : ""}
           </div>`
        : "";

    const shareProfileBtn =
      uuidPeer || (isMe && state.profile.cloudId)
        ? `<button type="button" class="btn btn-ghost btn-sm" id="profile-copy-link" data-profile-share="${escapeHtml(isMe && state.profile.cloudId ? state.profile.cloudId : uid)}">Copier le lien du profil</button>`
        : "";
    const profileActions = `<div class="profile-actions-row">${followBtn}${friendBlock ? ` <span class="profile-actions-gap"></span> ${friendBlock}` : ""} ${shareProfileBtn}</div>`;

    const recent = listenings
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 6)
      .map((l) => {
        const al = albumById(l.albumId);
        if (!al) return "";
        return `<div class="album-card" data-album="${al.id}"${albumCardStyle(al, "max-width:120px;")}>${coverHtml(al, true)}<div class="album-meta"><span class="stars">${starString(
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
          ${friendTools}
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
      <h3 class="profile-section-title">Playlists importées <small class="feed-note" style="font-weight:400">Spotify · Deezer · YouTube · Last.fm · CSV</small></h3>
      <div id="profile-imports-block" class="imports-block"><p class="empty" style="padding:0.5rem">Chargement…</p></div>
      ${isMe ? `<p style="margin-top:0.4rem"><button type="button" class="btn btn-ghost btn-sm" data-open-imports>+ Importer une nouvelle playlist</button></p>` : ""}
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
        return `<div class="album-card" data-album="${al.id}"${albumCardStyle(al)}>
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
    // Cache pour les cloud users
    const cache = __slSearchCache;
    const cloudUsers = (cache && cache.q === qq) ? (cache.users || []) : [];
    const local = (function () {
      // Reuse buildSearchEntities via the same engine (mais search page = sans limite)
      const albumsAll = allAlbums();
      const importedTracks = state.cloudImportedTracks || [];
      const albums = albumsAll.filter((a) =>
        (a.title || "").toLowerCase().includes(qq) ||
        (a.artist || "").toLowerCase().includes(qq) ||
        (a.genre || "").toLowerCase().includes(qq));
      const artistMap = new Map();
      albumsAll.forEach((a) => {
        const k = (a.artist || "").toLowerCase().trim();
        if (!k) return;
        if (!artistMap.has(k)) artistMap.set(k, { name: a.artist, count: 0, albumIds: [] });
        const e = artistMap.get(k); e.count++; e.albumIds.push(a.id);
      });
      importedTracks.forEach((t) => {
        const k = (t.artist_name || "").toLowerCase().trim();
        if (!k) return;
        if (!artistMap.has(k)) artistMap.set(k, { name: t.artist_name, count: 0, albumIds: [], imported: true });
        else artistMap.get(k).count++;
      });
      const artists = Array.from(artistMap.values())
        .filter((a) => a.name.toLowerCase().includes(qq))
        .sort((a, b) => b.count - a.count);
      const tracks = importedTracks.filter((t) =>
        (t.track_name || "").toLowerCase().includes(qq) ||
        (t.artist_name || "").toLowerCase().includes(qq) ||
        (t.album_name || "").toLowerCase().includes(qq));
      const users = [];
      const me = state.profile || {};
      if ((me.displayName && me.displayName.toLowerCase().includes(qq)) ||
          (me.handle && me.handle.toLowerCase().includes(qq))) {
        users.push({ id: "me", name: me.displayName, handle: me.handle, hue: 152, self: true });
      }
      (state.invitedPeers || []).forEach((p) => {
        if ((p.name || "").toLowerCase().includes(qq) || (p.handle || "").toLowerCase().includes(qq)) {
          users.push({ id: p.id, name: p.name, handle: p.handle, hue: p.hue != null ? p.hue : hueFromHandle(p.handle || p.name || "x") });
        }
      });
      // Merge cloud users (excluding "me" doublons)
      const meCloudId = window.SLCloud && window.SLCloud.me && window.SLCloud.me.id;
      const knownIds = new Set(users.map((u) => u.id));
      cloudUsers.forEach((cu) => {
        if (cu.id === meCloudId && knownIds.has("me")) return;
        if (!knownIds.has(cu.id)) users.push({ ...cu, cloud: true });
      });
      return { users, artists, albums, tracks };
    })();

    const tab = route.searchTab || "all";
    const total = local.users.length + local.artists.length + local.albums.length + local.tracks.length;
    const cloudPending = !cache || cache.q !== qq;
    const noResults = !total;

    const tabBtn = (key, label, count) =>
      `<button type="button" class="search-tab ${tab === key ? "is-active" : ""}" data-search-tab="${key}">
        <span>${label}</span>${count != null ? `<span class="search-tab__count">${count}</span>` : ""}
      </button>`;

    const tabs = `<nav class="search-tabs" role="tablist">
      ${tabBtn("all", "Tout", total)}
      ${tabBtn("users", "Profils", local.users.length)}
      ${tabBtn("artists", "Artistes", local.artists.length)}
      ${tabBtn("albums", "Albums", local.albums.length)}
      ${tabBtn("tracks", "Titres", local.tracks.length)}
    </nav>`;

    const sectionUsers = (rows) => rows.length ? `<section class="search-section">
      <h3 class="search-section__title">Profils <small>${rows.length}</small></h3>
      <div class="search-users-grid">${rows.map((u) => {
        const hue = u.hue != null ? u.hue : hueFromHandle(u.handle || u.name);
        const avatar = u.avatar_url
          ? `<img src="${escapeHtml(u.avatar_url)}" alt="" loading="lazy" />`
          : escapeHtml(userInitial(u.name));
        return `<button type="button" class="search-user-card" data-search-user="${escapeHtml(u.id)}">
          <span class="search-user-card__avatar" style="background:hsl(${hue},55%,42%)">${avatar}</span>
          <span class="search-user-card__name">${escapeHtml(u.name || u.handle || "—")}${u.self ? ` <em>Toi</em>` : ""}</span>
          <span class="search-user-card__handle">@${escapeHtml(u.handle || "")}</span>
          ${u.bio ? `<span class="search-user-card__bio">${escapeHtml(u.bio).slice(0, 80)}</span>` : ""}
        </button>`;
      }).join("")}</div>
    </section>` : "";

    const sectionArtists = (rows) => rows.length ? `<section class="search-section">
      <h3 class="search-section__title">Artistes <small>${rows.length}</small></h3>
      <div class="search-artists-grid">${rows.map((a) => `<button type="button" class="search-artist-card" data-search-artist="${escapeHtml(a.name)}">
        <span class="search-artist-card__art">${escapeHtml(userInitial(a.name))}</span>
        <span class="search-artist-card__name">${escapeHtml(a.name)}</span>
        <span class="search-artist-card__meta">${a.albumIds && a.albumIds.length ? a.albumIds.length + " album" + (a.albumIds.length > 1 ? "s" : "") : "Artiste"}</span>
      </button>`).join("")}</div>
    </section>` : "";

    const sectionAlbums = (rows) => rows.length ? `<section class="search-section">
      <h3 class="search-section__title">Albums <small>${rows.length}</small></h3>
      <div class="grid-albums">${rows.map((al) => `<div class="album-card" data-album="${al.id}"${albumCardStyle(al)}>
        ${coverHtml(al, true)}
        <div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist || "")}</span></div>
      </div>`).join("")}</div>
    </section>` : "";

    const sectionTracks = (rows) => rows.length ? `<section class="search-section">
      <h3 class="search-section__title">Titres <small>${rows.length}</small></h3>
      <ol class="search-tracks-list">${rows.slice(0, 80).map((t) => {
        const cover = t.album_artwork_url
          ? `<img src="${escapeHtml(t.album_artwork_url)}" alt="" loading="lazy" />`
          : `<span class="search-tracks-list__ph">♪</span>`;
        return `<li>
          <span class="search-tracks-list__cover">${cover}</span>
          <span class="search-tracks-list__txt">
            <strong>${escapeHtml(t.track_name)}</strong>
            <span class="feed-note">${escapeHtml(t.artist_name)}${t.album_name ? " — " + escapeHtml(t.album_name) : ""}</span>
          </span>
          ${t.source ? `<span class="search-tracks-list__src" data-src="${escapeHtml(t.source)}">${escapeHtml(t.source)}</span>` : ""}
        </li>`;
      }).join("")}</ol>${rows.length > 80 ? `<p class="feed-note">Affiche les 80 premiers titres sur ${rows.length}.</p>` : ""}
    </section>` : "";

    let body = "";
    if (noResults && !cloudPending) {
      body = `<div class="empty" style="padding:2rem">
        Aucun résultat pour « ${escapeHtml(q)} ».<br>
        <small>Essaie <strong>Explorer → Importer</strong> pour Apple Music et Deezer.</small>
      </div>`;
    } else if (tab === "all") {
      body = sectionUsers(local.users.slice(0, 12))
           + sectionArtists(local.artists.slice(0, 16))
           + sectionAlbums(local.albums.slice(0, 24))
           + sectionTracks(local.tracks.slice(0, 30));
    } else if (tab === "users") body = sectionUsers(local.users);
    else if (tab === "artists") body = sectionArtists(local.artists);
    else if (tab === "albums") body = sectionAlbums(local.albums);
    else if (tab === "tracks") body = sectionTracks(local.tracks);

    return `<div class="search-page search-view view-themed">
      <div class="search-hero">
        <p class="kicker search-hero__kicker">Recherche</p>
        <h2 class="page-title search-hero__title">${total ? total + " résultat" + (total > 1 ? "s" : "") : "Aucun résultat"}</h2>
        <p class="page-sub search-hero__sub">Pour « <strong>${escapeHtml(q)}</strong> »${cloudPending ? ` <span class="search-cloud-pending">· cherche dans le cloud…</span>` : ""}</p>
        ${tabs}
      </div>
      <div class="search-body" data-search-body>${body || `<p class="empty" style="padding:2rem">Pas de contenu pour cet onglet.</p>`}</div>
    </div>`;
  }

  // Cache simple pour la recherche cloud (partagée entre popover et page)
  let __slSearchCache = null;

  function render() {
    stopAlbumPreview();
    parseHash();
    adaptiveTickAfterParse();
    setNavActive();
    syncAccountChrome();
    let html = "";
    const searchQ = getSearchQuery();
    if (searchQ && route.view !== "join") {
      html = renderSearchResults(searchQ);
    } else {
      switch (route.view) {
        case "explore":
          html = renderExploreHub();
          break;
        case "carnet":
          html = renderCarnetHub();
          break;
        case "discover":
        case "libraries":
          html = renderExploreHub();
          break;
        case "diary":
        case "lists":
        case "wishlist":
          html = renderCarnetHub();
          break;
        case "iwas":
          html = renderSocialHub();
          break;
        case "social":
          html = renderSocialHub();
          break;
        case "inbox":
          html = renderInbox();
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
    $main.setAttribute("data-route", getSearchQuery() ? "search" : route.view);
    $main.classList.remove("view-enter");
    void $main.offsetWidth;
    $main.classList.add("view-enter");
    bindMainEvents();
    updateOgMetaForRoute();
    if (route.view === "home" || route.view === "social") {
      const likeIds = [...document.querySelectorAll("[data-soc-react]")]
        .map((b) => b.getAttribute("data-soc-react"))
        .filter(Boolean);
      void refreshLikeStateForIds(likeIds);
    }
    const hubPageEl = $main.querySelector("[data-hub-page]");
    if (hubPageEl) {
      const hubName = hubPageEl.getAttribute("data-hub-page");
      wireHubTabs(hubName, (tab) => {
        route.hubTab = tab;
        if (hubName === "explore") state.exploreTab = tab;
        if (hubName === "carnet") state.carnetTab = tab;
        if (hubName === "social") state.socialTab = tab;
        persist();
        window.location.hash = buildHash();
        render();
      });
    }

    // Déclenche la recherche cloud quand on est sur la page search (si pas en cache)
    const sq = getSearchQuery();
    if (sq && window.__sl && window.__sl.ensureSearchCloudFor) {
      window.__sl.ensureSearchCloudFor(sq);
    }
    if (route.view === "libraries" || (route.view === "explore" && (route.hubTab || state.exploreTab) === "import")) {
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
    injectCloudCommentsButtons();
    injectProfileImports();
    injectDiscoverRecos();
    injectProfileCompatibility();
    injectSocialEventInterests();
    if (window.SLSocial && window.SLSocial.inject) void window.SLSocial.inject();
    if (route.view === "inbox") requestAnimationFrame(() => openInboxDrawer(route.dmThreadId));
    injectHomeFeedExtras();
    injectInboxHydration();
    if (route.view === "album") {
      requestAnimationFrame(() => {
        applyAlbumBackdropTint();
        const al = albumById(route.albumId);
        if (al) void hydrateAlbumMusicBrainz(al);
      });
    }
    bindRecoCardEvents($main);
  }

  // ---------- Affichage des playlists importées sur le profil ----------
  function injectProfileImports() {
    if (route.view !== "profile") return;
    const block = document.getElementById("profile-imports-block");
    if (!block) return;
    const uid = route.userId || "me";
    const isMe = uid === "me";
    block.dataset.loading = "1";

    if (!block.dataset.importsBound) {
      block.dataset.importsBound = "1";
      block.addEventListener("click", (e) => {
        if (e.target.closest("[data-open-imports]") && window.__sl && window.__sl.openPlatformPicker) {
          window.__sl.openPlatformPicker();
        }
      });
    }

    (async () => {
      let playlists = [];
      let tracksAll = [];
      if (isMe) {
        playlists = (state.cloudImportedPlaylists || []).slice();
        tracksAll = (state.cloudImportedTracks || []).slice();
      } else if (window.SLCloud && window.SLCloud.ready && /^[0-9a-f-]{36}$/.test(uid)) {
        try {
          playlists = await window.SLCloud.listImportedPlaylists(uid);
          tracksAll = await window.SLCloud.listImportedTracks(uid);
        } catch (e) { console.warn(e); }
      }
      renderImportsBlock(block, playlists, tracksAll, isMe);
    })();
  }

  function renderImportsBlock(node, playlists, tracksAll, isMe) {
    if (!playlists.length) {
      node.innerHTML = isMe
        ? `<p class="feed-note" style="padding:0.6rem 0">Aucune playlist importée pour l'instant. Clique sur « Importer une nouvelle playlist » pour commencer.</p>`
        : `<p class="empty" style="padding:0.5rem">Pas encore d'imports publics.</p>`;
      return;
    }
    const grouped = {};
    tracksAll.forEach((t) => {
      if (!grouped[t.playlist_id]) grouped[t.playlist_id] = [];
      grouped[t.playlist_id].push(t);
    });
    node.innerHTML = `<div class="imports-grid">${playlists.map((p) => {
      const count = (grouped[p.id] || []).length;
      const badge = sourceBadge(p.source);
      const artHtml = p.artwork_url
        ? `<img class="import-card__art" src="${escapeHtml(p.artwork_url)}" alt="" loading="lazy" />`
        : `<div class="import-card__art import-card__art--ph" style="background:${badge.color}">${escapeHtml(badge.letter)}</div>`;
      return `<article class="import-card" data-import-id="${escapeHtml(p.id)}">
          ${artHtml}
          <div class="import-card__body">
            <span class="import-card__source" style="background:${badge.color}">${escapeHtml(badge.label)}</span>
            <h4 class="import-card__name">${escapeHtml(p.name)}</h4>
            <p class="import-card__meta">${count} pistes · ${escapeHtml(timeAgo(p.imported_at))}</p>
          </div>
          ${isMe ? `<button type="button" class="import-card__del" data-import-del="${escapeHtml(p.id)}" title="Supprimer">×</button>` : ""}
        </article>`;
    }).join("")}</div>`;

    node.querySelectorAll("[data-import-id]").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-import-del]")) return;
        const id = card.getAttribute("data-import-id");
        const p = playlists.find((x) => x.id === id);
        openImportedPlaylistModal(p, grouped[id] || []);
      });
    });
    node.querySelectorAll("[data-import-del]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-import-del");
        if (!confirm("Supprimer cette playlist importée ?")) return;
        try {
          await window.SLCloud.deleteImportedPlaylist(id);
          // refresh state
          state.cloudImportedPlaylists = (state.cloudImportedPlaylists || []).filter((p) => p.id !== id);
          state.cloudImportedTracks = (state.cloudImportedTracks || []).filter((t) => t.playlist_id !== id);
          toast("Playlist retirée.");
          render();
        } catch (err) { toast("Erreur : " + (err.message || "inconnue")); }
      });
    });
  }

  function sourceBadge(source) {
    const map = {
      spotify: { label: "Spotify", color: "#1db954", letter: "S" },
      deezer:  { label: "Deezer",  color: "#a238ff", letter: "D" },
      youtube: { label: "YouTube", color: "#ff0033", letter: "Y" },
      lastfm:  { label: "Last.fm", color: "#d51007", letter: "L" },
      manual:  { label: "Import",  color: "#666",    letter: "M" },
      apple:   { label: "Apple",   color: "#fa243c", letter: "A" },
    };
    return map[source] || { label: source || "?", color: "#888", letter: "?" };
  }

  function openImportedPlaylistModal(playlist, tracks) {
    if (!playlist) return;
    const badge = sourceBadge(playlist.source);
    const list = tracks.length
      ? `<ol class="imported-tracks">${tracks.map((t) => {
          const matchAlbumId = findLocalAlbum(t.artist_name, t.album_name);
          const albumLink = matchAlbumId
            ? `<button type="button" class="link" data-album-open="${escapeHtml(matchAlbumId)}">${escapeHtml(t.album_name || "—")}</button>`
            : escapeHtml(t.album_name || "—");
          return `<li>
              <strong>${escapeHtml(t.track_name)}</strong>
              <span class="feed-note"> — ${escapeHtml(t.artist_name)}</span>
              <small class="imported-tracks__album">${albumLink}</small>
            </li>`;
        }).join("")}</ol>`
      : `<p class="empty">Aucune piste indexée.</p>`;
    openModal(`<h2><span class="import-card__source" style="background:${badge.color};margin-right:0.5rem">${escapeHtml(badge.label)}</span>${escapeHtml(playlist.name)}</h2>
      <p class="feed-note">${tracks.length} pistes · importé ${escapeHtml(timeAgo(playlist.imported_at))}</p>
      ${playlist.description ? `<p>${escapeHtml(playlist.description)}</p>` : ""}
      ${list}
      <p class="modal-actions"><button type="button" class="btn btn-ghost" id="imp-close">Fermer</button></p>`);
    document.getElementById("imp-close").addEventListener("click", closeModal);
    document.querySelectorAll("[data-album-open]").forEach((b) => {
      b.addEventListener("click", () => { closeModal(); navigate("album", { albumId: b.getAttribute("data-album-open") }); });
    });
  }

  // Matching simple : album+artiste contenus dans le catalogue Soundlog (state.importedAlbums ou CATALOG)
  function findLocalAlbum(artist, album) {
    if (!artist || !album) return null;
    const a = artist.toLowerCase();
    const t = album.toLowerCase();
    const candidates = [...(state.importedAlbums || []), ...((window.CATALOG_REF && window.CATALOG_REF) || [])];
    const direct = candidates.find((al) => al.title && al.artist && al.title.toLowerCase() === t && al.artist.toLowerCase().includes(a));
    if (direct) return direct.id;
    // partial match
    const partial = candidates.find((al) => al.title && al.artist && al.title.toLowerCase().includes(t) && al.artist.toLowerCase().includes(a));
    return partial ? partial.id : null;
  }

  // ---------- Découvrir : section « Inspiré par tes imports » ----------
  let discoverRecosCache = null;
  let discoverRecosFetching = false;
  function injectDiscoverRecos() {
    const exploreAlbums =
      route.view === "explore" && (route.hubTab || state.exploreTab || "albums") === "albums";
    if (!exploreAlbums && route.view !== "discover") return;
    if (!window.SLCloud || !window.SLCloud.isSignedIn()) return;
    if (document.getElementById("discover-cloud-recos")) return;
    const target = document.querySelector(".discover-view");
    if (!target) return;
    const wrap = document.createElement("section");
    wrap.id = "discover-cloud-recos";
    wrap.className = "panel discover-cloud-recos";
    wrap.innerHTML = `<h2 class="kicker" style="margin:0 0 0.5rem">Inspiré par la communauté</h2>
      <p class="feed-note" style="margin:0 0 0.75rem">Albums notés par d'autres auditeur·ices proches de tes goûts (imports + écoutes).</p>
      <div id="discover-cloud-recos-list"><p class="feed-note">Calcul…</p></div>`;
    target.insertBefore(wrap, target.firstChild);

    (async () => {
      try {
        if (!discoverRecosCache && !discoverRecosFetching) {
          discoverRecosFetching = true;
          discoverRecosCache = await window.SLCloud.getRecommendations(window.SLCloud.me.id, 12);
          discoverRecosFetching = false;
        }
        const listNode = document.getElementById("discover-cloud-recos-list");
        if (!listNode) return;
        const recos = discoverRecosCache || [];
        listNode.innerHTML = renderRecoCardsHtml(recos);
        bindRecoCardEvents(listNode);
      } catch (e) {
        console.warn("[recos]", e);
      }
    })();
  }

  async function injectProfileCompatibility() {
    if (route.view !== "profile") return;
    const uid = route.userId || "me";
    if (uid === "me") return;
    ensureSocialArrays();
    if (!isFriend(uid)) return;
    const wrap = document.querySelector(".profile-friend-tools");
    if (!wrap) return;
    const fill = wrap.querySelector("[data-compat-fill]");
    const pct = wrap.querySelector("[data-compat-pct]");
    if (!fill || !pct) return;
    try {
      const r = await computeMusicCompatibilityWith(uid);
      fill.style.width = r.score + "%";
      pct.textContent = r.score + "% · " + r.shared + " disques en commun";
    } catch (_) {
      pct.textContent = "—";
    }
  }

  async function injectSocialEventInterests() {
    if (route.view !== "social") return;
    if (window.SLCloud && SLCloud.isSignedIn && SLCloud.isSignedIn()) {
      try {
        const cloudKeys = await SLCloud.listMyEventInterestKeys();
        state.eventInterestLocal = state.eventInterestLocal || {};
        cloudKeys.forEach((k) => {
          state.eventInterestLocal[k] = true;
        });
        document.querySelectorAll(".event-interest-toggle").forEach((btn) => {
          const k = btn.getAttribute("data-ev-key");
          if (k && cloudKeys.includes(k)) btn.classList.add("is-on");
        });
      } catch (_) {}
    }
    if (!window.SLCloud || !SLCloud.isSignedIn || !SLCloud.isSignedIn()) return;
    const friendIdSet = new Set();
    try {
      (await SLCloud.listFriends()).forEach((p) => friendIdSet.add(p.id));
    } catch (_) {}
    const els = document.querySelectorAll("[data-ev-friends]");
    for (const el of els) {
      const key = el.getAttribute("data-ev-friends");
      if (!key) continue;
      try {
        const rows = await SLCloud.listEventInterestsForKey(key);
        const names = rows
          .filter((r) => r.user_id !== SLCloud.me.id && friendIdSet.has(r.user_id))
          .map((r) => {
            const p = r.profiles;
            return p && (p.name || p.handle) ? p.name || "@" + p.handle : "";
          })
          .filter(Boolean);
        el.textContent = names.length ? "Ami·es partant·es : " + names.join(", ") : "";
      } catch (_) {
        el.textContent = "";
      }
    }
  }

  function injectInboxHydration() {
    if (route.view !== "inbox" && !document.body.classList.contains("inbox-drawer-open")) return;
    const acc = document.getElementById("inbox-open-account");
    if (acc) acc.addEventListener("click", () => openAccountModal("signin"));
    if (!window.SLCloud || !SLCloud.isSignedIn()) return;
    if (route.dmThreadId) void hydrateInboxThread(route.dmThreadId);
    else void hydrateInboxList();
  }

  async function hydrateInboxList() {
    const host = document.getElementById("inbox-list-panel");
    const filterEl = document.getElementById("dm-thread-filter");
    if (!host) return;
    try {
      const threads = await SLCloud.listDmThreads();
      const activeId = route.dmThreadId;
      const paintThreadList = (q) => {
        let list = dmSortThreads(threads);
        if (q) {
          const qq = q.toLowerCase();
          list = list.filter(
            ({ other }) =>
              (other && String(other.name || "").toLowerCase().includes(qq)) ||
              (other && String(other.handle || "").toLowerCase().includes(qq))
          );
        }
        if (!list.length) {
          host.innerHTML = `<p class="empty dm-empty-list">Aucune conversation. Depuis un profil ami·e, touche « Message ».</p>`;
          return;
        }
        host.innerHTML = `<ul class="dm-thread-list">${list.map((t) => dmThreadRowHtml(t, activeId)).join("")}</ul>`;
        host.querySelectorAll("[data-open-thread]").forEach((b) => {
          b.addEventListener("click", () => {
            route.dmThreadId = b.getAttribute("data-open-thread");
            window.location.hash = "#messagerie/" + route.dmThreadId;
            render();
          });
        });
      };
      paintThreadList(filterEl ? filterEl.value.trim() : "");
      if (filterEl) filterEl.oninput = () => paintThreadList(filterEl.value.trim());
    } catch (e) {
      host.innerHTML = `<p class="auth-error">${escapeHtml(e.message || "Erreur")}</p>`;
    }
  }

  async function hydrateInboxThread(threadId) {
    const box = document.getElementById("inbox-messages");
    const form = document.getElementById("inbox-compose");
    const ta = document.getElementById("inbox-msg-input");
    const tray = document.getElementById("dm-share-tray");
    const toggleShare = document.getElementById("dm-toggle-share");
    const pinBtn = document.getElementById("dm-pin-thread");
    if (!box || !form || !ta) return;

    let other = null;
    try {
      const threads = await SLCloud.listDmThreads();
      const cur = threads.find((t) => t.thread && t.thread.id === threadId);
      other = cur && cur.other;
    } catch (_) {}

    const peerName = document.getElementById("dm-peer-name");
    const peerStatus = document.getElementById("dm-peer-status");
    const peerAvatar = document.getElementById("dm-peer-avatar");
    if (other && peerName) peerName.textContent = other.name || other.handle || "…";
    if (other && peerStatus) peerStatus.textContent = "@" + (other.handle || "");
    if (other && peerAvatar) peerAvatar.outerHTML = userAvatarHtml(other, "dm-chat__peer-avatar");

    if (pinBtn) {
      pinBtn.classList.toggle("is-on", getDmPinned().includes(threadId));
      pinBtn.onclick = () => {
        toggleDmPinned(threadId);
        pinBtn.classList.toggle("is-on", getDmPinned().includes(threadId));
        void hydrateInboxList();
        toast(getDmPinned().includes(threadId) ? "Conversation épinglée" : "Épingle retirée");
      };
    }

    if (tray) tray.classList.remove("is-open");
    if (toggleShare && tray) toggleShare.onclick = () => tray.classList.toggle("is-open");
    if (tray) {
      tray.querySelectorAll("[data-dm-share-kind]").forEach((chip) => {
        chip.onclick = () => openDmShareModal(threadId, chip.getAttribute("data-dm-share-kind"));
      });
    }

    const renderMsgs = (msgs) => {
      const me = SLCloud.me.id;
      box.innerHTML = msgs.length
        ? msgs.map((m) => dmMessageBubbleHtml(m, me)).join("")
        : `<p class="dm-chat__empty">Écris le premier message — ou partage un album 🎧</p>`;
      box.scrollTop = box.scrollHeight;
      wireDmChatActions(box);
    };

    try {
      renderMsgs(await SLCloud.listDmMessages(threadId));
    } catch (e) {
      box.innerHTML = `<p class="auth-error">${escapeHtml(e.message || "")}</p>`;
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const t = ta.value.trim();
      if (!t) return;
      try {
        await SLCloud.sendDmMessage(threadId, t);
        ta.value = "";
        renderMsgs(await SLCloud.listDmMessages(threadId));
        void hydrateInboxList();
      } catch (err) {
        toast(err.message || "Envoi impossible");
      }
    };

    document.querySelectorAll("[data-inbox-back]").forEach((b) => {
      b.onclick = () => {
        route.dmThreadId = null;
        window.location.hash = "#messagerie";
        render();
      };
    });
  }

  // Reset cache après import
  function resetRecoCache() { discoverRecosCache = null; }

  if (window.SLSocial && window.SLSocial.install) {
    window.SLSocial.install({
      state,
      persist,
      escapeHtml,
      coverHtml,
      starString,
      feedPreviewSectionHtml,
      feedCircleIds,
      feedItems,
      feedStoryStripHtml,
      formatRelativeFeedTime,
      userById,
      albumById,
      USERS,
      ensureSocialArrays,
      isFriend,
      outgoingRequestTo,
      isCloudUuid,
      hueFromHandle,
      feedCommentsFor,
      computeMusicCompatibilityWith,
      concertFeedItems,
      resolveVenueStamp,
      tourSeenKey,
      gradientFromKey,
      cloudSignedIn,
      publicFeedPostHtml,
      markNotificationRead,
      persist,
      isListeningLiked,
      likeCountSuffix,
      toggleListeningLike,
      refreshLikeStateForIds,
    });
  }

  if (window.SLLogListen && window.SLLogListen.install) {
    window.__slMusicCountry = musicCountry;
    window.SLLogListen.install({
      escapeHtml,
      allAlbums,
      albumById,
      persist,
      toast,
      navigate,
      closeModal,
      openModal,
      coverHtml,
      buildPlatformLinks,
      normalizeKey,
      gradientFromKey,
      state,
      ensureAdaptive,
      upsertAlbumFromRemoteHit,
      musicCountry,
      applyAlbumBackdropTint,
    });
  }
  window.__sl = window.__sl || {};
  window.__sl.resetRecoCache = resetRecoCache;
  window.__sl.syncNotificationsFromCloud = syncNotificationsFromCloud;
  window.__sl.toggleListeningLike = toggleListeningLike;

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
    if (id && isCloudUuid(id) && SLCloud && SLCloud.isSignedIn()) {
      void SLCloud.markNotificationRead(id);
    }
  }

  function updateOgMetaForRoute() {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogTitle || !ogDesc) return;
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    const baseTitle = "Soundlog — carnet d'écoutes";
    const baseDesc = "Note, critique et partage tes albums. Letterboxd pour la musique.";
    if (route.view === "album" && route.albumId) {
      const al = albumById(route.albumId);
      if (al) {
        ogTitle.setAttribute("content", al.title + " — " + al.artist + " · Soundlog");
        ogDesc.setAttribute(
          "content",
          ("Fiche album sur Soundlog : " + al.artist + " · " + (al.year || "") + " · " + (al.genre || "musique")).slice(0, 200)
        );
        if (al.artworkUrl) ogImage.setAttribute("content", al.artworkUrl);
        else ogImage.removeAttribute("content");
        document.title = al.title + " — Soundlog";
        return;
      }
    }
    if (route.view === "profile" && route.userId) {
      const u = userById(route.userId);
      if (u) {
        ogTitle.setAttribute("content", u.name + " (@ " + u.handle + ") · Soundlog");
        ogDesc.setAttribute("content", (u.bio || "Profil musical sur Soundlog.").slice(0, 200));
        const recent = state.listenings
          .filter((l) => l.userId === route.userId)
          .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
        const al = recent && albumById(recent.albumId);
        if (al && al.artworkUrl) ogImage.setAttribute("content", al.artworkUrl);
        else ogImage.removeAttribute("content");
        document.title = u.name + " — Soundlog";
        return;
      }
    }
    ogTitle.setAttribute("content", baseTitle);
    ogDesc.setAttribute("content", baseDesc);
    ogImage.removeAttribute("content");
    document.title = "Soundlog — votre carnet d'écoutes";
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
    const nameEl = document.getElementById("header-username");
    const av = document.getElementById("header-avatar");
    if (!nameEl || !av) return;
    const cloudMe = cloudMeRow();
    const u = userById("me");
    if (cloudSignedIn() && !cloudMe) {
      nameEl.textContent = "Synchronisation…";
    } else {
      nameEl.textContent = u.name || "Invité";
    }
    if (cloudMe && cloudMe.avatar_url) {
      av.style.backgroundImage = "";
      av.textContent = "";
      av.style.background = `center / cover no-repeat url("${cloudMe.avatar_url}")`;
    } else {
      av.style.backgroundImage = "";
      const label = cloudSignedIn() && !cloudMe ? "…" : (u.name || "?").charAt(0).toUpperCase();
      av.textContent = label;
      av.style.background = "hsl(" + (u.hue != null ? u.hue : 152) + ",55%,42%)";
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
    // ---- Recherche : onglets, profils, artistes ----
    $main.querySelectorAll("[data-search-tab]").forEach((el) => {
      el.addEventListener("click", () => {
        route.searchTab = el.getAttribute("data-search-tab");
        render();
      });
    });
    $main.querySelectorAll("[data-feed-tab]").forEach((el) => {
      el.addEventListener("click", () => {
        const t = el.getAttribute("data-feed-tab") === "discover" ? "discover" : "following";
        state.feedHomeTab = t;
        persist();
        render();
      });
    });
    const feedAcct = document.getElementById("feed-open-account");
    if (feedAcct) {
      feedAcct.addEventListener("click", () => {
        if (typeof openAccountModal === "function") openAccountModal("signin");
      });
    }
    $main.querySelectorAll("[data-search-user]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-search-user");
        $search.value = "";
        navigate("profile", { userId: id });
      });
    });
    $main.querySelectorAll("[data-search-artist]").forEach((el) => {
      el.addEventListener("click", () => {
        const name = el.getAttribute("data-search-artist");
        $search.value = name;
        route.searchTab = "albums";
        render();
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
        if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
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
          if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
          toast("Album ajouté à la liste.");
        } else toast("Déjà dans cette liste.");
      });
    }
    const logThis = document.getElementById("btn-log-this");
    if (logThis) logThis.addEventListener("click", () => openListenModal(null, route.albumId));
    const shareAlbum = document.getElementById("btn-share-album");
    if (shareAlbum) {
      shareAlbum.addEventListener("click", async () => {
        const url = window.location.origin + window.location.pathname + "#album/" + encodeURIComponent(route.albumId);
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            toast("Lien de la fiche copié.");
          } else {
            window.prompt("Copie ce lien :", url);
          }
        } catch (_) {
          window.prompt("Copie ce lien :", url);
        }
      });
    }

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
        if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
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
        if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
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
        if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
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
        if (i >= 0) {
          state.follows.splice(i, 1);
          if (isCloudUuid(uid) && window.SLCloud && window.SLCloud.isSignedIn()) void window.SLCloud.unfollow(uid);
        } else {
          state.follows.push(uid);
          if (isCloudUuid(uid) && window.SLCloud && window.SLCloud.isSignedIn()) void window.SLCloud.follow(uid);
        }
        persist();
        if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
        render();
      });
    });
    $main.querySelectorAll("[data-diary-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.diaryFilter = btn.getAttribute("data-diary-filter") || "all";
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
        if (v === "inbox") { openInboxDrawer(route.dmThreadId); return; }
        if (b.hasAttribute("data-hub-live") && v === "social") {
          navigate("social", { hubTab: "live" });
          return;
        }
        if (v) navigate(v);
      });
    });
    document.querySelectorAll("[data-open-dm]").forEach((b) => {
      b.addEventListener("click", async () => {
        const uid = b.getAttribute("data-open-dm");
        if (!window.SLCloud || !SLCloud.isSignedIn()) {
          toast("Connecte-toi pour envoyer un message.");
          return;
        }
        try {
          const tid = await SLCloud.ensureDmThread(uid);
          route.dmThreadId = tid;
          openInboxDrawer(tid);
        } catch (e) {
          toast(e.message || "Impossible d’ouvrir la discussion.");
        }
      });
    });
    document.querySelectorAll("[data-compat-detail]").forEach((b) => {
      b.addEventListener("click", async () => {
        const uid = b.getAttribute("data-compat-detail");
        try {
          const r = await computeMusicCompatibilityWith(uid);
          const albums = (r.sharedAlbumIds || []).map((id) => albumById(id)).filter(Boolean).slice(0, 12);
          const grid = albums
            .map(
              (al) =>
                `<div class="album-card" data-album="${al.id}"${albumCardStyle(al)}>${coverHtml(al, true)}<div class="album-meta"><strong>${escapeHtml(al.title)}</strong><span>${escapeHtml(al.artist)}</span></div></div>`
            )
            .join("");
          openModal(`<h2>Test de compatibilité</h2>
            <p class="page-sub">Score <strong>${r.score}%</strong> — ${r.shared} albums en commun (${r.union} uniques au total dans nos goûts comparés).</p>
            <p class="feed-note">Basé sur nos <strong>écoutes publiques</strong> et <strong>listes publiques</strong> Soundlog (ta pile « à écouter » côté toi uniquement).</p>
            <div class="grid-albums" style="margin-top:1rem">${grid || `<p class="empty">Pas d’album en commun indexé pour l’instant.</p>`}</div>`);
          document.querySelectorAll("#modal-bd [data-album]").forEach((el) => {
            el.addEventListener("click", () => {
              const id = el.getAttribute("data-album");
              closeModal();
              navigate("album", { albumId: id });
            });
          });
        } catch (e) {
          toast(e.message || "Impossible de calculer.");
        }
      });
    });
    document.querySelectorAll(".event-interest-toggle").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const key = btn.getAttribute("data-ev-key");
        if (!key) return;
        const on = !btn.classList.contains("is-on");
        btn.classList.toggle("is-on", on);
        state.eventInterestLocal = state.eventInterestLocal || {};
        if (on) {
          state.eventInterestLocal[key] = true;
          if (window.SLCloud && SLCloud.isSignedIn()) {
            try {
              await SLCloud.upsertEventInterest({
                eventKey: key,
                artist: btn.getAttribute("data-ev-artist") || "",
                datetimeIso: btn.getAttribute("data-ev-dt") || "",
                venue: btn.getAttribute("data-ev-venue") || "",
                city: btn.getAttribute("data-ev-city") || "",
                eventUrl: btn.getAttribute("data-ev-url") || "",
              });
              toast("Marqué comme intéressé·e — tes ami·es le verront.");
            } catch (e) {
              toast(e.message || "Synchro impossible (migration SQL v3 appliquée ?)");
            }
          } else toast("Noté en local — connecte-toi pour partager avec tes ami·es.");
        } else {
          delete state.eventInterestLocal[key];
          if (window.SLCloud && SLCloud.isSignedIn()) {
            try {
              await SLCloud.removeEventInterest(key);
            } catch (_) {}
          }
        }
        persist();
        if (route.view === "social" && window.SLCloud && SLCloud.isSignedIn()) void injectSocialEventInterests();
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

    document.querySelectorAll("[data-sonar-info]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        openAdaptiveInfoModal();
      });
    });
    document.querySelectorAll("[data-sonar-dismiss]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        dismissSonarChip();
      });
    });
    document.querySelectorAll("[data-sonar-log]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        openListenModal(null, b.getAttribute("data-sonar-log"));
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
    document.querySelectorAll("[data-social-circle-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.socialCircleTab = btn.getAttribute("data-social-circle-tab") || "feed";
        persist();
        render();
      });
    });
    document.querySelectorAll("[data-social-feed-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.socialFeedFilter = btn.getAttribute("data-social-feed-filter") || "all";
        persist();
        render();
      });
    });
    const cloudShoutBtn = document.getElementById("soc-shout-cloud");
    if (cloudShoutBtn) {
      cloudShoutBtn.addEventListener("click", () => {
        if (window.__sl && window.__sl.openShoutout) window.__sl.openShoutout();
        else toast("Connecte-toi pour publier un murmure en ligne.");
      });
    }
    document.querySelectorAll("[data-soc-react]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-soc-react");
        if (!id) return;
        void toggleListeningLike(id);
      });
    });
    const feedMore = document.getElementById("feed-load-more");
    if (feedMore) {
      feedMore.addEventListener("click", () => {
        state.feedHomeShown = Math.min(80, (state.feedHomeShown || 15) + 15);
        persist();
        render();
      });
    }
    const profileCopy = document.getElementById("profile-copy-link");
    if (profileCopy) {
      profileCopy.addEventListener("click", async () => {
        const pid = profileCopy.getAttribute("data-profile-share") || route.userId;
        const url = inviteBaseUrl() + "#profil/" + encodeURIComponent(pid);
        try {
          await navigator.clipboard.writeText(url);
          toast("Lien du profil copié.");
        } catch (_) {
          toast(url);
        }
      });
    }
    const joinCloudFriend = document.getElementById("join-cloud-friend");
    if (joinCloudFriend) {
      joinCloudFriend.addEventListener("click", async () => {
        const inviterId = joinCloudFriend.getAttribute("data-inviter-id");
        if (!inviterId) return;
        try {
          await ensureCloudReady();
          if (!SLCloud.isSignedIn()) {
            openAccountModal();
            toast("Connecte-toi puis reclique sur la demande d'ami.");
            return;
          }
          await SLCloud.sendFriendRequest(inviterId);
          toast("Demande d'ami envoyée.");
          window.location.hash = "#profil/" + inviterId;
          navigate("profile", { userId: inviterId });
        } catch (e) {
          toast(e.message || "Impossible d'envoyer la demande.");
        }
      });
    }
    const joinOpenAccount = document.getElementById("join-open-account");
    if (joinOpenAccount) {
      joinOpenAccount.addEventListener("click", async () => {
        try {
          await ensureCloudReady();
          openAccountModal();
        } catch (e) {
          toast(e.message || "Cloud indisponible");
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
    wireHandleFieldPreview("join-handle", "join-handle-preview");
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
        const hv = validateHandleInput(handle);
        if (!hv.ok) return toast(hv.message);
        if (mode === "merge") applyInviteMergeIntoCurrent(payload, name, hv.handle, bio, importSnapshot);
        else applyInviteToFreshDevice(payload, name, hv.handle, bio, importSnapshot);
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
      <label>Nom affiché</label>
      <input type="text" id="pf-name" value="${escapeHtml(state.profile.displayName)}" />
      ${handleFieldHtml({ inputId: "pf-handle", previewId: "pf-handle-preview", value: state.profile.handle, shortHint: true })}
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
    wireHandleFieldPreview("pf-handle", "pf-handle-preview");
    document.getElementById("pf-cancel").addEventListener("click", closeModal);
    document.getElementById("pf-save").addEventListener("click", () => {
      state.profile.displayName = document.getElementById("pf-name").value.trim() || "Toi";
      const hv = validateHandleInput(document.getElementById("pf-handle").value);
      if (!hv.ok) return toast(hv.message);
      state.profile.handle = hv.handle || "moi";
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
      <p class="feed-note">Commentaire stocké sur cet appareil. Connecte-toi pour commenter en ligne sur les écoutes synchronisées.</p>
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
      if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
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
      if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
      closeModal();
      toast("Liste créée.");
      navigate("list", { listId: id });
    });
  }

  function openListenModal(editId, presetAlbumId) {
    if (window.SLLogListen && window.SLLogListen.open) {
      window.SLLogListen.open(editId, presetAlbumId);
      return;
    }
    toast("Chargement du module de log en cours…");
  }

  function bindShellNavigation() {
    document.querySelectorAll("#sidebar-nav, #bottom-nav").forEach((nav) => {
      nav.addEventListener("click", (e) => {
        const btn = e.target.closest(".nav-link[data-view]");
        if (btn) {
          navigate(btn.dataset.view);
          if (window.matchMedia("(max-width: 1023px)").matches) closeSidebar();
          return;
        }        const prof = e.target.closest("[data-nav-profile]");
        if (prof) {
          navigate("profile", { userId: prof.getAttribute("data-nav-profile") || "me" });
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
  bindInboxDrawerShell();
  const logFab = document.getElementById("nav-log-fab");
  if (logFab) logFab.addEventListener("click", () => openListenModal(null, null));
  document.getElementById("logo-link").addEventListener("click", (e) => {
    e.preventDefault();
    clearSearchQuery({ pushHash: false });
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
  // =======================================================================
  // Recherche unifiée — popover live multi-entités (users / artists / albums / tracks)
  // =======================================================================
  const $searchWrap = document.getElementById("search-wrap");
  const $popover = document.getElementById("search-popover");
  const RECENTS_KEY = "soundlog.searchRecents";
  const MAX_RECENTS = 6;
  let searchDebounceTimer = null;
  let searchCloudReqId = 0;
  let searchActiveIndex = -1;
  let searchLastQuery = "";

  function loadRecents() {
    try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]"); } catch (_) { return []; }
  }
  function pushRecent(q) {
    if (!q || q.length < 2) return;
    let arr = loadRecents().filter((x) => x.toLowerCase() !== q.toLowerCase());
    arr.unshift(q);
    arr = arr.slice(0, MAX_RECENTS);
    try { localStorage.setItem(RECENTS_KEY, JSON.stringify(arr)); } catch (_) {}
  }
  function clearRecents() {
    try { localStorage.removeItem(RECENTS_KEY); } catch (_) {}
  }

  // Construit l'index de recherche local à la volée
  function searchLocalEntities(qq) {
    const albumsAll = allAlbums();
    const importedTracks = state.cloudImportedTracks || [];

    // Albums
    const albums = albumsAll
      .filter((a) =>
        (a.title || "").toLowerCase().includes(qq) ||
        (a.artist || "").toLowerCase().includes(qq) ||
        (a.genre || "").toLowerCase().includes(qq)
      )
      .slice(0, 24);

    // Artists (dédup catalog + imports)
    const artistMap = new Map();
    albumsAll.forEach((a) => {
      const k = (a.artist || "").toLowerCase().trim();
      if (!k) return;
      if (!artistMap.has(k)) artistMap.set(k, { name: a.artist, count: 0, albumIds: [] });
      const e = artistMap.get(k); e.count++; e.albumIds.push(a.id);
    });
    importedTracks.forEach((t) => {
      const k = (t.artist_name || "").toLowerCase().trim();
      if (!k) return;
      if (!artistMap.has(k)) artistMap.set(k, { name: t.artist_name, count: 0, albumIds: [], imported: true });
      else artistMap.get(k).count++;
    });
    const artists = Array.from(artistMap.values())
      .filter((a) => a.name.toLowerCase().includes(qq))
      .sort((a, b) => b.count - a.count)
      .slice(0, 16);

    // Tracks (imports cloud)
    const tracks = importedTracks
      .filter((t) =>
        (t.track_name || "").toLowerCase().includes(qq) ||
        (t.artist_name || "").toLowerCase().includes(qq) ||
        (t.album_name || "").toLowerCase().includes(qq)
      )
      .slice(0, 24);

    // Users locaux : me + invitedPeers
    const users = [];
    const me = state.profile || {};
    if (
      (me.displayName && me.displayName.toLowerCase().includes(qq)) ||
      (me.handle && me.handle.toLowerCase().includes(qq))
    ) {
      users.push({ id: "me", name: me.displayName, handle: me.handle, bio: me.bio || "", hue: 152, local: true, self: true });
    }
    (state.invitedPeers || []).forEach((p) => {
      if ((p.name || "").toLowerCase().includes(qq) || (p.handle || "").toLowerCase().includes(qq)) {
        users.push({ id: p.id, name: p.name, handle: p.handle, bio: p.bio || "", hue: p.hue != null ? p.hue : hueFromHandle(p.handle || p.name || "x"), local: true });
      }
    });

    return { users, artists, albums, tracks };
  }

  function escapeHtmlS(s) { return escapeHtml(String(s || "")); }
  function highlight(text, q) {
    const t = String(text || "");
    if (!q) return escapeHtmlS(t);
    const idx = t.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return escapeHtmlS(t);
    return escapeHtmlS(t.slice(0, idx)) + `<mark>${escapeHtmlS(t.slice(idx, idx + q.length))}</mark>` + escapeHtmlS(t.slice(idx + q.length));
  }

  function userInitial(name) { return String(name || "?").trim().charAt(0).toUpperCase() || "?"; }

  function renderUserRow(u, q) {
    const hue = u.hue != null ? u.hue : hueFromHandle(u.handle || u.name);
    const avatarHtml = u.avatar_url
      ? `<img src="${escapeHtmlS(u.avatar_url)}" alt="" loading="lazy" />`
      : escapeHtmlS(userInitial(u.name));
    const handleTxt = u.handle ? "@" + u.handle : "";
    return `<button type="button" class="sp-row" role="option" data-type="user" data-id="${escapeHtmlS(u.id)}">
      <span class="sp-row__avatar" style="background:hsl(${hue},55%,42%)">${avatarHtml}</span>
      <span class="sp-row__main">
        <span class="sp-row__title">${highlight(u.name || u.handle || "Sans nom", q)}${u.self ? ` <span class="sp-row__self">Toi</span>` : ""}</span>
        <span class="sp-row__sub">${highlight(handleTxt, q)}${u.city ? ` · ${escapeHtmlS(u.city)}` : ""}</span>
      </span>
      <span class="sp-row__kind">Profil</span>
    </button>`;
  }

  function renderArtistRow(a, q) {
    return `<button type="button" class="sp-row" role="option" data-type="artist" data-name="${escapeHtmlS(a.name)}">
      <span class="sp-row__art sp-row__art--artist" aria-hidden="true">${escapeHtmlS(userInitial(a.name))}</span>
      <span class="sp-row__main">
        <span class="sp-row__title">${highlight(a.name, q)}</span>
        <span class="sp-row__sub">${a.albumIds && a.albumIds.length ? a.albumIds.length + " album" + (a.albumIds.length > 1 ? "s" : "") + " dans le catalogue" : "Artiste"}${a.imported ? " · vu dans tes imports" : ""}</span>
      </span>
      <span class="sp-row__kind">Artiste</span>
    </button>`;
  }

  function renderAlbumRow(al, q) {
    const artUrl = bestArtworkUrl(al);
    const cover = artUrl
      ? `<img src="${escapeHtmlS(artUrl)}" alt="" loading="lazy" decoding="async" />`
      : `<span style="background:linear-gradient(145deg,${escapeHtmlS(al.from || "#444")},${escapeHtmlS(al.to || "#222")});width:100%;height:100%;display:block"></span>`;
    return `<button type="button" class="sp-row" role="option" data-type="album" data-id="${escapeHtmlS(al.id)}">
      <span class="sp-row__art">${cover}</span>
      <span class="sp-row__main">
        <span class="sp-row__title">${highlight(al.title, q)}</span>
        <span class="sp-row__sub">${highlight(al.artist || "", q)}${al.year ? " · " + al.year : ""}${al.genre ? " · " + escapeHtmlS(al.genre) : ""}</span>
      </span>
      <span class="sp-row__kind">Album</span>
    </button>`;
  }

  function renderTrackRow(t, q) {
    const artUrl = bestArtworkUrl({ artworkUrl: t.album_artwork_url });
    const cover = artUrl
      ? `<img src="${escapeHtmlS(artUrl)}" alt="" loading="lazy" decoding="async" />`
      : `<span class="sp-row__art--track-ph" aria-hidden="true">♪</span>`;
    return `<button type="button" class="sp-row" role="option" data-type="track" data-artist="${escapeHtmlS(t.artist_name)}" data-album="${escapeHtmlS(t.album_name)}">
      <span class="sp-row__art">${cover}</span>
      <span class="sp-row__main">
        <span class="sp-row__title">${highlight(t.track_name, q)}</span>
        <span class="sp-row__sub">${highlight(t.artist_name, q)}${t.album_name ? ` — ${highlight(t.album_name, q)}` : ""}</span>
      </span>
      <span class="sp-row__kind">Titre</span>
    </button>`;
  }

  function renderRecents() {
    const recents = loadRecents();
    if (!recents.length) {
      return `<div class="sp-empty">
        <p class="sp-empty__title">Commence à taper pour trouver…</p>
        <p class="sp-empty__sub">Profils, artistes, albums, ou titres dans tes playlists importées.</p>
      </div>`;
    }
    return `<div class="sp-section sp-section--recents">
      <header class="sp-section__head">
        <span>Recherches récentes</span>
        <button type="button" class="sp-clear" data-clear-recents>Effacer</button>
      </header>
      <div class="sp-rows">
        ${recents.map((r) => `<button type="button" class="sp-row sp-row--recent" role="option" data-type="recent" data-q="${escapeHtmlS(r)}">
          <span class="sp-row__art sp-row__art--ic" aria-hidden="true">↺</span>
          <span class="sp-row__main"><span class="sp-row__title">${escapeHtmlS(r)}</span></span>
        </button>`).join("")}
      </div>
    </div>`;
  }

  function renderPopoverBody(results, q, opts) {
    opts = opts || {};
    const total = results.users.length + results.artists.length + results.albums.length + results.tracks.length;
    if (!total && !opts.loadingCloud) {
      return `<div class="sp-empty">
        <p class="sp-empty__title">Aucun résultat pour « ${escapeHtmlS(q)} »</p>
        <p class="sp-empty__sub">Essaie l'onglet <strong>Bibliothèques</strong> pour explorer Apple Music et Deezer.</p>
      </div>`;
    }
    const section = (title, rows, kind) => {
      if (!rows.length) return "";
      const limited = rows.slice(0, 4);
      return `<div class="sp-section">
        <header class="sp-section__head"><span>${title}</span>${rows.length > limited.length ? `<button type="button" class="sp-clear" data-see-all="${kind}">Tout voir (${rows.length})</button>` : ""}</header>
        <div class="sp-rows">${limited.join("")}</div>
      </div>`;
    };
    return [
      section("Profils", results.users.map((u) => renderUserRow(u, q)), "users"),
      section("Artistes", results.artists.map((a) => renderArtistRow(a, q)), "artists"),
      section("Albums", results.albums.map((al) => renderAlbumRow(al, q)), "albums"),
      section("Titres", results.tracks.map((t) => renderTrackRow(t, q)), "tracks"),
      opts.loadingCloud ? `<p class="sp-loading">Recherche dans les profils du cloud…</p>` : "",
      total > 0 ? `<button type="button" class="sp-see-all" data-search-go>Voir tous les résultats pour « ${escapeHtmlS(q)} » <span aria-hidden="true">↵</span></button>` : "",
    ].filter(Boolean).join("");
  }

  function openPopover() {
    if (!$popover) return;
    $popover.hidden = false;
    $search.setAttribute("aria-expanded", "true");
  }
  function closePopover() {
    if (!$popover) return;
    $popover.hidden = true;
    $search.setAttribute("aria-expanded", "false");
    searchActiveIndex = -1;
    document.body.classList.remove("search-focus");
  }

  function rebuildPopoverActiveItems() {
    return Array.from($popover.querySelectorAll(".sp-row"));
  }
  function setActive(index) {
    const items = rebuildPopoverActiveItems();
    if (!items.length) { searchActiveIndex = -1; return; }
    items.forEach((it) => it.classList.remove("is-active"));
    const i = ((index % items.length) + items.length) % items.length;
    items[i].classList.add("is-active");
    items[i].scrollIntoView({ block: "nearest" });
    searchActiveIndex = i;
  }

  function activateRow(row) {
    if (!row) return;
    const type = row.getAttribute("data-type");
    const q = $search.value.trim();
    if (q) pushRecent(q);
    closePopover();
    if (type === "user") {
      const id = row.getAttribute("data-id");
      $search.value = "";
      navigate("profile", { userId: id });
    } else if (type === "artist") {
      const name = row.getAttribute("data-name");
      $search.value = name;
      render();
    } else if (type === "album") {
      const id = row.getAttribute("data-id");
      $search.value = "";
      navigate("album", { albumId: id });
    } else if (type === "track") {
      const artist = row.getAttribute("data-artist");
      const album = row.getAttribute("data-album");
      $search.value = album || artist || "";
      render();
    } else if (type === "recent") {
      const r = row.getAttribute("data-q");
      $search.value = r;
      runSearch();
      render();
    }
  }

  async function runSearch() {
    const q = $search.value.trim();
    searchLastQuery = q;
    if (!q) {
      $popover.innerHTML = renderRecents();
      openPopover();
      return;
    }
    const local = searchLocalEntities(q.toLowerCase());
    // 1er rendu instantané + indicateur "recherche cloud" si configuré
    const willQueryCloud = !!(window.SLCloud && window.SLCloud.ready);
    $popover.innerHTML = renderPopoverBody(local, q, { loadingCloud: willQueryCloud });
    openPopover();

    if (willQueryCloud) {
      const reqId = ++searchCloudReqId;
      try {
        const cloudUsers = await window.SLCloud.searchProfiles(q, 20);
        if (reqId !== searchCloudReqId || $search.value.trim() !== q) return;
        // Cache global pour la page search
        __slSearchCache = { q: q.toLowerCase(), users: cloudUsers };
        // Merge (dédup par id) + filter les "me"
        const meCloudId = window.SLCloud.me && window.SLCloud.me.id;
        const localIds = new Set(local.users.map((u) => u.id));
        const mergedUsers = local.users.slice();
        cloudUsers.forEach((cu) => {
          if (cu.id === meCloudId && localIds.has("me")) return;
          if (!localIds.has(cu.id)) mergedUsers.push({ ...cu, cloud: true });
        });
        local.users = mergedUsers;
        if (!$popover.hidden) $popover.innerHTML = renderPopoverBody(local, q, { loadingCloud: false });
        // Si la page search est actuellement affichée pour cette query, on rerend pour intégrer les cloud users
        if ($main.getAttribute("data-route") === "search" && searchLastQuery === q) {
          render();
        }
      } catch (_) { /* silently ignore */ }
    }
  }

  // Permet au render() de la page search de déclencher une recherche cloud si pas en cache
  function ensureSearchCloudFor(q) {
    if (!window.SLCloud || !window.SLCloud.ready) return;
    const qq = q.toLowerCase();
    if (__slSearchCache && __slSearchCache.q === qq) return;
    // Lance asynchroniquement
    (async () => {
      const reqId = ++searchCloudReqId;
      try {
        const cloudUsers = await window.SLCloud.searchProfiles(q, 20);
        if (reqId !== searchCloudReqId) return;
        __slSearchCache = { q: qq, users: cloudUsers };
        if ($main.getAttribute("data-route") === "search" && $search.value.trim().toLowerCase() === qq) {
          render();
        }
      } catch (_) {}
    })();
  }
  window.__sl = window.__sl || {};
  window.__sl.ensureSearchCloudFor = ensureSearchCloudFor;

  function debouncedSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(runSearch, 160);
  }

  // ---- Bindings ----
  $search.addEventListener("focus", () => {
    document.body.classList.add("search-focus");
    if (!$search.value.trim()) {
      $popover.innerHTML = renderRecents();
      openPopover();
    } else {
      runSearch();
    }
  });

  $search.addEventListener("input", () => {
    debouncedSearch();
    // Pas de full render() à chaque frappe : le popover suffit
  });

  $search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$popover.hidden) {
        closePopover();
        $search.blur();
      } else if ($search.value || route.searchQuery) {
        clearSearchQuery();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if ($popover.hidden) { runSearch(); return; }
      setActive(searchActiveIndex + 1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(searchActiveIndex - 1);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const items = rebuildPopoverActiveItems();
      if (searchActiveIndex >= 0 && items[searchActiveIndex]) {
        activateRow(items[searchActiveIndex]);
      } else if ($search.value.trim()) {
        pushRecent($search.value.trim());
        closePopover();
        applySearchQuery($search.value.trim());
      }
    }
  });

  $popover.addEventListener("click", (e) => {
    const row = e.target.closest(".sp-row");
    if (row) { activateRow(row); return; }
    if (e.target.closest("[data-clear-recents]")) {
      clearRecents();
      $popover.innerHTML = renderRecents();
      return;
    }
    const seeAllBtn = e.target.closest("[data-see-all]");
    if (seeAllBtn) {
      const tab = seeAllBtn.getAttribute("data-see-all");
      pushRecent($search.value.trim());
      closePopover();
      route.searchTab = tab;
      applySearchQuery($search.value.trim(), { pushHash: true });
      return;
    }
    if (e.target.closest("[data-search-go]")) {
      pushRecent($search.value.trim());
      closePopover();
      route.searchTab = "all";
      applySearchQuery($search.value.trim());
    }
  });

  // Click outside → close
  document.addEventListener("click", (e) => {
    if (!$searchWrap.contains(e.target)) closePopover();
  });

  // ⌘K / Ctrl+K → focus la barre
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      $search.focus();
      $search.select();
    }
    if (e.key === "/" && document.activeElement && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      $search.focus();
    }
  });

  window.addEventListener("hashchange", () => {
    parseHash();
    if (route.searchQuery) $search.value = route.searchQuery;
    else if (!(window.location.hash || "").includes("recherche")) $search.value = "";
    closePopover();
    render();
  });

  document.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (!img || !img.classList || !img.classList.contains("cover-img")) return;
      const frame = img.closest(".cover-frame");
      const cover = img.closest(".cover");
      if (frame) {
        frame.classList.add("is-broken");
        frame.classList.remove("has-art");
      }
      if (cover) cover.classList.remove("has-img");
      img.remove();
    },
    true
  );

  applyTheme(getTheme());

  bindNotifHub();
  if (SLCloud && SLCloud.available && typeof SLCloud.init === "function") {
    void SLCloud.init().then(() => syncAccountChrome());
  }
  render();
  void syncTourAlerts({}).then(() => updateHeaderNotifications());

  // =======================================================================
  // Intégration cloud (Supabase) — non-invasive
  // =======================================================================

  function registerCloudPeerProfiles(rows) {
    if (!rows || !rows.length) return;
    for (const p of rows) {
      if (!p || !p.id) continue;
      if (SLCloud && SLCloud.me && p.id === SLCloud.me.id) continue;
      cloudPeers.set(p.id, p);
    }
  }

  // Mirror cloud imports into state so the profile re-renders sans aller-retour réseau
  if (SLCloud && typeof SLCloud.upsertImportedPlaylist === "function") {
    const _origUpsertImp = SLCloud.upsertImportedPlaylist.bind(SLCloud);
    SLCloud.upsertImportedPlaylist = async (data) => {
      const res = await _origUpsertImp(data);
      if (SLCloud.me) {
        state.cloudImportedPlaylists = state.cloudImportedPlaylists || [];
        const idx = state.cloudImportedPlaylists.findIndex((p) => p.id === data.id);
        const row = {
          id: data.id,
          user_id: SLCloud.me.id,
          source: data.source,
          remote_id: data.remoteId || null,
          name: data.name,
          description: data.description || "",
          artwork_url: data.artworkUrl || null,
          imported_at: new Date().toISOString(),
        };
        if (idx >= 0) state.cloudImportedPlaylists[idx] = { ...state.cloudImportedPlaylists[idx], ...row };
        else state.cloudImportedPlaylists.unshift(row);
        if (window.__sl && window.__sl.resetRecoCache) window.__sl.resetRecoCache();
      }
      return res;
    };
  }
  if (SLCloud && typeof SLCloud.insertImportedTracks === "function") {
    const _origInsImp = SLCloud.insertImportedTracks.bind(SLCloud);
    SLCloud.insertImportedTracks = async (rows) => {
      const res = await _origInsImp(rows);
      if (SLCloud.me && Array.isArray(rows)) {
        state.cloudImportedTracks = state.cloudImportedTracks || [];
        rows.forEach((r) => {
          state.cloudImportedTracks.push({
            user_id: SLCloud.me.id,
            playlist_id: r.playlistId,
            source: r.source,
            track_name: r.trackName,
            artist_name: r.artistName,
            album_name: r.albumName,
            album_year: r.albumYear || null,
            album_artwork_url: r.albumArtworkUrl || null,
            remote_track_id: r.remoteTrackId || null,
            remote_album_id: r.remoteAlbumId || null,
            duration_ms: r.durationMs != null ? r.durationMs : null,
            added_at: new Date().toISOString(),
          });
        });
      }
      return res;
    };
  }
  if (SLCloud && typeof SLCloud.deleteImportedPlaylist === "function") {
    const _origDel = SLCloud.deleteImportedPlaylist.bind(SLCloud);
    SLCloud.deleteImportedPlaylist = async (id) => {
      const res = await _origDel(id);
      state.cloudImportedPlaylists = (state.cloudImportedPlaylists || []).filter((p) => p.id !== id);
      state.cloudImportedTracks = (state.cloudImportedTracks || []).filter((t) => t.playlist_id !== id);
      if (window.__sl && window.__sl.resetRecoCache) window.__sl.resetRecoCache();
      return res;
    };
  }

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
    cloudPushTimer = setTimeout(pushCloudFull, 400);
  }
  window.__slSchedulePushCloud = schedulePushCloud;
  async function pushCloudFull() {
    if (!SLCloud || !SLCloud.isSignedIn() || !SLCloud.me || !SLCloud.me.id) return;
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
      // 2. Écoutes (l'UI utilise `review`; la base utilise `comment`)
      for (const l of state.listenings.filter((l) => l.userId === "me")) {
        const text = l.comment != null && l.comment !== "" ? l.comment : (l.review || "");
        await SLCloud.upsertListening({
          id: l.id,
          userId: cloudId,
          albumId: l.albumId,
          rating: l.rating,
          comment: text,
          commentAt: l.commentAt != null ? l.commentAt : null,
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

  /** Fusionne deux listes d'ids en gardant l'ordre du serveur puis les ajouts locaux non présents. */
  function mergeOrderedUnique(primary, secondary) {
    const seen = new Set();
    const out = [];
    for (const id of primary || []) {
      if (id == null || id === "") continue;
      const k = String(id);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(id);
    }
    for (const id of secondary || []) {
      if (id == null || id === "") continue;
      const k = String(id);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(id);
    }
    return out;
  }

  let cloudPushRunning = false;
  async function flushCloudPush() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    clearTimeout(cloudPushTimer);
    cloudPushTimer = null;
    if (cloudPushRunning) return;
    cloudPushRunning = true;
    try {
      await pushCloudFull();
    } finally {
      cloudPushRunning = false;
    }
  }
  window.__slFlushCloudPush = flushCloudPush;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
  });
  window.addEventListener("pagehide", () => {
    if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
  });

  let cloudPullPromise = null;
  let cloudSyncBannerEl = null;

  function showCloudSyncBanner(msg) {
    if (!cloudSyncBannerEl) {
      cloudSyncBannerEl = document.createElement("div");
      cloudSyncBannerEl.className = "cloud-sync-banner";
      cloudSyncBannerEl.setAttribute("role", "status");
      document.body.appendChild(cloudSyncBannerEl);
    }
    cloudSyncBannerEl.textContent = msg;
    cloudSyncBannerEl.hidden = false;
  }

  function hideCloudSyncBanner() {
    if (cloudSyncBannerEl) cloudSyncBannerEl.hidden = true;
  }

  async function ensureCloudReady() {
    if (!SLCloud || !SLCloud.available) {
      throw new Error(
        "Connexion cloud indisponible. Sur Vercel, ajoute SL_SUPABASE_URL et SL_SUPABASE_ANON_KEY (Settings → Environment Variables), puis Redeploy."
      );
    }
    if (typeof SLCloud.ensureReady === "function") return SLCloud.ensureReady();
    if (!SLCloud.ready && typeof SLCloud.init === "function") {
      const ok = await SLCloud.init();
      if (!ok) throw new Error(SLCloud.pendingError || "Cloud indisponible");
    }
    if (!SLCloud.ready) throw new Error("Cloud non initialisé");
  }

  async function pullCloudIntoState() {
    if (cloudPullPromise) return cloudPullPromise;
    cloudPullPromise = pullCloudIntoStateWork().finally(() => {
      cloudPullPromise = null;
    });
    return cloudPullPromise;
  }

  async function pullCloudIntoStateWork() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    showCloudSyncBanner("Synchronisation avec ton compte…");
    try {
      if (!SLCloud.me || !SLCloud.me.id) {
        if (typeof SLCloud.refreshProfile === "function") await SLCloud.refreshProfile();
        if (!SLCloud.me && typeof SLCloud.ensureProfileAfterAuth === "function") await SLCloud.ensureProfileAfterAuth();
      }
      if (!SLCloud.me || !SLCloud.me.id) {
        hideCloudSyncBanner();
        toast("Session ouverte mais profil introuvable — réessaie dans un instant.");
        return;
      }
    const cloudId = SLCloud.me.id;
    // État local « moi » à fusionner (évite de perdre des ajouts pas encore poussés ou un refresh rapide)
    const prevMineLists = (state.lists || [])
      .filter((l) => l.userId === "me")
      .map((l) => ({ ...l, albumIds: [...(l.albumIds || [])] }));
    const prevMineListenings = (state.listenings || []).filter((l) => l.userId === "me").map((l) => ({ ...l }));
    const prevWishlist = [...(state.wishlist || [])];
    const prevMineConcerts = (state.concertLogs || [])
      .filter((c) => c.userId === "me")
      .map((c) => ({ ...c }));
    const otherLists = (state.lists || []).filter((l) => l.userId !== "me");
    const otherListenings = (state.listenings || []).filter((l) => l.userId !== "me");
    const otherConcerts = (state.concertLogs || []).filter((c) => c.userId !== "me");

    const data = await SLCloud.pullEverything();
    if (!data) return;
    // Profil → state.profile
    state.profile.displayName = SLCloud.me.name;
    state.profile.handle = SLCloud.me.handle;
    state.profile.bio = SLCloud.me.bio || "";
    state.profile.cloudId = cloudId;
    // Albums référencés : on les ajoute en cache local (importedAlbums) si pas déjà connus
    const knownIds = new Set();

    const remoteMineListenings = (data.listenings || []).map((l) => {
      const text = l.comment != null ? l.comment : "";
      return {
        id: l.id,
        userId: "me",
        albumId: l.album_id,
        rating: l.rating,
        review: text,
        comment: text,
        commentAt: l.comment_at,
        date: l.date,
      };
    });
    const remoteListeningIds = new Set(remoteMineListenings.map((l) => l.id));
    const localOnlyListenings = prevMineListenings.filter((l) => !remoteListeningIds.has(l.id));
    state.listenings = [...otherListenings, ...remoteMineListenings, ...localOnlyListenings];
    state.listenings.forEach((l) => knownIds.add(l.albumId));

    const remoteMineLists = (data.lists || []).map((lst) => ({
      id: lst.id,
      userId: "me",
      title: lst.title,
      description: lst.description,
      isPublic: lst.is_public,
      albumIds: ((lst.list_items || []).sort((a, b) => (a.position || 0) - (b.position || 0)).map((it) => it.album_id)),
    }));
    const localMineById = new Map(prevMineLists.map((l) => [l.id, l]));
    const mergedMineLists = remoteMineLists.map((rl) => {
      const loc = localMineById.get(rl.id);
      if (!loc) return rl;
      return { ...rl, albumIds: mergeOrderedUnique(rl.albumIds, loc.albumIds) };
    });
    for (const loc of prevMineLists) {
      if (!mergedMineLists.some((m) => m.id === loc.id)) mergedMineLists.push(loc);
    }
    state.lists = [...mergedMineLists, ...otherLists];
    mergedMineLists.forEach((lst) => (lst.albumIds || []).forEach((aid) => knownIds.add(aid)));

    const remoteMineConcerts = (data.concerts || []).map((c) => ({
      id: c.id,
      userId: "me",
      artist: c.artist,
      date: c.date,
      venue: c.venue,
      city: c.city,
      eventTitle: c.event_title,
      notes: c.notes,
    }));
    const remoteConcertIds = new Set(remoteMineConcerts.map((c) => c.id));
    const localOnlyConcerts = prevMineConcerts.filter((c) => !remoteConcertIds.has(c.id));
    state.concertLogs = [...otherConcerts, ...remoteMineConcerts, ...localOnlyConcerts];

    state.wishlist = mergeOrderedUnique(data.wishlist || [], prevWishlist);
    (state.wishlist || []).forEach((aid) => knownIds.add(aid));

    state.follows = data.following || [];
    ensureSocialArrays();
    const fr = data.friendRequests || { incoming: [], outgoing: [] };
    const cloudIncoming = (fr.incoming || []).map((r) => ({
      id: r.id,
      fromUserId: r.from_user_id,
      createdAt: r.created_at || new Date().toISOString(),
    }));
    const cloudOut = (fr.outgoing || []).map((r) => ({
      id: r.id,
      toUserId: r.to_user_id,
      createdAt: r.created_at || new Date().toISOString(),
    }));
    const incFrom = new Set(cloudIncoming.map((r) => r.fromUserId));
    const outTo = new Set(cloudOut.map((r) => r.toUserId));
    state.incomingFriendRequests = [
      ...cloudIncoming,
      ...(state.incomingFriendRequests || []).filter((r) => !incFrom.has(r.fromUserId)),
    ];
    state.outgoingFriendRequests = [
      ...cloudOut,
      ...(state.outgoingFriendRequests || []).filter((r) => !outTo.has(r.toUserId)),
    ];
    const cloudFriendProfiles = data.friends || [];
    const cloudFriendIds = cloudFriendProfiles.map((p) => p.id).filter(Boolean);
    const localFriends = (state.friends || []).filter((id) => !isCloudUuid(id) && !isLegacyDemoUserId(id));
    state.friends = [...new Set([...localFriends, ...cloudFriendIds])];
    if (cloudId) {
      state.follows = (state.follows || []).filter((id) => includeUserInCircle(id));
    }
    registerCloudPeerProfiles(cloudFriendProfiles);
    const needProf = new Set();
    cloudIncoming.forEach((r) => needProf.add(r.fromUserId));
    cloudOut.forEach((r) => needProf.add(r.toUserId));
    if (cloudId) needProf.delete(cloudId);
    const missing = [...needProf].filter((uid) => uid && !cloudPeers.has(uid));
    if (missing.length && SLCloud.client) {
      try {
        const { data: profs } = await SLCloud.client.from("profiles").select("*").in("id", missing);
        registerCloudPeerProfiles(profs || []);
      } catch (_) {}
    }
    state.cloudImportedPlaylists = data.importedPlaylists || [];
    state.cloudImportedTracks = data.importedTracks || [];
    // Métadonnées albums : parallèle, plafonné (évite blocage UI plusieurs minutes)
    const missingAlbumIds = [...knownIds].filter((aid) => aid && !albumById(aid)).slice(0, 56);
    const hydrateOne = async (aid) => {
      try {
        const remote = await SLCloud.getAlbumById(aid);
        if (!remote) return;
        state.importedAlbums = state.importedAlbums || [];
        if (state.importedAlbums.some((a) => a.id === remote.id)) return;
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
      } catch (e) {
        console.warn("[pull] album", aid, e);
      }
    };
    for (let i = 0; i < missingAlbumIds.length; i += 8) {
      await Promise.all(missingAlbumIds.slice(i, i + 8).map(hydrateOne));
    }
    persistLocalOnly();
    syncAccountChrome();
    void syncNotificationsFromCloud();
    setupRealtimeHooks();
    render();
    schedulePushCloud();
    } catch (e) {
      console.warn("[pullCloudIntoState]", e);
      toast("Sync partielle : " + (e.message || "erreur réseau"));
    } finally {
      hideCloudSyncBanner();
    }
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
    const cloudMe = cloudMeRow();
    if (cloudMe) {
      btn.classList.add("is-signed-in");
      label.innerHTML = `<span>${escapeHtml(cloudMe.name)}</span><small>@${escapeHtml(cloudMe.handle)} · gérer</small>`;
      if (note) note.textContent = "Synchronisé · accessible sur tous tes appareils.";
    } else if (cloudSignedIn()) {
      btn.classList.add("is-signed-in");
      label.innerHTML = `<span>Synchronisation…</span><small>chargement du profil</small>`;
      if (note) note.textContent = "Session active — finalisation…";
      if (typeof SLCloud.refreshProfile === "function") {
        void SLCloud.refreshProfile().then(() => syncAccountChrome()).catch(() => {});
      }
    } else {
      btn.classList.remove("is-signed-in");
      label.innerHTML = `<span>Se connecter</span><small>ou créer un compte</small>`;
      if (note) note.textContent = "Mode invité — clique « Se connecter » pour synchroniser.";
    }
  }

  function setAuthFormBusy(busy, label) {
    ["auth-do-signin", "auth-do-signup", "auth-do-magic", "auth-save", "auth-do-signout"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (busy) {
        if (!el.dataset.slLabel) el.dataset.slLabel = el.textContent;
        if (label) el.textContent = label;
        el.disabled = true;
        el.setAttribute("aria-busy", "true");
      } else {
        if (el.dataset.slLabel) {
          el.textContent = el.dataset.slLabel;
          delete el.dataset.slLabel;
        }
        el.disabled = false;
        el.removeAttribute("aria-busy");
      }
    });
    const cancel = document.getElementById("auth-cancel");
    if (cancel) cancel.disabled = !!busy;
  }

  function openAccountModal(initialTab) {
    if (!SLCloud || !SLCloud.available) {
      openModal(`<h2>Compte Soundlog</h2>
        <p class="auth-error" style="display:block">La connexion en ligne n’est pas disponible sur cette version du site.</p>
        <p class="feed-note">Pour les administrateurs : dans Vercel → <strong>Settings → Environment Variables</strong>, ajoute <code>SL_SUPABASE_URL</code> et <code>SL_SUPABASE_ANON_KEY</code> (valeurs Supabase → Settings → API), coche <strong>Production</strong> et <strong>Preview</strong>, puis <strong>Deployments → Redeploy</strong>.</p>
        <p class="modal-actions"><button type="button" class="btn btn-ghost" id="auth-cancel">Fermer</button></p>`);
      document.getElementById("auth-cancel").addEventListener("click", closeModal);
      return;
    }
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
          setAuthFormBusy(true, "Connexion…");
          try {
            await ensureCloudReady();
            await SLCloud.signIn({ email, password: pw });
            closeModal();
            toast("Connecté·e — synchronisation…");
            await pullCloudIntoState();
            updateSidebarAccount();
            updateHeaderUser();
            toast("Données synchronisées.");
          } catch (e) {
            showAuthErr(e.message || "Connexion impossible.");
          } finally {
            setAuthFormBusy(false);
          }
        });
        document.getElementById("auth-do-magic").addEventListener("click", async () => {
          const email = document.getElementById("auth-email").value.trim();
          if (!email) return showAuthErr("Email requis.");
          setAuthFormBusy(true, "Envoi…");
          try {
            await ensureCloudReady();
            await SLCloud.signInWithMagicLink({ email });
            toast("Lien envoyé — clique-le dans ta boîte mail.");
          } catch (e) {
            showAuthErr(e.message || "Envoi impossible.");
          } finally {
            setAuthFormBusy(false);
          }
        });
      } else if (which === "signup") {
        panel.innerHTML = `
          <label>Nom affiché <input type="text" id="auth-name" autocomplete="name" placeholder="Ton prénom ou surnom" /></label>
          ${handleFieldHtml({ inputId: "auth-handle", previewId: "auth-handle-preview" })}
          <label>Email <input type="email" id="auth-email" autocomplete="email" /></label>
          <label>Mot de passe (8+ caractères) <input type="password" id="auth-pw" autocomplete="new-password" /></label>
          <p class="auth-error" id="auth-err" hidden></p>
          <p class="modal-actions">
            <button type="button" class="btn btn-primary" id="auth-do-signup">Créer le compte</button>
            <button type="button" class="btn btn-ghost" id="auth-cancel">Fermer</button>
          </p>`;
        wireHandleFieldPreview("auth-handle", "auth-handle-preview");
        document.getElementById("auth-cancel").addEventListener("click", closeModal);
        document.getElementById("auth-do-signup").addEventListener("click", async () => {
          const name = document.getElementById("auth-name").value.trim();
          const hv = validateHandleInput(document.getElementById("auth-handle").value);
          const email = document.getElementById("auth-email").value.trim();
          const pw = document.getElementById("auth-pw").value;
          if (!name || !email || !pw) return showAuthErr("Tous les champs sont requis.");
          if (!hv.ok) return showAuthErr(hv.message);
          const handle = hv.handle;
          if (pw.length < 8) return showAuthErr("Le mot de passe doit faire 8 caractères ou plus.");
          setAuthFormBusy(true, "Création…");
          try {
            await ensureCloudReady();
            await SLCloud.signUp({ email, password: pw, handle, name, hue: state.profile && hueFromHandle(handle) });
            if (!SLCloud.isSignedIn()) {
              toast("Compte créé — confirme ton email si Supabase l’exige, puis connecte-toi.");
              renderPanel("signin");
              return;
            }
            closeModal();
            toast("Compte créé — synchronisation…");
            await pullCloudIntoState();
            schedulePushCloud();
            updateSidebarAccount();
            updateHeaderUser();
            toast("Compte prêt.");
          } catch (e) {
            showAuthErr(e.message || "Inscription impossible.");
          } finally {
            setAuthFormBusy(false);
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
          ${handleFieldHtml({ inputId: "auth-handle", previewId: "auth-handle-preview", value: me.handle })}
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
        wireHandleFieldPreview("auth-handle", "auth-handle-preview");
        document.getElementById("auth-cancel").addEventListener("click", closeModal);
        document.getElementById("auth-save").addEventListener("click", async () => {
          const hv = validateHandleInput(document.getElementById("auth-handle").value);
          if (!hv.ok) return showAuthErr(hv.message);
          const patch = {
            name: document.getElementById("auth-name").value.trim(),
            handle: hv.handle,
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
  const themeToggleSidebar = document.getElementById("theme-toggle");
  if (themeToggleSidebar && !themeToggleSidebar.dataset.bound) {
    themeToggleSidebar.dataset.bound = "1";
    themeToggleSidebar.addEventListener("click", () => toggleTheme());
  }

  if (sidebarAccount) {
    sidebarAccount.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!SLCloud || !SLCloud.available) {
        toast("Connexion cloud indisponible — contacte l’administrateur du site.");
        return;
      }
      try {
        await ensureCloudReady();
        openAccountModal();
      } catch (err) {
        toast(err.message || "Impossible d’ouvrir le compte cloud.");
      }
    });
  }

  // Réagir aux changements d'auth : pull uniquement au démarrage (ready), pas à chaque auth
  // (évite double sync avec le bouton « Se connecter » qui appelle déjà pullCloudIntoState).
  if (SLCloud && SLCloud.on) {
    SLCloud.on((evt) => {
      if (evt === "ready") {
        syncAccountChrome();
        if (SLCloud.isSignedIn()) {
          void pullCloudIntoState();
          void syncNotificationsFromCloud();
          setupRealtimeHooks();
        }
      } else if (evt === "auth") {
        syncAccountChrome();
        if (SLCloud.isSignedIn()) {
          void syncNotificationsFromCloud();
          setupRealtimeHooks();
        }
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
        const mine = state.listenings.find((l) => l.id === newRow.listening_id);
        if (mine && newRow.author_id !== SLCloud.me.id) {
          const peer = cloudPeers.get(newRow.author_id);
          toast(`${peer ? peer.name : "Quelqu'un"} a commenté ton écoute.`);
          void syncNotificationsFromCloud();
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
          void syncNotificationsFromCloud();
          scheduleSoftRender();
        }
      },
      onFollow: (p) => {
        if (p.eventType !== "INSERT") return;
        const newRow = p.new || {};
        if (newRow.followee_id === SLCloud.me.id) {
          const peer = cloudPeers.get(newRow.follower_id);
          toast(`${peer ? peer.name : "Quelqu'un"} te suit.`);
          void syncNotificationsFromCloud();
        }
      },
      onNotification: (p) => {
        if (p.eventType !== "INSERT") return;
        void syncNotificationsFromCloud();
        const row = p.new || {};
        if (row.title) {
          try {
            const desk = state.settings && state.settings.desktopAlerts;
            if (desk && typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification(row.title, { body: String(row.body || "").slice(0, 200) });
            }
          } catch (_) {}
        }
      },
      onLike: () => {
        scheduleSoftRender();
      },
      onDmMessage: () => {
        if (route.view !== "inbox") return;
        void hydrateInboxList();
        if (route.dmThreadId) void hydrateInboxThread(route.dmThreadId);
      },
      onEventInterest: () => {
        if (route.view === "social") void injectSocialEventInterests();
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
  function formatListenMs(ms) {
    const n = Number(ms) || 0;
    if (n <= 0) return "—";
    const min = Math.round(n / 60000);
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const r = min % 60;
    return `${h} h ${r} min`;
  }

  async function openCloudStatsModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    const uid = SLCloud.me.id;
    const spReady = SLCloud.spotify && SLCloud.spotify.isConfigured() && SLCloud.spotify.hasToken();
    openModal(`<h2>Mes statistiques</h2>
      <div id="cloud-stats" class="cloud-stats"><p class="feed-note">Calcul…</p></div>
      <p class="modal-actions cloud-stats-actions">
        <button type="button" class="btn btn-primary" id="cloud-stats-sync-spotify" ${spReady ? "" : "disabled"} title="Session Spotify requise">Sync Spotify (écoutes récentes)</button>
        <button type="button" class="btn btn-ghost" id="cloud-stats-close">Fermer</button>
      </p>
      <p class="feed-note cloud-stats-foot">Le classement combine la <strong>durée des titres importés</strong> (quand connue) et l’<strong>historique « récemment écouté »</strong> Spotify. Réautorise Spotify si la sync est refusée (nouvelle permission).</p>`);
    document.getElementById("cloud-stats-close").addEventListener("click", closeModal);
    const syncBtn = document.getElementById("cloud-stats-sync-spotify");
    if (syncBtn && spReady) {
      syncBtn.addEventListener("click", async () => {
        syncBtn.disabled = true;
        syncBtn.textContent = "Synchronisation…";
        try {
          const r = await SLCloud.syncSpotifyPlayHistory();
          toast(`Historique Spotify : ${r.inserted || 0} ligne(s) traitée(s).`);
          await fillCloudStatsPanel(uid);
        } catch (e) {
          toast(e.message || "Sync impossible — reconnecte Spotify.");
        } finally {
          syncBtn.disabled = false;
          syncBtn.textContent = "Sync Spotify (écoutes récentes)";
        }
      });
    }
    async function fillCloudStatsPanel(userId) {
      const node = document.getElementById("cloud-stats");
      if (!node) return;
      node.innerHTML = `<p class="feed-note">Chargement…</p>`;
      try {
        const [stats, top, recos, rankRow, board] = await Promise.all([
          SLCloud.getUserStats(userId),
          SLCloud.getTopArtists(userId, 12),
          SLCloud.getRecommendations(userId, 12),
          SLCloud.getListeningRank(userId).catch(() => null),
          SLCloud.getListeningLeaderboard(14).catch(() => []),
        ]);
        const libMs = stats && (stats.imported_library_ms != null ? stats.imported_library_ms : null);
        const recMs = stats && (stats.streaming_recent_ms != null ? stats.streaming_recent_ms : null);
        const recPlays = stats && (stats.streaming_recent_plays != null ? stats.streaming_recent_plays : null);
        const rankLine = rankRow
          ? `<p class="cloud-rank-line"><strong>Rang #${rankRow.rank_listen}</strong> sur ${rankRow.leaderboard_size || "?"} · combiné ${escapeHtml(String(rankRow.combined_minutes))} min</p>`
          : `<p class="feed-note">Pas encore classé·e — importe des playlists avec durées ou synchronise Spotify.</p>`;
        const lb =
          board && board.length
            ? `<ol class="cloud-leaderboard">${board
                .map(
                  (row) =>
                    `<li class="${row.user_id === userId ? "is-me" : ""}"><span class="cloud-lb-rank">#${row.rank_listen}</span><span class="cloud-lb-name">${escapeHtml(
                      row.name || row.handle || "?"
                    )}</span><span class="cloud-lb-meta">${escapeHtml(String(row.combined_minutes))} min</span>${
                      Number(row.recent_listen_minutes) > 0
                        ? `<span class="cloud-lb-sub">${escapeHtml(String(row.recent_listen_minutes))} min Spotify récent</span>`
                        : ""
                    }</li>`
                )
                .join("")}</ol>`
            : `<p class="feed-note">Classement vide pour l’instant.</p>`;
        node.innerHTML = `
        <section class="cloud-streaming-summary">
          <h3>Streaming &amp; durée</h3>
          <p class="feed-note">Volume musical des imports : <strong>${escapeHtml(formatListenMs(libMs))}</strong> · lectures enregistrées (API Spotify) : <strong>${escapeHtml(
            formatListenMs(recMs)
          )}</strong>${recPlays != null ? ` <span class="feed-note">(${recPlays} événements)</span>` : ""}</p>
          ${rankLine}
        </section>
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
        <h3>Classement (durée cumulée)</h3>
        ${lb}
        <h3>Top artistes</h3>
        ${top.length ? `<ol class="cloud-top-artists">${top.map((a) => `<li><span>${escapeHtml(a.artist_name)}</span><em>${a.track_count}</em></li>`).join("")}</ol>` : `<p class="feed-note">Importe une playlist ou note des albums pour générer ton top artistes.</p>`}
        <h3>Recommandé pour toi</h3>
        <div id="cloud-stats-recos">${renderRecoCardsHtml(recos, { compact: true })}</div>`;
      } catch (e) {
        node.innerHTML = `<p class="auth-error">${escapeHtml(e.message || "Erreur de chargement")}</p><p class="feed-note">Si tu viens de déployer la base, exécute <strong>MIGRATION_v4.sql</strong> ou <strong>MIGRATION_v6.sql</strong> dans Supabase.</p>`;
      }
      bindRecoCardEvents(node);
    }
    await fillCloudStatsPanel(uid);
  }

  // ---------- Avatar upload ----------

  /** Réduit les très grandes images avant upload (affichage avatar = petit cercle). */
  async function prepareAvatarForUpload(file) {
    if (!file || !file.type.startsWith("image/")) throw new Error("Choisis une image (JPG, PNG ou WebP).");
    if (file.size > AVATAR_MAX_BYTES) {
      throw new Error(`Image trop lourde (max ${AVATAR_MAX_MB} Mo).`);
    }
    if (file.size <= 900 * 1024) return file;
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Impossible de lire cette image."));
        el.src = url;
      });
      const maxDim = 1200;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxDim || h > maxDim) {
        if (w >= h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, w, h);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob) return file;
      return new File([blob], "avatar.jpg", { type: "image/jpeg" });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function openAvatarUploadModal() {
    if (!SLCloud || !SLCloud.isSignedIn()) return;
    const me = SLCloud.me;
    const current = me.avatar_url
      ? `<img class="avatar-preview" src="${escapeHtml(me.avatar_url)}" alt="" />`
      : `<div class="avatar-preview avatar-preview--placeholder" style="background:hsl(${me.hue || 220},55%,50%)">${escapeHtml((me.name || "?").slice(0,1).toUpperCase())}</div>`;
    openModal(`<h2>Avatar</h2>
      ${current}
      <label class="cloud-upload">
        <span>Choisir une image (JPG, PNG, WebP — max ${AVATAR_MAX_MB} Mo)</span>
        <input type="file" id="avatar-file" accept="image/png,image/jpeg,image/webp,image/jpg" />
      </label>
      <p class="feed-note">Les photos lourdes sont automatiquement optimisées avant l'envoi.</p>
      <p class="auth-error" id="avatar-err" hidden></p>
      <p class="modal-actions">
        <button type="button" class="btn btn-primary" id="avatar-save">Téléverser</button>
        <button type="button" class="btn btn-ghost" id="avatar-cancel">Fermer</button>
      </p>`);
    document.getElementById("avatar-cancel").addEventListener("click", closeModal);
    document.getElementById("avatar-save").addEventListener("click", async () => {
      const f = document.getElementById("avatar-file").files[0];
      if (!f) return;
      const err = document.getElementById("avatar-err");
      const saveBtn = document.getElementById("avatar-save");
      try {
        if (err) err.hidden = true;
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.textContent = "Envoi…";
        }
        const prepared = await prepareAvatarForUpload(f);
        await SLCloud.uploadAvatar(prepared);
        toast("Avatar mis à jour.");
        closeModal();
        render();
      } catch (e) {
        if (err) {
          err.textContent = e.message || "Échec du téléversement.";
          err.hidden = false;
        }
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Téléverser";
        }
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
        durationMs: t.duration_ms != null ? t.duration_ms : null,
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
          durationMs: t.duration_ms != null ? t.duration_ms : null,
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
          durationMs: t.duration != null ? Number(t.duration) * 1000 : null,
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
