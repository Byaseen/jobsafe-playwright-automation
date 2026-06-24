/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { LoginPage } from './pages/loginPage';
import { AdminDashboardPage } from './pages/adminDashboardPage';
import { ReportsPage } from './pages/reportsPage';
import { ReportTypeModal } from './pages/reportTypeModal';
import { NearMissReportPage } from './pages/nearMissReportPage';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

test.describe('JobSafe native — Near Miss report', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the JobSafe APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  // Log in (once), open Reports from the home nav, open the report-type picker
  // via the "+" FAB (verifying it opened), then select Near Miss to reach the
  // Near Miss creation screen.
  test.beforeEach(async ({ screen }) => {
    const login = new LoginPage(screen);
    if (await login.isShowing()) {
      await login.login(nativeEnv.email, nativeEnv.password);
      await new AdminDashboardPage(screen).expectLoaded();
    }

    const reports = new ReportsPage(screen);
    await new AdminDashboardPage(screen).openMyReports();
    await reports.expectLoaded();
    await reports.openCreateReport();

    const typeModal = new ReportTypeModal(screen);
    await typeModal.expectOpen(); // confirm the "+" FAB opened the modal
    await typeModal.selectNearMiss();
  });

  test('Near Miss report form opens with its fields', async ({ screen }) => {
    await new NearMissReportPage(screen).expectLoaded();
  });
});
