// spec: change-password-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { ChangePasswordPage } from './pages/changePasswordPage';
import { LoginPage } from './pages/loginPage';
import { env } from '../utils/env';

const resetCode = process.env.CHANGE_PASSWORD_CODE;
const newPassword = process.env.NEW_PASSWORD ?? 'Password1!';
const invalidCode = '000000';

test.describe('Change Password flow', () => {
  test('Verify Change password page', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.goto();
    await changePage.expectPageVisible();
    await expect(changePage.resetNowButton).toBeDisabled();
  });

  test('Verify form inputs', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.goto();

    await changePage.codeInput.pressSequentially('123456', { delay: 100 });
    await expect(changePage.codeInput).toHaveValue('123456');

    await changePage.fillNewPassword(newPassword);
    await expect(changePage.newPasswordInput).toHaveValue(newPassword);

    await changePage.fillConfirmPassword(newPassword);
    await expect(changePage.confirmPasswordInput).toHaveValue(newPassword);
  });

  test('Verify required field validation and password mismatch', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.goto();

    await changePage.codeInput.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByText('Code is required!', { exact: true })).toBeVisible();

    await changePage.newPasswordInput.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByText('Password is required!', { exact: true })).toBeVisible();

    await changePage.fillNewPassword(newPassword);
    await changePage.fillConfirmPassword(`${newPassword}x`);
    await page.keyboard.press('Tab');
    await expect(page.getByText('Password confirmation does not match', { exact: true })).toBeVisible();
  });

  test('Verify trying wrong code', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.goto();

    await changePage.fillCode(invalidCode);
    await changePage.fillNewPassword(newPassword);
    await changePage.fillConfirmPassword(newPassword);

    await expect(changePage.resetNowButton).toBeEnabled();
    await changePage.clickResetNow();
    await expect(changePage.invalidCodeError).toBeVisible();
  });

  test('Verify Wrong code page', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.goto();

    await changePage.fillCode(invalidCode);
    await changePage.fillNewPassword(newPassword);
    await changePage.fillConfirmPassword(newPassword);
    await changePage.clickResetNow();

    await expect(changePage.invalidCodeError).toBeVisible();
    await expect(changePage.requestAnotherCodeLink).toBeVisible();
  });

  test('Verify Request another code link', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.goto();

    await changePage.fillCode(invalidCode);
    await changePage.fillNewPassword(newPassword);
    await changePage.fillConfirmPassword(newPassword);
    await changePage.clickResetNow();

    await expect(changePage.requestAnotherCodeLink).toBeVisible();
  });

  test('Verify "Still need help? - Contact us" link', async ({ page }) => {
    const changePage = new ChangePasswordPage(page);
    await changePage.goto();
    await expect(changePage.contactSupportLink).toBeVisible();
    await changePage.clickContactSupport();
    await expect(page.locator('div').filter({ hasText: 'Need help? - Contact usFor' })).toBeVisible();
  });

  test('Verify Reset the password', async ({ page }) => {
    test.skip(!resetCode, 'CHANGE_PASSWORD_CODE environment variable must be set for the reset flow');

    const changePage = new ChangePasswordPage(page);
    await changePage.goto();

    await changePage.fillCode(resetCode);
    await changePage.fillNewPassword(newPassword);
    await changePage.fillConfirmPassword(newPassword);

    await expect(changePage.resetNowButton).toBeEnabled();
    await changePage.clickResetNow();

    await expect(page.locator(/password.*(changed|reset|updated)|success/i)).toBeVisible();
    await expect(page).not.toHaveURL(/change-password/);
  });

  test('Verify that user is unable to login using old password', async ({ page }) => {
    test.skip(!resetCode, 'CHANGE_PASSWORD_CODE environment variable must be set for the reset flow');

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillEmail(env.email);
    await loginPage.fillPassword(env.password);
    await loginPage.submit();

    await expect(page).toHaveURL(/login/);
    await expect(page.locator(/incorrect|invalid|failed|wrong/i)).toBeVisible();
  });

  test('Verify login with the new password', async ({ page }) => {
    test.skip(!resetCode, 'CHANGE_PASSWORD_CODE environment variable must be set for the reset flow');

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillEmail(env.email);
    await loginPage.fillPassword(newPassword);
    await loginPage.submit();

    await expect(page).toHaveURL(/app\/home/);
    await expect(page.locator('#job_tabs')).toBeVisible();
  });
});
