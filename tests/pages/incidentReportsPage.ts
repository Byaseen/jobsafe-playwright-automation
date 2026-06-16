import { Page, Locator } from '@playwright/test';

export class IncidentReportsPage {
  readonly page: Page;
  readonly addFab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addFab = page.locator('ion-fab-button');
  }

  async goto() {
    await this.page.goto('/app/settings/incident-reports');
  }

  async openAddReportModal() {
    await this.addFab.click();
  }

  async selectHSSECard() {
    await this.page.getByText('HSSE Report').click();
  }
}
