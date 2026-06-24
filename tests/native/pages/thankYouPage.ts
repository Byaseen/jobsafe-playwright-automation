import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';

/**
 * The "Thank you!" confirmation screen shown after a valid reset request.
 * Its "Change Password" button leads to the Reset Password screen.
 */
export class ThankYouPage {
  readonly screen: Screen;
  readonly changePasswordButton: Locator;
  readonly noEmailReceivedLink: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    this.noEmailReceivedLink = screen.getByText(/No Email received\?/i);
  }

  // ─── Actions ───────────────────────────────────────────────────
  async tapChangePassword() {
    await this.changePasswordButton.tap();
  }

  async tapNoEmailReceived() {
    await this.noEmailReceivedLink.tap();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.screen.getByText(/Thank you!/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/We have received your request/i)).toBeVisible({ timeout: 10_000 });
    await expect(
      this.screen.getByText(
        /If your email is recognised we will send you an email back with a verification code that you will need to change your current password/i,
      ),
    ).toBeVisible({ timeout: 10_000 });
    await expect(this.changePasswordButton).toBeVisible({ timeout: 10_000 });
    await expect(this.noEmailReceivedLink).toBeVisible({ timeout: 10_000 });
  }
}
