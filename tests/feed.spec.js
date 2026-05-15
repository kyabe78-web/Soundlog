// @ts-check
const { test, expect } = require("@playwright/test");

test("aperçu cercle local documenté dans le bundle", async ({ page }) => {
  const res = await page.request.get("/app.js?v=11");
  const alt = res.ok() ? res : await page.request.get("/app.js");
  const body = await alt.text();
  expect(body).toContain("installLocalPreviewCircle");
  expect(body).toContain("sl-prev-maya");
});

test("API cloud réactions DM exposée", async ({ page }) => {
  const res = await page.request.get("/cloud.js?v=11");
  const alt = res.ok() ? res : await page.request.get("/cloud.js");
  const body = await alt.text();
  expect(body).toContain("toggleDmReaction");
  expect(body).toContain("listDmReactionsForThread");
});

test("accueil affiche fil ou état vide", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  const stream = page.locator(".feed-stream--main");
  await expect(stream).toBeVisible();
  const posts = await stream.locator(".feed-post").count();
  const empty = await stream.locator(".feed-empty-card").count();
  expect(posts + empty).toBeGreaterThan(0);
});
