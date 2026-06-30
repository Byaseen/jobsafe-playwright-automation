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
  // Required fields. Email and password fields use data-testid → locator('input')
  // because those are custom elements (email-field, password-input) with duplicate
  // placeholders — getByPlaceholder().first()/.last() is fragile by index.
  readonly firstName: Locator;
  readonly surname: Locator;
  readonly email: Locator;
  readonly confirmEmail: Locator;
  readonly phoneNumber: Locator;
  readonly companyName: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  /** Eye icon on the password field — toggles masked ↔ visible. */
  readonly passwordToggle: Locator;
  /** Eye icon on the confirm-password field — toggles masked ↔ visible. */
  readonly confirmPasswordToggle: Locator;
  // Optional card fields.
  readonly nameOnCard: Locator;
  readonly cardNumber: Locator;
  readonly expiryDate: Locator;
  readonly cvv: Locator;
  // Misc controls + actions.
  readonly countryValue: Locator;
  /** The dropdown button inside the country selector that opens the search dialog. */
  readonly countryDropdown: Locator;
  /** The dialog opened by the country selector. */
  readonly countryDialog: Locator;
  readonly agreementSwitch: Locator;
  /** "Terms & Conditions" anchor inside the terms row. */
  readonly termsLink: Locator;
  /** The "?" support button in the page header that opens the contact-us modal. */
  readonly helpButton: Locator;
  readonly registerButton: Locator;
  readonly goBackButton: Locator;
  // Validation / outcome messages.
  readonly emailInvalidError: Locator;
  readonly emailsNotMatchingError: Locator;
  readonly passwordMismatchError: Locator;
  readonly emailInUseError: Locator;
  // ─── Email Verification screen (appears in-place after a successful signup) ──
  /** Kept for backwards-compat with existing tests — prefer verifyHeading. */
  readonly verifyEmailMessage: Locator;
  /** h1 on the verify-email view. */
  readonly verifyHeading: Locator;
  /** Instructions paragraph on the verify-email view. */
  readonly verifyInstructions: Locator;
  /** Number input for the 6-digit OTP code. */
  readonly otpInput: Locator;
  /** "Resend Code" span that triggers a new code to be sent. */
  readonly resendCodeButton: Locator;
  /** "Verify Code" submit button — targets the inner native button. */
  readonly verifyCodeButton: Locator;
  /** Toast shown immediately after signup or after resending the code. */
  readonly codeSentToast: Locator;
  /** Toast shown after submitting an incorrect OTP. */
  readonly codeDoesNotMatchToast: Locator;
  readonly invalidCodeError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: 'back', exact: true });
    this.firstName = page.getByPlaceholder('First Name');
    this.surname = page.getByPlaceholder('Surname');
    this.email = page.getByTestId('signup-email-field').locator('input');
    this.confirmEmail = page.getByTestId('signup-email-confirm-field').locator('input');
    this.phoneNumber = page.getByPlaceholder('Phone Number');
    this.companyName = page.getByPlaceholder('Company Name');
    this.password = page.getByTestId('signup-password-field').locator('input');
    this.confirmPassword = page.getByTestId('signup-password-confirm-field').locator('input');
    this.passwordToggle = page.getByTestId('signup-password-field').getByRole('img');
    this.confirmPasswordToggle = page.getByTestId('signup-password-confirm-field').getByRole('img');
    this.nameOnCard = page.getByPlaceholder('Name on Card');
    this.cardNumber = page.getByPlaceholder('Card Number');
    this.expiryDate = page.getByPlaceholder('Expiry Date (MM/YYYY)');
    this.cvv = page.getByPlaceholder('Card Verification Value (CVV)');
    this.countryValue = page.locator('text=United Kingdom');
    this.countryDropdown = page.getByTestId('signup-country-field').getByRole('button');
    this.countryDialog = page.getByRole('dialog');
    this.agreementSwitch = page.getByRole('switch');
    this.termsLink = page.getByRole('link', { name: 'Terms & Conditions' });
    this.helpButton = page.getByTestId('header-help-button').getByRole('button');
    this.registerButton = page.getByRole('button', { name: 'Register & start your FREE trial' });
    this.goBackButton = page.getByRole('button', { name: 'Go back to previous screen' });
    this.emailInvalidError = page.getByText('Email is invalid!', { exact: true });
    this.emailsNotMatchingError = page.getByText('Emails are not matching');
    this.passwordMismatchError = page.getByText('Password confirmation does not match');
    this.emailInUseError = page.getByText('Email already in use. Please');
    this.verifyEmailMessage = page.getByRole('heading', { name: 'Verify your email address' });
    this.verifyHeading = page.getByRole('heading', { name: 'Verify your email address' });
    this.verifyInstructions = page.getByText("We've sent a 6-digit code to your email");
    this.otpInput = page.getByTestId('signup-otp-field').locator('input');
    this.resendCodeButton = page.getByTestId('signup-resend-code-button');
    this.verifyCodeButton = page.getByTestId('signup-verify-code-button').getByRole('button');
    this.codeSentToast = page.getByRole('status').filter({ hasText: 'Code Sent Successfully' });
    this.codeDoesNotMatchToast = page.getByRole('status').filter({ hasText: 'Code does not match' });
    this.invalidCodeError = page.getByText('Invalid verification code');
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
    await this.page.waitForTimeout(2000);
    await this.clickRegister();
  }

  async clickGoBack() {
    await this.goBackButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async openHelp() {
    await this.helpButton.click();
  }

  async openCountrySelector() {
    await this.countryDropdown.click();
  }

  async togglePasswordVisibility() {
    await this.passwordToggle.click();
  }

  async toggleConfirmPasswordVisibility() {
    await this.confirmPasswordToggle.click();
  }

  async fillOtpCode(code: string) {
    await this.otpInput.fill(code);
  }

  async clickVerifyCode() {
    await this.verifyCodeButton.click();
  }

  async clickResendCode() {
    await this.resendCodeButton.click();
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

  /** Asserts the "Email is invalid!" error shown when the format is wrong but
   *  both email fields match (no mismatch error obscuring it). */
  async expectInvalidEmailFormatError() {
    await expect(this.emailInvalidError).toHaveCount(2, { timeout: 10_000 });
    await expect(this.page).toHaveURL(/signup-trial$/, { timeout: 10_000 });
  }

  /** Asserts the "Emails are not matching" error shown when the two email fields
   *  differ. When a mismatch is present the invalid-format error is not visible,
   *  so this method only checks the mismatch error. */
  async expectInvalidEmailErrors() {
    await expect(this.emailsNotMatchingError).toHaveCount(2, { timeout: 10_000 });
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

  /** Signup succeeded: the verify-email heading is visible (quick gate check). */
  async expectVerifyEmailScreen() {
    await expect(this.verifyHeading).toBeVisible({ timeout: 30_000 });
  }

  /** Full structural check of the verify-email view. */
  async expectVerifyEmailScreenLoaded() {
    await expect(this.verifyHeading).toBeVisible({ timeout: 30_000 });
    await expect(this.verifyInstructions).toBeVisible({ timeout: 10_000 });
    await expect(this.otpInput).toBeVisible({ timeout: 10_000 });
    await expect(this.resendCodeButton).toBeVisible({ timeout: 10_000 });
    await expect(this.verifyCodeButton).toBeVisible({ timeout: 10_000 });
  }

  async expectCodeSentToast() {
    await expect(this.codeSentToast).toBeVisible({ timeout: 10_000 });
  }

  async expectCodeDoesNotMatchToast() {
    await expect(this.codeDoesNotMatchToast.last()).toBeVisible({ timeout: 15_000 });
  }

  async expectInvalidCodeError() {
    await expect(this.invalidCodeError).toBeVisible({ timeout: 10_000 });
  }

  async expectPasswordMasked() {
    await expect(this.password).toHaveAttribute('type', 'password');
  }

  async expectPasswordVisible() {
    await expect(this.password).toHaveAttribute('type', 'text');
  }

  async expectConfirmPasswordMasked() {
    await expect(this.confirmPassword).toHaveAttribute('type', 'password');
  }

  async expectConfirmPasswordVisible() {
    await expect(this.confirmPassword).toHaveAttribute('type', 'text');
  }

  /** Checks the five strength-rule errors that appear for a weak password. */
  async expectPasswordStrengthErrors() {
    await expect(this.page.getByText('Must contain at least 1 number!')).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('Must contain at least 1 in Capital Case!')).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('Must contain at least 1 Letter in Small Case!')).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('Must contain at least 1 Special Character!')).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('Must be at least 8 characters long')).toBeVisible({ timeout: 10_000 });
  }

  async expectCountryDialogOpen() {
    await expect(this.countryDialog).toBeVisible({ timeout: 10_000 });
  }
}
