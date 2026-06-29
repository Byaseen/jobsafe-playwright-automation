/**
 * JobSafe web — forgot password flow.
 */
import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';
import { ContactUsModal } from './pages/components/contactUsModal';

test.describe('JobSafe web — Forgot password', () => {
  test.beforeEach(async ({ page }) => {
    await new ForgotPasswordPage(page).goto();
  });

  test('renders core elements with Next disabled', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.expectLoaded();
    await forgot.expectNextDisabled();
  });

  test('empty email shows required validation', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.blurEmail();
    await forgot.expectRequiredError();
    await forgot.expectNextDisabled();
  });

  test('valid email enables Next and advances to the thank-you page', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.fillEmail('test@test.com');
    await forgot.expectInvalidError(false);
    await forgot.expectNextEnabled();
    await forgot.clickNext();
    await forgot.expectReachedThankYou();
  });

  test('back to login navigates to the login page', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.clickBack();
    await expect(page).toHaveURL(/login/);
  });

  test('help "?" icon opens the contact-us modal', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.openHelp();
    await new ContactUsModal(page).expectOpen();
  });

  test('Change Password button on the thank-you page navigates to change-password', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.requestReset('test@test.com');
    await forgot.expectReachedThankYou();
    await forgot.clickChangePassword();
    await expect(page).toHaveURL(/change-password/);
  });
});
