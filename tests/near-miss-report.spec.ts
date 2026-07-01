/**
 * JobSafe web — Near Miss Report creation form.
 *
 * Entry point: Incident Reports list → "Add New" → "Near Miss" card.
 * The URL is /app/settings/incident-reports/near-miss-report.
 *
 * Required fields: Incident Time, Title, Severity Level, Employee Signature.
 * All other fields are optional.
 *
 * The HSSE happy-path is covered in incident-report.spec.ts — tests here focus
 * on the Near Miss-specific workflow including witness management and signature
 * capture.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { IncidentReportsPage } from './pages/incidentReportsPage';
import { NearMissFormPage } from './pages/nearMissFormPage';
import { env } from '../utils/env';

const hasCreds = Boolean(env.email && env.password);

/** Navigate login → incident-reports list → "Add New" → "Near Miss" card. */
async function reachNearMissForm(page: Page) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(env.email, env.password);
  await login.expectReachedHome();

  const ir = new IncidentReportsPage(page);
  await ir.goto();
  await ir.expectLoaded();
  await ir.openAddReportModal();
  await ir.expectAddReportModalOpen();
  await ir.nearMissCard.click();

  const form = new NearMissFormPage(page);
  await form.expectLoaded();
  await page.waitForLoadState('networkidle');
  return form;
}

