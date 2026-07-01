import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import { IncidentReportsPage } from './incidentReportsPage';

/**
 * The Near Miss report creation form (/app/settings/incident-reports/near-miss-report).
 * Reached via: Incident Reports list → "Add New" → "Near Miss" card.
 *
 * Required fields: Incident Time, Title, Severity Level, Employee Signature.
 * All other fields are optional.
 *
 * Sections:
 *   - Header pre-filled fields (Date, Employee, Incident Date, Incident Time, Report Type)
 *   - Information (Title, Description, Customer, Address, Site, Severity, Job Type, Files)
 *   - Witness Statement (Name, Email, Statement, Consent, Position, Signature, Files)
 *   - Signature Capture (Employee signature, Manager signature, name/email/tel/position)
 *   - Save / Save and send buttons
 */
export class NearMissFormPage {
  readonly page: Page;

  // ─── Header ──────────────────────────────────────────────────────
  readonly pageTitle: Locator;
  readonly backButton: Locator;

  // ─── Pre-filled fields ────────────────────────────────────────────
  /** Date — EJS datepicker, pre-filled with today's date. */
  readonly dateField: Locator;
  /** Employee — autocomplete, pre-filled with the logged-in user. */
  readonly employeeField: Locator;
  /** Incident Date — EJS datepicker, pre-filled with today. */
  readonly incidentDateField: Locator;
  /** Incident Time — EJS timepicker. REQUIRED. */
  readonly incidentTimeInput: Locator;
  /** Report Type — ION-SELECT pre-set to "Near Miss". */
  readonly reportTypeField: Locator;

  // ─── Information section ──────────────────────────────────────────
  readonly informationHeading: Locator;
  /** Title — ION-INPUT. REQUIRED. */
  readonly titleInput: Locator;
  /** Description — ION-TEXTAREA. Optional. */
  readonly descriptionInput: Locator;
  /** Customer — ION-INPUT. Optional. */
  readonly customerInput: Locator;
  /** Address — APP-ADDRESS-SEARCH autocomplete. Optional. */
  readonly addressField: Locator;
  /** Site / depot — APP-SITE-PICKER autocomplete. Optional. */
  readonly siteField: Locator;
  /** Severity Level — ION-SELECT (opens an alertdialog: Severe/High/Medium/Low). REQUIRED. */
  readonly severityLevelField: Locator;
  /** Job Type — ION-INPUT. Optional. */
  readonly jobTypeInput: Locator;
  /** Attach Photo / Incident — APP-FILE-UPLOAD. Optional. */
  readonly incidentFilesUpload: Locator;

  // ─── Witness Statement section ────────────────────────────────────
  readonly witnessStatementHeading: Locator;
  /** Contact details / Full Name — ION-INPUT. Optional in web. */
  readonly witnessNameInput: Locator;
  /** Email — ION-INPUT. Optional. */
  readonly witnessEmailInput: Locator;
  /** Statement — ION-TEXTAREA. Optional. */
  readonly witnessStatementInput: Locator;
  /** Do you consent … — APP-CHECKBOX (click to toggle, green when checked). */
  readonly witnessConsentCheckbox: Locator;
  /** Position — ION-INPUT. Optional. */
  readonly witnessPositionInput: Locator;
  /** Signature Sign button (opens the signature modal). Optional. */
  readonly witnessSignatureButton: Locator;
  /** Attach Photo in witness section. Optional. */
  readonly witnessFilesUpload: Locator;
  /** Save witness statement (the inline "Save" inside the witness section). */
  readonly saveWitnessButton: Locator;
  /** "Add +" button — adds a second witness section. */
  readonly addSecondWitnessButton: Locator;

  // ─── Second Witness (visible after clicking Add+) ─────────────────
  readonly secondWitnessNameInput: Locator;
  readonly secondWitnessEmailInput: Locator;
  readonly secondWitnessStatementInput: Locator;
  readonly secondWitnessConsentCheckbox: Locator;
  readonly secondWitnessPositionInput: Locator;
  readonly secondWitnessSignatureButton: Locator;
  readonly secondWitnessFilesUpload: Locator;
  readonly saveSecondWitnessButton: Locator;
  /** "Add +" third witness — appears after adding second witness. */
  readonly addThirdWitnessButton: Locator;

