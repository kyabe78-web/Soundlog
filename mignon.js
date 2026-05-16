/* Soundlog — Mignon : compagnon musical évolutif */
(function () {
  "use strict";

  let deps = null;

  const VERSION = 2;

  function ENG() {
    return window.SLMignonEngine || null;
  }
  const MAX_STAT = 100;
  const DAY_MS = 86400000;

  const SPECIES = {
    pulse: { id: "pulse", label: "Pulse", desc: "Énergique, rythmé — le beat te suit.", rarity: "common" },
    drift: { id: "drift", label: "Drift", desc: "Flottant, rêveur — ambient & shoegaze.", rarity: "uncommon" },
    glitch: { id: "glitch", label: "Glitch", desc: "Expérimental, instable — textures rares.", rarity: "rare" },
    bloom: { id: "bloom", label: "Bloom", desc: "Nostalgique, doux — indie & mélancolie.", rarity: "uncommon" },
    spark: { id: "spark", label: "Spark", desc: "Vif, social — le cercle t'anime.", rarity: "common" },
    vinyl: { id: "vinyl", label: "Vinyl", desc: "Chaleureux, classique — jazz & soul.", rarity: "uncommon" },
  };

  const STAGES = [
    { level: 0, name: "Œuf", xp: 0 },
    { level: 1, name: "Éveil", xp: 120 },
    { level: 2, name: "Croissance", xp: 380 },
    { level: 3, name: "Maturité", xp: 900 },
    { level: 4, name: "Radiant", xp: 1800 },
  ];

  function getEnvironments() {
    return ENG() ? ENG().ENVIRONMENTS : { lofi_bedroom: { id: "lofi_bedroom", label: "Chambre lo-fi", icon: "◐" } };
  }

  const PERSONALITIES = {
    curator: "Curateur·rice",
    explorer: "Explorateur·rice",
    poet: "Poète",
    socialite: "Social·e",
    nightowl: "Noctambule",
    steady: "Régulier·ère",
  };

  const MOODS = {
    bliss: { label: "Rayonnant", emoji: "✦" },
    happy: { label: "Joyeux", emoji: "♪" },
    calm: { label: "Calme", emoji: "～" },
    sleepy: { label: "Somnolent", emoji: "z" },
    wistful: { label: "Nostalgique", emoji: "◌" },
    excited: { label: "Excité", emoji: "!" },
    listening: { label: "À l'écoute", emoji: "◎" },
  };

  const DAILY_MISSIONS = [
    { id: "log_listen", label: "Logger une écoute", xp: 35, check: (p) => p.todayListens >= 1 },
    { id: "rate_song", label: "Noter avec une étoile", xp: 20, check: (p) => p.todayRated >= 1 },
    { id: "write_review", label: "Écrire une critique", xp: 45, check: (p) => p.todayReviews >= 1 },
    { id: "discover_genre", label: "Découvrir un nouveau genre", xp: 30, check: (p) => p.newGenreToday },
    { id: "social_pulse", label: "Réagir dans le fil", xp: 25, check: (p) => p.todaySocial >= 1 },
  ];

  const GENRE_MAP = {
    Rap: "pulse",
    "Hip-Hop": "pulse",
    Electronic: "glitch",
    Experimental: "glitch",
    Ambient: "drift",
    Shoegaze: "bloom",
    Indie: "bloom",
    Rock: "spark",
    Pop: "spark",
    Jazz: "vinyl",
    Soul: "vinyl",
    "R&B": "vinyl",
    Classical: "drift",
    Folk: "bloom",
    Metal: "pulse",
    Punk: "spark",
  };

  function d() {
    return deps;
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function defaultMignon() {
    return {
      v: VERSION,
      name: "Mignon",
      species: "pulse",
      stage: 0,
      level: 1,
      xp: 0,
      mood: "calm",
      anim: "idle",
      hunger: 72,
      energy: 68,
      happiness: 70,
      affinity: 50,
      personality: "steady",
      traits: [],
      environment: "bedroom",
      accessories: [],
      cosmetics: { owned: ["none"], equipped: [] },
      roomDecor: [],
      streak: 0,
      lastActiveDay: "",
      lastTickAt: Date.now(),
      evolutionHistory: [],
      dailyMissions: { day: "", completed: [], claimed: [] },
      stats: { totalFeeds: 0, totalPets: 0, totalPlays: 0, evolutions: 0 },
      giftsReceived: [],
      socialLog: { day: "", count: 0 },
      equippedSkin: "default",
      unlockedSkins: ["default"],
      unlockedEnvs: ["lofi_bedroom"],
      inventory: { furniture: [], posters: [] },
      roomLayout: { placed: [] },
      achievements: [],
      auraScore: 0,
      miniGameStats: {},
      createdAt: new Date().toISOString(),
    };
  }

  function normalizeMignon(raw) {
    const base = defaultMignon();
    if (!raw || typeof raw !== "object") return base;
    const m = { ...base, ...raw };
    m.v = VERSION;
    m.hunger = clamp(Number(m.hunger) || base.hunger, 0, MAX_STAT);
    m.energy = clamp(Number(m.energy) || base.energy, 0, MAX_STAT);
    m.happiness = clamp(Number(m.happiness) || base.happiness, 0, MAX_STAT);
    m.affinity = clamp(Number(m.affinity) || base.affinity, 0, MAX_STAT);
    m.level = clamp(Number(m.level) || 1, 1, 99);
    m.xp = Math.max(0, Number(m.xp) || 0);
    m.stage = clamp(Number(m.stage) || 0, 0, STAGES.length - 1);
    if (!SPECIES[m.species]) m.species = "pulse";
    if (ENG()) ENG().migrateState(m);
    else if (m.environment === "bedroom") m.environment = "lofi_bedroom";
    const envs = getEnvironments();
    if (!envs[m.environment]) m.environment = "lofi_bedroom";
    if (!MOODS[m.mood]) m.mood = "calm";
    if (!PERSONALITIES[m.personality]) m.personality = "steady";
    m.traits = Array.isArray(m.traits) ? m.traits.slice(0, 12) : [];
    m.accessories = Array.isArray(m.accessories) ? m.accessories : [];
    m.evolutionHistory = Array.isArray(m.evolutionHistory) ? m.evolutionHistory.slice(-20) : [];
    m.dailyMissions =
      m.dailyMissions && typeof m.dailyMissions === "object"
        ? { day: m.dailyMissions.day || "", completed: m.dailyMissions.completed || [], claimed: m.dailyMissions.claimed || [] }
        : { day: "", completed: [], claimed: [] };
    m.stats = { ...base.stats, ...(m.stats || {}) };
    m.cosmetics =
      m.cosmetics && typeof m.cosmetics === "object"
        ? { owned: m.cosmetics.owned || ["none"], equipped: m.cosmetics.equipped || [] }
        : { owned: ["none"], equipped: [] };
    if (!m.socialLog || typeof m.socialLog !== "object") m.socialLog = { day: "", count: 0 };
    return m;
  }

  function getMignon(uid) {
    if (!d()) return defaultMignon();
    if (uid === "me" || !uid) {
      d().ensureMignon();
      return d().state.mignon;
    }
    const peer = d().getPeerMignon && d().getPeerMignon(uid);
    if (peer) return normalizeMignon(peer);
    return defaultMignon();
  }

  function saveMignon(m) {
    if (!d()) return;
    d().state.mignon = normalizeMignon(m);
    d().persist();
    if (typeof d().scheduleCloudMignon === "function") d().scheduleCloudMignon();
  }

  function parseFromSettings(settings) {
    if (!settings || typeof settings !== "object") return null;
    const raw = settings.mignon || settings.Mignon;
    return raw ? normalizeMignon(raw) : null;
  }

  function toSettingsPayload(m) {
    return { mignon: normalizeMignon(m) };
  }

  function analyzeMusicProfile() {
    if (!d()) return { genres: {}, avgRating: 0, reviewRate: 0, listenCount: 0, melancholy: 0 };
    const listens = (d().state.listenings || []).filter((l) => l.userId === "me");
    const genres = {};
    let ratingSum = 0;
    let ratingN = 0;
    let reviews = 0;
    listens.forEach((l) => {
      const al = d().albumById(l.albumId);
      const g = (al && al.genre) || "Autre";
      genres[g] = (genres[g] || 0) + 1;
      if (l.rating) {
        ratingSum += l.rating;
        ratingN++;
      }
      if (l.review && l.review.trim()) reviews++;
    });
    const melancholyGenres = ["Ambient", "Shoegaze", "Indie", "Folk", "Classical"];
    let mel = 0;
    melancholyGenres.forEach((g) => {
      mel += genres[g] || 0;
    });
    return {
      genres,
      avgRating: ratingN ? ratingSum / ratingN : 0,
      reviewRate: listens.length ? reviews / listens.length : 0,
      listenCount: listens.length,
      melancholy: listens.length ? mel / listens.length : 0,
    };
  }

  function dominantSpecies(profile) {
    const genres = profile.genres || {};
    const sorted = Object.entries(genres).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return "pulse";
    const top = sorted[0][0];
    return GENRE_MAP[top] || "pulse";
  }

  function inferPersonality(profile, mignon) {
    if (profile.reviewRate > 0.45) return "poet";
    if (Object.keys(profile.genres || {}).length >= 6) return "explorer";
    if ((mignon.stats && mignon.stats.totalFeeds) > 40) return "curator";
    if (profile.melancholy > 0.35) return "nightowl";
    if (mignon.streak >= 5) return "steady";
    return "socialite";
  }

  function pickEnvironment(profile, mood) {
    if (mood === "sleepy" || mood === "wistful") return "dream_void";
    if (profile.melancholy > 0.4) return "shoegaze_mist";
    const dom = dominantSpecies(profile);
    if (dom === "glitch") return "glitch_rift";
    if (dom === "drift") return "dream_void";
    if (dom === "pulse") return "rap_basement";
    if (dom === "spark") return "citypop_apt";
    if (dom === "vinyl") return "vinyl_lounge";
    return "lofi_bedroom";
  }

  function stageFromXp(xp) {
    let stage = 0;
    for (let i = STAGES.length - 1; i >= 0; i--) {
      if (xp >= STAGES[i].xp) {
        stage = i;
        break;
      }
    }
    return stage;
  }

  function levelFromXp(xp) {
    return clamp(1 + Math.floor(xp / 85), 1, 99);
  }

  function tickDecay(m) {
    const now = Date.now();
    const last = m.lastTickAt || now;
    const hours = (now - last) / 3600000;
    if (hours < 0.25) return m;
    const factor = Math.min(hours / 12, 2);
    m.hunger = clamp(m.hunger - 2 * factor, 8, MAX_STAT);
    m.energy = clamp(m.energy - 1.5 * factor, 10, MAX_STAT);
    if (m.hunger < 35 || m.energy < 30) {
      m.happiness = clamp(m.happiness - 3 * factor, 15, MAX_STAT);
    }
    m.lastTickAt = now;
    return m;
  }

  function computeMood(m, profile) {
    const h = (m.happiness + m.energy + (MAX_STAT - m.hunger)) / 3;
    if (m.anim === "listening") return "listening";
    if (m.anim === "dance" || m.anim === "excited") return "excited";
    if (h >= 75 && m.streak >= 2) return "bliss";
    if (h >= 58) return "happy";
    if (m.energy < 28 || m.hunger < 25) return "sleepy";
    if (profile.melancholy > 0.35) return "wistful";
    if (h < 40) return "wistful";
    return "calm";
  }

  function updateStreak(m) {
    const day = todayKey();
    if (m.lastActiveDay === day) return m;
    const yesterday = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
    if (m.lastActiveDay === yesterday) m.streak = (m.streak || 0) + 1;
    else if (m.lastActiveDay && m.lastActiveDay !== day) m.streak = 1;
    else if (!m.lastActiveDay) m.streak = 1;
    m.lastActiveDay = day;
    return m;
  }

  function activitySnapshot() {
    const day = todayKey();
    const listens = (d().state.listenings || []).filter((l) => l.userId === "me" && String(l.date || "").slice(0, 10) === day);
    const todayReviews = listens.filter((l) => l.review && l.review.trim()).length;
    const todayRated = listens.filter((l) => l.rating).length;
    const genresBefore = {};
    (d().state.listenings || [])
      .filter((l) => l.userId === "me" && String(l.date || "").slice(0, 10) < day)
      .forEach((l) => {
        const al = d().albumById(l.albumId);
        if (al && al.genre) genresBefore[al.genre] = true;
      });
    let newGenreToday = false;
    listens.forEach((l) => {
      const al = d().albumById(l.albumId);
      if (al && al.genre && !genresBefore[al.genre]) newGenreToday = true;
    });
    const m = d().state.mignon;
    const todaySocial = m && m.socialLog && m.socialLog.day === day ? m.socialLog.count || 0 : 0;
    return { todayListens: listens.length, todayReviews, todayRated, newGenreToday, todaySocial };
  }

  function refreshDailyMissions(m) {
    const day = todayKey();
    if (m.dailyMissions.day !== day) {
      m.dailyMissions = { day, completed: [], claimed: [] };
    }
    const snap = activitySnapshot();
    DAILY_MISSIONS.forEach((mission) => {
      if (mission.check(snap) && !m.dailyMissions.completed.includes(mission.id)) {
        m.dailyMissions.completed.push(mission.id);
      }
    });
    return m;
  }

  function addXp(m, amount, reason) {
    const prevStage = m.stage;
    m.xp = (m.xp || 0) + amount;
    m.stage = stageFromXp(m.xp);
    m.level = levelFromXp(m.xp);
    if (m.stage > prevStage) {
      m.evolutionHistory.push({
        at: new Date().toISOString(),
        stage: m.stage,
        species: m.species,
        reason: reason || "evolution",
      });
      m.stats.evolutions = (m.stats.evolutions || 0) + 1;
      m.anim = "excited";
      if (d() && d().toast) d().toast("✦ " + m.name + " évolue — " + STAGES[m.stage].name + " !");
    }
    return m;
  }

  function feedStats(m, payload) {
    const happiness = 8 + (payload.reviewBonus || 0) + (payload.rating ? 4 : 0);
    const energy = 6 + (payload.rating ? 5 : 0);
    const hunger = 12;
    m.happiness = clamp(m.happiness + happiness, 0, MAX_STAT);
    m.energy = clamp(m.energy + energy, 0, MAX_STAT);
    m.hunger = clamp(m.hunger + hunger, 0, MAX_STAT);
    m.affinity = clamp(m.affinity + 3, 0, MAX_STAT);
    m.stats.totalFeeds = (m.stats.totalFeeds || 0) + 1;
    m.anim = payload.thoughtful ? "dance" : "happy";
    return addXp(m, payload.xp || 28, "feed");
  }

  function syncFromActivity() {
    if (!d()) return;
    let m = getMignon("me");
    m = tickDecay(m);
    m = updateStreak(m);
    const profile = analyzeMusicProfile();
    if (profile.listenCount >= 3) {
      const target = dominantSpecies(profile);
      if (m.stage >= 2 && m.species !== target && !m.traits.includes("locked-species")) {
        m.species = target;
      }
    }
    m.personality = inferPersonality(profile, m);
    if (!m.traits.includes("env-lock")) m.environment = pickEnvironment(profile, computeMood(m, profile));
    m.mood = computeMood(m, profile);
    if (m.anim !== "dance" && m.anim !== "excited" && m.anim !== "listening" && m.anim !== "pet") {
      m.anim = m.mood === "sleepy" ? "sleep" : "idle";
    }
    if (m.streak >= 3 && !m.cosmetics.owned.includes("headphones")) m.cosmetics.owned.push("headphones");
    if (m.streak >= 7 && !m.cosmetics.owned.includes("vinyl-hat")) m.cosmetics.owned.push("vinyl-hat");
    if (m.streak >= 3 && !m.cosmetics.equipped.length) m.cosmetics.equipped = ["headphones"];
    m = refreshDailyMissions(m);
    if (ENG()) {
      const vibe = ENG().computeMusicVibe(profile);
      m._musicVibe = vibe;
      const snap = activitySnapshot();
      if (ENG().checkUnlocks(m, profile)) {
        if (d() && d().toast) d().toast("Nouveau déblocage dans ta collection !");
      }
      if (ENG().checkAchievements(m, profile, snap)) {
        if (d() && d().toast) d().toast("Succès débloqué !");
      }
      m.auraScore = ENG().computeAuraScore(m, profile);
    }
    saveMignon(m);
  }

  function onListeningSaved(payload) {
    payload = payload || {};
    let m = getMignon("me");
    m = updateStreak(m);
    const reviewLen = (payload.review || "").trim().length;
    const thoughtful = reviewLen >= 80;
    m = feedStats(m, {
      rating: payload.rating > 0,
      reviewBonus: thoughtful ? 12 : reviewLen > 20 ? 6 : 0,
      thoughtful,
      xp: thoughtful ? 52 : payload.rating ? 32 : 24,
    });
    if (reviewLen > 0 && !m.traits.includes("scribe")) m.traits.push("scribe");
    saveMignon(m);
    syncFromActivity();
    return getMignon("me");
  }

  function onSocialAction() {
    let m = getMignon("me");
    const day = todayKey();
    if (!m.socialLog || m.socialLog.day !== day) m.socialLog = { day, count: 0 };
    m.socialLog.count = (m.socialLog.count || 0) + 1;
    m.happiness = clamp(m.happiness + 5, 0, MAX_STAT);
    m.affinity = clamp(m.affinity + 4, 0, MAX_STAT);
    m.anim = "happy";
    addXp(m, 18, "social");
    saveMignon(m);
    syncFromActivity();
  }

  function onPetInteract() {
    let m = getMignon("me");
    m.stats.totalPets = (m.stats.totalPets || 0) + 1;
    m.happiness = clamp(m.happiness + 6, 0, MAX_STAT);
    m.anim = "pet";
    saveMignon(m);
    setTimeout(() => {
      const cur = getMignon("me");
      if (cur.anim === "pet") {
        cur.anim = "idle";
        saveMignon(cur);
      }
    }, 1200);
  }

  function onPlayInteract() {
    let m = getMignon("me");
    m.stats.totalPlays = (m.stats.totalPlays || 0) + 1;
    m.energy = clamp(m.energy + 8, 0, MAX_STAT);
    m.anim = "dance";
    addXp(m, 15, "play");
    saveMignon(m);
    setTimeout(() => {
      const cur = getMignon("me");
      if (cur.anim === "dance") {
        cur.anim = "idle";
        saveMignon(cur);
        syncFromActivity();
      }
    }, 2400);
  }

  function claimMission(missionId) {
    let m = getMignon("me");
    m = refreshDailyMissions(m);
    if (!m.dailyMissions.completed.includes(missionId)) return false;
    if (m.dailyMissions.claimed.includes(missionId)) return false;
    const mission = DAILY_MISSIONS.find((x) => x.id === missionId);
    if (!mission) return false;
    m.dailyMissions.claimed.push(missionId);
    addXp(m, mission.xp, "mission");
    m.happiness = clamp(m.happiness + 10, 0, MAX_STAT);
    saveMignon(m);
    if (d() && d().toast) d().toast("Mission accomplie — +" + mission.xp + " XP");
    return true;
  }

  function setEnvironment(envId) {
    let m = getMignon("me");
    const envs = getEnvironments();
    if (!envs[envId]) return;
    if (m.unlockedEnvs && !m.unlockedEnvs.includes(envId)) {
      if (d() && d().toast) d().toast("Monde verrouillé — continue à jouer pour le débloquer.");
      return;
    }
    m.environment = envId;
    m.traits = m.traits.filter((t) => t !== "env-lock");
    m.traits.push("env-lock");
    saveMignon(m);
    if (d() && d().toast) d().toast("Monde : " + envs[envId].label);
  }

  function equipSkin(skinId) {
    const eng = ENG();
    if (!eng || !eng.ARCHETYPES[skinId]) return;
    let m = getMignon("me");
    if (!m.unlockedSkins.includes(skinId)) {
      if (d() && d().toast) d().toast("Archétype non débloqué.");
      return;
    }
    m.equippedSkin = skinId;
    m.anim = "excited";
    saveMignon(m);
    if (d() && d().toast) d().toast("Forme : " + eng.ARCHETYPES[skinId].label);
    if (d()) d().render();
  }

  function placeDecor(itemId) {
    let m = getMignon("me");
    if (!m.inventory.furniture.includes(itemId)) return;
    const x = 15 + Math.floor(Math.random() * 55);
    const y = 12 + Math.floor(Math.random() * 25);
    m.roomLayout.placed = m.roomLayout.placed || [];
    if (m.roomLayout.placed.length >= 8) m.roomLayout.placed.shift();
    m.roomLayout.placed.push({ id: itemId, x, y });
    saveMignon(m);
    if (d()) d().render();
  }

  function renameMignon(name) {
    const n = String(name || "").trim().slice(0, 24);
    if (!n) return;
    let m = getMignon("me");
    m.name = n;
    saveMignon(m);
  }

  function creatureMarkup(m, opts) {
    opts = opts || {};
    if (ENG() && ENG().renderCreaturePixel) {
      return ENG().renderCreaturePixel(m, { compact: !!opts.compact, escapeHtml: d().escapeHtml });
    }
    const compact = !!opts.compact;
    const species = SPECIES[m.species] || SPECIES.pulse;
    const mood = MOODS[m.mood] || MOODS.calm;
    const stage = STAGES[m.stage] || STAGES[0];
    const anim = m.anim || "idle";
    const acc = (m.accessories || []).join(" ");
    return `<div class="mignon-creature${compact ? " mignon-creature--compact" : ""}" data-species="${m.species}" data-stage="${m.stage}" data-mood="${m.mood}" data-anim="${anim}" data-acc="${d().escapeHtml(acc)}" role="img" aria-label="${d().escapeHtml(m.name)} — ${d().escapeHtml(species.label)}, ${d().escapeHtml(stage.name)}, humeur ${d().escapeHtml(mood.label)}">
      <div class="mignon-creature__glow" aria-hidden="true"></div>
      <div class="mignon-creature__shadow" aria-hidden="true"></div>
      <div class="mignon-creature__body">
        <span class="mignon-creature__ear mignon-creature__ear--l" aria-hidden="true"></span>
        <span class="mignon-creature__ear mignon-creature__ear--r" aria-hidden="true"></span>
        <span class="mignon-creature__face" aria-hidden="true">
          <span class="mignon-creature__eye mignon-creature__eye--l"></span>
          <span class="mignon-creature__eye mignon-creature__eye--r"></span>
          <span class="mignon-creature__cheek mignon-creature__cheek--l"></span>
          <span class="mignon-creature__cheek mignon-creature__cheek--r"></span>
          <span class="mignon-creature__mouth"></span>
        </span>
        <span class="mignon-creature__core" aria-hidden="true"></span>
        ${m.stage === 0 ? '<span class="mignon-creature__shell" aria-hidden="true"></span>' : ""}
        ${(m.cosmetics.equipped || []).includes("headphones") ? '<span class="mignon-creature__phones" aria-hidden="true"></span>' : ""}
        ${(m.cosmetics.equipped || []).includes("vinyl-hat") ? '<span class="mignon-creature__vinyl-hat" aria-hidden="true"></span>' : ""}
      </div>
      <span class="mignon-creature__note" aria-hidden="true">♪</span>
      ${!compact ? `<p class="mignon-creature__species-tag">${d().escapeHtml(species.label)}</p>` : ""}
    </div>`;
  }

  function statBar(label, value, cls) {
    const v = clamp(Math.round(value), 0, MAX_STAT);
    return `<div class="mignon-stat" data-stat="${cls}">
      <div class="mignon-stat__head"><span>${d().escapeHtml(label)}</span><b>${v}</b></div>
      <div class="mignon-stat__track"><span class="mignon-stat__fill mignon-stat__fill--${cls}" style="width:${v}%"></span></div>
    </div>`;
  }

  function environmentMarkup(m, profile) {
    profile = profile || analyzeMusicProfile();
    const vibe = ENG() ? ENG().computeMusicVibe(profile) : "lofi";
    if (ENG() && ENG().renderPixelRoom) {
      return ENG().renderPixelRoom(m, { escapeHtml: d().escapeHtml, musicVibe: vibe });
    }
    return "";
  }

  function widgetMarkup(uid, opts) {
    opts = opts || {};
    const m = getMignon(uid);
    const isMe = uid === "me" || !uid;
    const profile = isMe ? analyzeMusicProfile() : { listenCount: 0 };
    const species = SPECIES[m.species] || SPECIES.pulse;
    const mood = MOODS[m.mood] || MOODS.calm;
    const xpNext = STAGES[Math.min(m.stage + 1, STAGES.length - 1)];
    const xpCur = STAGES[m.stage];
    const xpPct =
      m.stage >= STAGES.length - 1
        ? 100
        : Math.round(((m.xp - xpCur.xp) / Math.max(1, xpNext.xp - xpCur.xp)) * 100);

    return `<aside class="mignon-widget${opts.rail ? " mignon-widget--rail" : ""}" data-mignon-widget="${isMe ? "me" : d().escapeHtml(uid)}">
      <header class="mignon-widget__head">
        <p class="mignon-widget__kicker">Compagnon musical</p>
        <h3 class="mignon-widget__title">${d().escapeHtml(m.name)}</h3>
        <span class="mignon-widget__badge">${d().escapeHtml(mood.emoji)} ${d().escapeHtml(mood.label)}</span>
      </header>
      <div class="mignon-widget__stage">
        ${environmentMarkup(m, profile)}
        <div class="mignon-widget__creature-wrap" data-mignon-pet-zone>
          ${creatureMarkup(m, { compact: true })}
        </div>
      </div>
      <div class="mignon-widget__meta">
        <span class="mignon-widget__lvl">Niv. ${m.level}</span>
        <span class="mignon-widget__species">${d().escapeHtml(species.label)}</span>
        ${m.streak > 1 ? `<span class="mignon-widget__streak">${m.streak}j streak</span>` : ""}
      </div>
      <div class="mignon-widget__xp" aria-label="Progression"><span style="width:${xpPct}%"></span></div>
      ${isMe ? `<div class="mignon-widget__actions">
        <button type="button" class="btn btn-ghost btn-sm" data-mignon-pet>Caresser</button>
        <button type="button" class="btn btn-primary btn-sm" data-mignon-open>Salon Mignon</button>
      </div>` : `<button type="button" class="btn btn-ghost btn-sm" data-mignon-visit="${d().escapeHtml(uid)}">Visiter</button>`}
    </aside>`;
  }

  function missionsHtml(m) {
    const snap = activitySnapshot();
    return DAILY_MISSIONS.map((mission) => {
      const done = m.dailyMissions.completed.includes(mission.id);
      const claimed = m.dailyMissions.claimed.includes(mission.id);
      const progress = mission.check(snap);
      return `<article class="mignon-mission${done ? " is-done" : ""}${claimed ? " is-claimed" : ""}">
        <div class="mignon-mission__copy">
          <h4>${d().escapeHtml(mission.label)}</h4>
          <p class="feed-note">+${mission.xp} XP</p>
        </div>
        ${claimed ? '<span class="mignon-mission__state">Réclamé</span>' : done ? `<button type="button" class="btn btn-primary btn-sm" data-mignon-claim="${mission.id}">Réclamer</button>` : `<span class="mignon-mission__state">${progress ? "Prêt" : "—"}</span>`}
      </article>`;
    }).join("");
  }

  function renderPage() {
    const m = getMignon("me");
    syncFromActivity();
    const profile = analyzeMusicProfile();
    const species = SPECIES[m.species] || SPECIES.pulse;
    const mood = MOODS[m.mood] || MOODS.calm;
    const pers = PERSONALITIES[m.personality] || m.personality;
    const vibe = ENG() ? ENG().computeMusicVibe(profile) : "lofi";
    const arch = ENG() ? ENG().ARCHETYPES[m.equippedSkin] || ENG().ARCHETYPES.default : null;
    const envOpts = Object.values(getEnvironments())
      .map((e) => {
        const locked = m.unlockedEnvs && !m.unlockedEnvs.includes(e.id);
        return `<button type="button" class="mignon-world-card${m.environment === e.id ? " is-active" : ""}${locked ? " is-locked" : ""}" data-mignon-env="${e.id}" ${locked ? "disabled" : ""}>
          <span class="mignon-world-card__icon">${e.icon}</span>
          <span class="mignon-world-card__label">${d().escapeHtml(e.label)}</span>
          ${locked ? `<span class="mignon-world-card__lock">${e.unlockXp} XP</span>` : ""}
        </button>`;
      })
      .join("");
    const skinCards = ENG()
      ? Object.values(ENG().ARCHETYPES)
          .map((a) => {
            const owned = m.unlockedSkins.includes(a.id);
            const active = m.equippedSkin === a.id;
            return `<article class="mignon-skin-card${active ? " is-active" : ""}${!owned ? " is-locked" : ""}" data-mignon-skin="${a.id}">
              <div class="mignon-skin-card__preview px-creature px-creature--skin-preview" data-skin="${a.id}"></div>
              <h4>${d().escapeHtml(a.label)}</h4>
              <p class="feed-note">${d().escapeHtml(a.desc)}</p>
              <span class="mignon-skin-card__rarity mignon-skin-card__rarity--${a.rarity}">${d().escapeHtml(a.rarity)}</span>
              ${owned ? `<button type="button" class="btn btn-ghost btn-sm" data-mignon-equip-skin="${a.id}">${active ? "Équipé" : "Équiper"}</button>` : "<span class=feed-note>Verrouillé</span>"}
            </article>`;
          })
          .join("")
      : "";
    const furnitureCards = ENG()
      ? Object.values(ENG().FURNITURE)
          .map((f) => {
            const owned = m.inventory.furniture.includes(f.id);
            return `<button type="button" class="mignon-decor-chip${owned ? "" : " is-locked"}" data-mignon-place="${f.id}" ${owned ? "" : "disabled"}>${d().escapeHtml(f.label)}</button>`;
          })
          .join("")
      : "";

    const history =
      m.evolutionHistory.length === 0
        ? '<p class="feed-note">Les évolutions apparaîtront ici.</p>'
        : `<ul class="mignon-history">${m.evolutionHistory
            .slice()
            .reverse()
            .map(
              (h) =>
                `<li><time>${d().escapeHtml((h.at || "").slice(0, 10))}</time> — ${d().escapeHtml(STAGES[h.stage]?.name || "?")} <span class="feed-note">${d().escapeHtml(SPECIES[h.species]?.label || "")}</span></li>`
            )
            .join("")}</ul>`;

    return `<div class="mg-page" data-mignon-page data-music-vibe="${d().escapeHtml(vibe)}">
      <header class="mg-hud">
        <div class="mg-hud__left">
          <p class="mg-hud__kicker">Univers Mignon · simulateur musical</p>
          <h1 class="mg-hud__title">${d().escapeHtml(m.name)}</h1>
          <div class="mg-hud__stats">
            <span class="mg-pill">Niv. ${m.level}</span>
            <span class="mg-pill">${d().escapeHtml(STAGES[m.stage].name)}</span>
            <span class="mg-pill">${d().escapeHtml(mood.emoji)} ${d().escapeHtml(mood.label)}</span>
            <span class="mg-pill mg-pill--aura">Aura ${m.auraScore || 0}</span>
            ${m.streak > 1 ? `<span class="mg-pill mg-pill--gold">${m.streak}j</span>` : ""}
          </div>
        </div>
        <div class="mg-hud__right">
          <label class="visually-hidden" for="mignon-name-input">Nom</label>
          <input type="text" id="mignon-name-input" class="mg-hud__name" maxlength="24" value="${d().escapeHtml(m.name)}" />
          <button type="button" class="btn btn-ghost btn-sm" id="mignon-rename-save">OK</button>
        </div>
      </header>
      <nav class="mg-tabs" role="tablist">
        <button type="button" class="mg-tab is-active" data-mg-tab="sanctuary" role="tab">Sanctuaire</button>
        <button type="button" class="mg-tab" data-mg-tab="collection" role="tab">Collection</button>
        <button type="button" class="mg-tab" data-mg-tab="arcade" role="tab">Arcade</button>
        <button type="button" class="mg-tab" data-mg-tab="decor" role="tab">Déco</button>
      </nav>
      <div class="mg-panels">
        <section class="mg-panel mg-panel--sanctuary is-active" data-mg-panel="sanctuary">
          <div class="mg-stage" data-mignon-pet-zone>
            ${environmentMarkup(m, profile)}
            <div class="mg-stage__creature">${creatureMarkup(m)}</div>
            <div class="mg-stage__hud">
              ${statBar("Bonheur", m.happiness, "happy")}
              ${statBar("Énergie", m.energy, "energy")}
              ${statBar("Faim", m.hunger, "hunger")}
              ${statBar("Affinité", m.affinity, "affinity")}
            </div>
            <div class="mg-stage__actions">
              <button type="button" class="mg-action" data-mignon-pet><span>✦</span> Caresser</button>
              <button type="button" class="mg-action" data-mignon-play><span>♫</span> Danser</button>
              <button type="button" class="mg-action" data-mignon-feed><span>◎</span> Nourrir</button>
              <button type="button" class="mg-action" data-mignon-listen><span>▶</span> Écouter</button>
              <button type="button" class="mg-action mg-action--accent" data-mignon-stretch><span>～</span> Étirer</button>
            </div>
          </div>
          <p class="feed-note mg-vibe-note">Vibe : <strong>${d().escapeHtml(vibe)}</strong>${arch ? ` · ${d().escapeHtml(arch.label)}` : ""}</p>
        </section>
        <section class="mg-panel" data-mg-panel="collection" hidden>
          <h2 class="mg-section-title">Mondes</h2>
          <div class="mignon-world-grid">${envOpts}</div>
          <h2 class="mg-section-title">Archétypes inspirés</h2>
          <p class="feed-note">Esthétiques musicales originales — sans likeness d'artiste.</p>
          <div class="mignon-skin-grid">${skinCards}</div>
          <h2 class="mg-section-title">Évolutions</h2>
          ${history}
        </section>
        <section class="mg-panel" data-mg-panel="arcade" hidden>
          <div class="mg-arcade-grid">
            <article class="mg-arcade-card">
              <h3>Rythme</h3>
              <div class="mignon-rhythm" id="mignon-rhythm">
                <div class="mignon-rhythm__lane"><span class="mignon-rhythm__beat" id="mignon-rhythm-beat"></span></div>
                <button type="button" class="btn btn-primary btn-sm" id="mignon-rhythm-tap">Tap !</button>
                <p class="mignon-rhythm__score" id="mignon-rhythm-score">0 / 8</p>
              </div>
            </article>
            <article class="mg-arcade-card">
              <h3>Mémoire</h3>
              <div class="mg-memory" id="mignon-memory"></div>
              <button type="button" class="btn btn-ghost btn-sm" id="mignon-memory-start">Jouer</button>
            </article>
            <article class="mg-arcade-card">
              <h3>Crate digging</h3>
              <button type="button" class="btn btn-primary btn-sm" id="mignon-crate-play">Chercher</button>
              <p class="feed-note" id="mignon-crate-result"></p>
            </article>
            <article class="mg-arcade-card"><h3>Missions</h3><div class="mignon-missions">${missionsHtml(m)}</div></article>
          </div>
        </section>
        <section class="mg-panel" data-mg-panel="decor" hidden>
          <h2 class="mg-section-title">Déco</h2>
          <div class="mignon-decor-bar">${furnitureCards}</div>
          <button type="button" class="btn btn-ghost btn-sm" data-mignon-clear-decor>Vider</button>
        </section>
      </div>
      <footer class="mg-footer">
        <button type="button" class="btn btn-primary" data-nav-view="carnet">Logger une écoute</button>
        <button type="button" class="btn btn-ghost" data-nav-view="social">Cercle</button>
      </footer>
    </div>`;
  }

  function profileCardMarkup(uid, isMe) {
    const m = getMignon(uid);
    const species = SPECIES[m.species] || SPECIES.pulse;
    const mood = MOODS[m.mood] || MOODS.calm;
    return `<section class="profile-block profile-block--mignon" aria-labelledby="profile-sec-mignon">
      <div class="profile-mignon-head">
        <h3 class="profile-section-title" id="profile-sec-mignon">Mignon</h3>
        ${isMe ? '<button type="button" class="btn btn-ghost btn-sm" data-mignon-open>Salon complet</button>' : ""}
      </div>
      <div class="profile-mignon-card">
        <div class="profile-mignon-preview" data-mignon-pet-zone>
          ${environmentMarkup(m, analyzeMusicProfile())}
          ${creatureMarkup(m, { compact: true })}
        </div>
        <div class="profile-mignon-meta">
          <h4 class="profile-mignon-name">${d().escapeHtml(m.name)}</h4>
          <p class="feed-note">${d().escapeHtml(species.label)} · ${d().escapeHtml(STAGES[m.stage].name)} · ${d().escapeHtml(mood.label)}</p>
          <p class="feed-note">Niv. ${m.level}${m.auraScore ? ` · Aura ${m.auraScore}` : ""}${m.streak > 1 ? ` · ${m.streak}j` : ""}</p>
          ${isMe ? `<button type="button" class="btn btn-primary btn-sm" data-mignon-open>Interagir</button>` : `<button type="button" class="btn btn-ghost btn-sm" data-mignon-visit="${d().escapeHtml(uid)}">Voir le compagnon</button>`}
        </div>
      </div>
    </section>`;
  }

  let animFrame = null;
  let rhythmScore = 0;
  let rhythmBeat = 0;

  function startIdleLoop() {
    if (animFrame) return;
    function loop() {
      document.querySelectorAll(".px-creature[data-anim='idle'], .mignon-creature[data-anim='idle']").forEach((el) => {
        el.classList.toggle("mignon-creature--blink", Math.random() < 0.012);
        el.classList.toggle("px-creature--blink", Math.random() < 0.012);
      });
      animFrame = requestAnimationFrame(loop);
    }
    animFrame = requestAnimationFrame(loop);
  }

  function stopIdleLoop() {
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
  }

  function wireRhythmGame() {
    const tap = document.getElementById("mignon-rhythm-tap");
    const scoreEl = document.getElementById("mignon-rhythm-score");
    const beatEl = document.getElementById("mignon-rhythm-beat");
    if (!tap || !scoreEl) return;
    rhythmScore = 0;
    rhythmBeat = 0;
    let beatTimer = setInterval(() => {
      rhythmBeat = (rhythmBeat + 1) % 4;
      if (beatEl) beatEl.classList.toggle("is-on", rhythmBeat === 0);
    }, 480);
    tap.onclick = () => {
      const onBeat = rhythmBeat === 0 || rhythmBeat === 2;
      if (onBeat) rhythmScore++;
      scoreEl.textContent = rhythmScore + " / 8";
      if (rhythmScore >= 8) {
        clearInterval(beatTimer);
        let m = getMignon("me");
        m.energy = clamp(m.energy + 18, 0, MAX_STAT);
        addXp(m, 40, "rhythm");
        saveMignon(m);
        if (d() && d().toast) d().toast("Rythme parfait — énergie boostée !");
        scoreEl.textContent = "Complet !";
      }
    };
    tap._mignonCleanup = () => clearInterval(beatTimer);
  }

  function bindEvents(root) {
    root = root || document;
    root.querySelectorAll("[data-mignon-pet], [data-mignon-pet-zone]").forEach((el) => {
      if (el._mignonPetWired) return;
      el._mignonPetWired = true;
      const handler = (e) => {
        if (e.type === "click" && el.hasAttribute("data-mignon-pet-zone") && e.target.closest("[data-mignon-pet]")) return;
        if (e.type === "click" && el.hasAttribute("data-mignon-pet-zone") && !e.target.closest(".mignon-creature")) return;
        onPetInteract();
        const creature = (el.querySelector && el.querySelector(".mignon-creature")) || el.closest(".mignon-creature");
        if (creature) {
          creature.setAttribute("data-anim", "pet");
          setTimeout(() => creature.setAttribute("data-anim", "idle"), 900);
        }
        if (d() && d().renderMignonZones) d().renderMignonZones();
      };
      if (el.hasAttribute("data-mignon-pet")) el.addEventListener("click", handler);
      else {
        el.addEventListener("click", handler);
        el.addEventListener(
          "pointerenter",
          () => {
            const c = el.querySelector(".mignon-creature");
            if (c && c.getAttribute("data-anim") === "idle") c.setAttribute("data-anim", "hover");
          },
          { passive: true }
        );
        el.addEventListener(
          "pointerleave",
          () => {
            const c = el.querySelector(".mignon-creature");
            if (c && c.getAttribute("data-anim") === "hover") c.setAttribute("data-anim", "idle");
          },
          { passive: true }
        );
      }
    });

    root.querySelectorAll("[data-mignon-open]").forEach((btn) => {
      btn.addEventListener("click", () => d() && d().navigate("mignon"));
    });
    root.querySelectorAll("[data-mignon-visit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.getAttribute("data-mignon-visit");
        if (uid && d()) d().navigate("profile", { userId: uid });
      });
    });
    root.querySelectorAll("[data-mignon-play]").forEach((btn) => {
      btn.addEventListener("click", () => {
        onPlayInteract();
        const c = root.querySelector(".mignon-creature");
        if (c) c.setAttribute("data-anim", "dance");
      });
    });
    root.querySelectorAll("[data-mignon-feed]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (d() && d().openLogListen) {
          d().openLogListen();
        } else if (d()) d().navigate("carnet", { hubTab: "journal" });
      });
    });
    root.querySelectorAll("[data-mignon-listen]").forEach((btn) => {
      btn.addEventListener("click", () => {
        let m = getMignon("me");
        m.anim = "listening";
        saveMignon(m);
        const c = root.querySelector(".mignon-creature");
        if (c) c.setAttribute("data-anim", "listening");
        if (d() && d().toast) d().toast("Mode écoute — lance un extrait depuis ton carnet.");
      });
    });
    root.querySelectorAll("[data-mignon-env]").forEach((btn) => {
      btn.addEventListener("click", () => setEnvironment(btn.getAttribute("data-mignon-env")));
    });
    root.querySelectorAll("[data-mignon-claim]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (claimMission(btn.getAttribute("data-mignon-claim")) && d()) d().render();
      });
    });

    const renameBtn = root.querySelector("#mignon-rename-save");
    const renameInput = root.querySelector("#mignon-name-input");
    if (renameBtn && renameInput) {
      renameBtn.addEventListener("click", () => {
        renameMignon(renameInput.value);
        if (d()) d().render();
      });
    }

    root.querySelectorAll("[data-mg-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.getAttribute("data-mg-tab");
        root.querySelectorAll("[data-mg-tab]").forEach((t) => {
          const on = t.getAttribute("data-mg-tab") === id;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        root.querySelectorAll("[data-mg-panel]").forEach((p) => {
          const on = p.getAttribute("data-mg-panel") === id;
          p.classList.toggle("is-active", on);
          p.hidden = !on;
        });
      });
    });
    root.querySelectorAll("[data-mignon-equip-skin]").forEach((btn) => {
      btn.addEventListener("click", () => equipSkin(btn.getAttribute("data-mignon-equip-skin")));
    });
    root.querySelectorAll("[data-mignon-place]").forEach((btn) => {
      btn.addEventListener("click", () => placeDecor(btn.getAttribute("data-mignon-place")));
    });
    const clearDecor = root.querySelector("[data-mignon-clear-decor]");
    if (clearDecor) {
      clearDecor.addEventListener("click", () => {
        const m = getMignon("me");
        m.roomLayout.placed = [];
        saveMignon(m);
        if (d()) d().render();
      });
    }
    const stretch = root.querySelector("[data-mignon-stretch]");
    if (stretch) {
      stretch.addEventListener("click", () => {
        let m = getMignon("me");
        m.anim = "stretch";
        saveMignon(m);
        const c = root.querySelector(".px-creature");
        if (c) c.setAttribute("data-anim", "stretch");
        setTimeout(() => {
          m = getMignon("me");
          m.anim = "idle";
          saveMignon(m);
          if (c) c.setAttribute("data-anim", "idle");
        }, 2000);
      });
    }
    const memStart = root.querySelector("#mignon-memory-start");
    if (memStart) memStart.addEventListener("click", () => wireMemoryGame(root));
    const crateBtn = root.querySelector("#mignon-crate-play");
    if (crateBtn) {
      crateBtn.addEventListener("click", () => {
        const res = root.querySelector("#mignon-crate-result");
        const found = Math.random() < 0.35;
        if (res) res.textContent = found ? "Vinyle rare trouvé ! +XP" : "Que des compilations… réessaie.";
        if (found) {
          let m = getMignon("me");
          addXp(m, 25, "crate");
          saveMignon(m);
        }
      });
    }
    if (root.querySelector("[data-mignon-page]")) {
      wireRhythmGame();
      startIdleLoop();
    }
  }

  function wireMemoryGame(root) {
    const el = root.querySelector("#mignon-memory");
    if (!el) return;
    const symbols = ["♪", "◎", "✦", "♥", "▣", "◈"];
    const deck = symbols.concat(symbols).sort(() => Math.random() - 0.5);
    let flipped = [];
    let matched = 0;
    el.innerHTML = deck
      .map(
        (s, i) =>
          `<button type="button" class="mg-memory-card" data-mem-idx="${i}" data-mem-sym="${s}">?</button>`
      )
      .join("");
    el.querySelectorAll(".mg-memory-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("is-flipped") || btn.classList.contains("is-match")) return;
        if (flipped.length >= 2) return;
        btn.classList.add("is-flipped");
        btn.textContent = btn.getAttribute("data-mem-sym");
        flipped.push(btn);
        if (flipped.length === 2) {
          const [a, b] = flipped;
          if (a.getAttribute("data-mem-sym") === b.getAttribute("data-mem-sym")) {
            a.classList.add("is-match");
            b.classList.add("is-match");
            matched += 2;
            flipped = [];
            if (matched >= deck.length) {
              let m = getMignon("me");
              addXp(m, 35, "memory");
              saveMignon(m);
              if (d() && d().toast) d().toast("Mémoire parfaite !");
            }
          } else {
            setTimeout(() => {
              flipped.forEach((x) => {
                x.classList.remove("is-flipped");
                x.textContent = "?";
              });
              flipped = [];
            }, 700);
          }
        }
      });
    });
  }

  function celebrationToast(m) {
    if (!d() || !d().toast) return;
    const mood = MOODS[m.mood] || MOODS.happy;
    d().toast(m.name + " " + mood.emoji + " — merci pour cette écoute !");
  }

  function install(injected) {
    deps = injected;
  }

  function applySettings(settings) {
    const parsed = parseFromSettings(settings);
    if (!parsed || !d()) return;
    d().state.mignon = parsed;
    d().persistLocalOnly && d().persistLocalOnly();
  }

  window.SLMignon = {
    install,
    defaultMignon,
    normalizeMignon,
    getMignon,
    parseFromSettings,
    toSettingsPayload,
    syncFromActivity,
    onListeningSaved,
    onSocialAction,
    widgetMarkup,
    renderPage,
    profileCardMarkup,
    bindEvents,
    celebrationToast,
    startIdleLoop,
    stopIdleLoop,
    SPECIES,
    STAGES,
    equipSkin,
    placeDecor,
    getEnvironments,
  };
})();
