import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import { IncidentReportsPage } from './incidentReportsPage';

/**
 * The Other Report creation form (/app/settings/incident-reports/other-report).
 * Reached via: Incident Reports list → "Add New" → "Other" card.
 * Angular component: app-customer-incident-report.
 *
 * Required fields (5): Incident Time, Report Type, Title, Severity Level, Employee Signature.
 *
 * Key difference from Near Miss: Report Type is NOT pre-filled — the user must pick one
 * of 8 subtypes from an alertdialog. This makes it a fifth required field.
 *
 * Report Type subtypes (displayed in the alertdialog):
 *   'Slip/ Trip/ Fall' | 'Third Party Injury' | 'Medical' | 'Personal Accident'
 *   'Vehicle Accident' | 'Physical/ Verbal Abuse' | 'Negligence' | 'Other'
 *
 * When subtype 'Other' is saved, the reports list shows the type as "Other Incident".
 *
 * Sections:
 *   - Header pre-filled fields (Date, Employee, Incident Date, Incident Time, Report Type)
 *   - Information (Title, Description, Customer, Address, Site, Severity, Job Type, Files)
 *   - Witness Statement (Name, Email, Statement, Consent, Position, Signature, Files)
 *   - Signature Capture (Employee signature, Manager signature, name/email/tel/position)
 *   - Save / Save and send buttons
 */

export type OtherReportSubType =
  | 'Slip/ Trip/ Fall'
  | 'Third Party Injury'
  | 'Medical'
  | 'Personal Accident'
  | 'Vehicle Accident'
  | 'Physical/ Verbal Abuse'
  | 'Negligence'
  | 'Other';

export class OtherReportFormPage {
  readonly page: Page;

  // ─── Header ──────────────────────────────────────────────────────
  readonly pageTitle: Locator;
  readonly backButton: Locator;

  // ─── Pre-filled fields ────────────────────────────────────────────
  readonly dateField: Locator;
  readonly employeeField: Locator;
  readonly incidentDateField: Locator;
  readonly incidentTimeInput: Locator;
  /** Report Type — ION-SELECT. REQUIRED. Opens alertdialog with 8 subtypes. */
  readonly reportTypeField: Locator;

  // ─── Information section ──────────────────────────────────────────
  readonly informationHeading: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly customerInput: Locator;
  readonly addressField: Locator;
  readonly siteField: Locator;
  readonly severityLevelField: Locator;
  readonly jobTypeInput: Locator;
  readonly incidentFilesUpload: Locator;

  // ─── Witness Statement section ────────────────────────────────────
  readonly witnessStatementHeading: Locator;
  readonly witnessNameInput: Locator;
  readonly witnessEmailInput: Locator;
  readonly witnessStatementInput: Locator;
  readonly witnessConsentCheckbox: Locator;
  readonly witnessPositionInput: Locator;
  readonly witnessSignatureButton: Locator;
  readonly witnessFilesUpload: Locator;
  readonly saveWitnessButton: Locator;
  readonly addSecondWitnessButton: Locator;

  // ─── Second Witness ───────────────────────────────────────────────
  readonly secondWitnessNameInput: Locator;
  readonly secondWitnessEmailInput: Locator;
  readonly secondWitnessStatementInput: Locator;
  readonly secondWitnessConsentCheckbox: Locator;
  readonly secondWitnessPositionInput: Locator;
  readonly secondWitnessSignatureButton: Locator;
  readonly secondWitnessFilesUpload: Locator;
  readonly saveSecondWitnessButton: Locator;
  readonly addThirdWitnessButton: Locator;

  // ─── Signature Capture section ────────────────────────────────────
  readonly signatureCaptureHeading: Locator;
  readonly employeeSignatureButton: Locator;
  readonly managerSignatureButton: Locator;
  readonly signaturePrintNameInput: Locator;
  readonly signatureEmailInput: Locator;
  readonly signatureTelInput: Locator;
  readonly signaturePositionInput: Locator;

  // ─── Signature modal ──────────────────────────────────────────────
  readonly signatureModal: Locator;
  readonly signatureModalTitle: Locator;
  readonly signatureCancelButton: Locator;
  readonly signatureClearButton: Locator;
  readonly signatureDoneButton: Locator;

  // ─── Form actions ─────────────────────────────────────────────────
  readonly saveDraftButton: Locator;
  readonly saveAndSendButton: Locator;

  // ─── Validation ───────────────────────────────────────────────────
  readonly requiredError: Locator;
  readonly locationErrorMsg: Locator;
  readonly reportSuccessMsg: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageTitle = page.getByTestId('header-page-title').getByText('Other Report', { exact: true });
    this.backButton = page.getByRole('button', { name: 'back', exact: true });

    this.dateField = page.getByTestId('incident-date-field');
    this.employeeField = page.getByTestId('employees-field');
    this.incidentDateField = page.getByTestId('date-of-incident-field');
    this.incidentTimeInput = page.getByTestId('time-of-incident-field').locator('input').first();
    this.reportTypeField = page.getByTestId('incident-type-field');

