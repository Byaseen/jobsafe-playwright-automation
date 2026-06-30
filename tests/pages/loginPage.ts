import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The login screen — the app's entry point while logged out, reached at /login.
 */
export class LoginPage {
  readonly page: Page;
  // Headings.
  readonly heading: Locator;
  readonly methodsHeading: Locator;
  // Inputs + primary actions.
  readonly email: Locator;
  readonly password: Locator;
  /** Eye icon that toggles the password field between masked and visible. */
  readonly passwordToggle: Locator;
  /** The underlying <input> element inside the password-input component — used for type assertions. */
  readonly passwordNativeInput: Locator;
  readonly loginButton: Locator;
  readonly forgotLink: Locator;
  readonly createAccountButton: Locator;
  /** The "?" support button in the header toolbar that opens the contact-us modal. */
  readonly helpButton: Locator;
  // Validation messages.
  readonly emailRequiredError: Locator;
  readonly passwordRequiredError: Locator;
  readonly emailInvalidError: Locator;
  readonly loginFailedError: Locator;
  /** Present once login reaches the authenticated home shell. */
  readonly homeIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Login' });
    this.methodsHeading = page.getByRole('heading', { name: 'Choose one of the following methods:' });
    this.email = this.email = page.getByTestId('email-input-field').getByPlaceholder('Email');
    this.password = page.getByPlaceholder('Choose a password');
    this.passwordToggle = page.locator('password-input').getByRole('img');
    this.passwordNativeInput = page.locator('password-input input');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.createAccountButton = page.getByRole('button', { name: 'No Account? Create an account' });
    this.helpButton = page.getByTestId('header-help-button').getByRole('button');
    this.emailRequiredError = page.getByText('Email is required!', { exact: true });
    this.passwordRequiredError = page.getByText('Password is required!', { exact: true });
    this.emailInvalidError = page.getByText('Email is invalid!', { exact: true });
    this.loginFailedError = page.getByText(/incorrect|invalid|failed|wrong/i);
    this.homeIndicator = page.locator('#job_tabs');
  }

  // ─── Actions ───────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.email.fill(email);
  }

  async fillPassword(password: string) {
    await this.password.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  /** Fill both credentials and submit (does not navigate; call goto() first). */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Touch both fields then blur, to trigger required-field validation without
   *  entering anything. */
  async submitEmpty() {
    await this.email.click();
    await this.password.click();
    await this.page.keyboard.press('Tab');
  }

  async clickForgot() {
    await this.forgotLink.click();
  }

  async clickCreateAccount() {
    await this.createAccountButton.click();
  }

  async openHelp() {
    await this.helpButton.click();
  }

  async togglePasswordVisibility() {
    await this.passwordToggle.click();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
    await expect(this.methodsHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.email).toBeVisible({ timeout: 10_000 });
    await expect(this.password).toBeVisible({ timeout: 10_000 });
    await expect(this.loginButton).toBeVisible({ timeout: 10_000 });
    await expect(this.forgotLink).toBeVisible({ timeout: 10_000 });
    await expect(this.createAccountButton).toBeVisible({ timeout: 10_000 });
  }

  /** The Login button stays disabled until the form is valid. */
  async expectLoginDisabled() {
    await expect(this.loginButton).toBeDisabled({ timeout: 10_000 });
  }

  async expectLoginEnabled() {
    await expect(this.loginButton).toBeEnabled({ timeout: 10_000 });
  }

  async expectPasswordMasked() {
    await expect(this.passwordNativeInput).toHaveAttribute('type', 'password');
  }

  async expectPasswordVisible() {
    await expect(this.passwordNativeInput).toHaveAttribute('type', 'text');
  }

  async expectInvalidEmailError() {
    await expect(this.emailInvalidError).toBeVisible({ timeout: 10_000 });
  }

  async expectRequiredErrors() {
    await expect(this.emailRequiredError).toBeVisible({ timeout: 10_000 });
    await expect(this.passwordRequiredError).toBeVisible({ timeout: 10_000 });
  }

  async expectReachedHome(timeout = 30_000) {
    await expect(this.page).toHaveURL(/app\/home/, { timeout });
    await expect(this.homeIndicator).toBeVisible({ timeout: 20_000 });
  }

  /** Login was rejected: still on the login route with an error shown. */
  async expectRejected() {
    await expect(this.page).toHaveURL(/login/, { timeout: 10_000 });
    await expect(this.loginFailedError).toBeVisible({ timeout: 10_000 });
  }
}
