/**
 * JobSafe web — free-trial signup flow.
 */
import { test, expect } from '@playwright/test';
import { SignupTrialPage } from './pages/signupTrialPage';
import { ContactUsModal } from './pages/components/contactUsModal';
import {
  validSignup,
  passwordMismatchSignup,
  invalidEmailFormatSignup,
  invalidEmailSignup,
  usedEmailSignup,
} from './utils/test-data';

test.describe('JobSafe web — Signup trial', () => {
  test.beforeEach(async ({ page }) => {
    await new SignupTrialPage(page).goto();
  });

  // ─── Page structure ───────────────────────────────────────────

  test('renders all required inputs and actions', async ({ page }) => {
    await new SignupTrialPage(page).expectLoaded();
  });

  // ─── Validation ───────────────────────────────────────────────

  test('required field validation displays inline errors', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.touchAllRequiredFields();
    await signup.expectRequiredErrors(8);
  });

  test('invalid email format shows "Email is invalid!" error', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(invalidEmailFormatSignup());
    await signup.expectInvalidEmailFormatError();
  });

  test('mismatched email addresses show "Emails are not matching" error', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(invalidEmailSignup());
    await signup.expectInvalidEmailErrors();
  });

  test('password confirmation mismatch shows a validation error', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(passwordMismatchSignup());
    await signup.expectPasswordMismatch();
  });

  test('weak password triggers all strength validation errors', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.password.fill('weak');
    await signup.surname.click();
    await signup.expectPasswordStrengthErrors();
  });

  // ─── Password fields ──────────────────────────────────────────

  test('both password fields are masked by default', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.expectPasswordMasked();
    await signup.expectConfirmPasswordMasked();
  });
  
  // ─── Terms & country ──────────────────────────────────────────

  test('Terms & Conditions link points to the jobsafe terms URL', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await expect(signup.termsLink).toHaveAttribute('href', 'https://jobsafe.cloud/terms-and-conditions/');
  });

  test('country selector opens a searchable dialog', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.openCountrySelector();
    await signup.expectCountryDialogOpen();
  });

  // ─── Optional card fields ─────────────────────────────────────

  test('optional card fields can remain empty and still allow registration', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(validSignup());
    await signup.expectVerifyEmailScreen();
  });

  // ─── Signup outcomes ──────────────────────────────────────────

  test('registration with a used email shows an error and stays on signup', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(usedEmailSignup());
    await signup.expectEmailInUse();
  });

  test('successful signup lands on the email-verification screen', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(validSignup());
    await signup.expectVerifyEmailScreenLoaded();
    await expect(page).toHaveURL(/signup-trial/);
  });

  // ─── Email Verification screen ────────────────────────────────

  test.describe('Email Verification screen', () => {
    // Each test reaches the verify screen by completing a fresh signup.
    test.beforeEach(async ({ page }) => {
      const signup = new SignupTrialPage(page);
      await signup.goto();
      await signup.register(validSignup());
      await signup.expectVerifyEmailScreen();
    });

    test('"Code Sent Successfully" toast appears automatically after signup', async ({ page }) => {
      await new SignupTrialPage(page).expectCodeSentToast();
    });

    test('"Resend Code" re-sends the code and shows the confirmation toast', async ({ page }) => {
      const signup = new SignupTrialPage(page);
      await signup.clickResendCode();
      await signup.expectCodeSentToast();
    });

    test('submitting an incorrect OTP shows a "Code does not match" error', async ({ page }) => {
      const signup = new SignupTrialPage(page);
      await signup.fillOtpCode('123456');
      await signup.clickVerifyCode();
      await signup.expectCodeDoesNotMatchToast();
    });

    test('submitting an incorrect OTP shows a "Invalid verification code" error', async ({ page }) => {
      const signup = new SignupTrialPage(page);
      await signup.fillOtpCode('123');
      await signup.clickVerifyCode();
      await signup.expectInvalidCodeError();
    });

    test('back arrow on the verify screen navigates to the login page', async ({ page }) => {
      const signup = new SignupTrialPage(page);
      await signup.clickBack();
      await expect(page).toHaveURL(/login/);
    });
  });

  // ─── Navigation ───────────────────────────────────────────────

  test('back arrow navigates to the login page', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.clickBack();
    await expect(page).toHaveURL(/login/);
  });

  test('"Go back to previous screen" navigates to the login page', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.clickGoBack();
    await expect(page).toHaveURL(/login/);
  });

  // ─── Support ──────────────────────────────────────────────────

  test('help "?" icon opens the contact-us modal', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.openHelp();
    await new ContactUsModal(page).expectOpen();
  });
});
