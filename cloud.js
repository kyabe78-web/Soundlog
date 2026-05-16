/* =========================================================================
   Soundlog Cloud — intégration Supabase
   Charge le SDK officiel, expose window.SLCloud avec auth + CRUD.
   Reste optionnel : sans config valide, l'app fonctionne 100% locale.
   ========================================================================= */
(function () {
  function readConfig() {
    const c = window.SLConfig || {};
    return {
      ...c,
      supabaseUrl: String(c.supabaseUrl || "").trim(),
      supabaseAnonKey: String(c.supabaseAnonKey || "").trim(),
    };
  }
  function hasValidConfig() {
    const c = readConfig();
    return !!(c.supabaseUrl && c.supabaseAnonKey && /^https?:\/\//i.test(c.supabaseUrl));
  }
  const HAS_CONFIG = hasValidConfig();

  function applyConfigScript(text) {
    // eslint-disable-next-line no-new-func
    new Function(text)();
  }

  async function tryLoadRuntimeConfig() {
    if (hasValidConfig()) return true;
    const urls = ["/soundlog-config.js", "/api/sl-config"];
    for (const url of urls) {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) continue;
        const ct = (r.headers.get("content-type") || "").toLowerCase();
        const text = await r.text();
        if (!text || text.trimStart().startsWith("<")) continue;
        if (ct && !ct.includes("javascript") && !ct.includes("json") && !ct.includes("text/plain")) continue;
        applyConfigScript(text);
        if (hasValidConfig()) {
          SLCloud.available = true;
          return true;
        }
      } catch (_) {}
    }
    SLCloud.available = hasValidConfig();
    return hasValidConfig();
  }

  const listeners = new Set();
  let readyEmitted = false;
  function emit(evt, payload) {
    if (evt === "ready") readyEmitted = true;
    listeners.forEach((cb) => { try { cb(evt, payload); } catch (_) {} });
  }

  let initPromise = null;
  let bootPromise = null;

  const SLCloud = {
    available: HAS_CONFIG,
    ready: false,
    client: null,
    session: null,
    me: null,         // profile row
    pendingError: null,
    on(cb) {
      listeners.add(cb);
      if (readyEmitted && this.ready) {
        try { cb("ready", { session: this.session, me: this.me }); } catch (_) {}
      }
      return () => listeners.delete(cb);
    },
    whenBooted() {
      return bootPromise || bootCloud();
    },

    async init() {
      if (!hasValidConfig()) return false;
      if (this.ready) return true;
      if (initPromise) return initPromise;
      initPromise = (async () => {
        try {
          await loadSdk();
          const { createClient } = window.supabase;
          const cfg = readConfig();
          this.client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
          });
          this.ready = true;
          const { data } = await this.client.auth.getSession();
          this.session = data.session || null;
          if (this.session) await this.refreshProfile();
          this.client.auth.onAuthStateChange(async (_e, sess) => {
            this.session = sess || null;
            if (sess) await this.refreshProfile();
            else this.me = null;
            emit("auth", { session: this.session, me: this.me });
          });
          emit("ready", { session: this.session, me: this.me });
          return true;
        } catch (e) {
          console.warn("[SLCloud] init failed", e);
          this.pendingError = e && e.message;
          initPromise = null;
          return false;
        }
      })();
      return initPromise;
    },

    /** Attendre que le SDK Supabase soit prêt (évite « Cloud non initialisé » à l’ouverture du menu). */
    async ensureReady() {
      await this.whenBooted();
      if (!hasValidConfig()) await tryLoadRuntimeConfig();
      if (!hasValidConfig()) {
        throw new Error(
          "Connexion cloud indisponible sur ce site. Ajoutez SL_SUPABASE_URL et SL_SUPABASE_ANON_KEY dans Vercel → Settings → Environment Variables (Production), puis Redeploy."
        );
      }
      const ok = await this.init();
      if (!ok || !this.ready) throw new Error(this.pendingError || "Impossible d’initialiser le cloud");
      return true;
    },

    isSignedIn() { return !!this.session; },

    async signUp({ email, password, handle, name, hue, bio }) {
      await this.ensureReady();
      // 1. Vérifier que le handle est libre
      const taken = await this.handleTaken(handle);
      if (taken) throw new Error("Ce @identifiant est déjà utilisé. Essaie une variante (ex. mariev2).");
      // 2. Créer l'auth user
      const { data, error } = await this.client.auth.signUp({ email, password });
      if (error) throw error;
      const uid = data.user && data.user.id;
      if (!uid) throw new Error("Pas d'identifiant utilisateur retourné.");
      // 3. Créer la ligne profil
      const profile = {
        id: uid,
        handle: (handle || "").toLowerCase(),
        name: name || handle,
        hue: hue || randomHue(),
        bio: bio || "",
      };
      const { error: pErr } = await this.client.from("profiles").insert(profile);
      if (pErr) throw pErr;
      this.session = data.session || null;
      await this.refreshProfile();
      return this.me;
    },

    async signIn({ email, password }) {
      await this.ensureReady();
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.session = data.session;
      await this.refreshProfile();
      if (!this.me) await this.ensureProfileAfterAuth();
      if (!this.me) throw new Error("Profil Soundlog introuvable. Réessaie ou crée un compte.");
      return this.me;
    },

    /** Crée une ligne profiles si l’utilisateur Auth existe sans profil (anciens comptes, import manuel). */
    async ensureProfileAfterAuth() {
      if (!this.session) return null;
      if (this.me) return this.me;
      const uid = this.session.user.id;
      const email = String(this.session.user.email || "");
      let base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 28);
      if (!base || base.length < 2) base = "user";
      let handle = base;
      for (let n = 0; n < 24; n++) {
        const taken = await this.handleTaken(handle);
        if (!taken) break;
        handle = `${base}${n + 1}`.slice(0, 32);
      }
      const profile = {
        id: uid,
        handle,
        name: base,
        hue: randomHue(),
        bio: "",
      };
      const { error } = await this.client.from("profiles").insert(profile);
      if (error) {
        console.warn("[SLCloud] ensureProfileAfterAuth", error);
        return null;
      }
      return this.refreshProfile();
    },

    async signInWithMagicLink({ email }) {
      await this.ensureReady();
      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      });
      if (error) throw error;
      return true;
    },

    async signOut() {
      if (!this.ready) return;
      await this.client.auth.signOut();
      this.session = null;
      this.me = null;
      emit("auth", { session: null, me: null });
    },

    async refreshProfile() {
      if (!this.session) { this.me = null; return null; }
      const uid = this.session.user.id;
      const { data, error } = await this.client.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (error) { console.warn(error); return null; }
      this.me = data || null;
      return this.me;
    },

    async updateProfile(patch) {
      if (!this.me) throw new Error("Pas connecté");
      const { data, error } = await this.client
        .from("profiles")
        .update(patch)
        .eq("id", this.me.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      this.me = data;
      emit("profile", this.me);
      return this.me;
    },

    async handleTaken(handle) {
      if (!handle) return true;
      const { data, error } = await this.client
        .from("profiles")
        .select("id")
        .eq("handle", String(handle).toLowerCase())
        .limit(1);
      if (error) return false;
      return (data || []).length > 0;
    },

    async getProfileById(id) {
      const { data } = await this.client.from("profiles").select("*").eq("id", id).maybeSingle();
      return data || null;
    },

    async getProfileByHandle(handle) {
      const { data } = await this.client
        .from("profiles")
        .select("*")
        .eq("handle", String(handle).toLowerCase())
        .maybeSingle();
      return data || null;
    },

    async searchCatalog(q, limit = 24) {
      const term = String(q || "").trim();
      if (term.length < 2) return { albums: [], profiles: [] };
      const { data, error } = await this.client.rpc("search_catalog", { q: term, limit_n: limit });
      if (error) {
        console.warn("[SLCloud] searchCatalog", error);
        return { albums: [], profiles: [] };
      }
      const payload = data && typeof data === "object" ? data : {};
      return {
        albums: Array.isArray(payload.albums) ? payload.albums : [],
        profiles: Array.isArray(payload.profiles) ? payload.profiles : [],
      };
    },

    async searchProfiles(query, limit = 20) {
      const q = String(query || "").trim().toLowerCase();
      if (!q) {
        const { data } = await this.client
          .from("profiles")
          .select("id,handle,name,bio,hue,city,avatar_url")
          .order("created_at", { ascending: false })
          .limit(limit);
        return data || [];
      }
      const { data } = await this.client
        .from("profiles")
        .select("id,handle,name,bio,hue,city,avatar_url")
        .or(`handle.ilike.%${q}%,name.ilike.%${q}%`)
        .limit(limit);
      return data || [];
    },

    // ---------- Albums (catalogue partagé) ----------
    async upsertAlbum(album) {
      if (!album || !album.id) return;
      const row = {
        id: album.id,
        title: album.title || "",
        artist: album.artist || "",
        year: Number(album.year) || null,
        genre: album.genre || "",
        artwork_url: album.artworkUrl || null,
        apple_collection_id: album.appleCollectionId ? String(album.appleCollectionId) : null,
        deezer_album_id: album.deezerAlbumId ? String(album.deezerAlbumId) : null,
        musicbrainz_release_id: album.musicbrainzReleaseId
          ? String(album.musicbrainzReleaseId)
          : album.musicbrainzId
            ? String(album.musicbrainzId)
            : null,
        added_by: (this.me && this.me.id) || null,
      };
      const { error } = await this.client.from("albums").upsert(row, { onConflict: "id" });
      if (error) console.warn("[SLCloud] upsertAlbum", error);
    },

    async getAlbumById(id) {
      const { data } = await this.client.from("albums").select("*").eq("id", id).maybeSingle();
      return data || null;
    },

    // ---------- Écoutes ----------
    async listListeningsByUser(userId, limit = 2000) {
      const { data, error } = await this.client
        .from("listenings")
        .select("id,user_id,album_id,rating,comment,comment_at,date,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) console.warn("[SLCloud] listListeningsByUser", error);
      return data || [];
    },

    async listListeningsForAlbum(albumId, limit = 40) {
      if (!albumId) return [];
      const { data, error } = await this.client
        .from("listenings")
        .select("id,user_id,album_id,rating,comment,comment_at,date,created_at, profiles(id,name,handle)")
        .eq("album_id", albumId)
        .order("date", { ascending: false })
        .limit(limit);
      if (error) {
        console.warn("[SLCloud] listListeningsForAlbum", error);
        return [];
      }
      return data || [];
    },

    async upsertListening(l) {
      const P = window.SLPersistence;
      if (!l || !l.id || !l.userId || !l.albumId) {
        return { ok: false, error: "missing_fields" };
      }
      if (!P || !P.isUuid(l.id)) {
        console.warn("[SLCloud] upsertListening: id invalide (UUID requis)", l.id);
        return { ok: false, error: "invalid_id" };
      }
      const rating = P ? P.normalizeRating(l.rating) : l.rating || null;
      const row = {
        id: l.id,
        user_id: l.userId,
        album_id: l.albumId,
        rating,
        comment: l.comment != null ? String(l.comment) : "",
        comment_at: l.commentAt || null,
        date: l.date || null,
      };
      const { error } = await this.client.from("listenings").upsert(row, { onConflict: "id" });
      if (error) {
        console.warn("[SLCloud] upsertListening", error.message || error, row.id);
        return { ok: false, error };
      }
      return { ok: true };
    },

    async deleteListening(id) {
      const P = window.SLPersistence;
      if (!id || (P && !P.isUuid(id))) return { ok: false, error: "invalid_id" };
      const { error } = await this.client.from("listenings").delete().eq("id", id);
      if (error) {
        console.warn("[SLCloud] deleteListening", error);
        return { ok: false, error };
      }
      return { ok: true };
    },

    /** Supprime côté cloud les écoutes absentes du snapshot local (ids UUID uniquement). */
    async syncListeningsSnapshot(cloudUserId, localRows) {
      if (!cloudUserId) return { ok: false };
      const remote = await this.listListeningsByUser(cloudUserId);
      const keep = new Set(
        (localRows || [])
          .map((l) => l && l.id)
          .filter((id) => id && (!window.SLPersistence || window.SLPersistence.isUuid(id)))
      );
      for (const r of remote) {
        if (r.id && !keep.has(r.id)) await this.deleteListening(r.id);
      }
      return { ok: true };
    },

    // ---------- Listes ----------
    async listListsByUser(userId) {
      const { data } = await this.client
        .from("lists")
        .select("id,user_id,title,description,is_public,created_at,list_items(album_id,position)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data || [];
    },

    async upsertList(list) {
      const row = {
        id: list.id,
        user_id: list.userId,
        title: list.title || "Sans titre",
        description: list.description || "",
        is_public: list.isPublic !== false,
      };
      const { error } = await this.client.from("lists").upsert(row, { onConflict: "id" });
      if (error) console.warn("[SLCloud] upsertList", error);
      if (Array.isArray(list.albumIds)) {
        await this.client.from("list_items").delete().eq("list_id", list.id);
        const items = list.albumIds.map((aid, i) => ({ list_id: list.id, album_id: aid, position: i }));
        if (items.length) {
          const { error: e2 } = await this.client.from("list_items").insert(items);
          if (e2) console.warn("[SLCloud] insert list_items", e2);
        }
      }
    },

    async deleteList(id) {
      const { error } = await this.client.from("lists").delete().eq("id", id);
      if (error) console.warn("[SLCloud] deleteList", error);
    },

    // ---------- Concerts ----------
    async listConcertsByUser(userId) {
      const { data } = await this.client
        .from("concerts")
        .select("id,user_id,artist,date,venue,city,event_title,notes,created_at")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      return data || [];
    },

    async upsertConcert(c) {
      const row = {
        id: c.id,
        user_id: c.userId,
        artist: c.artist || "",
        date: c.date || null,
        venue: c.venue || "",
        city: c.city || "",
        event_title: c.eventTitle || "",
        notes: c.notes || "",
      };
      const { error } = await this.client.from("concerts").upsert(row, { onConflict: "id" });
      if (error) console.warn("[SLCloud] upsertConcert", error);
    },

    async deleteConcert(id) {
      const { error } = await this.client.from("concerts").delete().eq("id", id);
      if (error) console.warn("[SLCloud] deleteConcert", error);
    },

    // ---------- Wishlist ----------
    async listWishlist(userId) {
      const { data } = await this.client.from("wishlist").select("album_id,reason,added_at").eq("user_id", userId);
      return (data || []).map((r) => r.album_id);
    },

    async addToWishlist(albumId, reason) {
      if (!this.me) return;
      const { error } = await this.client
        .from("wishlist")
        .upsert({ user_id: this.me.id, album_id: albumId, reason: reason || "" }, { onConflict: "user_id,album_id" });
      if (error) console.warn("[SLCloud] addToWishlist", error);
    },

    async removeFromWishlist(albumId) {
      if (!this.me) return;
      const { error } = await this.client
        .from("wishlist")
        .delete()
        .eq("user_id", this.me.id)
        .eq("album_id", albumId);
      if (error) console.warn("[SLCloud] removeFromWishlist", error);
    },

    // ---------- Follows ----------
    async listFollowing(userId) {
      const { data } = await this.client.from("follows").select("followee_id").eq("follower_id", userId);
      return (data || []).map((r) => r.followee_id);
    },

    async follow(targetId) {
      if (!this.me) return;
      const { error } = await this.client
        .from("follows")
        .upsert({ follower_id: this.me.id, followee_id: targetId }, { onConflict: "follower_id,followee_id" });
      if (error) console.warn("[SLCloud] follow", error);
    },

    async unfollow(targetId) {
      if (!this.me) return;
      const { error } = await this.client
        .from("follows")
        .delete()
        .eq("follower_id", this.me.id)
        .eq("followee_id", targetId);
      if (error) console.warn("[SLCloud] unfollow", error);
    },

    // ---------- Friend requests ----------
    async listFriendRequests() {
      if (!this.me) return { incoming: [], outgoing: [] };
      const { data } = await this.client
        .from("friend_requests")
        .select("*")
        .or(`from_user_id.eq.${this.me.id},to_user_id.eq.${this.me.id}`)
        .eq("status", "pending");
      const incoming = (data || []).filter((r) => r.to_user_id === this.me.id);
      const outgoing = (data || []).filter((r) => r.from_user_id === this.me.id);
      return { incoming, outgoing };
    },

    async sendFriendRequest(targetId) {
      if (!this.me) throw new Error("Pas connecté");
      if (targetId === this.me.id) throw new Error("Impossible de s’ajouter soi-même");
      const { data, error } = await this.client
        .from("friend_requests")
        .insert({ from_user_id: this.me.id, to_user_id: targetId, status: "pending" })
        .select("id, from_user_id, to_user_id, status, created_at")
        .single();
      if (error) throw error;
      return data;
    },

    async cancelFriendRequest(targetId) {
      if (!this.me) return;
      const { error } = await this.client
        .from("friend_requests")
        .delete()
        .eq("from_user_id", this.me.id)
        .eq("to_user_id", targetId)
        .eq("status", "pending");
      if (error) console.warn(error);
    },

    async respondFriendRequest(reqId, accept) {
      if (!this.me) throw new Error("Pas connecté");
      if (accept) {
        const { error } = await this.client.rpc("accept_friend_request", { req_id: reqId });
        if (error) throw error;
      } else {
        const { error } = await this.client.rpc("decline_friend_request", { req_id: reqId });
        if (error) {
          const fallback = await this.client
            .from("friend_requests")
            .update({ status: "rejected", updated_at: new Date().toISOString() })
            .eq("id", reqId)
            .eq("to_user_id", this.me.id);
          if (fallback.error) throw fallback.error;
        }
      }
    },

    async syncFriendGraph() {
      const [friends, friendRequests] = await Promise.all([this.listFriends(), this.listFriendRequests()]);
      return {
        friends: friends || [],
        incoming: (friendRequests && friendRequests.incoming) || [],
        outgoing: (friendRequests && friendRequests.outgoing) || [],
      };
    },

    async listFriends() {
      if (!this.me) return [];
      const uid = this.me.id;
      const { data } = await this.client
        .from("friends")
        .select("a_id,b_id")
        .or(`a_id.eq.${uid},b_id.eq.${uid}`);
      const ids = (data || []).map((r) => (r.a_id === uid ? r.b_id : r.a_id));
      if (!ids.length) return [];
      const { data: profs } = await this.client.from("profiles").select("*").in("id", ids);
      return profs || [];
    },

    async removeFriend(otherId) {
      if (!this.me) return;
      const a = this.me.id < otherId ? this.me.id : otherId;
      const b = this.me.id < otherId ? otherId : this.me.id;
      const { error } = await this.client.from("friends").delete().eq("a_id", a).eq("b_id", b);
      if (error) console.warn(error);
    },

    // ---------- Shoutouts ----------
    async listShoutouts(limit = 25) {
      const { data } = await this.client
        .from("shoutouts")
        .select("id,user_id,text,created_at,profiles:user_id(handle,name,hue)")
        .order("created_at", { ascending: false })
        .limit(limit);
      return data || [];
    },

    async postShoutout(text) {
      if (!this.me) throw new Error("Pas connecté");
      const { data, error } = await this.client
        .from("shoutouts")
        .insert({ user_id: this.me.id, text })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    // ---------- Likes ----------
    async toggleListeningLike(listeningId) {
      if (!this.me) throw new Error("Pas connecté");
      const { data: existing } = await this.client
        .from("listening_likes")
        .select("listening_id")
        .eq("user_id", this.me.id)
        .eq("listening_id", listeningId)
        .maybeSingle();
      if (existing) {
        const { error } = await this.client
          .from("listening_likes")
          .delete()
          .eq("user_id", this.me.id)
          .eq("listening_id", listeningId);
        if (error) throw error;
        return { liked: false };
      }
      const { error } = await this.client
        .from("listening_likes")
        .insert({ user_id: this.me.id, listening_id: listeningId });
      if (error) throw error;
      return { liked: true };
    },

    async fetchLikeState(listeningIds) {
      const ids = [...new Set((listeningIds || []).filter(Boolean))];
      if (!ids.length) return { counts: {}, mine: new Set() };
      const { data: countRows, error: cErr } = await this.client
        .from("listening_likes")
        .select("listening_id")
        .in("listening_id", ids);
      if (cErr) {
        console.warn("[SLCloud] like counts", cErr);
        return { counts: {}, mine: new Set() };
      }
      const counts = {};
      (countRows || []).forEach((r) => {
        counts[r.listening_id] = (counts[r.listening_id] || 0) + 1;
      });
      const mine = new Set();
      if (this.me) {
        const { data: myRows } = await this.client
          .from("listening_likes")
          .select("listening_id")
          .eq("user_id", this.me.id)
          .in("listening_id", ids);
        (myRows || []).forEach((r) => mine.add(r.listening_id));
      }
      return { counts, mine };
    },

    async listReactionsForListenings(listeningIds) {
      const ids = [...new Set((listeningIds || []).filter(Boolean))];
      if (!ids.length) return {};
      const { data, error } = await this.client
        .from("listening_reactions")
        .select("listening_id, emoji, user_id, profiles:user_id(id,name,handle,hue)")
        .in("listening_id", ids);
      if (error) {
        console.warn("[SLCloud] listReactionsForListenings", error);
        return {};
      }
      const out = {};
      (data || []).forEach((row) => {
        const lid = row.listening_id;
        if (!out[lid]) out[lid] = { counts: {}, users: {}, mine: new Set() };
        const em = row.emoji;
        out[lid].counts[em] = (out[lid].counts[em] || 0) + 1;
        if (!out[lid].users[em]) out[lid].users[em] = [];
        if (row.profiles) out[lid].users[em].push(row.profiles);
        if (this.me && row.user_id === this.me.id) out[lid].mine.add(em);
      });
      return out;
    },

    async toggleListeningReaction(listeningId, emoji) {
      if (!this.me) throw new Error("Pas connecté");
      const em = String(emoji || "").trim();
      if (!em) throw new Error("Réaction invalide");
      const { data: existing } = await this.client
        .from("listening_reactions")
        .select("emoji")
        .eq("user_id", this.me.id)
        .eq("listening_id", listeningId)
        .eq("emoji", em)
        .maybeSingle();
      if (existing) {
        const { error } = await this.client
          .from("listening_reactions")
          .delete()
          .eq("user_id", this.me.id)
          .eq("listening_id", listeningId)
          .eq("emoji", em);
        if (error) throw error;
        return { active: false, emoji: em };
      }
      const { error } = await this.client.from("listening_reactions").insert({
        user_id: this.me.id,
        listening_id: listeningId,
        emoji: em,
      });
      if (error) throw error;
      return { active: true, emoji: em };
    },

    async fetchListeningSocialState(listeningIds) {
      const ids = [...new Set((listeningIds || []).filter(Boolean))];
      if (!ids.length) return { likes: { counts: {}, mine: new Set() }, reactions: {}, commentCounts: {} };
      const [likes, reactions, commentRows] = await Promise.all([
        this.fetchLikeState(ids),
        this.listReactionsForListenings(ids),
        this.client
          .from("comments")
          .select("listening_id")
          .in("listening_id", ids),
      ]);
      const commentCounts = {};
      if (!commentRows.error) {
        (commentRows.data || []).forEach((r) => {
          commentCounts[r.listening_id] = (commentCounts[r.listening_id] || 0) + 1;
        });
      }
      return { likes, reactions, commentCounts };
    },

    async listCircleListenings(limit = 48) {
      if (!this.me) return [];
      const [following, friends] = await Promise.all([this.listFollowing(), this.listFriends()]);
      const ids = new Set(following || []);
      (friends || []).forEach((p) => {
        if (p && p.id && p.id !== this.me.id) ids.add(p.id);
      });
      const userIds = [...ids];
      if (!userIds.length) return [];
      const { data, error } = await this.client
        .from("listenings")
        .select(
          "id,user_id,album_id,rating,comment,comment_at,date,created_at, profiles:user_id(id,name,handle,hue), albums:album_id(id,title,artist,year,artwork_url)"
        )
        .in("user_id", userIds)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) {
        console.warn("[SLCloud] listCircleListenings", error);
        return [];
      }
      return data || [];
    },

    async listCommentsForListening(listeningId, limit = 80) {
      const { data } = await this.client
        .from("comments")
        .select(
          "id,listening_id,author_id,text,created_at,parent_id, profiles:author_id(handle,name,hue)"
        )
        .eq("listening_id", listeningId)
        .order("created_at", { ascending: true })
        .limit(limit);
      return data || [];
    },

    async postComment(listeningId, text, parentId) {
      if (!this.me) throw new Error("Pas connecté");
      const row = {
        listening_id: listeningId,
        author_id: this.me.id,
        text: String(text || "").trim(),
      };
      if (parentId) row.parent_id = parentId;
      const { data, error } = await this.client.from("comments").insert(row).select().maybeSingle();
      if (error) throw error;
      return data;
    },

    async deleteComment(commentId) {
      if (!this.me) throw new Error("Pas connecté");
      const { error } = await this.client
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("author_id", this.me.id);
      if (error) throw error;
      return { ok: true };
    },

    async toggleCommentLike(commentId) {
      if (!this.me) throw new Error("Pas connecté");
      const { data: existing } = await this.client
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", this.me.id)
        .eq("comment_id", commentId)
        .maybeSingle();
      if (existing) {
        const { error } = await this.client
          .from("comment_likes")
          .delete()
          .eq("user_id", this.me.id)
          .eq("comment_id", commentId);
        if (error) throw error;
        return { liked: false };
      }
      const { error } = await this.client
        .from("comment_likes")
        .insert({ user_id: this.me.id, comment_id: commentId });
      if (error) throw error;
      return { liked: true };
    },

    async fetchCommentLikeState(commentIds) {
      const ids = [...new Set((commentIds || []).filter(Boolean))];
      if (!ids.length) return { counts: {}, mine: new Set() };
      const { data: countRows } = await this.client.from("comment_likes").select("comment_id").in("comment_id", ids);
      const counts = {};
      (countRows || []).forEach((r) => {
        counts[r.comment_id] = (counts[r.comment_id] || 0) + 1;
      });
      const mine = new Set();
      if (this.me) {
        const { data: myRows } = await this.client
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", this.me.id)
          .in("comment_id", ids);
        (myRows || []).forEach((r) => mine.add(r.comment_id));
      }
      return { counts, mine };
    },

    // ---------- Notifications serveur ----------
    async listNotifications(limit = 40) {
      if (!this.me) return [];
      const { data, error } = await this.client
        .from("notifications")
        .select("id,recipient_id,actor_id,type,title,body,meta,read_at,created_at,profiles:actor_id(handle,name,hue)")
        .eq("recipient_id", this.me.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) {
        console.warn("[SLCloud] notifications", error);
        return [];
      }
      return data || [];
    },

    async markNotificationRead(id) {
      if (!this.me || !id) return;
      const { error } = await this.client
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .eq("recipient_id", this.me.id);
      if (error) console.warn("[SLCloud] markNotificationRead", error);
    },

    async markAllNotificationsRead() {
      if (!this.me) return;
      const { error } = await this.client
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", this.me.id)
        .is("read_at", null);
      if (error) console.warn("[SLCloud] markAllNotificationsRead", error);
    },

    // ---------- Feed public ----------
    async publicFeed(limit = 50) {
      const { data } = await this.client
        .from("public_feed")
        .select("*")
        .limit(limit);
      return data || [];
    },

    // ---------- Avatars ----------
    avatarMaxBytes: 10 * 1024 * 1024,

    async uploadAvatar(file) {
      if (!this.me) throw new Error("Pas connecté");
      if (file.size > this.avatarMaxBytes) {
        throw new Error("Image trop lourde (max 10 Mo).");
      }
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${this.me.id}/avatar.${ext}`;
      const { error } = await this.client.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/png",
      });
      if (error) throw error;
      const { data } = this.client.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl + "?t=" + Date.now();
      await this.updateProfile({ avatar_url: url });
      return url;
    },

    // ---------- Statistiques utilisateur ----------
    platformLabels: {
      spotify: "Spotify",
      deezer: "Deezer",
      youtube: "YouTube",
      lastfm: "Last.fm",
      manual: "Import manuel",
      apple: "Apple Music",
    },

    async getUserStats(userId) {
      const { data, error } = await this.client.from("user_stats").select("*").eq("user_id", userId).maybeSingle();
      if (error) {
        console.warn("[user_stats]", error);
        return null;
      }
      return data || null;
    },
    async getListeningRank(userId) {
      const { data, error } = await this.client.from("leaderboard_listening").select("*").eq("user_id", userId).maybeSingle();
      if (error) {
        console.warn("[leaderboard_listening]", error);
        return null;
      }
      return data || null;
    },
    async getListeningLeaderboard(limit = 32) {
      const { data, error } = await this.client
        .from("leaderboard_listening")
        .select("user_id,handle,name,rank_listen,library_minutes,recent_listen_minutes,combined_minutes,leaderboard_size")
        .order("rank_listen", { ascending: true })
        .limit(limit);
      if (error) {
        console.warn("[leaderboard_listening list]", error);
        return [];
      }
      return data || [];
    },

    /** Playlists importées + session Spotify locale = plateformes « connectées ». */
    async getConnectedPlatforms(userId) {
      const uid = userId || (this.me && this.me.id);
      if (!uid) return [];
      const sources = new Set();
      try {
        const playlists = await this.listImportedPlaylists(uid);
        playlists.forEach((p) => {
          if (p.source) sources.add(String(p.source).toLowerCase());
        });
      } catch (e) {
        console.warn("[getConnectedPlatforms]", e);
      }
      if (this.spotify && this.spotify.isConfigured() && this.spotify.hasToken()) sources.add("spotify");
      return [...sources].sort();
    },

    listLastfmUsernamesFromImports(playlists) {
      const users = new Set();
      (playlists || []).forEach((p) => {
        if (p.source !== "lastfm") return;
        const rid = String(p.remote_id || "");
        if (rid) users.add(rid);
        else if (String(p.id || "").startsWith("lastfm:user:")) users.add(String(p.id).slice("lastfm:user:".length));
      });
      return [...users];
    },

    /** Agrège durées / volumes par plateforme (imports + événements streaming). */
    async getListeningStatsByPlatform(userId) {
      const uid = userId || (this.me && this.me.id);
      if (!uid) return [];
      const bySource = {};
      const touch = (source) => {
        const k = String(source || "unknown").toLowerCase();
        if (!bySource[k]) {
          bySource[k] = {
            source: k,
            label: (this.platformLabels && this.platformLabels[k]) || k,
            playlists: 0,
            tracks: 0,
            tracks_with_duration: 0,
            imported_ms: 0,
            stream_plays: 0,
            stream_ms: 0,
          };
        }
        return bySource[k];
      };

      try {
        const playlists = await this.listImportedPlaylists(uid);
        playlists.forEach((p) => {
          const row = touch(p.source);
          row.playlists += 1;
        });
      } catch (e) {
        console.warn("[stats playlists]", e);
      }

      try {
        const { data: tracks, error } = await this.client
          .from("imported_tracks")
          .select("source,duration_ms")
          .eq("user_id", uid)
          .limit(15000);
        if (error) throw error;
        (tracks || []).forEach((t) => {
          const row = touch(t.source);
          row.tracks += 1;
          const d = Number(t.duration_ms) || 0;
          if (d > 0) {
            row.tracks_with_duration += 1;
            row.imported_ms += d;
          }
        });
      } catch (e) {
        console.warn("[stats imported_tracks]", e);
      }

      try {
        const { data: events, error } = await this.client
          .from("streaming_play_events")
          .select("source,duration_ms")
          .eq("user_id", uid)
          .limit(20000);
        if (error) throw error;
        (events || []).forEach((e) => {
          const row = touch(e.source);
          row.stream_plays += 1;
          const d = Number(e.duration_ms) || 0;
          if (d > 0) row.stream_ms += d;
        });
      } catch (e) {
        console.warn("[stats streaming_play_events]", e);
      }

      const connected = await this.getConnectedPlatforms(uid);
      connected.forEach((s) => touch(s));

      return Object.values(bySource)
        .map((row) => ({
          ...row,
          combined_ms: row.imported_ms + row.stream_ms,
          connected: connected.includes(row.source),
        }))
        .filter((row) => row.connected || row.tracks > 0 || row.stream_plays > 0 || row.playlists > 0)
        .sort((a, b) => b.combined_ms - a.combined_ms);
    },

    /** Stats dérivées des tables brutes si la vue user_stats v4 est absente. */
    async computeListeningTotals(userId, platformRows) {
      const rows = platformRows || (await this.getListeningStatsByPlatform(userId));
      let imported_ms = 0;
      let streaming_recent_ms = 0;
      let streaming_recent_plays = 0;
      let total_imported_tracks = 0;
      rows.forEach((r) => {
        imported_ms += r.imported_ms;
        streaming_recent_ms += r.stream_ms;
        streaming_recent_plays += r.stream_plays;
        total_imported_tracks += r.tracks;
      });
      return { imported_ms, streaming_recent_ms, streaming_recent_plays, total_imported_tracks };
    },

    /** Enregistre l’historique « Recently Played » Spotify (session locale requise). */
    async syncSpotifyPlayHistory() {
      if (!this.me) throw new Error("Pas connecté Soundlog");
      const events = await this.spotify.fetchAllRecentlyPlayed();
      if (!events.length) return { inserted: 0, source: "spotify" };
      return { inserted: await this.upsertStreamingPlayEvents(events), source: "spotify" };
    },

    /** Dernières écoutes Last.fm → streaming_play_events (pseudo importé requis). */
    async syncLastfmPlayHistory(username) {
      if (!this.me) throw new Error("Pas connecté Soundlog");
      const key = (window.SLConfig && window.SLConfig.lastfmApiKey) || "";
      if (!key) throw new Error("lastfmApiKey manquant dans config.js");
      const user = String(username || "").trim();
      if (!user) throw new Error("Pseudo Last.fm requis");
      const events = [];
      let page = 1;
      for (let guard = 0; guard < 12; guard++) {
        const url =
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}` +
          `&api_key=${encodeURIComponent(key)}&format=json&limit=200&page=${page}`;
        const res = await fetch(url);
        const j = await res.json();
        if (j.error) throw new Error(j.message || "Last.fm inaccessible");
        const batch = j.recenttracks && j.recenttracks.track;
        const list = Array.isArray(batch) ? batch : batch ? [batch] : [];
        if (!list.length) break;
        list.forEach((t) => {
          if (t["@attr"] && t["@attr"].nowplaying === "true") return;
          const played = t.date && (t.date.uts || t.date["#text"]);
          if (!played) return;
          const playedAt = t.date && t.date.uts
            ? new Date(Number(t.date.uts) * 1000).toISOString()
            : new Date(String(played)).toISOString();
          const durSec = t.duration ? Number(t.duration) : 0;
          events.push({
            source: "lastfm",
            remote_track_id: t.mbid || `${user}:${t.artist && t.artist["#text"]}:${t.name}`,
            track_name: t.name || "",
            artist_name: (t.artist && (t.artist["#text"] || t.artist.name)) || "",
            duration_ms: durSec > 0 ? durSec * 1000 : 210000,
            played_at: playedAt,
          });
        });
        const totalPages = Number(j.recenttracks && j.recenttracks["@attr"] && j.recenttracks["@attr"].totalPages) || 1;
        if (page >= totalPages) break;
        page += 1;
      }
      if (!events.length) return { inserted: 0, source: "lastfm", username: user };
      return { inserted: await this.upsertStreamingPlayEvents(events), source: "lastfm", username: user };
    },

    /** Sync historique récent pour chaque plateforme connectée (Spotify + Last.fm importés). */
    async syncAllConnectedPlatforms() {
      if (!this.me) throw new Error("Pas connecté Soundlog");
      const results = [];
      const playlists = await this.listImportedPlaylists(this.me.id);
      if (this.spotify && this.spotify.isConfigured() && this.spotify.hasToken()) {
        try {
          results.push(await this.syncSpotifyPlayHistory());
        } catch (e) {
          results.push({ source: "spotify", inserted: 0, error: e.message || String(e) });
        }
      }
      const lastfmUsers = this.listLastfmUsernamesFromImports(playlists);
      const key = (window.SLConfig && window.SLConfig.lastfmApiKey) || "";
      if (key) {
        for (const user of lastfmUsers) {
          try {
            results.push(await this.syncLastfmPlayHistory(user));
          } catch (e) {
            results.push({ source: "lastfm", username: user, inserted: 0, error: e.message || String(e) });
          }
        }
      }
      return results;
    },
    async upsertStreamingPlayEvents(events) {
      if (!this.me || !events.length) return 0;
      const rows = events.map((e) => ({
        user_id: this.me.id,
        source: e.source,
        remote_track_id: e.remote_track_id || "",
        track_name: e.track_name || "",
        artist_name: e.artist_name || "",
        duration_ms: e.duration_ms != null ? e.duration_ms : null,
        played_at: e.played_at,
      }));
      let done = 0;
      const chunk = 180;
      for (let i = 0; i < rows.length; i += chunk) {
        const slice = rows.slice(i, i + chunk);
        const { error } = await this.client.from("streaming_play_events").upsert(slice, {
          onConflict: "user_id,source,remote_track_id,played_at",
        });
        if (error) {
          console.warn("[streaming_play_events]", error);
          throw error;
        }
        done += slice.length;
      }
      return done;
    },
    async getTopArtists(userId, limit = 20) {
      const { data } = await this.client
        .from("user_top_artists")
        .select("artist_name,track_count,last_seen")
        .eq("user_id", userId)
        .order("track_count", { ascending: false })
        .limit(limit);
      return data || [];
    },
    async getRecommendations(userId, limit = 12) {
      const { data, error } = await this.client.rpc("recommendations_for", { uid: userId, limit_n: limit });
      if (error) { console.warn(error); return []; }
      return data || [];
    },

    // ---------- Playlists importées ----------
    async upsertImportedPlaylist(p) {
      if (!this.me) throw new Error("Pas connecté");
      const row = {
        id: p.id,
        user_id: this.me.id,
        source: p.source,
        remote_id: p.remoteId,
        name: p.name,
        description: p.description || "",
        artwork_url: p.artworkUrl,
        raw: p.raw || {},
      };
      const { error } = await this.client.from("imported_playlists").upsert(row, { onConflict: "id" });
      if (error) throw error;
    },
    async insertImportedTracks(tracks) {
      if (!this.me || !tracks.length) return;
      const rows = tracks.map((t) => ({
        user_id: this.me.id,
        playlist_id: t.playlistId || null,
        source: t.source,
        track_name: t.trackName,
        artist_name: t.artistName,
        album_name: t.albumName,
        album_year: t.albumYear || null,
        album_artwork_url: t.albumArtworkUrl || null,
        remote_track_id: t.remoteTrackId || null,
        remote_album_id: t.remoteAlbumId || null,
        duration_ms: t.durationMs != null && t.durationMs > 0 ? Math.round(t.durationMs) : null,
      }));
      const chunk = 500;
      for (let i = 0; i < rows.length; i += chunk) {
        const { error } = await this.client.from("imported_tracks").insert(rows.slice(i, i + chunk));
        if (error) { console.warn("[imported_tracks insert]", error); throw error; }
      }
    },
    async listImportedPlaylists(userId) {
      const { data } = await this.client
        .from("imported_playlists")
        .select("*")
        .eq("user_id", userId)
        .order("imported_at", { ascending: false });
      return data || [];
    },
    async listImportedTracks(userId, playlistId, limit = 2500) {
      let q = this.client
        .from("imported_tracks")
        .select("*")
        .eq("user_id", userId)
        .order("added_at", { ascending: true })
        .limit(limit);
      if (playlistId) q = q.eq("playlist_id", playlistId);
      const { data } = await q;
      return data || [];
    },
    async deleteImportedPlaylist(id) {
      const { error } = await this.client.from("imported_playlists").delete().eq("id", id);
      if (error) console.warn(error);
      await this.client.from("imported_tracks").delete().eq("playlist_id", id);
    },

    // ---------- Intérêts concerts (dates à venir) ----------
    async upsertEventInterest(payload) {
      if (!this.me) throw new Error("Pas connecté");
      const row = {
        user_id: this.me.id,
        event_key: payload.eventKey,
        artist: payload.artist || "",
        datetime_iso: payload.datetimeIso || "",
        venue: payload.venue || "",
        city: payload.city || "",
        event_url: payload.eventUrl || "",
      };
      const { error } = await this.client.from("event_interests").upsert(row, { onConflict: "user_id,event_key" });
      if (error) throw error;
    },

    async removeEventInterest(eventKey) {
      if (!this.me) return;
      await this.client.from("event_interests").delete().eq("user_id", this.me.id).eq("event_key", eventKey);
    },

    async listEventInterestsForKey(eventKey) {
      const { data } = await this.client
        .from("event_interests")
        .select("user_id, created_at, profiles:user_id(id,handle,name,hue,avatar_url)")
        .eq("event_key", eventKey);
      return data || [];
    },

    async listMyEventInterestKeys() {
      if (!this.me) return [];
      const { data } = await this.client.from("event_interests").select("event_key").eq("user_id", this.me.id);
      return (data || []).map((r) => r.event_key);
    },

    // ---------- Messages privés (ami·es uniquement) ----------
    async areFriends(otherUserId) {
      if (!this.me || !otherUserId) return false;
      const a = this.me.id < otherUserId ? this.me.id : otherUserId;
      const b = this.me.id < otherUserId ? otherUserId : this.me.id;
      const { data } = await this.client.from("friends").select("a_id").eq("a_id", a).eq("b_id", b).maybeSingle();
      return !!data;
    },

    async ensureDmThread(otherUserId) {
      if (!this.me) throw new Error("Pas connecté");
      if (otherUserId === this.me.id) throw new Error("Impossible d’écrire à soi-même");
      const ok = await this.areFriends(otherUserId);
      if (!ok) throw new Error("Tu ne peux écrire qu’à tes ami·es Soundlog.");
      const a = this.me.id < otherUserId ? this.me.id : otherUserId;
      const b = this.me.id < otherUserId ? otherUserId : this.me.id;
      const { data: ex } = await this.client.from("dm_threads").select("id").eq("user_a", a).eq("user_b", b).maybeSingle();
      if (ex) return ex.id;
      const { data: ins, error } = await this.client.from("dm_threads").insert({ user_a: a, user_b: b }).select("id").maybeSingle();
      if (error) throw error;
      return ins.id;
    },

    async sendDmMessage(threadId, body) {
      if (!this.me) throw new Error("Pas connecté");
      const text = String(body || "").trim();
      if (!text) throw new Error("Message vide");
      const { data, error } = await this.client
        .from("dm_messages")
        .insert({ thread_id: threadId, sender_id: this.me.id, body: text.slice(0, 2000) })
        .select("id,thread_id,sender_id,body,created_at")
        .maybeSingle();
      if (error) throw error;
      await this.client.from("dm_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
      return data;
    },

    async listDmThreads() {
      if (!this.me) return [];
      const uid = this.me.id;
      const { data: threads, error: thErr } = await this.client
        .from("dm_threads")
        .select("id,user_a,user_b,updated_at")
        .or(`user_a.eq.${uid},user_b.eq.${uid}`)
        .order("updated_at", { ascending: false });
      if (thErr) throw thErr;
      if (!threads || !threads.length) return [];
      const otherIds = [...new Set(threads.map((t) => (t.user_a === uid ? t.user_b : t.user_a)))];
      const { data: profs, error: prErr } = await this.client.from("profiles").select("*").in("id", otherIds);
      if (prErr) throw prErr;
      const profById = new Map((profs || []).map((p) => [p.id, p]));
      const threadIds = threads.map((t) => t.id);
      const lastByThread = new Map();
      if (threadIds.length) {
        const { data: msgs, error: msgErr } = await this.client
          .from("dm_messages")
          .select("thread_id,body,created_at,sender_id")
          .in("thread_id", threadIds)
          .order("created_at", { ascending: false })
          .limit(Math.min(threadIds.length * 3, 120));
        if (msgErr) throw msgErr;
        for (const m of msgs || []) {
          if (!lastByThread.has(m.thread_id)) lastByThread.set(m.thread_id, m);
        }
        const missing = threadIds.filter((id) => !lastByThread.has(id));
        if (missing.length) {
          await Promise.all(
            missing.map(async (tid) => {
              const { data: last } = await this.client
                .from("dm_messages")
                .select("body,created_at,sender_id")
                .eq("thread_id", tid)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
              if (last) lastByThread.set(tid, last);
            })
          );
        }
      }
      return threads.map((th) => {
        const oid = th.user_a === uid ? th.user_b : th.user_a;
        return { thread: th, other: profById.get(oid), lastMessage: lastByThread.get(th.id) || null };
      });
    },

    async listDmMessages(threadId, limit = 100) {
      const { data } = await this.client
        .from("dm_messages")
        .select("id,thread_id,sender_id,body,created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })
        .limit(limit);
      return data || [];
    },

    async listDmReactionsForThread(threadId) {
      if (!this.me) return [];
      const { data: msgs, error: mErr } = await this.client.from("dm_messages").select("id").eq("thread_id", threadId);
      if (mErr) throw mErr;
      const ids = (msgs || []).map((m) => m.id);
      if (!ids.length) return [];
      const { data, error } = await this.client
        .from("dm_message_reactions")
        .select("message_id,user_id,emoji,created_at")
        .in("message_id", ids);
      if (error) throw error;
      return data || [];
    },

    async toggleDmReaction(messageId, emoji) {
      if (!this.me) throw new Error("Pas connecté");
      const em = String(emoji || "").trim();
      if (!["🔥", "💿", "🎧"].includes(em)) throw new Error("Réaction invalide");
      const { data: existing, error: exErr } = await this.client
        .from("dm_message_reactions")
        .select("id,emoji")
        .eq("message_id", messageId)
        .eq("user_id", this.me.id)
        .maybeSingle();
      if (exErr) throw exErr;
      if (existing) {
        if (existing.emoji === em) {
          const { error } = await this.client.from("dm_message_reactions").delete().eq("id", existing.id);
          if (error) throw error;
          return { removed: true, emoji: em };
        }
        const { error } = await this.client
          .from("dm_message_reactions")
          .update({ emoji: em })
          .eq("id", existing.id);
        if (error) throw error;
        return { updated: true, emoji: em };
      }
      const { error } = await this.client
        .from("dm_message_reactions")
        .insert({ message_id: messageId, user_id: this.me.id, emoji: em });
      if (error) throw error;
      return { added: true, emoji: em };
    },

    // ---------- Realtime ----------
    realtimeSubscribe({
      onListening,
      onComment,
      onShoutout,
      onFriendRequest,
      onFriendship,
      onFollow,
      onDmMessage,
      onDmReaction,
      onEventInterest,
      onNotification,
      onLike,
      onListeningReaction,
    }) {
      if (!this.ready) return null;
      const ch = this.client.channel("soundlog-live");
      if (onListening) ch.on("postgres_changes", { event: "*", schema: "public", table: "listenings" }, (p) => onListening(p));
      if (onComment)   ch.on("postgres_changes", { event: "*", schema: "public", table: "comments" }, (p) => onComment(p));
      if (onShoutout)  ch.on("postgres_changes", { event: "*", schema: "public", table: "shoutouts" }, (p) => onShoutout(p));
      if (onFriendRequest) ch.on("postgres_changes", { event: "*", schema: "public", table: "friend_requests" }, (p) => onFriendRequest(p));
      if (onFriendship) ch.on("postgres_changes", { event: "*", schema: "public", table: "friends" }, (p) => onFriendship(p));
      if (onFollow)    ch.on("postgres_changes", { event: "*", schema: "public", table: "follows" }, (p) => onFollow(p));
      if (onDmMessage) ch.on("postgres_changes", { event: "*", schema: "public", table: "dm_messages" }, (p) => onDmMessage(p));
      if (onDmReaction) ch.on("postgres_changes", { event: "*", schema: "public", table: "dm_message_reactions" }, (p) => onDmReaction(p));
      if (onEventInterest) ch.on("postgres_changes", { event: "*", schema: "public", table: "event_interests" }, (p) => onEventInterest(p));
      if (onNotification && this.me) {
        ch.on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${this.me.id}` },
          (p) => onNotification(p)
        );
      }
      if (onLike) ch.on("postgres_changes", { event: "*", schema: "public", table: "listening_likes" }, (p) => onLike(p));
      if (onListeningReaction) {
        ch.on("postgres_changes", { event: "*", schema: "public", table: "listening_reactions" }, (p) =>
          onListeningReaction(p)
        );
      }
      ch.subscribe();
      return ch;
    },
    unsubscribe(channel) {
      if (channel) try { this.client.removeChannel(channel); } catch (_) {}
    },

    // ---------- Spotify OAuth (PKCE, public client) ----------
    spotify: {
      tokenKey: "soundlog_spotify_token",
      verifierKey: "soundlog_spotify_verifier",
      get clientId() { return (window.SLConfig && window.SLConfig.spotifyClientId) || ""; },
      get redirectUri() {
        return (window.SLConfig && window.SLConfig.spotifyRedirectUri)
          || (window.location.origin + window.location.pathname);
      },
      get scopes() {
        return "playlist-read-private playlist-read-collaborative user-library-read user-top-read user-read-recently-played";
      },
      isConfigured() { return !!this.clientId; },
      hasToken() {
        try { const t = JSON.parse(localStorage.getItem(this.tokenKey) || "null"); return t && t.access_token && Date.now() < (t.expires_at || 0); } catch { return false; }
      },
      getToken() {
        try { return JSON.parse(localStorage.getItem(this.tokenKey) || "null"); } catch { return null; }
      },
      clearToken() { localStorage.removeItem(this.tokenKey); localStorage.removeItem(this.verifierKey); },
      async authorize() {
        if (!this.clientId) throw new Error("spotifyClientId manquant dans config.js");
        const verifier = randomString(96);
        const challenge = await pkceChallenge(verifier);
        localStorage.setItem(this.verifierKey, verifier);
        const params = new URLSearchParams({
          client_id: this.clientId,
          response_type: "code",
          redirect_uri: this.redirectUri,
          code_challenge_method: "S256",
          code_challenge: challenge,
          scope: this.scopes,
          state: randomString(20),
        });
        window.location.href = "https://accounts.spotify.com/authorize?" + params.toString();
      },
      async exchangeCode(code) {
        const verifier = localStorage.getItem(this.verifierKey);
        if (!verifier) throw new Error("PKCE verifier manquant");
        const body = new URLSearchParams({
          client_id: this.clientId,
          grant_type: "authorization_code",
          code,
          redirect_uri: this.redirectUri,
          code_verifier: verifier,
        });
        const res = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        if (!res.ok) throw new Error("Échec token Spotify : " + (await res.text()));
        const j = await res.json();
        const stored = { ...j, expires_at: Date.now() + (j.expires_in || 3600) * 1000 };
        localStorage.setItem(this.tokenKey, JSON.stringify(stored));
        localStorage.removeItem(this.verifierKey);
        return stored;
      },
      async refresh() {
        const cur = this.getToken();
        if (!cur || !cur.refresh_token) return null;
        const body = new URLSearchParams({
          client_id: this.clientId,
          grant_type: "refresh_token",
          refresh_token: cur.refresh_token,
        });
        const res = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        if (!res.ok) return null;
        const j = await res.json();
        const stored = { ...cur, ...j, expires_at: Date.now() + (j.expires_in || 3600) * 1000 };
        localStorage.setItem(this.tokenKey, JSON.stringify(stored));
        return stored;
      },
      async api(path) {
        let t = this.getToken();
        if (!t) throw new Error("Pas de session Spotify");
        if (Date.now() >= (t.expires_at || 0) - 30000) t = await this.refresh();
        const res = await fetch("https://api.spotify.com/v1" + path, {
          headers: { Authorization: "Bearer " + t.access_token },
        });
        if (res.status === 401) {
          this.clearToken();
          throw new Error("Session Spotify expirée");
        }
        if (!res.ok) throw new Error("Spotify " + res.status + " " + (await res.text()));
        return res.json();
      },
      async listMyPlaylists() {
        const out = [];
        let url = "/me/playlists?limit=50";
        while (url) {
          const j = await this.api(url);
          out.push(...(j.items || []));
          if (j.next) {
            const u = new URL(j.next);
            url = u.pathname.replace("/v1", "") + u.search;
          } else url = null;
        }
        return out;
      },
      async listTracksOfPlaylist(playlistId) {
        const out = [];
        let url = `/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,duration_ms,album(id,name,images,release_date),artists(name))),next`;
        while (url) {
          const j = await this.api(url);
          out.push(...(j.items || []).map((it) => it.track).filter(Boolean));
          if (j.next) {
            const u = new URL(j.next);
            url = u.pathname.replace("/v1", "") + u.search;
          } else url = null;
        }
        return out;
      },
      async listLikedTracks() {
        const out = [];
        let url = "/me/tracks?limit=50";
        while (url) {
          const j = await this.api(url);
          out.push(...(j.items || []).map((it) => it.track).filter(Boolean));
          if (j.next) {
            const u = new URL(j.next);
            url = u.pathname.replace("/v1", "") + u.search;
          } else url = null;
        }
        return out;
      },
      /** @returns {Promise<{source:string,remote_track_id:string,track_name:string,artist_name:string,duration_ms:number|null,played_at:string}[]>} */
      async fetchAllRecentlyPlayed() {
        const out = [];
        let path = "/me/player/recently-played?limit=50";
        for (let guard = 0; guard < 45; guard++) {
          const j = await this.api(path);
          for (const it of j.items || []) {
            const tr = it.track;
            if (!tr || !it.played_at) continue;
            out.push({
              source: "spotify",
              remote_track_id: tr.id || "",
              track_name: tr.name || "",
              artist_name: (tr.artists || []).map((a) => a.name).join(", "),
              duration_ms: tr.duration_ms != null ? tr.duration_ms : null,
              played_at: it.played_at,
            });
          }
          if (!j.next) break;
          const u = new URL(j.next);
          path = u.pathname.replace(/^\/v1/, "") + u.search;
        }
        return out;
      },
    },

    // ---------- Sync complet (snapshot push initial + pull) ----------
    async pullEverything() {
      if (!this.me) return null;
      const uid = this.me.id;
      const [listenings, lists, concerts, wishlist, following, friendsRes, fr, importedPlaylists, importedTracks] = await Promise.all([
        this.listListeningsByUser(uid),
        this.listListsByUser(uid),
        this.listConcertsByUser(uid),
        this.listWishlist(uid),
        this.listFollowing(uid),
        this.listFriends(),
        this.listFriendRequests(),
        this.listImportedPlaylists(uid),
        this.listImportedTracks(uid),
      ]);
      return {
        profile: this.me,
        listenings,
        lists,
        concerts,
        wishlist,
        following,
        friends: friendsRes,
        friendRequests: fr,
        importedPlaylists,
        importedTracks,
      };
    },
  };

  async function loadSdk() {
    if (window.supabase && window.supabase.createClient) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Impossible de charger le SDK Supabase"));
      document.head.appendChild(s);
    });
  }

  function randomHue() { return Math.floor(Math.random() * 360); }

  // --- Helpers PKCE pour Spotify ---
  function randomString(len) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
    const a = new Uint8Array(len);
    crypto.getRandomValues(a);
    return Array.from(a, (b) => chars[b % chars.length]).join("");
  }
  async function pkceChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const b = btoa(String.fromCharCode(...new Uint8Array(hash)));
    return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  window.SLCloud = SLCloud;

  function bootCloud() {
    if (!bootPromise) {
      bootPromise = (async () => {
        if (!hasValidConfig()) await tryLoadRuntimeConfig();
        if (hasValidConfig()) {
          SLCloud.available = true;
          await SLCloud.init();
          return true;
        }
        SLCloud.available = false;
        return false;
      })();
    }
    return bootPromise;
  }
  bootCloud();

  // Si on revient d'un callback Spotify (?code=...&state=...), on échange.
  (async function handleSpotifyCallback() {
    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (!code) return;
      // pas un retour Spotify si on n'a pas de verifier en attente
      if (!localStorage.getItem(SLCloud.spotify.verifierKey)) return;
      await SLCloud.spotify.exchangeCode(code);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      url.hash = "#spotify-import";
      window.history.replaceState({}, "", url.toString());
      // notifier l'app
      window.dispatchEvent(new CustomEvent("sl-spotify-connected"));
    } catch (e) {
      console.warn("[Spotify callback]", e);
    }
  })();
})();
