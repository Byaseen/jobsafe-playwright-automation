import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * The HSSE report form (/hsse-report). The happy-path tests drive the two
 * required free-text fields (Title, Description) and Save; saving returns to the
 * incident-reports list with the new report listed.
 */
export class HSSEFormPage {
  readonly page: Page;
  readonly titleField: Locator;
  readonly descriptionField: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleField = page.locator('[formcontrolname="title"]');
    this.descriptionField = page.locator('[formcontrolname="description"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  // ─── Actions ───────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/hsse-report');
  }

  async fillTitle(text: string) {
    await this.titleField.fill(text);
  }

  async fillDescription(text: string) {
    await this.descriptionField.fill(text);
  }

  async fill({ title, description }: { title: string; description: string }) {
    await this.fillTitle(title);
    await this.fillDescription(description);
  }

  async save() {
    await this.saveButton.click();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.page).toHaveURL(/hsse-report/, { timeout: 15_000 });
    await expect(this.titleField).toBeVisible({ timeout: 15_000 });
  }

  /** After saving we land back on the list with the report showing. */
  async expectSaved(title: string) {
    await expect(this.page).toHaveURL(/incident-reports/, { timeout: 20_000 });
    await expect(this.page.getByText(title)).toBeVisible({ timeout: 15_000 });
  }
}
