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
  /** The hamburger toggle is the first Button on the home screen. */
  readonly sidebarToggle: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.sidebarToggle = screen.getByRole('button').first();
  }

  // ─── Actions ───────────────────────────────────────────────────
  async openSidebar() {
    await this.sidebarToggle.tap();
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

  async expectSidebarItems() {
    for (const item of SIDEBAR_ITEMS) {
      await expect(this.screen.getByText(item)).toBeVisible({ timeout: 10_000 });
    }
  }
}
