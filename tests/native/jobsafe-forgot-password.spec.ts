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
        await device.launchApp(bundleId!);
        await screen.getByText(/Forgot password\?/i).tap();
        await expect(screen.getByText(/Simply provide us with your Email/i)).toBeVisible({ timeout: 10_000 });
    });

    test('Email Is required and shows validation error', async ({ screen }) => {
        await screen.getByPlaceholder('Email').tap();
        await screen.getByRole('button', { name: 'Next' }).tap();
        await expect(screen.getByText(/Email is required!/i)).toBeVisible({ timeout: 10_000 });
    });

    test('Email field is validated for proper email format', async ({ screen }) => {
        await screen.getByPlaceholder('Email').fill('invalid-email');
        await screen.getByRole('button', { name: 'Next' }).tap();
        await expect(screen.getByText(/Email is invalid!/i)).toBeVisible({ timeout: 10_000 });
    });

    test('Go back to login screen button working and navigates back to login screen', async ({ screen }) => {
        await screen.getByRole('button', { name: 'Go back to previous screen' }).tap();
        await expect(screen.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10_000 });
    });

    test('test back arrow button working and navigates back to login screen', async ({ screen }) => {
        await screen.getByType('Button').first().tap();
        await expect(screen.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10_000 });
    });
    
    test('test Email with valid credentials and navigates to Thank you screen', async ({ screen }) => {
        await screen.getByPlaceholder('Email').fill(nativeEnv.email);
        await screen.getByRole('button', { name: 'Next' }).tap();
        await expect(screen.getByText(/Thank you!/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/We have received your request/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/If your email is recognised we will send you an email back with a verification code that you will need to change your current password/i)).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByRole('button', { name: 'Change Password' })).toBeVisible({ timeout: 10_000 });
        await expect(screen.getByText(/No Email received\?/i)).toBeVisible({ timeout: 10_000 });
    });

    test('Thank you page conatin the No Email received? link and it opens the need help modal', async ({ screen }) => {
        await screen.getByPlaceholder('Email').fill(nativeEnv.email);
        await screen.getByRole('button', { name: 'Next' }).tap();
        await screen.getByText(/No Email received\?/i).tap();
        await expectNeedHelpModal(screen);
    });

    test('Need Help button working and opens help modal', async ({ screen }) => {
        await screen.getByType('Button').nth(1).tap();
        await expectNeedHelpModal(screen);
    });
});
