// @ts-check
const assert = require("assert");
const SLArtwork = require("../artwork.js");

assert.strictEqual(
  SLArtwork.upgradeArtworkUrl("https://is1-ssl.mzstatic.com/x/100x100bb.jpg"),
  "https://is1-ssl.mzstatic.com/x/600x600bb.jpg"
);
const chain = SLArtwork.buildUrlChain({
  id: "a1",
  title: "Test",
  artist: "Artist",
  artworkUrl: "https://cdn.example.com/cover_medium.jpg",
});
assert.ok(chain[0].includes("cover_xl"));
assert.ok(SLArtwork.isHttpUrl("https://example.com/a.jpg"));
assert.strictEqual(SLArtwork.isHttpUrl(""), false);

console.log("artwork.unit.js OK");
