import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The "Need help? - Contact us" support modal. It is opened from more than one
 * screen (login, forgot-password and change-password), so — like the native
 * NeedHelpModal — it lives as a shared component object. The action that OPENS
 * it differs per screen and stays in those page objects (`openHelp()`).
 */
export class ContactUsModal {
  readonly page: Page;
  readonly panel: Locator;

  constructor(page: Page) {
    this.page = page;
    // The modal renders its heading and body in one container; match on the
    // distinctive "Need help? - Contact us" copy. .first() guards against the
    // wrapper/inner divs both matching under strict mode.
    this.panel = page.locator('div').filter({ hasText: 'Need help? - Contact usFor' }).first();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectOpen() {
    await expect(this.panel).toBeVisible({ timeout: 10_000 });
  }
}
