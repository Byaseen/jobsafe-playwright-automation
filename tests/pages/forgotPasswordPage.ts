import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The "Forgotten password" screen (/forgot-password) and the "Thank you!"
 * confirmation it transitions to (/check-email-exists). Both views are rendered
 * by the same APP-FORGOT-PASSWORD component, so they share this page object.
 * The "?" banner button opens the shared contact-us modal.
 */
export class ForgotPasswordPage {
  readonly page: Page;
  // ─── Headings ─────────────────────────────────────────────────
  readonly heading: Locator;
  readonly subheading: Locator;
  // ─── Inputs + primary actions (forgot-password view) ──────────
  /** Email text input — inside the ion-input custom element. */
  readonly email: Locator;
  /** "Next" submit button — disabled until a valid email is entered. */
  readonly nextButton: Locator;
  /** In-page "Go back to previous screen" button → login. */
  readonly backButton: Locator;
  /** Header back arrow → login. */
  readonly headerBackButton: Locator;
  /** "?" header icon that opens the contact-us modal. */
  readonly helpButton: Locator;
  // ─── Validation messages ──────────────────────────────────────
  readonly emailRequiredError: Locator;
  readonly emailInvalidError: Locator;
  // ─── "Thank you!" confirmation view (/check-email-exists) ─────
  /** "Thank you!" h1. */
  readonly thankYouHeading: Locator;
  /** "We have received your request" h2. */
  readonly thankYouSubheading: Locator;
  /** "No Email received? - Contact us" link on the thank-you screen. */
  readonly noEmailReceivedLink: Locator;
  /** "Change Password" button on the thank-you screen → /change-password. */
  readonly changePasswordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText('Forgotten password', { exact: true });
    this.subheading = page.getByText('Simply provide us with your Email:', { exact: true });
    this.email = page.getByTestId('forgot-password-email-field').locator('input');
    this.nextButton = page.getByTestId('reset-password-button').getByRole('button');
    this.backButton = page.getByTestId('forgot-password-back-button').getByRole('button');
    this.headerBackButton = page.getByRole('button', { name: 'back', exact: true });
    this.helpButton = page.getByTestId('header-help-button').getByRole('button');
    this.emailRequiredError = page.getByText('Email is required!');
    this.emailInvalidError = page.getByText('Email is invalid!');
    this.thankYouHeading = page.getByText('Thank you!', { exact: true });
    this.thankYouSubheading = page.getByText('We have received your request', { exact: true });
    this.noEmailReceivedLink = page.getByText('No Email received? - Contact us', { exact: true });
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
    await this.page.keyboard.press('Tab');
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

  async clickHeaderBack() {
    await this.headerBackButton.click();
  }

  async clickChangePassword() {
    await this.changePasswordButton.click();
  }

  async clickNoEmailReceived() {
    await this.noEmailReceivedLink.click();
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

  /** Reached the "Thank you!" confirmation (quick gate check). */
  async expectReachedThankYou() {
    await expect(this.page).toHaveURL(/check-email-exists/, { timeout: 15_000 });
    await expect(this.thankYouHeading).toBeVisible({ timeout: 10_000 });
  }

  /** Full structural check of the "Thank you!" confirmation screen. */
  async expectThankYouFullyLoaded() {
    await expect(this.page).toHaveURL(/check-email-exists/, { timeout: 15_000 });
    await expect(this.thankYouHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.thankYouSubheading).toBeVisible({ timeout: 10_000 });
    await expect(this.noEmailReceivedLink).toBeVisible({ timeout: 10_000 });
    await expect(this.changePasswordButton).toBeVisible({ timeout: 10_000 });
  }
}
