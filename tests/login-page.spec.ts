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

  // ─── Page structure ───────────────────────────────────────────

  test('renders core elements', async ({ page }) => {
    await new LoginPage(page).expectLoaded();
  });

  // ─── Button enabled/disabled state ────────────────────────────

  test('login button is disabled when fields are empty', async ({ page }) => {
    await new LoginPage(page).expectLoginDisabled();
  });

  test('login button stays disabled with only email filled', async ({ page }) => {
    const login = new LoginPage(page);
    await login.fillEmail('user@example.com');
    await login.expectLoginDisabled();
  });

  test('login button stays disabled with only password filled', async ({ page }) => {
    const login = new LoginPage(page);
    await login.fillPassword('SomePassword1!');
    await login.expectLoginDisabled();
  });

  test('login button enables when both email and password are filled', async ({ page }) => {
    const login = new LoginPage(page);
    await login.fillEmail('user@example.com');
    await login.fillPassword('SomePassword1!');
    await login.expectLoginEnabled();
  });

  // ─── Validation ───────────────────────────────────────────────

  test('invalid email format shows inline error and keeps login disabled', async ({ page }) => {
    const login = new LoginPage(page);
    await login.fillEmail('testtest.com');
    await login.password.click();
    await login.expectInvalidEmailError();
    await login.expectLoginDisabled();
  });

  test('empty submit shows required validation errors', async ({ page }) => {
    const login = new LoginPage(page);
    await login.submitEmpty();
    await login.expectRequiredErrors();
  });

  // ─── Password field ───────────────────────────────────────────

  test('password field is masked by default', async ({ page }) => {
    await new LoginPage(page).expectPasswordMasked();
  });

  test('eye icon toggles password between masked and visible', async ({ page }) => {
    const login = new LoginPage(page);
    await login.expectPasswordMasked();
    await login.togglePasswordVisibility();
    await login.expectPasswordVisible();
    await login.togglePasswordVisibility();
    await login.expectPasswordMasked();
  });

  // ─── Successful login ─────────────────────────────────────────

  test('valid credentials redirect to home', async ({ page }) => {
    test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');
    const login = new LoginPage(page);
    await login.login(env.email, env.password);
    await login.expectReachedHome();
  });

  test('invalid credentials show a login error', async ({ page }) => {
    test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');
    const login = new LoginPage(page);
    await login.login(env.email, 'wrong-password-xyz!');
    await login.expectRejected();
  });

  // ─── Navigation ───────────────────────────────────────────────

  test('forgot password link navigates to the forgot password page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.clickForgot();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('"No Account? Create an account" navigates to the registration page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.clickCreateAccount();
    await expect(page).toHaveURL(/signup/);
  });

  // ─── Support ──────────────────────────────────────────────────

  test('help "?" icon opens the contact-us modal', async ({ page }) => {
    const login = new LoginPage(page);
    await login.openHelp();
    await new ContactUsModal(page).expectOpen();
  });
});
