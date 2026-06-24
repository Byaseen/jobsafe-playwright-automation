/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { LoginPage } from './pages/loginPage';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';
import { ThankYouPage } from './pages/thankYouPage';
import { NeedHelpModal } from './pages/components/needHelpModal';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

test.describe('JobSafe native — Forgot Password', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  test.beforeEach(async ({ screen }) => {
    // bundleId is guaranteed set here: the describe-level test.skip bails out
    // when no native app is configured.
    await new LoginPage(screen).tapForgotPassword();
    await new ForgotPasswordPage(screen).expectLoaded();
  });

  // All three checks live on the Forgot Password screen that beforeEach already
  // reaches, so they run in a single test that lands on the screen once and
  // walks each case in sequence. test.step keeps them labelled in the report.
  test('Forgot Password screen (email validation, need-help modal)', async ({ screen }) => {
    const forgot = new ForgotPasswordPage(screen);

    await test.step('empty email shows the required error', async () => {
      await forgot.email.tap();
      await forgot.submit();
      await forgot.expectRequiredEmailError();
    });

    await test.step('invalid email format shows the invalid error', async () => {
      await forgot.fillEmail('invalid-email');
      await forgot.submit();
      await forgot.expectInvalidEmailError();
    });

    await test.step('Need Help button opens the need-help modal', async () => {
      const modal = new NeedHelpModal(screen);
      await forgot.openHelp();
      await modal.expectOpen();
      await modal.close();
    });
  });

  test('Go back to login screen button working and navigates back to login screen', async ({ screen }) => {
    await new ForgotPasswordPage(screen).tapBack();
    await new LoginPage(screen).expectLoaded();
  });

  test('test back arrow button working and navigates back to login screen', async ({ screen }) => {
    await new ForgotPasswordPage(screen).tapBackArrow();
    await new LoginPage(screen).expectLoaded();
  });

  // Both checks reach the Thank you screen through the same valid-email
  // submission, so they run in a single test that reaches the screen once and
  // walks each case in sequence. test.step keeps them labelled in the report.
  test('Thank you screen (request confirmation, no-email need-help modal)', async ({ screen }) => {
    const thankYou = new ThankYouPage(screen);
    await new ForgotPasswordPage(screen).requestReset(nativeEnv.email);

    await test.step('valid email reaches the Thank you confirmation screen', async () => {
      await thankYou.expectLoaded();
    });

    await test.step('No Email received? link opens the need-help modal', async () => {
      await thankYou.tapNoEmailReceived();
      await new NeedHelpModal(screen).expectOpen();
    });
  });
});
