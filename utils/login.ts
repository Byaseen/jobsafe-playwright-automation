import { expect, Page } from '@playwright/test';
import { env } from './env';
import { waitAppReady } from './stable';

export async function login(page: Page) {
  await page.goto(env.baseUrl, { waitUntil: 'domcontentloaded' });
  await waitAppReady(page);

  await page.getByPlaceholder('Email').fill(env.email);
  await page.getByPlaceholder('Password').fill(env.password);

  const loginBtn = page.getByRole('button', { name: 'Login' });
  await expect(loginBtn).toBeEnabled({ timeout: 15000 });
  await loginBtn.click({ force: true });

  await page.waitForURL(/app\/home/, { timeout: 30000 });
  await page.locator('#job_tabs').waitFor({ state: 'visible', timeout: 20000 });
}

/** Open home using storageState; falls back to login if session expired. */
export async function openHome(page: Page) {
  await page.goto(env.homeUrl, { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/login')) {
    await login(page);
    return;
  }
  await page.waitForURL(/app\/home/, { timeout: 20000 });
}
