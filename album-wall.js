/* Soundlog — Album Wall (profile banner collage) */
(function () {
  "use strict";

  const MAX_WALL = 10;
  let deps = null;
  let activeHoverId = null;
  let wallCardOpen = false;

  function d() {
    return deps;
  }

  /** Asymmetrical poster positions (% of stage). Tuned for organic collage. */
  const LAYOUT_PRESETS = {
    1: [{ x: 36, y: 28, w: 28, rot: -2, z: 2, scale: 1.08 }],
    2: [
      { x: 8, y: 22, w: 24, rot: -7, z: 2 },
      { x: 52, y: 18, w: 26, rot: 5, z: 3, scale: 1.05 },
    ],
    3: [
      { x: 4, y: 38, w: 20, rot: -9, z: 1 },
      { x: 32, y: 12, w: 28, rot: 3, z: 3, scale: 1.1 },
      { x: 62, y: 32, w: 22, rot: 8, z: 2 },
    ],
    4: [
      { x: 2, y: 18, w: 18, rot: -6, z: 1 },
      { x: 22, y: 42, w: 20, rot: 4, z: 2 },
      { x: 44, y: 8, w: 24, rot: -3, z: 4, scale: 1.06 },
      { x: 68, y: 36, w: 20, rot: 9, z: 2 },
    ],
    5: [
      { x: 0, y: 32, w: 17, rot: -8, z: 1 },
      { x: 16, y: 10, w: 19, rot: 5, z: 2 },
      { x: 36, y: 38, w: 18, rot: -4, z: 2 },
      { x: 52, y: 6, w: 22, rot: 2, z: 4, scale: 1.08 },
      { x: 72, y: 28, w: 18, rot: 10, z: 3 },
    ],
    6: [
      { x: 0, y: 48, w: 15, rot: -5, z: 1 },
      { x: 8, y: 14, w: 17, rot: 7, z: 2 },
      { x: 26, y: 36, w: 16, rot: -9, z: 2 },
      { x: 42, y: 8, w: 20, rot: 3, z: 4, scale: 1.06 },
      { x: 58, y: 40, w: 16, rot: 6, z: 2 },
      { x: 74, y: 16, w: 17, rot: -4, z: 3 },
    ],
    7: [
      { x: 0, y: 22, w: 14, rot: -7, z: 1 },
      { x: 10, y: 48, w: 14, rot: 5, z: 1 },
      { x: 22, y: 12, w: 16, rot: 8, z: 2 },
      { x: 38, y: 38, w: 15, rot: -5, z: 2 },
      { x: 50, y: 6, w: 19, rot: 2, z: 4, scale: 1.05 },
      { x: 66, y: 32, w: 15, rot: 9, z: 3 },
      { x: 80, y: 14, w: 14, rot: -6, z: 2 },
    ],
    8: [
      { x: 0, y: 38, w: 13, rot: -4, z: 1 },
      { x: 6, y: 12, w: 14, rot: 7, z: 2 },
      { x: 20, y: 50, w: 13, rot: -8, z: 1 },
      { x: 32, y: 18, w: 15, rot: 4, z: 3 },
      { x: 46, y: 42, w: 14, rot: -3, z: 2 },
      { x: 54, y: 4, w: 18, rot: 1, z: 5, scale: 1.06 },
      { x: 70, y: 28, w: 14, rot: 10, z: 3 },
      { x: 82, y: 48, w: 13, rot: -5, z: 2 },
    ],
    9: [
      { x: 0, y: 16, w: 12, rot: -6, z: 1 },
      { x: 4, y: 44, w: 12, rot: 4, z: 1 },
      { x: 16, y: 28, w: 13, rot: -9, z: 2 },
      { x: 28, y: 8, w: 14, rot: 6, z: 3 },
      { x: 40, y: 46, w: 12, rot: -3, z: 2 },
      { x: 50, y: 20, w: 15, rot: 2, z: 4 },
      { x: 62, y: 4, w: 16, rot: -2, z: 5, scale: 1.05 },
      { x: 74, y: 36, w: 13, rot: 8, z: 3 },
      { x: 86, y: 18, w: 12, rot: -4, z: 2 },
    ],
    10: [
      { x: 0, y: 32, w: 11, rot: -7, z: 1 },
      { x: 2, y: 52, w: 11, rot: 5, z: 1 },
      { x: 12, y: 14, w: 12, rot: 8, z: 2 },
      { x: 22, y: 40, w: 11, rot: -5, z: 2 },
      { x: 32, y: 6, w: 13, rot: 3, z: 3 },
      { x: 44, y: 48, w: 11, rot: -4, z: 2 },
      { x: 52, y: 22, w: 14, rot: 1, z: 4 },
      { x: 64, y: 4, w: 15, rot: -2, z: 5, scale: 1.08 },
      { x: 76, y: 34, w: 12, rot: 9, z: 3 },
      { x: 86, y: 14, w: 11, rot: -6, z: 2 },
    ],
  };

  function layoutForCount(n) {
    const c = Math.max(1, Math.min(MAX_WALL, n));
    return LAYOUT_PRESETS[c] || LAYOUT_PRESETS[10];
  }

  function hashRot(id, seed) {
    let h = seed;
    const s = String(id || "");
    for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) | 0;
    return ((h % 7) - 3) * 0.4;
  }

  function posterStyle(slot, albumId, isPinned) {
    const rot = slot.rot + hashRot(albumId, 42);
    const scale = slot.scale || 1;
    const w = slot.w * scale * (isPinned ? 1.12 : 1);
    return (
      "--aw-x:" +
      slot.x +
      "%;--aw-y:" +
      slot.y +
      "%;--aw-w:" +
      w +
      "%;--aw-rot:" +
      rot +
      "deg;--aw-z:" +
      (isPinned ? 12 : slot.z) +
      ";"
    );
  }

  function listeningStatsForAlbum(uid, albumId) {
    const x = d();
    const rows = x.state.listenings.filter((l) => l.userId === uid && l.albumId === albumId);
    if (!rows.length) return null;
    const rated = rows.filter((l) => l.rating);
    const avg =
      rated.length === 0
        ? null
        : (rated.reduce((a, l) => a + l.rating, 0) / rated.length).toFixed(1);
    const review = rows.find((l) => l.review && String(l.review).trim());
    return { count: rows.length, avg, review: review ? String(review.review).trim() : "" };
  }

  function renderHero(opts) {
    opts = opts || {};
    const x = d();
    const uid = opts.uid || "me";
    const isMe = !!opts.isMe;
    const items = opts.items || [];
    const pinnedId = opts.pinnedId || "";
    const empty = !items.length;

    if (empty) {
      const cta = isMe
        ? '<p class="album-wall__empty-actions"><button type="button" class="btn btn-primary btn-sm" id="btn-wall-edit">Créer mon mur d’albums</button></p>'
        : "";
      return (
        '<section class="album-wall album-wall--empty" aria-label="Mur d’albums">' +
        '<div class="album-wall__ambient album-wall__ambient--default" aria-hidden="true"></div>' +
        '<div class="album-wall__grain" aria-hidden="true"></div>' +
        '<div class="album-wall__empty-inner">' +
        '<p class="album-wall__kicker">Album Wall</p>' +
        '<h2 class="album-wall__empty-title">Mur musical vide</h2>' +
        '<p class="feed-note">Les pochettes de tes albums préférés composeront ta bannière.</p>' +
        cta +
        "</div></section>"
      );
    }

    const slots = layoutForCount(items.length);
    const posters = items
      .map((it, i) => {
        const al = it.album;
        if (!al) return "";
        const slot = slots[i] || slots[slots.length - 1];
        const isPinned = al.id === pinnedId;
        const meta = it.meta || {};
        const stats = it.stats;
        const pinBadge = isPinned ? '<span class="album-wall__pin" title="Album épinglé">★</span>' : "";
        const statsHint = stats && stats.avg ? '<span class="album-wall__rating">' + x.escapeHtml(stats.avg) + "</span>" : "";
        return (
          '<button type="button" class="album-wall__poster' +
          (isPinned ? " album-wall__poster--pinned" : "") +
          '" style="' +
          posterStyle(slot, al.id, isPinned) +
          '" data-wall-album="' +
          x.escapeHtml(al.id) +
          '" data-preview-album="' +
          x.escapeHtml(al.id) +
          '" aria-label="' +
          x.escapeHtml(al.title + " — " + al.artist) +
          '">' +
          pinBadge +
          statsHint +
          '<span class="album-wall__poster-frame">' +
          x.coverHtml(al, true, "wall") +
          '<span class="album-wall__shine" aria-hidden="true"></span></span>' +
          '<span class="album-wall__shadow" aria-hidden="true"></span>' +
          '<span class="album-wall__eq" hidden aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
          "</button>"
        );
      })
      .join("");

    const tools = isMe
      ? '<div class="album-wall__tools">' +
        '<button type="button" class="btn btn-ghost btn-sm" id="btn-wall-edit">Éditer le mur</button> ' +
        '<button type="button" class="btn btn-ghost btn-sm" id="btn-wall-share">Partager</button>' +
        "</div>"
      : '<button type="button" class="btn btn-ghost btn-sm album-wall__tools album-wall__tools--solo" id="btn-wall-share">Partager le mur</button>';

    const html =
      '<section class="album-wall" data-wall-user="' +
      x.escapeHtml(uid) +
      '" aria-label="Mur d’albums — Top ' +
      items.length +
      '">' +
      '<div class="album-wall__ambient" data-wall-ambient aria-hidden="true"></div>' +
      '<div class="album-wall__grain" aria-hidden="true"></div>' +
      '<div class="album-wall__vignette" aria-hidden="true"></div>' +
      '<div class="album-wall__stage">' +
      posters +
      "</div>" +
      tools +
      "</section>";

    return html;
  }

  function setAmbientFromPoster(btn) {
    const ambient = document.querySelector(".album-wall__ambient[data-wall-ambient]");
    if (!ambient || !btn) return;
    const img = btn.querySelector("img");
    const aid = btn.getAttribute("data-wall-album");
    activeHoverId = aid;
    ambient.dataset.wallHover = aid || "";
    if (img && img.src) {
      ambient.style.backgroundImage = "url(" + JSON.stringify(img.src) + ")";
      ambient.classList.add("is-live");
    }
    document.querySelectorAll(".album-wall__poster").forEach((p) => {
      p.classList.toggle("is-dimmed", p !== btn && !!aid);
    });
  }

  function clearAmbient() {
    activeHoverId = null;
    const ambient = document.querySelector(".album-wall__ambient[data-wall-ambient]");
    if (ambient) {
      ambient.classList.remove("is-live");
      ambient.removeAttribute("data-wall-hover");
    }
    document.querySelectorAll(".album-wall__poster").forEach((p) => p.classList.remove("is-dimmed"));
  }

  function syncWallPlayingUi(albumId, playing) {
    document.querySelectorAll(".album-wall__poster[data-wall-album]").forEach((p) => {
      const id = p.getAttribute("data-wall-album");
      const on = playing && id === albumId;
      p.classList.toggle("is-playing", on);
      p.classList.toggle("is-glow", on);
      const eq = p.querySelector(".album-wall__eq");
      if (eq) eq.hidden = !on;
    });
    const card = document.getElementById("wall-card-root");
    if (card) {
      card.classList.toggle("is-playing", !!playing);
      const btn = card.querySelector("[data-wall-card-play]");
      if (btn) {
        btn.classList.toggle("is-playing", !!playing);
        btn.textContent = playing ? "Pause" : "Écouter un extrait";
      }
    }
    if (playing && albumId) setAmbientFromPoster(document.querySelector('[data-wall-album="' + albumId + '"]'));
  }

  function openWallCard(albumId, uid) {
    const x = d();
    const al = x.albumById(albumId);
    if (!al) return;
    wallCardOpen = true;
    const meta = (x.getWallEntryMeta && x.getWallEntryMeta(uid, albumId)) || {};
    const stats = listeningStatsForAlbum(uid === "me" ? "me" : uid, albumId);
    const pinned = x.getWallPinnedId && x.getWallPinnedId(uid) === albumId;

    const html =
      '<div class="wall-card" id="wall-card-root" data-preview-album="' +
        x.escapeHtml(albumId) +
        '">' +
        '<button type="button" class="wall-card__close" id="wall-card-close" aria-label="Fermer">×</button>' +
        '<div class="wall-card__layout">' +
        '<div class="wall-card__cover">' +
        x.coverHtml(al, false, "lg") +
        '<div class="wall-card__eq" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>' +
        "</div>" +
        '<div class="wall-card__body">' +
        (pinned ? '<p class="wall-card__badge">★ Album épinglé</p>' : "") +
        "<h2>" +
        x.escapeHtml(al.title) +
        "</h2>" +
        '<p class="wall-card__artist">' +
        x.escapeHtml(al.artist) +
        (al.year ? " · " + al.year : "") +
        (al.genre ? " · " + x.escapeHtml(al.genre) : "") +
        "</p>" +
        (meta.trackTitle
          ? '<p class="wall-card__track">Morceau favori · <em>' + x.escapeHtml(meta.trackTitle) + "</em></p>"
          : "") +
        (stats && stats.avg
          ? '<p class="feed-note">Noté ' + x.escapeHtml(stats.avg) + "/5 · " + stats.count + " écoute(s)</p>"
          : "") +
        (meta.note ? '<p class="wall-card__note">' + x.escapeHtml(meta.note) + "</p>" : "") +
        (stats && stats.review ? '<blockquote class="wall-card__review">' + x.escapeHtml(stats.review) + "</blockquote>" : "") +
        '<div class="wall-card__actions">' +
        '<button type="button" class="btn btn-primary" data-wall-card-play="' +
        x.escapeHtml(albumId) +
        '">Écouter un extrait</button> ' +
        '<button type="button" class="btn btn-ghost btn-sm" data-album="' +
        x.escapeHtml(albumId) +
        '">Fiche album</button>' +
        "</div>" +
        '<p class="feed-note wall-card__hint" data-preview-note></p>' +
        "</div></div></div>";

    x.openModal(html, { variant: "wall-card" });
    document.getElementById("wall-card-close")?.addEventListener("click", () => {
      x.stopAlbumPreview && x.stopAlbumPreview();
      x.closeModal();
      wallCardOpen = false;
    });
    document.querySelector("[data-wall-card-play]")?.addEventListener("click", () => {
      if (x.playAlbumPreview) void x.playAlbumPreview(albumId);
    });
  }

  function openEditor(opts) {
    opts = opts || {};
    const x = d();
    const wall = x.getAlbumWallForUser("me") || { albumIds: [], pinnedId: "", entries: {} };
    let ids = [...(wall.albumIds || [])].slice(0, MAX_WALL);
    let pinnedId = wall.pinnedId || "";
    let searchResults = [];
    let searchTimer = null;
    let searchReq = 0;

    function rowHtml(r, idx) {
      const art = r.artworkUrl
        ? '<img src="' + x.escapeHtml(r.artworkUrl) + '" alt="" loading="lazy" />'
        : "♪";
      return (
        '<button type="button" class="wall-edit__hit" data-wall-hit="' +
        idx +
        '">' +
        art +
        " " +
        x.escapeHtml(r.title) +
        " — " +
        x.escapeHtml(r.artist) +
        "</button>"
      );
    }

    function paintList() {
      const el = document.getElementById("wall-edit-list");
      if (!el) return;
      if (!ids.length) {
        el.innerHTML = '<p class="feed-note">Aucun album — ajoute-en via la recherche.</p>';
        return;
      }
      el.innerHTML = ids
        .map((id, i) => {
          const al = x.albumById(id);
          if (!al) return "";
          const pin = id === pinnedId ? " ★" : "";
          return (
            '<div class="wall-edit__row" data-wall-row="' +
            i +
            '">' +
            '<span class="wall-edit__rank">' +
            (i + 1) +
            pin +
            "</span>" +
            x.coverHtml(al, true, "sm") +
            '<span class="wall-edit__meta"><strong>' +
            x.escapeHtml(al.title) +
            "</strong><br>" +
            x.escapeHtml(al.artist) +
            "</span>" +
            '<span class="wall-edit__row-actions">' +
            '<button type="button" class="btn btn-ghost btn-sm" data-wall-up="' +
            i +
            '" title="Monter">↑</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-wall-down="' +
            i +
            '" title="Descendre">↓</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-wall-pin="' +
            x.escapeHtml(id) +
            '">Épingler</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-wall-remove="' +
            i +
            '">×</button>' +
            "</span></div>"
          );
        })
        .join("");
      wireList();
    }

    function wireList() {
      document.querySelectorAll("[data-wall-up]").forEach((btn) => {
        btn.onclick = () => {
          const i = parseInt(btn.getAttribute("data-wall-up"), 10);
          if (i <= 0) return;
          const t = ids[i];
          ids[i] = ids[i - 1];
          ids[i - 1] = t;
          paintList();
        };
      });
      document.querySelectorAll("[data-wall-down]").forEach((btn) => {
        btn.onclick = () => {
          const i = parseInt(btn.getAttribute("data-wall-down"), 10);
          if (i >= ids.length - 1) return;
          const t = ids[i];
          ids[i] = ids[i + 1];
          ids[i + 1] = t;
          paintList();
        };
      });
      document.querySelectorAll("[data-wall-pin]").forEach((btn) => {
        btn.onclick = () => {
          pinnedId = btn.getAttribute("data-wall-pin") || "";
          paintList();
        };
      });
      document.querySelectorAll("[data-wall-remove]").forEach((btn) => {
        btn.onclick = () => {
          const i = parseInt(btn.getAttribute("data-wall-remove"), 10);
          const removed = ids[i];
          ids.splice(i, 1);
          if (pinnedId === removed) pinnedId = ids[0] || "";
          paintList();
        };
      });
    }

    async function runSearch(q) {
      if (!window.SLMusicSearch) return;
      const query = String(q || "").trim();
      const box = document.getElementById("wall-edit-hits");
      if (!box) return;
      if (query.length < 2) {
        box.innerHTML = "";
        return;
      }
      const req = ++searchReq;
      box.innerHTML = '<p class="feed-note">Recherche…</p>';
      const data = await window.SLMusicSearch.search(query, { localAlbums: x.allAlbums() });
      if (req !== searchReq) return;
      searchResults = (data.results || []).filter((r) => r.type === "album" || r.type === "single" || r.type === "ep");
      if (!searchResults.length) {
        box.innerHTML = '<p class="feed-note">Aucun résultat.</p>';
        return;
      }
      box.innerHTML = searchResults
        .slice(0, 20)
        .map((r, i) => rowHtml(r, i))
        .join("");
      document.querySelectorAll("[data-wall-hit]").forEach((btn) => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute("data-wall-hit"), 10);
          const r = searchResults[idx];
          if (!r) return;
          const hit = x.catalogHitFromResult(r);
          const aid = x.upsertAlbumFromRemoteHit(hit);
          if (!aid) return x.toast("Impossible d’ajouter.");
          if (ids.includes(aid)) return x.toast("Déjà dans le mur.");
          if (ids.length >= MAX_WALL) return x.toast("Maximum " + MAX_WALL + " albums.");
          ids.push(aid);
          if (!pinnedId) pinnedId = aid;
          paintList();
        };
      });
    }

    const html =
      '<div class="wall-edit">' +
      "<h2>Mur d’albums</h2>" +
      '<p class="feed-note">Jusqu’à ' +
      MAX_WALL +
      " pochettes — l’ordre compte. Épingle ton album signature.</p>" +
      '<div id="wall-edit-list" class="wall-edit__list"></div>' +
      '<label class="wall-edit__search-label">Ajouter un album</label>' +
      '<input type="search" class="wall-edit__search" id="wall-edit-q" placeholder="Rechercher…" />' +
      '<div id="wall-edit-hits" class="wall-edit__hits"></div>' +
      '<p class="modal-actions">' +
      '<button type="button" class="btn btn-primary" id="wall-edit-save">Enregistrer</button> ' +
      '<button type="button" class="btn btn-ghost" id="wall-edit-cancel">Annuler</button>' +
      "</p></div>";

    x.openModal(html, { variant: "wall-edit" });
    paintList();
    document.getElementById("wall-edit-cancel")?.addEventListener("click", () => x.closeModal());
    document.getElementById("wall-edit-save")?.addEventListener("click", async () => {
      try {
        await x.saveAlbumWall(ids, pinnedId, wall.entries || {});
        x.closeModal();
        x.render();
        x.toast("Mur d’albums enregistré.");
      } catch (e) {
        x.toast(e.message || "Erreur");
      }
    });
    const inp = document.getElementById("wall-edit-q");
    inp?.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => runSearch(inp.value), 220);
    });
  }

  function bind(root) {
    if (!root) return;
    const wall = root.querySelector(".album-wall");
    if (!wall || wall.dataset.wallBound) return;
    wall.dataset.wallBound = "1";

    wall.querySelectorAll(".album-wall__poster").forEach((btn) => {
      btn.addEventListener("mouseenter", () => setAmbientFromPoster(btn));
      btn.addEventListener("focus", () => setAmbientFromPoster(btn));
      btn.addEventListener("mouseleave", () => {
        if (!wallCardOpen && !btn.classList.contains("is-playing")) clearAmbient();
      });
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-wall-album");
        const uid = wall.getAttribute("data-wall-user") || "me";
        openWallCard(id, uid);
      });
    });

    wall.addEventListener("mouseleave", () => {
      if (!wallCardOpen) clearAmbient();
    });

    document.getElementById("btn-wall-edit")?.addEventListener("click", () => openEditor());
    document.getElementById("btn-wall-share")?.addEventListener("click", async () => {
      const uid = wall.getAttribute("data-wall-user") || "me";
      const url = x.inviteBaseUrl() + "#profil/" + encodeURIComponent(uid);
      const text = "Mon mur d’albums sur Soundlog";
      try {
        if (navigator.share) await navigator.share({ title: "Soundlog Album Wall", text, url });
        else {
          await navigator.clipboard.writeText(text + "\n" + url);
          x.toast("Lien copié.");
        }
      } catch (_) {
        x.toast(url);
      }
    });
  }

  function install(dep) {
    deps = dep;
  }

  window.SLAlbumWall = {
    MAX_WALL,
    install,
    renderHero,
    bind,
    openEditor,
    syncWallPlayingUi,
    stopOnNavigate() {
      wallCardOpen = false;
      clearAmbient();
      if (d() && d().stopAlbumPreview) d().stopAlbumPreview();
    },
  };
})();
