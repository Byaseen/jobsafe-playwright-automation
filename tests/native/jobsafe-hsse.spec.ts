// /**
//  * JobSafe native HSSE — runs only when you have the real app package in .env
//  */
// import { test, expect } from '@mobilewright/test';
// import { nativeEnv } from '../../utils/native-env';

// const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

// test.describe('JobSafe native — HSSE report', () => {
//   test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

//   test.beforeEach(async ({ screen, device, bundleId }) => {
//     await device.launchApp(bundleId);
//     await screen.getByLabel('Email').fill(nativeEnv.email);
//     await screen.getByLabel('Password').fill(nativeEnv.password);
//     await screen.getByRole('button', { name: /login/i }).tap();
//     await expect(screen.getByText(/My Reports/i).first()).toBeVisible({ timeout: 30_000 });
//   });

//   test('create HSSE report', async ({ screen }) => {
//     await screen.getByText('My Reports', { exact: false }).tap();
//     await screen.getByRole('button', { name: /add|plus|new/i }).tap();
//     await screen.getByText(/HSSE/i).tap();

//     await expect(screen.getByText(/HSSE Report|Title/i).first()).toBeVisible({ timeout: 20_000 });

//     await screen.getByLabel(/title/i).fill('Test');
//     await screen.getByLabel(/description/i).fill('Test New');

//     await screen.swipe('up');
//     await screen.getByText('Save', { exact: false }).tap();

//     await expect(screen.getByText('Test').first()).toBeVisible({ timeout: 30_000 });
//   });
// });
