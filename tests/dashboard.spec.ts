/**
 * JobSafe web — dashboard & navigation.
 */
import { test } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { HomePage } from './pages/homePage';
import { env } from '../utils/env';

const hasCreds = Boolean(env.email && env.password);

test.describe('JobSafe web — Dashboard and navigation', () => {
  test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, env.password);
    await new HomePage(page).expectLoaded();
  });

  test('home dashboard loads after login', async ({ page }) => {
    await new HomePage(page).expectLoaded();
  });

  test('My Reports tab navigates to incident reports', async ({ page }) => {
    const home = new HomePage(page);
    await home.openMyReports();
    await home.expectReachedReports();
  });
});
