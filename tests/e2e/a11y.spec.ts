import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('NX-011: Full Application Accessibility (WCAG 2.1 AA)', () => {
  const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name} (${vp.width}x${vp.height})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('Public routes pass accessibility scans', async ({ page }) => {
        const publicRoutes = ['/', '/login', '/join'];
        for (const route of publicRoutes) {
          await page.goto(route);
          await page.waitForLoadState('networkidle');

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .exclude('.sonner-toast') // notification toasts outside main flow
            .analyze();

          const critical = results.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious'
          );
          expect(critical, `Violations on ${route} (${vp.name}): ${JSON.stringify(critical, null, 2)}`).toEqual([]);
        }
      });

      test('Customer portal routes pass accessibility scans', async ({ page }) => {
        // Sign in as Tara Menon
        await page.goto('/login');
        await page.click('text=Switch Persona / Guide');
        await page.click('text=Tara Menon');
        await expect(page).toHaveURL(/\/club/);

        const customerRoutes = [
          '/club',
          '/club/rewards',
          '/club/activity',
          '/club/vouchers',
          '/club/membership',
          '/club/profile',
        ];

        for (const route of customerRoutes) {
          await page.goto(route);
          await page.waitForLoadState('networkidle');

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .exclude('.sonner-toast')
            .analyze();

          const critical = results.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious'
          );
          expect(critical, `Violations on ${route} (${vp.name}): ${JSON.stringify(critical, null, 2)}`).toEqual([]);
        }
      });

      test('Counter and Admin portal routes pass accessibility scans', async ({ page }) => {
        // Sign in as Admin Nisha Varma
        await page.goto('/counter/login');
        await page.click('text=Nisha Varma');
        await page.click('button:has-text("1")');
        await page.click('button:has-text("2")');
        await page.click('button:has-text("3")');
        await page.click('button:has-text("4")');
        await expect(page).toHaveURL(/\/admin$/);

        const adminRoutes = [
          '/counter',
          '/admin',
          '/admin/customers',
          '/admin/rewards',
          '/admin/staff',
          '/admin/programme',
          '/admin/audit',
        ];

        for (const route of adminRoutes) {
          await page.goto(route);
          await page.waitForLoadState('networkidle');

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .exclude('.sonner-toast')
            .analyze();

          const critical = results.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious'
          );
          expect(critical, `Violations on ${route} (${vp.name}): ${JSON.stringify(critical, null, 2)}`).toEqual([]);
        }
      });
    });
  }
});
