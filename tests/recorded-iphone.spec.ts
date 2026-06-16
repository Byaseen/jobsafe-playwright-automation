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
  await page.locator('#ion-overlay-2 ion-backdrop').click();
  await page.getByText('No Email received? - Contact us', { exact: true }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByText('No Email received? - Contact us', { exact: true }).click();
  await page.getByText('Close', { exact: true }).click();
  await page.getByText('No Email received? - Contact us', { exact: true }).click();
  await page.getByRole('button', { name: 'Close' }).dblclick();
  await page.getByText('Close', { exact: true }).click();
  await page.getByText('Change Password', { exact: true }).click();
  await page.getByRole('button', { name: 'back' }).click();
  await page.getByRole('button', { name: 'Change Password' }).click();
});