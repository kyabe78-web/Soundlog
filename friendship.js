/**
 * Soundlog — graphe d'amitié (demandes, amis, sync cloud, optimistic UI).
 */
(function (global) {
  "use strict";

  const inFlight = new Set();
  const listeners = new Set();

  function isUuid(id) {
    if (global.SLPersistence && typeof global.SLPersistence.isUuid === "function") {
      return global.SLPersistence.isUuid(id);
    }
    return (
      typeof id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    );
  }

  function emitChange(reason) {
    listeners.forEach((fn) => {
      try {
        fn(reason);
      } catch (e) {
        console.warn("[SLFriendship]", e);
      }
    });
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function mapIncoming(rows) {
    return (rows || []).map((r) => ({
      id: r.id,
      fromUserId: r.from_user_id || r.fromUserId,
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    }));
  }

  function mapOutgoing(rows) {
    return (rows || []).map((r) => ({
      id: r.id,
      toUserId: r.to_user_id || r.toUserId,
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    }));
  }

  /** Garde une seule demande entrante par expéditeur (priorité UUID cloud). */
  function dedupeIncoming(list) {
    const byFrom = new Map();
    for (const r of list || []) {
      if (!r || !r.fromUserId) continue;
      const prev = byFrom.get(r.fromUserId);
      if (!prev) {
        byFrom.set(r.fromUserId, r);
        continue;
      }
      const pick =
        isUuid(r.id) && !isUuid(prev.id) ? r : isUuid(prev.id) ? prev : r.createdAt > prev.createdAt ? r : prev;
      byFrom.set(r.fromUserId, pick);
    }
    return [...byFrom.values()];
  }

  function dedupeOutgoing(list) {
    const byTo = new Map();
    for (const r of list || []) {
      if (!r || !r.toUserId) continue;
      const prev = byTo.get(r.toUserId);
      if (!prev) {
        byTo.set(r.toUserId, r);
        continue;
      }
      const pick =
        isUuid(r.id) && !isUuid(prev.id) ? r : isUuid(prev.id) ? prev : r.createdAt > prev.createdAt ? r : prev;
      byTo.set(r.toUserId, pick);
    }
    return [...byTo.values()];
  }

  /**
   * Applique le graphe cloud sur state (source de vérité quand connecté).
   * @param {object} state
   * @param {{ incoming?: object[], outgoing?: object[], friends?: object[] }} graph
   * @param {{ keepLocalFriends?: boolean, isLegacyDemoUserId?: (id:string)=>boolean }} opts
   */
  function applyGraphToState(state, graph, opts) {
    opts = opts || {};
    const isDemo = opts.isLegacyDemoUserId || (() => false);
    state.friends = state.friends || [];
    state.incomingFriendRequests = state.incomingFriendRequests || [];
    state.outgoingFriendRequests = state.outgoingFriendRequests || [];

    const cloudIncoming = dedupeIncoming(mapIncoming(graph.incoming));
    const cloudOut = dedupeOutgoing(mapOutgoing(graph.outgoing));
    const cloudFriendProfiles = graph.friends || [];
    const cloudFriendIds = cloudFriendProfiles.map((p) => p.id).filter(Boolean);

    if (opts.authoritative) {
      state.incomingFriendRequests = cloudIncoming;
      state.outgoingFriendRequests = cloudOut;
      const localFriends = (state.friends || []).filter((id) => !isUuid(id) && !isDemo(id));
      state.friends = [...new Set([...localFriends, ...cloudFriendIds])];
    } else {
      const incFrom = new Set(cloudIncoming.map((r) => r.fromUserId));
      const outTo = new Set(cloudOut.map((r) => r.toUserId));
      state.incomingFriendRequests = dedupeIncoming([
        ...cloudIncoming,
        ...(state.incomingFriendRequests || []).filter((r) => !incFrom.has(r.fromUserId)),
      ]);
      state.outgoingFriendRequests = dedupeOutgoing([
        ...cloudOut,
        ...(state.outgoingFriendRequests || []).filter((r) => !outTo.has(r.toUserId)),
      ]);
      const localFriends = (state.friends || []).filter((id) => !isUuid(id) && !isDemo(id));
      state.friends = [...new Set([...localFriends, ...cloudFriendIds, ...(state.friends || []).filter(isUuid)])];
      state.friends = [...new Set(state.friends.filter((id) => !isDemo(id) && (cloudFriendIds.includes(id) || !isUuid(id))))];
    }

    return { cloudFriendProfiles, needProfileIds: [...new Set([...cloudIncoming.map((r) => r.fromUserId), ...cloudOut.map((r) => r.toUserId)])] };
  }

  async function ensureCloudPeer(SLCloud, uid, cloudPeers) {
    if (!uid || !isUuid(uid) || !SLCloud || !cloudPeers) return false;
    if (cloudPeers.has(uid)) return true;
    if (!SLCloud.client) return false;
    try {
      const { data } = await SLCloud.client.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (data) {
        cloudPeers.set(data.id, data);
        return true;
      }
    } catch (e) {
      console.warn("[SLFriendship] ensureCloudPeer", e);
    }
    return false;
  }

  async function syncFromCloud(ctx) {
    const SLCloud = ctx.SLCloud;
    const state = ctx.state;
    if (!SLCloud || !SLCloud.isSignedIn || !SLCloud.isSignedIn()) return false;
    try {
      const graph = SLCloud.syncFriendGraph ? await SLCloud.syncFriendGraph() : null;
      if (!graph) return false;
      const { cloudFriendProfiles, needProfileIds } = applyGraphToState(state, graph, {
        authoritative: true,
        isLegacyDemoUserId: ctx.isLegacyDemoUserId,
      });
      if (ctx.registerCloudPeerProfiles) ctx.registerCloudPeerProfiles(cloudFriendProfiles);
      const cloudPeers = ctx.cloudPeers;
      const meId = SLCloud.me && SLCloud.me.id;
      if (cloudPeers && SLCloud.client && needProfileIds.length) {
        const missing = needProfileIds.filter((uid) => uid && uid !== meId && !cloudPeers.has(uid));
        if (missing.length) {
          const { data: profs } = await SLCloud.client.from("profiles").select("*").in("id", missing.slice(0, 40));
          if (profs && ctx.registerCloudPeerProfiles) ctx.registerCloudPeerProfiles(profs);
        }
      }
      emitChange("sync");
      return true;
    } catch (e) {
      console.warn("[SLFriendship] syncFromCloud", e);
      return false;
    }
  }

  function snapshotSocial(state) {
    return {
      friends: [...(state.friends || [])],
      incoming: (state.incomingFriendRequests || []).map((r) => ({ ...r })),
      outgoing: (state.outgoingFriendRequests || []).map((r) => ({ ...r })),
      follows: [...(state.follows || [])],
    };
  }

  function restoreSocial(state, snap) {
    state.friends = snap.friends;
    state.incomingFriendRequests = snap.incoming;
    state.outgoingFriendRequests = snap.outgoing;
    state.follows = snap.follows;
  }

  function findIncoming(state, reqId, fromUserId) {
    const list = state.incomingFriendRequests || [];
    if (reqId) {
      const byId = list.find((r) => r.id === reqId);
      if (byId) return byId;
    }
    if (fromUserId) return list.find((r) => r.fromUserId === fromUserId) || null;
    return null;
  }

  async function accept(ctx, reqId, fromUserId) {
    const state = ctx.state;
    const key = reqId || "from:" + fromUserId;
    if (inFlight.has(key)) return { ok: false, reason: "busy" };
    inFlight.add(key);

    const req = findIncoming(state, reqId, fromUserId);
    if (!req) {
      inFlight.delete(key);
      if (ctx.SLCloud && ctx.SLCloud.isSignedIn && ctx.SLCloud.isSignedIn()) {
        await syncFromCloud(ctx);
        ctx.persist && ctx.persist();
        ctx.render && ctx.render();
      }
      ctx.toast && ctx.toast("Demande introuvable — liste actualisée.");
      return { ok: false, reason: "not_found" };
    }

    const snap = snapshotSocial(state);
    state.incomingFriendRequests = (state.incomingFriendRequests || []).filter(
      (r) => r.fromUserId !== req.fromUserId
    );
    state.outgoingFriendRequests = (state.outgoingFriendRequests || []).filter((r) => r.toUserId !== req.fromUserId);
    if (!(state.friends || []).includes(req.fromUserId)) state.friends.push(req.fromUserId);
    if (!(state.follows || []).includes(req.fromUserId)) state.follows.push(req.fromUserId);
    ctx.persist && ctx.persist();
    emitChange("accept-optimistic");
    ctx.render && ctx.render();

    const SLCloud = ctx.SLCloud;
    const useCloud = SLCloud && SLCloud.isSignedIn && SLCloud.isSignedIn() && isUuid(req.id);

    try {
      if (useCloud) {
        await SLCloud.respondFriendRequest(req.id, true);
        await syncFromCloud(ctx);
      }
      const u = ctx.userById && ctx.userById(req.fromUserId);
      ctx.addNotification &&
        ctx.addNotification({
          type: "friend",
          title: "Demande d’ami acceptée",
          body: u ? `Tu es maintenant ami·e avec ${u.name}.` : "Nouvelle connexion.",
          meta: { userId: req.fromUserId },
        });
      ctx.persist && ctx.persist();
      ctx.toast && ctx.toast("Demande acceptée.");
      emitChange("accept");
      ctx.render && ctx.render();
      inFlight.delete(key);
      return { ok: true };
    } catch (e) {
      restoreSocial(state, snap);
      ctx.persist && ctx.persist();
      emitChange("accept-rollback");
      ctx.render && ctx.render();
      ctx.toast && ctx.toast("Erreur : " + (e.message || "impossible d’accepter"));
      inFlight.delete(key);
      return { ok: false, reason: "error", error: e };
    }
  }

  async function decline(ctx, reqId, fromUserId) {
    const state = ctx.state;
    const key = "decline:" + (reqId || fromUserId);
    if (inFlight.has(key)) return { ok: false };
    inFlight.add(key);
    const req = findIncoming(state, reqId, fromUserId);
    if (!req) {
      inFlight.delete(key);
      return { ok: false, reason: "not_found" };
    }
    const snap = snapshotSocial(state);
    state.incomingFriendRequests = (state.incomingFriendRequests || []).filter((r) => r.id !== req.id && r.fromUserId !== req.fromUserId);
    ctx.persist && ctx.persist();
    ctx.render && ctx.render();
    try {
      if (ctx.SLCloud && ctx.SLCloud.isSignedIn && ctx.SLCloud.isSignedIn() && isUuid(req.id)) {
        await ctx.SLCloud.respondFriendRequest(req.id, false);
        await syncFromCloud(ctx);
      }
      ctx.toast && ctx.toast("Demande refusée.");
      inFlight.delete(key);
      return { ok: true };
    } catch (e) {
      restoreSocial(state, snap);
      ctx.persist && ctx.persist();
      ctx.render && ctx.render();
      ctx.toast && ctx.toast("Erreur : " + (e.message || "impossible de refuser"));
      inFlight.delete(key);
      return { ok: false };
    }
  }

  async function cancelOutgoing(ctx, toUserId) {
    if (inFlight.has("cancel:" + toUserId)) return { ok: false };
    inFlight.add("cancel:" + toUserId);
    const state = ctx.state;
    const snap = snapshotSocial(state);
    state.outgoingFriendRequests = (state.outgoingFriendRequests || []).filter((r) => r.toUserId !== toUserId);
    ctx.persist && ctx.persist();
    ctx.render && ctx.render();
    try {
      if (ctx.SLCloud && ctx.SLCloud.isSignedIn && ctx.SLCloud.isSignedIn() && isUuid(toUserId)) {
        await ctx.SLCloud.cancelFriendRequest(toUserId);
        await syncFromCloud(ctx);
      }
      ctx.toast && ctx.toast("Demande annulée.");
      inFlight.delete("cancel:" + toUserId);
      return { ok: true };
    } catch (e) {
      restoreSocial(state, snap);
      ctx.persist && ctx.persist();
      ctx.render && ctx.render();
      ctx.toast && ctx.toast("Erreur : " + (e.message || "impossible d’annuler"));
      inFlight.delete("cancel:" + toUserId);
      return { ok: false };
    }
  }

  async function send(ctx, uid) {
    if (!uid || uid === "me") return { ok: false };
    const state = ctx.state;
    state.incomingFriendRequests = state.incomingFriendRequests || [];
    state.outgoingFriendRequests = state.outgoingFriendRequests || [];
    state.friends = state.friends || [];

    const inc = (state.incomingFriendRequests || []).find((r) => r.fromUserId === uid);
    if (inc) return accept(ctx, inc.id, uid);

    if ((state.friends || []).includes(uid)) {
      ctx.toast && ctx.toast("Vous êtes déjà ami·es.");
      return { ok: false };
    }
    if ((state.outgoingFriendRequests || []).some((r) => r.toUserId === uid)) {
      ctx.toast && ctx.toast("Demande déjà envoyée.");
      return { ok: false };
    }

    if (ctx.isLegacyDemoUserId && ctx.isLegacyDemoUserId(uid)) {
      ctx.toast && ctx.toast("Ce profil n’existe plus. Cherche un·e utilisateur·trice dans Communauté.");
      return { ok: false };
    }

    const SLCloud = ctx.SLCloud;
    const signedIn = SLCloud && SLCloud.isSignedIn && SLCloud.isSignedIn();
    const cloudTarget = signedIn && isUuid(uid);

    if (cloudTarget) {
      if (inFlight.has("send:" + uid)) return { ok: false };
      inFlight.add("send:" + uid);
      await ensureCloudPeer(SLCloud, uid, ctx.cloudPeers);
      const optimistic = {
        id: "fr-pending-" + uid,
        toUserId: uid,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      state.outgoingFriendRequests.push(optimistic);
      ctx.persist && ctx.persist();
      ctx.render && ctx.render();
      try {
        const row = await SLCloud.sendFriendRequest(uid);
        state.outgoingFriendRequests = (state.outgoingFriendRequests || []).filter((r) => r.toUserId !== uid);
        state.outgoingFriendRequests.push({
          id: row.id,
          toUserId: row.to_user_id || uid,
          createdAt: row.created_at || new Date().toISOString(),
        });
        ctx.persist && ctx.persist();
        ctx.toast && ctx.toast("Demande envoyée.");
        emitChange("send");
        ctx.render && ctx.render();
        inFlight.delete("send:" + uid);
        return { ok: true };
      } catch (e) {
        state.outgoingFriendRequests = (state.outgoingFriendRequests || []).filter((r) => r.toUserId !== uid);
        ctx.persist && ctx.persist();
        ctx.render && ctx.render();
        ctx.toast && ctx.toast("Erreur cloud : " + (e.message || "inconnue"));
        inFlight.delete("send:" + uid);
        return { ok: false };
      }
    }

    const id = "fr-out-" + Date.now().toString(36);
    state.outgoingFriendRequests.push({ id, toUserId: uid, createdAt: new Date().toISOString() });
    ctx.persist && ctx.persist();
    ctx.toast && ctx.toast("Demande envoyée (hors ligne).");
    ctx.render && ctx.render();
    return { ok: true };
  }

  async function removeFriend(ctx, uid) {
    const state = ctx.state;
    const snap = snapshotSocial(state);
    state.friends = (state.friends || []).filter((id) => id !== uid);
    state.follows = (state.follows || []).filter((id) => id !== uid);
    ctx.persist && ctx.persist();
    ctx.render && ctx.render();
    try {
      if (ctx.SLCloud && ctx.SLCloud.isSignedIn && ctx.SLCloud.isSignedIn() && isUuid(uid)) {
        await ctx.SLCloud.removeFriend(uid);
        await syncFromCloud(ctx);
      }
      emitChange("remove");
      return { ok: true };
    } catch (e) {
      restoreSocial(state, snap);
      ctx.persist && ctx.persist();
      ctx.render && ctx.render();
      ctx.toast && ctx.toast("Erreur serveur : " + (e.message || ""));
      return { ok: false };
    }
  }

  function setButtonBusy(btn, busy) {
    if (!btn) return;
    btn.disabled = !!busy;
    btn.classList.toggle("sl-friend-btn--busy", !!busy);
    btn.setAttribute("aria-busy", busy ? "true" : "false");
  }

  global.SLFriendship = {
    isUuid,
    onChange,
    emitChange,
    dedupeIncoming,
    dedupeOutgoing,
    applyGraphToState,
    syncFromCloud,
    ensureCloudPeer,
    accept,
    decline,
    cancelOutgoing,
    send,
    removeFriend,
    setButtonBusy,
    findIncoming,
  };
})(typeof window !== "undefined" ? window : globalThis);
