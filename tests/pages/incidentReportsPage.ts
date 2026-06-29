import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The Incident Reports list (/app/settings/incident-reports). A "+" floating
 * action button opens the report-type picker modal, from which the HSSE card
 * navigates to the HSSE report form.
 */
export class IncidentReportsPage {
  readonly page: Page;
  readonly addFab: Locator;
  readonly hsseCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addFab = page.locator('ion-fab-button');
    this.hsseCard = page.getByText('HSSE Report');
  }

  // ─── Actions ───────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/app/settings/incident-reports');
  }

  async openAddReportModal() {
    await this.addFab.click();
  }

  async selectHSSE() {
    await this.hsseCard.click();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded(timeout = 20_000) {
    await expect(this.page).toHaveURL(/incident-reports/, { timeout });
  }

  /** The report-type picker is open (its HSSE card is visible). */
  async expectAddReportModalOpen() {
    await expect(this.hsseCard).toBeVisible({ timeout: 15_000 });
  }

  /** A report with the given title appears in the list. */
  async expectReportListed(title: string, timeout = 15_000) {
    await expect(this.page.getByText(title)).toBeVisible({ timeout });
  }
}
