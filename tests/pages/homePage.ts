import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The authenticated home / dashboard (/app/home): a tab bar (Home, My Reports,
 * Documents), a slide-out sidebar menu opened from the header, a notifications
 * panel, and the dashboard widgets (stat cards, Live Feed, By category, Site
 * breakdown, 12-week trend).
 */
export class HomePage {
  readonly page: Page;
  // ─── Tab bar ──────────────────────────────────────────────────
  readonly jobTabs: Locator;
  readonly homeTab: Locator;
  readonly myReportsTab: Locator;
  readonly documentsTab: Locator;
  // ─── Header ───────────────────────────────────────────────────
  readonly menuButton: Locator;
  readonly notificationsButton: Locator;
  // ─── Notifications panel ──────────────────────────────────────
  readonly notificationsHeading: Locator;
  readonly noNotificationsText: Locator;
  readonly notificationsCloseButton: Locator;
  // ─── Sidebar menu ─────────────────────────────────────────────
  readonly sidebarDivider: Locator;
  readonly settingsLabel: Locator;
  readonly submittedReportLink: Locator;
  readonly analyticsLink: Locator;
  readonly userManagementLink: Locator;
  readonly sitesDepotsLink: Locator;
  readonly profileLink: Locator;
  readonly companyDetailsLink: Locator;
  readonly departmentsLink: Locator;
  readonly systemSettingsLink: Locator;
  readonly companyDocsLink: Locator;
  readonly supportButton: Locator;
  readonly logoutButton: Locator;
  // ─── Dashboard — period filter ────────────────────────────────
  readonly todayButton: Locator;
  readonly thisWeekButton: Locator;
  readonly thisMonthButton: Locator;
  readonly onlineStatus: Locator;
  // ─── Dashboard — stat cards ───────────────────────────────────
  readonly openHighSeverityCard: Locator;
  readonly overdueActions: Locator;
  readonly incidentsThisWeek: Locator;
  readonly daysSinceLastReport: Locator;
  // ─── Live Feed ────────────────────────────────────────────────
  readonly liveFeedHeading: Locator;
  readonly liveSearchInput: Locator;
  readonly viewAllReportsLink: Locator;
  // ─── By category ──────────────────────────────────────────────
  readonly byCategoryHeading: Locator;
  // ─── Site breakdown ───────────────────────────────────────────
  readonly siteBreakdownHeading: Locator;
  // ─── 12-week trend ────────────────────────────────────────────
  readonly weekTrendHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    // Tab bar
    this.jobTabs = page.locator('#job_tabs');
    this.homeTab = page.getByRole('tab', { name: 'Home' }).first();
    this.myReportsTab = page.getByRole('tab', { name: 'My Reports' }).first();
    this.documentsTab = page.getByRole('tab', { name: 'Documents' }).first();
    // Header
    this.menuButton = page.getByRole('button', { name: 'menu' }).first();
    this.notificationsButton = page.getByTestId('notifications-button');
    // Notifications panel
    this.notificationsHeading = page.getByRole('heading', { name: 'Your notifications' });
    this.noNotificationsText = page.getByText('You currently have no notifications!');
    this.notificationsCloseButton = page.getByTestId('notifications-close-button');
    // Sidebar
    this.sidebarDivider = page.locator('ion-item-divider').first();
    this.settingsLabel = page.getByText('Settings', { exact: true });
    this.submittedReportLink = page.getByRole('link', { name: 'Submitted Report' });
    this.analyticsLink = page.getByRole('link', { name: 'Analytics' });
    this.userManagementLink = page.getByRole('link', { name: 'User Management' });
    this.sitesDepotsLink = page.getByRole('link', { name: 'Sites & Depots' });
    this.profileLink = page.getByRole('link', { name: 'Your Profile' });
    this.companyDetailsLink = page.getByRole('link', { name: 'Company Details' });
    this.departmentsLink = page.getByRole('link', { name: 'Departments' });
    this.systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    this.companyDocsLink = page.getByRole('link', { name: 'Company Docs' });
    this.supportButton = page.getByRole('button', { name: 'Support / Contact' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    // Dashboard period filter
    this.todayButton = page.getByRole('button', { name: 'Today', exact: true });
    this.thisWeekButton = page.getByRole('button', { name: 'This week', exact: true });
    this.thisMonthButton = page.getByRole('button', { name: 'This month', exact: true });
    this.onlineStatus = page.getByText('Online', { exact: true });
    // Stat cards
    this.openHighSeverityCard = page.getByText('Open · high-severity', { exact: true });
    this.overdueActions = page.getByText('Overdue actions', { exact: true });
    this.incidentsThisWeek = page.getByText('Incidents this week', { exact: true });
    this.daysSinceLastReport = page.getByText('Days since last Report', { exact: true });
    // Live Feed
    this.liveFeedHeading = page.getByRole('heading', { name: 'Live Feed' });
    this.liveSearchInput = page.getByPlaceholder('Search incidents…');
    this.viewAllReportsLink = page.getByText('View all reports', { exact: true });
    // By category
    this.byCategoryHeading = page.getByRole('heading', { name: 'By category' });
    // Site breakdown
    this.siteBreakdownHeading = page.getByRole('heading', { name: 'Site breakdown' });
    // 12-week trend
    this.weekTrendHeading = page.getByRole('heading', { name: '12-week trend' });
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

  async closeSidebar() {
    await this.page.getByTestId('menu-close-button').click();
  }

  async openNotifications() {
    await this.notificationsButton.click();
  }

  async closeNotifications() {
    await this.notificationsCloseButton.click();
  }

  async clickViewAllReports() {
    await this.viewAllReportsLink.click();
  }

  async openSupportModal() {
    if (!(await this.supportButton.isVisible().catch(() => false))) {
      await this.openSidebar();
    }
    await this.supportButton.click();
  }

  async goToProfile() {
    if (!(await this.profileLink.isVisible().catch(() => false))) {
      await this.openSidebar();
    }
    await this.profileLink.click();
    await expect(this.page).toHaveURL(/app\/settings\/profile/, { timeout: 20_000 });
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.page).toHaveURL(/app\/home/, { timeout: 20_000 });
    await expect(this.jobTabs).toBeVisible({ timeout: 20_000 });
  }

  async expectHeaderControls() {
    await expect(this.menuButton).toBeVisible({ timeout: 10_000 });
    await expect(this.notificationsButton).toBeVisible({ timeout: 10_000 });
  }

  async expectNavigationButtons() {
    await expect(this.homeTab).toBeVisible({ timeout: 10_000 });
    await expect(this.myReportsTab).toBeVisible({ timeout: 10_000 });
    await expect(this.documentsTab).toBeVisible({ timeout: 10_000 });
  }

  async expectDashboardWidgets() {
    await expect(this.openHighSeverityCard).toBeVisible({ timeout: 10_000 });
    await expect(this.overdueActions).toBeVisible({ timeout: 10_000 });
    await expect(this.incidentsThisWeek).toBeVisible({ timeout: 10_000 });
    await expect(this.daysSinceLastReport).toBeVisible({ timeout: 10_000 });
    await expect(this.liveFeedHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.byCategoryHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.siteBreakdownHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.weekTrendHeading).toBeVisible({ timeout: 10_000 });
  }

  async expectSidebarItems() {
    await expect(this.sidebarDivider).toBeVisible({ timeout: 10_000 });
    await expect(this.settingsLabel).toBeVisible({ timeout: 10_000 });
    await expect(this.submittedReportLink).toBeVisible({ timeout: 10_000 });
    await expect(this.analyticsLink).toBeVisible({ timeout: 10_000 });
    await expect(this.userManagementLink).toBeVisible({ timeout: 10_000 });
    await expect(this.sitesDepotsLink).toBeVisible({ timeout: 10_000 });
    await expect(this.profileLink).toBeVisible({ timeout: 10_000 });
    await expect(this.systemSettingsLink).toBeVisible({ timeout: 10_000 });
    await expect(this.supportButton).toBeVisible({ timeout: 10_000 });
    await expect(this.logoutButton).toBeVisible({ timeout: 10_000 });
  }

  async expectReachedReports(timeout = 20_000) {
    await expect(this.page).toHaveURL(/incident-reports/, { timeout });
  }

  async expectReachedDocuments(timeout = 20_000) {
    await expect(this.page).toHaveURL(/company-documents/, { timeout });
  }
}