    this.informationHeading = page.getByRole('heading', { name: 'Information', level: 2 });
    this.titleInput = page.getByTestId('incident-report-title-field').locator('label');
    this.descriptionInput = page.getByTestId('incident-report-description-field').locator('label');
    this.customerInput = page.getByTestId('incident-report-customer-field').locator('label');
    this.addressField = page.getByTestId('customer-address-field');
    this.siteField = page.getByTestId('site-field');
    this.severityLevelField = page.getByTestId('severity-level-field');
    this.jobTypeInput = page.getByTestId('job-type-field').locator('label');
    this.incidentFilesUpload = page.getByTestId('incident-files-upload');

    this.witnessStatementHeading = page.getByRole('heading', { name: 'Witness Statement', level: 2 });
    this.witnessNameInput = page.getByTestId('witness-name-field').locator('label');
    this.witnessEmailInput = page.getByTestId('witness-email-field').locator('label');
    this.witnessStatementInput = page.getByTestId('witness-statement-field').locator('label');
    this.witnessConsentCheckbox = page.getByTestId('witness-consent-checkbox');
    this.witnessPositionInput = page.getByTestId('witness-position-field').locator('label');
    this.witnessSignatureButton = page.getByTestId('witness-signature-button').getByRole('button');
    this.witnessFilesUpload = page.getByTestId('witness-files-upload');
    this.saveWitnessButton = page.getByTestId('save-witness-statement-button').getByRole('button');
    this.addSecondWitnessButton = page.getByTestId('add-second-witness-button').getByRole('button');

    this.secondWitnessNameInput = page.getByTestId('second-witness-name-field').getByRole('textbox');
    this.secondWitnessEmailInput = page.getByTestId('second-witness-email-field').getByRole('textbox');
    this.secondWitnessStatementInput = page.getByTestId('second-witness-statement-field').getByRole('textbox');
    this.secondWitnessConsentCheckbox = page.getByTestId('second-witness-consent-checkbox');
    this.secondWitnessPositionInput = page.getByTestId('second-witness-position-field').getByRole('textbox');
    this.secondWitnessSignatureButton = page.getByTestId('second-witness-signature-button').getByRole('button');
    this.secondWitnessFilesUpload = page.getByTestId('second-witness-files-upload');
    this.saveSecondWitnessButton = page.getByTestId('save-second-witness-statement-button').getByRole('button');
    this.addThirdWitnessButton = page.getByTestId('add-third-witness-button').getByRole('button');

    this.signatureCaptureHeading = page.getByRole('heading', { name: 'Signature Capture' });
    this.employeeSignatureButton = page.getByTestId('employee-signature-button').getByRole('button');
    this.managerSignatureButton = page.getByTestId('manager-signature-button').getByRole('button');
    this.signaturePrintNameInput = page.getByTestId('signature-print-name-field').getByRole('textbox');
    this.signatureEmailInput = page.getByTestId('signature-email-field').getByRole('textbox');
    this.signatureTelInput = page.getByTestId('signature-tel-number-field').getByRole('spinbutton');
    this.signaturePositionInput = page.getByTestId('signature-position-field').getByRole('textbox');

    this.signatureModal = page.locator('ion-modal');
    this.signatureModalTitle = page.locator('ion-modal').getByText('Add a Signature');
    this.signatureCancelButton = page.locator('ion-modal').getByRole('button', { name: 'Cancel' });
    this.signatureClearButton = page.locator('ion-modal').getByRole('button', { name: 'Clear' });
    this.signatureDoneButton = page.locator('ion-modal').getByRole('button', { name: 'Done' });

    this.saveDraftButton = page.getByTestId('save-draft-button').getByRole('button', { name: 'Save' });
    this.saveAndSendButton = page.getByTestId('save-and-send-button').getByRole('button');

