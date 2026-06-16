import { Page, Locator } from '@playwright/test';

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

  async goto() {
    await this.page.goto('/hsse-report');
  }

  async fillTitle(text: string) {
    await this.titleField.fill(text);
  }

  async fillDescription(text: string) {
    await this.descriptionField.fill(text);
  }

  async save() {
    await this.saveButton.click();
  }
}
