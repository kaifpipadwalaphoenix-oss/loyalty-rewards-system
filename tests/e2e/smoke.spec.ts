import { test, expect } from '@playwright/test';

test('has title Trove Club @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Trove Club/);
  await expect(page.getByLabel('Trove Club').first()).toBeVisible();
});
