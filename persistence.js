/* Soundlog — helpers persistance (IDs, ratings, mapping cloud) */
(function (root) {
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  function generateId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function isUuid(id) {
    return typeof id === "string" && UUID_RE.test(id);
  }

  /** Note UI (0.5 pas) → valeur DB numeric(3,1) ou null */
  function normalizeRating(value) {
    if (value == null || value === "") return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    const clamped = Math.min(5, Math.max(0.5, n));
    return Math.round(clamped * 2) / 2;
  }

  function listeningSignature(l) {
    if (!l) return "";
    return String(l.albumId || "") + "|" + String(l.date || "");
  }

  function listeningToCloudRow(l, cloudUserId) {
    if (!l || !cloudUserId) return null;
    const text =
      l.comment != null && String(l.comment).trim() !== ""
        ? String(l.comment).trim()
        : l.review != null
          ? String(l.review).trim()
          : "";
    return {
      id: l.id,
      userId: cloudUserId,
      albumId: l.albumId,
      rating: normalizeRating(l.rating),
      comment: text,
      commentAt: l.commentAt != null ? l.commentAt : null,
      date: l.date || null,
    };
  }

  function listeningFromCloudRow(row) {
    if (!row) return null;
    const text = row.comment != null ? String(row.comment) : "";
    return {
      id: row.id,
      userId: "me",
      albumId: row.album_id,
      rating: row.rating != null ? Number(row.rating) : null,
      review: text,
      comment: text,
      commentAt: row.comment_at,
      date: row.date,
      createdAt: row.created_at || null,
    };
  }

  /**
   * Remplace les ids locaux legacy (l123…) par des UUID.
   * Remappe socialReactions si fourni.
   * @returns {{ changed: boolean, idMap: Record<string,string> }}
   */
  function ensureCloudListeningIds(listenings, socialReactions) {
    const idMap = {};
    let changed = false;
    if (!Array.isArray(listenings)) return { changed: false, idMap };
    for (const l of listenings) {
      if (!l || l.userId !== "me") continue;
      if (isUuid(l.id)) continue;
      const newId = generateId();
      idMap[l.id] = newId;
      l.id = newId;
      changed = true;
    }
    if (changed && socialReactions && typeof socialReactions === "object") {
      for (const [oldId, newId] of Object.entries(idMap)) {
        if (socialReactions[oldId]) {
          socialReactions[newId] = socialReactions[oldId];
          delete socialReactions[oldId];
        }
      }
    }
    return { changed, idMap };
  }

  const api = {
    generateId,
    isUuid,
    normalizeRating,
    listeningSignature,
    listeningToCloudRow,
    listeningFromCloudRow,
    ensureCloudListeningIds,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.SLPersistence = api;
})(typeof window !== "undefined" ? window : globalThis);
