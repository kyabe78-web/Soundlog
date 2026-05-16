/**
 * Modal premium « Logger une écoute » — recherche multi-sources + composition.
 */
(function () {
  "use strict";

  /** @type {Record<string, Function>} */
  let d = null;

  const RECENTS_KEY = "soundlog.logListenRecents";
  const RECENTS_MAX = 8;

  function loadRecents() {
    try {
      return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function pushRecent(result) {
    if (!result) return;
    const item = {
      uid: result.uid,
      title: result.title,
      artist: result.artist,
      type: result.type,
      artworkUrl: result.artworkUrl || "",
      localAlbumId: result.localAlbumId || null,
      importPayload: result.importPayload || null,
    };
    let arr = loadRecents().filter((x) => x.uid !== item.uid);
    arr.unshift(item);
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(arr.slice(0, RECENTS_MAX)));
    } catch (_) {}
  }

  function catalogHitFromResult(result) {
    const p = result.importPayload || {};
    const title = p.title || result.title;
    const artist = p.artist || result.artist || "";
    const links = d.buildPlatformLinks(artist, title, null);
    if (p.deezer) links.deezer = p.deezer;
    if (p.apple) links.apple = p.apple;
    let genre = result.genres && result.genres[0] ? result.genres[0] : "Catalogue";
    if (result.type === "playlist") genre = "Playlist";
    if (result.type === "artist") genre = "Artiste";
    if (result.type === "single") genre = "Single";
    return {
      title,
      artist,
      year: p.year || result.year || new Date().getFullYear(),
      artworkUrl: p.artworkUrl || result.artworkUrl || "",
      links,
      appleCollectionId: p.appleCollectionId || null,
      deezerAlbumId: p.deezerAlbumId || null,
      musicbrainzReleaseId: p.musicbrainzId || p.musicbrainzReleaseId || null,
      genre,
    };
  }

  function resolveToAlbumId(result) {
    if (!result) return null;
    if (result.localAlbumId) return result.localAlbumId;
    if (!result.importPayload && result.type !== "artist") return null;
    return d.upsertAlbumFromRemoteHit(catalogHitFromResult(result));
  }

  function open(editId, presetAlbumId) {
    if (!d) return;
    const existing = editId ? d.state.listenings.find((l) => l.id === editId) : null;
    const presetAl = presetAlbumId ? d.albumById(presetAlbumId) : null;
    const today = new Date().toISOString().slice(0, 10);

    let searchResults = [];
    let activeIndex = -1;
    let typeFilter = "all";
    let searchTimer = null;
    let searchReq = 0;
    let selectedAlbumId = presetAlbumId || (existing && existing.albumId) || null;
    let composing = !!(presetAl || existing);

    function filtered() {
      if (typeFilter === "all") return searchResults;
      return searchResults.filter((r) => r.type === typeFilter);
    }

    function rowHtml(r, idx) {
      const art = r.artworkUrl
        ? `<img src="${d.escapeHtml(r.artworkUrl)}" alt="" loading="lazy" decoding="async" />`
        : `<span class="log-listen__cover-ph">♪</span>`;
      const dur =
        r.durationMs && window.SLMusicSearch ? window.SLMusicSearch.formatDuration(r.durationMs) : "";
      const sub = [r.artist, r.year].filter(Boolean).join(" · ");
      const genre = r.genres && r.genres[0] ? d.escapeHtml(r.genres[0]) : "";
      return `<button type="button" class="log-listen__row${idx === activeIndex ? " is-active" : ""}" data-ml-idx="${idx}">
        <span class="log-listen__cover">${art}</span>
        <span class="log-listen__meta">
          <p class="log-listen__meta-title">${d.escapeHtml(r.title)}</p>
          <p class="log-listen__meta-sub">${d.escapeHtml(sub)}</p>
          <span class="log-listen__badges">
            <span class="log-listen__badge log-listen__badge--type">${d.escapeHtml(r.typeLabel || r.type)}</span>
            <span class="log-listen__badge">${d.escapeHtml(r.platform || "")}</span>
            ${genre ? `<span class="log-listen__badge">${genre}</span>` : ""}
            ${dur ? `<span class="log-listen__badge">${dur}</span>` : ""}
          </span>
        </span>
      </button>`;
    }

    function paintResults(html, loading) {
      const el = document.getElementById("ml-results");
      if (!el) return;
      el.innerHTML = loading ? `<p class="log-listen__loading">Recherche en cours</p>` : html || "";
    }

    function paintCompose() {
      const body = document.getElementById("ml-body");
      const compose = document.getElementById("ml-compose");
      if (!body || !compose) return;
      const show = composing && selectedAlbumId;
      compose.hidden = !show;
      body.classList.toggle("log-listen__body--split", !!show);
      const preview = document.getElementById("ml-preview");
      if (!show || !preview) return;
      const al = d.albumById(selectedAlbumId);
      if (!al) return;
      preview.innerHTML = `${d.coverHtml(al, false, "md")}
        <div>
          <h3 class="log-listen__preview-title">${d.escapeHtml(al.title)}</h3>
          <p class="log-listen__preview-artist">${d.escapeHtml(al.artist)}${al.year ? " · " + al.year : ""}${al.genre ? " · " + d.escapeHtml(al.genre) : ""}</p>
          <button type="button" class="btn btn-ghost btn-sm log-listen__change" id="ml-change">Changer de titre</button>
        </div>`;
      document.getElementById("ml-change")?.addEventListener("click", () => {
        composing = false;
        selectedAlbumId = null;
        paintCompose();
        document.getElementById("ml-q")?.focus();
      });
      if (typeof d.applyAlbumBackdropTint === "function") d.applyAlbumBackdropTint();
    }

    async function runSearch(q) {
      if (!window.SLMusicSearch) {
        paintResults(`<p class="log-listen__empty">Recherche indisponible.</p>`);
        return;
      }
      const query = String(q || "").trim();
      if (query.length < 2) {
        const recents = loadRecents();
        if (!recents.length) {
          paintResults(`<p class="log-listen__empty">Tape au moins 2 caractères.</p>`);
          return;
        }
        searchResults = recents.map((r) => ({
          uid: r.uid,
          title: r.title,
          artist: r.artist,
          type: r.type,
          typeLabel: r.type,
          artworkUrl: r.artworkUrl,
          localAlbumId: r.localAlbumId,
          importPayload: r.importPayload,
          platform: "Récent",
          sources: ["local"],
        }));
        activeIndex = 0;
        paintResults(
          `<p class="log-listen__section-label">Récents</p>` + filtered().map((r, i) => rowHtml(r, i)).join("")
        );
        wireResultClicks();
        return;
      }
      const req = ++searchReq;
      paintResults("", true);
      d.musicCountry();
      const data = await window.SLMusicSearch.search(query, { localAlbums: d.allAlbums() });
      if (req !== searchReq) return;
      searchResults = data.results || [];
      activeIndex = searchResults.length ? 0 : -1;
      if (!searchResults.length) {
        paintResults(`<p class="log-listen__empty">${d.escapeHtml(data.error || "Aucun résultat.")}</p>`);
        return;
      }
      const local = searchResults.filter((r) => (r.sources || []).includes("local"));
      const remote = searchResults.filter((r) => !(r.sources || []).includes("local"));
      let html = "";
      if (local.length) {
        html += `<p class="log-listen__section-label">Ton carnet</p>`;
        html += local.map((r) => rowHtml(r, searchResults.indexOf(r))).join("");
      }
      if (remote.length) {
        html += `<p class="log-listen__section-label">Catalogues en ligne</p>`;
        html += remote.slice(0, 40).map((r) => rowHtml(r, searchResults.indexOf(r))).join("");
      }
      paintResults(html);
      wireResultClicks();
    }

    function selectAt(idx) {
      const list = filtered();
      const r = list[idx];
      if (!r) return;
      pushRecent(r);
      selectedAlbumId = resolveToAlbumId(r);
      if (!selectedAlbumId) {
        d.toast("Impossible d’ajouter cette entrée.");
        return;
      }
      composing = true;
      paintCompose();
    }

    function wireResultClicks() {
      document.querySelectorAll("[data-ml-idx]").forEach((btn) => {
        btn.addEventListener("click", () => selectAt(parseInt(btn.getAttribute("data-ml-idx"), 10)));
      });
    }

    const spotifyHint =
      window.SLCloud &&
      window.SLCloud.spotify &&
      window.SLCloud.spotify.hasToken &&
      window.SLCloud.spotify.hasToken()
        ? ", Spotify"
        : "";

    const html = `<div class="log-listen">
      <header class="log-listen__head">
        <div>
          <h2 class="log-listen__title">${existing ? "Modifier l’écoute" : "Logger une écoute"}</h2>
          <p class="log-listen__sub">Apple Music · Deezer · MusicBrainz · Last.fm${spotifyHint}</p>
        </div>
        <button type="button" class="log-listen__close" id="ml-close" aria-label="Fermer">×</button>
      </header>
      <div class="log-listen__body${composing ? " log-listen__body--split" : ""}" id="ml-body">
        <div class="log-listen__search">
          <div class="log-listen__search-bar">
            <div class="log-listen__input-wrap">
              <span class="log-listen__input-icon" aria-hidden="true">⌕</span>
              <input type="search" class="log-listen__input" id="ml-q" placeholder="Album, single, EP, playlist, artiste…" autocomplete="off" />
            </div>
            <div class="log-listen__filters">
              ${["all", "album", "single", "ep", "playlist", "artist"]
                .map((t) => {
                  const label =
                    t === "all"
                      ? "Tout"
                      : t === "single"
                        ? "Singles"
                        : t === "ep"
                          ? "EP"
                          : t.charAt(0).toUpperCase() + t.slice(1) + (t === "album" ? "s" : "");
                  return `<button type="button" class="log-listen__filter${typeFilter === t ? " is-active" : ""}" data-ml-type="${t}">${label}</button>`;
                })
                .join("")}
            </div>
          </div>
          <div class="log-listen__results" id="ml-results" role="listbox"></div>
        </div>
        <div class="log-listen__compose" id="ml-compose" ${composing ? "" : "hidden"}>
          <div class="log-listen__preview" id="ml-preview"></div>
          <div class="log-listen__field"><label for="ml-date">Date</label><input type="date" id="ml-date" value="${existing ? existing.date : today}" /></div>
          <div class="log-listen__field"><label>Note</label><div class="star-picker" id="ml-stars"></div><input type="hidden" id="ml-rating" value="${existing ? existing.rating : 4}" /></div>
          <div class="log-listen__field"><label for="ml-review">Critique</label><textarea id="ml-review" rows="4" placeholder="Ton avis…">${existing && existing.review ? d.escapeHtml(existing.review) : ""}</textarea></div>
          <div class="log-listen__actions">
            <button type="button" class="btn btn-primary" id="ml-save">${existing ? "Mettre à jour" : "Enregistrer"}</button>
            <button type="button" class="btn btn-ghost" id="ml-cancel">Annuler</button>
          </div>
        </div>
      </div>
    </div>`;

    d.openModal(html, { variant: "log-listen" });

    const qEl = document.getElementById("ml-q");
    const hid = document.getElementById("ml-rating");
    const wrap = document.getElementById("ml-stars");
    const steps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

    function paintStars() {
      const r = parseFloat(hid.value, 10);
      wrap.innerHTML = steps
        .map(
          (s) =>
            `<button type="button" data-s="${s}" class="${r >= s ? "on" : ""}">${s % 1 ? "½" : Math.floor(s)}</button>`
        )
        .join("");
      wrap.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          hid.value = btn.getAttribute("data-s");
          paintStars();
        });
      });
    }
    paintStars();
    paintCompose();

    document.getElementById("ml-close")?.addEventListener("click", () => d.closeModal());
    document.getElementById("ml-cancel")?.addEventListener("click", () => d.closeModal());

    document.querySelectorAll("[data-ml-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        typeFilter = btn.getAttribute("data-ml-type");
        document.querySelectorAll("[data-ml-type]").forEach((b) => b.classList.toggle("is-active", b === btn));
        const list = filtered();
        activeIndex = list.length ? 0 : -1;
        if (!list.length) {
          paintResults(`<p class="log-listen__empty">Aucun résultat pour ce filtre.</p>`);
          return;
        }
        paintResults(list.map((r, i) => rowHtml(r, i)).join(""));
        wireResultClicks();
      });
    });

    qEl?.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => runSearch(qEl.value), 220);
    });

    const keyHandler = (e) => {
      if (!document.querySelector(".log-listen")) return;
      const list = filtered();
      if (e.key === "Escape") {
        e.preventDefault();
        d.closeModal();
        return;
      }
      if (!list.length || composing) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, list.length - 1);
        paintResults(list.map((r, i) => rowHtml(r, i)).join(""));
        wireResultClicks();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        paintResults(list.map((r, i) => rowHtml(r, i)).join(""));
        wireResultClicks();
      }
      if (e.key === "Enter" && activeIndex >= 0 && document.activeElement === qEl) {
        e.preventDefault();
        selectAt(activeIndex);
      }
    };
    document.addEventListener("keydown", keyHandler);
    window.__slLogListenCleanup = () => document.removeEventListener("keydown", keyHandler);

    document.getElementById("ml-save")?.addEventListener("click", () => {
      if (!selectedAlbumId) return d.toast("Choisis un album ou une sortie d’abord.");
      const date = document.getElementById("ml-date").value;
      const rating = parseFloat(document.getElementById("ml-rating").value, 10);
      const review = document.getElementById("ml-review").value.trim();
      if (!date) return d.toast("Date requise.");
      if (existing) {
        existing.albumId = selectedAlbumId;
        existing.date = date;
        existing.rating =
          window.SLPersistence && typeof SLPersistence.normalizeRating === "function"
            ? SLPersistence.normalizeRating(rating)
            : rating;
        existing.review = review;
      } else {
        const dup = d.state.listenings.find((l) => l.userId === "me" && l.albumId === selectedAlbumId);
        if (dup) {
          dup.date = date;
          dup.rating =
            window.SLPersistence && typeof SLPersistence.normalizeRating === "function"
              ? SLPersistence.normalizeRating(rating)
              : rating;
          dup.review = review;
        } else {
          const normRating =
            window.SLPersistence && typeof SLPersistence.normalizeRating === "function"
              ? SLPersistence.normalizeRating(rating)
              : rating;
          const newId =
            window.SLPersistence && typeof SLPersistence.generateId === "function"
              ? SLPersistence.generateId()
              : typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : "l" + Date.now();
          d.state.listenings.push({
            id: newId,
            userId: "me",
            albumId: selectedAlbumId,
            date,
            rating: normRating,
            review,
          });
        }
      }
      d.ensureAdaptive();
      d.state.adaptive.listenLogs = (d.state.adaptive.listenLogs || 0) + 1;
      d.persist();
      if (typeof window.__slFlushCloudPush === "function") void window.__slFlushCloudPush();
      d.closeModal();
      d.toast("Écoute enregistrée.");
      d.navigate("carnet", { hubTab: "journal" });
    });

    if (presetAl) runSearch(presetAl.artist + " " + presetAl.title);
    else runSearch("");
    requestAnimationFrame(() => qEl?.focus());
  }

  window.SLLogListen = {
    install(deps) {
      d = deps;
    },
    open,
  };
})();
