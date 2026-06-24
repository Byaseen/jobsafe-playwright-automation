import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';
import { dismissKeyboard } from '../utils/keyboard';

/**
 * The login screen — the app's launch screen while logged out.
 */
export class LoginPage {
  readonly screen: Screen;
  readonly email: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly helpButton: Locator;
  /** First thing on the authenticated home — used to assert login (not) reached. */
  readonly homeIndicator: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.email = screen.getByPlaceholder('Email');
    this.password = screen.getByPlaceholder('Choose a password');
    this.loginButton = screen.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = screen.getByText(/Forgot password\?/i);
    this.helpButton = screen.getByType('Button').first();
    this.homeIndicator = screen.getByText(/My Reports/i).first();
  }

  // ─── Actions ───────────────────────────────────────────────────
  async fillEmail(email: string) {
    await this.email.fill(email);
  }

  async fillPassword(password: string) {
    await this.password.fill(password);
  }

  async submit() {
    await this.loginButton.tap();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await dismissKeyboard(this.screen);
    await this.submit();
  }

  /** Tap both fields then submit without entering anything — to trigger the
   *  required-field validation. */
  async submitEmpty() {
    await this.email.tap();
    await this.password.tap();
    await this.submit();
  }

  async tapForgotPassword() {
    await this.forgotPasswordLink.tap();
  }

  async openHelp() {
    await this.helpButton.tap();
  }

  /** True when the login screen is currently showing (used to log in once). */
  async isShowing(timeout = 3_000) {
    return this.loginButton.isVisible({ timeout }).catch(() => false);
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.screen.getByText(/Login/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.email).toBeVisible({ timeout: 10_000 });
    await expect(this.password).toBeVisible({ timeout: 10_000 });
    await expect(this.loginButton).toBeVisible({ timeout: 10_000 });
    await expect(this.forgotPasswordLink).toBeVisible({ timeout: 10_000 });
  }

  async expectRequiredErrors() {
    await expect(this.screen.getByText(/Email is required!/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Password is required!/i)).toBeVisible({ timeout: 10_000 });
  }

  async expectInvalidEmailError() {
    await expect(this.screen.getByText(/Email is invalid!/i)).toBeVisible({ timeout: 10_000 });
  }

  /** Login was rejected: never reached home, still on login, error shown. */
  async expectRejected() {
    await expect(this.homeIndicator).not.toBeVisible({ timeout: 10_000 });
    await expect(this.loginButton).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Incorrect username or password/i)).toBeVisible({ timeout: 10_000 });
  }

  async expectReachedHome(timeout = 30_000) {
    await expect(this.homeIndicator).toBeVisible({ timeout });
  }
}
