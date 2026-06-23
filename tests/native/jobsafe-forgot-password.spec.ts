/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test, expect } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { expectNeedHelpModal } from './utils/shared-assertions';
import { Screen } from '@mobilewright/core';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);
const invalidCreds = {
  email : 'test@test.com',
  password : 'wrong-password-123',
}

export const expectForgotPasswordScreen = async (screen : Screen) => {
    await expect(screen.getByText(/Simply provide us with your Email/i)).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByPlaceholder('Email')).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole('button', { name: 'Next' })).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole('button', { name: 'Go back to previous screen' })).toBeVisible({ timeout: 10_000 });
};

test.describe('JobSafe native — Forgot Password', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

    test.beforeAll(() => {
        if (!nativeEnv.email || !nativeEnv.password) {
            throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
        }
    });

    test.beforeEach(async ({ device, bundleId, screen }) => {
        // bundleId is guaranteed set here: the describe-level test.skip bails
        // out when no native app is configured.
        await screen.getByText(/Forgot password\?/i).tap();
        await expectForgotPasswordScreen(screen);
    });

    // All three checks live on the Forgot Password screen that beforeEach already
    // reaches, so they run in a single test that lands on the screen once and
    // walks each case in sequence. test.step keeps them labelled in the report.
    test('Forgot Password screen (email validation, need-help modal)', async ({ screen }) => {
        await test.step('empty email shows the required error', async () => {
            await screen.getByPlaceholder('Email').tap();
            await screen.getByRole('button', { name: 'Next' }).tap();
            await expect(screen.getByText(/Email is required!/i)).toBeVisible({ timeout: 10_000 });
        });

        await test.step('invalid email format shows the invalid error', async () => {
            await screen.getByPlaceholder('Email').fill('invalid-email');
            await screen.getByRole('button', { name: 'Next' }).tap();
            await expect(screen.getByText(/Email is invalid!/i)).toBeVisible({ timeout: 10_000 });
        });

        await test.step('Need Help button opens the need-help modal', async () => {
            await screen.getByType('Button').nth(1).tap();
            await expectNeedHelpModal(screen);
            await screen.getByRole('button', { name: 'Close' }).tap();
        });
    });

    test('Go back to login screen button working and navigates back to login screen', async ({ screen }) => {
        await screen.getByRole('button', { name: 'Go back to previous screen' }).tap();
        await expect(screen.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10_000 });
    });

    test('test back arrow button working and navigates back to login screen', async ({ screen }) => {
        await screen.getByType('Button').first().tap();
        await expect(screen.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10_000 });
    });
    
    // Both checks reach the Thank you screen through the same valid-email
    // submission, so they run in a single test that reaches the screen once and
    // walks each case in sequence. test.step keeps them labelled in the report.
    test('Thank you screen (request confirmation, no-email need-help modal)', async ({ screen }) => {
        await screen.getByPlaceholder('Email').fill(nativeEnv.email);
        await screen.getByRole('button', { name: 'Next' }).tap();

        await test.step('valid email reaches the Thank you confirmation screen', async () => {
            await expect(screen.getByText(/Thank you!/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/We have received your request/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/If your email is recognised we will send you an email back with a verification code that you will need to change your current password/i)).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByRole('button', { name: 'Change Password' })).toBeVisible({ timeout: 10_000 });
            await expect(screen.getByText(/No Email received\?/i)).toBeVisible({ timeout: 10_000 });
        });

        await test.step('No Email received? link opens the need-help modal', async () => {
            await screen.getByText(/No Email received\?/i).tap();
            await expectNeedHelpModal(screen);
        });
    });
});
