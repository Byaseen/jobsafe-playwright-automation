import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The "/change-password-error" screen: shown when the user submits an invalid
 * or expired reset code. Offers a "Try again" route back to the reset form,
 * a "Request another code" link to restart the flow, and a support modal.
 */
export class ChangePasswordErrorPage {
  readonly page: Page;
  /** Header back arrow — navigates to the login page. */
  readonly backButton: Locator;
  /** "Whoops!" h1. */
  readonly heading: Locator;
  /** "Password was not changed!" h2. */
  readonly subheading: Locator;
  /** The inline explanation of why the reset failed. */
  readonly errorMessage: Locator;
  /** "Try again" — navigates back to /change-password. */
  readonly tryAgainButton: Locator;
  /** "Need help? - Contact us" — opens the shared support modal. */
  readonly needHelpLink: Locator;
  /** "Request another code" — navigates to /forgot-password to restart. */
  readonly requestAnotherCodeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.locator('app-change-password-error').getByRole('button', { name: 'back', exact: true });
    this.heading = page.getByText('Whoops!', { exact: true });
    this.subheading = page.getByRole('heading', { name: 'Password was not changed!' });
    this.errorMessage = page.getByText('The code that you have used is invalid!');
    this.tryAgainButton = page.getByTestId('change-password-error-try-again-button').getByRole('button');
    this.needHelpLink = page.getByText('Need help? - Contact us', { exact: true });
    this.requestAnotherCodeLink = page.getByTestId('change-password-error-request-code-link');
  }

  // ─── Actions ───────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/change-password-error');
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickTryAgain() {
    await this.tryAgainButton.click();
  }

  async clickRequestAnotherCode() {
    await this.requestAnotherCodeLink.click();
  }

  async openHelp() {
    await this.needHelpLink.click();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.page).toHaveURL(/change-password-error/, { timeout: 10_000 });
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
    await expect(this.subheading).toBeVisible({ timeout: 10_000 });
    await expect(this.errorMessage).toBeVisible({ timeout: 10_000 });
    await expect(this.tryAgainButton).toBeVisible({ timeout: 10_000 });
    await expect(this.requestAnotherCodeLink).toBeVisible({ timeout: 10_000 });
  }
}
