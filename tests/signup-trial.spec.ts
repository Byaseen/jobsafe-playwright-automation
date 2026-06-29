/**
 * JobSafe web — free-trial signup flow.
 */
import { test } from '@playwright/test';
import { SignupTrialPage } from './pages/signupTrialPage';
import {
  validSignup,
  passwordMismatchSignup,
  invalidEmailSignup,
  usedEmailSignup,
} from './utils/test-data';

test.describe('JobSafe web — Signup trial', () => {
  test.beforeEach(async ({ page }) => {
    await new SignupTrialPage(page).goto();
  });

  test('renders all required inputs and actions', async ({ page }) => {
    await new SignupTrialPage(page).expectLoaded();
  });

  test('required field validation displays inline errors', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.touchAllRequiredFields();
    await signup.expectRequiredErrors(8);
  });

  test('invalid and mismatched email show validation errors', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(invalidEmailSignup());
    await signup.expectInvalidEmailErrors();
  });

  test('password confirmation mismatch shows a validation error', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(passwordMismatchSignup());
    await signup.expectPasswordMismatch();
  });

  test('optional card fields can remain empty and still allow registration', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.fillRequiredFields(validSignup());
    await signup.disagreeToTerms();
    await signup.agreeToTerms();
    await signup.solveCaptcha();
    await signup.clickRegister();
    await signup.expectVerifyEmailScreen();
  });

  test('registration with a used email shows an error and stays on signup', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(usedEmailSignup());
    await signup.expectEmailInUse();
  });

  test('successful signup shows the email-verification instruction', async ({ page }) => {
    const signup = new SignupTrialPage(page);
    await signup.register(validSignup());
    await signup.expectVerifyEmailScreen();
  });
});
