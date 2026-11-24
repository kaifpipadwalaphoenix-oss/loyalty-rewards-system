import { test, expect } from '@playwright/test';

test.describe('NX-013: Visual Guards and Typography Scale', () => {
  test('Customer portal contains no duplicate "pts pts" strings', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Switch")');
    await page.click('text=Tara Menon');
    await expect(page).toHaveURL(/\/club/);

    const routes = ['/club', '/club/rewards', '/club/activity', '/club/vouchers', '/club/membership'];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const bodyText = await page.innerText('body');
      expect(bodyText).not.toMatch(/\bpts\s+pts\b/i);
    }
  });

  test('Membership card balance font-size meets editorial design requirements', async ({ page }) => {
    // Desktop check
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await page.click('button:has-text("Switch")');
    await page.click('text=Tara Menon');
    await expect(page).toHaveURL(/\/club/);

    const balanceEl = page.locator('main').locator('text=/1,438/').first();
    await expect(balanceEl).toBeVisible();

    const desktopFontSize = await balanceEl.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });
    // Desktop balance must be >= 36px (target 44px)
    expect(desktopFontSize).toBeGreaterThanOrEqual(36);

    // Mobile check
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/club');
    await page.waitForLoadState('networkidle');

    const mobileFontSize = await balanceEl.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });
    // Mobile balance must be >= 32px
    expect(mobileFontSize).toBeGreaterThanOrEqual(32);
  });
});
