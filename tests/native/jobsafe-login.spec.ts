/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { invalidCreds } from './utils/test-data';
import { LoginPage } from './pages/loginPage';
import { NeedHelpModal } from './pages/components/needHelpModal';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

test.describe('JobSafe native — login', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  test('Test login screen elemnts are visible', async ({ screen }) => {
    await new LoginPage(screen).expectLoaded();
  });

  // Runs first on purpose: a successful login persists the session across
  // relaunches, so the invalid-credentials case must run while still logged out.
  test('rejects invalid credentials and stays on the login screen', async ({ screen }) => {
    const login = new LoginPage(screen);
    await login.login(invalidCreds.email, invalidCreds.password);
    await login.expectRejected();
  });

  test('Email & password fields are required and show validation errors', async ({ screen }) => {
    const login = new LoginPage(screen);
    await login.submitEmpty();
    await login.expectRequiredErrors();
  });

  test('Email field is validated for proper email format', async ({ screen }) => {
    const login = new LoginPage(screen);
    await login.fillEmail('invalid-email');
    await login.submit();
    await login.expectInvalidEmailError();
  });

  test('Forgot password link navigates to the forgot password screen', async ({ screen }) => {
    await new LoginPage(screen).tapForgotPassword();
    await new ForgotPasswordPage(screen).expectLoaded();
  });

  test('Need Help button working and opens help modal', async ({ screen }) => {
    await new LoginPage(screen).openHelp();
    await new NeedHelpModal(screen).expectOpen();
  });

  test('logs in with valid credentials and reaches home', async ({ screen }) => {
    const login = new LoginPage(screen);
    await login.login(nativeEnv.email, nativeEnv.password);
    await login.expectReachedHome();
  });
});
