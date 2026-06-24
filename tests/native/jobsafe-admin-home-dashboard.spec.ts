/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { LoginPage } from './pages/loginPage';
import { AdminDashboardPage } from './pages/adminDashboardPage';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

test.describe('JobSafe native — Admin Home Dashboard', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  test.beforeEach(async ({ screen }) => {
    // The app keeps the session across tests, so we only need to log in once.
    // If the login screen isn't showing, we're already on Home from a previous
    // test — skip straight through. This effectively runs login just once.
    const login = new LoginPage(screen);
    if (!(await login.isShowing())) return;

    await login.login(nativeEnv.email, nativeEnv.password);
    await new AdminDashboardPage(screen).expectLoaded();
  });

  test('Admin dashboard elements are visible', async ({ screen }) => {
    const dashboard = new AdminDashboardPage(screen);
    await dashboard.expectLoaded();
    await dashboard.expectDashboardWidgets();
  });

  test('Sidebar menu elements are visible and working', async ({ screen }) => {
    const dashboard = new AdminDashboardPage(screen);
    await dashboard.openSidebar();
    await dashboard.expectSidebarItems();
  });
});
