import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { OtherReportFormPage, OtherReportSubType } from './otherReportFormPage';
import { IncidentReportsPage } from './incidentReportsPage';

/**
 * The Customer Incident Report creation form.
 * URL: /app/settings/incident-reports/customer-incident-report
 * Reached via: Incident Reports list → "Add New" → "Incident" card (testid: customer-incident-report-card).
 * Angular component: app-customer-incident-report (same as OtherReportFormPage).
 *
 * This form is structurally identical to OtherReportFormPage — same testids, same 5 required
 * fields, same Report Type alertdialog with the same 8 subtypes. The only differences are:
 *   - URL slug: /customer-incident-report (vs /other-report)
 *   - Page heading: "Incident Report" (vs "Other Report")
 *   - Type shown in the reports list: "Incident" (vs "Other Incident")
 *
 * All locators and actions are inherited from OtherReportFormPage.
 */
export class CustomerIncidentReportFormPage extends OtherReportFormPage {
  constructor(page: Page) {
    super(page);
    // Override only the page title locator — everything else is shared.
    (this as any).pageTitle = page
      .getByTestId('header-page-title')
      .getByText('Incident Report', { exact: true });
  }

  override async goto() {
    await this.page.goto('/app/settings/incident-reports/customer-incident-report');
  }

  override async expectLoaded(timeout = 20_000) {
    await expect(this.page).toHaveURL(/customer-incident-report/, { timeout });
    await expect(this.pageTitle).toBeVisible({ timeout });
  }

  override async expectSavedToReportListWithValidStatusAndType(
    title: string,
    status: string,
    type: string,
    page: Page
  ) {
    const ir = new IncidentReportsPage(page);
    const row = ir.getRow(title);
    await expect(row.getByText(type)).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText(status)).toBeVisible({ timeout: 10_000 });
  }

  /** Re-export the subtype union for consumers of this class. */
  static readonly SUBTYPES: OtherReportSubType[] = [
    'Slip/ Trip/ Fall',
    'Third Party Injury',
    'Medical',
    'Personal Accident',
    'Vehicle Accident',
    'Physical/ Verbal Abuse',
    'Negligence',
    'Other',
  ];
}
