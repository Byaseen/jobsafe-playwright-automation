import { expect, type Page } from '@playwright/test';
import { env } from './env';

/**
 * Home → My Reports (click the tab control, not label text — required on WebKit).
 */
export async function goToIncidentReports(page: Page) {
  await page.waitForURL(/app\/home/, { timeout: 20000 });

  const myReportsTab = page
    .getByRole('tablist')
    .getByRole('tab', { name: 'My Reports' });

  await myReportsTab.waitFor({ state: 'visible', timeout: 20000 });
  await myReportsTab.click({ force: true });

  if (!page.url().includes('incident-reports')) {
    await page.locator('#job_tabs').getByText('My Reports', { exact: true }).click({ force: true });
  }

  if (!page.url().includes('incident-reports')) {
    await page.goto(env.incidentReportsUrl, { waitUntil: 'domcontentloaded' });
  }

  await expect(page).toHaveURL(/incident-reports/, { timeout: 20000 });
}

/**
 * Plus FAB — opens report-type picker modal
 */
export async function clickAddReport(page: Page) {
  const modal = page.locator('ion-modal.add-report-modal.show-modal').last();
  const floatingPlus = page.locator(
    '.floating-plus-button__icon > .icon-inner > .s-ion-icon > .a, .floating-plus-button__icon'
  );
  const fab = page.locator('ion-fab-button > .button-native');
  const plusPath = page.locator(
    'path.a[d*="M40.071,18.071H26.714"][transform="translate(1 1)"]'
  );

  for (const target of [floatingPlus, fab, plusPath, page.locator('main button').last()]) {
    try {
      await target.first().click({ timeout: 5000 });
      if (await modal.isVisible().catch(() => false)) break;
    } catch {
      continue;
    }
  }

  await expect(modal).toBeVisible({ timeout: 15000 });
}

/**
 * HSSE card in picker modal
 */
export async function selectHsseReport(page: Page) {
  const modal = page.locator('ion-modal.add-report-modal.show-modal').last();
  await expect(modal).toBeVisible({ timeout: 15000 });

  const hsseParagraph = page.getByRole('paragraph').filter({ hasText: 'HSSE Report' });
  try {
    await hsseParagraph.click({ timeout: 5000 });
  } catch {
    await modal.locator('motion.div.card.hsse, div.card.hsse').click({ force: true, timeout: 8000 });
  }

  await expect(page).toHaveURL(/hsse-report/, { timeout: 15000 });
}
