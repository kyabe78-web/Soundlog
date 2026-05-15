// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Messagerie", () => {
  test("tiroir messages s’ouvre (invité)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".app-shell")).toBeVisible();
    await page.locator("#topbar-messages").click();
    await expect(page.locator("body")).toHaveClass(/inbox-drawer-open/);
    const mount = page.locator("#inbox-drawer-mount");
    await expect(mount.locator(".dm-page, .dm-gate")).toBeVisible();
    await expect(mount).toContainText(/Messages|conversations/i);
  });

  test("fermeture du tiroir avec Échap", async ({ page }) => {
    await page.goto("/");
    await page.locator("#topbar-messages").click();
    await expect(page.locator("body")).toHaveClass(/inbox-drawer-open/);
    await page.keyboard.press("Escape");
    await expect(page.locator("body")).not.toHaveClass(/inbox-drawer-open/);
  });

  test("hash #messagerie affiche la page DM", async ({ page }) => {
    await page.goto("/#messagerie");
    await expect(page.locator("#app-main .dm-page, #app-main .dm-gate")).toBeVisible();
    await expect(page.locator("#inbox-list-panel, .dm-gate")).toBeVisible();
  });

  test("bundle DM expose la recherche globale (pas l’ancien picker)", async ({ page }) => {
    const res = await page.request.get("/app.js?v=11");
    const alt = res.ok() ? res : await page.request.get("/app.js");
    expect(alt.ok()).toBeTruthy();
    const body = await alt.text();
    expect(body).toContain("dm-share-results");
    expect(body).toContain("dm-share-search-input");
    expect(body).not.toContain("dm-pick-inline");
  });
});

test.describe("Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("tiroir messages pleine largeur mobile", async ({ page }) => {
    await page.goto("/");
    await page.locator("#topbar-messages").click();
    const drawer = page.locator("#inbox-drawer");
    await expect(drawer).toBeVisible();
    const box = await drawer.boundingBox();
    expect(box).toBeTruthy();
    if (box) expect(box.width).toBeGreaterThan(300);
  });
});
