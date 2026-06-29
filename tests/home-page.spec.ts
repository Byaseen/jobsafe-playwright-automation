/**
 * JobSafe web — home page / dashboard.
 */
import { test } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { HomePage } from './pages/homePage';
import { env } from '../utils/env';

const hasCreds = Boolean(env.email && env.password);

test.describe('JobSafe web — Home page', () => {
  test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, env.password);
    await new HomePage(page).expectLoaded();
  });

  test('loads the home dashboard after login', async ({ page }) => {
    const home = new HomePage(page);
    await home.expectLoaded();
    await home.expectDashboardWidgets();
  });

  test('displays the home navigation buttons', async ({ page }) => {
    await new HomePage(page).expectNavigationButtons();
  });

  test('My Reports tab navigates to the reports page', async ({ page }) => {
    const home = new HomePage(page);
    await home.openMyReports();
    await home.expectReachedReports();
  });

  test('Documents tab navigates to the documents page', async ({ page }) => {
    const home = new HomePage(page);
    await home.openDocuments();
    await home.expectReachedDocuments();
  });

  test('sidebar menu opens and displays its navigation items', async ({ page }) => {
    const home = new HomePage(page);
    await home.openSidebar();
    await home.expectSidebarItems();
  });

  test('SOS tab shows the SOS modal', async ({ page }) => {
    const home = new HomePage(page);
    await home.openSos();
    await home.expectSosModal();
  });

  test('navigates to profile settings from the menu', async ({ page }) => {
    await new HomePage(page).goToProfile();
  });
});
