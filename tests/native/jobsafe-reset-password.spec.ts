/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test, expect } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { expectNeedHelpModal, expectForgotPasswordScreen, expectThankYouScreen, expectLoginScreen, expectHomeScreen } from './utils/shared-assertions';
import { dismissKeyboard } from './utils/keyboard';
import type { Screen } from '@mobilewright/core';
import { waitForDeviceInput } from './utils/manual-input';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);
const invalidCreds = {
  email : 'test@test.com',
  password : 'wrong-password-123',
}

export const expectResetPasswordScreen = async (screen : Screen) => {
    await expect(screen.getByText(/Reset your Password/i)).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByLabel('New Password')).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByLabel('Confirm Password')).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByLabel('Code')).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole('button', { name: 'Reset Now' })).toBeVisible({ timeout: 10_000 });
};

test.describe('JobSafe native — Reset Password', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

    test.beforeAll(() => {
        if (!nativeEnv.email || !nativeEnv.password) {
            throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
        }
    });

    test.beforeEach(async ({ screen }) => {
        // bundleId is guaranteed set here: the describe-level test.skip bails
        // out when no native app is configured.
        await screen.getByText(/Forgot password\?/i).tap();
        await expect(screen.getByText(/Simply provide us with your Email/i)).toBeVisible({ timeout: 10_000 });
        await screen.getByPlaceholder('Email').fill(nativeEnv.email);
        await screen.getByRole('button', { name: 'Next' }).tap();
        await expectThankYouScreen(screen);
        await screen.getByRole('button', { name: 'Change Password' }).tap();
        await expect(screen.getByText(/Reset your Password/i)).toBeVisible({ timeout: 10_000 });
    });

    test('test elements in the reset password screen are visible', async ({ screen }) => {
        await expectResetPasswordScreen(screen);
    });

    test('still need help contact us link working and opens need help modal', async ({ screen }) => {
        await screen.getByText(/Still need help\?/i).tap();
        await expectNeedHelpModal(screen);
    });

    // The reset-screen form-validation checks share the same (expensive)
    // navigation, so they run in a single test that reaches the screen once and
    // walks each case in sequence. test.step keeps them labelled in the report.
    // dismissKeyboard() after each field interaction stops the raised keyboard
    // from covering — and intercepting taps on — the fields / button below it.
    test('reset-password form validation (required, password rules, confirmation match)', async ({ screen }) => {
        const newPassword = () => screen.getByPlaceholder("Choose a password").first();
        const confirmPassword = () => screen.getByPlaceholder("Choose a password").nth(1);

        await test.step('required fields show errors on empty submit', async () => {
            await screen.getByPlaceholder("Code").tap();
            await dismissKeyboard(screen);
            await newPassword().tap();
            await dismissKeyboard(screen);
            await confirmPassword().tap();
            await dismissKeyboard(screen);
            await screen.getByRole('button', { name: 'Reset Now' }).tap();
            await expect(screen.getByText(/Code is required!/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Password is required!/i)).toHaveCount(2, { timeout: 10_000 });
        });

        await test.step('invalid password shows every rule error', async () => {
            await newPassword().fill("123");
            await dismissKeyboard(screen);
            await expect(screen.getByText(/Must contain at least 1 number!/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Must contain at least 1 in Capital Case!/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Must contain at least 1 letter in Small Case!/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Must contain at least 1 special Character!/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Must be at least 8 characters long/i)).toBeVisible({ timeout: 10_000 });
        });

        await test.step('valid password clears every rule error', async () => {
            await newPassword().fill(nativeEnv.password);
            await dismissKeyboard(screen);
            await expect(screen.getByText(/Must contain at least 1 number!/i)).not.toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Must contain at least 1 in Capital Case!/i)).not.toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Must contain at least 1 letter in Small Case!/i)).not.toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Must contain at least 1 special Character!/i)).not.toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Must be at least 8 characters long/i)).not.toBeVisible({ timeout: 10_000 });
        });

        await test.step('matching confirmation shows no mismatch error', async () => {
            await confirmPassword().fill(nativeEnv.password);
            await dismissKeyboard(screen);
            await expect(screen.getByText(/Password confirmation does not match/i)).not.toBeVisible({ timeout: 10_000 });
        });

        await test.step('mismatched confirmation shows the mismatch error', async () => {
            await confirmPassword().fill(invalidCreds.password);
            await dismissKeyboard(screen);
            await expect(screen.getByText(/Password confirmation does not match/i)).toBeVisible({ timeout: 10_000 });
        });
    });

    // Both wrong-code checks reach the error screen through the same (expensive)
    // Reset Now submission, so they run in a single test that reaches the screen
    // once and walks each case in sequence. test.step keeps them labelled in the
    // report.
    test('wrong-code screen (error state, need-help modal, try-again recovery)', async ({ screen }) => {
        await screen.getByPlaceholder("Code").fill("123456");
        await dismissKeyboard(screen);
        await screen.getByPlaceholder("Choose a password").first().fill(nativeEnv.password);
        await dismissKeyboard(screen);
        await screen.getByPlaceholder("Choose a password").last().fill(nativeEnv.password);
        await dismissKeyboard(screen);
        await screen.getByRole('button', { name: 'Reset Now' }).tap();

        await test.step('wrong code shows the error screen', async () => {
            await expect(screen.getByText(/Password was not changed!/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/The code that you have used is invalid!/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Need help\?/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/Request another code/i)).toBeVisible({ timeout: 10_000 });
        });

        await test.step('Need help? link opens the need-help modal', async () => {
            await screen.getByText(/Need help\?/i).tap();
            await expectNeedHelpModal(screen);
            await screen.getByRole('button', { name: 'Close' }).tap();
        });

        // "Try again" and "Request another code" both LEAVE the error screen, so
        // each error-screen visit can exercise only one. We do "Try again" first
        // (cheap return to the reset screen), re-submit the wrong code to land
        // back on the error screen, then do "Request another code" last — it has
        // no cheap way back, and ending on the forgot-password screen is harmless.
        await test.step('Try again returns to the reset password screen', async () => {
            await screen.getByRole('button', { name: 'Try again' }).tap();
            await expectResetPasswordScreen(screen);
        });

        await test.step('re-submit wrong code to return to the error screen', async () => {
            await screen.getByPlaceholder("Code").fill("123456");
            await dismissKeyboard(screen);
            await screen.getByPlaceholder("Choose a password").first().fill(nativeEnv.password);
            await dismissKeyboard(screen);
            await screen.getByPlaceholder("Choose a password").last().fill(nativeEnv.password);
            await dismissKeyboard(screen);
            await screen.getByRole('button', { name: 'Reset Now' }).tap();
            await expect(screen.getByText(/The code that you have used is invalid!/i)).toBeVisible({ timeout: 10_000 });
        });

        await test.step('Request another code link opens forgot password screen', async () => {
            await screen.getByText(/Request another code/i).tap();
            await expectForgotPasswordScreen(screen);
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

        await test.step('valid code resets the password and lands on the login screen', async () => {
            // Reset TO the new password — you only need to enter the code by hand.
            await screen.getByPlaceholder("Choose a password").first().fill(nativeEnv.newPassword);
            await dismissKeyboard(screen);
            await screen.getByPlaceholder("Choose a password").last().fill(nativeEnv.newPassword);
            await dismissKeyboard(screen);

            // Type the emailed code into the Code field on the device. We poll the
            // field until it holds 6 digits, then carry on.
            await waitForDeviceInput(
                () => screen.getByPlaceholder('Code').getValue(),
                {
                    isComplete: (value) => /^\d{6}$/.test(value),
                    message: 'Type the emailed verification code into the Code field on the iPhone…',
                },
            );

            await dismissKeyboard(screen);
            await screen.getByRole('button', { name: 'Reset Now' }).tap();
            await expect(screen.getByText(/Your password has been reset successfully/i)).toBeVisible({ timeout: 10_000 });
            await expectLoginScreen(screen);
        });

        await test.step('Verify that user is unable to login using old password', async () => {
            await screen.getByPlaceholder('Email').fill(nativeEnv.email);
            await screen.getByPlaceholder('Choose a password').fill(nativeEnv.password); // the OLD password
            await dismissKeyboard(screen);
            await screen.getByRole('button', { name: 'Login' }).tap();
            await expect(screen.getByText(/Incorrect username or password/i)).toBeVisible({ timeout: 10_000 });
        });

        await test.step('Verify login with the new password', async () => {
            await screen.getByPlaceholder('Choose a password').fill(nativeEnv.newPassword); // the NEW password
            await dismissKeyboard(screen);
            await screen.getByRole('button', { name: 'Login' }).tap();
            await expectHomeScreen(screen);
        });
    });
});
