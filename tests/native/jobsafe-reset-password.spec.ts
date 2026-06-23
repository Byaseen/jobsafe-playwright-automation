/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test, expect } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { expectNeedHelpModal } from './utils/shared-assertions';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);
const invalidCreds = {
  email : 'test@test.com',
  password : 'wrong-password-123',
}

test.describe('JobSafe native — Reset Password', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

    test.beforeAll(() => {
        if (!nativeEnv.email || !nativeEnv.password) {
            throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
        }
    });

    test.beforeEach(async ({ device, bundleId, screen }) => {
        // bundleId is guaranteed set here: the describe-level test.skip bails
        // out when no native app is configured.
        await device.launchApp(bundleId!);
        await screen.getByText(/Forgot password\?/i).tap();
        await expect(screen.getByText(/Simply provide us with your Email/i)).toBeVisible({ timeout: 10_000 });
        await screen.getByPlaceholder('Email').fill(nativeEnv.email);
        await screen.getByRole('button', { name: 'Next' }).tap();
        await expect(screen.getByText(/Thank you!/i)).toBeVisible({ timeout: 10_000 });
        await screen.getByRole('button', { name: 'Change Password' }).tap();
        await expect(screen.getByText(/Reset your Password/i)).toBeVisible({ timeout: 10_000 });
    });

    test('test elements in the reset password screen are visible', async ({ screen }) => {
        await expect(screen.getByText(/Reset your Password/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByLabel('New Password')).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByLabel('Confirm Password')).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByLabel('Code')).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByRole('button', { name: 'Reset Now' })).toBeVisible({ timeout: 10_000 });
    });

    test('still need help contact us link working and opens need help modal', async ({ screen }) => {
        await screen.getByText(/Still need help\?/i).tap();
        await expectNeedHelpModal(screen);
    });

    test('Test if fields are required and shows validation error', async ({ screen }) => {
        await screen.getByPlaceholder("Code").tap();
        await screen.getByPlaceholder("Choose a password").first().tap();
        await screen.getByPlaceholder("Choose a password").nth(1).tap();
        await screen.getByRole('button', { name: 'Reset Now' }).tap();
        await expect(screen.getByText(/Code is required!/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Password is required!/i)).toHaveCount(2, { timeout: 10_000 });
    });

    test('Test password fields validation and shows validation error when entered not valid passwrod', async ({ screen }) => {
        await screen.getByPlaceholder("Choose a password").first().fill("123");
        await expect(screen.getByText(/Must contain at least 1 number!/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Must contain at least 1 in Capital Case!/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Must contain at least 1 letter in Small Case!/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Must contain at least 1 special Character!/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeVisible({ timeout: 10_000 });
    });

    test('Test Passowrd field validation when entered valid password and shows no validation errors', async ({ screen }) => {
        await screen.getByPlaceholder("Choose a password").first().fill(nativeEnv.password);
        await expect(screen.getByText(/Must contain at least 1 number!/i)).not.toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Must contain at least 1 in Capital Case!/i)).not.toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Must contain at least 1 letter in Small Case!/i)).not.toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Must contain at least 1 special Character!/i)).not.toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/Password must be at least 8 characters long/i)).not.toBeVisible({ timeout: 10_000 });
    });

    test('Test Confirm Passowrd field validation when entered valid password and shows no validation errors', async ({ screen }) => {
        await screen.getByPlaceholder("Choose a password").first().fill(nativeEnv.password);
        await screen.getByPlaceholder("Choose a password").nth(1).fill(nativeEnv.password);
        await expect(screen.getByText(/Password confirmation does not match/i)).not.toBeVisible({ timeout: 10_000 });
    });

    test('Test Confirm Passowrd field validation when entered mismatched passwords and shows validation errors', async ({ screen }) => {
        await screen.getByPlaceholder("Choose a password").first().fill(nativeEnv.password);
        await screen.getByPlaceholder("Choose a password").nth(1).fill(invalidCreds.password);
        await expect(screen.getByText(/Password confirmation does not match/i)).toBeVisible({ timeout: 10_000 });
    });
});
