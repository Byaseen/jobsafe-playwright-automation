import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { DashboardPage } from './pages/dashboardPage';

test.describe('Dashboard and navigation', () => {
  test('home dashboard loads after login', async ({ page }) => {
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASSWORD;
    test.skip(!email || !password, 'Missing USER_EMAIL or USER_PASSWORD');
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    await login.goto();
    await login.fillEmail(email!);
    await login.fillPassword(password!);
    await login.submit();
    await expect(page).toHaveURL(/app\/home/);
    await expect(page.locator('#job_tabs')).toBeVisible({ timeout: 20000 });
  });

  test('My Reports tab navigates to incident reports', async ({ page }) => {
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASSWORD;
    test.skip(!email || !password, 'Missing USER_EMAIL or USER_PASSWORD');
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    await login.goto();
    await login.fillEmail(email!);
    await login.fillPassword(password!);
    await login.submit();
    await dashboard.clickMyReports();
    await expect(page).toHaveURL(/incident-reports/);
  });
});
