import { test, expect } from '@playwright/test';

test.describe('NX-013: Responsive Viewport Overflow Checks (Zero Horizontal Scroll)', () => {
  const VIEWPORTS = [
    { name: 'tiny-mobile', width: 320, height: 568 },
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'small-desktop', width: 1024, height: 768 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  const PUBLIC_ROUTES = ['/', '/login', '/join'];
  const CUSTOMER_ROUTES = [
    '/club',
    '/club/rewards',
    '/club/activity',
    '/club/vouchers',
    '/club/membership',
    '/club/profile',
  ];
  const ADMIN_ROUTES = [
    '/counter',
    '/admin',
    '/admin/customers',
    '/admin/rewards',
    '/admin/staff',
    '/admin/programme',
    '/admin/audit',
  ];

  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name} (${vp.width}px)`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('Public routes have no horizontal overflow', async ({ page }) => {
        for (const route of PUBLIC_ROUTES) {
          await page.goto(route);
          await page.waitForLoadState('networkidle');

          const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            return {
              scrollWidth: doc.scrollWidth,
              clientWidth: doc.clientWidth,
              innerWidth: window.innerWidth,
              hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
            };
          });

          expect(
            overflow.hasOverflow,
            `Horizontal overflow on ${route} at ${vp.width}px: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`
          ).toBe(false);
        }
      });

      test('Customer routes have no horizontal overflow', async ({ page }) => {
        // Authenticate as Tara Menon
        await page.goto('/login');
        await page.click('button:has-text("Switch")');
        await page.click('text=Tara Menon');
        await expect(page).toHaveURL(/\/club/);

        for (const route of CUSTOMER_ROUTES) {
          await page.goto(route);
          await page.waitForLoadState('networkidle');

          const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            return {
              scrollWidth: doc.scrollWidth,
              clientWidth: doc.clientWidth,
              hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
            };
          });

          expect(
            overflow.hasOverflow,
            `Horizontal overflow on ${route} at ${vp.width}px: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`
          ).toBe(false);
        }
      });

      test('Admin and counter routes have no horizontal overflow', async ({ page }) => {
        // Authenticate as Nisha Varma
        await page.goto('/counter/login');
        await page.click('text=Nisha Varma');
        await page.click('button:has-text("1")');
        await page.click('button:has-text("2")');
        await page.click('button:has-text("3")');
        await page.click('button:has-text("4")');
        await expect(page).toHaveURL(/\/admin$/);

        for (const route of ADMIN_ROUTES) {
          await page.goto(route);
          await page.waitForLoadState('networkidle');

          const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            return {
              scrollWidth: doc.scrollWidth,
              clientWidth: doc.clientWidth,
              hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
            };
          });

          expect(
            overflow.hasOverflow,
            `Horizontal overflow on ${route} at ${vp.width}px: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`
          ).toBe(false);
        }
      });
    });
  }
});
