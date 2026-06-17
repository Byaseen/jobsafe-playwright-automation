import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 15'],
});

test('test', async ({ page }) => {
  await page.goto('https://app.tst.jobsafe.cloud/login');
  await expect(page.locator('div').filter({ hasText: 'Verify your email addressWe\'' })).toBeVisible();
});