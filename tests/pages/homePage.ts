import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The authenticated home / dashboard (/app/home): a tab bar (Home, My Reports,
 * Documents, SOS), a slide-out sidebar menu opened from the header, and the
 * dashboard widgets. Also covers the navigation that used to live in a separate
 * DashboardPage.
 */
export class HomePage {
  readonly page: Page;
  // Tab bar.
  readonly jobTabs: Locator;
  readonly homeTab: Locator;
  readonly myReportsTab: Locator;
  readonly documentsTab: Locator;
  readonly sosTab: Locator;
  // Sidebar menu.
  readonly menuButton: Locator;
  readonly sidebarDivider: Locator;
  readonly settingsItem: Locator;
  readonly submittedReportLink: Locator;
  readonly adminItem: Locator;
  readonly userManagementLink: Locator;
  readonly systemSettingsLink: Locator;
  readonly logoutItem: Locator;
  readonly profileMenuItem: Locator;
  // SOS modal.
  readonly sosModalText: Locator;
  // Dashboard widgets.
  readonly liveFeedHeading: Locator;
  readonly byCategoryHeading: Locator;
  readonly siteBreakdownHeading: Locator;
  readonly weekTrendHeading: Locator;
  readonly overdueActions: Locator;
  readonly incidentsThisWeek: Locator;
  readonly daysSinceLastReport: Locator;

  constructor(page: Page) {
    this.page = page;
    this.jobTabs = page.locator('#job_tabs');
    this.homeTab = page.getByRole('tab', { name: 'Home' }).first();
    this.myReportsTab = page.getByRole('tab', { name: 'My Reports' }).first();
    this.documentsTab = page.getByRole('tab', { name: 'Documents' }).first();
    this.sosTab = page.getByRole('tab', { name: 'SOS' });
    this.menuButton = page.getByRole('button', { name: 'menu' });
    this.sidebarDivider = page.locator('ion-item-divider').first();
    this.settingsItem = page.getByText('Settings', { exact: true });
    this.submittedReportLink = page.getByRole('link', { name: 'Submitted Report' });
    this.adminItem = page.getByText('Admin', { exact: true });
    this.userManagementLink = page.getByRole('link', { name: 'User Management' });
    this.systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    this.logoutItem = page.getByText('Logout', { exact: true });
    this.profileMenuItem = page.locator('ion-item', { hasText: 'Your Profile' }).first();
    this.sosModalText = page.getByText('Choose an emergency contact option', { exact: true });
    this.liveFeedHeading = page.getByRole('heading', { name: 'Live Feed' });
    this.byCategoryHeading = page.getByRole('heading', { name: 'By category' });
    this.siteBreakdownHeading = page.getByRole('heading', { name: 'Site breakdown' });
    this.weekTrendHeading = page.getByRole('heading', { name: '-week trend' });
    this.overdueActions = page.getByText('Overdue actions', { exact: true });
    this.incidentsThisWeek = page.getByText('Incidents this week', { exact: true });
    this.daysSinceLastReport = page.getByText('Days since last Report', { exact: true });
  }

  // ─── Actions ───────────────────────────────────────────────────
  async gotoHome() {
    await this.page.goto('/app/home');
    await this.expectLoaded();
  }

  async openMyReports() {
    await this.myReportsTab.click();
  }

  async openDocuments() {
    await this.documentsTab.click();
  }

  async openSidebar() {
    await this.menuButton.click();
  }

  async openSos() {
    await this.sosTab.click();
  }

  /** Open the sidebar (if needed) and navigate to profile settings. */
  async goToProfile() {
    if (!(await this.profileMenuItem.isVisible().catch(() => false))) {
      await this.openSidebar();
    }
    await this.profileMenuItem.click();
    await expect(this.page).toHaveURL(/app\/settings\/profile/, { timeout: 20_000 });
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.page).toHaveURL(/app\/home/, { timeout: 20_000 });
    await expect(this.jobTabs).toBeVisible({ timeout: 20_000 });
    await expect(this.homeTab).toBeVisible({ timeout: 10_000 });
  }

  /** The dashboard widget headings/cards are all rendered. */
  async expectDashboardWidgets() {
    await expect(this.overdueActions).toBeVisible({ timeout: 10_000 });
    await expect(this.incidentsThisWeek).toBeVisible({ timeout: 10_000 });
    await expect(this.daysSinceLastReport).toBeVisible({ timeout: 10_000 });
    await expect(this.liveFeedHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.byCategoryHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.siteBreakdownHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.weekTrendHeading).toBeVisible({ timeout: 10_000 });
  }

  async expectNavigationButtons() {
    await expect(this.myReportsTab).toBeVisible({ timeout: 10_000 });
    await expect(this.documentsTab).toBeVisible({ timeout: 10_000 });
  }

  /** The sidebar is open and shows its navigation items. */
  async expectSidebarItems() {
    await expect(this.sidebarDivider).toBeVisible({ timeout: 10_000 });
    await expect(this.settingsItem).toBeVisible({ timeout: 10_000 });
    await expect(this.submittedReportLink).toBeVisible({ timeout: 10_000 });
    await expect(this.adminItem).toBeVisible({ timeout: 10_000 });
    await expect(this.userManagementLink).toBeVisible({ timeout: 10_000 });
    await expect(this.systemSettingsLink).toBeVisible({ timeout: 10_000 });
    await expect(this.logoutItem).toBeVisible({ timeout: 10_000 });
  }

  async expectSosModal() {
    await expect(this.sosModalText).toBeVisible({ timeout: 10_000 });
  }

  async expectReachedReports(timeout = 20_000) {
    await expect(this.page).toHaveURL(/incident-reports/, { timeout });
  }

  async expectReachedDocuments(timeout = 20_000) {
    await expect(this.page).toHaveURL(/company-documents/, { timeout });
  }
}
