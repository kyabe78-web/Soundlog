/* Soundlog — Identity theme engine (album cover → app palette) */
(function () {
  "use strict";

  const VERSION = 1;
  const CACHE_PREFIX = "sl-identity-theme-v1:";

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function hexToRgb(hex) {
    const h = String(hex || "").replace("#", "").trim();
    if (h.length !== 6) return null;
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    if (s === 0) {
      const v = l * 255;
      return { r: v, g: v, b: v };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hk = h / 360;
    const t = [hk + 1 / 3, hk, hk - 1 / 3].map((x) => {
      let v = x;
      if (v < 0) v += 1;
      if (v > 1) v -= 1;
      if (v < 1 / 6) return p + (q - p) * 6 * v;
      if (v < 1 / 2) return q;
      if (v < 2 / 3) return p + (q - p) * (2 / 3 - v) * 6;
      return p;
    });
    return { r: t[0] * 255, g: t[1] * 255, b: t[2] * 255 };
  }

  function luminance(r, g, b) {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function contrastRatio(rgb1, rgb2) {
    const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  function mixRgb(a, b, t) {
    return {
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t,
    };
  }

  function ensureContrast(fg, bg, minRatio) {
    minRatio = minRatio || 4.5;
    let f = { ...fg };
    let ratio = contrastRatio(f, bg);
    let guard = 0;
    while (ratio < minRatio && guard < 24) {
      const hsl = rgbToHsl(f.r, f.g, f.b);
      const targetLight = luminance(bg.r, bg.g, bg.b) < 0.35;
      hsl.l = targetLight ? hsl.l + 6 : hsl.l - 6;
      f = hslToRgb(hsl.h, hsl.s, hsl.l);
      ratio = contrastRatio(f, bg);
      guard++;
    }
    return f;
  }

  function bucketColors(pixels) {
    const buckets = new Map();
    for (let i = 0; i < pixels.length; i += 4) {
      const a = pixels[i + 3];
      if (a < 48) continue;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const lum = luminance(r, g, b);
      if (lum > 0.94 || lum < 0.04) continue;
      const key = Math.round(r / 32) + "," + Math.round(g / 32) + "," + Math.round(b / 32);
      const prev = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0, sat: 0 };
      const hsl = rgbToHsl(r, g, b);
      prev.r += r;
      prev.g += g;
      prev.b += b;
      prev.sat += hsl.s;
      prev.n++;
      buckets.set(key, prev);
    }
    return [...buckets.values()]
      .filter((b) => b.n > 2)
      .map((b) => ({
        r: b.r / b.n,
        g: b.g / b.n,
        b: b.b / b.n,
        sat: b.sat / b.n,
        n: b.n,
      }))
      .sort((a, b) => b.sat * b.n - a.sat * a.n);
  }

  function sampleImageData(img) {
    try {
      const canvas = document.createElement("canvas");
      const s = 40;
      canvas.width = s;
      canvas.height = s;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, s, s);
      return ctx.getImageData(0, 0, s, s).data;
    } catch (_) {
      return null;
    }
  }

  function pickPaletteFromBuckets(buckets) {
    if (!buckets.length) return null;
    const accent = buckets[0];
    const secondary = buckets[1] || buckets[0];
    const deep = [...buckets].sort((a, b) => luminance(a.r, a.g, a.b) - luminance(b.r, b.g, b.b))[0];
    const primary = mixRgb(accent, secondary, 0.35);
    return { primary, secondary, accent, deep };
  }

  function buildThemeFromRgbSet(set, albumId, source) {
    const bgBase = set.deep || set.primary;
    const bgRgb = mixRgb(bgBase, { r: 8, g: 8, b: 12 }, 0.55);
    const cardRgb = mixRgb(set.primary, bgRgb, 0.25);
    const accentRgb = set.accent;
    const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);
    accentHsl.s = clamp(accentHsl.s, 28, 78);
    const accentClamped = hslToRgb(accentHsl.h, accentHsl.s, clamp(accentHsl.l, 38, 62));

    let textRgb = { r: 235, g: 228, b: 216 };
    let textMutedRgb = { r: 163, g: 158, b: 148 };
    const bgLum = luminance(bgRgb.r, bgRgb.g, bgRgb.b);
    if (bgLum > 0.55) {
      textRgb = { r: 18, g: 16, b: 14 };
      textMutedRgb = { r: 72, g: 68, b: 62 };
    }
    textRgb = ensureContrast(textRgb, bgRgb, 4.8);
    textMutedRgb = ensureContrast(textMutedRgb, bgRgb, 3.2);

    const bgTo = mixRgb(bgRgb, accentClamped, 0.12);
    const glow = `rgba(${Math.round(accentClamped.r)},${Math.round(accentClamped.g)},${Math.round(accentClamped.b)},0.42)`;
    const glowSoft = `rgba(${Math.round(accentClamped.r)},${Math.round(accentClamped.g)},${Math.round(accentClamped.b)},0.14)`;

    const hue = Math.round(rgbToHsl(accentClamped.r, accentClamped.g, accentClamped.b).h);

    const theme = {
      version: VERSION,
      source: source || "gradient",
      albumId: albumId || "",
      hue,
      isDark: bgLum < 0.5,
      primary: rgbToHex(set.primary.r, set.primary.g, set.primary.b),
      secondary: rgbToHex(set.secondary.r, set.secondary.g, set.secondary.b),
      accent: rgbToHex(accentClamped.r, accentClamped.g, accentClamped.b),
      bgFrom: rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b),
      bgTo: rgbToHex(bgTo.r, bgTo.g, bgTo.b),
      card: `rgba(${Math.round(cardRgb.r)},${Math.round(cardRgb.g)},${Math.round(cardRgb.b)},0.55)`,
      text: rgbToHex(textRgb.r, textRgb.g, textRgb.b),
      textMuted: rgbToHex(textMutedRgb.r, textMutedRgb.g, textMutedRgb.b),
      glow,
      glowSoft,
    };

    theme.css = themeToCssVars(theme);
    return theme;
  }

  function themeToCssVars(theme) {
    const t = theme || {};
    const ph = t.hue != null ? t.hue : 152;
    return {
      "--id-hue": String(ph),
      "--id-primary": t.primary || "#4a7358",
      "--id-secondary": t.secondary || "#3d5c4a",
      "--id-accent": t.accent || "#5d8f6c",
      "--id-bg-from": t.bgFrom || "#0b0c0a",
      "--id-bg-to": t.bgTo || "#181916",
      "--id-card": t.card || "rgba(28,30,26,0.55)",
      "--id-text": t.text || "#ebe6dc",
      "--id-text-muted": t.textMuted || "#a39e94",
      "--id-glow": t.glow || "rgba(93,143,108,0.28)",
      "--id-glow-soft": t.glowSoft || "rgba(93,143,108,0.12)",
      "--ph": String(ph),
      "--pf-magenta": t.accent || "#5d8f6c",
      "--pf-glow": t.glow || "rgba(93,143,108,0.28)",
      "--pf-glow-soft": t.glowSoft || "rgba(93,143,108,0.12)",
      "--accent": t.accent || "#5d8f6c",
      "--accent-strong": t.primary || "#6fa37f",
      "--accent-soft": t.glowSoft || "rgba(93,143,108,0.12)",
      "--accent-glow": t.glow || "rgba(93,143,108,0.28)",
      "--brand": t.secondary || "#c9b896",
      "--brand-glow": t.glowSoft || "rgba(201,184,150,0.2)",
      "--forest-strong": t.accent || "#5d8f6c",
      "--forest-glow": t.glow || "rgba(93,143,108,0.28)",
    };
  }

  const FALLBACK_THEME = buildThemeFromRgbSet(
    {
      primary: { r: 74, g: 115, b: 88 },
      secondary: { r: 201, g: 184, b: 150 },
      accent: { r: 93, g: 143, b: 108 },
      deep: { r: 24, g: 28, b: 26 },
    },
    "",
    "fallback"
  );

  function buildThemeFromAlbum(album) {
    if (!album) return { ...FALLBACK_THEME };
    const a = hexToRgb(album.from) || { r: 36, g: 36, b: 44 };
    const b = hexToRgb(album.to) || { r: 72, g: 56, b: 88 };
    const primary = { r: (a.r + b.r) / 2, g: (a.g + b.g) / 2, b: (a.b + b.b) / 2 };
    const accent = b;
    const secondary = a;
    const deep = mixRgb(primary, { r: 6, g: 6, b: 10 }, 0.65);
    return buildThemeFromRgbSet({ primary, secondary, accent, deep }, album.id, "gradient");
  }

  function extractFromImage(img, albumId) {
    const data = sampleImageData(img);
    if (!data) return null;
    const buckets = bucketColors(data);
    const set = pickPaletteFromBuckets(buckets);
    if (!set) return null;
    return buildThemeFromRgbSet(set, albumId, "cover");
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject(new Error("no url"));
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image load failed"));
      img.src = url;
    });
  }

  function readCache(albumId) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + albumId);
      if (!raw) return null;
      const t = JSON.parse(raw);
      if (!t || t.version !== VERSION) return null;
      t.css = themeToCssVars(t);
      return t;
    } catch (_) {
      return null;
    }
  }

  function writeCache(albumId, theme) {
    try {
      if (!albumId || !theme) return;
      const copy = { ...theme };
      delete copy.css;
      localStorage.setItem(CACHE_PREFIX + albumId, JSON.stringify(copy));
    } catch (_) {}
  }

  function applyToDocument(theme, opts) {
    opts = opts || {};
    const root = document.documentElement;
    const t = theme && theme.css ? theme : buildThemeFromAlbum(null);
    if (!t.css) t.css = themeToCssVars(t);
    root.setAttribute("data-identity-theme", "on");
    if (t.albumId) root.setAttribute("data-identity-album", t.albumId);
    Object.entries(t.css).forEach(([k, v]) => root.style.setProperty(k, v));
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (opts.animate !== false && !reduceMotion) {
      root.classList.add("sl-identity-transition");
      window.setTimeout(() => root.classList.remove("sl-identity-transition"), 720);
    }
  }

  function clearFromDocument() {
    const root = document.documentElement;
    root.removeAttribute("data-identity-theme");
    root.removeAttribute("data-identity-album");
    const keys = [
      "--id-hue",
      "--id-primary",
      "--id-secondary",
      "--id-accent",
      "--id-bg-from",
      "--id-bg-to",
      "--id-card",
      "--id-text",
      "--id-text-muted",
      "--id-glow",
      "--id-glow-soft",
      "--ph",
      "--pf-magenta",
      "--pf-glow",
      "--pf-glow-soft",
      "--accent",
      "--accent-strong",
      "--accent-soft",
      "--accent-glow",
      "--brand",
      "--brand-glow",
      "--forest-strong",
      "--forest-glow",
    ];
    keys.forEach((k) => root.style.removeProperty(k));
  }

  async function refineThemeFromAlbumArtwork(album, baseTheme) {
    if (!album) return baseTheme || FALLBACK_THEME;
    const cached = readCache(album.id);
    if (cached) return cached;
    const url = album.artworkUrl || album.artwork_url || "";
    if (!url) return baseTheme || buildThemeFromAlbum(album);
    try {
      const img = await loadImage(url);
      const refined = extractFromImage(img, album.id) || baseTheme || buildThemeFromAlbum(album);
      writeCache(album.id, refined);
      return refined;
    } catch (_) {
      return baseTheme || buildThemeFromAlbum(album);
    }
  }

  function parseFavoriteFromSettings(settings) {
    if (!settings || typeof settings !== "object") return null;
    const fav = settings.favoriteAlbum || settings.favorite_album;
    if (!fav || typeof fav !== "object") return null;
    if (!fav.albumId) return null;
    return {
      albumId: String(fav.albumId),
      trackTitle: fav.trackTitle ? String(fav.trackTitle) : "",
      theme: fav.theme && typeof fav.theme === "object" ? fav.theme : null,
      savedAt: fav.savedAt || fav.updatedAt || null,
    };
  }

  function favoriteToSettingsPayload(favorite) {
    return {
      favoriteAlbum: {
        albumId: favorite.albumId,
        trackTitle: favorite.trackTitle || "",
        theme: favorite.theme || null,
        savedAt: favorite.savedAt || new Date().toISOString(),
      },
    };
  }

  window.SLThemeEngine = {
    VERSION,
    FALLBACK_THEME,
    buildThemeFromAlbum,
    refineThemeFromAlbumArtwork,
    applyToDocument,
    clearFromDocument,
    themeToCssVars,
    parseFavoriteFromSettings,
    favoriteToSettingsPayload,
    readCache,
  };
})();
