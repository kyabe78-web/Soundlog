// @ts-check
const { test, expect } = require("@playwright/test");

test("accueil Soundlog charge", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator("#app-main")).toBeVisible();
});

test("navigation hash album", async ({ page }) => {
  await page.goto("/#album/a1");
  await expect(page.locator("#app-main")).toContainText(/Random Access Memories|introuvable|Chargement/i);
});

test("manifest PWA présent", async ({ page }) => {
  const res = await page.request.get("/manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.name).toBe("Soundlog");
});
