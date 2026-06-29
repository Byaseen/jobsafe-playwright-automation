import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The "Reset your password" screen (/change-password): the user enters the code
 * emailed to them plus a new password (twice). A wrong code surfaces an inline
 * error and a "Request another code" link; the "Still need help? - Contact us"
 * link opens the shared contact-us modal.
 */
export class ChangePasswordPage {
  readonly page: Page;
  // Headings + header.
  readonly backButton: Locator;
  readonly pageTitle: Locator;
  readonly heading: Locator;
  // Inputs + primary action.
  readonly codeInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly resetNowButton: Locator;
  // Secondary links.
  readonly contactSupportLink: Locator;
  readonly requestAnotherCodeLink: Locator;
  // Validation messages.
  readonly codeRequiredError: Locator;
  readonly passwordRequiredError: Locator;
  readonly passwordMismatchError: Locator;
  readonly invalidCodeError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: 'back' });
    this.pageTitle = page.getByText('Reset your password');
    this.heading = page.getByRole('heading', { name: 'Enter your new password below:' });
    this.codeInput = page.getByPlaceholder('Code');
    // The new + confirm password fields share the "Choose a password" placeholder
    // and are ordered new-then-confirm in the DOM.
    this.newPasswordInput = page.getByPlaceholder('Choose a password').nth(0);
    this.confirmPasswordInput = page.getByPlaceholder('Choose a password').nth(1);
    this.resetNowButton = page.getByRole('button', { name: 'Reset Now' });
    this.contactSupportLink = page.getByText('Still need help? - Contact us');
    this.requestAnotherCodeLink = page.getByText(/Request another code/i);
    this.codeRequiredError = page.getByText('Code is required!', { exact: true });
    this.passwordRequiredError = page.getByText('Password is required!', { exact: true });
    this.passwordMismatchError = page.getByText('Password confirmation does not match', { exact: true });
    this.invalidCodeError = page.getByText(
      /the code that you have used is invalid|expired code|code is incorrect|code expired/i,
    );
  }

  // ─── Actions ───────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/change-password');
  }

  async fillCode(code: string) {
    await this.codeInput.fill(code);
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

  /** The wrong-code error and the offer to request a fresh code are both shown. */
  async expectInvalidCode() {
    await expect(this.invalidCodeError).toBeVisible({ timeout: 10_000 });
  }

  async expectRequestAnotherCodeVisible() {
    await expect(this.requestAnotherCodeLink).toBeVisible({ timeout: 10_000 });
  }

  /** The reset succeeded: a confirmation shows and we've left the change page. */
  async expectResetSucceeded() {
    await expect(this.page.getByText(/password.*(changed|reset|updated)|success/i)).toBeVisible({ timeout: 15_000 });
    await expect(this.page).not.toHaveURL(/change-password/);
  }
}
