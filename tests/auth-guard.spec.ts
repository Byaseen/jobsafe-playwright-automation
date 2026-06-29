/**
 * JobSafe web — route protection.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';

const protectedRoutes = ['/app/home', '/app/settings/incident-reports'];

test.describe('JobSafe web — Route protection', () => {
  for (const route of protectedRoutes) {
    test(`unauthenticated access to ${route} redirects to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/login/);
      await expect(new LoginPage(page).heading).toBeVisible();
    });
  }
});
