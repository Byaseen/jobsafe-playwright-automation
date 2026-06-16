import { Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoHome() {
    await this.page.goto('/app/home');
  }

  async clickMyReports() {
    await this.page.getByRole('tab', { name: 'My Reports' }).click();
  }
}
