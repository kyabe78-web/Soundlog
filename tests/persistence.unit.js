// @ts-check
const assert = require("assert");
const SLPersistence = require("../persistence.js");

assert.strictEqual(SLPersistence.normalizeRating(4.3), 4.5);
assert.strictEqual(SLPersistence.normalizeRating(null), null);
assert.ok(SLPersistence.isUuid(SLPersistence.generateId()));

const rows = [{ id: "l123", userId: "me", albumId: "a1", date: "2024-01-01" }];
const reactions = { l123: { like: true } };
const { changed, idMap } = SLPersistence.ensureCloudListeningIds(rows, reactions);
assert.strictEqual(changed, true);
assert.ok(SLPersistence.isUuid(rows[0].id));
assert.ok(reactions[rows[0].id]);
assert.strictEqual(reactions.l123, undefined);

console.log("persistence.unit.js OK");
