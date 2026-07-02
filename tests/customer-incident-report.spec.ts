/**
 * JobSafe web — Customer Incident Report creation form.
 *
 * Entry point: Incident Reports list → "Add New" → "Incident" card.
 * URL: /app/settings/incident-reports/customer-incident-report
 *
 * This form shares the same Angular component (app-customer-incident-report) and DOM
 * structure as the Other Report form. The differences are:
 *   - Page heading: "Incident Report"
 *   - Reports list type label: "Incident" (regardless of subtype chosen)
 *   - Modal card testid: customer-incident-report-card
 *
 * Required fields (5): Incident Time, Report Type, Title, Severity Level, Employee Signature.
 * Report Type subtypes: Slip/Trip/Fall, Third Party Injury, Medical, Personal Accident,
 *   Vehicle Accident, Physical/Verbal Abuse, Negligence, Other.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { IncidentReportsPage } from './pages/incidentReportsPage';
import { CustomerIncidentReportFormPage } from './pages/customerIncidentReportFormPage';
import { env } from '../utils/env';

const hasCreds = Boolean(env.email && env.password);

/** Navigate login → incident-reports list → "Add New" → "Incident" card. */
async function reachCIRForm(page: Page) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(env.email, env.password);
  await login.expectReachedHome();

  const ir = new IncidentReportsPage(page);
  await ir.goto();
  await ir.expectLoaded();
  await ir.openAddReportModal();
  await ir.expectAddReportModalOpen();
  await ir.incidentCard.click();

  const form = new CustomerIncidentReportFormPage(page);
  await form.expectLoaded();
  await page.waitForLoadState('networkidle');
  return form;
}

