/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test, expect } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

test.describe('JobSafe native — login', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  test('login reaches home', async ({ screen, device, bundleId }) => {
    await device.launchApp(bundleId);

    await screen.getByLabel('Email').fill(nativeEnv.email);
    await screen.getByLabel('Password').fill(nativeEnv.password);
    await screen.getByRole('button', { name: /login/i }).tap();

    await expect(screen.getByText(/My Reports|Home|Reports/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
