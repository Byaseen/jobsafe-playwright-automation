/**
 * JobSafe web — login page.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { ContactUsModal } from './pages/components/contactUsModal';
import { env } from '../utils/env';

const hasCreds = Boolean(env.email && env.password);

test.describe('JobSafe web — Login page', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).goto();
  });

  test('renders core elements', async ({ page }) => {
    await new LoginPage(page).expectLoaded();
  });

  test('login button is disabled when fields are empty', async ({ page }) => {
    await new LoginPage(page).expectLoginDisabled();
  });

  test('invalid email format shows inline error and keeps login disabled', async ({ page }) => {
    const login = new LoginPage(page);
    await login.fillEmail('testtest.com');
    await login.password.click(); // blur the email field
    await login.expectInvalidEmailError();
    await login.expectLoginDisabled();
  });

  test('valid credentials redirect to home', async ({ page }) => {
    test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');
    const login = new LoginPage(page);
    await login.login(env.email, env.password);
    await login.expectReachedHome();
  });

  test('empty submit shows required validation errors', async ({ page }) => {
    const login = new LoginPage(page);
    await login.submitEmpty();
    await login.expectRequiredErrors();
  });

  test('forgot password link navigates to the forgot password page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.clickForgot();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('help "?" icon opens the contact-us modal', async ({ page }) => {
    const login = new LoginPage(page);
    await login.openHelp();
    await new ContactUsModal(page).expectOpen();
  });

  test('"No Account? Create an account" navigates to the registration page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.clickCreateAccount();
    await expect(page).toHaveURL(/signup/);
  });
});
