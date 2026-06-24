/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { LoginPage } from './pages/loginPage';
import { AdminDashboardPage } from './pages/adminDashboardPage';
import { ReportsPage } from './pages/reportsPage';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

test.describe('JobSafe native — Reports', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  test.beforeEach(async ({ screen }) => {
    // The app keeps the session across tests, so we only need to log in once.
    const login = new LoginPage(screen);
    if (await login.isShowing()) {
      await login.login(nativeEnv.email, nativeEnv.password);
      await new AdminDashboardPage(screen).expectLoaded();
    }

    // Open Reports from the home bottom-nav and confirm we landed there.
    await new AdminDashboardPage(screen).openMyReports();
    await new ReportsPage(screen).expectLoaded();
  });

  test('Reports page shows the empty state', async ({ screen }) => {
    await new ReportsPage(screen).expectEmptyState();
  });
});
