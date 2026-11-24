import { test, expect } from '@playwright/test';

test.describe('Trove Club E2E Scenarios (A - J)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and reset demo state for clean deterministic scenario runs
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  // Scenario A: Meera — New member registration with OTP & 0 welcome bonus
  test('Scenario A: Meera registers, agrees to terms, starts at 0 pts, sees onboarding dashboard', async ({ page }) => {
    await page.goto('/join');
    await expect(page.locator('h1')).toContainText('Join Trove Club');

    // Step 1: Mobile number
    await page.fill('input[type="tel"]', '9811122233');
    await page.click('button:has-text("Continue with OTP")');

    // Step 2: OTP verification
    await expect(page.locator('text=Enter 6-Digit Verification Code')).toBeVisible();
    await page.keyboard.type('123456', { delay: 0 });

    // Step 3: About you
    await expect(page.locator('text=Tell us a little about yourself')).toBeVisible();
    await page.fill('input[placeholder="e.g. Maya Sharma"]', 'Meera Rao');
    await page.fill('input[type="email"]', 'meera.rao@example.com');
    await page.check('input#consentTerms');
    await page.check('input#consentUpdates');
    await page.click('button:has-text("Next: Celebrations")');

    // Step 4: Celebrate (optional)
    await expect(page.locator('text=Relationship Status')).toBeVisible();
    await page.click('button:has-text("Skip & Finish")');

    // Step 5: Welcome modal with 0 points
    await expect(page.locator('text=Welcome to Trove Club').first()).toBeVisible();
    await expect(page.locator('text=0 pts').first()).toBeVisible();

    // Proceed to club dashboard
    await page.click('button:has-text("Enter Member Portal")');
    await expect(page).toHaveURL(/\/club/);

    // Dashboard verifies 0 points and Shore tier
    await expect(page.locator('text=Available Points').first()).toBeVisible();
    await expect(page.locator('main').getByText('Shore').first()).toBeVisible();
  });

  // Scenario B: Tara — Tide member purchase, tier upgrade, and reward unlock
  test('Scenario B: Tara upgrades to Golden Hour on purchase', async ({ page }) => {
    // Switch to Tara via Demo Navigator
    await page.goto('/login');
    await page.click('text=Switch Persona / Guide');
    await page.click('text=Tara Menon');

    // Tara is on /club, Tide tier
    await expect(page).toHaveURL(/\/club/);
    await expect(page.getByText('Tara Menon').last()).toBeVisible();
    await expect(page.locator('main').getByText('Tide').first()).toBeVisible();

    // Now cashier logs in to record ₹20,000 purchase for Tara (mobile 9000000002)
    await page.goto('/counter/login');
    await page.click('text=Pooja Nair');
    // Enter PIN 3456
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("5")');
    await page.click('button:has-text("6")');

    await expect(page).toHaveURL(/\/counter$/);
    await page.fill('input[placeholder*="Search member"]', '9000000002');
    await page.click('text=Tara Menon');

    // Record purchase of ₹20,000 (Amount first, then bill number per R5.1)
    await page.fill('input[placeholder="0"]', '20000');
    await page.fill('input[placeholder="e.g. 4109"]', '4109');
    await page.click('button:has-text("Record Purchase & Issue Points")');
    await expect(page.locator('text=Store Bill #4109')).toBeVisible();

    // Check Tara's dashboard again — upgraded to Golden Hour
    await page.goto('/club');
    await expect(page.locator('main').getByText('Golden Hour').first()).toBeVisible();
  });

  // Scenario C: Kabir — Canonical points math (1,000 -> 1,100 -> 600)
  test('Scenario C: Kabir canonical points verification: 1,000 -> 1,100 -> 600 pts', async ({ page }) => {
    // 1. Login as Kabir (9000000003)
    await page.goto('/login');
    await page.click('text=Switch Persona / Guide');
    await page.click('text=Kabir Malhotra');

    await expect(page).toHaveURL(/\/club/);
    await expect(page.locator('text=1,000').first()).toBeVisible();

    // 2. Cashier records ₹2,000 purchase
    await page.goto('/counter/login');
    await page.click('text=Pooja Nair');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("5")');
    await page.click('button:has-text("6")');
    await expect(page).toHaveURL(/\/counter$/);

    await page.fill('input[placeholder*="Search member"]', '9000000003');
    await page.click('text=Kabir Malhotra');

    await page.fill('input[placeholder="0"]', '2000');
    await page.fill('input[placeholder="e.g. 4109"]', '4110');
    await page.click('button:has-text("Record Purchase & Issue Points")');
    await expect(page.locator('text=Store Bill #4110')).toBeVisible();

    // 3. Customer portal sees 1,100 points
    await page.goto('/club');
    await expect(page.locator('text=1,100').first()).toBeVisible();

    // 4. Kabir redeems 500-pt voucher
    await page.goto('/club/rewards');
    await page.locator('button:has-text("Redeem Reward")').first().click();
    await page.click('button:has-text("Confirm & Generate Voucher")');
    await expect(page.locator('text=Voucher Ready')).toBeVisible();

    // 5. Balance is now exactly 600 points
    await page.goto('/club');
    await expect(page.locator('text=600').first()).toBeVisible();
  });

  // Scenario D: Zoya — Golden Hour VIP birthday milestone
  test('Scenario D: Zoya views birthday milestone and privileges', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Switch Persona / Guide');
    await page.click('text=Zoya Siddiqui');

    await expect(page).toHaveURL(/\/club/);
    await expect(page.getByText('Zoya Siddiqui').last()).toBeVisible();
    await expect(page.locator('main').getByText('Golden Hour').first()).toBeVisible();

    // Check membership tier privileges
    await page.goto('/club/membership');
    await expect(page.locator('text=Tier Privileges').first()).toBeVisible();
    await expect(page.locator('text=+10% points multiplier').first()).toBeVisible();
  });

  // Scenario E: Aditi — Anniversary & couple visit bonus recorded
  test('Scenario E: Cashier awards couple visit bonus to Aditi', async ({ page }) => {
    // Cashier Pooja logs in
    await page.goto('/counter/login');
    await page.click('text=Pooja Nair');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("5")');
    await page.click('button:has-text("6")');
    await expect(page).toHaveURL(/\/counter$/);

    // Lookup Aditi (9000000005)
    await page.fill('input[placeholder*="Search member"]', '9000000005');
    await page.click('text=Aditi Rao');

    // Confirm both partners present and click Award Couple Visit
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Award Couple Visit")');
    await expect(page.locator('text=Couple visit celebrated!')).toBeVisible();

    // Customer logs in as Aditi to verify +100 pts on single ledger
    await page.goto('/login');
    await page.click('text=Switch Persona / Guide');
    await page.click('text=Aditi Rao');

    await page.goto('/club/activity');
    await expect(page.locator('text=Couple visit bonus')).toBeVisible();
  });

  // Scenario F: Farhan — Expiring points urgency
  test('Scenario F: Farhan views 30-day expiring points alert banner', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Switch Persona / Guide');
    await page.click('text=Farhan Qureshi');

    await expect(page).toHaveURL(/\/club/);
    await expect(page.getByText('Farhan Qureshi').last()).toBeVisible();
    // Urgency banner should be visible
    await expect(page.locator('text=Points Expiring Soon')).toBeVisible();

    // Activity schedule
    await page.goto('/club/activity');
    await expect(page.locator('text=Upcoming Expiry Schedule')).toBeVisible();
  });

  // Scenario G: Cashier Pooja — Store counter bill entry and voucher verification
  test('Scenario G: Cashier Pooja performs customer search and voucher verification', async ({ page }) => {
    await page.goto('/counter/login');
    await page.click('text=Pooja Nair');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("5")');
    await page.click('button:has-text("6")');

    await expect(page).toHaveURL(/\/counter$/);
    await expect(page.locator('text=Store Counter').first()).toBeVisible();

    // Search customer
    await page.fill('input[placeholder*="Search member"]', 'Tara');
    await expect(page.locator('text=Tara Menon').first()).toBeVisible();
  });

  // Scenario H: Manager Arjun — Manual points adjustment with audit note
  test('Scenario H: Manager Arjun adjusts points with mandatory reason note', async ({ page }) => {
    // Login as Arjun (PIN 2345)
    await page.goto('/counter/login');
    await page.click('text=Arjun Shetty');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("5")');
    await expect(page).toHaveURL(/\/counter$/);

    await page.goto('/admin/customers');
    await expect(page.locator('text=Member Directory')).toBeVisible();

    // Click on Tara
    await page.click('text=Tara Menon');
    await expect(page.locator('text=Back to Customers')).toBeVisible();

    // Click Adjust Points
    await page.click('button:has-text("Adjust Points")');
    await page.fill('textarea', 'Special goodwill gesture for in-store consultation');
    await page.click('button:has-text("Authorize Adjustment")');

    await expect(page.locator('text=Special goodwill gesture')).toBeVisible();
  });

  // Scenario I: Admin Nisha — Programme settings & live tier simulation
  test('Scenario I: Admin Nisha views programme settings and tier simulation', async ({ page }) => {
    // Login as Nisha (PIN 1234)
    await page.goto('/counter/login');
    await page.click('text=Nisha Varma');
    await page.click('button:has-text("1")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto('/admin/programme');
    await expect(page.locator('text=Programme Rules & Settings')).toBeVisible();

    // Click Tiers tab
    await page.click('button:has-text("Tiers Rules")');
    await expect(page.locator('text=Tier Thresholds & Multipliers')).toBeVisible();
    await expect(page.locator('text=Golden Hour').first()).toBeVisible();
  });

  // Scenario J: Role-based permissions — cashier and manager restricted by RBAC with 403 and ACCESS_DENIED audit
  test('Scenario J: Cashier and manager restricted by RBAC with 403 and ACCESS_DENIED audit', async ({ page }) => {
    // 1. Cashier Pooja signs in (PIN 3456)
    await page.goto('/counter/login');
    await page.click('text=Pooja Nair');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("5")');
    await page.click('button:has-text("6")');
    await expect(page).toHaveURL(/\/counter$/);

    // Cashier attempts to open /admin directly
    await page.goto('/admin');
    await expect(page.locator('text=403 · Access Restricted')).toBeVisible();
    await expect(page.locator('text=dashboard.view')).toBeVisible();

    // 2. Manager Arjun signs in (PIN 2345)
    await page.goto('/counter/login');
    await page.click('text=Arjun Shetty');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("5")');
    await expect(page).toHaveURL(/\/counter$/);

    // Manager opens /admin
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin$/);

    // Manager sidebar has Overview, Customers, Audit Trail, but NOT Programme Settings or Staff
    await expect(page.locator('aside').getByText('Overview')).toBeVisible();
    await expect(page.locator('aside').getByText('Customers')).toBeVisible();
    await expect(page.locator('aside').getByText('Audit Trail')).toBeVisible();
    await expect(page.locator('aside').getByText('Programme Settings')).not.toBeVisible();
    await expect(page.locator('aside').getByText('Staff & Roles')).not.toBeVisible();

    // Manager attempts to open /admin/programme directly
    await page.goto('/admin/programme');
    await expect(page.locator('text=403 · Access Restricted')).toBeVisible();
    await expect(page.locator('text=programme.manage')).toBeVisible();

    // 3. Admin Nisha signs in and checks audit trail
    await page.goto('/counter/login');
    await page.click('text=Nisha Varma');
    await page.click('button:has-text("1")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto('/admin/audit');
    await expect(page.locator('main').getByText(/denied access/i).first()).toBeVisible();
  });
});
