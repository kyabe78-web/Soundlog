/* Soundlog — Mignon 16-bit audio visualizer (synced to preview playback) */
(function () {
  "use strict";

  let raf = null;
  let audioEl = null;
  let fakePhase = 0;

  function setBars(root, values, live) {
    if (!root) return;
    root.querySelectorAll(".mg-viz-bar, .px-eq-wall-bar").forEach((bar, i) => {
      const v = values[i % values.length] || 0;
      const h = live ? 4 + Math.round(v * 24) : 4;
      bar.style.setProperty("--h", String(h));
      bar.style.height = h + "px";
      bar.classList.toggle("is-hot", live && v > 0.6);
    });
  }

  function sample(n, live, t) {
    const out = [];
    for (let i = 0; i < n; i++) {
      if (live) {
        const bass = Math.abs(Math.sin(t * 6.2 + i * 0.45)) * 0.55;
        const treble = Math.abs(Math.sin(t * 14 + i * 1.1)) * 0.35;
        out.push(Math.min(1, 0.2 + bass + treble * 0.5));
      } else {
        fakePhase += 0.02;
        out.push(0.15 + Math.abs(Math.sin(fakePhase + i * 0.5)) * 0.35);
      }
    }
    return out;
  }

  function loop() {
    const audio = audioEl;
    const live = !!(audio && !audio.paused && audio.currentTime > 0);
    const t = live ? audio.currentTime : fakePhase;
    const vals = sample(16, live, t);
    document.querySelectorAll("[data-mignon-viz]").forEach((el) => setBars(el, vals, live));
    const page = document.querySelector("[data-mignon-page]");
    if (page) page.style.setProperty("--viz-pulse", String(0.3 + (vals[3] || 0) * 0.7));
    raf = requestAnimationFrame(loop);
  }

  function start(audio) {
    audioEl = audio || audioEl;
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    audioEl = null;
  }

  function vizBarsHtml(n) {
    return Array.from({ length: n }, (_, i) => `<span class="mg-viz-bar" style="--eq-i:${i}"></span>`).join("");
  }

  window.SLMignonViz = { start, stop, vizBarsHtml };
})();
