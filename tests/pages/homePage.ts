import { expect, Locator, Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly jobTabs: Locator;
  readonly homeTab: Locator;
  readonly myReportsTab: Locator;
  readonly documentsTab: Locator;
  readonly profileMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.jobTabs = page.locator('#job_tabs');
    this.homeTab = page.getByRole('tab', { name: 'Home' }).first();
    this.myReportsTab = page.getByRole('tab', { name: 'My Reports' }).first();
    this.documentsTab = page.getByRole('tab', { name: 'Documents' }).first();
    this.profileMenuItem = page.locator('ion-item', { hasText: 'Your Profile' }).first();
  }

  async expectHomeLoaded() {
    await expect(this.page).toHaveURL(/app\/home/, { timeout: 20000 });
    await expect(this.jobTabs).toBeVisible({ timeout: 20000 });
    await expect(this.homeTab).toBeVisible();
    await this.page.getByText('TodayThis weekThis month', { exact: true }).click();
    await this.page.getByText('Open · high-severity', { exact: true }).click();
    await expect(this.page.getByText('Open · high-severity', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Overdue actions', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Incidents this week', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Days since last Report', { exact: true })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Live Feed' })).toBeVisible();
  }

  async expectNavigationButtons() {
    await expect(this.myReportsTab).toBeVisible();
    await expect(this.documentsTab).toBeVisible();
  }

  async ensureMenuVisible() {
    if (await this.profileMenuItem.isVisible()) {
      return;
    }

    const menuButton = this.page.locator(
      'ion-menu-button, button[aria-label="Menu"], button[aria-label="Open menu"], button.menu-button'
    );

    if (await menuButton.count()) {
      await menuButton.first().click();
    }

    await expect(this.profileMenuItem).toBeVisible({ timeout: 10000 });
  }

  async goToProfile() {
    await this.ensureMenuVisible();
    await this.profileMenuItem.click();
    await expect(this.page).toHaveURL(/app\/settings\/profile/, { timeout: 20000 });
  }

  async gotoHome() {
    await this.page.goto('/app/home');
    await this.expectHomeLoaded();
  }
}
