/* Soundlog — Mignon full-track radio player (YouTube + preview fallback) */
(function () {
  "use strict";

  const PIPED_HOSTS = [
    "https://pipedapi.in.projectsegfau.lt",
    "https://pipedapi.adminforge.de",
    "https://api.piped.yt",
  ];

  let deps = null;
  let ytReady = null;
  let ytPlayer = null;
  let html5 = null;
  let mode = null; // "youtube" | "preview" | null
  let albumId = null;
  let meta = null;
  let volume = 0.72;
  let muted = false;
  let onEndedCb = null;

  function d() {
    return deps;
  }

  function loadYoutubeApi() {
    if (ytReady) return ytReady;
    ytReady = new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        resolve();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        s.async = true;
        document.head.appendChild(s);
      }
    });
    return ytReady;
  }

  function ensureMount() {
    let el = document.getElementById("mignon-audio-mount");
    if (!el) {
      el = document.createElement("div");
      el.id = "mignon-audio-mount";
      el.className = "mignon-audio-mount";
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
    }
    return el;
  }

  function ensureHtml5() {
    if (!html5) {
      html5 = new Audio();
      html5.preload = "auto";
      html5.addEventListener("ended", () => {
        if (mode === "preview") handleEnded();
      });
      html5.addEventListener("error", () => {
        if (mode === "preview") handleEnded();
      });
    }
    return html5;
  }

  function handleEnded() {
    if (onEndedCb) onEndedCb();
  }

  async function pipedSearchVideoId(query) {
    for (const host of PIPED_HOSTS) {
      try {
        const url = `${host}/api/v1/search?q=${encodeURIComponent(query)}&filter=music_songs`;
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) continue;
        const j = await r.json();
        const item = (j.items || []).find((x) => x.url && /youtube\.com\/watch/.test(x.url)) || j.items?.[0];
        if (!item || !item.url) continue;
        const m = String(item.url).match(/[?&]v=([^&]+)/);
        if (m) return m[1];
      } catch (_) {}
    }
    return null;
  }

  async function resolveYoutubeId(al, trackName) {
    if (!al || !d()) return null;
    const cached = d().getCachedAlbumPreview && d().getCachedAlbumPreview(al.id, al);
    if (cached && cached.youtubeId) return cached.youtubeId;
    const st = d().state && d().state.previewByAlbumId && d().state.previewByAlbumId[al.id];
    if (st && st.youtubeId) return st.youtubeId;

    const ytKey = d().getYoutubeApiKey && d().getYoutubeApiKey();
    const q = `${al.artist} ${trackName || al.title} official audio`;
    let id = null;

    if (ytKey && d().searchYoutubeVideo) {
      id = await d().searchYoutubeVideo(al.artist, trackName || al.title, ytKey);
    }
    if (!id) id = await pipedSearchVideoId(q);
    if (id && cached && d().cacheAlbumPreview) {
      d().cacheAlbumPreview(al.id, { ...cached, youtubeId: id });
    }
    return id;
  }

  function destroyYt() {
    if (ytPlayer && ytPlayer.destroy) {
      try {
        ytPlayer.destroy();
      } catch (_) {}
    }
    ytPlayer = null;
  }

  async function playYoutube(videoId) {
    await loadYoutubeApi();
    const mount = ensureMount();
    destroyYt();
    mount.innerHTML = "";
    const target = document.createElement("div");
    target.id = "mignon-yt-target";
    mount.appendChild(target);
    if (html5) {
      html5.pause();
      html5.removeAttribute("src");
    }
    mode = "youtube";
    return new Promise((resolve, reject) => {
      ytPlayer = new window.YT.Player(target, {
        height: "1",
        width: "1",
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (ev) => {
            try {
              ev.target.setVolume(muted ? 0 : Math.round(volume * 100));
              ev.target.playVideo();
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          onStateChange: (ev) => {
            if (ev.data === window.YT.PlayerState.ENDED) handleEnded();
          },
          onError: () => {
            mode = null;
            reject(new Error("yt-error"));
          },
        },
      });
    });
  }

  async function playPreviewUrl(url, al) {
    destroyYt();
    const audio = ensureHtml5();
    mode = "preview";
    audio.src = url;
    audio.volume = muted ? 0 : volume;
    try {
      await audio.play();
    } catch (e) {
      mode = null;
      throw e;
    }
  }

  async function play(albumIdArg) {
    if (!d() || !d().albumById) return false;
    const al = d().albumById(albumIdArg);
    if (!al) return false;

    if (d().stopAlbumPreview) d().stopAlbumPreview();

    albumId = albumIdArg;
    let cached = null;
    if (d().resolveAlbumPreview) {
      cached = await d().resolveAlbumPreview(al, {});
    } else if (d().getCachedAlbumPreview) {
      cached = d().getCachedAlbumPreview(al.id, al);
    }

    const trackName = cached?.trackName || al.title;
    meta = {
      albumId: al.id,
      title: trackName,
      artist: cached?.artistName || al.artist,
      album: al.title,
      artwork: al.artworkUrl || al.cover || "",
      isFull: false,
      source: cached?.source || "preview",
    };

    let ytId = cached?.youtubeId || null;
    if (!ytId) ytId = await resolveYoutubeId(al, trackName);

    if (ytId) {
      try {
        await playYoutube(ytId);
        meta.isFull = true;
        meta.source = "youtube";
        meta.youtubeId = ytId;
        return true;
      } catch (_) {
        destroyYt();
      }
    }

    if (cached && cached.url) {
      try {
        await playPreviewUrl(cached.url, al);
        meta.isFull = false;
        meta.source = cached.source || "preview";
        resolveYoutubeId(al, trackName).then((id) => {
          if (id && albumId === al.id && mode === "preview") {
            playYoutube(id)
              .then(() => {
                meta.isFull = true;
                meta.source = "youtube";
              })
              .catch(() => {});
          }
        });
        return true;
      } catch (_) {}
    }

    albumId = null;
    meta = null;
    return false;
  }

  function pause() {
    if (mode === "youtube" && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    else if (mode === "preview" && html5) html5.pause();
  }

  function resume() {
    if (mode === "youtube" && ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
    else if (mode === "preview" && html5) html5.play().catch(() => {});
  }

  function stop() {
    destroyYt();
    if (html5) {
      html5.pause();
      html5.removeAttribute("src");
    }
    mode = null;
    albumId = null;
    meta = null;
    if (d() && d().stopAlbumPreview) d().stopAlbumPreview();
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, Number(v) || 0));
    if (mode === "youtube" && ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(muted ? 0 : Math.round(volume * 100));
    else if (mode === "preview" && html5) html5.volume = muted ? 0 : volume;
  }

  function setMuted(m) {
    muted = !!m;
    setVolume(volume);
  }

  function seek(ratio) {
    const r = Math.max(0, Math.min(1, ratio));
    if (mode === "youtube" && ytPlayer && ytPlayer.getDuration) {
      const dur = ytPlayer.getDuration();
      if (dur && Number.isFinite(dur)) ytPlayer.seekTo(dur * r, true);
    } else if (mode === "preview" && html5 && html5.duration) {
      html5.currentTime = html5.duration * r;
    }
  }

  function getProgress() {
    if (!albumId) return null;
    let current = 0;
    let duration = 0;
    let paused = true;

    if (mode === "youtube" && ytPlayer && ytPlayer.getCurrentTime) {
      current = ytPlayer.getCurrentTime() || 0;
      duration = ytPlayer.getDuration() || 0;
      const st = ytPlayer.getPlayerState && ytPlayer.getPlayerState();
      paused = st !== 1;
    } else if (mode === "preview" && html5) {
      current = html5.currentTime || 0;
      duration = html5.duration && Number.isFinite(html5.duration) ? html5.duration : 30;
      paused = html5.paused;
    } else return null;

    if (!duration || !Number.isFinite(duration)) duration = meta?.isFull ? 180 : 30;

    return {
      albumId,
      current,
      duration,
      pct: Math.min(100, (current / duration) * 100),
      paused,
      isFull: !!(meta && meta.isFull),
      source: meta?.source || mode,
    };
  }

  function getMeta() {
    return meta ? { ...meta } : null;
  }

  function isActive() {
    return !!mode;
  }

  function getHtml5() {
    return mode === "preview" ? html5 : null;
  }

  function install(injected) {
    deps = injected;
  }

  window.SLMignonAudio = {
    install,
    play,
    pause,
    resume,
    stop,
    seek,
    setVolume,
    setMuted,
    getProgress,
    getMeta,
    isActive,
    getHtml5,
    onEnded: (fn) => {
      onEndedCb = fn;
    },
  };
})();
