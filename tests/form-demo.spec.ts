import { test, expect } from '@playwright/test';
import { login } from '../utils/login';
import {
  goToIncidentReports,
  clickAddReport,
  selectHsseReport,
} from '../utils/navigation';
import { hsseForm as form } from '../utils/test-data';
import { fillHsseForm } from '../utils/hsse-form-flow';

/**
 * Watch only the HSSE form being filled (login/nav is quick; form steps are labelled + slowed).
 *
 * Run: npm run test:form
 */
test('HSSE form — step-by-step demo', async ({ page }) => {
  test.setTimeout(300000);

  await login(page);
  await goToIncidentReports(page);
  await clickAddReport(page);
  await selectHsseReport(page);

  await fillHsseForm(page, form);

  await page.getByText('Save', { exact: true }).click({ force: true });
  await page.waitForURL(/incident-reports/, { timeout: 30000 });
  await expect(page.locator('body')).toContainText(new RegExp(form.title, 'i'));
});
