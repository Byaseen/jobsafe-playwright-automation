import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The "Forgotten password" screen (/forgot-password): the user enters their
 * email and is taken to a "Thank you!" confirmation from which they can jump to
 * change-password. The "?" banner button opens the shared contact-us modal.
 */
export class ForgotPasswordPage {
  readonly page: Page;
  // Headings.
  readonly heading: Locator;
  readonly subheading: Locator;
  // Inputs + actions.
  readonly email: Locator;
  readonly nextButton: Locator;
  /** In-page "Go back to previous screen" button (returns to login). */
  readonly backButton: Locator;
  /** Header back arrow, labelled just "back". */
  readonly headerBackButton: Locator;
  readonly helpButton: Locator;
  // Validation messages.
  readonly emailRequiredError: Locator;
  readonly emailInvalidError: Locator;
  // "Thank you!" confirmation page.
  readonly thankYouHeading: Locator;
  readonly changePasswordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Forgotten password' });
    this.subheading = page.getByRole('heading', { name: 'Simply provide us with your Email:' });
    this.email = page.getByPlaceholder('Email');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.backButton = page.getByRole('button', { name: 'Go back to previous screen' });
    this.headerBackButton = page.getByRole('button', { name: 'back', exact: true });
    this.helpButton = page.getByRole('banner').getByRole('button');
    this.emailRequiredError = page.getByText('Email is required!');
    this.emailInvalidError = page.getByText('Email is invalid!');
    this.thankYouHeading = page.getByRole('heading', { name: 'Thank you!' });
    this.changePasswordButton = page.getByRole('button', { name: 'Change Password' });
  }

  // ─── Actions ───────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/forgot-password');
  }

  async fillEmail(email: string) {
    await this.email.fill(email);
  }

  /** Focus then blur the email field, to trigger the required-field validation. */
  async blurEmail() {
    await this.email.focus();
    await this.email.press('Tab');
  }

  async clickNext() {
    await this.nextButton.click();
  }

  /** Fill the email and advance to the "Thank you!" confirmation. */
  async requestReset(email: string) {
    await this.fillEmail(email);
    await this.clickNext();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickChangePassword() {
    await this.changePasswordButton.click();
  }

  async openHelp() {
    await this.helpButton.click();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
    await expect(this.subheading).toBeVisible({ timeout: 10_000 });
    await expect(this.email).toBeVisible({ timeout: 10_000 });
    await expect(this.backButton).toBeVisible({ timeout: 10_000 });
    await expect(this.headerBackButton).toBeVisible({ timeout: 10_000 });
  }

  async expectNextDisabled() {
    await expect(this.nextButton).toBeDisabled({ timeout: 10_000 });
  }

  async expectNextEnabled() {
    await expect(this.nextButton).toBeEnabled({ timeout: 10_000 });
  }

  async expectRequiredError() {
    await expect(this.emailRequiredError).toBeVisible({ timeout: 10_000 });
  }

  /** Assert the "Email is invalid!" message either is or isn't shown. */
  async expectInvalidError(visible: boolean) {
    if (visible) {
      await expect(this.emailInvalidError).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(this.emailInvalidError).not.toBeVisible({ timeout: 10_000 });
    }
  }

  /** No email validation error of either kind is shown. */
  async expectNoErrors() {
    await expect(this.emailInvalidError).not.toBeVisible({ timeout: 10_000 });
    await expect(this.emailRequiredError).not.toBeVisible({ timeout: 10_000 });
  }

  /** Reached the "Thank you!" confirmation after submitting a valid email. */
  async expectReachedThankYou() {
    await expect(this.page).toHaveURL(/check-email-exists/, { timeout: 15_000 });
    await expect(this.thankYouHeading).toBeVisible({ timeout: 10_000 });
  }
}
