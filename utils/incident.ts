import { expect, Page } from '@playwright/test';

/**
 * Go to incident reports page AFTER login
 */
export async function goToIncidentReports(page: Page) {
  await page.goto('https://app.tst.jobsafe.cloud/app/settings/incident-reports');

  await expect(page).toHaveURL(/incident-reports/, { timeout: 20000 });
}

/**
 * Click Add button (FIXED - no SVG / role guessing)
 */
export async function clickAdd(page: Page) {
  const addBtn = page.locator('ion-button:has-text("Add"), button:has-text("Add")').first();
  await addBtn.click({ timeout: 15000 });
}

/**
 * Select HSSE card (FIXED EXACT DOM)
 */
export async function selectHsse(page: Page) {
  await page.locator('div.card.hsse').click({ timeout: 15000 });
  await expect(page).toHaveURL(/hsse-report/, { timeout: 20000 });
}

/**
 * Fill HSSE form
 */
export async function fillHsseForm(page: Page) {
  // Title
  await page.locator('ion-input input').nth(0).fill('MobileWright Test');

  // Severity (High = second option)
  await page.locator('ion-select').nth(1).click();
  await page.getByRole('option', { name: /high/i }).click();

  // Incident type (second option)
  await page.locator('ion-select').nth(0).click();
  await page.getByRole('option', { name: /third party injury/i }).click();

  // Description
  await page.locator('ion-textarea textarea').first().fill('Automation test incident');

  // First Aid = Yes
  await page.locator('ion-select').nth(2).click();
  await page.getByRole('option', { name: 'Yes' }).click();

  // Emergency Services = Yes
  await page.locator('ion-select').nth(3).click();
  await page.getByRole('option', { name: 'Yes' }).click();

  // Phone
  await page.locator('ion-input input[type="tel"]').fill('0599999999');
}