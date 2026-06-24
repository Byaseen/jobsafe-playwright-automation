import dotenv from 'dotenv';

dotenv.config();

export const nativeEnv = {
  email: process.env.USER_EMAIL ?? '',
  password: process.env.USER_PASSWORD ?? '',
  // The password the reset-password happy path sets. Must differ from
  // USER_PASSWORD so the "old password no longer works" check is meaningful.
  newPassword: process.env.USER_NEW_PASSWORD ?? '',
  androidApk: process.env.ANDROID_APK_PATH ?? '',
  androidPackage: process.env.ANDROID_PACKAGE ?? '',
  iosBundle: process.env.IOS_BUNDLE_ID ?? '',
  iosApp: process.env.IOS_APP_PATH ?? '',
  // Opt-in flag for tests that pause to wait for manual terminal input
  // (e.g. typing a real emailed verification code). Off by default so these
  // tests are skipped in normal / CI runs, where there is no interactive stdin.
  runManual: process.env.RUN_MANUAL === '1',
};
