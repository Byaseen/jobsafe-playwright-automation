import { Page } from '@playwright/test';

/** Wait for shell without networkidle (SPA keeps connections open). */
export async function waitAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.locator('ion-app, body').first().waitFor({ state: 'attached', timeout: 15000 });
}
