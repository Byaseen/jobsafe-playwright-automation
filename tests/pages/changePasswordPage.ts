import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The "Reset your password" screen (/change-password): the user enters the code
 * emailed to them plus a new password (twice). Submitting a wrong code navigates
 * to /change-password-error (see ChangePasswordErrorPage). A valid code completes
 * the reset and leaves the route. "Still need help? - Contact us" opens the
 * shared contact-us modal.
 */
export class ChangePasswordPage {
  readonly page: Page;
  // ─── Header ───────────────────────────────────────────────────
  /** Back arrow — uses browser history (goes to where you came from). */
  readonly backButton: Locator;
  // ─── Headings ─────────────────────────────────────────────────
  readonly pageTitle: Locator;
  readonly heading: Locator;
  // ─── Inputs + primary action ──────────────────────────────────
  /** 6-digit numeric reset code (number input). */
  readonly codeInput: Locator;
  /** "New Password" field. */
  readonly newPasswordInput: Locator;
  /** "Confirm Password" field. */
  readonly confirmPasswordInput: Locator;
  /** "Reset Now" submit button — disabled until all fields are valid. */
  readonly resetNowButton: Locator;
  // ─── Secondary links ──────────────────────────────────────────
  /** Opens the shared contact-us support modal. */
  readonly contactSupportLink: Locator;
  // ─── Validation messages ──────────────────────────────────────
  readonly codeRequiredError: Locator;
  readonly passwordRequiredError: Locator;
  readonly passwordMismatchError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.locator('app-change-password').getByRole('button', { name: 'back', exact: true });
    this.pageTitle = page.getByText('Reset your password', { exact: true });
    this.heading = page.getByRole('heading', { name: 'Enter your new password below:' });
    this.codeInput = page.getByTestId('change-password-code-field').locator('input').first();
    this.newPasswordInput = page.getByTestId('change-password-password-field').locator('input').first();
    this.confirmPasswordInput = page.getByTestId('change-password-confirm-password-field').locator('input').first();
    this.resetNowButton = page.getByTestId('change-password-submit-button').getByRole('button');
    this.contactSupportLink = page.getByText('Still need help? - Contact us', { exact: true });
    this.codeRequiredError = page.getByText('Code is required!', { exact: true });
    this.passwordRequiredError = page.getByText('Password is required!', { exact: true });
    this.passwordMismatchError = page.getByText('Password confirmation does not match', { exact: true });
  }

  // ─── Actions ───────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/change-password');
  }

  async fillCode(code: string) {
    await this.codeInput.clear();
    await this.codeInput.pressSequentially(code, { delay: 50 });
  }

  async fillNewPassword(password: string) {
    await this.newPasswordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  /** Fill code + both password fields. `confirm` defaults to `newPassword`. */
  async fillForm({ code, newPassword, confirm }: { code: string; newPassword: string; confirm?: string }) {
    await this.fillCode(code);
    await this.fillNewPassword(newPassword);
    await this.fillConfirmPassword(confirm ?? newPassword);
  }

  async clickResetNow() {
    await this.resetNowButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async openHelp() {
    await this.contactSupportLink.click();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/change-password$/, { timeout: 10_000 });
    await expect(this.pageTitle).toBeVisible({ timeout: 10_000 });
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
    await expect(this.codeInput).toBeVisible({ timeout: 10_000 });
    await expect(this.newPasswordInput).toBeVisible({ timeout: 10_000 });
    await expect(this.confirmPasswordInput).toBeVisible({ timeout: 10_000 });
    await expect(this.resetNowButton).toBeVisible({ timeout: 10_000 });
    await expect(this.contactSupportLink).toBeVisible({ timeout: 10_000 });
  }

  async expectResetDisabled() {
    await expect(this.resetNowButton).toBeDisabled({ timeout: 10_000 });
  }

  async expectResetEnabled() {
    await expect(this.resetNowButton).toBeEnabled({ timeout: 10_000 });
  }

  async expectCodeRequiredError() {
    await expect(this.codeRequiredError).toBeVisible({ timeout: 10_000 });
  }

  async expectPasswordRequiredError() {
    await expect(this.passwordRequiredError).toBeVisible({ timeout: 10_000 });
  }

  async expectMismatchError() {
    await expect(this.passwordMismatchError).toBeVisible({ timeout: 10_000 });
  }

  /** The reset succeeded: a confirmation shows and we've left the change page. */
  async expectResetSucceeded() {
    await expect(this.page.getByText(/Your password has been reset successfully, please login with your new password/i)).toBeVisible({ timeout: 15_000 });
    await expect(this.page).toHaveURL(/login/);
  }
}
