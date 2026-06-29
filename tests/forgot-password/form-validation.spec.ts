/**
 * JobSafe web — forgot-password email validation.
 */
import { test } from '@playwright/test';
import { ForgotPasswordPage } from '../pages/forgotPasswordPage';

const invalidEmails = ['notanemail', 'user@domain', 'user@.com'];
const validEmails = [
  'user@example.com',
  'user+test@example.com',
  'user@example.co.uk',
  'user123@example456.com',
];

test.describe('JobSafe web — Forgot password email validation', () => {
  test.beforeEach(async ({ page }) => {
    await new ForgotPasswordPage(page).goto();
  });

  test('empty email shows the required error and keeps Next disabled', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.expectNextDisabled();
    await forgot.blurEmail();
    await forgot.expectRequiredError();
    await forgot.expectNextDisabled();
  });

  for (const email of invalidEmails) {
    test(`"${email}" is rejected as an invalid email`, async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.fillEmail(email);
      await forgot.expectInvalidError(true);
      await forgot.expectNextDisabled();
    });
  }

  for (const email of validEmails) {
    test(`"${email}" is accepted and enables Next`, async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.fillEmail(email);
      await forgot.expectNoErrors();
      await forgot.expectNextEnabled();
    });
  }

  test('validation updates as the field is corrected', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);

    await forgot.fillEmail('invalid.email');
    await forgot.expectInvalidError(true);
    await forgot.expectNextDisabled();

    await forgot.fillEmail('');
    await forgot.expectRequiredError();
    await forgot.expectNextDisabled();

    await forgot.fillEmail('valid@example.com');
    await forgot.expectNoErrors();
    await forgot.expectNextEnabled();
  });
});
