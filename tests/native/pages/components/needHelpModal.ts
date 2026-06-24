import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';

/**
 * The "Need Help?" support modal. It appears on more than one screen (login,
 * forgot-password, reset-password), so it lives as a shared component object.
 * The action that OPENS it differs per screen and stays in those page objects.
 */
export class NeedHelpModal {
  readonly screen: Screen;
  readonly title: Locator;
  readonly closeButton: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.title = screen.getByText(/Need Help\?/i);
    this.closeButton = screen.getByRole('button', { name: 'Close' });
  }

  async expectOpen() {
    await expect(this.title).toBeVisible({ timeout: 10_000 });
    await expect(
      this.screen.getByText(
        /If you are experiencing any issues, Please attempt to refresh the page before contacting support. Thank you/i,
      ),
    ).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Call on/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Email us on/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.screen.getByText(/Monday - Friday | 9:00am - 5:00pm UK /i)).toBeVisible({ timeout: 10_000 });
    await expect(this.closeButton).toBeVisible({ timeout: 10_000 });
  }

  async close() {
    await this.closeButton.tap();
  }
}
