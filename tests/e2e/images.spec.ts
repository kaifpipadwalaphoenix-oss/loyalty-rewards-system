import { test, expect } from '@playwright/test';

test.describe('Image Loading & Integrity (NX-001, NX-005, NX-012)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  const routes = ['/', '/club', '/club/rewards', '/club/membership'];

  for (const route of routes) {
    test(`every <img> on ${route} loads successfully with naturalWidth > 0`, async ({ page }) => {
      // Authenticate as Tara Menon if accessing /club routes
      if (route.startsWith('/club')) {
        await page.goto('/login');
        await page.click('text=Switch Persona / Guide');
        await page.click('text=Tara Menon');
        await expect(page).toHaveURL(/\/club/);
      }

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Find all img elements
      const images = page.locator('img');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        // Wait for image to be loaded
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        const src = await img.getAttribute('src');
        expect(naturalWidth, `Image with src "${src}" on ${route} failed to load (naturalWidth === 0)`).toBeGreaterThan(0);
      }
    });
  }
});
