import dotenv from 'dotenv';

dotenv.config();

export const nativeEnv = {
  email: process.env.USER_EMAIL ?? '',
  password: process.env.USER_PASSWORD ?? '',
  androidApk: process.env.ANDROID_APK_PATH ?? '',
  androidPackage: process.env.ANDROID_PACKAGE ?? '',
  iosBundle: process.env.IOS_BUNDLE_ID ?? '',
  iosApp: process.env.IOS_APP_PATH ?? '',
};