test.describe('JobSafe web — Near Miss Report creation', () => {
  test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');

  // ─── Page load ─────────────────────────────────────────────────────

  test('reaches the Near Miss form via the real user journey', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.expectLoaded();
  });

  test('displays all three form sections', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.expectFormSections();
  });

  test('pre-fills Date, Employee, Incident Date, and Report Type fields', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await expect(form.dateField).toBeVisible();
    await expect(form.employeeField).toBeVisible();
    await expect(form.incidentDateField).toBeVisible();
    await expect(form.reportTypeField).toBeVisible();
    await expect(form.reportTypeField.getByText('Near Miss', { exact: true })).toHaveCount(2);
  });

  // ─── Required field visibility ─────────────────────────────────────

  test('Information section shows Title and Severity Level as required fields', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await expect(form.titleInput).toBeVisible({ timeout: 10_000 });
    await expect(form.severityLevelField).toBeVisible({ timeout: 10_000 });
  });

  test('Incident Time field is visible and accepts time input', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await expect(form.incidentTimeInput).toBeVisible({ timeout: 10_000 });
    await form.fillIncidentTime('09:30 AM');
    await expect(form.incidentTimeInput).toHaveValue('9:30 AM');
  });

  test('Employee Signature section is visible', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.signatureCaptureHeading.scrollIntoViewIfNeeded();; 
    await expect(form.signatureCaptureHeading).toBeVisible({ timeout: 10_000 });
    await expect(form.employeeSignatureButton).toBeVisible({ timeout: 10_000 });
  });

  // ─── Optional field visibility ─────────────────────────────────────

  test('optional fields are visible: Description, Customer, Address, Site, Job Type', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await expect(form.descriptionInput).toBeVisible({ timeout: 10_000 });
    await expect(form.customerInput).toBeVisible({ timeout: 10_000 });
    await expect(form.addressField).toBeVisible({ timeout: 10_000 });
    await expect(form.siteField).toBeVisible({ timeout: 10_000 });
    await expect(form.jobTypeInput).toBeVisible({ timeout: 10_000 });
  });

  test('Witness Statement section has all expected fields', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.witnessStatementHeading.scrollIntoViewIfNeeded();; 
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
    const form = await reachNearMissForm(page);
    await form.signatureCaptureHeading.scrollIntoViewIfNeeded();
    await expect(form.employeeSignatureButton).toBeVisible({ timeout: 10_000 });
    await expect(form.managerSignatureButton).toBeVisible({ timeout: 10_000 });
    await expect(form.signaturePrintNameInput).toBeVisible({ timeout: 10_000 });
    await expect(form.signatureEmailInput).toBeVisible({ timeout: 10_000 });
    await expect(form.signatureTelInput).toBeVisible({ timeout: 10_000 });
    await expect(form.signaturePositionInput).toBeVisible({ timeout: 10_000 });
  });

  test('Save draft and Save and send buttons are present', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.saveDraftButton.scrollIntoViewIfNeeded();
    await expect(form.saveDraftButton).toBeVisible({ timeout: 10_000 });
    await expect(form.saveAndSendButton).toBeVisible({ timeout: 10_000 });
  });

  // ─── Required field validation ─────────────────────────────────────

  test('clicking Save without filling anything shows 4 required-field errors', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(4);
  });

  test('required errors cover Incident Time, Title, Severity Level, and Employee Signature', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredErrorsVisible();
    await expect(form.requiredError).toHaveCount(4);
  });

  test('filling Title removes its required error', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(4);
    await form.fillTitle('Valid title');
    await form.expectRequiredFieldCount(3);
  });

  test('filling Incident Time removes its required error', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(4);
    await form.fillIncidentTime('10:00 AM');
    await form.expectRequiredFieldCount(3);
  });

  test('selecting a Severity Level removes its required error', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(4);
    await form.selectSeverity('High');
    await form.expectRequiredFieldCount(3);
  });

  // ─── Severity Level dropdown ───────────────────────────────────────

  test('Severity Level dropdown opens an alertdialog with radio options', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.severityLevelField.click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('radio', { name: 'Severe' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'High' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Low' })).toBeVisible();
  });

  test('Cancel button closes the Severity Level dialog without selecting', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.cancelSeveritySelection();
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5_000 });
  });

  test('each Severity Level option can be selected and confirmed', async ({ page }) => {
    const form = await reachNearMissForm(page);
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
    const form = await reachNearMissForm(page);
    await form.employeeSignatureButton.click();
    await form.expectSignatureModalOpen();
  });

  test('signature modal contains Cancel, Clear, and Done buttons', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.employeeSignatureButton.click();
    await form.expectSignatureModalOpen();
    await expect(form.signatureCancelButton).toBeVisible();
    await expect(form.signatureClearButton).toBeVisible();
    await expect(form.signatureDoneButton).toBeVisible();
  });

  test('Cancel button closes the signature modal without capturing', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.employeeSignatureButton.click();
    await form.expectSignatureModalOpen();
    await form.signatureCancelButton.click();
    await form.expectSignatureModalClosed();
    await expect(form.employeeSignatureButton).toBeVisible();
  });

  test('drawing and confirming a signature changes "Sign" to "Re-sign"', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.captureEmployeeSignature();
    await form.expectEmployeeSignatureCaptured();
  });

  test('capturing employee signature removes its required error', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.saveDraftButton.click();
    await form.expectRequiredFieldCount(4);
    await form.captureEmployeeSignature();
    await form.expectRequiredFieldCount(3);
  });

  // ─── Witness consent checkbox ──────────────────────────────────────

  test('witness consent checkbox toggles checked/unchecked state', async ({ page }) => {
    const form = await reachNearMissForm(page);
    const initChecked = await form.isWitnessConsentChecked();
    await form.toggleWitnessConsent();
    const afterToggle = await form.isWitnessConsentChecked();
    expect(afterToggle).toBe(!initChecked);
    await form.toggleWitnessConsent();
    expect(await form.isWitnessConsentChecked()).toBe(initChecked);
  });

  // ─── Add second witness ────────────────────────────────────────────

  test('"Add +" button reveals the second witness statement section', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await expect(form.secondWitnessNameInput).not.toBeVisible();
    await form.clickAddSecondWitness();
    await form.expectSecondWitnessSectionVisible();
  });

  test('second witness section has its own fields and an "Add +" for a third witness', async ({ page }) => {
    const form = await reachNearMissForm(page);
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
    const form = await reachNearMissForm(page);
    await form.fillTitle('My Title');
    await expect(form.titleInput).toHaveValue('My Title');
    await form.fillDescription('Some description here.');
    await expect(form.descriptionInput).toHaveValue('Some description here.');
    await form.fillCustomer('Acme Corp');
    await expect(form.customerInput).toHaveValue('Acme Corp');
    await form.fillJobType('Maintenance');
    await expect(form.jobTypeInput).toHaveValue('Maintenance');
  });

  test('witness name, email, statement, and position accept free text', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.witnessStatementHeading.scrollIntoViewIfNeeded();; 
    await form.fillWitnessName('Jane Witness');
    await expect(form.witnessNameInput).toHaveValue('Jane Witness');
    await form.fillWitnessEmail('Jane@example.com');
    await expect(form.witnessEmailInput).toHaveValue('Jane@example.com');
    await form.fillWitnessStatement('The incident occurred at noon.');
    await expect(form.witnessStatementInput).toHaveValue('The incident occurred at noon.');
  });

  // ─── Navigation ────────────────────────────────────────────────────

  test('back button navigates to the Incident Reports list', async ({ page }) => {
    const form = await reachNearMissForm(page);
    await form.clickBack();
    await expect(page).toHaveURL(/incident-reports$/, { timeout: 10_000 });
  });

  // ─── Happy path ────────────────────────────────────────────────────

  test('fills all required fields and saves a Near Miss report as draft', async ({ page }) => {
    const form = await reachNearMissForm(page);
    const title = `Automated NM Draft ${Date.now()}`;
    await form.fillRequiredFields({ title });
    await form.saveDraft();
    await form.expectSavedToReportList(title);
  });

  test('saved Near Miss draft shows "Near Miss" type and "Draft" status in the list', async ({ page }) => {
    const form = await reachNearMissForm(page);
    const title = `NM Status Check ${Date.now()}`;
    await form.fillRequiredFields({ title });
    await form.saveDraft();
    await expect(page).toHaveURL(/incident-reports$/, { timeout: 20_000 });
    await form.expectSavedToReportListWithValidStatusAndType(title, 'Draft', 'Near Miss', page);
  });

  test('fills required fields plus optional Description and Severity "High", then saves', async ({ page }) => {
    const form = await reachNearMissForm(page);
    const title = `NM With Desc ${Date.now()}`;
    await form.fillIncidentTime('10:00 AM');
    await form.fillTitle(title);
    await form.fillDescription('Detail about the near miss incident.');
    await form.fillCustomer('Beta Client');
    await form.fillJobType('Site inspection');
    await form.selectSeverity('High');
    await form.captureEmployeeSignature();
    await form.saveDraft();
    await form.expectSavedToReportList(title);
  });

  test('fills all required fields and save & send a Near Miss report with location service disabled it should show an error message', async ({ page }) => {
    const form = await reachNearMissForm(page);
    const title = `Automated NM Draft ${Date.now()}`;
    await form.fillRequiredFields({ title });
    await form.saveAndSend();
    await form.expectToSeeLocationDisabledError();
  });

  test('fills all required fields and save & send a Near Miss report with location service enabled it should save successfully', async ({ page,context }) => {
    const form = await reachNearMissForm(page);
    await context.grantPermissions(['geolocation'], { origin: 'http://localhost:4200/' });
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });
    const title = `Automated NM Draft ${Date.now()}`;
    await form.fillRequiredFields({ title });
    await form.saveAndSend();
    await form.expectReportSuccessfullySent();
    await form.expectSavedToReportList(title);
    await form.expectSavedToReportListWithValidStatusAndType(title, 'Pending', 'Near Miss', page);
  });
});