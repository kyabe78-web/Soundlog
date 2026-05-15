/* =========================================================================
   Soundlog Cloud — intégration Supabase
   Charge le SDK officiel, expose window.SLCloud avec auth + CRUD.
   Reste optionnel : sans config valide, l'app fonctionne 100% locale.
   ========================================================================= */
(function () {
  const CFG = window.SLConfig || {};
  const HAS_CONFIG = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && /^https?:\/\//.test(CFG.supabaseUrl));

  const listeners = new Set();
  function emit(evt, payload) { listeners.forEach((cb) => { try { cb(evt, payload); } catch (_) {} }); }

  const SLCloud = {
    available: HAS_CONFIG,
    ready: false,
    client: null,
    session: null,
    me: null,         // profile row
    pendingError: null,
    on(cb) { listeners.add(cb); return () => listeners.delete(cb); },

    async init() {
      if (!HAS_CONFIG) return false;
      if (this.ready) return true;
      try {
        await loadSdk();
        const { createClient } = window.supabase;
        this.client = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
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
        return false;
      }
    },

    isSignedIn() { return !!this.session; },

    async signUp({ email, password, handle, name, hue, bio }) {
      if (!this.ready) throw new Error("Cloud non initialisé");
      // 1. Vérifier que le handle est libre
      const taken = await this.handleTaken(handle);
      if (taken) throw new Error("Ce handle est déjà pris.");
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
      if (!this.ready) throw new Error("Cloud non initialisé");
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.session = data.session;
      await this.refreshProfile();
      return this.me;
    },

    async signInWithMagicLink({ email }) {
      if (!this.ready) throw new Error("Cloud non initialisé");
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

    async searchProfiles(query, limit = 20) {
      const q = String(query || "").trim().toLowerCase();
      if (!q) {
        const { data } = await this.client
          .from("profiles")
          .select("id,handle,name,bio,hue,city")
          .order("created_at", { ascending: false })
          .limit(limit);
        return data || [];
      }
      const { data } = await this.client
        .from("profiles")
        .select("id,handle,name,bio,hue,city")
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
    async listListeningsByUser(userId) {
      const { data } = await this.client
        .from("listenings")
        .select("id,user_id,album_id,rating,comment,comment_at,date,created_at")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(500);
      return data || [];
    },

    async upsertListening(l) {
      const row = {
        id: l.id,
        user_id: l.userId,
        album_id: l.albumId,
        rating: l.rating || null,
        comment: l.comment || "",
        comment_at: l.commentAt || null,
        date: l.date || null,
      };
      const { error } = await this.client.from("listenings").upsert(row, { onConflict: "id" });
      if (error) console.warn("[SLCloud] upsertListening", error);
    },

    async deleteListening(id) {
      const { error } = await this.client.from("listenings").delete().eq("id", id);
      if (error) console.warn("[SLCloud] deleteListening", error);
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
      const { error } = await this.client
        .from("friend_requests")
        .insert({ from_user_id: this.me.id, to_user_id: targetId, status: "pending" });
      if (error) throw error;
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
        const { error } = await this.client
          .from("friend_requests")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", reqId);
        if (error) throw error;
      }
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

    // ---------- Commentaires ----------
    async listCommentsForListening(listeningId) {
      const { data } = await this.client
        .from("comments")
        .select("id,listening_id,author_id,text,created_at,profiles:author_id(handle,name,hue)")
        .eq("listening_id", listeningId)
        .order("created_at", { ascending: true });
      return data || [];
    },

    async postComment(listeningId, text) {
      if (!this.me) throw new Error("Pas connecté");
      const { data, error } = await this.client
        .from("comments")
        .insert({ listening_id: listeningId, author_id: this.me.id, text })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
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
    async uploadAvatar(file) {
      if (!this.me) throw new Error("Pas connecté");
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
    async getUserStats(userId) {
      const { data } = await this.client.from("user_stats").select("*").eq("user_id", userId).maybeSingle();
      return data || null;
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
    async deleteImportedPlaylist(id) {
      const { error } = await this.client.from("imported_playlists").delete().eq("id", id);
      if (error) console.warn(error);
      await this.client.from("imported_tracks").delete().eq("playlist_id", id);
    },

    // ---------- Realtime ----------
    realtimeSubscribe({ onListening, onComment, onShoutout, onFriendRequest, onFollow }) {
      if (!this.ready) return null;
      const ch = this.client.channel("soundlog-live");
      if (onListening) ch.on("postgres_changes", { event: "*", schema: "public", table: "listenings" }, (p) => onListening(p));
      if (onComment)   ch.on("postgres_changes", { event: "*", schema: "public", table: "comments" }, (p) => onComment(p));
      if (onShoutout)  ch.on("postgres_changes", { event: "*", schema: "public", table: "shoutouts" }, (p) => onShoutout(p));
      if (onFriendRequest) ch.on("postgres_changes", { event: "*", schema: "public", table: "friend_requests" }, (p) => onFriendRequest(p));
      if (onFollow)    ch.on("postgres_changes", { event: "*", schema: "public", table: "follows" }, (p) => onFollow(p));
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
      get scopes() { return "playlist-read-private playlist-read-collaborative user-library-read user-top-read"; },
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
        let url = `/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,album(id,name,images,release_date),artists(name))),next`;
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
    },

    // ---------- Sync complet (snapshot push initial + pull) ----------
    async pullEverything() {
      if (!this.me) return null;
      const uid = this.me.id;
      const [listenings, lists, concerts, wishlist, following, friendsRes, fr] = await Promise.all([
        this.listListeningsByUser(uid),
        this.listListsByUser(uid),
        this.listConcertsByUser(uid),
        this.listWishlist(uid),
        this.listFollowing(uid),
        this.listFriends(),
        this.listFriendRequests(),
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
  // Initialisation immédiate si la config est présente
  if (HAS_CONFIG) SLCloud.init();

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
