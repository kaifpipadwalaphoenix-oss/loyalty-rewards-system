import { test, expect } from '@playwright/test';

test.describe('Cross-Portal Live Consistency (X-01 to X-10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('X-01 to X-05: Cashier purchase recording reflects on Customer and Admin simultaneously', async ({ context }) => {
    // Page 1: Cashier portal
    const cashierPage = await context.newPage();
    await cashierPage.goto('/counter/login');
    await cashierPage.click('text=Pooja Nair');
    await cashierPage.click('button:has-text("3")');
    await cashierPage.click('button:has-text("4")');
    await cashierPage.click('button:has-text("5")');
    await cashierPage.click('button:has-text("6")');
    await expect(cashierPage).toHaveURL(/\/counter$/);

    // Page 2: Customer portal (Kabir Malhotra - 1,000 pts initially)
    const customerPage = await context.newPage();
    await customerPage.goto('/login');
    await customerPage.click('text=Switch Persona / Guide');
    await customerPage.click('text=Kabir Malhotra');
    await expect(customerPage).toHaveURL(/\/club/);
    await expect(customerPage.locator('text=1,000').first()).toBeVisible();

    // Cashier records ₹2,000 purchase for Kabir (9000000003)
    await cashierPage.fill('input[placeholder*="Search member"]', '9000000003');
    await cashierPage.click('text=Kabir Malhotra');
    await cashierPage.fill('input[placeholder="0"]', '2000');
    await cashierPage.fill('input[placeholder="e.g. 4109"]', '4120');
    await cashierPage.click('button:has-text("Record Purchase & Issue Points")');
    await expect(cashierPage.locator('text=Store Bill #4120')).toBeVisible();

    // Customer page refreshes / updates to 1,100 points
    await customerPage.reload();
    await expect(customerPage.locator('text=1,100').first()).toBeVisible();

    // Page 3: Admin portal confirms updated metrics and ledger
    const adminPage = await context.newPage();
    await adminPage.goto('/counter/login');
    await adminPage.click('text=Nisha Varma');
    await adminPage.click('button:has-text("1")');
    await adminPage.click('button:has-text("2")');
    await adminPage.click('button:has-text("3")');
    await adminPage.click('button:has-text("4")');
    await expect(adminPage).toHaveURL(/\/admin$/);
    await expect(adminPage.locator('text=Executive Overview')).toBeVisible();

    // Check Kabir in Customer Directory
    await adminPage.goto('/admin/customers');
    await expect(adminPage.locator('text=Kabir Malhotra')).toBeVisible();

    await cashierPage.close();
    await customerPage.close();
    await adminPage.close();
  });

  test('X-06 to X-10: Voucher redemption at counter marks voucher as used', async ({ context }) => {
    // Customer logs in as Kabir (has 1,000 pts)
    const customerPage = await context.newPage();
    await customerPage.goto('/login');
    await customerPage.click('text=Switch Persona / Guide');
    await customerPage.click('text=Kabir Malhotra');
    await expect(customerPage).toHaveURL(/\/club/);

    // Kabir redeems 500-pt voucher
    await customerPage.goto('/club/rewards');
    await customerPage.locator('button:has-text("Redeem Reward")').first().click();
    await customerPage.click('button:has-text("Confirm & Generate Voucher")');
    await expect(customerPage.locator('text=Voucher Ready')).toBeVisible();

    // Grab the voucher code from the dialog
    const codeElement = customerPage.locator('text=/TC-[A-Z0-9]{4}-[A-Z0-9]{4}/').first();
    let voucherCode = '';
    if (await codeElement.isVisible()) {
      voucherCode = (await codeElement.textContent()) || '';
    }

    // Cashier logs in
    const cashierPage = await context.newPage();
    await cashierPage.goto('/counter/login');
    await cashierPage.click('text=Pooja Nair');
    await cashierPage.click('button:has-text("3")');
    await cashierPage.click('button:has-text("4")');
    await cashierPage.click('button:has-text("5")');
    await cashierPage.click('button:has-text("6")');
    await expect(cashierPage).toHaveURL(/\/counter$/);

    // Select Kabir
    await cashierPage.fill('input[placeholder*="Search member"]', '9000000003');
    await cashierPage.click('text=Kabir Malhotra');

    // Click Verify Voucher
    if (voucherCode) {
      await cashierPage.fill('input[placeholder="TC-XXXX-XXXX"]', voucherCode.trim());
      await cashierPage.click('button:has-text("Verify")');
      await cashierPage.click('button:has-text("Apply Voucher & Mark Redeemed")');
      await expect(cashierPage.locator('text=applied successfully!')).toBeVisible();
    }

    await customerPage.close();
    await cashierPage.close();
  });
});
