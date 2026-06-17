import { expect, Locator, Page } from '@playwright/test';

export class ChangePasswordPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly pageTitle: Locator;
  readonly heading: Locator;
  readonly codeInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly resetNowButton: Locator;
  readonly contactSupportLink: Locator;
  readonly requestAnotherCodeLink: Locator;
  readonly invalidCodeError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: 'back' });
    this.pageTitle = page.getByText('Reset your password');
    this.heading = page.getByRole('heading', { name: 'Enter your new password below:' });
    this.codeInput =  page.getByPlaceholder('Code')
    this.newPasswordInput = page.getByPlaceholder('Choose a password').nth(0);
    this.confirmPasswordInput = page.locator('app-form-control-wrapper').filter({ hasText: 'Confirm Password :' }).locator('label');
    this.resetNowButton = page.getByRole('button', { name: 'Reset Now' });
    this.contactSupportLink = page.getByText('Still need help? - Contact us');
    this.requestAnotherCodeLink = page.getByText(/Request another code/i);
    this.invalidCodeError = page.getByText(/the code that you have used is invalid|expired code|code is incorrect|code expired/i);
  }

  async goto() {
    await this.page.goto('/change-password');
  }

  async fillCode(code: string) {
    await this.codeInput.fill(code);
  }

  async fillNewPassword(password: string) {
    await this.newPasswordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async clickResetNow() {
    await this.resetNowButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickContactSupport() {
    await this.contactSupportLink.click();
  }

  async clickRequestAnotherCode() {
    await this.requestAnotherCodeLink.click();
  }

  async expectPageVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.codeInput).toBeVisible();
    await expect(this.newPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.resetNowButton).toBeVisible();
    await expect(this.contactSupportLink).toBeVisible();
  }
}
