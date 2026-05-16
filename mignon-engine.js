/* Soundlog — Mignon Engine (environnements pixel, archétypes, progression v2) */
(function () {
  "use strict";

  const VERSION = 2;

  const ENV_LEGACY = {
    bedroom: "lofi_bedroom",
    vinyl: "vinyl_lounge",
    neon: "neon_studio",
    crt: "crt_nostalgia",
    club: "underground_club",
    dreamy: "dream_void",
  };

  const ENVIRONMENTS = {
    lofi_bedroom: {
      id: "lofi_bedroom",
      label: "Chambre lo-fi",
      icon: "◐",
      unlockXp: 0,
      vibe: "lofi",
      weather: "none",
      props: ["window_rain", "bed", "desk", "lamp", "posters", "plant", "cassette"],
    },
    vinyl_lounge: {
      id: "vinyl_lounge",
      label: "Salon vinyles",
      icon: "◎",
      unlockXp: 200,
      vibe: "jazz",
      weather: "none",
      props: ["shelf_vinyl", "turntable", "armchair", "lamp_warm", "posters", "speakers"],
    },
    neon_studio: {
      id: "neon_studio",
      label: "Studio néon",
      icon: "◈",
      unlockXp: 450,
      vibe: "techno",
      weather: "none",
      props: ["synth", "neon_sign", "desk", "speakers", "led_strip", "crt_small"],
    },
    crt_nostalgia: {
      id: "crt_nostalgia",
      label: "Salle CRT",
      icon: "▣",
      unlockXp: 350,
      vibe: "retro",
      weather: "none",
      props: ["crt_big", "console", "shelf", "posters", "carpet"],
    },
    underground_club: {
      id: "underground_club",
      label: "Club souterrain",
      icon: "◆",
      unlockXp: 500,
      vibe: "rap",
      weather: "none",
      props: ["strobe", "speakers", "barrel", "graffiti", "smoke"],
    },
    dream_void: {
      id: "dream_void",
      label: "Nuage flottant",
      icon: "◇",
      unlockXp: 300,
      vibe: "ambient",
      weather: "fog",
      props: ["clouds", "stars", "floating_vinyl", "aurora"],
    },
    shoegaze_mist: {
      id: "shoegaze_mist",
      label: "Brume shoegaze",
      icon: "◌",
      unlockXp: 400,
      vibe: "shoegaze",
      weather: "fog",
      props: ["fog", "guitar", "amp", "window", "bloom_light"],
    },
    rap_basement: {
      id: "rap_basement",
      label: "Sous-sol rap",
      icon: "▤",
      unlockXp: 550,
      vibe: "rap",
      weather: "none",
      props: ["brick", "mic", "crate", "graffiti", "red_light"],
    },
    citypop_apt: {
      id: "citypop_apt",
      label: "Appart city pop",
      icon: "▥",
      unlockXp: 480,
      vibe: "pop",
      weather: "night",
      props: ["city_window", "palm", "cassette", "neon_pink", "fan"],
    },
    glitch_rift: {
      id: "glitch_rift",
      label: "Faille glitch",
      icon: "▦",
      unlockXp: 900,
      vibe: "experimental",
      weather: "glitch",
      props: ["rift", "pixels", "wireframe", "static"],
    },
    rainy_cafe: {
      id: "rainy_cafe",
      label: "Café pluvieux",
      icon: "☕",
      unlockXp: 250,
      vibe: "jazz",
      weather: "rain",
      props: ["window_rain", "counter", "espresso", "jazz_poster", "plant"],
    },
  };

  const ARCHETYPES = {
    default: {
      id: "default",
      label: "Mignon originel",
      desc: "Ton compagnon de base — pur et évolutif.",
      rarity: "common",
      unlock: { type: "default" },
      speciesTint: null,
    },
    masked_verse: {
      id: "masked_verse",
      label: "Masque de verse",
      desc: "Archétype inspiré par l'esthétique rap/industriel masqué — flows sombres.",
      rarity: "rare",
      unlock: { type: "genre", genres: ["Rap", "Hip-Hop", "Metal"], min: 8 },
      speciesTint: "pulse",
      particle: "spark",
    },
    dream_pop: {
      id: "dream_pop",
      label: "Silhouette onirique",
      desc: "Figure pop expérimentale et rêveuse — lumières pastel.",
      rarity: "rare",
      unlock: { type: "genre", genres: ["Pop", "Indie", "Electronic"], min: 10 },
      speciesTint: "bloom",
      particle: "bloom",
    },
    shoegaze_shadow: {
      id: "shoegaze_shadow",
      label: "Ombre shoegaze",
      desc: "Silhouette brumeuse et mélancolique — guitares noyées.",
      rarity: "uncommon",
      unlock: { type: "genre", genres: ["Shoegaze", "Ambient", "Indie"], min: 6 },
      speciesTint: "drift",
      particle: "fog",
    },
    synth_architect: {
      id: "synth_architect",
      label: "Architecte synth",
      desc: "Producteur futuriste — néons et machines.",
      rarity: "rare",
      unlock: { type: "genre", genres: ["Electronic", "Experimental"], min: 8 },
      speciesTint: "glitch",
      particle: "neon",
    },
    punk_underground: {
      id: "punk_underground",
      label: "Icône underground",
      desc: "Énergie punk & garage — attitude brute.",
      rarity: "uncommon",
      unlock: { type: "reviews", min: 15 },
      speciesTint: "spark",
      particle: "strobe",
    },
    psych_traveler: {
      id: "psych_traveler",
      label: "Voyageur psyché",
      desc: "Rock psychédélique — couleurs et chemins.",
      rarity: "epic",
      unlock: { type: "xp", min: 1200 },
      speciesTint: "vinyl",
      particle: "aurora",
    },
  };

  const FURNITURE = {
    poster_waves: { id: "poster_waves", label: "Poster vagues", slot: "wall", unlockXp: 80 },
    poster_city: { id: "poster_city", label: "Poster skyline", slot: "wall", unlockXp: 120 },
    lamp_pixel: { id: "lamp_pixel", label: "Lampe pixel", slot: "floor", unlockXp: 60 },
    plant_lofi: { id: "plant_lofi", label: "Plante lo-fi", slot: "floor", unlockXp: 40 },
    speaker_stack: { id: "speaker_stack", label: "Stack enceintes", slot: "floor", unlockXp: 150 },
    vinyl_crate: { id: "vinyl_crate", label: "Caisse vinyles", slot: "floor", unlockXp: 100 },
    crt_mini: { id: "crt_mini", label: "Mini CRT", slot: "desk", unlockXp: 200 },
  };

  const ACHIEVEMENTS = [
    { id: "first_listen", label: "Première note", xp: 30, check: (ctx) => ctx.listenCount >= 1 },
    { id: "critic", label: "Plume d'or", xp: 50, check: (ctx) => ctx.reviewCount >= 5 },
    { id: "explorer", label: "Explorateur", xp: 80, check: (ctx) => ctx.genreCount >= 5 },
    { id: "streak_7", label: "Semaine fidèle", xp: 100, check: (ctx) => ctx.streak >= 7 },
    { id: "social_10", label: "Cœur du cercle", xp: 60, check: (ctx) => ctx.totalSocial >= 10 },
    { id: "radiant", label: "Forme radiant", xp: 150, check: (ctx) => ctx.stage >= 4 },
  ];

  const GENRE_VIBE = {
    Rap: "rap",
    "Hip-Hop": "rap",
    Electronic: "techno",
    Experimental: "experimental",
    Ambient: "ambient",
    Shoegaze: "shoegaze",
    Indie: "shoegaze",
    Jazz: "jazz",
    Soul: "jazz",
    "R&B": "lofi",
    Pop: "pop",
    Rock: "retro",
    Metal: "rap",
    Punk: "rap",
    Classical: "ambient",
    Folk: "lofi",
  };

  function migrateState(m) {
    if (!m || typeof m !== "object") return null;
    if (m.environment && ENV_LEGACY[m.environment]) m.environment = ENV_LEGACY[m.environment];
    if (!ENVIRONMENTS[m.environment]) m.environment = "lofi_bedroom";
    m.v = VERSION;
    m.equippedSkin = ARCHETYPES[m.equippedSkin] ? m.equippedSkin : "default";
    m.unlockedSkins = Array.isArray(m.unlockedSkins) ? m.unlockedSkins.filter((id) => ARCHETYPES[id]) : ["default"];
    if (!m.unlockedSkins.includes("default")) m.unlockedSkins.unshift("default");
    m.unlockedEnvs = Array.isArray(m.unlockedEnvs) ? m.unlockedEnvs.filter((id) => ENVIRONMENTS[id]) : ["lofi_bedroom"];
    if (!m.unlockedEnvs.includes("lofi_bedroom")) m.unlockedEnvs.unshift("lofi_bedroom");
    m.inventory = m.inventory && typeof m.inventory === "object" ? m.inventory : { furniture: [], posters: [] };
    if (!Array.isArray(m.inventory.furniture)) m.inventory.furniture = [];
    if (!Array.isArray(m.inventory.posters)) m.inventory.posters = [];
    m.roomLayout = m.roomLayout && typeof m.roomLayout === "object" ? m.roomLayout : { placed: [] };
    if (!Array.isArray(m.roomLayout.placed)) m.roomLayout.placed = [];
    m.achievements = Array.isArray(m.achievements) ? m.achievements : [];
    m.auraScore = typeof m.auraScore === "number" ? m.auraScore : 0;
    m.miniGameStats = m.miniGameStats && typeof m.miniGameStats === "object" ? m.miniGameStats : {};
    return m;
  }

  function computeMusicVibe(profile) {
    const genres = profile.genres || {};
    const sorted = Object.entries(genres).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return "lofi";
    const vibeCounts = {};
    sorted.forEach(([g, n]) => {
      const v = GENRE_VIBE[g] || "lofi";
      vibeCounts[v] = (vibeCounts[v] || 0) + n;
    });
    return Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0][0];
  }

  function computeAuraScore(m, profile) {
    let score = Math.round((m.happiness + m.affinity + m.level * 4 + m.streak * 6 + (m.xp || 0) / 40) / 4);
    score += Math.min(30, Object.keys(profile.genres || {}).length * 4);
    if ((m.achievements || []).length) score += m.achievements.length * 5;
    const skinRarity = { common: 0, uncommon: 8, rare: 15, epic: 25 };
    const skin = ARCHETYPES[m.equippedSkin];
    if (skin) score += skinRarity[skin.rarity] || 0;
    return Math.min(999, score);
  }

  function ctxFrom(m, profile, snap) {
    snap = snap || {};
    const genres = profile.genres || {};
    return {
      listenCount: profile.listenCount || 0,
      reviewCount: Object.values(
        (window.__slMignonDeps && window.__slMignonDeps.state && window.__slMignonDeps.state.listenings) || []
      ).filter((l) => l.userId === "me" && l.review && l.review.trim()).length,
      genreCount: Object.keys(genres).length,
      streak: m.streak || 0,
      stage: m.stage || 0,
      totalSocial: m.stats && m.stats.totalFeeds ? m.stats.totalFeeds : 0,
      xp: m.xp || 0,
      snap,
    };
  }

  function checkUnlocks(m, profile) {
    const genres = profile.genres || {};
    let changed = false;
    Object.values(ENVIRONMENTS).forEach((env) => {
      if ((m.xp || 0) >= env.unlockXp && !m.unlockedEnvs.includes(env.id)) {
        m.unlockedEnvs.push(env.id);
        changed = true;
      }
    });
    Object.values(ARCHETYPES).forEach((arch) => {
      if (m.unlockedSkins.includes(arch.id)) return;
      const u = arch.unlock;
      if (u.type === "default") return;
      if (u.type === "xp" && (m.xp || 0) >= u.min) {
        m.unlockedSkins.push(arch.id);
        changed = true;
        return;
      }
      if (u.type === "reviews" && ctxFrom(m, profile).reviewCount >= u.min) {
        m.unlockedSkins.push(arch.id);
        changed = true;
        return;
      }
      if (u.type === "genre" && u.genres) {
        let sum = 0;
        u.genres.forEach((g) => {
          sum += genres[g] || 0;
        });
        if (sum >= u.min) {
          m.unlockedSkins.push(arch.id);
          changed = true;
        }
      }
    });
    Object.values(FURNITURE).forEach((f) => {
      if ((m.xp || 0) >= f.unlockXp && !m.inventory.furniture.includes(f.id)) {
        m.inventory.furniture.push(f.id);
        changed = true;
      }
    });
    return changed;
  }

  function checkAchievements(m, profile, snap) {
    const ctx = ctxFrom(m, profile, snap);
    let unlocked = false;
    ACHIEVEMENTS.forEach((a) => {
      if (m.achievements.includes(a.id)) return;
      if (a.check(ctx)) {
        m.achievements.push(a.id);
        m.xp = (m.xp || 0) + a.xp;
        unlocked = true;
      }
    });
    return unlocked;
  }

  function propLayer(env, propId) {
    return `<span class="px-prop px-prop--${propId}" aria-hidden="true"></span>`;
  }

  function renderPixelRoom(m, opts) {
    opts = opts || {};
    const esc = opts.escapeHtml || ((s) => String(s));
    const envId = ENVIRONMENTS[m.environment] ? m.environment : "lofi_bedroom";
    const env = ENVIRONMENTS[envId];
    const vibe = opts.musicVibe || env.vibe;
    const weather = env.weather !== "none" ? env.weather : opts.weather || "none";
    const arch = ARCHETYPES[m.equippedSkin] || ARCHETYPES.default;
    const particle = arch.particle || "dust";
    const propsHtml = (env.props || []).map((p) => propLayer(env, p)).join("");
    const placed = (m.roomLayout && m.roomLayout.placed) || [];
    const decorHtml = placed
      .map(
        (d) =>
          `<span class="px-decor px-decor--${esc(d.id)}" style="left:${esc(d.x)}%;bottom:${esc(d.y)}%" data-decor-id="${esc(d.id)}" aria-hidden="true"></span>`
      )
      .join("");

    return `<div class="px-room px-room--${esc(envId)}" data-env="${esc(envId)}" data-vibe="${esc(vibe)}" data-weather="${esc(weather)}" data-particle="${esc(particle)}">
      <div class="px-room__scanlines" aria-hidden="true"></div>
      <div class="px-room__vignette" aria-hidden="true"></div>
      <div class="px-room__layer px-room__layer--sky" aria-hidden="true"></div>
      <div class="px-room__layer px-room__layer--back" aria-hidden="true">${propsHtml}</div>
      <div class="px-room__layer px-room__layer--floor" aria-hidden="true"></div>
      <div class="px-room__layer px-room__layer--mid" aria-hidden="true"></div>
      <div class="px-room__layer px-room__layer--decor" aria-hidden="true">${decorHtml}</div>
      <div class="px-room__layer px-room__layer--light" aria-hidden="true"></div>
      <div class="px-room__particles px-room__particles--${esc(particle)}" aria-hidden="true"></div>
      ${weather === "rain" ? '<div class="px-room__rain" aria-hidden="true"></div>' : ""}
      ${weather === "fog" ? '<div class="px-room__fog" aria-hidden="true"></div>' : ""}
      <p class="px-room__label"><span class="px-room__label-icon">${esc(env.icon)}</span> ${esc(env.label)}</p>
    </div>`;
  }

  function renderCreaturePixel(m, opts) {
    opts = opts || {};
    const esc = opts.escapeHtml || ((s) => String(s));
    const compact = !!opts.compact;
    const arch = ARCHETYPES[m.equippedSkin] || ARCHETYPES.default;
    const skin = m.equippedSkin || "default";
    const species = m.species || "pulse";
    const anim = m.anim || "idle";
    const mood = m.mood || "calm";
    const stage = m.stage || 0;

    return `<div class="px-creature${compact ? " px-creature--compact" : ""}" data-species="${esc(species)}" data-skin="${esc(skin)}" data-stage="${stage}" data-mood="${esc(mood)}" data-anim="${esc(anim)}" role="img" aria-label="${esc(m.name)}">
      <div class="px-creature__aura" aria-hidden="true"></div>
      <div class="px-creature__shadow" aria-hidden="true"></div>
      <div class="px-creature__body">
        ${skin !== "default" ? `<span class="px-creature__skin px-creature__skin--${esc(skin)}" aria-hidden="true"></span>` : ""}
        <span class="px-creature__ears" aria-hidden="true"></span>
        <span class="px-creature__face" aria-hidden="true">
          <span class="px-creature__eye px-creature__eye--l"></span>
          <span class="px-creature__eye px-creature__eye--r"></span>
          <span class="px-creature__blush" aria-hidden="true"></span>
          <span class="px-creature__mouth"></span>
        </span>
        <span class="px-creature__core" aria-hidden="true"></span>
        ${stage === 0 ? '<span class="px-creature__egg" aria-hidden="true"></span>' : ""}
        ${(m.cosmetics && m.cosmetics.equipped || []).includes("headphones") ? '<span class="px-creature__gear px-creature__gear--phones" aria-hidden="true"></span>' : ""}
        ${(m.cosmetics && m.cosmetics.equipped || []).includes("vinyl-hat") ? '<span class="px-creature__gear px-creature__gear--vinyl" aria-hidden="true"></span>' : ""}
      </div>
      <span class="px-creature__note" aria-hidden="true">♪</span>
      ${!compact ? `<p class="px-creature__tag">${esc(arch.label)}</p>` : ""}
    </div>`;
  }

  window.SLMignonEngine = {
    VERSION,
    ENVIRONMENTS,
    ARCHETYPES,
    FURNITURE,
    ACHIEVEMENTS,
    ENV_LEGACY,
    migrateState,
    computeMusicVibe,
    computeAuraScore,
    checkUnlocks,
    checkAchievements,
    renderPixelRoom,
    renderCreaturePixel,
    propLayer,
  };
})();
