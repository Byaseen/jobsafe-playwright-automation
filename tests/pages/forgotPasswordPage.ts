import { Page, Locator } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly email: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByPlaceholder('Email');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.backButton = page.getByRole('button', { name: 'Go back to previous screen' });
  }

  async goto() {
    await this.page.goto('/forgot-password');
  }

  async fillEmail(email: string) {
    await this.email.fill(email);
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }
}
