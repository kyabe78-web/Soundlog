/* Soundlog — Favorite Album of All Time picker */
(function () {
  "use strict";

  let deps = null;

  function d() {
    return deps;
  }

  function open(opts) {
    opts = opts || {};
    if (!d()) return;
    const current = opts.current || null;
    let searchResults = [];
    let activeIndex = -1;
    let searchTimer = null;
    let searchReq = 0;
    let selectedAlbumId = (current && current.albumId) || null;
    let trackTitle = (current && current.trackTitle) || "";
    let composing = !!selectedAlbumId;

    function filtered() {
      return searchResults.filter((r) => r.type === "album" || r.type === "single" || r.type === "ep");
    }

    function rowHtml(r, idx) {
      const art = r.artworkUrl
        ? `<img src="${d().escapeHtml(r.artworkUrl)}" alt="" loading="lazy" decoding="async" />`
        : `<span class="faat__cover-ph">♪</span>`;
      const sub = [r.artist, r.year].filter(Boolean).join(" · ");
      return `<button type="button" class="faat__row${idx === activeIndex ? " is-active" : ""}" data-faat-idx="${idx}">
        <span class="faat__cover">${art}</span>
        <span class="faat__meta">
          <p class="faat__title">${d().escapeHtml(r.title)}</p>
          <p class="faat__sub">${d().escapeHtml(sub)}</p>
          <span class="faat__badge">${d().escapeHtml(r.typeLabel || r.type || "album")}</span>
        </span>
      </button>`;
    }

    function paintResults(html, loading) {
      const el = document.getElementById("faat-results");
      if (!el) return;
      el.innerHTML = loading ? `<p class="faat__loading"><span class="faat__spinner" aria-hidden="true"></span> Recherche…</p>` : html || "";
    }

    function resolveAlbumId(result) {
      if (!result) return null;
      if (result.localAlbumId) return result.localAlbumId;
      if (!result.importPayload && result.type === "artist") return null;
      const hit = d().catalogHitFromResult(result);
      return d().upsertAlbumFromRemoteHit(hit);
    }

    function paintCompose() {
      const body = document.getElementById("faat-body");
      const compose = document.getElementById("faat-compose");
      if (!body || !compose) return;
      const show = composing && selectedAlbumId;
      compose.hidden = !show;
      body.classList.toggle("faat__body--split", !!show);
      const preview = document.getElementById("faat-preview");
      if (!show || !preview) return;
      const al = d().albumById(selectedAlbumId);
      if (!al) return;
      preview.innerHTML = `${d().coverHtml(al, false, "lg")}
        <div class="faat__preview-copy">
          <h3 class="faat__preview-title">${d().escapeHtml(al.title)}</h3>
          <p class="faat__preview-artist">${d().escapeHtml(al.artist)}${al.year ? " · " + al.year : ""}</p>
          <label class="faat__track-label">Morceau favori <span class="feed-note">(optionnel)</span>
            <input type="text" class="faat__track-input" id="faat-track" maxlength="120" placeholder="ex. Redbone, Nikes…" value="${d().escapeHtml(trackTitle)}" />
          </label>
          <button type="button" class="btn btn-ghost btn-sm" id="faat-change">Changer d’album</button>
        </div>`;
      document.getElementById("faat-change")?.addEventListener("click", () => {
        composing = false;
        selectedAlbumId = null;
        paintCompose();
        document.getElementById("faat-q")?.focus();
      });
    }

    async function runSearch(q) {
      if (!window.SLMusicSearch) {
        paintResults(`<p class="faat__empty">Recherche indisponible.</p>`);
        return;
      }
      const query = String(q || "").trim();
      if (query.length < 2) {
        paintResults(`<p class="faat__empty">Tape au moins 2 caractères pour chercher un album.</p>`);
        return;
      }
      const req = ++searchReq;
      paintResults("", true);
      const data = await window.SLMusicSearch.search(query, { localAlbums: d().allAlbums() });
      if (req !== searchReq) return;
      searchResults = (data.results || []).filter((r) => r.type === "album" || r.type === "single" || r.type === "ep");
      activeIndex = searchResults.length ? 0 : -1;
      if (!searchResults.length) {
        paintResults(`<p class="faat__empty">${d().escapeHtml(data.error || "Aucun album trouvé.")}</p>`);
        return;
      }
      const local = searchResults.filter((r) => (r.sources || []).includes("local"));
      const remote = searchResults.filter((r) => !(r.sources || []).includes("local"));
      let html = "";
      if (local.length) {
        html += `<p class="faat__section-label">Ton carnet</p>` + local.map((r) => rowHtml(r, searchResults.indexOf(r))).join("");
      }
      if (remote.length) {
        html += `<p class="faat__section-label">Catalogues</p>` + remote.slice(0, 36).map((r) => rowHtml(r, searchResults.indexOf(r))).join("");
      }
      paintResults(html);
      wireResultClicks();
    }

    function selectAt(idx) {
      const list = filtered();
      const r = list[idx];
      if (!r) return;
      const aid = resolveAlbumId(r);
      if (!aid) {
        d().toast("Impossible d’ajouter cet album.");
        return;
      }
      selectedAlbumId = aid;
      composing = true;
      paintCompose();
    }

    function wireResultClicks() {
      document.querySelectorAll("[data-faat-idx]").forEach((btn) => {
        btn.addEventListener("click", () => selectAt(parseInt(btn.getAttribute("data-faat-idx"), 10)));
      });
    }

    const html = `<div class="faat-modal" role="dialog" aria-labelledby="faat-title">
      <header class="faat__head">
        <div>
          <p class="faat__kicker">Identité musicale</p>
          <h2 class="faat__title" id="faat-title">Album favori de tous les temps</h2>
          <p class="faat__sub">Un seul album qui te représente — l’app s’habille de ses couleurs.</p>
        </div>
        <button type="button" class="faat__close" id="faat-close" aria-label="Fermer">×</button>
      </header>
      <div class="faat__body${composing ? " faat__body--split" : ""}" id="faat-body">
        <div class="faat__search">
          <div class="faat__search-bar">
            <span class="faat__search-icon" aria-hidden="true">⌕</span>
            <input type="search" class="faat__input" id="faat-q" placeholder="Rechercher un album, un artiste…" autocomplete="off" />
          </div>
          <div id="faat-results" class="faat__results"></div>
        </div>
        <aside class="faat__compose" id="faat-compose" hidden>
          <div class="faat__compose-inner" id="faat-preview"></div>
          <p class="faat__actions">
            <button type="button" class="btn btn-primary" id="faat-save">Confirmer mon album</button>
            ${current && current.albumId ? `<button type="button" class="btn btn-ghost btn-sm" id="faat-clear">Retirer</button>` : ""}
          </p>
        </aside>
      </div>
    </div>`;

    d().openModal(html, { variant: "faat" });

    document.getElementById("faat-close")?.addEventListener("click", () => d().closeModal());
    const input = document.getElementById("faat-q");
    input?.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => runSearch(input.value), 220);
    });
    input?.addEventListener("keydown", (e) => {
      const list = filtered();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = Math.min(list.length - 1, activeIndex + 1);
        paintResults(list.map((r) => rowHtml(r, searchResults.indexOf(r))).join(""));
        wireResultClicks();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = Math.max(0, activeIndex - 1);
        paintResults(list.map((r) => rowHtml(r, searchResults.indexOf(r))).join(""));
        wireResultClicks();
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        selectAt(activeIndex);
      }
    });

    document.getElementById("faat-save")?.addEventListener("click", async () => {
      if (!selectedAlbumId) return d().toast("Choisis un album d’abord.");
      const trackEl = document.getElementById("faat-track");
      trackTitle = trackEl ? String(trackEl.value || "").trim() : "";
      const btn = document.getElementById("faat-save");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Application du thème…";
      }
      try {
        await d().saveFavoriteAlbum(selectedAlbumId, trackTitle);
        d().closeModal();
        d().render();
        d().toast("Ton album favori définit l’identité de l’app.");
      } catch (err) {
        d().toast((err && err.message) || "Enregistrement impossible.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Confirmer mon album";
        }
      }
    });

    document.getElementById("faat-clear")?.addEventListener("click", async () => {
      try {
        await d().clearFavoriteAlbum();
        d().closeModal();
        d().render();
        d().toast("Album favori retiré.");
      } catch (_) {
        d().toast("Impossible de retirer.");
      }
    });

    if (composing) paintCompose();
    else input?.focus();
  }

  window.SLFavoriteAlbum = {
    install(dep) {
      deps = dep;
    },
    open,
  };
})();