  // ─── Signature Capture section ────────────────────────────────────
  readonly signatureCaptureHeading: Locator;
  /** Employee Signature Sign button. REQUIRED. */
  readonly employeeSignatureButton: Locator;
  /** Manager Signature Sign button. Optional. */
  readonly managerSignatureButton: Locator;
  /** Print Name in the signature block. Optional. */
  readonly signaturePrintNameInput: Locator;
  /** Email in the signature block. Optional. */
  readonly signatureEmailInput: Locator;
  /** Tel Number in the signature block. Optional. */
  readonly signatureTelInput: Locator;
  /** Position in the signature block. Optional. */
  readonly signaturePositionInput: Locator;

  // ─── Signature modal (ion-modal, "Add a Signature") ───────────────
  readonly signatureModal: Locator;
  readonly signatureModalTitle: Locator;
  readonly signatureCancelButton: Locator;
  readonly signatureClearButton: Locator;
  readonly signatureDoneButton: Locator;

  // ─── Form actions ─────────────────────────────────────────────────
  /** Bottom Save button — saves as draft and navigates back to the list. */
  readonly saveDraftButton: Locator;
  /** Save and send — submits and sends the report. */
  readonly saveAndSendButton: Locator;

  // ─── Validation ───────────────────────────────────────────────────
  /** Generic required-field validation message. */
  readonly requiredError: Locator;
  readonly locationErrorMsg : Locator;
  readonly reportSuccessMsg : Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.getByTestId('header-page-title').getByText('Near Miss Report', { exact: true });
    this.backButton = page.getByRole('button', { name: 'back', exact: true });

    // Pre-filled fields
    this.dateField = page.getByTestId('incident-date-field');
    this.employeeField = page.getByTestId('employees-field');
    this.incidentDateField = page.getByTestId('date-of-incident-field');
    this.incidentTimeInput = page.getByTestId('time-of-incident-field').locator('input').first();
    this.reportTypeField = page.getByTestId('incident-type-field');

    // Information section
    this.informationHeading = page.getByRole('heading', { name: 'Information', level: 2 });
    this.titleInput = page.getByTestId('incident-report-title-field').locator('label');
    this.descriptionInput = page.getByTestId('incident-report-description-field').locator('label');
    this.customerInput = page.getByTestId('incident-report-customer-field').locator('label');
    this.addressField = page.getByTestId('customer-address-field');
    this.siteField = page.getByTestId('site-field');
    this.severityLevelField = page.getByTestId('severity-level-field');
    this.jobTypeInput = page.getByTestId('job-type-field').locator('label');
    this.incidentFilesUpload = page.getByTestId('incident-files-upload');

    // Witness Statement
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

    // Second witness
    this.secondWitnessNameInput = page.getByTestId('second-witness-name-field').getByRole('textbox');
    this.secondWitnessEmailInput = page.getByTestId('second-witness-email-field').getByRole('textbox');
    this.secondWitnessStatementInput = page.getByTestId('second-witness-statement-field').getByRole('textbox');
    this.secondWitnessConsentCheckbox = page.getByTestId('second-witness-consent-checkbox');
    this.secondWitnessPositionInput = page.getByTestId('second-witness-position-field').getByRole('textbox');
    this.secondWitnessSignatureButton = page.getByTestId('second-witness-signature-button').getByRole('button');
    this.secondWitnessFilesUpload = page.getByTestId('second-witness-files-upload');
    this.saveSecondWitnessButton = page.getByTestId('save-second-witness-statement-button').getByRole('button');
    this.addThirdWitnessButton = page.getByTestId('add-third-witness-button').getByRole('button');

