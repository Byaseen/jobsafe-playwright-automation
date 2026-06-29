/**
 * JobSafe web — change / reset password flow.
 */
import { test, expect } from '@playwright/test';
import { ChangePasswordPage } from './pages/changePasswordPage';
import { LoginPage } from './pages/loginPage';
import { ContactUsModal } from './pages/components/contactUsModal';
import { env } from '../utils/env';

const resetCode = process.env.CHANGE_PASSWORD_CODE;
const newPassword = process.env.NEW_PASSWORD ?? 'Password1!';
const invalidCode = '000000';

test.describe('JobSafe web — Change Password', () => {
  test.beforeEach(async ({ page }) => {
    await new ChangePasswordPage(page).goto();
  });

  test('renders the change-password page with Reset disabled', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.expectLoaded();
    await changePage.expectResetDisabled();
  });

  test('accepts input in the code and password fields', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);

    await changePage.codeInput.pressSequentially('123456', { delay: 100 });
    await expect(changePage.codeInput).toHaveValue('123456');

    await changePage.fillNewPassword(newPassword);
    await expect(changePage.newPasswordInput).toHaveValue(newPassword);

    await changePage.fillConfirmPassword(newPassword);
    await expect(changePage.confirmPasswordInput).toHaveValue(newPassword);
  });

  test('shows required-field and password-mismatch validation', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);

    await changePage.codeInput.focus();
    await page.keyboard.press('Tab');
    await changePage.expectCodeRequiredError();

    await changePage.newPasswordInput.focus();
    await page.keyboard.press('Tab');
    await changePage.expectPasswordRequiredError();

    await changePage.fillNewPassword(newPassword);
    await changePage.fillConfirmPassword(`${newPassword}x`);
    await page.keyboard.press('Tab');
    await changePage.expectMismatchError();
  });

  test('a wrong code is rejected with an inline error', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.fillForm({ code: invalidCode, newPassword });
    await changePage.expectResetEnabled();
    await changePage.clickResetNow();
    await changePage.expectInvalidCode();
  });

  test('a wrong code offers to request another code', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.fillForm({ code: invalidCode, newPassword });
    await changePage.clickResetNow();
    await changePage.expectInvalidCode();
    await changePage.expectRequestAnotherCodeVisible();
  });

  test('"Still need help? - Contact us" opens the contact-us modal', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await expect(changePage.contactSupportLink).toBeVisible();
    await changePage.openHelp();
    await new ContactUsModal(page).expectOpen();
  });

  test('resets the password with a valid code', async ({ page }) => {
    test.skip(!resetCode, 'CHANGE_PASSWORD_CODE must be set for the reset flow');
    const changePage = new ChangePasswordPage(page);
    await changePage.fillForm({ code: resetCode!, newPassword });
    await changePage.expectResetEnabled();
    await changePage.clickResetNow();
    await changePage.expectResetSucceeded();
  });

  test('the old password no longer works after reset', async ({ page }) => {
    test.skip(!resetCode, 'CHANGE_PASSWORD_CODE must be set for the reset flow');
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, env.password);
    await login.expectRejected();
  });

  test('the new password works after reset', async ({ page }) => {
    test.skip(!resetCode, 'CHANGE_PASSWORD_CODE must be set for the reset flow');
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, newPassword);
    await login.expectReachedHome();
  });
});
