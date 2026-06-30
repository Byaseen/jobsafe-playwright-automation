/**
 * JobSafe web — change / reset password flow.
 *
 * All tests start at /forgot-password and navigate via real user actions.
 * The route sequence is:
 *   /forgot-password → (submit email) → /check-email-exists
 *     → (click "Change Password") → /change-password
 *       → (submit wrong code) → /change-password-error
 *
 * The "resets the password with a valid code" test waits for you to type the
 * 6-digit code from the reset email directly into the browser — the test
 * detects it and resumes automatically.
 * Run in headed mode: npx playwright test ... --headed
 */
import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';
import { ChangePasswordPage } from './pages/changePasswordPage';
import { ChangePasswordErrorPage } from './pages/changePasswordErrorPage';
import { LoginPage } from './pages/loginPage';
import { ContactUsModal } from './pages/components/contactUsModal';
import { env } from '../utils/env';

const newPassword = process.env.USER_NEW_PASSWORD ?? 'Password1!';
const invalidCode = '000000';

test.describe('JobSafe web — Change Password', () => {
  // ─── Shared setup ──────────────────────────────────────────────
  // Navigate the full forgot-password flow to reach /change-password.
  test.beforeEach(async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.goto();
    await forgot.requestReset(process.env.USER_EMAIL ?? env.email);
    await forgot.expectReachedThankYou();
    await forgot.clickChangePassword();
    await new ChangePasswordPage(page).expectLoaded();
  });

  // ─── Page structure ───────────────────────────────────────────

  test('renders the change-password page with Reset disabled', async ({ page }) => {
    await new ChangePasswordPage(page).expectResetDisabled();
  });

  test('accepts input in the code and password fields', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);

    await changePage.fillCode('123456');
    await expect(changePage.codeInput).toHaveValue('123456');

    await changePage.fillNewPassword(newPassword);
    await expect(changePage.newPasswordInput).toHaveValue(newPassword);

    await changePage.fillConfirmPassword(newPassword);
    await expect(changePage.confirmPasswordInput).toHaveValue(newPassword);
  });

  // ─── Validation ───────────────────────────────────────────────

  test('shows required-field errors when all fields are blurred empty', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);

    await changePage.codeInput.click();
    await page.keyboard.press('Tab');
    await changePage.expectCodeRequiredError();

    await changePage.newPasswordInput.click();
    await page.keyboard.press('Tab');
    await changePage.expectPasswordRequiredError();
  });

  test('password confirmation mismatch shows a validation error', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.fillNewPassword(newPassword);
    await changePage.fillConfirmPassword(`${newPassword}x`);
    await page.keyboard.press('Tab');
    await changePage.expectMismatchError();
  });

  // ─── Wrong-code error page ────────────────────────────────────

  test('an invalid code navigates to the change-password-error page', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.fillForm({ code: invalidCode, newPassword });
    await changePage.expectResetEnabled();
    await changePage.clickResetNow();
    await new ChangePasswordErrorPage(page).expectLoaded();
  });

  // ─── Navigation ───────────────────────────────────────────────

  test('back arrow navigates to the thank-you screen', async ({ page }) => {
    await new ChangePasswordPage(page).clickBack();
    await expect(page).toHaveURL(/check-email-exists/);
  });

  // ─── Support ──────────────────────────────────────────────────

  test('"Still need help? - Contact us" opens the contact-us modal', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await expect(changePage.contactSupportLink).toBeVisible();
    await changePage.openHelp();
    await new ContactUsModal(page).expectOpen();
  });

  // ─── Successful reset ─────────────────────────────────────────

  test('resets the password with a valid code', async ({ page }) => {
    test.slow();
    const changePage = new ChangePasswordPage(page);

    // The browser is at /change-password — type the 6-digit code from
    // your email into the code field. The test resumes automatically.
    await expect(changePage.codeInput).toHaveValue(/^\d{6}$/, { timeout: 120_000 });

    await changePage.fillNewPassword(newPassword);
    await changePage.fillConfirmPassword(newPassword);
    await changePage.expectResetEnabled();
    await changePage.clickResetNow();
    await changePage.expectResetSucceeded();
  });

  // ─── Change-password-error screen ────────────────────────────

  test.describe('Change-password-error screen', () => {
    // Outer beforeEach already landed us on /change-password via the full flow.
    // Submit a wrong code to advance to the error screen.
    test.beforeEach(async ({ page }) => {
      const changePage = new ChangePasswordPage(page);
      await changePage.fillForm({ code: invalidCode, newPassword });
      await changePage.clickResetNow();
      await new ChangePasswordErrorPage(page).expectLoaded();
    });

    test('renders all expected elements', async ({ page }) => {
      await new ChangePasswordErrorPage(page).expectLoaded();
    });

    test('"Try again" navigates back to the change-password page', async ({ page }) => {
      await new ChangePasswordErrorPage(page).clickTryAgain();
      await expect(page).toHaveURL(/\/change-password$/);
    });

    test('"Request another code" navigates to the forgot-password page', async ({ page }) => {
      await new ChangePasswordErrorPage(page).clickRequestAnotherCode();
      await expect(page).toHaveURL(/forgot-password/);
    });

    test('back arrow navigates to the change-password page', async ({ page }) => {
      await new ChangePasswordErrorPage(page).clickBack();
      await expect(page).toHaveURL(/\/change-password$/);
    });

    test('"Need help? - Contact us" opens the contact-us modal', async ({ page }) => {
      const errorPage = new ChangePasswordErrorPage(page);
      await errorPage.openHelp();
      await new ContactUsModal(page).expectOpen();
    });
  });
});

// ─── Post-reset credential verification ───────────────────────
// These run against the login page directly — no forgot-password flow needed.
// Run them after "resets the password with a valid code" has succeeded.
test.describe('JobSafe web — Post-reset login verification', () => {
  test('the old password no longer works after reset', async ({ page }) => {
    test.slow();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, env.password);
    await login.expectRejected();
  });

  test('the new password works after reset', async ({ page }) => {
    test.slow();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, newPassword);
    await login.expectReachedHome();
  });
});
