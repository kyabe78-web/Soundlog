/* Soundlog — Mignon Automatic Music Radio */
(function () {
  "use strict";

  const STATIONS = {
    lofi: { id: "lofi", label: "CHILL FM", tags: ["Lo-fi", "Jazz", "Soul", "R&B"] },
    rap: { id: "rap", label: "UNDERGROUND FM", tags: ["Rap", "Hip-Hop", "Metal", "Punk"] },
    techno: { id: "techno", label: "NEON FM", tags: ["Electronic", "Experimental"] },
    ambient: { id: "ambient", label: "DREAM FM", tags: ["Ambient", "Classical", "Shoegaze"] },
    indie: { id: "indie", label: "BEDROOM FM", tags: ["Indie", "Folk", "Rock", "Pop"] },
    default: { id: "default", label: "SOUNDLOG FM", tags: [] },
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

  function d() {
    return deps;
  }

  function pickStation(profile, vibe) {
    const v = vibe || "lofi";
    if (STATIONS[v]) return STATIONS[v];
    return STATIONS.default;
  }

  function scoreListening(l, al, profile, station) {
    const g = (al && al.genre) || "Autre";
    let score = 1 + Math.random() * 0.15;
    score += (profile.genres[g] || 0) * 2.5;
    if (station.tags.includes(g)) score += 4;
    if (l.rating) score += Number(l.rating) * 0.8;
    const t = new Date(l.date || l.createdAt || 0).getTime();
    if (t) {
      const days = (Date.now() - t) / 86400000;
      score += Math.max(0, 14 - days);
    }
    return score;
  }

  function buildQueue(profile, vibe) {
    if (!d()) return [];
    const listens = (d().state.listenings || []).filter((x) => x.userId === "me");
    const station = pickStation(profile, vibe);
    const byAlbum = new Map();
    listens.forEach((l) => {
      if (!l.albumId) return;
      const al = d().albumById(l.albumId);
      const score = scoreListening(l, al, profile, station);
      const prev = byAlbum.get(l.albumId);
      if (!prev || score > prev.score) byAlbum.set(l.albumId, { albumId: l.albumId, score, al });
    });
    const list = Array.from(byAlbum.values()).sort((a, b) => b.score - a.score);
    let top = list.slice(0, 40);
    if (top.length > 3) {
      const recent = new Set(playHistory.slice(-3));
      top = top.filter((x) => !recent.has(x.albumId)).concat(top.filter((x) => recent.has(x.albumId)));
    }
    if (!top.length) top = list.slice(0, 40);
    for (let i = top.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top[i], top[j]] = [top[j], top[i]];
    }
    return top.map((x) => x.albumId);
  }

  function getMignon() {
    return d() && d().getMignon ? d().getMignon("me") : null;
  }

  function saveMignonRadio(patch) {
    const m = getMignon();
    if (!m || !d().saveMignon) return;
    Object.assign(m, patch);
    d().saveMignon(m, { cloud: false });
  }

  function playStaticBurst(ms) {
    if (!window.SLMignonSfx) return;
    try {
      window.SLMignonSfx.play("ui");
    } catch (_) {}
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
    g.gain.value = 0.04;
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
  }

  function hookPreviewEnded() {
    if (endedHooked || !d() || !d().getPreviewAudio) return;
    const audio = d().getPreviewAudio();
    if (!audio) return;
    audio.addEventListener("ended", () => {
      if (getMignon() && getMignon().radioOn) scheduleNext(800);
    });
    endedHooked = true;
  }

  async function playCurrent() {
    if (!d() || !d().playAlbumPreview || !queue.length) return;
    const albumId = queue[queueIdx % queue.length];
    const al = d().albumById(albumId);
    if (!al) {
      queueIdx++;
      return playCurrent();
    }
    document.querySelector("[data-mignon-page]")?.setAttribute("data-radio-playing", "true");
    setCreatureDance(true);
    playHistory.push(albumId);
    if (playHistory.length > 12) playHistory.shift();
    await d().playAlbumPreview(albumId);
    setAudioVolume();
    const audio = d().getPreviewAudio && d().getPreviewAudio();
    if (window.SLMignonViz && audio) window.SLMignonViz.start(audio);
    updateRadioUi();
  }

  function scheduleNext(delayMs) {
    clearTimeout(advanceTimer);
    advanceTimer = setTimeout(() => {
      if (!getMignon() || !getMignon().radioOn) return;
      queueIdx = (queueIdx + 1) % Math.max(1, queue.length);
      playStaticBurst(120);
      setTimeout(() => playCurrent(), 200);
    }, delayMs || 400);
  }

  function applyAmbiance(vibe) {
    const page = document.querySelector("[data-mignon-page]");
    if (!page) return;
    page.setAttribute("data-ambiance", vibe || "lofi");
    const room = page.querySelector(".px-room");
    if (room) room.setAttribute("data-ambiance", vibe || "lofi");
  }

  function setCreatureDance(on) {
    document.querySelectorAll("[data-mignon-page] .px-radiobot, [data-mignon-page] .px-mignon-buddy").forEach((el) => {
      const vibe = document.querySelector("[data-mignon-page]")?.getAttribute("data-music-vibe") || "lofi";
      if (on) {
        el.setAttribute("data-anim", "dance");
        el.setAttribute("data-dance-vibe", vibe);
      } else {
        const m = getMignon();
        const mood = (m && m.mood) || "calm";
        const idleMap = { sleepy: "sleep", excited: "dance", bliss: "dance", listening: "listening" };
        el.setAttribute("data-anim", idleMap[mood] || "idle");
        el.removeAttribute("data-dance-vibe");
      }
    });
    const page = document.querySelector("[data-mignon-page]");
    if (page) page.classList.toggle("is-music-live", !!on);
  }

  function setAudioVolume() {
    const audio = d() && d().getPreviewAudio && d().getPreviewAudio();
    if (audio) audio.volume = radioVolume;
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
    const audio = d() && d().getPreviewAudio && d().getPreviewAudio();
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      setCreatureDance(true);
      if (window.SLMignonSfx) window.SLMignonSfx.play("ui");
    } else {
      audio.pause();
      setCreatureDance(false);
      if (window.SLMignonSfx) window.SLMignonSfx.play("pause");
    }
    updateRadioUi();
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
    const prog = getPreviewProgress();
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
    };
  }

  function eqBarsHtml(n, active) {
    return Array.from({ length: n }, (_, i) => {
      const h = active ? 4 + ((i * 3) % 12) : 3;
      return `<span class="mg-radio-eq__bar" style="--h:${h}"></span>`;
    }).join("");
  }

  function radioPanelHtml(m, profile, vibe) {
    const station = pickStation(profile, vibe);
    const on = m.radioOn !== false;
    const meta = currentTrackMeta();
    const prog = getPreviewProgress();
    const esc = d().escapeHtml;
    const queuePreview = queue.slice(queueIdx, queueIdx + 4).map((id, i) => {
      const al = d().albumById(id);
      if (!al) return "";
      return `<li class="mg-radio-queue__item${i === 0 ? " is-now" : ""}"><span>${esc(al.artist)}</span> — ${esc(al.title)}</li>`;
    }).join("");
    return `<aside class="mg-radio-panel${on ? " is-on" : ""}" id="mignon-radio-panel" aria-label="Radio automatique">
      <header class="mg-radio-panel__head">
        <span class="mg-radio-panel__icon">📻</span>
        <div>
          <h2 class="mg-radio-panel__title">Radio auto</h2>
          <p class="mg-radio-panel__station">${esc(station.label)}</p>
        </div>
        <button type="button" class="mg-radio-toggle${on ? " is-on" : ""}" id="mignon-radio-toggle" aria-pressed="${on ? "true" : "false"}">${on ? "ON" : "OFF"}</button>
      </header>
      <div class="mg-radio-tuner" aria-hidden="true">
        <span class="mg-radio-tuner__dial"></span>
        <span class="mg-radio-tuner__freq">${on ? "FM 88.4" : "— —"}</span>
      </div>
      <div class="mg-radio-viz${on && meta ? " is-live" : ""}" data-mignon-viz aria-hidden="true">${window.SLMignonViz ? window.SLMignonViz.vizBarsHtml(16) : eqBarsHtml(16, false)}</div>
      <div class="mg-radio-transport">
        <button type="button" id="mignon-radio-prev" title="Précédent">⏮</button>
        <button type="button" id="mignon-radio-play" title="Lecture">${prog && !prog.paused ? "⏸" : "▶"}</button>
        <button type="button" id="mignon-radio-next" title="Suivant">⏭</button>
        <input type="range" class="mg-radio-volume" id="mignon-radio-volume" min="0" max="100" value="${Math.round(radioVolume * 100)}" aria-label="Volume" />
      </div>
      <div class="mg-radio-now${meta ? "" : " is-idle"}">
        ${meta ? `<div class="mg-radio-now__art" style="${meta.artwork ? `background-image:url('${esc(meta.artwork)}')` : ""}"></div>
        <div class="mg-radio-now__meta">
          <p class="mg-radio-now__track">${esc(meta.title)}</p>
          <p class="mg-radio-now__artist">${esc(meta.artist)}</p>
          <p class="mg-radio-now__album">${esc(meta.album)}</p>
        </div>` : `<p class="mg-radio-now__idle">${on ? "Tuning…" : "Radio en veille"}</p>`}
      </div>
      ${prog ? `<div class="mg-radio-progress"><span style="width:${prog.pct}%"></span><time>${formatTime(prog.current)} / ${formatTime(prog.duration)}</time></div>` : ""}
      <p class="mg-radio-scroll" aria-hidden="true">${meta ? `▸ ${meta.artist} — ${meta.title} ◂` : "··· soundlog underground radio ···"}</p>
      <h3 class="mg-radio-queue__label">Prochains</h3>
      <ul class="mg-radio-queue">${queuePreview || '<li class="feed-note">Log des écoutes pour alimenter la radio.</li>'}</ul>
      <p class="mg-radio-tags">${esc(station.tags.slice(0, 4).join(" · ") || vibe)}</p>
    </aside>`;
  }

  function updateRadioUi() {
    const panel = document.getElementById("mignon-radio-panel");
    if (!panel || !d()) return;
    const m = getMignon();
    const profile = d().analyzeMusicProfile ? d().analyzeMusicProfile() : { genres: {} };
    const vibe = d().computeMusicVibe ? d().computeMusicVibe(profile) : "lofi";
    const wrap = panel.parentElement;
    if (wrap) {
      const fresh = radioPanelHtml(m || { radioOn: true }, profile, vibe);
      const tmp = document.createElement("div");
      tmp.innerHTML = fresh;
      panel.replaceWith(tmp.firstElementChild);
      wireRadioControls(document);
    }
    if (onUiTick) onUiTick(getPreviewProgress());
  }

  function wireRadioControls(root) {
    root = root || document;
    const toggle = root.querySelector("#mignon-radio-toggle");
    if (toggle && !toggle._mgRadioWired) {
      toggle._mgRadioWired = true;
      toggle.addEventListener("click", () => {
        const m = getMignon();
        if (!m) return;
        m.radioOn = !m.radioOn;
        saveMignonRadio({ radioOn: m.radioOn });
        if (window.SLMignonSfx) window.SLMignonSfx.play("ui");
        if (m.radioOn) boot(true);
        else stop();
        updateRadioUi();
      });
    }
    const prev = root.querySelector("#mignon-radio-prev");
    if (prev && !prev._mgWired) {
      prev._mgWired = true;
      prev.addEventListener("click", () => skipTrack(-1));
    }
    const next = root.querySelector("#mignon-radio-next");
    if (next && !next._mgWired) {
      next._mgWired = true;
      next.addEventListener("click", () => skipTrack(1));
    }
    const playBtn = root.querySelector("#mignon-radio-play");
    if (playBtn && !playBtn._mgWired) {
      playBtn._mgWired = true;
      playBtn.addEventListener("click", () => togglePause());
    }
    const vol = root.querySelector("#mignon-radio-volume");
    if (vol && !vol._mgWired) {
      vol._mgWired = true;
      vol.addEventListener("input", () => {
        radioVolume = Number(vol.value) / 100;
        setAudioVolume();
      });
    }
  }

  function boot(force) {
    const m = getMignon();
    if (!m || m.radioOn === false) return;
    if (!d()) return;
    hookPreviewEnded();
    const profile = d().analyzeMusicProfile ? d().analyzeMusicProfile() : { genres: {}, listenCount: 0 };
    const vibe = d().computeMusicVibe ? d().computeMusicVibe(profile) : "lofi";
    applyAmbiance(vibe);
    if (!queue.length || force) {
      queue = buildQueue(profile, vibe);
      queueIdx = 0;
    }
    if (!queue.length) return;
    if (!booted || force) {
      booted = true;
      playStaticBurst(180);
      document.querySelector("[data-mignon-page]")?.classList.add("mg-radio-boot");
      setTimeout(() => {
        document.querySelector("[data-mignon-page]")?.classList.remove("mg-radio-boot");
        playCurrent();
      }, force ? 300 : 600);
    }
    if (!progressTimer) {
      progressTimer = setInterval(() => {
        if (!getMignon() || !getMignon().radioOn) return;
        updateRadioUi();
        const prog = getPreviewProgress();
        if (prog && !prog.paused) setCreatureDance(true);
      }, 500);
    }
  }

  function stop() {
    clearTimeout(advanceTimer);
    advanceTimer = null;
    clearInterval(progressTimer);
    progressTimer = null;
    booted = false;
    if (d() && d().stopAlbumPreview) d().stopAlbumPreview();
    setCreatureDance(false);
    if (window.SLMignonViz) window.SLMignonViz.stop();
    document.querySelector("[data-mignon-page]")?.removeAttribute("data-radio-playing");
    document.querySelector("[data-mignon-page]")?.classList.remove("is-music-live");
  }

  function onPageMount() {
    wireRadioControls(document);
    const m = getMignon();
    if (m && m.radioOn !== false) boot(false);
    else updateRadioUi();
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
    radioPanelHtml,
    buildQueue,
    pickStation,
    setOnUiTick: (fn) => {
      onUiTick = fn;
    },
  };
})();
