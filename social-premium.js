/**
 * Soundlog — expérience sociale premium (Cercle + Live)
 */
(function () {
  "use strict";

  let d = null;
  /** @type {{ rows: object[]; at: number } | null} */
  let circleCloudCache = null;
  let circleCloudFetch = null;

  function tab(id, label, active) {
    return '<button type="button" class="soc-tab' + (active ? ' is-active' : '') + '" data-social-circle-tab="' + id + '">' + label + '</button>';
  }

  function ensureReactions() {
    d.state.socialReactions = d.state.socialReactions || {};
  }

  function isReactionOn(listenId) {
    if (d.isListeningLiked) return d.isListeningLiked(listenId);
    ensureReactions();
    return !!(d.state.socialReactions[listenId] && d.state.socialReactions[listenId].like);
  }

  function likeLabel(listenId) {
    const suffix = d.likeCountSuffix ? d.likeCountSuffix(listenId) : "";
    return "♥ J’aime" + suffix;
  }

  function circleAlbumScores() {
    const ids = d.feedCircleIds();
    const counts = new Map();
    d.state.listenings.forEach((l) => {
      if (!ids.has(l.userId) || !l.albumId) return;
      counts.set(l.albumId, (counts.get(l.albumId) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([albumId, n]) => ({ albumId, n, al: d.albumById(albumId) }))
      .filter((x) => x.al)
      .sort((a, b) => b.n - a.n)
      .slice(0, 6);
  }

  function liveNowStrip() {
    const recent = recentCircleListenings(5);
    if (!recent.length) return "";
    return '<section class="soc-live-strip" aria-label="Écoutes récentes">' +
      recent
        .map((l) => {
          const u = d.userById(l.userId);
          const al = d.albumById(l.albumId);
          if (!u || !al) return "";
          const when = d.formatRelativeFeedTime(l.date);
          return '<button type="button" class="soc-live-pill" data-album-open="' + d.escapeHtml(al.id) + '" data-profile="' + d.escapeHtml(u.id) + '">' +
            '<span class="soc-live-pill__dot" aria-hidden="true"></span>' +
            '<span class="soc-live-pill__avatar" style="background:hsl(' + u.hue + ',55%,42%)">' + d.escapeHtml(u.name.charAt(0)) + '</span>' +
            '<span class="soc-live-pill__text"><strong>' + d.escapeHtml(u.name.split(/\s+/)[0] || u.name) + '</strong> · ' + d.escapeHtml(al.title) + '</span>' +
            '<span class="soc-live-pill__time">' + d.escapeHtml(when) + '</span></button>';
        })
        .join("") +
      "</section>";
  }

  function recentCircleListenings(limit) {
    const ids = d.feedCircleIds();
    return d.state.listenings
      .filter((l) => ids.has(l.userId))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      .slice(0, limit || 24);
  }

  function feedFilterBtn(id, label, active) {
    return (
      '<button type="button" class="soc-feed-filter' +
      (active ? " is-active" : "") +
      '" data-social-feed-filter="' +
      id +
      '">' +
      label +
      "</button>"
    );
  }

  function circleListShares() {
    const ids = d.feedCircleIds();
    return (d.state.lists || []).filter((l) => ids.has(l.userId)).slice(0, 5);
  }

  function renderActivityRail() {
    const blocks = [];
    circleListShares().forEach((lst) => {
      const u = d.userById(lst.userId);
      if (!u) return;
      const covers = (lst.albumIds || [])
        .slice(0, 4)
        .map((aid) => d.albumById(aid))
        .filter(Boolean);
      blocks.push(
        '<article class="soc-activity-card soc-activity-card--playlist">' +
          '<header class="soc-activity-card__head">' +
          '<span class="soc-activity-card__avatar" style="background:hsl(' +
          u.hue +
          ',55%,42%)">' +
          d.escapeHtml(u.name.charAt(0)) +
          "</span>" +
          '<div><span class="soc-activity-card__tag">Playlist partagée</span><strong>' +
          d.escapeHtml(u.name) +
          "</strong></div></header>" +
          '<h3 class="soc-activity-card__title">' +
          d.escapeHtml(lst.title) +
          "</h3>" +
          (lst.description ? '<p class="feed-note">' + d.escapeHtml(lst.description) + "</p>" : "") +
          '<div class="soc-activity-card__covers">' +
          covers.map((al) => d.coverHtml(al, true, "sm")).join("") +
          "</div>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-list="' +
          d.escapeHtml(lst.id) +
          '">Ouvrir la liste</button></article>'
      );
    });
    d.concertFeedItems().slice(0, 4).forEach((c) => {
      const u = d.userById(c.userId);
      if (!u) return;
      const g = d.gradientFromKey((c.artist || "") + (c.date || ""));
      const where = [c.venue, c.city].filter(Boolean).join(" · ");
      blocks.push(
        '<article class="soc-activity-card soc-activity-card--gig">' +
          '<div class="soc-activity-card__poster" style="--poster-a:' +
          g.from +
          ";--poster-b:" +
          g.to +
          '">' +
          '<span class="soc-activity-card__poster-kicker">Live</span>' +
          '<span class="soc-activity-card__poster-artist">' +
          d.escapeHtml(c.artist) +
          "</span>" +
          '<span class="soc-activity-card__poster-venue">' +
          d.escapeHtml(where || c.date) +
          "</span></div>" +
          '<p class="soc-activity-card__gig-meta"><button type="button" class="link" data-profile="' +
          d.escapeHtml(u.id) +
          '">' +
          d.escapeHtml(u.name) +
          '</button> <span class="soc-iwas-badge">I was there !</span></p></article>'
      );
    });
    if (!blocks.length) return "";
    return (
      '<section class="soc-activity-rail-wrap" aria-label="Activité du cercle">' +
      '<h2 class="soc-activity-rail__title">En ce moment</h2>' +
      '<div class="soc-activity-rail">' +
      blocks.join("") +
      "</div></section>"
    );
  }

  function renderNotifStrip() {
    d.ensureSocialArrays();
    const rows = (d.state.notifications || []).filter((n) => !n.read).slice(0, 4);
    if (!rows.length) {
      return (
        '<section class="soc-notif-strip soc-notif-strip--calm">' +
        '<span class="soc-notif-strip__icon" aria-hidden="true">◎</span>' +
        '<p class="feed-note">Aucune alerte récente — le cercle est calme.</p></section>'
      );
    }
    return (
      '<section class="soc-notif-strip" aria-label="Alertes récentes">' +
      rows
        .map(
          (n) =>
            '<button type="button" class="soc-notif-pill" data-notif-id="' +
            d.escapeHtml(n.id) +
            '"><strong>' +
            d.escapeHtml(n.title) +
            "</strong><span>" +
            d.escapeHtml(String(n.body || "").slice(0, 72)) +
            "</span></button>"
        )
        .join("") +
      '<button type="button" class="btn btn-ghost btn-sm" id="soc-open-notif-bell">Tout voir</button></section>'
    );
  }

  function renderSuggestAside() {
    return "";
  }

  function renderFeedPanel() {
    const feedFilter = d.state.socialFeedFilter || "all";
    const items = d.feedItems();
    const trending = circleAlbumScores();
    const signed = d.cloudSignedIn && d.cloudSignedIn();
    const localStream =
      items.length === 0
        ? '<div class="soc-empty soc-empty--inline"><p class="soc-empty__title">Ton cercle se réveille</p><p>Suis des profils ou invite des ami·es pour remplir le fil.</p><p><button type="button" class="btn btn-primary" data-social-circle-tab="discover">Découvrir</button></p></div>'
        : items
            .slice(0, 24)
            .map((l) => feedCardFromListening(l))
            .join("");
    const stream =
      feedFilter === "cloud"
        ? '<div id="soc-cloud-feed" class="soc-cloud-feed"><p class="feed-note">Chargement des écoutes en ligne…</p></div>'
        : '<div id="soc-feed-local" class="soc-feed-local' +
          (feedFilter === "circle" ? " soc-feed-local--solo" : "") +
          '">' +
          localStream +
          "</div>" +
          (feedFilter === "circle"
            ? ""
            : '<div id="soc-cloud-feed" class="soc-cloud-feed"><p class="feed-note">Synchronisation du fil en ligne…</p></div>');

    const trendHtml =
      trending.length === 0
        ? ""
        : '<div class="soc-aside-card"><h3>Tendances du cercle</h3><div class="soc-trend-row">' +
          trending
            .map(
              (t) =>
                '<button type="button" class="soc-trend-chip" data-album-open="' +
                d.escapeHtml(t.al.id) +
                '" title="' +
                d.escapeHtml(t.al.title) +
                '">' +
                d.coverHtml(t.al, true, "sm") +
                '<span class="soc-trend-chip__n">' +
                t.n +
                "</span></button>"
            )
            .join("") +
          "</div></div>";

    const localShoutBtn = !signed
      ? '<button type="button" class="btn btn-ghost btn-sm" id="social-add-shout">Publier (local)</button>'
      : "";
    const cloudShoutBtn = signed
      ? '<button type="button" class="btn btn-primary btn-sm" id="soc-shout-cloud">Publier</button>'
      : "";
    const composeHint = signed
      ? '<p class="soc-compose__hint feed-note">Visible par la communauté connectée.</p>'
      : '<p class="soc-compose__hint feed-note">Stocké sur cet appareil uniquement.</p>';

    return (
      '<div class="soc-layout soc-layout--feed">' +
      '<div class="soc-main">' +
      (d.feedStoryStripHtml ? d.feedStoryStripHtml() : "") +
      liveNowStrip() +
      '<nav class="soc-feed-filters" aria-label="Filtrer le fil">' +
      feedFilterBtn("all", "Tout", feedFilter === "all") +
      feedFilterBtn("circle", "Cercle local", feedFilter === "circle") +
      feedFilterBtn("cloud", "En ligne", feedFilter === "cloud") +
      "</nav>" +
      renderActivityRail() +
      '<section class="soc-compose panel">' +
      '<header class="soc-compose__head"><h3 class="soc-compose__title">Murmures</h3>' +
      (signed ? '<span class="home-murmurs__badge">Communauté</span>' : '<span class="home-murmurs__badge">Local</span>') +
      "</header>" +
      composeHint +
      '<div class="soc-compose__row">' +
      '<input type="text" id="social-shout-text" maxlength="280" placeholder="Un mot sur une sortie, une envie…" />' +
      cloudShoutBtn +
      localShoutBtn +
      "</div>" +
      (signed ? '<div id="soc-cloud-shoutouts" class="home-murmurs__list"></div>' : "") +
      "</section>" +
      '<div class="soc-feed-stream">' +
      stream +
      "</div></div>" +
      '<aside class="soc-aside">' +
      trendHtml +
      renderSuggestAside() +
      '<div class="soc-aside-card soc-aside-card--cta"><h3>Messages</h3><p class="feed-note">Partage un album ou un live en DM.</p><button type="button" class="btn btn-primary btn-sm" data-nav-view="inbox">Ouvrir la messagerie</button></div>' +
      '<div class="soc-aside-card"><h3>Live culture</h3><p class="feed-note">Tampons concerts &amp; souvenirs.</p><button type="button" class="btn btn-ghost btn-sm" data-nav-view="social" data-hub-live="1">I was there !</button></div>' +
      "</aside></div>"
    );
  }


  function renderPeoplePanel() {
    d.ensureSocialArrays();
    const friends =
      d.state.friends.length === 0
        ? '<p class="soc-empty-inline">Pas encore d’ami·e — envoie une demande depuis un profil.</p>'
        : '<div class="soc-people-list">' +
          d.state.friends
            .map((fid) => {
              const u = d.userById(fid);
              if (!u) return "";
              const recent = d.state.listenings
                .filter((l) => l.userId === fid)
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .slice(0, 3);
              const stack = recent
                .map((l) => {
                  const al = d.albumById(l.albumId);
                  return al ? '<span class="soc-person__mini">' + d.coverHtml(al, true, "sm") + "</span>" : "";
                })
                .join("");
              return (
                '<article class="soc-person">' +
                '<button type="button" class="soc-person__link" data-profile="' +
                d.escapeHtml(u.id) +
                '">' +
                '<span class="soc-person__avatar" style="background:hsl(' +
                u.hue +
                ',55%,42%)">' +
                d.escapeHtml(u.name.charAt(0)) +
                "</span>" +
                '<span class="soc-person__info"><strong>' +
                d.escapeHtml(u.name) +
                '</strong><span class="soc-person__handle">@' +
                d.escapeHtml(u.handle) +
                '</span><span class="soc-person__compat" data-compat-hint="' +
                d.escapeHtml(u.id) +
                '">Compatibilité…</span></span>' +
                '<span class="soc-person__stack">' +
                stack +
                "</span></button>" +
                '<div class="soc-person__actions">' +
                '<button type="button" class="btn btn-ghost btn-sm" data-compat-detail="' +
                d.escapeHtml(u.id) +
                '">Match</button>' +
                '<button type="button" class="btn btn-primary btn-sm" data-nav-view="inbox">Message</button></div></article>'
              );
            })
            .join("") +
          "</div>";

    const incoming =
      d.state.incomingFriendRequests.length === 0
        ? ""
        : '<section class="soc-panel-section"><h2 class="soc-panel-section__title">Demandes reçues</h2><div class="soc-req-list">' +
          d.state.incomingFriendRequests
            .map((r) => {
              const u = d.userById(r.fromUserId);
              if (!u) return "";
              return (
                '<div class="soc-req-card">' +
                '<span class="soc-req-card__avatar" style="background:hsl(' +
                u.hue +
                ',55%,42%)">' +
                d.escapeHtml(u.name.charAt(0)) +
                "</span>" +
                '<div class="soc-req-card__body"><strong>' +
                d.escapeHtml(u.name) +
                '</strong><span class="feed-note">veut rejoindre ton cercle</span></div>' +
                '<div class="soc-req-card__actions">' +
                '<button type="button" class="btn btn-primary btn-sm" data-accept-friend="' +
                d.escapeHtml(r.id) +
                '">Accepter</button>' +
                '<button type="button" class="btn btn-ghost btn-sm" data-decline-friend="' +
                d.escapeHtml(r.id) +
                '">Refuser</button></div></div>'
              );
            })
            .join("") +
          "</div></section>";

    return friends + incoming;
  }

  function renderDiscoverPanel() {
    const signed = d.cloudSignedIn && d.cloudSignedIn();
    const meCloud = window.SLCloud && window.SLCloud.me && window.SLCloud.me.id;
    const cloudPeers = (window.__slCloudPeers
      ? [...window.__slCloudPeers.keys()].filter((id) => {
          if (!d.isCloudUuid(id)) return false;
          if (meCloud && id === meCloud) return false;
          return true;
        })
      : []
    ).slice(0, 24);

    const cloudHtml = cloudPeers
      .map((cid) => {
        const p = window.__slCloudPeers.get(cid);
        if (!p) return "";
        const fr = d.isFriend(cid);
        const pending = d.outgoingRequestTo(cid);
        const fol = (d.state.follows || []).includes(cid);
        const hue = p.hue != null ? p.hue : d.hueFromHandle(p.handle || p.name || "x");
        return (
          '<article class="soc-discover-card">' +
          '<span class="soc-discover-card__avatar" style="background:hsl(' +
          hue +
          ',55%,42%)">' +
          d.escapeHtml((p.name || "?").charAt(0)) +
          "</span>" +
          '<div><strong>' +
          d.escapeHtml(p.name || "?") +
          '</strong><span class="feed-note"> @' +
          d.escapeHtml(p.handle || "") +
          "</span></div>" +
          '<div class="soc-discover-card__actions">' +
          '<button type="button" class="btn ' +
          (fol ? "btn-ghost" : "btn-primary") +
          ' btn-sm" data-follow="' +
          d.escapeHtml(cid) +
          '">' +
          (fol ? "Abonné" : "Suivre") +
          "</button>" +
          (fr
            ? '<span class="friend-badge-inline">Ami·e</span>'
            : pending
              ? '<span class="feed-note">En attente</span>'
              : '<button type="button" class="btn btn-primary btn-sm" data-friend-req="' +
                d.escapeHtml(cid) +
                '">Ajouter</button>') +
          '<button type="button" class="btn btn-ghost btn-sm" data-profile="' +
          d.escapeHtml(cid) +
          '">Profil</button></div></article>'
        );
      })
      .join("");

    const emptyDiscover =
      !cloudHtml && !signed
        ? '<p class="feed-note soc-discover-empty">Connecte-toi pour découvrir les comptes de la communauté.</p>'
        : !cloudHtml
          ? '<p class="feed-note soc-discover-empty">Aucun autre profil pour l’instant — invite des ami·es.</p>'
          : "";
    return (
      '<div class="soc-invite-banner"><div><strong>Élargis ton cercle</strong><p class="feed-note">Suis des profils Soundlog ou invite des ami·es.</p></div><button type="button" class="btn btn-ghost btn-sm" id="btn-open-invite-modal">Inviter</button></div>' +
      '<div class="soc-discover-list">' +
      cloudHtml +
      emptyDiscover +
      "</div>"
    );
  }


  function renderGigsPanel() {
    const zone = String((d.state.settings && d.state.settings.alertCity) || "").trim();
    const desk = !!(d.state.settings && d.state.settings.desktopAlerts);
    const preview = (d.state.upcomingTourPreview || []).slice(0, 12);
    const manual = (d.state.manualTourDates || []).slice(0, 8);

    const cards = [...preview, ...manual.map((row) => ({ ...row, key: d.tourSeenKey(row.artist, row.datetime, [row.venue, row.city].filter(Boolean).join(" — ")), source: "manual" }))]
      .slice(0, 10)
      .map((row) => {
        const evKey = row.key || d.tourSeenKey(row.artist, row.datetime || row.datetime, [row.venue, row.city].filter(Boolean).join(" — "));
        const interested = !!(d.state.eventInterestLocal && d.state.eventInterestLocal[evKey]);
        const dt = (row.datetime || "").slice(0, 10);
        const g = d.gradientFromKey((row.artist || "") + dt);
        const fakeAl = { title: row.artist || "Live", artist: row.venue || row.city || "Concert", year: dt.slice(0, 4), from: g.from, to: g.to };
        return (
          '<article class="soc-gig-card soc-gig-card--poster">' +
          '<div class="soc-gig-card__poster" style="--poster-a:' +
          g.from +
          ";--poster-b:" +
          g.to +
          '"><span class="soc-gig-card__poster-date">' +
          d.escapeHtml(dt) +
          '</span><span class="soc-gig-card__poster-artist">' +
          d.escapeHtml(row.artist || "") +
          "</span></div>" +
          '<div class="soc-gig-card__visual">' +
          d.coverHtml(fakeAl, true, "sm") +
          "</div>" +
          '<div class="soc-gig-card__body">' +
          '<p class="soc-gig-card__date">' +
          d.escapeHtml(dt) +
          "</p>" +
          '<h3 class="soc-gig-card__artist">' +
          d.escapeHtml(row.artist || "") +
          "</h3>" +
          '<p class="soc-gig-card__venue">' +
          d.escapeHtml([row.venue, row.city].filter(Boolean).join(" · ") || "—") +
          "</p>" +
          '<div class="soc-gig-card__foot">' +
          '<button type="button" class="btn btn-ghost btn-sm event-interest-toggle' +
          (interested ? " is-on" : "") +
          '" data-ev-key="' +
          d.escapeHtml(evKey) +
          '" data-ev-artist="' +
          d.escapeHtml(row.artist || "") +
          '" data-ev-dt="' +
          d.escapeHtml(row.datetime || "") +
          '" data-ev-venue="' +
          d.escapeHtml(row.venue || "") +
          '" data-ev-city="' +
          d.escapeHtml(row.city || "") +
          '" data-ev-url="' +
          d.escapeHtml(row.url || "") +
          '">Intéressé·e</button>' +
          '<div class="event-friends-hint feed-note" data-ev-friends="' +
          d.escapeHtml(evKey) +
          '"></div></div></div></article>'
        );
      })
      .join("");

    return (
      '<section class="soc-live-tools panel">' +
      '<h2 class="soc-panel-section__title">Concerts & alertes</h2>' +
      '<p class="feed-note">Repère les dates près de chez toi — tes ami·es voient si tu es partant·e.</p>' +
      '<div class="soc-live-tools__row">' +
      '<label class="social-inline"><span>Ville</span><input type="text" id="social-city" value="' +
      d.escapeHtml(zone) +
      '" placeholder="Paris" /></label>' +
      '<label class="social-inline social-check"><input type="checkbox" id="social-desk" ' +
      (desk ? "checked" : "") +
      ' /> Alertes bureau</label>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="social-notif-perm">Notifications</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="social-sync-tours">Vérifier les dates</button></div>' +
      (cards ? '<div class="soc-gig-scroll">' + cards + "</div>" : '<p class="soc-empty-inline">Lance la vérification ou ajoute une date manuelle ci-dessous.</p>') +
      '<details class="soc-live-add"><summary>Ajouter une date manuelle</summary>' +
      '<div class="manual-tour-grid" style="margin-top:0.75rem">' +
      '<input type="text" id="social-man-artist" placeholder="Artiste" />' +
      '<input type="datetime-local" id="social-man-date" />' +
      '<input type="text" id="social-man-venue" placeholder="Salle" />' +
      '<input type="text" id="social-man-city" placeholder="Ville" /></div>' +
      '<p style="margin-top:0.5rem"><button type="button" class="btn btn-primary btn-sm" id="social-man-add">Enregistrer</button></p></details></section>'
    );
  }

  function renderCircle() {
    d.ensureSocialArrays();
    const circleTab = d.state.socialCircleTab || "feed";
    const nFriends = d.state.friends.length;
    const nFollow = (d.state.follows || []).length;
    const nPend = (d.state.incomingFriendRequests || []).length;
    const nListen = recentCircleListenings(100).length;
    const signed = d.cloudSignedIn && d.cloudSignedIn();

    let panel = "";
    if (circleTab === "people") panel = renderPeoplePanel();
    else if (circleTab === "discover") panel = renderDiscoverPanel();
    else if (circleTab === "gigs") panel = renderGigsPanel();
    else panel = renderFeedPanel();

    return (
      '<div class="view-page social-hub soc-page view-social-themed">' +
      '<header class="soc-hero">' +
      '<div class="soc-hero__copy">' +
      '<p class="soc-hero__kicker">Cercle musical</p>' +
      '<h1 class="soc-hero__title">Communauté</h1>' +
      '<p class="soc-hero__lead">Fil d’écoutes, compatibilité, murmures et concerts — ' +
      (signed ? "synchronisé avec ton compte." : "connecte-toi pour rejoindre la communauté en ligne.") +
      "</p></div>" +
      '<div class="soc-hero__stats">' +
      '<div class="soc-stat"><b>' +
      nFriends +
      '</b><span>ami·es</span></div>' +
      '<div class="soc-stat"><b>' +
      nFollow +
      '</b><span>suivis</span></div>' +
      '<div class="soc-stat"><b>' +
      nPend +
      '</b><span>demandes</span></div>' +
      '<div class="soc-stat"><b>' +
      nListen +
      '</b><span>écoutes cercle</span></div></div>' +
      '<div class="soc-hero__actions">' +
      '<button type="button" class="btn btn-primary btn-sm" data-nav-view="inbox">Messages</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav-view="home">Fil accueil</button></div></header>' +
      renderNotifStrip() +
      '<nav class="soc-tabs" aria-label="Sections cercle">' +
      tab("feed", "Fil", circleTab === "feed") +
      tab("people", "Personnes", circleTab === "people") +
      tab("discover", "Découvrir", circleTab === "discover") +
      tab("gigs", "Concerts", circleTab === "gigs") +
      "</nav>" +
      panel +
      "</div>"
    );
  }

  function renderLive() {
    const items = d.concertFeedItems();
    const mine = (d.state.concertLogs || []).filter((c) => c.userId === "me");
    const stats =
      '<div class="soc-live-stats">' +
      '<div class="soc-stat"><b>' +
      mine.length +
      '</b><span>mes tampons</span></div>' +
      '<div class="soc-stat"><b>' +
      items.length +
      '</b><span>cercle live</span></div></div>';

    const timeline =
      items.length === 0
        ? '<div class="soc-empty"><p class="soc-empty__title">Premier tampon</p><p>Chaque concert laisse une trace dans ton passeport culturel.</p></div>'
        : '<div class="soc-live-timeline">' +
          items
            .map((c) => {
              const u = d.userById(c.userId);
              if (!u) return "";
              const st = d.resolveVenueStamp(c);
              const where = [c.venue, c.city].filter(Boolean).join(" · ");
              const del =
                c.userId === "me"
                  ? '<button type="button" class="btn btn-ghost btn-sm" data-del-concert="' +
                    d.escapeHtml(c.id) +
                    '">Retirer</button>'
                  : "";
              const g = d.gradientFromKey((c.artist || "") + (c.date || ""));
              return (
                '<article class="passport-entry soc-live-entry">' +
                '<div class="soc-ticket" style="--poster-a:' +
                g.from +
                ";--poster-b:" +
                g.to +
                '">' +
                '<span class="soc-ticket__kicker">Billet · I was there</span>' +
                '<span class="soc-ticket__artist">' +
                d.escapeHtml(c.artist) +
                "</span>" +
                (c.eventTitle ? '<span class="soc-ticket__tour">' + d.escapeHtml(c.eventTitle) + "</span>" : "") +
                '<span class="soc-ticket__meta">' +
                d.escapeHtml(where || c.date) +
                "</span></div>" +
                '<div class="venue-stamp venue-stamp--' +
                d.escapeHtml(st.id) +
                '" style="--stamp-rot:' +
                st.rot +
                'deg">' +
                '<span class="venue-stamp-ring">' +
                d.escapeHtml(st.ring) +
                "</span>" +
                '<span class="venue-stamp-mid">' +
                d.escapeHtml(st.mid) +
                "</span>" +
                '<span class="venue-stamp-sub">' +
                d.escapeHtml(st.sub) +
                '</span><span class="venue-stamp-was">I was there!</span></div>' +
                '<div class="passport-visa">' +
                '<div class="visa-header"><span class="visa-badge">ENTRÉE</span><span class="visa-date">' +
                d.escapeHtml(c.date) +
                "</span></div>" +
                '<div class="visa-line"><span class="visa-k">Voyageur</span> <button type="button" class="link" data-profile="' +
                u.id +
                '">' +
                d.escapeHtml(u.name) +
                "</button></div>" +
                '<div class="visa-line"><span class="visa-k">Artiste</span> <strong>' +
                d.escapeHtml(c.artist) +
                "</strong></div>" +
                '<div class="visa-line"><span class="visa-k">Lieu</span> ' +
                d.escapeHtml(where || "—") +
                "</div>" +
                (c.notes && String(c.notes).trim()
                  ? '<div class="visa-memo">' + d.escapeHtml(c.notes) + "</div>"
                  : '<div class="visa-memo visa-muted">Souvenir à écrire…</div>') +
                '<div class="visa-footer">' +
                del +
                "</div></div></article>"
              );
            })
            .join("") +
          "</div>";

    return (
      '<div class="iwas-view view-themed soc-page">' +
      '<div class="passport-wrap">' +
      '<header class="passport-hero soc-hero--live">' +
      '<div class="passport-crest" aria-hidden="true">♫</div>' +
      '<div class="passport-hero-text">' +
      '<p class="passport-kicker">Carnet culturel</p>' +
      '<h1 class="passport-title">I was there !</h1>' +
      '<p class="passport-lead">Tampons de salles, visas de concerts, timeline partagée avec ton cercle.</p>' +
      stats +
      '<p><button type="button" class="btn btn-primary" id="btn-add-concert">+ Nouveau tampon</button></p></div></header>' +
      '<div class="passport-page"><div class="passport-page-inner">' +
      '<div class="passport-machine"><span>SOUNDLOG</span><span class="passport-dots">········</span><span>IWASTHERE</span></div>' +
      timeline +
      "</div></div></div></div>"
    );
  }


  function cloudCircleUserIds() {
    const ids = d.feedCircleIds();
    const meCloud = window.SLCloud && window.SLCloud.me && window.SLCloud.me.id;
    if (meCloud) ids.add(meCloud);
    return ids;
  }

  function renderCloudFeedInto(node, rows) {
    if (!node || !d.publicFeedPostHtml) return;
    const ids = cloudCircleUserIds();
    const filtered = (rows || []).filter((r) => r.user_id && ids.has(r.user_id));
    if (!filtered.length) {
      node.innerHTML =
        '<div class="soc-empty soc-empty--inline"><p class="feed-note">Aucune écoute cloud dans ton cercle pour l’instant. Invite des ami·es connecté·es ou publie une note depuis ton carnet.</p></div>';
      return;
    }
    node.innerHTML =
      '<p class="soc-cloud-feed__kicker">Fil synchronisé</p>' +
      filtered
        .map((r) => d.publicFeedPostHtml(r))
        .filter(Boolean)
        .join("");
  }

  function injectCircleCloudFeed() {
    const node = document.getElementById("soc-cloud-feed");
    if (!node) return;
    const filter = d.state.socialFeedFilter || "all";
    if (filter === "circle") return;
    const signed = d.cloudSignedIn && d.cloudSignedIn();
    if (!signed || !window.SLCloud || !window.SLCloud.publicFeed) {
      if (filter === "cloud") {
        node.innerHTML =
          '<div class="soc-empty soc-empty--inline"><p><strong>Mode en ligne</strong></p><p class="feed-note">Connecte ton compte Soundlog pour voir les écoutes synchronisées de ton cercle.</p></div>';
      }
      return;
    }
    const maxAge = 90000;
    const now = Date.now();
    if (circleCloudCache && now - circleCloudCache.at < maxAge) {
      renderCloudFeedInto(node, circleCloudCache.rows);
      return;
    }
    if (circleCloudFetch) return;
    circleCloudFetch = window.SLCloud.publicFeed(64)
      .then((rows) => {
        circleCloudCache = { rows: rows || [], at: Date.now() };
        circleCloudFetch = null;
        const n = document.getElementById("soc-cloud-feed");
        if (n) renderCloudFeedInto(n, circleCloudCache.rows);
      })
      .catch(() => {
        circleCloudFetch = null;
        node.innerHTML = '<p class="feed-note">Fil en ligne indisponible pour le moment.</p>';
      });
  }

  async function inject() {
    const cloudNode = document.getElementById("soc-cloud-shoutouts");
    if (cloudNode && window.__sl && window.__sl.renderCloudShoutoutsInto) {
      if (window.__sl.cloudShoutouts && window.__sl.cloudShoutouts.length) {
        window.__sl.renderCloudShoutoutsInto(cloudNode);
      } else if (window.__sl.refreshShoutouts) {
        window.__sl.refreshShoutouts();
      }
    }
    injectCircleCloudFeed();
    document.querySelectorAll("[data-compat-hint]").forEach(async (el) => {
      const uid = el.getAttribute("data-compat-hint");
      if (!uid || el.dataset.compatDone) return;
      el.dataset.compatDone = "1";
      try {
        const r = await d.computeMusicCompatibilityWith(uid);
        el.textContent = r.score + "% · " + r.shared + " albums";
      } catch (_) {
        el.textContent = "—";
      }
    });
    const bell = document.getElementById("soc-open-notif-bell");
    if (bell && !bell.dataset.bound) {
      bell.dataset.bound = "1";
      bell.addEventListener("click", () => {
        const b = document.getElementById("notif-bell");
        if (b) b.click();
      });
    }
    document.querySelectorAll(".soc-notif-pill[data-notif-id]").forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-notif-id");
        if (id && d.markNotificationRead) {
          d.markNotificationRead(id);
          d.persist();
        }
        const b = document.getElementById("notif-bell");
        if (b) b.click();
      });
    });
  }

  function install(deps) {
    d = deps;
    d.state.socialCircleTab = d.state.socialCircleTab || "feed";
    d.state.socialFeedFilter = d.state.socialFeedFilter || "all";
    d.state.socialReactions = d.state.socialReactions || {};
  }

  window.SLSocial = {
    install,
    renderCircle,
    renderLive,
    renderActivityRail,
    inject,
  };
})();
