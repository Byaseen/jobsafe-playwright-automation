import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';

/**
 * The Forgot Password screen — enter an email to request a reset code.
 * Reached from the login screen's "Forgot password?" link.
 */
export class ForgotPasswordPage {
  readonly screen: Screen;
  readonly email: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  /** The back-arrow is the first Button in the header. */
  readonly backArrow: Locator;
  /** The help (?) control is the second Button in the header. */
  readonly helpButton: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.email = screen.getByPlaceholder('Email');
    this.nextButton = screen.getByRole('button', { name: 'Next' });
    this.backButton = screen.getByRole('button', { name: 'Go back to previous screen' });
    this.backArrow = screen.getByType('Button').first();
    this.helpButton = screen.getByType('Button').nth(1);
  }

  // ─── Actions ───────────────────────────────────────────────────
  async fillEmail(email: string) {
    await this.email.fill(email);
  }

  async submit() {
    await this.nextButton.tap();
  }

  /** Fill the email and submit the reset request. */
  async requestReset(email: string) {
    await this.fillEmail(email);
    await this.submit();
  }

  async tapBack() {
    await this.backButton.tap();
  }

  async tapBackArrow() {
    await this.backArrow.tap();
  }

  async openHelp() {
    await this.helpButton.tap();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.screen.getByText(/Simply provide us with your Email/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.email).toBeVisible({ timeout: 10_000 });
    await expect(this.nextButton).toBeVisible({ timeout: 10_000 });
    await expect(this.backButton).toBeVisible({ timeout: 10_000 });
  }

  async expectRequiredEmailError() {
    await expect(this.screen.getByText(/Email is required!/i)).toBeVisible({ timeout: 10_000 });
  }

  async expectInvalidEmailError() {
    await expect(this.screen.getByText(/Email is invalid!/i)).toBeVisible({ timeout: 10_000 });
  }
}
