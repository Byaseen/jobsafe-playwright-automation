import { test, expect } from '@playwright/test';
import { SignupTrialPage, SignupTrialData } from './pages/signupTrialPage';

const validSignupData: SignupTrialData = {
  firstName: 'Test',
  surname: 'User',
  email: 'test+' + Date.now() + '@example.com',
  confirmEmail: 'test+' + Date.now() + '@example.com',
  phoneNumber: '+441234567890',
  companyName: 'JobSafe Test Ltd',
  password: 'P@ssw0rd123!',
  confirmPassword: 'P@ssw0rd123!'
};

const usedEmailData: SignupTrialData = {
  firstName: 'Test',
  surname: 'User',
  email: 'wifihaf124@fanchatu.com',
  confirmEmail: 'wifihaf124@fanchatu.com',
  phoneNumber: '+441234567890',
  companyName: 'JobSafe Test Ltd',
  password: 'P@ssw0rd123!',
  confirmPassword: 'P@ssw0rd123!'
};

const invalidEmailData: SignupTrialData = {
  firstName: 'Test',
  surname: 'User',
  email: 'userexample.com',
  confirmEmail: 'different@example.com',
  phoneNumber: '+441234567890',
  companyName: 'JobSafe Test Ltd',
  password: 'P@ssw0rd123!',
  confirmPassword: 'P@ssw0rd123!'
};

const passwordMismatchData: SignupTrialData = {
  firstName: 'Test',
  surname: 'User',
  email: 'test+' + Date.now() + '@example.com',
  confirmEmail: 'test+' + Date.now() + '@example.com',
  phoneNumber: '+441234567890',
  companyName: 'JobSafe Test Ltd',
  password: 'P@ssw0rd123!',
  confirmPassword: 'Mismatch123!'
};

const requiredFieldErrorText = 'This field is required';

const signupUrl = '/signup-trial';

test.describe('Signup trial flow', () => {
  test.beforeEach(async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.goto();
  });

  test('renders all required inputs and actions', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await expect(signup.firstName).toBeVisible();
    await expect(signup.surname).toBeVisible();
    await expect(signup.email).toBeVisible();
    await expect(signup.confirmEmail).toBeVisible();
    await expect(signup.phoneNumber).toBeVisible();
    await expect(signup.companyName).toBeVisible();
    await expect(signup.password).toBeVisible();
    await expect(signup.confirmPassword).toBeVisible();
    await expect(signup.countryValue).toBeVisible();
    await expect(signup.agreementSwitch).toBeVisible();
    await expect(signup.registerButton).toBeVisible();
    await expect(signup.goBackButton).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${signupUrl}$`));
  });

  test('required field validation displays inline errors', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.firstName.focus();
    await signup.surname.click();
    await signup.email.click();
    await signup.confirmEmail.click();
    await signup.phoneNumber.click();
    await signup.companyName.click();
    await signup.password.click();
    await signup.confirmPassword.click();
    await signup.goBackButton.click();
    await signup.goto();

    await signup.firstName.focus();
    await signup.surname.focus();
    await signup.email.focus();
    await signup.confirmEmail.focus();
    await signup.phoneNumber.focus();
    await signup.companyName.focus();
    await signup.password.focus();
    await signup.confirmPassword.focus();
    await page.keyboard.press('Tab');

    await expect(page.locator(`text=${requiredFieldErrorText}`)).toHaveCount(8);
  });

  test('invalid email and mismatch email show validation errors', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.fillRequiredFields(invalidEmailData);
    await signup.agreeToTerms();
    await signup.onCaptchaClick();
    await signup.clickRegister();
    await expect(page.getByText('Email is invalid!', { exact: true })).toBeVisible();
    await expect(page.getByText('Emails are not matching')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${signupUrl}$`));
  });

  test('password confirmation mismatch shows validation error', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.fillRequiredFields(passwordMismatchData);
    await signup.agreeToTerms();
    await signup.onCaptchaClick();
    await signup.clickRegister();
    await expect(page.getByText('Password confirmation does not match')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${signupUrl}$`));
  });

  test('optional card fields can remain empty and still allow registration', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    const data = { ...validSignupData };
    await signup.fillRequiredFields(data);
    await signup.disagreeToTerms();
    await signup.agreeToTerms();
    await signup.onCaptchaClick();
    await signup.clickRegister();
    await expect(page.locator('div').filter({ hasText: 'Verify your email addressWe\'' })).toBeVisible();
  });

  test('registration with used email displays error and remains on signup page', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.fillRequiredFields(usedEmailData);
    await signup.agreeToTerms();
    await signup.onCaptchaClick();
    await signup.clickRegister();
      await expect(page.getByText('Email already in use. Please')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${signupUrl}$`));
  });

  test('successful signup shows confirmation instruction', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.fillRequiredFields(validSignupData);
    await signup.agreeToTerms();
    await signup.onCaptchaClick();
    await signup.clickRegister();
    await expect(page.locator('div').filter({ hasText: 'Verify your email addressWe\'' })).toBeVisible();
  });
});
