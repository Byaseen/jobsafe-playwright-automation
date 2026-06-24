/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { invalidCreds } from './utils/test-data';
import { LoginPage } from './pages/loginPage';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';
import { ThankYouPage } from './pages/thankYouPage';
import { ResetPasswordPage } from './pages/resetPasswordPage';
import { AdminDashboardPage } from './pages/adminDashboardPage';
import { NeedHelpModal } from './pages/components/needHelpModal';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

test.describe('JobSafe native — Reset Password', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  // Reach the Reset Password screen: login → Forgot password → request a code →
  // Thank you → Change Password.
  test.beforeEach(async ({ screen }) => {
    await new LoginPage(screen).tapForgotPassword();
    await new ForgotPasswordPage(screen).requestReset(nativeEnv.email);
    const thankYou = new ThankYouPage(screen);
    await thankYou.expectLoaded();
    await thankYou.tapChangePassword();
    await new ResetPasswordPage(screen).expectLoaded();
  });

  test('test elements in the reset password screen are visible', async ({ screen }) => {
    await new ResetPasswordPage(screen).expectLoaded();
  });

  test('still need help contact us link working and opens need help modal', async ({ screen }) => {
    await new ResetPasswordPage(screen).openHelp();
    await new NeedHelpModal(screen).expectOpen();
  });

  // The reset-screen form-validation checks share the same (expensive)
  // navigation, so they run in a single test that reaches the screen once and
  // walks each case in sequence. test.step keeps them labelled in the report.
  test('reset-password form validation (required, password rules, confirmation match)', async ({ screen }) => {
    const reset = new ResetPasswordPage(screen);

    await test.step('required fields show errors on empty submit', async () => {
      await reset.submitEmpty();
      await reset.expectRequiredErrors();
    });

    await test.step('invalid password shows every rule error', async () => {
      await reset.fillNewPassword('123');
      await reset.expectPasswordRuleErrors(true);
    });

    await test.step('valid password clears every rule error', async () => {
      await reset.fillNewPassword(nativeEnv.password);
      await reset.expectPasswordRuleErrors(false);
    });

    await test.step('matching confirmation shows no mismatch error', async () => {
      await reset.fillConfirmPassword(nativeEnv.password);
      await reset.expectMismatchError(false);
    });

    await test.step('mismatched confirmation shows the mismatch error', async () => {
      await reset.fillConfirmPassword(invalidCreds.password);
      await reset.expectMismatchError(true);
    });
  });

  // Both wrong-code checks reach the error screen through the same (expensive)
  // Reset Now submission, so they run in a single test that reaches the screen
  // once and walks each case in sequence. test.step keeps them labelled in the
  // report.
  test('wrong-code screen (error state, need-help modal, try-again recovery)', async ({ screen }) => {
    const reset = new ResetPasswordPage(screen);
    await reset.reset({ code: '123456', newPassword: nativeEnv.password });

    await test.step('wrong code shows the error screen', async () => {
      await reset.expectWrongCodeScreen();
    });

    await test.step('Need help? link opens the need-help modal', async () => {
      const modal = new NeedHelpModal(screen);
      await reset.needHelpLink.tap();
      await modal.expectOpen();
      await modal.close();
    });

    // "Try again" and "Request another code" both LEAVE the error screen, so
    // each error-screen visit can exercise only one. We do "Try again" first
    // (cheap return to the reset screen), re-submit the wrong code to land back
    // on the error screen, then do "Request another code" last — it has no cheap
    // way back, and ending on the forgot-password screen is harmless.
    await test.step('Try again returns to the reset password screen', async () => {
      await reset.tapTryAgain();
      await reset.expectLoaded();
    });

    await test.step('re-submit wrong code to return to the error screen', async () => {
      await reset.reset({ code: '123456', newPassword: nativeEnv.password });
      await reset.expectInvalidCodeError();
    });

    await test.step('Request another code link opens forgot password screen', async () => {
      await reset.tapRequestAnotherCode();
      await new ForgotPasswordPage(screen).expectLoaded();
    });
  });

  // Happy path: requires the REAL verification code emailed to USER_EMAIL.
  // Resets the password to USER_NEW_PASSWORD (must differ from USER_PASSWORD),
  // then proves the OLD password no longer logs in. Gated behind RUN_MANUAL=1
  // (needs you in the loop — would hang in CI).
  //   RUN_MANUAL=1 npx mobilewright test --grep "emailed code" --project jobsafe-ios
  test('reset password succeeds with a valid emailed code', async ({ screen }) => {
    test.skip(!nativeEnv.runManual, 'Set RUN_MANUAL=1 to run the manual-input reset flow');
    if (!nativeEnv.newPassword || nativeEnv.newPassword === nativeEnv.password) {
      throw new Error('Set USER_NEW_PASSWORD in .env to a value different from USER_PASSWORD');
    }
    test.setTimeout(0); // the clock keeps running while we wait for input

    const reset = new ResetPasswordPage(screen);
    const login = new LoginPage(screen);

    await test.step('valid code resets the password and lands on the login screen', async () => {
      // Reset TO the new password — you only need to enter the code by hand.
      await reset.fillNewPassword(nativeEnv.newPassword);
      await reset.fillConfirmPassword(nativeEnv.newPassword);
      await reset.waitForEmailedCode();
      await reset.submitAfterEmailedCode();
      await reset.expectResetSuccess();
      await login.expectLoaded();
    });

    await test.step('Verify that user is unable to login using old password', async () => {
      await login.login(nativeEnv.email, nativeEnv.password); // the OLD password
      await login.expectRejected();
    });

    await test.step('Verify login with the new password', async () => {
      await login.login(nativeEnv.email, nativeEnv.newPassword); // the NEW password
      await new AdminDashboardPage(screen).expectLoaded();
    });
  });
});