    this.requiredError = page.locator('.feedback-invalid').getByText('This field is required');
    this.locationErrorMsg = page.getByText(/Location access denied. Please enable location services in your device settings to proceed/);
    this.reportSuccessMsg = page.getByText('Report successfully sent');
  }

  // ─── Actions ───────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/app/settings/incident-reports/other-report');
  }

  async fillIncidentTime(time: string) {
    await this.incidentTimeInput.fill(time);
    await this.incidentTimeInput.press('Tab');
  }

  /**
   * Select a Report Type subtype. Opens the ion-select alertdialog, picks the given
   * option, then confirms with OK.
   */
  async selectReportType(subtype: OtherReportSubType) {
    await this.reportTypeField.click();
    await this.page.getByRole('radio', { name: subtype }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }

  async cancelReportTypeSelection() {
    await this.reportTypeField.click();
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async fillTitle(text: string) {
    await this.titleInput.fill(text);
  }

  async fillDescription(text: string) {
    await this.descriptionInput.fill(text);
  }

  async fillCustomer(text: string) {
    await this.customerInput.fill(text);
  }

  async fillJobType(text: string) {
    await this.jobTypeInput.fill(text);
  }

  async selectSeverity(level: 'Severe' | 'High' | 'Medium' | 'Low') {
    await this.severityLevelField.click();
    await this.page.getByRole('radio', { name: level }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }

  async cancelSeveritySelection() {
    await this.severityLevelField.click();
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async toggleWitnessConsent() {
    await this.witnessConsentCheckbox.click();
  }

  async fillWitnessName(name: string) {
    await this.witnessNameInput.fill(name);
  }

  async fillWitnessEmail(email: string) {
    await this.witnessEmailInput.fill(email);
  }

  async fillWitnessStatement(text: string) {
    await this.witnessStatementInput.fill(text);
  }

  async clickAddSecondWitness() {
    await this.addSecondWitnessButton.click();
  }

  async captureSignature(openButton: Locator) {
    await openButton.click();
    await expect(this.signatureModal).toBeVisible({ timeout: 10_000 });
    await expect(this.signatureModalTitle).toBeVisible({ timeout: 5_000 });
    await this.page.waitForTimeout(500);
    const canvas = this.signatureModal.locator('canvas');
    const box = await canvas.boundingBox({ timeout: 5_000 });
    if (!box) throw new Error('captureSignature: signature canvas not found');

    await this.page.mouse.move(box.x + 40, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width / 2, box.y + 30);
    await this.page.mouse.move(box.x + box.width - 40, box.y + box.height / 2);
    await this.page.mouse.up();

    await this.signatureDoneButton.click();
    await expect(this.signatureModal).not.toBeVisible({ timeout: 10_000 });
  }

  async captureEmployeeSignature() {
    await this.captureSignature(this.employeeSignatureButton);
  }

  async captureManagerSignature() {
    await this.captureSignature(this.managerSignatureButton);
  }

  /** Fill every required field (Incident Time, Report Type, Title, Severity Level, Employee Signature). */
  async fillRequiredFields({
    title,
    incidentTime = '10:00 AM',
    reportType = 'Other' as OtherReportSubType,
    severity = 'Medium' as const,
  }: {
    title: string;
    incidentTime?: string;
    reportType?: OtherReportSubType;
    severity?: 'Severe' | 'High' | 'Medium' | 'Low';
  }) {
    await this.fillIncidentTime(incidentTime);
    await this.selectReportType(reportType);
    await this.fillTitle(title);
    await this.selectSeverity(severity);
    await this.captureEmployeeSignature();
  }

  async saveDraft() {
    await this.saveDraftButton.click();
  }

  async saveAndSend() {
    await this.saveAndSendButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  // ─── Assertions ────────────────────────────────────────────────────

  async expectLoaded(timeout = 20_000) {
    await expect(this.page).toHaveURL(/other-report/, { timeout });
    await expect(this.pageTitle).toBeVisible({ timeout });
  }

  async expectFormSections() {
    await expect(this.pageTitle).toBeVisible({ timeout: 10_000 });
    await expect(this.informationHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.witnessStatementHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.signatureCaptureHeading).toBeVisible({ timeout: 10_000 });
  }

  async expectRequiredFieldCount(count: number) {
    await expect(this.requiredError).toHaveCount(count, { timeout: 10_000 });
  }

  async expectRequiredErrorsVisible() {
    await expect(this.requiredError.first()).toBeVisible({ timeout: 10_000 });
  }

  async expectSavedToReportList(title: string) {
    await expect(this.page).toHaveURL(/incident-reports$/, { timeout: 40_000 });
    await this.page.getByText(title).scrollIntoViewIfNeeded();
    await expect(this.page.getByText(title)).toBeVisible({ timeout: 30_000 });
  }

  async expectSavedToReportListWithValidStatusAndType(title: string, status: string, type: string, page: Page) {
    const ir = new IncidentReportsPage(page);
    const row = ir.getRow(title);
    await expect(row.getByText(type)).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText(status)).toBeVisible({ timeout: 10_000 });
  }

  async expectSignatureModalOpen() {
    await expect(this.signatureModal).toBeVisible({ timeout: 10_000 });
    await expect(this.signatureModalTitle).toBeVisible({ timeout: 5_000 });
  }

  async expectSignatureModalClosed() {
    await expect(this.signatureModal).not.toBeVisible({ timeout: 10_000 });
  }

  async expectEmployeeSignatureCaptured() {
    await expect(
      this.page.getByTestId('employee-signature-button').getByRole('button', { name: 'Re-sign' })
    ).toBeVisible({ timeout: 10_000 });
  }

  async expectToSeeLocationDisabledError() {
    await expect(this.locationErrorMsg).toBeVisible({ timeout: 10_000 });
  }

  async expectReportSuccessfullySent() {
    await expect(this.reportSuccessMsg).toBeVisible({ timeout: 40_000 });
  }

  async expectSecondWitnessSectionVisible() {
    await expect(this.secondWitnessNameInput).toBeVisible({ timeout: 10_000 });
  }

  /** Returns true when the consent checkbox div has a green background (checked). */
  async isWitnessConsentChecked(): Promise<boolean> {
    const bg = await this.witnessConsentCheckbox.locator('div').first().evaluate(
      (el) => (el as HTMLElement).style.backgroundColor
    );
    return bg === 'rgb(0, 141, 54)';
  }
}
