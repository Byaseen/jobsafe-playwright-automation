import { Page, Locator } from '@playwright/test';

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

export class SignupTrialPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly firstName: Locator;
  readonly surname: Locator;
  readonly email: Locator;
  readonly confirmEmail: Locator;
  readonly phoneNumber: Locator;
  readonly companyName: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly nameOnCard: Locator;
  readonly cardNumber: Locator;
  readonly expiryDate: Locator;
  readonly cvv: Locator;
  readonly countryValue: Locator;
  readonly agreementSwitch: Locator;
  readonly registerButton: Locator;
  readonly goBackButton: Locator;

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
  }

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

  async clickRegister() {
    await this.page.waitForTimeout(2000);
    await this.registerButton.click();
  }

  async onCaptchaClick() {
    const captchaFrame = this.page.frameLocator('iframe[title*="reCAPTCHA"]');
    await captchaFrame.locator('#recaptcha-anchor').click();  
  }

  async clickGoBack() {
    await this.goBackButton.click();
  }

  async getValidationMessage(text: string) {
    return this.page.locator(`text=${text}`);
  }
}
