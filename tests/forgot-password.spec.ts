/**
 * JobSafe web — forgot password flow.
 */
import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';
import { ContactUsModal } from './pages/components/contactUsModal';
import { LoginPage } from './pages/loginPage';

test.describe('JobSafe web — Forgot password', () => {
  test.beforeEach(async ({ page }) => {
    await new ForgotPasswordPage(page).goto();
  });

  // ─── Page structure ───────────────────────────────────────────

  test('renders core elements with Next disabled', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.expectLoaded();
    await forgot.expectNextDisabled();
  });

  // ─── Validation ───────────────────────────────────────────────

  test('empty email shows required validation', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.blurEmail();
    await forgot.expectRequiredError();
    await forgot.expectNextDisabled();
  });

  test('invalid email format shows validation error and keeps Next disabled', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.fillEmail('notanemail');
    await forgot.page.keyboard.press('Tab');
    await forgot.expectInvalidError(true);
    await forgot.expectNextDisabled();
  });

  // ─── Submission ───────────────────────────────────────────────

  test('valid email enables Next and advances to the thank-you page', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.fillEmail('test@test.com');
    await forgot.expectInvalidError(false);
    await forgot.expectNextEnabled();
    await forgot.clickNext();
    await forgot.expectReachedThankYou();
  });

  // ─── Navigation ───────────────────────────────────────────────

  test('"Go back to previous screen" navigates to the login page', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.clickBack();
    await expect(page).toHaveURL(/login/);
    await new LoginPage(page).expectLoaded();
  });

  test('header back arrow also navigates to the login page', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.clickHeaderBack();
    await expect(page).toHaveURL(/login/);
    await new LoginPage(page).expectLoaded();
  });

  // ─── Support ──────────────────────────────────────────────────

  test('help "?" icon opens the contact-us modal', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.openHelp();
    await new ContactUsModal(page).expectOpen();
  });

  // ─── Thank-you screen (/check-email-exists) ───────────────────

  test.describe('Thank-you screen', () => {
    test.beforeEach(async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.requestReset('test@test.com');
      await forgot.expectReachedThankYou();
    });

    test('renders all expected elements', async ({ page }) => {
      await new ForgotPasswordPage(page).expectThankYouFullyLoaded();
    });

    test('"No Email received? - Contact us" opens the contact-us modal', async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.clickNoEmailReceived();
      await new ContactUsModal(page).expectOpen();
    });

    test('back arrow navigates to the forgot-password page', async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.clickHeaderBack();
      await expect(page).toHaveURL(/forgot-password/);
    });

    test('"Change Password" button navigates to change-password', async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.clickChangePassword();
      await expect(page).toHaveURL(/change-password/);
    });
  });
});
