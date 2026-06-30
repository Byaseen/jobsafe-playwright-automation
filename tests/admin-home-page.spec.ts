/**
 * JobSafe web — home page / dashboard.
 *
 * All tests start by logging in via the real login flow.
 * Requires USER_EMAIL and USER_PASSWORD to be set in .env.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { HomePage } from './pages/homePage';
import { ContactUsModal } from './pages/components/contactUsModal';
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

  // ─── Page load ────────────────────────────────────────────────

  test('loads the home dashboard after login', async ({ page }) => {
    const home = new HomePage(page);
    await home.expectLoaded();
    await home.expectDashboardWidgets();
  });

  // ─── Header ───────────────────────────────────────────────────

  test('header shows the menu and notifications buttons', async ({ page }) => {
    await new HomePage(page).expectHeaderControls();
  });

  // ─── Tab bar ──────────────────────────────────────────────────

  test('displays all three navigation tabs', async ({ page }) => {
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

  // ─── Dashboard widgets ────────────────────────────────────────

  test('period filter buttons are visible', async ({ page }) => {
    const home = new HomePage(page);
    await expect(home.todayButton).toBeVisible();
    await expect(home.thisWeekButton).toBeVisible();
    await expect(home.thisMonthButton).toBeVisible();
  });

  test('Live Feed section shows the search field and heading', async ({ page }) => {
    const home = new HomePage(page);
    await expect(home.liveFeedHeading).toBeVisible();
    await expect(home.liveSearchInput).toBeVisible();
  });

  test('"View all reports" link navigates to the reports page', async ({ page }) => {
    const home = new HomePage(page);
    await home.clickViewAllReports();
    await home.expectReachedReports();
  });

  // ─── Notifications ────────────────────────────────────────────

  test('notifications panel opens and shows the empty state', async ({ page }) => {
    const home = new HomePage(page);
    await home.openNotifications();
    await expect(home.notificationsHeading).toBeVisible();
    await expect(home.noNotificationsText).toBeVisible();
  });

  // ─── Sidebar ──────────────────────────────────────────────────

  test('sidebar menu opens and displays its navigation items', async ({ page }) => {
    const home = new HomePage(page);
    await home.openSidebar();
    await home.expectSidebarItems();
  });

  test('"Support / Contact" in the sidebar opens the contact-us modal', async ({ page }) => {
    const home = new HomePage(page);
    await home.openSupportModal();
    await new ContactUsModal(page).expectOpen();
  });

  test('navigates to profile settings from the sidebar', async ({ page }) => {
    const home = new HomePage(page);
    await home.goToProfile();
    await expect(page).toHaveURL(/app\/settings\/profile/);
  });
});
