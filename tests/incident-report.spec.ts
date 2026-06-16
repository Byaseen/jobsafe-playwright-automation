import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { IncidentReportsPage } from './pages/incidentReportsPage';
import { HSSEFormPage } from './pages/hsseFormPage';

test.describe('Incident reports - HSSE', () => {
  test('add report modal opens from FAB and HSSE form navigates', async ({ page }) => {
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASSWORD;
    test.skip(!email || !password, 'Missing USER_EMAIL or USER_PASSWORD');
    const login = new LoginPage(page);
    const incident = new IncidentReportsPage(page);
    await login.goto();
    await login.fillEmail(email!);
    await login.fillPassword(password!);
    await login.submit();
    await incident.goto();
    await incident.openAddReportModal();
    await expect(page.getByText('HSSE Report')).toBeVisible();
    await incident.selectHSSECard();
    const hsse = new HSSEFormPage(page);
    await expect(page).toHaveURL(/hsse-report/);
    await expect(hsse.titleField).toBeVisible({ timeout: 15000 });
  });

  test('complete HSSE form and save (happy path)', async ({ page }) => {
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASSWORD;
    test.skip(!email || !password, 'Missing USER_EMAIL or USER_PASSWORD');
    const login = new LoginPage(page);
    const incident = new IncidentReportsPage(page);
    const hsse = new HSSEFormPage(page);
    await login.goto();
    await login.fillEmail(email!);
    await login.fillPassword(password!);
    await login.submit();
    await page.goto('/hsse-report');
    await hsse.fillTitle('Automated test HSSE');
    await hsse.fillDescription('This is a test report created by automated tests.');
    await hsse.save();
    await expect(page).toHaveURL(/incident-reports/);
    await expect(page.getByText('Automated test HSSE')).toBeVisible();
  });
});
// import { test, expect } from '@playwright/test';
// import { login } from '../utils/login';
// import {
//   goToIncidentReports,
//   clickAddReport,
//   selectHsseReport,
// } from '../utils/navigation';
// import { hsseForm as form } from '../utils/test-data';
// import { fillHsseForm } from '../utils/hsse-form-flow';

// test('TC - Create HSSE Incident Report (Complete Regression Suite)', async ({ page }) => {
//   test.setTimeout(180000);

//   await login(page);
//   await goToIncidentReports(page);
//   await clickAddReport(page);
//   await selectHsseReport(page);

//   await fillHsseForm(page, form);

//   await page.getByText('Save', { exact: true }).click({ force: true });
//   await page.waitForURL(/incident-reports/, { timeout: 30000 });
//   await expect(page.locator('body')).toContainText(new RegExp(form.title, 'i'));
// });
