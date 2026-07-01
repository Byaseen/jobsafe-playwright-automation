import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The Incident Reports list (/app/settings/incident-reports).
 *
 * The page has:
 * - A toolbar with a filter button (opens an ion-popover) and a help button
 * - A HISTORY-TABLE (data-testid="incident-reports-table") listing app-card rows
 * - Each row has an .action-button that opens an archive confirmation dialog
 * - A FAB (data-testid="report-plus-button") that opens the report-type ion-modal
 */
export class IncidentReportsPage {
  readonly page: Page;
  // ─── Header ──────────────────────────────────────────────────
  readonly pageTitle: Locator;
  readonly backButton: Locator;
  /** Filter button — no testid; first ion-button in the page toolbar. */
  readonly filterButton: Locator;
  /** Help button — data-testid="header-help-button". */
  readonly helpButton: Locator;
  // ─── Report list ─────────────────────────────────────────────
  readonly reportsTable: Locator;
  // ─── FAB ─────────────────────────────────────────────────────
  readonly addFab: Locator;
  // ─── Filter panel (ion-popover) ───────────────────────────────
  readonly filterPanel: Locator;
  readonly filterCloseButton: Locator;
  readonly filterSearchInput: Locator;
  readonly applyFilterButton: Locator;
  // ─── Report type modal (ion-modal) ────────────────────────────
  readonly reportTypeModal: Locator;
  /** "HSSE Report" card in the report-type modal. */
  readonly hsseCard: Locator;
  /** "Incident" card in the report-type modal. */
  readonly incidentCard: Locator;
  /** "Other" card in the report-type modal. */
  readonly otherCard: Locator;
  /** "Near Miss" card in the report-type modal. */
  readonly nearMissCard: Locator;
  // ─── Archive dialog ───────────────────────────────────────────
  readonly archiveDialog: Locator;
  readonly archiveConfirmButton: Locator;
  readonly archiveCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByText('Reports', { exact: true }).first();
    this.backButton = page.getByRole('button', { name: 'back', exact: true });
    this.filterButton = page.getByTestId('toolbar-filter-button').getByRole('button');
    this.helpButton = page.getByTestId('header-help-button');
    this.reportsTable = page.getByTestId('incident-reports-table');
    this.addFab = page.getByTestId('report-plus-button');
    // Filter panel
    this.filterPanel = page.getByTestId('reports-filter-modal');
    this.filterCloseButton = page.getByTestId('filter-popover-close-button').getByRole('button').first();
    this.filterSearchInput = page.getByTestId('reports-filter-modal').getByRole('textbox');
    this.applyFilterButton = page.getByRole('button', { name: 'Apply Filter' });
    // Report type modal
    this.reportTypeModal = page.getByTestId('report-type-modal');
    this.hsseCard = page.getByTestId('report-type-modal').getByText('HSSE Report');
    this.incidentCard = page.getByTestId('report-type-modal').getByText('Incident');
    this.otherCard = page.getByTestId('report-type-modal').getByText('Other');
    this.nearMissCard = page.getByTestId('report-type-modal').getByText('Near Miss');
    // Archive dialog
    this.archiveDialog = page.getByRole('dialog');
    this.archiveConfirmButton = page.getByRole('button', { name: 'Archive' });
    this.archiveCancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  // ─── Actions ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/app/settings/incident-reports');
  }

  async openFilterPanel() {
    await this.filterButton.click();
  }

  async closeFilterPanel() {
    await this.filterCloseButton.click();
  }

  /** Returns a locator for a Type filter chip by its label. */
  filterTypeButton(type: string): Locator {
    return this.filterPanel.getByRole('button', { name: type });
  }

  /** Returns a locator for a Status filter chip by its label. */
  filterStatusButton(status: string): Locator {
    return this.filterPanel.getByRole('button', { name: status });
  }

  async applyFilter() {
    await this.applyFilterButton.click();
  }

  async openAddReportModal() {
    await this.addFab.click();
  }

  async selectHSSE() {
    await this.hsseCard.click();
  }

  /** Returns the app-card row whose text contains `identifier`. */
  getRow(identifier: string): Locator {
    return this.reportsTable.locator('app-card').filter({ hasText: identifier });
  }

  /** Click the row content area to navigate to the report detail. */
  async clickRow(identifier: string) {
    await this.getRow(identifier).locator('.content').click();
  }

  /** Click the three-dot action button on a row to open the archive dialog. */
  async clickRowActionButton(identifier: string) {
    await this.getRow(identifier).locator('.action-button').click();
  }

  // ─── Assertions ────────────────────────────────────────────────

  async expectLoaded(timeout = 20_000) {
    await expect(this.page).toHaveURL(/incident-reports/, { timeout });
    await expect(this.reportsTable).toBeVisible({ timeout });
  }

  async expectPageTitle() {
    await expect(this.pageTitle).toBeVisible({ timeout: 10_000 });
  }

  async expectFilterPanelVisible() {
    await expect(this.filterPanel).toBeVisible({ timeout: 10_000 });
  }

  async expectFilterPanelHidden() {
    await expect(this.filterPanel).not.toBeVisible({ timeout: 10_000 });
  }

  async expectAddReportModalOpen() {
    await expect(this.reportTypeModal).toBeVisible({ timeout: 15_000 });
    await expect(this.hsseCard).toBeVisible({ timeout: 10_000 });
    await expect(this.incidentCard).toBeVisible({ timeout: 10_000 });
    await expect(this.otherCard).toBeVisible({ timeout: 10_000 });
    await expect(this.nearMissCard).toBeVisible({ timeout: 10_000 });
  }

  async expectReportListed(identifier: string, timeout = 15_000) {
    await expect(this.reportsTable.getByText(identifier)).toBeVisible({ timeout });
  }

  async expectArchiveDialogVisible() {
    await expect(this.archiveDialog).toBeVisible({ timeout: 10_000 });
    await expect(this.archiveConfirmButton).toBeVisible({ timeout: 10_000 });
    await expect(this.archiveCancelButton).toBeVisible({ timeout: 10_000 });
  }

  async expectArchiveDialogDismissed() {
    await expect(this.archiveDialog).not.toBeVisible({ timeout: 10_000 });
  }
}
