/* Soundlog — Carnet social (likes, réactions, commentaires) */
(function () {
  "use strict";

  const REACTIONS = ["❤️", "🔥", "😭", "😮", "🎧", "🐐", "⭐"];
  const socialCache = new Map();
  let deps = null;
  let circleFetchPromise = null;
  let circleRowsCache = null;

  function d() {
    return deps;
  }

  function cloudOn() {
    const x = d();
    return !!(x && x.SLCloud && x.SLCloud.isSignedIn && x.SLCloud.isSignedIn());
  }

  function isCloudListening(id) {
    return d() && typeof d().isCloudUuid === "function" && d().isCloudUuid(id);
  }

  function timeAgo(iso) {
    if (d() && d().timeAgo) return d().timeAgo(iso);
    const t = new Date(iso).getTime();
    const diff = Date.now() - t;
    if (diff < 60000) return "à l'instant";
    if (diff < 3600000) return Math.floor(diff / 60000) + " min";
    if (diff < 86400000) return Math.floor(diff / 3600000) + " h";
    return Math.floor(diff / 86400000) + " j";
  }

  function getLocalSocial(listeningId) {
    const st = d().state;
    const liked = !!(st.socialReactions && st.socialReactions[listeningId] && st.socialReactions[listeningId].like);
    const reactions = (st.socialReactions && st.socialReactions[listeningId] && st.socialReactions[listeningId].emojis) || {};
    const counts = {};
    Object.keys(reactions).forEach((em) => {
      if (reactions[em]) counts[em] = 1;
    });
    const commentCounts = {};
    const n = (st.feedComments || []).filter((c) => c.listeningId === listeningId).length;
    if (n) commentCounts[listeningId] = n;
    return {
      likes: { counts: liked ? { [listeningId]: 1 } : {}, mine: liked ? new Set([listeningId]) : new Set() },
      reactions: {
        [listeningId]: { counts, users: {}, mine: new Set(Object.keys(reactions).filter((k) => reactions[k])) },
      },
      commentCounts,
    };
  }

  async function fetchSocialForIds(ids) {
    const need = ids.filter((id) => id && (!socialCache.has(id) || Date.now() - socialCache.get(id).at > 45000));
    if (!need.length) return;
    if (cloudOn() && d().SLCloud.fetchListeningSocialState) {
      try {
        const bundle = await d().SLCloud.fetchListeningSocialState(need);
        need.forEach((id) => {
          const rx = bundle.reactions[id] || { counts: {}, mine: new Set() };
          socialCache.set(id, {
            at: Date.now(),
            likeCount: bundle.likes.counts[id] || 0,
            liked: bundle.likes.mine.has(id),
            reactions: rx.counts || {},
            myReactions: rx.mine || new Set(),
            commentCount: bundle.commentCounts[id] || 0,
          });
        });
      } catch (e) {
        console.warn("[carnet-social] fetch", e);
      }
      return;
    }
    need.forEach((id) => {
      const loc = getLocalSocial(id);
      socialCache.set(id, {
        at: Date.now(),
        likeCount: loc.likes.counts[id] || 0,
        liked: loc.likes.mine.has(id),
        reactions: (loc.reactions[id] && loc.reactions[id].counts) || {},
        myReactions: (loc.reactions[id] && loc.reactions[id].mine) || new Set(),
        commentCount: loc.commentCounts[id] || 0,
      });
    });
  }

  function socialFor(id) {
    return (
      socialCache.get(id) || {
        likeCount: 0,
        liked: false,
        reactions: {},
        myReactions: new Set(),
        commentCount: 0,
      }
    );
  }

  function reactionPillsHtml(id) {
    const s = socialFor(id);
    const keys = Object.keys(s.reactions).filter((k) => s.reactions[k] > 0);
    if (!keys.length) return "";
    return `<div class="carnet-post__reactions" aria-label="Réactions">${keys
      .map(
        (em) =>
          `<span class="carnet-post__reaction-pill${s.myReactions.has(em) ? " is-mine" : ""}" data-carnet-reaction-pill="${d().escapeHtml(
            id
          )}" data-emoji="${d().escapeHtml(em)}">${em}<b>${s.reactions[em]}</b></span>`
      )
      .join("")}</div>`;
  }

  /** Entrée journal personnel — sans interactions sociales (likes/commentaires du cercle). */
  function renderPersonalPost(listening, album) {
    const x = d();
    if (!listening || !album) return "";
    const lid = listening.id;
    const when = listening.date || listening.createdAt || "";
    const review = listening.review || listening.comment || "";
    const label = x.diaryDateLabel ? x.diaryDateLabel(when) : when;

    return `<article class="diary-entry diary-entry--personal" data-listening-id="${x.escapeHtml(lid)}" data-preview-album="${x.escapeHtml(album.id)}">
      <div class="diary-entry__cover">${x.coverHtml(album, false)}</div>
      <div class="diary-entry__body">
        <div class="diary-entry__meta">
          <time datetime="${x.escapeHtml(when)}">${x.escapeHtml(label)}</time>
          <span class="diary-entry__badge">Mon carnet</span>
        </div>
        <h3 class="diary-entry__title"><button type="button" class="link" data-album="${x.escapeHtml(album.id)}">${x.escapeHtml(album.title)}</button></h3>
        <p class="diary-entry__artist">${x.escapeHtml(album.artist)}${album.year ? ` · ${album.year}` : ""}</p>
        <div class="diary-entry__stars">${x.starString(listening.rating)}</div>
        ${review ? `<p class="diary-entry__review">${x.escapeHtml(String(review).trim())}</p>` : `<p class="diary-entry__review diary-entry__review--muted">Pas de critique.</p>`}
        <div class="diary-entry__actions">
          <button type="button" class="btn btn-ghost btn-sm" data-edit-listen="${x.escapeHtml(lid)}">Modifier</button>
          <button type="button" class="btn btn-ghost btn-sm" data-preview-play="${x.escapeHtml(album.id)}">Extrait</button>
          <button type="button" class="btn btn-ghost btn-sm diary-entry__danger" data-del-listen="${x.escapeHtml(lid)}">Supprimer</button>
        </div>
      </div>
    </article>`;
  }

  function renderPersonalJournal() {
    const x = d();
    const mine = x.state.listenings
      .filter((l) => l.userId === "me")
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    const filtered = x.filterDiaryListenings(mine);
    if (!filtered.length) {
      return `<div class="carnet-feed carnet-feed--personal carnet-feed--empty">
        <p class="diary-empty__title">${mine.length ? "Aucune entrée pour ce filtre" : "Ton journal est vide"}</p>
        <p class="feed-note">Logue un album pour commencer ton carnet personnel.</p>
        <p style="margin-top:1rem"><button type="button" class="btn btn-primary" id="btn-add-listen">+ Logger une écoute</button></p>
      </div>`;
    }
    const posts = filtered
      .map((l) => {
        const al = x.albumById(l.albumId);
        if (!al) return "";
        return renderPersonalPost(l, al);
      })
      .filter(Boolean)
      .join("");
    return `<div class="carnet-feed carnet-feed--personal" data-carnet-feed="personal"><div class="carnet-feed__stream">${posts}</div></div>`;
  }

  function renderCommunityFeedShell() {
    return `<section class="community-feed" data-social-community-feed aria-label="Activité de ton cercle">
      <header class="community-feed__head">
        <h2 class="community-feed__title">Activité des proches</h2>
        <p class="community-feed__lead feed-note">Écoutes, critiques et réactions des personnes que tu suis — pas ton carnet personnel.</p>
      </header>
      <div class="community-feed__stream" data-social-community-stream><p class="feed-note">Chargement du fil…</p></div>
    </section>`;
  }

  function renderPost(listening, album, author) {
    const x = d();
    if (!listening || !album) return "";
    const lid = listening.id;
    const s = socialFor(lid);
    const name = author.name || "Toi";
    const hue = author.hue != null ? author.hue : 200;
    const when = listening.date || listening.createdAt || "";
    const review = listening.review || listening.comment || "";
    const isMine = listening.userId === "me" || (x.SLCloud && x.SLCloud.me && listening.userId === x.SLCloud.me.id);
    const profileId = listening.userId === "me" ? "me" : listening.userId;
    const reactPicker = REACTIONS.map(
      (em) =>
        `<button type="button" class="carnet-react-picker__btn" data-carnet-react="${x.escapeHtml(lid)}" data-emoji="${em}" title="Réagir ${em}">${em}</button>`
    ).join("");

    return `<article class="carnet-post" data-listening-id="${x.escapeHtml(lid)}" data-preview-album="${x.escapeHtml(album.id)}">
      <header class="carnet-post__head">
        <button type="button" class="carnet-post__avatar" style="background:hsl(${hue},52%,44%)" data-profile="${x.escapeHtml(profileId)}" aria-label="Profil ${x.escapeHtml(name)}">${x.escapeHtml(name.charAt(0).toUpperCase())}</button>
        <div class="carnet-post__who">
          <button type="button" class="carnet-post__name link" data-profile="${x.escapeHtml(profileId)}">${x.escapeHtml(name)}</button>
          <span class="carnet-post__verb">a loggé</span>
          <time class="carnet-post__time" datetime="${x.escapeHtml(when)}">${x.escapeHtml(x.diaryDateLabel ? x.diaryDateLabel(when) : when)}</time>
        </div>
        ${isMine ? `<button type="button" class="carnet-post__menu btn btn-ghost btn-sm" data-edit-listen="${x.escapeHtml(lid)}" title="Modifier">⋯</button>` : ""}
      </header>
      <div class="carnet-post__media" data-carnet-double-tap="${x.escapeHtml(lid)}">
        ${x.coverHtml(album, false)}
        <span class="carnet-post__rating" title="Note">${listening.rating ? Number(listening.rating).toFixed(1) : "—"}</span>
      </div>
      <div class="carnet-post__album">
        <button type="button" class="carnet-post__album-title link" data-album="${x.escapeHtml(album.id)}">${x.escapeHtml(album.title)}</button>
        <span class="carnet-post__album-meta">${x.escapeHtml(album.artist)}${album.year ? ` · ${album.year}` : ""}</span>
      </div>
      <div class="carnet-post__stars">${x.starString(listening.rating)}</div>
      ${review ? `<p class="carnet-post__caption">${x.escapeHtml(String(review).trim())}</p>` : `<p class="carnet-post__caption carnet-post__caption--muted">Pas de critique.</p>`}
      ${reactionPillsHtml(lid)}
      <footer class="carnet-post__actions">
        <button type="button" class="carnet-post__action carnet-post__action--like${s.liked ? " is-on" : ""}" data-carnet-like="${x.escapeHtml(lid)}" aria-pressed="${s.liked ? "true" : "false"}">
          <span class="carnet-post__action-icon" aria-hidden="true">♥</span>
          <span class="carnet-post__action-label" data-carnet-like-count="${x.escapeHtml(lid)}">${s.likeCount > 0 ? s.likeCount : "J'aime"}</span>
        </button>
        <div class="carnet-react-wrap">
          <button type="button" class="carnet-post__action" data-carnet-react-open="${x.escapeHtml(lid)}" aria-expanded="false" aria-haspopup="true">
            <span class="carnet-post__action-icon" aria-hidden="true">✦</span>
            <span class="carnet-post__action-label">Réagir</span>
          </button>
          <div class="carnet-react-picker" hidden role="menu">${reactPicker}</div>
        </div>
        <button type="button" class="carnet-post__action" data-carnet-comments-toggle="${x.escapeHtml(lid)}" aria-expanded="false">
          <span class="carnet-post__action-icon" aria-hidden="true">💬</span>
          <span class="carnet-post__action-label" data-carnet-comment-count="${x.escapeHtml(lid)}">${s.commentCount > 0 ? s.commentCount + " com." : "Commenter"}</span>
        </button>
        <button type="button" class="carnet-post__action" data-preview-play="${x.escapeHtml(album.id)}">
          <span class="carnet-post__action-icon" aria-hidden="true">▶</span>
          <span class="carnet-post__action-label">Extrait</span>
        </button>
        ${isMine ? `<button type="button" class="carnet-post__action carnet-post__action--danger" data-del-listen="${x.escapeHtml(lid)}">Supprimer</button>` : ""}
      </footer>
      <section class="carnet-post__comments" hidden data-carnet-comments-panel="${x.escapeHtml(lid)}">
        <div class="carnet-comments__list" data-carnet-comments-list="${x.escapeHtml(lid)}"><p class="feed-note">Chargement…</p></div>
        <form class="carnet-comments__form" data-carnet-comment-form="${x.escapeHtml(lid)}">
          <textarea rows="1" maxlength="800" placeholder="Ajouter un commentaire…" aria-label="Commentaire"></textarea>
          <button type="submit" class="btn btn-primary btn-sm">Publier</button>
        </form>
      </section>
      <div class="carnet-like-burst" hidden aria-hidden="true">♥</div>
    </article>`;
  }

  function patchPostUi(listeningId) {
    const s = socialFor(listeningId);
    document.querySelectorAll('[data-carnet-like="' + listeningId + '"]').forEach((btn) => {
      btn.classList.toggle("is-on", !!s.liked);
      btn.setAttribute("aria-pressed", s.liked ? "true" : "false");
    });
    const lc = document.querySelector('[data-carnet-like-count="' + listeningId + '"]');
    if (lc) lc.textContent = s.likeCount > 0 ? String(s.likeCount) : "J'aime";
    const cc = document.querySelector('[data-carnet-comment-count="' + listeningId + '"]');
    if (cc) cc.textContent = s.commentCount > 0 ? s.commentCount + " com." : "Commenter";
    const post = document.querySelector('.carnet-post[data-listening-id="' + listeningId + '"]');
    if (post) {
      const old = post.querySelector(".carnet-post__reactions");
      const html = reactionPillsHtml(listeningId);
      if (old) old.remove();
      if (html) {
        const footer = post.querySelector(".carnet-post__actions");
        if (footer) footer.insertAdjacentHTML("beforebegin", html);
      }
    }
  }

  async function toggleLike(listeningId) {
    const cached = socialCache.get(listeningId) || { likeCount: 0, liked: false, reactions: {}, myReactions: new Set(), commentCount: 0 };
    const prev = { ...cached, myReactions: new Set(cached.myReactions) };
    cached.liked = !cached.liked;
    cached.likeCount = Math.max(0, cached.likeCount + (cached.liked ? 1 : -1));
    socialCache.set(listeningId, cached);
    patchPostUi(listeningId);

    if (cloudOn() && isCloudListening(listeningId) && d().toggleListeningLike) {
      try {
        await d().toggleListeningLike(listeningId);
        await fetchSocialForIds([listeningId]);
        patchPostUi(listeningId);
      } catch (e) {
        socialCache.set(listeningId, prev);
        patchPostUi(listeningId);
        d().toast(e.message || "Like impossible");
      }
      return;
    }
    d().state.socialReactions = d().state.socialReactions || {};
    d().state.socialReactions[listeningId] = d().state.socialReactions[listeningId] || {};
    d().state.socialReactions[listeningId].like = cached.liked;
    d().persist();
  }

  async function toggleReaction(listeningId, emoji) {
    const cached = socialFor(listeningId);
    const had = cached.myReactions.has(emoji);
    if (had) cached.myReactions.delete(emoji);
    else cached.myReactions.add(emoji);
    cached.reactions[emoji] = Math.max(0, (cached.reactions[emoji] || 0) + (had ? -1 : 1));
    if (!cached.reactions[emoji]) delete cached.reactions[emoji];
    socialCache.set(listeningId, cached);
    patchPostUi(listeningId);

    if (cloudOn() && isCloudListening(listeningId) && d().SLCloud.toggleListeningReaction) {
      try {
        await d().SLCloud.toggleListeningReaction(listeningId, emoji);
        await fetchSocialForIds([listeningId]);
        patchPostUi(listeningId);
      } catch (e) {
        await fetchSocialForIds([listeningId]);
        patchPostUi(listeningId);
        d().toast(e.message || "Réaction impossible");
      }
      return;
    }
    d().state.socialReactions = d().state.socialReactions || {};
    const row = d().state.socialReactions[listeningId] || {};
    row.emojis = row.emojis || {};
    row.emojis[emoji] = !had;
    d().state.socialReactions[listeningId] = row;
    d().persist();
  }

  function nestComments(rows) {
    const roots = [];
    const byId = new Map();
    (rows || []).forEach((c) => byId.set(c.id, { ...c, replies: [] }));
    byId.forEach((c) => {
      if (c.parent_id && byId.has(c.parent_id)) byId.get(c.parent_id).replies.push(c);
      else roots.push(c);
    });
    return roots;
  }

  function commentHtml(c, listeningId, depth) {
    const x = d();
    const a = c.profiles || {};
    const mine = cloudOn() && x.SLCloud.me && c.author_id === x.SLCloud.me.id;
    const replies = (c.replies || [])
      .map((r) => commentHtml(r, listeningId, depth + 1))
      .join("");
    return `<article class="carnet-comment${depth ? " carnet-comment--reply" : ""}" data-comment-id="${x.escapeHtml(c.id)}">
      <span class="carnet-comment__avatar" style="background:hsl(${a.hue || 220},50%,48%)">${x.escapeHtml((a.name || "?").slice(0, 1))}</span>
      <div class="carnet-comment__body">
        <header><strong>${x.escapeHtml(a.name || "?")}</strong> <time>${x.escapeHtml(timeAgo(c.created_at))}</time></header>
        <p>${x.escapeHtml(c.text)}</p>
        <div class="carnet-comment__actions">
          <button type="button" class="link" data-carnet-reply="${x.escapeHtml(listeningId)}" data-parent="${x.escapeHtml(c.id)}">Répondre</button>
          ${mine ? `<button type="button" class="link carnet-comment__del" data-carnet-del-comment="${x.escapeHtml(c.id)}" data-listening="${x.escapeHtml(listeningId)}">Supprimer</button>` : ""}
        </div>
        ${replies ? `<div class="carnet-comment__replies">${replies}</div>` : ""}
      </div>
    </article>`;
  }

  async function loadCommentsPanel(listeningId) {
    const list = document.querySelector('[data-carnet-comments-list="' + listeningId + '"]');
    if (!list) return;
    let rows = [];
    if (cloudOn() && isCloudListening(listeningId)) {
      try {
        rows = await d().SLCloud.listCommentsForListening(listeningId);
      } catch (_) {
        list.innerHTML = `<p class="feed-note">Impossible de charger les commentaires.</p>`;
        return;
      }
    } else {
      rows = (d().state.feedComments || [])
        .filter((c) => c.listeningId === listeningId)
        .map((c) => ({
          id: c.id,
          text: c.text,
          created_at: c.at,
          author_id: c.userId,
          parent_id: c.parentId || null,
          profiles: d().userById(c.userId),
        }));
    }
    const nested = nestComments(rows);
    if (!nested.length) {
      list.innerHTML = `<p class="feed-note carnet-comments__empty">Sois le premier à commenter.</p>`;
      return;
    }
    list.innerHTML = nested.map((c) => commentHtml(c, listeningId, 0)).join("");
    const cached = socialFor(listeningId);
    cached.commentCount = rows.length;
    socialCache.set(listeningId, cached);
    patchPostUi(listeningId);
  }

  async function postComment(listeningId, text, parentId) {
    const body = String(text || "").trim();
    if (!body) return;
    if (cloudOn() && isCloudListening(listeningId)) {
      await d().SLCloud.postComment(listeningId, body, parentId || null);
      await loadCommentsPanel(listeningId);
      await fetchSocialForIds([listeningId]);
      patchPostUi(listeningId);
      return;
    }
    d().state.feedComments = d().state.feedComments || [];
    d().state.feedComments.push({
      id: "fc-" + Date.now(),
      listeningId,
      userId: "me",
      text: body,
      at: new Date().toISOString(),
      parentId: parentId || null,
    });
    d().persist();
    await loadCommentsPanel(listeningId);
    await fetchSocialForIds([listeningId]);
    patchPostUi(listeningId);
  }

  function likeBurst(post) {
    const burst = post && post.querySelector(".carnet-like-burst");
    if (!burst) return;
    burst.hidden = false;
    burst.classList.remove("carnet-like-burst--pop");
    void burst.offsetWidth;
    burst.classList.add("carnet-like-burst--pop");
    setTimeout(() => {
      burst.classList.remove("carnet-like-burst--pop");
      burst.hidden = true;
    }, 700);
  }

  async function fetchCircleRows() {
    if (!cloudOn()) return [];
    if (circleRowsCache && Date.now() - circleRowsCache.at < 60000) return circleRowsCache.rows;
    if (circleFetchPromise) return circleFetchPromise;
    circleFetchPromise = (async () => {
      try {
        const rows = await d().SLCloud.listCircleListenings(48);
        circleRowsCache = { at: Date.now(), rows };
        return rows;
      } catch (e) {
        console.warn("[carnet-social] circle", e);
        return [];
      } finally {
        circleFetchPromise = null;
      }
    })();
    return circleFetchPromise;
  }

  function mapCloudListening(row) {
    const x = d();
    if (row.albums && row.album_id && x.mergeCloudAlbumFromRow) {
      x.mergeCloudAlbumFromRow({
        id: row.album_id,
        title: row.albums.title,
        artist: row.albums.artist,
        year: row.albums.year,
        artwork_url: row.albums.artwork_url,
      });
    } else if (row.album_id && x.ensureAlbumFromPublicFeedRow) {
      x.ensureAlbumFromPublicFeedRow({
        album_id: row.album_id,
        album_title: row.albums && row.albums.title,
        album_artist: row.albums && row.albums.artist,
        album_year: row.albums && row.albums.year,
        artwork_url: row.albums && row.albums.artwork_url,
      });
    }
    const al = x.albumById(row.album_id);
    if (!al) return null;
    return {
      listening: {
        id: row.id,
        userId: row.user_id,
        albumId: row.album_id,
        rating: row.rating,
        review: row.comment,
        date: row.date,
        createdAt: row.created_at,
      },
      album: al,
      author: {
        name: (row.profiles && row.profiles.name) || "?",
        hue: (row.profiles && row.profiles.hue) || 200,
      },
    };
  }

  function renderFeedHtml() {
    return renderPersonalJournal();
  }

  function renderLocalCommunityPosts() {
    const x = d();
    const items =
      typeof x.socialFeedItems === "function"
        ? x.socialFeedItems()
        : x.state.listenings.filter((l) => l.userId !== "me");
    if (!items.length) return "";
    return items
      .slice(0, 32)
      .map((l) => {
        const al = x.albumById(l.albumId);
        const u = x.userById(l.userId);
        if (!al || !u) return "";
        return renderPost(l, al, { name: u.name, hue: u.hue });
      })
      .filter(Boolean)
      .join("");
  }

  async function hydrateCommunityFeed(root) {
    const scope = root || document;
    const stream = scope.querySelector("[data-social-community-stream]");
    if (!stream) return;

    const localHtml = renderLocalCommunityPosts();
    if (!cloudOn()) {
      stream.innerHTML = localHtml
        ? localHtml
        : `<div class="community-feed__empty"><p class="soc-empty__title">Ton cercle est calme</p><p class="feed-note">Suis des profils ou connecte-toi pour voir l’activité des proches.</p><p><button type="button" class="btn btn-primary btn-sm" data-nav-view="carnet">Mon carnet</button> <button type="button" class="btn btn-ghost btn-sm" data-social-circle-tab="discover">Découvrir</button></p></div>`;
      if (localHtml) await hydrateFeed(scope.querySelector("[data-social-community-feed]") || scope);
      return;
    }

    const rows = await fetchCircleRows();
    const cloudItems = rows.map(mapCloudListening).filter(Boolean);
    const cloudHtml = cloudItems.map((it) => renderPost(it.listening, it.album, it.author)).join("");

    if (!cloudHtml && !localHtml) {
      stream.innerHTML = `<div class="community-feed__empty"><p class="soc-empty__title">Aucune activité pour l’instant</p><p class="feed-note">Invite des ami·es ou découvre des profils — leur carnet apparaîtra ici.</p></div>`;
    } else {
      stream.innerHTML =
        (cloudHtml ? `<div class="community-feed__section"><p class="community-feed__kicker">En ligne</p>${cloudHtml}</div>` : "") +
        (localHtml ? `<div class="community-feed__section"><p class="community-feed__kicker">Sur cet appareil</p>${localHtml}</div>` : "");
    }
    await hydrateFeed(scope.querySelector("[data-social-community-feed]") || scope);
  }

  async function hydrateCircleStream(root) {
    return hydrateCommunityFeed(root);
  }

  async function hydrateFeed(root) {
    const scope = root || document;
    const ids = [...scope.querySelectorAll(".carnet-post[data-listening-id]")]
      .map((el) => el.getAttribute("data-listening-id"))
      .filter(Boolean);
    await fetchSocialForIds(ids);
    ids.forEach(patchPostUi);
  }

  function bind(root) {
    if (!root || root.dataset.carnetSocialBound) return;
    root.dataset.carnetSocialBound = "1";

    root.addEventListener("click", (e) => {
      const likeBtn = e.target.closest("[data-carnet-like]");
      if (likeBtn) {
        e.preventDefault();
        void toggleLike(likeBtn.getAttribute("data-carnet-like"));
        return;
      }
      const reactBtn = e.target.closest("[data-carnet-react]");
      if (reactBtn) {
        e.preventDefault();
        void toggleReaction(reactBtn.getAttribute("data-carnet-react"), reactBtn.getAttribute("data-emoji"));
        const wrap = reactBtn.closest(".carnet-react-wrap");
        const picker = wrap && wrap.querySelector(".carnet-react-picker");
        if (picker) picker.hidden = true;
        return;
      }
      const openReact = e.target.closest("[data-carnet-react-open]");
      if (openReact) {
        e.preventDefault();
        const wrap = openReact.closest(".carnet-react-wrap");
        const picker = wrap && wrap.querySelector(".carnet-react-picker");
        if (picker) {
          document.querySelectorAll(".carnet-react-picker").forEach((p) => {
            if (p !== picker) p.hidden = true;
          });
          picker.hidden = !picker.hidden;
          openReact.setAttribute("aria-expanded", picker.hidden ? "false" : "true");
        }
        return;
      }
      const toggleCom = e.target.closest("[data-carnet-comments-toggle]");
      if (toggleCom) {
        e.preventDefault();
        const lid = toggleCom.getAttribute("data-carnet-comments-toggle");
        const panel = root.querySelector('[data-carnet-comments-panel="' + lid + '"]');
        if (!panel) return;
        const open = panel.hidden;
        panel.hidden = !open;
        toggleCom.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) void loadCommentsPanel(lid);
        return;
      }
      const replyBtn = e.target.closest("[data-carnet-reply]");
      if (replyBtn) {
        e.preventDefault();
        const lid = replyBtn.getAttribute("data-carnet-reply");
        const parent = replyBtn.getAttribute("data-parent");
        const form = root.querySelector('[data-carnet-comment-form="' + lid + '"]');
        const ta = form && form.querySelector("textarea");
        if (ta) {
          ta.focus();
          ta.dataset.replyTo = parent;
          ta.placeholder = "Répondre…";
        }
        return;
      }
      const delCom = e.target.closest("[data-carnet-del-comment]");
      if (delCom) {
        e.preventDefault();
        const cid = delCom.getAttribute("data-carnet-del-comment");
        const lid = delCom.getAttribute("data-listening");
        void (async () => {
          try {
            if (cloudOn()) await d().SLCloud.deleteComment(cid);
            else {
              d().state.feedComments = (d().state.feedComments || []).filter((c) => c.id !== cid);
              d().persist();
            }
            await loadCommentsPanel(lid);
          } catch (err) {
            d().toast(err.message || "Suppression impossible");
          }
        })();
      }
    });

    root.addEventListener("submit", (e) => {
      const form = e.target.closest("[data-carnet-comment-form]");
      if (!form) return;
      e.preventDefault();
      const lid = form.getAttribute("data-carnet-comment-form");
      const ta = form.querySelector("textarea");
      const parentId = (ta && ta.dataset.replyTo) || "";
      void postComment(lid, ta.value, parentId).then(() => {
        ta.value = "";
        delete ta.dataset.replyTo;
        ta.placeholder = "Ajouter un commentaire…";
      });
    });

    let lastTap = 0;
    root.addEventListener(
      "click",
      (e) => {
        const media = e.target.closest("[data-carnet-double-tap]");
        if (!media) return;
        const now = Date.now();
        const lid = media.getAttribute("data-carnet-double-tap");
        if (now - lastTap < 320) {
          e.preventDefault();
          const post = media.closest(".carnet-post");
          const s = socialFor(lid);
          if (!s.liked) void toggleLike(lid);
          likeBurst(post);
        }
        lastTap = now;
      },
      true
    );

    root.querySelectorAll(".carnet-comments__form textarea").forEach((ta) => {
      ta.addEventListener("input", () => {
        ta.style.height = "auto";
        ta.style.height = Math.min(120, ta.scrollHeight) + "px";
      });
    });
  }

  window.SLCarnetSocial = {
    REACTIONS,
    install(dep) {
      deps = dep;
    },
    renderPersonalJournal,
    renderCommunityFeedShell,
    renderFeedHtml,
    hydrateFeed,
    hydrateCommunityFeed,
    hydrateCircleStream,
    bind,
    invalidateCircleCache() {
      circleRowsCache = null;
    },
  };
})();
