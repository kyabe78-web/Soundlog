/* Soundlog — Mignon Automatic Music Radio (Winamp-style) */
(function () {
  "use strict";

  const STATIONS = {
    lofi: { id: "lofi", label: "CHILL FM", tags: ["Lo-fi", "Jazz", "Soul", "R&B"] },
    rap: { id: "rap", label: "UNDERGROUND FM", tags: ["Rap", "Hip-Hop", "Metal", "Punk"] },
    techno: { id: "techno", label: "NEON FM", tags: ["Electronic", "Experimental"] },
    ambient: { id: "ambient", label: "DREAM FM", tags: ["Ambient", "Classical", "Shoegaze"] },
    indie: { id: "indie", label: "BEDROOM FM", tags: ["Indie", "Folk", "Rock", "Pop"] },
    experimental: { id: "experimental", label: "LAB FM", tags: ["Experimental", "Electronic", "Avant-garde"] },
    jazz: { id: "jazz", label: "MIDNIGHT FM", tags: ["Jazz", "Soul", "Classical"] },
    default: { id: "default", label: "SOUNDLOG FM", tags: [] },
  };

  const RADIO_MODES = [
    { id: "auto", label: "Radio Auto", desc: "Ta vibe d'écoute" },
    { id: "mood", label: "Mood Radio", desc: "Selon l'humeur du Mignon" },
    { id: "night", label: "Night Radio", desc: "Ambiance nocturne" },
    { id: "lofi", label: "Lo-fi Radio", desc: "Chill constant" },
    { id: "experimental", label: "Lab Radio", desc: "Sons rares" },
  ];

  const MOOD_GENRES = {
    bliss: ["Pop", "Indie", "Soul"],
    happy: ["Pop", "Funk", "Disco"],
    calm: ["Jazz", "Ambient", "Lo-fi"],
    sleepy: ["Ambient", "Classical", "Shoegaze"],
    wistful: ["Indie", "Shoegaze", "Folk"],
    excited: ["Electronic", "Rap", "Rock"],
    listening: [],
  };

  let deps = null;
  let queue = [];
  let queueIdx = 0;
  let progressTimer = null;
  let advanceTimer = null;
  let booted = false;
  let onUiTick = null;
  let staticCtx = null;
  let endedHooked = false;
  let playHistory = [];
  let radioVolume = 0.72;
  let radioMuted = false;
  let shuffleOn = true;
  let repeatMode = "off"; // off | one | all
  let delegationWired = false;

  function d() {
    return deps;
  }

  function getMignon() {
    return d() && d().getMignon ? d().getMignon("me") : null;
  }

  function getRadioPrefs(m) {
    m = m || getMignon() || {};
    return {
      mode: RADIO_MODES.some((x) => x.id === m.radioMode) ? m.radioMode : "auto",
      shuffle: m.radioShuffle !== false,
      repeat: ["off", "one", "all"].includes(m.radioRepeat) ? m.radioRepeat : "off",
      muted: !!m.radioMuted,
    };
  }

  function saveMignonRadio(patch) {
    const m = getMignon();
    if (!m || !d().saveMignon) return;
    Object.assign(m, patch);
    d().saveMignon(m, { cloud: false });
  }

  function resolveVibe(profile, m) {
    const prefs = getRadioPrefs(m);
    if (prefs.mode === "lofi") return "lofi";
    if (prefs.mode === "experimental") return "experimental";
    if (prefs.mode === "night") return "ambient";
    if (prefs.mode === "mood") {
      const map = {
        bliss: "indie",
        happy: "lofi",
        calm: "ambient",
        sleepy: "ambient",
        wistful: "ambient",
        excited: "rap",
        listening: d().computeMusicVibe ? d().computeMusicVibe(profile) : "lofi",
      };
      return map[m.mood] || "lofi";
    }
    return d().computeMusicVibe ? d().computeMusicVibe(profile) : "lofi";
  }

  function pickStation(profile, vibe) {
    const v = vibe || "lofi";
    if (STATIONS[v]) return STATIONS[v];
    return STATIONS.default;
  }

  function scoreListening(l, al, profile, station, m) {
    const g = (al && al.genre) || "Autre";
    let score = 1 + Math.random() * 0.15;
    score += (profile.genres[g] || 0) * 2.5;
    if (station.tags.includes(g)) score += 4;
    if (l.rating) score += Number(l.rating) * 0.8;
    if (l.review && String(l.review).trim()) score += 2.5;
    const t = new Date(l.date || l.createdAt || 0).getTime();
    if (t) {
      const days = (Date.now() - t) / 86400000;
      score += Math.max(0, 14 - days);
    }
    const prefs = getRadioPrefs(m);
    if (prefs.mode === "mood" && MOOD_GENRES[m.mood] && MOOD_GENRES[m.mood].includes(g)) score += 5;
    if (prefs.mode === "night") {
      const hour = new Date().getHours();
      if (hour >= 20 || hour < 7) {
        if (["Jazz", "Ambient", "Soul", "Classical", "Shoegaze"].includes(g)) score += 4;
      }
    }
    if (prefs.mode === "experimental" && ["Experimental", "Electronic", "Avant-garde"].includes(g)) score += 6;
    return score;
  }

  function buildQueue(profile, vibe) {
    if (!d()) return [];
    const m = getMignon();
    const listens = (d().state.listenings || []).filter((x) => x.userId === "me");
    const station = pickStation(profile, vibe);
    const byAlbum = new Map();
    listens.forEach((l) => {
      if (!l.albumId) return;
      const al = d().albumById(l.albumId);
      const score = scoreListening(l, al, profile, station, m);
      const prev = byAlbum.get(l.albumId);
      if (!prev || score > prev.score) byAlbum.set(l.albumId, { albumId: l.albumId, score, al });
    });
    let list = Array.from(byAlbum.values()).sort((a, b) => b.score - a.score);
    let top = list.slice(0, 48);
    if (top.length > 3) {
      const recent = new Set(playHistory.slice(-4));
      top = top.filter((x) => !recent.has(x.albumId)).concat(top.filter((x) => recent.has(x.albumId)));
    }
    if (!top.length) top = list.slice(0, 48);
    if (getRadioPrefs(m).shuffle) {
      for (let i = top.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [top[i], top[j]] = [top[j], top[i]];
      }
    }
    return top.map((x) => x.albumId);
  }

  function playStaticBurst(ms) {
    if (window.SLMignonSfx) {
      try {
        window.SLMignonSfx.play("radio_tune");
      } catch (_) {}
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!staticCtx || staticCtx.state === "closed") staticCtx = new Ctx();
    const ctx = staticCtx;
    const len = Math.floor(ctx.sampleRate * (ms / 1000));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = radioMuted ? 0 : 0.04;
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
  }

  function hookAudioEnded() {
    if (endedHooked) return;
    if (window.SLMignonAudio && window.SLMignonAudio.onEnded) {
      window.SLMignonAudio.onEnded(() => {
        if (getMignon() && getMignon().radioOn) scheduleNext(500);
      });
      endedHooked = true;
      return;
    }
    if (!d() || !d().getPreviewAudio) return;
    const audio = d().getPreviewAudio();
    if (!audio) return;
    audio.addEventListener("ended", () => {
      if (getMignon() && getMignon().radioOn) scheduleNext(600);
    });
    endedHooked = true;
  }

  function getAudioProgress() {
    if (window.SLMignonAudio && window.SLMignonAudio.isActive && window.SLMignonAudio.isActive()) {
      return window.SLMignonAudio.getProgress();
    }
    return getPreviewProgress();
  }

  async function playCurrent() {
    if (!d() || !queue.length) return;
    const id = queue[queueIdx % queue.length];
    const al = d().albumById(id);
    if (!al) {
      queueIdx++;
      return playCurrent();
    }
    document.querySelector("[data-mignon-page]")?.setAttribute("data-radio-playing", "true");
    setCreatureDance(true);
    playHistory.push(id);
    if (playHistory.length > 16) playHistory.shift();

    let ok = false;
    if (window.SLMignonAudio && window.SLMignonAudio.play) {
      ok = await window.SLMignonAudio.play(id);
    } else if (d().playAlbumPreview) {
      await d().playAlbumPreview(id);
      ok = true;
    }
    if (!ok) {
      queueIdx = (queueIdx + 1) % Math.max(1, queue.length);
      return scheduleNext(200);
    }

    setAudioVolume();
    syncViz();
    patchRadioUi();
  }

  function syncViz() {
    if (!window.SLMignonViz) return;
    const html5 = window.SLMignonAudio && window.SLMignonAudio.getHtml5 && window.SLMignonAudio.getHtml5();
    const legacy = d() && d().getPreviewAudio && d().getPreviewAudio();
    window.SLMignonViz.start(html5 || legacy || null);
  }

  function scheduleNext(delayMs) {
    clearTimeout(advanceTimer);
    advanceTimer = setTimeout(() => {
      if (!getMignon() || !getMignon().radioOn) return;
      const page = document.querySelector("[data-mignon-page]");
      if (page) {
        page.classList.add("mg-radio-crossfade");
        setTimeout(() => page.classList.remove("mg-radio-crossfade"), 400);
      }
      const prefs = getRadioPrefs();
      if (prefs.repeat === "one") {
        playStaticBurst(80);
        setTimeout(() => playCurrent(), 120);
        return;
      }
      queueIdx = (queueIdx + 1) % Math.max(1, queue.length);
      if (queueIdx === 0 && prefs.repeat !== "all") {
        const profile = d().analyzeMusicProfile ? d().analyzeMusicProfile() : { genres: {} };
        const vibe = resolveVibe(profile, getMignon());
        queue = buildQueue(profile, vibe);
      }
      playStaticBurst(90);
      setTimeout(() => playCurrent(), 150);
    }, delayMs || 350);
  }

  function applyAmbiance(vibe) {
    const page = document.querySelector("[data-mignon-page]");
    if (!page) return;
    page.setAttribute("data-ambiance", vibe || "lofi");
    const room = page.querySelector(".px-room");
    if (room) room.setAttribute("data-ambiance", vibe || "lofi");
    const hour = new Date().getHours();
    const night = hour >= 19 || hour < 7;
    page.setAttribute("data-radio-time", night ? "night" : "day");
  }

  function setCreatureDance(on) {
    document.querySelectorAll("[data-mignon-page] .px-radiobot, [data-mignon-page] .px-mignon-buddy").forEach((el) => {
      const vibe = document.querySelector("[data-mignon-page]")?.getAttribute("data-music-vibe") || "lofi";
      if (on) {
        el.setAttribute("data-anim", "dance");
        el.setAttribute("data-dance-vibe", vibe);
        el.classList.add("is-radio-live");
      } else {
        const m = getMignon();
        const mood = (m && m.mood) || "calm";
        const idleMap = { sleepy: "sleep", excited: "dance", bliss: "dance", listening: "listening", wistful: "sad" };
        el.setAttribute("data-anim", idleMap[mood] || "idle");
        el.removeAttribute("data-dance-vibe");
        el.classList.remove("is-radio-live");
      }
    });
    const page = document.querySelector("[data-mignon-page]");
    if (page) page.classList.toggle("is-music-live", !!on);
  }

  function setAudioVolume() {
    if (window.SLMignonAudio && window.SLMignonAudio.isActive && window.SLMignonAudio.isActive()) {
      window.SLMignonAudio.setVolume(radioVolume);
      window.SLMignonAudio.setMuted(radioMuted);
      return;
    }
    const audio = d() && d().getPreviewAudio && d().getPreviewAudio();
    if (audio) audio.volume = radioMuted ? 0 : radioVolume;
  }

  function skipTrack(dir) {
    if (!queue.length) return;
    if (dir < 0) queueIdx = (queueIdx - 1 + queue.length) % queue.length;
    else queueIdx = (queueIdx + 1) % queue.length;
    if (window.SLMignonSfx) window.SLMignonSfx.play("skip");
    playStaticBurst(80);
    playCurrent();
  }

  function togglePause() {
    const m = getMignon();
    if (!m) return;
    const prog = getAudioProgress();
    if (!prog) {
      if (m.radioOn) boot(true);
      return;
    }
    if (prog.paused) {
      if (window.SLMignonAudio && window.SLMignonAudio.isActive()) window.SLMignonAudio.resume();
      else {
        const audio = d().getPreviewAudio && d().getPreviewAudio();
        if (audio) audio.play().catch(() => {});
      }
      setCreatureDance(true);
      if (window.SLMignonSfx) window.SLMignonSfx.play("ui");
    } else {
      if (window.SLMignonAudio && window.SLMignonAudio.isActive()) window.SLMignonAudio.pause();
      else {
        const audio = d().getPreviewAudio && d().getPreviewAudio();
        if (audio) audio.pause();
      }
      setCreatureDance(false);
      if (window.SLMignonSfx) window.SLMignonSfx.play("pause");
    }
    patchRadioUi();
  }

  function toggleMute() {
    radioMuted = !radioMuted;
    saveMignonRadio({ radioMuted });
    setAudioVolume();
    patchRadioUi();
    if (window.SLMignonSfx) window.SLMignonSfx.play("ui");
  }

  function cycleRepeat() {
    const order = ["off", "all", "one"];
    const prefs = getRadioPrefs();
    const i = order.indexOf(prefs.repeat);
    repeatMode = order[(i + 1) % order.length];
    saveMignonRadio({ radioRepeat: repeatMode });
    patchRadioUi();
    if (window.SLMignonSfx) window.SLMignonSfx.play("ui");
  }

  function toggleShuffle() {
    shuffleOn = !shuffleOn;
    saveMignonRadio({ radioShuffle: shuffleOn });
    const profile = d().analyzeMusicProfile ? d().analyzeMusicProfile() : { genres: {} };
    const vibe = resolveVibe(profile, getMignon());
    queue = buildQueue(profile, vibe);
    patchRadioUi();
    if (window.SLMignonSfx) window.SLMignonSfx.play("ui");
  }

  function setRadioMode(modeId) {
    if (!RADIO_MODES.some((x) => x.id === modeId)) return;
    saveMignonRadio({ radioMode: modeId });
    const profile = d().analyzeMusicProfile ? d().analyzeMusicProfile() : { genres: {} };
    const vibe = resolveVibe(profile, getMignon());
    applyAmbiance(vibe);
    queue = buildQueue(profile, vibe);
    queueIdx = 0;
    if (getMignon() && getMignon().radioOn) {
      playStaticBurst(140);
      playCurrent();
    } else patchRadioUi();
    if (window.SLMignonSfx) window.SLMignonSfx.play("radio_tune");
  }

  function seekProgress(pct) {
    if (window.SLMignonAudio && window.SLMignonAudio.isActive()) {
      window.SLMignonAudio.seek(pct);
      patchRadioUi();
      return;
    }
    const audio = d() && d().getPreviewAudio && d().getPreviewAudio();
    if (!audio || !audio.duration || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, pct * audio.duration));
    patchRadioUi();
  }

  function formatTime(sec) {
    if (!sec || !Number.isFinite(sec)) return "0:00";
    const s = Math.floor(sec % 60);
    const m = Math.floor(sec / 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function getPreviewProgress() {
    const audio = d() && d().getPreviewAudio && d().getPreviewAudio();
    const albumId = d() && d().getPreviewAlbumId && d().getPreviewAlbumId();
    if (!audio || !albumId) return null;
    const dur = audio.duration && Number.isFinite(audio.duration) ? audio.duration : 30;
    return {
      albumId,
      current: audio.currentTime || 0,
      duration: dur,
      pct: Math.min(100, ((audio.currentTime || 0) / dur) * 100),
      paused: audio.paused,
    };
  }

  function currentTrackMeta() {
    if (window.SLMignonAudio && window.SLMignonAudio.getMeta) {
      const m = window.SLMignonAudio.getMeta();
      if (m) return m;
    }
    const prog = getAudioProgress();
    if (!prog || !d().albumById) return null;
    const al = d().albumById(prog.albumId);
    if (!al) return null;
    const cached = d().getCachedAlbumPreview && d().getCachedAlbumPreview(prog.albumId, al);
    return {
      albumId: prog.albumId,
      title: cached?.trackName || al.title,
      artist: cached?.artistName || al.artist,
      album: al.title,
      artwork: al.artworkUrl || al.cover || "",
      isFull: false,
    };
  }

  function waveformHtml(active) {
    return Array.from({ length: 24 }, (_, i) => {
      const h = active ? 3 + ((i * 5) % 14) : 4;
      return `<span class="mg-radio-wave__bar" style="--h:${h}"></span>`;
    }).join("");
  }

  function modeChipsHtml(mode) {
    const esc = d().escapeHtml;
    return RADIO_MODES.map(
      (rm) =>
        `<button type="button" class="mg-radio-mode${rm.id === mode ? " is-active" : ""}" data-radio-act="mode" data-mode="${esc(rm.id)}" title="${esc(rm.desc)}">${esc(rm.label.split(" ")[0])}</button>`
    ).join("");
  }

  function radioPanelHtml(m, profile) {
    const vibe = resolveVibe(profile, m);
    const station = pickStation(profile, vibe);
    const on = m.radioOn !== false;
    const prefs = getRadioPrefs(m);
    radioVolume = typeof m.radioVolume === "number" ? clampVol(m.radioVolume) : radioVolume;
    radioMuted = prefs.muted;
    shuffleOn = prefs.shuffle;
    repeatMode = prefs.repeat;
    const meta = currentTrackMeta();
    const prog = getAudioProgress();
    const esc = d().escapeHtml;
    const queuePreview = queue.slice(queueIdx, queueIdx + 5).map((id, i) => {
      const al = d().albumById(id);
      if (!al) return "";
      return `<li class="mg-radio-queue__item${i === 0 ? " is-now" : ""}"><span>${esc(al.artist)}</span> — ${esc(al.title)}</li>`;
    }).join("");
    const repeatLabel = repeatMode === "one" ? "①" : repeatMode === "all" ? "∞" : "↻";
    const playIcon = prog && !prog.paused && on ? "⏸" : "▶";

    return `<aside class="mg-radio-panel mg-winamp${on ? " is-on" : ""}" id="mignon-radio-panel" aria-label="Lecteur radio">
      <header class="mg-radio-panel__head">
        <div class="mg-radio-panel__brand">
          <span class="mg-radio-panel__icon" aria-hidden="true"></span>
          <div>
            <h2 class="mg-radio-panel__title">RADIO AUTOMATIQUE</h2>
            <p class="mg-radio-panel__station">${esc(station.label)}</p>
          </div>
        </div>
        <button type="button" class="mg-radio-toggle${on ? " is-on" : ""}" data-radio-act="power" aria-pressed="${on ? "true" : "false"}">${on ? "PWR" : "OFF"}</button>
      </header>
      <div class="mg-radio-modes" role="group" aria-label="Mode station">${modeChipsHtml(prefs.mode)}</div>
      <div class="mg-radio-tuner">
        <span class="mg-radio-tuner__dial" aria-hidden="true"></span>
        <span class="mg-radio-tuner__freq">${on ? "FM · " + esc(station.id.toUpperCase()) : "STANDBY"}</span>
        <span class="mg-radio-tuner__led${on && meta && !prog?.paused ? " is-live" : ""}"></span>
      </div>
      <div class="mg-radio-viz${on ? " is-live" : ""}" data-mignon-viz aria-hidden="true">${window.SLMignonViz ? window.SLMignonViz.vizBarsHtml(16) : ""}</div>
      <div class="mg-radio-wave${on && meta ? " is-live" : ""}" aria-hidden="true">${waveformHtml(on && meta)}</div>
      <div class="mg-radio-now${meta ? "" : " is-idle"}">
        ${meta ? `<div class="mg-radio-now__art" style="${meta.artwork ? `background-image:url('${esc(meta.artwork)}')` : ""}"></div>
        <div class="mg-radio-now__meta">
          <p class="mg-radio-now__track">${esc(meta.title)}${meta.isFull ? '<span class="mg-radio-full-badge">FULL</span>' : ""}</p>
          <p class="mg-radio-now__artist">${esc(meta.artist)}</p>
          <p class="mg-radio-now__album">${esc(meta.album)}</p>
        </div>` : `<p class="mg-radio-now__idle">${on ? "▸ Tuning depuis tes logs…" : "Radio en veille — PWR pour démarrer"}</p>`}
      </div>
      <div class="mg-radio-progress" id="mignon-radio-progress" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${prog ? Math.round(prog.pct) : 0}">
        <span class="mg-radio-progress__fill" style="width:${prog ? prog.pct : 0}%"></span>
        <time class="mg-radio-progress__time">${prog ? formatTime(prog.current) : "0:00"}</time>
        <time class="mg-radio-progress__dur">${prog ? formatTime(prog.duration) : "0:00"}</time>
      </div>
      <div class="mg-radio-transport">
        <button type="button" data-radio-act="prev" title="Précédent">⏮</button>
        <button type="button" class="mg-radio-play" data-radio-act="play" title="Lecture">${playIcon}</button>
        <button type="button" data-radio-act="next" title="Suivant">⏭</button>
        <button type="button" class="mg-radio-opt${shuffleOn ? " is-on" : ""}" data-radio-act="shuffle" title="Aléatoire">⧈</button>
        <button type="button" class="mg-radio-opt${repeatMode !== "off" ? " is-on" : ""}" data-radio-act="repeat" title="Répéter">${repeatLabel}</button>
        <button type="button" class="mg-radio-opt${radioMuted ? " is-on" : ""}" data-radio-act="mute" title="Muet">${radioMuted ? "🔇" : "🔊"}</button>
      </div>
      <div class="mg-radio-volume-row">
        <label for="mignon-radio-volume">VOL</label>
        <input type="range" class="mg-radio-volume" id="mignon-radio-volume" min="0" max="100" value="${Math.round(radioVolume * 100)}" aria-label="Volume" />
        <span class="mg-radio-volume__pct">${Math.round(radioVolume * 100)}%</span>
      </div>
      <p class="mg-radio-scroll" aria-hidden="true">${meta ? `▸ ${meta.artist} — ${meta.title} ◂` : "··· underground · pixel · cozy ····"}</p>
      <h3 class="mg-radio-queue__label">▸ File</h3>
      <ul class="mg-radio-queue">${queuePreview || '<li class="mg-radio-queue__empty">Log des écoutes pour alimenter la radio.</li>'}</ul>
      <p class="mg-radio-tags">${esc(station.tags.slice(0, 4).join(" · ") || vibe)}</p>
    </aside>`;
  }

  function clampVol(v) {
    return Math.max(0, Math.min(1, Number(v) || 0.72));
  }

  function patchRadioUi() {
    const panel = document.getElementById("mignon-radio-panel");
    if (!panel || !d()) return;
    const m = getMignon() || { radioOn: true };
    const profile = d().analyzeMusicProfile ? d().analyzeMusicProfile() : { genres: {} };
    const vibe = resolveVibe(profile, m);
    const on = m.radioOn !== false;
    const meta = currentTrackMeta();
    const prog = getAudioProgress();
    const prefs = getRadioPrefs(m);

    panel.classList.toggle("is-on", on);
    panel.classList.toggle("mg-winamp--playing", !!(on && meta && prog && !prog.paused));

    const toggle = panel.querySelector(".mg-radio-toggle");
    if (toggle) {
      toggle.classList.toggle("is-on", on);
      toggle.textContent = on ? "PWR" : "OFF";
      toggle.setAttribute("aria-pressed", on ? "true" : "false");
    }

    panel.querySelectorAll(".mg-radio-mode").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-mode") === prefs.mode);
    });

    const freq = panel.querySelector(".mg-radio-tuner__freq");
    if (freq) {
      const st = pickStation(profile, vibe);
      freq.textContent = on ? "FM · " + st.id.toUpperCase() : "STANDBY";
    }

    const led = panel.querySelector(".mg-radio-tuner__led");
    if (led) led.classList.toggle("is-live", !!(on && meta && prog && !prog.paused));

    const viz = panel.querySelector(".mg-radio-viz");
    if (viz) viz.classList.toggle("is-live", !!(on && meta));

    const wave = panel.querySelector(".mg-radio-wave");
    if (wave) wave.classList.toggle("is-live", !!(on && meta));

    const now = panel.querySelector(".mg-radio-now");
    if (now) {
      if (meta) {
        now.classList.remove("is-idle");
        now.innerHTML = `<div class="mg-radio-now__art" style="${meta.artwork ? `background-image:url('${meta.artwork.replace(/'/g, "%27")}')` : ""}"></div>
        <div class="mg-radio-now__meta">
          <p class="mg-radio-now__track">${meta.title.replace(/</g, "&lt;")}${meta.isFull ? '<span class="mg-radio-full-badge">FULL</span>' : ""}</p>
          <p class="mg-radio-now__artist">${meta.artist.replace(/</g, "&lt;")}</p>
          <p class="mg-radio-now__album">${meta.album.replace(/</g, "&lt;")}</p>
        </div>`;
      } else {
        now.classList.add("is-idle");
        now.innerHTML = `<p class="mg-radio-now__idle">${on ? "▸ Tuning depuis tes logs…" : "Radio en veille — PWR pour démarrer"}</p>`;
      }
    }

    const fill = panel.querySelector(".mg-radio-progress__fill");
    if (fill) fill.style.width = (prog ? prog.pct : 0) + "%";
    const tCur = panel.querySelector(".mg-radio-progress__time");
    const tDur = panel.querySelector(".mg-radio-progress__dur");
    if (tCur) tCur.textContent = prog ? formatTime(prog.current) : "0:00";
    if (tDur) tDur.textContent = prog ? formatTime(prog.duration) : "0:00";

    const playBtn = panel.querySelector(".mg-radio-play");
    if (playBtn) playBtn.textContent = prog && !prog.paused && on ? "⏸" : "▶";

    panel.querySelectorAll('[data-radio-act="shuffle"]').forEach((b) => b.classList.toggle("is-on", prefs.shuffle));
    panel.querySelectorAll('[data-radio-act="repeat"]').forEach((b) => {
      b.classList.toggle("is-on", prefs.repeat !== "off");
      b.textContent = prefs.repeat === "one" ? "①" : prefs.repeat === "all" ? "∞" : "↻";
    });
    panel.querySelectorAll('[data-radio-act="mute"]').forEach((b) => {
      b.classList.toggle("is-on", radioMuted);
      b.textContent = radioMuted ? "🔇" : "🔊";
    });

    const scroll = panel.querySelector(".mg-radio-scroll");
    if (scroll && meta) scroll.textContent = `▸ ${meta.artist} — ${meta.title} ◂`;

    if (onUiTick) onUiTick(prog);
  }

  function rebuildRadioPanel() {
    const panel = document.getElementById("mignon-radio-panel");
    if (!panel || !d()) return;
    const m = getMignon() || { radioOn: true };
    const profile = d().analyzeMusicProfile ? d().analyzeMusicProfile() : { genres: {} };
    const vibe = resolveVibe(profile, m);
    const tmp = document.createElement("div");
    tmp.innerHTML = radioPanelHtml(m, profile);
    panel.replaceWith(tmp.firstElementChild);
    wireRadioDelegation();
    patchRadioUi();
  }

  function updateRadioUi() {
    patchRadioUi();
  }

  function renderRadioPanel() {
    rebuildRadioPanel();
  }

  function wireRadioDelegation() {
    if (delegationWired) return;
    document.addEventListener("click", (e) => {
      const act = e.target.closest("[data-radio-act]");
      if (!act || !act.closest("#mignon-radio-panel")) return;
      const id = act.getAttribute("data-radio-act");
      if (id === "power") {
        const m = getMignon();
        if (!m) return;
        m.radioOn = !m.radioOn;
        saveMignonRadio({ radioOn: m.radioOn });
        if (window.SLMignonSfx) window.SLMignonSfx.play("ui");
        if (m.radioOn) boot(true);
        else stop();
        rebuildRadioPanel();
        return;
      }
      if (id === "prev") return skipTrack(-1);
      if (id === "next") return skipTrack(1);
      if (id === "play") return togglePause();
      if (id === "mute") return toggleMute();
      if (id === "repeat") return cycleRepeat();
      if (id === "shuffle") return toggleShuffle();
      if (id === "mode") return setRadioMode(act.getAttribute("data-mode"));
    });
    document.addEventListener("input", (e) => {
      if (e.target.id !== "mignon-radio-volume") return;
      radioVolume = Number(e.target.value) / 100;
      saveMignonRadio({ radioVolume });
      setAudioVolume();
      const pct = document.querySelector(".mg-radio-volume__pct");
      if (pct) pct.textContent = Math.round(radioVolume * 100) + "%";
    });
    document.addEventListener("click", (e) => {
      const bar = e.target.closest("#mignon-radio-progress");
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      seekProgress(pct);
    });
    delegationWired = true;
  }

  function boot(force) {
    const m = getMignon();
    if (!m || m.radioOn === false) return;
    if (!d()) return;
    hookAudioEnded();
    const profile = d().analyzeMusicProfile ? d().analyzeMusicProfile() : { genres: {}, listenCount: 0 };
    const vibe = resolveVibe(profile, m);
    const prefs = getRadioPrefs(m);
    radioVolume = clampVol(m.radioVolume != null ? m.radioVolume : radioVolume);
    radioMuted = prefs.muted;
    shuffleOn = prefs.shuffle;
    repeatMode = prefs.repeat;
    applyAmbiance(vibe);
    if (!queue.length || force) {
      queue = buildQueue(profile, vibe);
      queueIdx = 0;
    }
    if (!queue.length) {
      patchRadioUi();
      return;
    }
    if (!booted || force) {
      booted = true;
      playStaticBurst(180);
      document.querySelector("[data-mignon-page]")?.classList.add("mg-radio-boot");
      setTimeout(() => {
        document.querySelector("[data-mignon-page]")?.classList.remove("mg-radio-boot");
        playCurrent();
      }, force ? 280 : 520);
    }
    if (!progressTimer) {
      progressTimer = setInterval(() => {
        if (!getMignon() || !getMignon().radioOn) return;
        patchRadioUi();
        const prog = getAudioProgress();
        if (prog && !prog.paused) setCreatureDance(true);
        else if (prog && prog.paused) setCreatureDance(false);
      }, 400);
    }
    syncViz();
  }

  function stop() {
    clearTimeout(advanceTimer);
    advanceTimer = null;
    clearInterval(progressTimer);
    progressTimer = null;
    booted = false;
    if (window.SLMignonAudio && window.SLMignonAudio.stop) window.SLMignonAudio.stop();
    else if (d() && d().stopAlbumPreview) d().stopAlbumPreview();
    setCreatureDance(false);
    if (window.SLMignonViz) window.SLMignonViz.start(null);
    document.querySelector("[data-mignon-page]")?.removeAttribute("data-radio-playing");
    document.querySelector("[data-mignon-page]")?.classList.remove("is-music-live");
    patchRadioUi();
  }

  function onPageMount() {
    wireRadioDelegation();
    const m = getMignon();
    if (m) {
      radioVolume = clampVol(m.radioVolume != null ? m.radioVolume : radioVolume);
      radioMuted = !!m.radioMuted;
    }
    if (m && m.radioOn !== false) boot(false);
    else {
      if (window.SLMignonViz) window.SLMignonViz.start(null);
      patchRadioUi();
    }
  }

  function onPageUnmount() {
    stop();
  }

  function install(injected) {
    deps = injected;
  }

  window.SLMignonRadio = {
    install,
    boot,
    stop,
    onPageMount,
    onPageUnmount,
    updateRadioUi,
    renderRadioPanel,
    radioPanelHtml,
    buildQueue,
    pickStation,
    patchRadioUi,
    setOnUiTick: (fn) => {
      onUiTick = fn;
    },
  };
})();
