import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly forgotLink: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByPlaceholder('Email');
    this.password = page.getByPlaceholder('Choose a password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.createAccountButton = page.getByRole('button', { name: 'No Account? Create an account' });
  }

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

  async clickForgot() {
    await this.forgotLink.click();
  }

  async clickCreateAccount() {
    await this.createAccountButton.click();
  }
}
