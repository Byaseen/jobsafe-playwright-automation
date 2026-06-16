import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 15'],
});

test('test', async ({ page }) => {
  await page.goto('https://app.tst.jobsafe.cloud/login');
  await page.getByRole('banner').getByRole('button').click();
  await page.locator('#ion-overlay-1 ion-backdrop').click();
  await page.locator('#ion-overlay-1 ion-backdrop').dblclick();
  await page.getByRole('banner').getByRole('button').click();
  await page.locator('div').filter({ hasText: 'Need help? - Contact usFor' }).click();
  await expect(page.locator('div').filter({ hasText: 'Need help? - Contact usFor' })).toBeVisible();
});