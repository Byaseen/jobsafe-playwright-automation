/**
 * JobSafe native app — runs only when ANDROID_PACKAGE or IOS_BUNDLE_ID is set in .env
 */
import { test } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { uniqueTitle } from './utils/test-data';
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

  // The required fields (no "(Optional)" label) show their required message once
  // tapped and left empty. Title and Incident Time are the empty required text
  // fields — Date, Employee, Incident Date and Report Type are pre-filled.
  //
  // Each is its own test so beforeEach re-opens a fresh form (scrolled to the
  // top): in one combined test, tapping the first field scrolls the form and
  // pushes the other off-screen, so the second tap misses.

  test('Check required field validation inside of the Near miss form', async ({ screen }) => {
    const form = new NearMissReportPage(screen);
    await form.expectRequiredWhenEmpty(form.incidentTimeInput, /This field is required/i);
    await form.expectRequiredWhenEmpty(form.titleInput, /This field is required/i);
  });

  test('creates a Near Miss report (automated Employee signature) & save it as draft', async ({ screen }) => {
    const reportsPage = new ReportsPage(screen);
    const form = new NearMissReportPage(screen);
    await form.expectLoaded();

    // Unique title so we can find this exact report in the list afterwards.
    const title = uniqueTitle('Near Miss Draft');
    await form.fillRequiredFields({ title, incidentTime: '10:00 AM' });
    await form.signEmployeeSignature();
    await form.save();

    // Back on the Reports list, the saved report should be there. Saving
    // round-trips to the server, so allow extra time to land + list.
    await reportsPage.expectLoaded(60_000);
    await reportsPage.expectReportListed(title, 60_000);
  });

  test('creates a Near Miss report (automated Employee signature) & save and send it', async ({ screen }) => {
    const reportsPage = new ReportsPage(screen);
    const form = new NearMissReportPage(screen);
    await form.expectLoaded();

    // Unique title so we can find this exact report in the list afterwards.
    const title = uniqueTitle('Near Miss Sent');
    await form.fillRequiredFields({ title, incidentTime: '10:00 AM' });
    await form.signEmployeeSignature();
    await form.saveAndSend();
    await form.expectSentSuccessfully();

    // Back on the Reports list, the sent report should be there. "Save and send"
    // round-trips to the server, so allow extra time to land + list.
    await reportsPage.expectLoaded(60_000);
    await reportsPage.expectReportListed(title, 60_000);
  });
});
