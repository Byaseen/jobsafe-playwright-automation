import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';
import { scrollDownToReveal } from '../utils/scroll';

/** Dashboard widgets that sit below the fold and need a scroll to reach. */
const BELOW_THE_FOLD = [/Live Feed/i, /By category/i, /Site breakdown/i, /12-week trend/i];

/** Items shown in the sidebar (hamburger) menu for an admin user. */
const SIDEBAR_ITEMS = [
  /submitted Report/i,
  /Analytics/i,
  /User Management/i,
  /Sites & Depots/i,
  /Your Profile/i,
  /Company Details/i,
  /Departments/i,
  /System Settings/i,
  /Company Docs/i,
  /Support \/ Contact/i,
  /Logout/i,
];

/**
 * The authenticated admin home / dashboard, plus its sidebar menu.
 */
export class AdminDashboardPage {
  readonly screen: Screen;
  /**
   * The hamburger ("menu") button toggles the sidebar. There is no separate
   * close (X): tapping it opens the drawer, and the same control inside the open
   * drawer — the first "menu" button in the tree — closes it again.
   */
  readonly sidebarToggle: Locator;
  /** A sidebar-only item, used to assert the drawer is open / closed. */
  readonly sidebarIndicator: Locator;
  readonly logoutButton: Locator;
  /** The notifications bell — the 2nd Button on the dashboard (top-right, right
   *  after the "menu" hamburger). It has no accessibility label, so it's located
   *  by position via getByType (exact Button nodes, matching the view tree order)
   *  rather than getByRole, whose match set can include clickable views and
   *  shift the index. */
  readonly notificationsButton: Locator;
  /** The logged-in user's name — the first StaticText at the top of the open
   *  drawer (sits above the "user since …" line). Only meaningful while the
   *  sidebar is open. */
  readonly sidebarUserName: Locator;
  /** Bottom-nav tab that opens the Reports screen. */
  readonly myReportsTab: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.sidebarToggle = screen.getByRole('button', { name: 'menu' }).first();
    this.sidebarIndicator = screen.getByText(/Logout/i);
    this.sidebarUserName = screen.getByType('StaticText').first();
    this.logoutButton = screen.getByRole('button', { name: 'Logout' });
    this.notificationsButton = screen.getByType('Button').nth(1);
    this.myReportsTab = screen.getByRole('button', { name: 'My Reports' });
  }

  // ─── Actions ───────────────────────────────────────────────────
  async openSidebar() {
    await this.sidebarToggle.tap();
  }

  /** Open the Reports screen from the home bottom-nav. */
  async openMyReports() {
    await this.myReportsTab.tap();
  }

  async closeSidebar() {
    // Same "menu" toggle — when the drawer is open it's the first button in the
    // tree, so this taps the in-drawer hamburger and closes it.
    await this.sidebarToggle.tap();
  }

  async openNotifications() {
    await this.notificationsButton.tap();
  }

  /** Open the sidebar (if it isn't already) and tap Logout. */
  async logout() {
    const drawerOpen = await this.sidebarIndicator.isVisible({ timeout: 1_000 }).catch(() => false);
    if (!drawerOpen) {
      await this.openSidebar();
    }
    await this.logoutButton.tap();
  }

  async openSupportModal() {
    await this.screen.getByText(/Support \/ Contact/i).tap();
  }

  // ─── Assertions ────────────────────────────────────────────────
  /** The persistent home chrome (tab bar) — proves we're logged in on home. */
  async expectLoaded() {
    await expect(this.screen.getByText(/My Reports/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Documents/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/SOS/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Home/i).first()).toBeVisible({ timeout: 10_000 });
  }

  async expectDashboardWidgets() {
    await expect(this.screen.getByText(/Today/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/This week/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/This month/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/OVERDUE ACTIONS/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Incidents this week/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Days since last Report/i)).toBeVisible({ timeout: 10_000 });

    // The remaining widgets sit below the fold — scroll each into view first.
    for (const label of BELOW_THE_FOLD) {
      await scrollDownToReveal(this.screen, this.screen.getByText(label));
      await expect(this.screen.getByText(label)).toBeVisible({ timeout: 10_000 });
    }
  }

  /** Read the user name shown at the top of the open sidebar. */
  async getUserName() {
    return (await this.sidebarUserName.getText()).trim();
  }

  /** Assert the open sidebar shows exactly the expected user name. */
  async expectUserName(expected: string) {
    expect(await this.getUserName()).toBe(expected);
  }

  async expectNotificationsOpen() {
    await expect(this.screen.getByText(/Your notifications/i)).toBeVisible({ timeout: 10_000 });
  }

  async expectSidebarOpen() {
    await expect(this.sidebarIndicator).toBeVisible({ timeout: 10_000 });
  }

  async expectSidebarClosed() {
    await expect(this.sidebarIndicator).not.toBeVisible({ timeout: 10_000 });
  }

  async expectSidebarItems() {
    for (const item of SIDEBAR_ITEMS) {
      await expect(this.screen.getByText(item)).toBeVisible({ timeout: 10_000 });
    }
  }
}