test.describe('JobSafe web — Customer Incident Report creation', () => {
  test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');

  // ─── Page load ─────────────────────────────────────────────────────

  test('reaches the Customer Incident Report form via the real user journey', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.expectLoaded();
  });

  test('displays all three form sections', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.expectFormSections();
  });

  test('pre-fills Date and Employee fields', async ({ page }) => {
    const form = await reachCIRForm(page);
    await expect(form.dateField).toBeVisible();
    await expect(form.employeeField).toBeVisible();
    await expect(form.incidentDateField).toBeVisible();
  });

  // ─── Required field visibility ─────────────────────────────────────

  test('Incident Time field is visible and accepts time input', async ({ page }) => {
    const form = await reachCIRForm(page);
    await expect(form.incidentTimeInput).toBeVisible({ timeout: 10_000 });
    await form.fillIncidentTime('09:30 AM');
    await expect(form.incidentTimeInput).toHaveValue('9:30 AM');
  });

  test('Information section shows Title and Severity Level as required fields', async ({ page }) => {
    const form = await reachCIRForm(page);
    await expect(form.titleInput).toBeVisible({ timeout: 10_000 });
    await expect(form.severityLevelField).toBeVisible({ timeout: 10_000 });
  });

  test('Employee Signature section is visible', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.signatureCaptureHeading.scrollIntoViewIfNeeded();
    await expect(form.signatureCaptureHeading).toBeVisible({ timeout: 10_000 });
    await expect(form.employeeSignatureButton).toBeVisible({ timeout: 10_000 });
  });

  // ─── Optional field visibility ─────────────────────────────────────

  test('optional fields are visible: Description, Customer, Address, Site, Job Type', async ({ page }) => {
    const form = await reachCIRForm(page);
    await expect(form.descriptionInput).toBeVisible({ timeout: 10_000 });
    await expect(form.customerInput).toBeVisible({ timeout: 10_000 });
    await expect(form.addressField).toBeVisible({ timeout: 10_000 });
    await expect(form.siteField).toBeVisible({ timeout: 10_000 });
    await expect(form.jobTypeInput).toBeVisible({ timeout: 10_000 });
  });

  test('Witness Statement section has all expected fields', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.witnessStatementHeading.scrollIntoViewIfNeeded();
    await expect(form.witnessStatementHeading).toBeVisible({ timeout: 10_000 });
    await expect(form.witnessNameInput).toBeVisible({ timeout: 10_000 });
    await expect(form.witnessEmailInput).toBeVisible({ timeout: 10_000 });
    await expect(form.witnessStatementInput).toBeVisible({ timeout: 10_000 });
    await expect(form.witnessConsentCheckbox).toBeVisible({ timeout: 10_000 });
    await expect(form.witnessPositionInput).toBeVisible({ timeout: 10_000 });
    await expect(form.witnessSignatureButton).toBeVisible({ timeout: 10_000 });
    await expect(form.witnessFilesUpload).toBeVisible({ timeout: 10_000 });
    await expect(form.saveWitnessButton).toBeVisible({ timeout: 10_000 });
  });

  test('Signature Capture section shows Employee and Manager signature buttons', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.signatureCaptureHeading.scrollIntoViewIfNeeded();
    await expect(form.employeeSignatureButton).toBeVisible({ timeout: 10_000 });
    await expect(form.managerSignatureButton).toBeVisible({ timeout: 10_000 });
    await expect(form.signaturePrintNameInput).toBeVisible({ timeout: 10_000 });
    await expect(form.signatureEmailInput).toBeVisible({ timeout: 10_000 });
    await expect(form.signatureTelInput).toBeVisible({ timeout: 10_000 });
    await expect(form.signaturePositionInput).toBeVisible({ timeout: 10_000 });
  });

  test('Save draft and Save and send buttons are present', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.saveDraftButton.scrollIntoViewIfNeeded();
    await expect(form.saveDraftButton).toBeVisible({ timeout: 10_000 });
    await expect(form.saveAndSendButton).toBeVisible({ timeout: 10_000 });
  });

  // ─── Required field validation ─────────────────────────────────────

  test('clicking Save without filling anything shows 5 required-field errors', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(5);
  });

  test('required errors cover Incident Time, Report Type, Title, Severity Level, and Employee Signature', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredErrorsVisible();
    await expect(form.requiredError).toHaveCount(5);
  });

  test('selecting a Report Type removes its required error', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(5);
    await form.selectReportType('Medical');
    await form.expectRequiredFieldCount(4);
  });

  test('filling Title removes its required error', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(5);
    await form.fillTitle('Valid title');
    await form.expectRequiredFieldCount(4);
  });

  test('filling Incident Time removes its required error', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(5);
    await form.fillIncidentTime('10:00 AM');
    await form.expectRequiredFieldCount(4);
  });

  test('selecting a Severity Level removes its required error', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(5);
    await form.selectSeverity('High');
    await form.expectRequiredFieldCount(4);
  });

  test('capturing Employee Signature removes its required error', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(5);
    await form.captureEmployeeSignature();
    await form.expectRequiredFieldCount(4);
  });

  // ─── Report Type dropdown ──────────────────────────────────────────

  test('Report Type field opens an alertdialog with all 8 subtype options', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.reportTypeField.click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('radio', { name: 'Slip/ Trip/ Fall' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Third Party Injury' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Medical' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Personal Accident' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Vehicle Accident' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Physical/ Verbal Abuse' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Negligence' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Other' })).toBeVisible();
  });

  test('Cancel button closes the Report Type dialog without selecting', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.cancelReportTypeSelection();
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5_000 });
  });

  test('each Report Type subtype can be selected and confirmed', async ({ page }) => {
    const form = await reachCIRForm(page);
    for (const subtype of CustomerIncidentReportFormPage.SUBTYPES) {
      await form.selectReportType(subtype);
      await expect(
        form.reportTypeField.getByRole('button', { name: subtype })
      ).toBeVisible();
      await page.waitForTimeout(200);
    }
  });

  // ─── Severity Level dropdown ───────────────────────────────────────

  test('Severity Level dropdown opens an alertdialog with radio options', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.severityLevelField.click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('radio', { name: 'Severe' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'High' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Low' })).toBeVisible();
  });

  test('Cancel button closes the Severity Level dialog without selecting', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.cancelSeveritySelection();
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5_000 });
  });

  test('each Severity Level option can be selected and confirmed', async ({ page }) => {
    const form = await reachCIRForm(page);
    for (const level of ['Severe', 'High', 'Medium', 'Low'] as const) {
      await form.selectSeverity(level);
      await expect(
        form.severityLevelField.getByRole('button', { name: level })
      ).toBeVisible();
      await page.waitForTimeout(300);
    }
  });

  // ─── Signature capture modal ───────────────────────────────────────

  test('Employee Signature "Sign" button opens the "Add a Signature" modal', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.employeeSignatureButton.click();
    await form.expectSignatureModalOpen();
  });

  test('signature modal contains Cancel, Clear, and Done buttons', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.employeeSignatureButton.click();
    await form.expectSignatureModalOpen();
    await expect(form.signatureCancelButton).toBeVisible();
    await expect(form.signatureClearButton).toBeVisible();
    await expect(form.signatureDoneButton).toBeVisible();
  });

  test('Cancel button closes the signature modal without capturing', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.employeeSignatureButton.click();
    await form.expectSignatureModalOpen();
    await form.signatureCancelButton.click();
    await form.expectSignatureModalClosed();
    await expect(form.employeeSignatureButton).toBeVisible();
  });

  test('drawing and confirming a signature changes "Sign" to "Re-sign"', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.captureEmployeeSignature();
    await form.expectEmployeeSignatureCaptured();
  });

  // ─── Witness consent checkbox ──────────────────────────────────────

  test('witness consent checkbox toggles checked/unchecked state', async ({ page }) => {
    const form = await reachCIRForm(page);
    const initChecked = await form.isWitnessConsentChecked();
    await form.toggleWitnessConsent();
    const afterToggle = await form.isWitnessConsentChecked();
    expect(afterToggle).toBe(!initChecked);
    await form.toggleWitnessConsent();
    expect(await form.isWitnessConsentChecked()).toBe(initChecked);
  });

  // ─── Add second witness ────────────────────────────────────────────

  test('"Add +" button reveals the second witness statement section', async ({ page }) => {
    const form = await reachCIRForm(page);
    await expect(form.secondWitnessNameInput).not.toBeVisible();
    await form.clickAddSecondWitness();
    await form.expectSecondWitnessSectionVisible();
  });

  test('second witness section has its own fields and an "Add +" for a third witness', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.clickAddSecondWitness();
    await expect(form.secondWitnessEmailInput).toBeVisible();
    await expect(form.secondWitnessStatementInput).toBeVisible();
    await expect(form.secondWitnessConsentCheckbox).toBeVisible();
    await expect(form.secondWitnessPositionInput).toBeVisible();
    await expect(form.secondWitnessSignatureButton).toBeVisible();
    await expect(form.saveSecondWitnessButton).toBeVisible();
    await expect(form.addThirdWitnessButton).toBeVisible();
  });

  // ─── Text input behavior ───────────────────────────────────────────

  test('Title, Description, Customer, and Job Type accept free text', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.fillTitle('My Title');
    await expect(form.titleInput).toHaveValue('My Title');
    await form.fillDescription('Some description here.');
    await expect(form.descriptionInput).toHaveValue('Some description here.');
    await form.fillCustomer('Acme Corp');
    await expect(form.customerInput).toHaveValue('Acme Corp');
    await form.fillJobType('Maintenance');
    await expect(form.jobTypeInput).toHaveValue('Maintenance');
  });

  test('witness name, email, and statement accept free text', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.witnessStatementHeading.scrollIntoViewIfNeeded();
    await form.fillWitnessName('Jane Witness');
    await expect(form.witnessNameInput).toHaveValue('Jane Witness');
    await form.fillWitnessEmail('jane@example.com');
    await expect(form.witnessEmailInput).toHaveValue('jane@example.com');
    await form.fillWitnessStatement('The incident occurred at noon.');
    await expect(form.witnessStatementInput).toHaveValue('The incident occurred at noon.');
  });

  // ─── Navigation ────────────────────────────────────────────────────

  test('back button navigates to the Incident Reports list', async ({ page }) => {
    const form = await reachCIRForm(page);
    await form.clickBack();
    await expect(page).toHaveURL(/incident-reports$/, { timeout: 10_000 });
  });

  // ─── Happy path ────────────────────────────────────────────────────

  test('fills all required fields and saves a Customer Incident Report as draft', async ({ page }) => {
    const form = await reachCIRForm(page);
    const title = `Automated CIR Draft ${Date.now()}`;
    await form.fillRequiredFields({ title, reportType: 'Medical' });
    await form.saveDraft();
    await form.expectSavedToReportList(title);
  });

  test('saved Customer Incident Report shows "Incident" type and "Draft" status in the list', async ({ page }) => {
    const form = await reachCIRForm(page);
    const title = `CIR Status Check ${Date.now()}`;
    await form.fillRequiredFields({ title, reportType: 'Medical' });
    await form.saveDraft();
    await expect(page).toHaveURL(/incident-reports$/, { timeout: 20_000 });
    await form.expectSavedToReportListWithValidStatusAndType(title, 'Draft', 'Incident', page);
  });

  test('fills required fields plus optional Description and Severity "High", then saves', async ({ page }) => {
    const form = await reachCIRForm(page);
    const title = `CIR With Desc ${Date.now()}`;
    await form.fillIncidentTime('10:00 AM');
    await form.selectReportType('Personal Accident');
    await form.fillTitle(title);
    await form.fillDescription('Detail about the customer incident.');
    await form.fillCustomer('Beta Client');
    await form.fillJobType('Site inspection');
    await form.selectSeverity('High');
    await form.captureEmployeeSignature();
    await form.saveDraft();
    await form.expectSavedToReportList(title);
  });

  test('fills all required fields and save & send with location service disabled shows an error message', async ({ page }) => {
    const form = await reachCIRForm(page);
    const title = `Automated CIR Draft ${Date.now()}`;
    await form.fillRequiredFields({ title, reportType: 'Negligence' });
    await form.saveAndSend();
    await form.expectToSeeLocationDisabledError();
  });

  test('fills all required fields and save & send with location service enabled saves successfully', async ({ page, context }) => {
    const form = await reachCIRForm(page);
    await context.grantPermissions(['geolocation'], { origin: 'http://localhost:4200/' });
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });
    const title = `Automated CIR Draft ${Date.now()}`;
    await form.fillRequiredFields({ title, reportType: 'Vehicle Accident' });
    await form.saveAndSend();
    await form.expectReportSuccessfullySent();
    await form.expectSavedToReportList(title);
    await form.expectSavedToReportListWithValidStatusAndType(title, 'Pending', 'Incident', page);
  });
});