    // Signature Capture
    this.signatureCaptureHeading = page.getByRole('heading', { name: 'Signature Capture' })
    this.employeeSignatureButton = page.getByTestId('employee-signature-button').getByRole('button');
    this.managerSignatureButton = page.getByTestId('manager-signature-button').getByRole('button');
    this.signaturePrintNameInput = page.getByTestId('signature-print-name-field').getByRole('textbox');
    this.signatureEmailInput = page.getByTestId('signature-email-field').getByRole('textbox');
    this.signatureTelInput = page.getByTestId('signature-tel-number-field').getByRole('spinbutton');
    this.signaturePositionInput = page.getByTestId('signature-position-field').getByRole('textbox');

    // Signature modal
    this.signatureModal = page.locator('ion-modal');
    this.signatureModalTitle = page.locator('ion-modal').getByText('Add a Signature');
    this.signatureCancelButton = page.locator('ion-modal').getByRole('button', { name: 'Cancel' });
    this.signatureClearButton = page.locator('ion-modal').getByRole('button', { name: 'Clear' });
    this.signatureDoneButton = page.locator('ion-modal').getByRole('button', { name: 'Done' });

    // Form actions
    this.saveDraftButton = page.getByTestId('save-draft-button').getByRole('button', { name: 'Save' });
    this.saveAndSendButton = page.getByTestId('save-and-send-button').getByRole('button');

    // Validation
    this.requiredError = page.locator('.feedback-invalid').getByText('This field is required');
    this.locationErrorMsg = page.getByText(/Location access denied. Please enable location services in your device settings to proceed/);
    this.reportSuccessMsg = page.getByText('Report successfully sent');
  }

  // ─── Actions ───────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/app/settings/incident-reports/near-miss-report');
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

  async fillIncidentTime(time: string) {
    await this.incidentTimeInput.fill(time);
    await this.incidentTimeInput.press('Tab');
  }

  /**
   * Select a severity level. Opens the ion-select alertdialog, picks the given
   * option (Severe | High | Medium | Low), then confirms with OK.
   */
  async selectSeverity(level: 'Severe' | 'High' | 'Medium' | 'Low') {
    await this.severityLevelField.click();
    await this.page.getByRole('radio', { name: level }).click();
    await this.page.getByRole('button', { name: 'OK' }).click();
  }

  async cancelSeveritySelection() {
    await this.severityLevelField.click();
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  /** Click the consent checkbox in the Witness section. */
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

  /**
   * Open a signature modal (employee, manager, or witness), draw a squiggle on
   * the canvas, and click Done. Waits for the "Re-sign" label to confirm capture.
   * `openButton` must be the "Sign" button that opens the modal.
   */
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

  /** Fill every required field and capture the employee signature. */
  async fillRequiredFields({ title, incidentTime = '10:00 AM', severity = 'Medium' as const }: {
    title: string;
    incidentTime?: string;
    severity?: 'Severe' | 'High' | 'Medium' | 'Low';
  }) {
    await this.fillIncidentTime(incidentTime);
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
    await expect(this.page).toHaveURL(/near-miss-report/, { timeout });
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
    await expect(this.page).toHaveURL(/incident-reports$/, { timeout: 30_000 });
    await this.page.getByText(title).scrollIntoViewIfNeeded();; 
    await expect(this.page.getByText(title)).toBeVisible({ timeout: 30_000 });
  }

  async expectToSeeLocationDisabledError() {
    await expect(this.locationErrorMsg).toBeVisible({ timeout: 10_000 });
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

  async expectReportSuccessfullySent() {
    await expect(this.reportSuccessMsg).toBeVisible({ timeout: 10_000 });
  }

  async expectSecondWitnessSectionVisible() {
    await expect(this.secondWitnessNameInput).toBeVisible({ timeout: 10_000 });
  }

  async expectSavedToReportListWithValidStatusAndType(title: string, status: string, type: string , page: Page) {
    const ir = new IncidentReportsPage(page);
    const row = ir.getRow(title);
    await expect(row.getByText(type)).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText(status)).toBeVisible({ timeout: 10_000 });
  }

  /** Returns true when the consent checkbox div has a green background (checked). */
  async isWitnessConsentChecked(): Promise<boolean> {
    const bg = await this.witnessConsentCheckbox.locator('div').first().evaluate(
      (el) => (el as HTMLElement).style.backgroundColor
    );
    return bg === 'rgb(0, 141, 54)';
  }
}
