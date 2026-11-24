import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');

test.describe('Visual Screenshot Capture Across Viewports (18 Screens)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('Capture Core Screens', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;

    // 01. Public Landing
    await page.goto('/');
    await expect(page.locator('text=Join Trove Club').first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `01-public-landing-${projectName}.png`), fullPage: true });

    // 02. Public Join
    await page.goto('/join');
    await expect(page.locator('h1')).toContainText('Join Trove Club');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `02-public-join-${projectName}.png`) });

    // 03. Public Login
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Sign In to Trove Club');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `03-public-login-${projectName}.png`) });

    // Sign in as Tara Menon
    await page.click('text=Switch Persona / Guide');
    await page.click('text=Tara Menon');
    await expect(page).toHaveURL(/\/club/);

    // 04. Customer Dashboard
    await expect(page.locator('main').locator('text=Tara Menon')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `04-customer-dashboard-${projectName}.png`), fullPage: true });

    // 05. Customer Membership Ladder
    await page.goto('/club/membership');
    await expect(page.locator('text=Trove Club Privileges').first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `05-customer-membership-${projectName}.png`), fullPage: true });

    // 06. Customer Rewards
    await page.goto('/club/rewards');
    await expect(page.getByRole('heading', { name: 'Rewards Catalogue' })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `06-customer-rewards-${projectName}.png`), fullPage: true });

    // 07. Customer Activity
    await page.goto('/club/activity');
    await expect(page.getByRole('heading', { name: 'Points Activity' })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `07-customer-activity-${projectName}.png`), fullPage: true });

    // 08. Customer Profile
    await page.goto('/club/profile');
    await expect(page.getByRole('heading', { name: 'Member Profile' })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `08-customer-profile-${projectName}.png`), fullPage: true });

    // 09. Counter Login
    await page.goto('/counter/login');
    await expect(page.locator('text=Staff Sign In')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `09-counter-login-${projectName}.png`) });

    // Sign in as Pooja (Cashier)
    await page.click('text=Pooja Nair');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("5")');
    await page.click('button:has-text("6")');
    await expect(page).toHaveURL(/\/counter$/);

    // 10. Counter Workspace
    await expect(page.locator('button:has-text("New Member")')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `10-counter-workspace-${projectName}.png`), fullPage: true });

    // 11. Counter Purchase Live Calculation
    await page.fill('input[placeholder*="Search member"]', 'Tara');
    await page.click('text=Tara Menon');
    await page.fill('input[placeholder="e.g. 4109"]', '4199');
    await page.fill('input[placeholder="0"]', '15000');
    await expect(page.locator('text=Base Points')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `11-counter-purchase-preview-${projectName}.png`) });

    // 12. Counter Voucher Verification
    await page.fill('input[placeholder="TC-XXXX-XXXX"]', 'TC-7K3M-Q9PX');
    await page.click('button:has-text("Verify")');
    await expect(page.locator('text=Already used')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `12-counter-voucher-verified-${projectName}.png`) });

    // 13. Admin Sign In & Dashboard
    await page.goto('/counter/login');
    await page.click('text=Nisha Varma');
    await page.click('button:has-text("1")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await expect(page).toHaveURL(/\/admin$/);

    await expect(page.locator('text=Executive Overview')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `13-admin-dashboard-${projectName}.png`), fullPage: true });

    // 14. Admin Customers Directory
    await page.goto('/admin/customers');
    await expect(page.locator('text=Member Directory')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `14-admin-customers-${projectName}.png`), fullPage: true });

    // 15. Admin Customer Detail (Tara)
    await page.goto('/admin/customers/cust-tara');
    await expect(page.locator('text=Tara Menon').first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `15-admin-customer-detail-${projectName}.png`), fullPage: true });

    // 16. Admin Programme Settings
    await page.goto('/admin/programme');
    await expect(page.locator('text=Programme Rules & Settings')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `16-admin-programme-rules-${projectName}.png`), fullPage: true });

    // 17. Admin Rewards Catalogue
    await page.goto('/admin/rewards');
    await expect(page.locator('text=Catalogue Management')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `17-admin-rewards-manager-${projectName}.png`), fullPage: true });

    // 18. Admin Audit Trail
    await page.goto('/admin/audit');
    await expect(page.locator('text=System Audit Trail')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `18-admin-audit-log-${projectName}.png`), fullPage: true });
  });
});
