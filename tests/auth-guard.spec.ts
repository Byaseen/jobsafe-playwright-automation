import { test, expect } from '@playwright/test';

test.describe('Route protection', () => {
  test('unauthenticated access to home redirects to login', async ({ page }) => {
    await page.goto('/app/home');
    await expect(page).toHaveURL(/login/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('unauthenticated access to incident reports redirects to login', async ({ page }) => {
    await page.goto('/app/settings/incident-reports');
    await expect(page).toHaveURL(/login/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });
});
