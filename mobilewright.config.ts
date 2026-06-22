import path from 'node:path';
import {
  defineConfig,
  type MobilewrightProjectConfig,
  type MobilewrightUseOptions,
} from 'mobilewright';
import dotenv from 'dotenv';

dotenv.config();

const sampleApk = path.join('apps', 'ApiDemos-debug.apk');
const samplePackage = 'io.appium.android.apis';

const jobsafeApk = process.env.ANDROID_APK_PATH;
const jobsafePackage = process.env.ANDROID_PACKAGE;
const iosBundle = process.env.IOS_BUNDLE_ID;

const androidDevice: RegExp = /emulator|Pixel|Android/i;

const projects: MobilewrightProjectConfig[] = [
  {
    name: 'sample-android',
    testMatch: /sample-.*\.spec\.ts/,
    timeout: 150_000,
    retries: 1,
    use: {
      platform: 'android',
      deviceName: androidDevice,
      bundleId: samplePackage,
      installApps: sampleApk,
    } satisfies MobilewrightUseOptions,
  },
];

if (jobsafePackage) {
  const use: MobilewrightUseOptions = {
    platform: 'android',
    deviceName: androidDevice,
    bundleId: "cloud.jobsafe.jobsafeapp",
  };
  if (jobsafeApk) use.installApps = jobsafeApk;

  projects.push({
    name: 'jobsafe-android',
    testMatch: /jobsafe-.*\.spec\.ts/,
    use,
  });
}

if (iosBundle) {
  const use: MobilewrightUseOptions = {
    platform: 'ios',
    deviceName: /Ideveloper’s iPhone/,
    bundleId: "cloud.jobsafe.jobsafeapp",
    // installApps: process.env.IOS_APP_PATH,
  };

  projects.push({
    name: 'jobsafe-ios',
    testMatch: /jobsafe-.*\.spec\.ts/,
    use,
  });
}

export default defineConfig({
  testDir: 'tests/native',
  timeout: 90_000,
  actionTimeout: 10_000,
  viewTree: 'on-failure',
  reporter: 'list',
  projects,
});
