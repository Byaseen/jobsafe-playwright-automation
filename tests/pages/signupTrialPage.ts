import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

export interface SignupTrialData {
  firstName: string;
  surname: string;
  email: string;
  confirmEmail: string;
  phoneNumber: string;
  companyName: string;
  password: string;
  confirmPassword: string;
  nameOnCard?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

/**
 * The free-trial signup screen (/signup-trial): required personal/company
 * details, optional card fields, a terms switch and a reCAPTCHA. A successful
 * submit advances to the "Verify your email address" confirmation.
 */
export class SignupTrialPage {
  readonly page: Page;
  readonly backButton: Locator;
  // Required fields.
  readonly firstName: Locator;
  readonly surname: Locator;
  readonly email: Locator;
  readonly confirmEmail: Locator;
  readonly phoneNumber: Locator;
  readonly companyName: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  // Optional card fields.
  readonly nameOnCard: Locator;
  readonly cardNumber: Locator;
  readonly expiryDate: Locator;
  readonly cvv: Locator;
  // Misc controls + actions.
  readonly countryValue: Locator;
  readonly agreementSwitch: Locator;
  readonly registerButton: Locator;
  readonly goBackButton: Locator;
  // Validation / outcome messages.
  readonly emailInvalidError: Locator;
  readonly emailsNotMatchingError: Locator;
  readonly passwordMismatchError: Locator;
  readonly emailInUseError: Locator;
  readonly verifyEmailMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: 'back' });
    this.firstName = page.getByPlaceholder('First Name');
    this.surname = page.getByPlaceholder('Surname');
    this.email = page.getByPlaceholder('Email address').first();
    this.confirmEmail = page.getByPlaceholder('Email address').last();
    this.phoneNumber = page.getByPlaceholder('Phone Number');
    this.companyName = page.getByPlaceholder('Company Name');
    this.password = page.getByPlaceholder('Choose a password').first();
    this.confirmPassword = page.getByPlaceholder('Choose a password').last();
    this.nameOnCard = page.getByPlaceholder('Name on Card');
    this.cardNumber = page.getByPlaceholder('Card Number');
    this.expiryDate = page.getByPlaceholder('Expiry Date (MM/YYYY)');
    this.cvv = page.getByPlaceholder('Card Verification Value (CVV)');
    this.countryValue = page.locator('text=United Kingdom');
    this.agreementSwitch = page.getByRole('switch');
    this.registerButton = page.getByRole('button', { name: 'Register & start your FREE trial' });
    this.goBackButton = page.getByRole('button', { name: 'Go back to previous screen' });
    this.emailInvalidError = page.getByText('Email is invalid!', { exact: true });
    this.emailsNotMatchingError = page.getByText('Emails are not matching');
    this.passwordMismatchError = page.getByText('Password confirmation does not match');
    this.emailInUseError = page.getByText('Email already in use. Please');
    this.verifyEmailMessage = page.locator('div').filter({ hasText: "Verify your email addressWe'" }).first();
  }

  // ─── Actions ───────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/signup-trial');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillRequiredFields(data: SignupTrialData) {
    await this.firstName.fill(data.firstName);
    await this.surname.fill(data.surname);
    await this.email.fill(data.email);
    await this.confirmEmail.fill(data.confirmEmail);
    await this.phoneNumber.fill(data.phoneNumber);
    await this.companyName.fill(data.companyName);
    await this.password.fill(data.password);
    await this.confirmPassword.fill(data.confirmPassword);
  }

  async fillOptionalCardFields(data: Partial<SignupTrialData>) {
    if (data.nameOnCard !== undefined) await this.nameOnCard.fill(data.nameOnCard);
    if (data.cardNumber !== undefined) await this.cardNumber.fill(data.cardNumber);
    if (data.expiryDate !== undefined) await this.expiryDate.fill(data.expiryDate);
    if (data.cvv !== undefined) await this.cvv.fill(data.cvv);
  }

  /** Focus every required field in turn then blur, so each is marked touched and
   *  shows its inline required-field error. */
  async touchAllRequiredFields() {
    for (const field of [
      this.firstName,
      this.surname,
      this.email,
      this.confirmEmail,
      this.phoneNumber,
      this.companyName,
      this.password,
      this.confirmPassword,
    ]) {
      await field.focus();
    }
    await this.page.keyboard.press('Tab');
  }

  async agreeToTerms() {
    if (!(await this.agreementSwitch.isChecked())) {
      await this.agreementSwitch.click();
    }
  }

  async disagreeToTerms() {
    if (await this.agreementSwitch.isChecked()) {
      await this.agreementSwitch.click();
    }
  }

  async solveCaptcha() {
    const captchaFrame = this.page.frameLocator('iframe[title*="reCAPTCHA"]');
    await captchaFrame.locator('#recaptcha-anchor').click();
  }

  async clickRegister() {
    // Wait for the form to settle (terms + captcha accepted) rather than sleeping.
    await expect(this.registerButton).toBeEnabled({ timeout: 15_000 });
    await this.registerButton.click();
  }

  /** Fill required fields, accept terms, solve the captcha and submit. */
  async register(data: SignupTrialData) {
    await this.fillRequiredFields(data);
    await this.agreeToTerms();
    await this.solveCaptcha();
    await this.clickRegister();
  }

  async clickGoBack() {
    await this.goBackButton.click();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() {
    await expect(this.firstName).toBeVisible({ timeout: 10_000 });
    await expect(this.surname).toBeVisible({ timeout: 10_000 });
    await expect(this.email).toBeVisible({ timeout: 10_000 });
    await expect(this.confirmEmail).toBeVisible({ timeout: 10_000 });
    await expect(this.phoneNumber).toBeVisible({ timeout: 10_000 });
    await expect(this.companyName).toBeVisible({ timeout: 10_000 });
    await expect(this.password).toBeVisible({ timeout: 10_000 });
    await expect(this.confirmPassword).toBeVisible({ timeout: 10_000 });
    await expect(this.countryValue).toBeVisible({ timeout: 10_000 });
    await expect(this.agreementSwitch).toBeVisible({ timeout: 10_000 });
    await expect(this.registerButton).toBeVisible({ timeout: 10_000 });
    await expect(this.goBackButton).toBeVisible({ timeout: 10_000 });
    await expect(this.page).toHaveURL(/signup-trial$/, { timeout: 10_000 });
  }

  /** Exactly `count` "This field is required" errors are shown (one per field). */
  async expectRequiredErrors(count = 8) {
    await expect(this.page.getByText('This field is required')).toHaveCount(count, { timeout: 10_000 });
  }

  async expectInvalidEmailErrors() {
    await expect(this.emailInvalidError).toBeVisible({ timeout: 10_000 });
    await expect(this.emailsNotMatchingError).toBeVisible({ timeout: 10_000 });
    await expect(this.page).toHaveURL(/signup-trial$/, { timeout: 10_000 });
  }

  async expectPasswordMismatch() {
    await expect(this.passwordMismatchError).toBeVisible({ timeout: 10_000 });
    await expect(this.page).toHaveURL(/signup-trial$/, { timeout: 10_000 });
  }

  async expectEmailInUse() {
    await expect(this.emailInUseError).toBeVisible({ timeout: 10_000 });
    await expect(this.page).toHaveURL(/signup-trial$/, { timeout: 10_000 });
  }

  /** Signup succeeded and the email-verification instruction is shown. */
  async expectVerifyEmailScreen() {
    await expect(this.verifyEmailMessage).toBeVisible({ timeout: 15_000 });
  }
}
