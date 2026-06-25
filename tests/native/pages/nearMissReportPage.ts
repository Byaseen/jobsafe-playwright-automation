import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';
import { dismissKeyboard } from '../utils/keyboard';
import { promptManualInput } from '../utils/manual-input';

/**
 * The Near Miss report creation screen, reached via Reports → "+" → Near Miss.
 *
 * Field labels are stable StaticText and used for assertions. The inputs are
 * mostly unlabelled TextFields, so the few we drive (Title, Incident Time) are
 * located by their position among all TextFields — confirmed from a view-tree
 * dump.
 *
 * Two parts of the form cannot be automated and are completed by hand via
 * waitForManualSeverityAndSignature():
 *   • Severity Level — a WebView dropdown that the iOS accessibility bridge does
 *     NOT expose as a node (nothing exists in the tree between the "Severity
 *     Level" label and the next field), so no locator can target it.
 *   • Employee signature — a freehand canvas, which has no programmatic input.
 */
export class NearMissReportPage {
  readonly screen: Screen;
  readonly heading: Locator;
  // Field labels (StaticText).
  readonly dateLabel: Locator;
  readonly employeeLabel: Locator;
  readonly incidentDateLabel: Locator;
  readonly incidentTimeLabel: Locator;
  readonly reportTypeLabel: Locator;
  readonly titleLabel: Locator;
  readonly severityLevelLabel: Locator;
  readonly descriptionLabel: Locator;
  // Inputs (positional — see class note).
  readonly titleInput: Locator;
  readonly incidentTimeInput: Locator;
  // Primary actions.
  readonly saveButton: Locator;
  readonly saveAndSendButton: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.heading = screen.getByText('Near Miss Report');
    this.dateLabel = screen.getByText('Date');
    this.employeeLabel = screen.getByText('Employee');
    this.incidentDateLabel = screen.getByText('Incident Date');
    this.incidentTimeLabel = screen.getByText('Incident Time');
    this.reportTypeLabel = screen.getByText('Report Type');
    this.titleLabel = screen.getByText('Title');
    this.severityLevelLabel = screen.getByText('Severity Level');
    this.descriptionLabel = screen.getByText('Description');
    // Order among all TextFields: 0 Date(datepicker), 1 Employee, 2 Incident
    // Date(datepicker), 3 Incident Time, 4 Title, ... (from the view-tree dump).
    this.incidentTimeInput = screen.getByType('TextField').nth(3);
    this.titleInput = screen.getByType('TextField').nth(4);
    // Two "Save" buttons exist (witness + bottom); the bottom one is last.
    this.saveButton = screen.getByRole('button', { name: 'Save' }).last();
    this.saveAndSendButton = screen.getByRole('button', { name: 'Save and send' });
  }

  // ─── Actions ───────────────────────────────────────────────────
  async fillTitle(title: string) {
    await this.titleInput.fill(title);
    await dismissKeyboard(this.screen);
  }

  async fillIncidentTime(time: string) {
    await this.incidentTimeInput.fill(time);
    await dismissKeyboard(this.screen);
  }

  /** Fill the required free-text fields that have stable locators. */
  async fillRequiredFields({ title, incidentTime }: { title: string; incidentTime: string }) {
    await this.fillIncidentTime(incidentTime);
    await this.fillTitle(title);
  }

  /**
   * Pause for the tester to complete the two parts that can't be automated — the
   * Severity Level dropdown (no accessibility node) and the Employee signature
   * (a freehand canvas) — on the device, then press Enter in the terminal to
   * resume. keepAlive polls a cheap query so the physical-device session doesn't
   * go idle during the wait.
   *
   * Interactive only — gate callers behind nativeEnv.runManual (RUN_MANUAL=1)
   * and relax the test timeout (test.setTimeout(0)).
   */
  async waitForManualSeverityAndSignature() {
    await promptManualInput(
      'On the iPhone: select a Severity Level and sign the Employee signature, then press Enter to continue…',
      { keepAlive: () => this.saveAndSendButton.isVisible({ timeout: 2_000 }).catch(() => false) },
    );
  }

  async saveAndSend() {
    await this.tapWhenInView(this.saveAndSendButton);
  }

  async save() {
    await this.tapWhenInView(this.saveButton);
  }

  /**
   * Tap a control that lives at the bottom of this long WebView form.
   *
   * A plain Locator.tap() taps the node's reported centre, but the bounds are
   * given relative to the current viewport — so a control below the fold reports
   * an off-screen y and the tap misses (the same document-vs-viewport gap as the
   * Severity field). The built-in scrolls don't help here: isVisible() is always
   * true in this WebView (so scrollDownToReveal no-ops) and scrollIntoViewIfNeeded
   * mis-picks its swipe direction on long forms. So we swipe up ourselves until
   * the button's live bounds sit inside the viewport, then tap its centre.
   */
  private async tapWhenInView(button: Locator, maxSwipes = 14) {
    const TOP = 60; // clear of the sticky header
    const BOTTOM = 740; // clear of the footer tab bar (iPhone logical height 844)
    const inBand = (b: { y: number; height: number } | null) =>
      !!b && b.y >= TOP && b.y + b.height <= BOTTOM;

    for (let i = 0; i < maxSwipes; i++) {
      const box = await button.boundingBox().catch(() => null);
      if (inBand(box)) {
        // Inertial scrolling keeps moving for a moment after a swipe, so a box
        // read right after swiping is stale by the time we tap. Let it settle,
        // re-read the button's final position, then tap that.
        await this.sleep(600);
        const settled = await button.boundingBox().catch(() => null);
        if (inBand(settled) && settled) {
          await this.screen.tap(settled.x + settled.width / 2, settled.y + settled.height / 2);
          return;
        }
      }
      await this.screen.swipe('up');
      await this.sleep(400);
    }
    throw new Error('tapWhenInView: button never settled inside the viewport');
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Tap a required field, blur it (so the touched-empty validation fires), and
   * assert its required message shows. `message` is passed in because the exact
   * wording differs per field.
   */
  async expectRequiredWhenEmpty(input: Locator, message: RegExp) {
    await input.tap();
    await dismissKeyboard(this.screen); // blur the field
    await expect(this.screen.getByText(message)).toBeVisible({ timeout: 10_000 });
  }

  // ─── Assertions ────────────────────────────────────────────────
  /** The success confirmation shown after "Save and send" submits the report.
   *  Sending round-trips to the server, so the timeout is generous. */
  async expectSentSuccessfully(timeout = 60_000) {
    await expect(this.screen.getByText(/sent successfully/i)).toBeVisible({ timeout });
  }

  /** The Near Miss creation screen is shown with its key fields. */
  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
    await expect(this.incidentDateLabel).toBeVisible({ timeout: 10_000 });
    await expect(this.incidentTimeLabel).toBeVisible({ timeout: 10_000 });
    await expect(this.reportTypeLabel).toBeVisible({ timeout: 10_000 });
    await expect(this.titleLabel).toBeVisible({ timeout: 10_000 });
    await expect(this.severityLevelLabel).toBeVisible({ timeout: 10_000 });
    await expect(this.saveAndSendButton).toBeVisible({ timeout: 10_000 });
  }
}
