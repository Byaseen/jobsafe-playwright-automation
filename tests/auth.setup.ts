import { test as setup } from '@playwright/test';
import { env } from '../utils/env';

const authFile = 'storageState.json';

setup('authenticate', async ({ page }) => {
  if (!env.email || !env.password || !env.baseUrl) {
    throw new Error('Missing USER_EMAIL, USER_PASSWORD, or BASE_URL in .env');
  }

  await page.goto(env.baseUrl, { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Email').fill(env.email);
  await page.getByPlaceholder('Password').fill(env.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/app\/home/, { timeout: 30000 });
  await page.context().storageState({ path: authFile });
});
