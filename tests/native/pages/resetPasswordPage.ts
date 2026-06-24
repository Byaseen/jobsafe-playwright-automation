import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';
import { dismissKeyboard } from '../utils/keyboard';
import { waitForDeviceInput } from '../utils/manual-input';

/** Password-rule error messages shown live as you type the new password. */
const PASSWORD_RULE_ERRORS = [
  /Must contain at least 1 number!/i,
  /Must contain at least 1 in Capital Case!/i,
  /Must contain at least 1 letter in Small Case!/i,
  /Must contain at least 1 special Character!/i,
  /Must be at least 8 characters long/i,
];

/**
 * The Reset Password screen (Code + New/Confirm password + Reset Now) and the
 * wrong-code error screen it leads to. Reached via Forgot Password → Thank you →
 * Change Password.
 *
 * Every fill is followed by dismissKeyboard() because the iOS keyboard overlaps
 * the lower fields / the Reset Now button and would otherwise intercept taps.
 */
export class ResetPasswordPage {
  readonly screen: Screen;
  readonly code: Locator;
  readonly newPassword: Locator;
  readonly confirmPassword: Locator;
  readonly resetNowButton: Locator;
  readonly stillNeedHelpLink: Locator;
  // Wrong-code error screen:
  readonly tryAgainButton: Locator;
  readonly needHelpLink: Locator;
  readonly requestAnotherCodeLink: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.code = screen.getByPlaceholder('Code');
    this.newPassword = screen.getByPlaceholder('Choose a password').first();
    this.confirmPassword = screen.getByPlaceholder('Choose a password').last();
    this.resetNowButton = screen.getByRole('button', { name: 'Reset Now' });
    this.stillNeedHelpLink = screen.getByText(/Still need help\?/i);
    this.tryAgainButton = screen.getByRole('button', { name: 'Try again' });
    this.needHelpLink = screen.getByText(/Need help\?/i);
    this.requestAnotherCodeLink = screen.getByText(/Request another code/i);
  }

  // ─── Field actions (each dismisses the keyboard afterwards) ─────
  async fillCode(code: string) {
    await this.code.fill(code);
    await dismissKeyboard(this.screen);
  }

  async fillNewPassword(password: string) {
    await this.newPassword.fill(password);
    await dismissKeyboard(this.screen);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPassword.fill(password);
    await dismissKeyboard(this.screen);
  }

  async submit() {
    await this.resetNowButton.tap();
  }

  /** Submit after the code was typed on the device — dismiss the keyboard that
   *  on-device typing raised so it doesn't intercept the Reset Now tap. */
  async submitAfterEmailedCode() {
    await dismissKeyboard(this.screen);
    await this.submit();
  }

  /** Fill code + both passwords and submit. confirm defaults to newPassword. */
  async reset({ code, newPassword, confirm }: { code: string; newPassword: string; confirm?: string }) {
    await this.fillCode(code);
    await this.fillNewPassword(newPassword);
    await this.fillConfirmPassword(confirm ?? newPassword);
    await this.submit();
  }

  /** Tap each field then submit without entering anything — required validation. */
  async submitEmpty() {
    await this.code.tap();
    await dismissKeyboard(this.screen);
    await this.newPassword.tap();
    await dismissKeyboard(this.screen);
    await this.confirmPassword.tap();
    await dismissKeyboard(this.screen);
    await this.submit();
  }

  async openHelp() {
    await this.stillNeedHelpLink.tap();
  }

  async tapTryAgain() {
    await this.tryAgainButton.tap();
  }

  async tapRequestAnotherCode() {
    await this.requestAnotherCodeLink.tap();
  }

  /**
   * Pause until the real emailed verification code (6 digits) is typed into the
   * Code field on the device, then return it. Used only by the manual happy path.
   */
  async waitForEmailedCode(message = 'Type the emailed verification code into the Code field on the iPhone…') {
    return waitForDeviceInput(() => this.code.getValue(), {
      isComplete: (value) => /^\d{6}$/.test(value),
      message,
    });
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.screen.getByText(/Reset your Password/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByLabel('New Password')).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByLabel('Confirm Password')).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByLabel('Code')).toBeVisible({ timeout: 10_000 });
    await expect(this.resetNowButton).toBeVisible({ timeout: 10_000 });
  }

  async expectRequiredErrors() {
    await expect(this.screen.getByText(/Code is required!/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Password is required!/i)).toHaveCount(2, { timeout: 10_000 });
  }

  /** Assert the live password-rule errors are all shown / all cleared. */
  async expectPasswordRuleErrors(visible: boolean) {
    for (const rule of PASSWORD_RULE_ERRORS) {
      const assertion = expect(this.screen.getByText(rule));
      if (visible) {
        await assertion.toBeVisible({ timeout: 10_000 });
      } else {
        await assertion.not.toBeVisible({ timeout: 10_000 });
      }
    }
  }

  async expectMismatchError(visible: boolean) {
    const assertion = expect(this.screen.getByText(/Password confirmation does not match/i));
    if (visible) {
      await assertion.toBeVisible({ timeout: 10_000 });
    } else {
      await assertion.not.toBeVisible({ timeout: 10_000 });
    }
  }

  async expectWrongCodeScreen() {
    await expect(this.screen.getByText(/Password was not changed!/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/The code that you have used is invalid!/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.tryAgainButton).toBeVisible({ timeout: 10_000 });
    await expect(this.needHelpLink).toBeVisible({ timeout: 10_000 });
    await expect(this.requestAnotherCodeLink).toBeVisible({ timeout: 10_000 });
  }

  async expectInvalidCodeError() {
    await expect(this.screen.getByText(/The code that you have used is invalid!/i)).toBeVisible({ timeout: 10_000 });
  }

  async expectResetSuccess() {
    await expect(this.screen.getByText(/Your password has been reset successfully/i)).toBeVisible({ timeout: 10_000 });
  }
}
