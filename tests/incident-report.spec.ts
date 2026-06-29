/**
 * JobSafe web — incident reports (HSSE).
 */
import { test } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { IncidentReportsPage } from './pages/incidentReportsPage';
import { HSSEFormPage } from './pages/hsseFormPage';
import { env } from '../utils/env';

const hasCreds = Boolean(env.email && env.password);

test.describe('JobSafe web — Incident reports (HSSE)', () => {
  test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, env.password);
    await login.expectReachedHome();
  });

  test('add-report modal opens from the FAB and the HSSE form navigates', async ({ page }) => {
    const incident = new IncidentReportsPage(page);
    await incident.goto();
    await incident.openAddReportModal();
    await incident.expectAddReportModalOpen();
    await incident.selectHSSE();
    await new HSSEFormPage(page).expectLoaded();
  });

  test('completes the HSSE form and saves (happy path)', async ({ page }) => {
    const hsse = new HSSEFormPage(page);
    const title = 'Automated test HSSE';
    await hsse.goto();
    await hsse.fill({ title, description: 'This is a test report created by automated tests.' });
    await hsse.save();
    await hsse.expectSaved(title);
  });
});
