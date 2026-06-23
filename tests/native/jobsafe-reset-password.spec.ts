/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test, expect } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { expectNeedHelpModal } from './utils/shared-assertions';
import { dismissKeyboard } from './utils/keyboard';
import type { Screen } from '@mobilewright/core';
import { expectForgotPasswordScreen } from './jobsafe-forgot-password.spec';

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
        await expect(screen.getByText(/Thank you!/i)).toBeVisible({ timeout: 10_000 });
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

        await test.step('Try again returns to the reset password screen', async () => {
            await screen.getByRole('button', { name: 'Try again' }).tap();
            await expectResetPasswordScreen(screen);
        });

        await test.step('Request another code link opens forgot password screen', async () => {
            await screen.getByText(/Request another code/i).tap();
            await expectForgotPasswordScreen(screen);
        });
    });
});
