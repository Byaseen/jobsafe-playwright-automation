/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test, expect } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);
const invalidCreds = {
  email : 'test@test.com',
  password : 'wrong-password-123',
}

test.describe('JobSafe native — login', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  test.beforeEach(async ({ device, bundleId }) => {
    await device.launchApp(bundleId);
  });

  // Runs first on purpose: a successful login persists the session across
  // relaunches, so the invalid-credentials case must run while still logged out.
  test('rejects invalid credentials and stays on the login screen', async ({ screen }) => {
    await screen.getByPlaceholder('Email').fill(invalidCreds.email);
    await screen.getByPlaceholder('Choose a password').fill(invalidCreds.password);
    await screen.getByRole('button', { name: 'Login' }).tap();

    // Never reaches the authenticated home...
    await expect(screen.getByText(/My Reports/i).first()).not.toBeVisible({ timeout: 10_000 });
    // ...and the Login button is still on screen.
    await expect(screen.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10_000 });
  });

  test('Email & password fields are required and show validation errors', async ({ screen }) => {
    await screen.getByPlaceholder('Email').tap();
    await screen.getByPlaceholder('Choose a password').tap();
    await screen.getByRole('button', { name: 'Login' }).tap();
    // Expect validation errors for both fields
    await expect(screen.getByText(/Email is required!/i)).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByText(/Password is required!/i)).toBeVisible({ timeout: 10_000 });
  });

  test('Email field is validated for proper email format', async ({ screen }) => {
    await screen.getByPlaceholder('Email').fill('invalid-email');
    await screen.getByRole('button', { name: 'Login' }).tap();
    await expect(screen.getByText(/Email is invalid!/i)).toBeVisible({ timeout: 10_000 });
  });

  test('Forgot password link navigates to the forgot password screen', async ({ screen }) => {
    await screen.getByText(/Forgot password\?/i).tap();
    await expect(screen.getByText(/Simply provide us with your Email/i)).toBeVisible({ timeout: 10_000 });
  });

  test('Need Help button working and opens help modal', async ({ screen }) => {
    await screen.getByType('Button').first().tap();
    await expect(screen.getByText(/Need Help\?/i)).toBeVisible({ timeout: 10_000 });
  });

  test('logs in with valid credentials and reaches home', async ({ screen }) => {
    await screen.getByPlaceholder('Email').fill(nativeEnv.email);
    await screen.getByPlaceholder('Choose a password').fill(nativeEnv.password);
    await screen.getByRole('button', { name: 'Login' }).tap();
    await expect(screen.getByText(/My Reports/i).first()).toBeVisible({ timeout: 30_000 });
  });

});
