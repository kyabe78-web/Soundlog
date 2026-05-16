/* Soundlog — Mignon UI SFX (chiptune bleeps, Web Audio, no assets) */
(function () {
  "use strict";

  const STORAGE_KEY = "sl_mignon_sfx";
  let ctx = null;
  let master = null;
  let settings = { enabled: true, volume: 0.55 };

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.enabled === "boolean") settings.enabled = p.enabled;
        if (typeof p.volume === "number") settings.volume = Math.max(0, Math.min(1, p.volume));
      }
    } catch (_) {}
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {}
  }

  function ensureCtx() {
    if (ctx && ctx.state !== "closed") return ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = settings.volume * 0.35;
    master.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    const c = ensureCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  }

  function tone(freq, dur, type, gain, when) {
    const c = ensureCtx();
    if (!c || !master) return;
    const t0 = when || c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noiseBurst(dur, gain) {
    const c = ensureCtx();
    if (!c || !master) return;
    const t0 = c.currentTime;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(gain || 0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(g);
    g.connect(master);
    src.start(t0);
  }

  const PRESETS = {
    tab: () => {
      tone(520, 0.05, "square", 0.08);
      tone(780, 0.04, "square", 0.06, ctx.currentTime + 0.04);
    },
    ui: () => tone(440, 0.04, "triangle", 0.07),
    pet: () => {
      tone(330, 0.06, "triangle", 0.1);
      tone(494, 0.05, "triangle", 0.08, ctx.currentTime + 0.05);
    },
    equip: () => {
      tone(392, 0.05, "square", 0.09);
      tone(523, 0.05, "square", 0.09, ctx.currentTime + 0.05);
      tone(659, 0.08, "square", 0.1, ctx.currentTime + 0.1);
    },
    world: () => {
      tone(262, 0.08, "sawtooth", 0.07);
      tone(349, 0.1, "sawtooth", 0.08, ctx.currentTime + 0.06);
    },
    decor: () => tone(600, 0.03, "square", 0.06),
    success: () => {
      tone(523, 0.06, "square", 0.1);
      tone(659, 0.06, "square", 0.1, ctx.currentTime + 0.07);
      tone(784, 0.1, "square", 0.12, ctx.currentTime + 0.14);
    },
    error: () => {
      tone(180, 0.12, "sawtooth", 0.1);
      tone(140, 0.14, "sawtooth", 0.08, ctx.currentTime + 0.1);
    },
    react: () => {
      tone(880, 0.04, "sine", 0.08);
      tone(1108, 0.06, "sine", 0.1, ctx.currentTime + 0.04);
    },
    tick: () => tone(720, 0.02, "square", 0.05),
    miss: () => tone(200, 0.06, "sawtooth", 0.07),
    surprise: () => {
      noiseBurst(0.04, 0.05);
      tone(440, 0.05, "square", 0.1);
      tone(554, 0.05, "square", 0.1, ctx.currentTime + 0.05);
      tone(880, 0.08, "square", 0.12, ctx.currentTime + 0.1);
    },
    visit: () => {
      tone(349, 0.06, "triangle", 0.08);
      tone(440, 0.08, "triangle", 0.1, ctx.currentTime + 0.06);
    },
    open: () => {
      tone(294, 0.05, "square", 0.08);
      tone(370, 0.05, "square", 0.08, ctx.currentTime + 0.05);
      tone(440, 0.07, "square", 0.1, ctx.currentTime + 0.1);
    },
    skip: () => {
      tone(660, 0.03, "square", 0.07);
      tone(880, 0.04, "square", 0.08, ctx.currentTime + 0.04);
    },
    pause: () => tone(220, 0.06, "triangle", 0.06),
    discover: () => {
      tone(523, 0.04, "square", 0.09);
      tone(784, 0.06, "square", 0.1, ctx.currentTime + 0.06);
      tone(1046, 0.08, "square", 0.12, ctx.currentTime + 0.12);
    },
    radio_tune: () => noiseBurst(0.06, 0.04),
  };

  function play(id, opts) {
    opts = opts || {};
    loadSettings();
    if (!settings.enabled && !opts.force) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches && !opts.force) return;
    resume();
    const fn = PRESETS[id] || PRESETS.ui;
    try {
      fn(opts);
    } catch (_) {}
  }

  function setEnabled(on) {
    settings.enabled = !!on;
    saveSettings();
  }

  function setVolume(v) {
    settings.volume = Math.max(0, Math.min(1, Number(v) || 0));
    if (master) master.gain.value = settings.volume * 0.35;
    saveSettings();
  }

  loadSettings();

  window.SLMignonSfx = {
    play,
    setEnabled,
    setVolume,
    getSettings: () => ({ ...settings }),
    PRESETS: Object.keys(PRESETS),
  };
})();
