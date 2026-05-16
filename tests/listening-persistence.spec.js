// @ts-check
const { test, expect } = require("@playwright/test");

test("écoutes survivent au rechargement (localStorage)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const key = "soundlog_v2";
    const raw = localStorage.getItem(key);
    const base = raw ? JSON.parse(raw) : {};
    base.listenings = [
      {
        id: "l-legacy-test",
        userId: "me",
        albumId: "a1",
        date: "2024-06-01",
        rating: 4.5,
        review: "Persist test écoute",
      },
    ];
    localStorage.setItem(key, JSON.stringify(base));
  });
  await page.reload();
  await page.goto("/#carnet");
  await expect(page.locator("#app-main")).toContainText("Persist test écoute");
});

test("nouvelle écoute reçoit un UUID (helpers persistence)", async ({ page }) => {
  await page.goto("/");
  const id = await page.evaluate(() => {
    if (!window.SLPersistence) return null;
    return window.SLPersistence.generateId();
  });
  expect(id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );
  const rating = await page.evaluate(() => window.SLPersistence.normalizeRating(4.3));
  expect(rating).toBe(4.5);
});
