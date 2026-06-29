import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';
import { dismissKeyboard } from '../utils/keyboard';
import { drawSignature } from '../utils/signature';

/**
 * The Near Miss report creation screen, reached via Reports → "+" → Near Miss.
 *
 * Field labels are stable StaticText and used for assertions. The inputs are
 * mostly unlabelled TextFields, so the few we drive (Title, Incident Time) are
 * located by their position among all TextFields — confirmed from a view-tree
 * dump.
 *
 * The Employee signature is captured automatically by signEmployeeSignature():
 * tapping its "Sign" button opens an "Add a Signature" modal with a freehand
 * canvas (no accessibility node), which we draw on by coordinate, then confirm
 * with DONE. Once captured the form shows an "employee signature" image and the
 * "Sign" button becomes "Re-sign".
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
  // Employee signature: its "Sign" button (the first of two — Manager's is the
  // optional second), the modal it opens, and the proof it was captured.
  readonly employeeSignButton: Locator;
  readonly signatureModalTitle: Locator;
  readonly signatureDoneButton: Locator;
  readonly signatureClearButton: Locator;
  readonly signatureCancelButton: Locator;
  readonly employeeSignatureImage: Locator;
  readonly employeeReSignButton: Locator;
  // Primary actions.
  readonly saveButton: Locator;
  readonly saveAndSendButton: Locator;
  readonly RequiredFieldMessage : Locator;

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
    // Employee Signature is the first "Sign" button; Manager Signature (Optional)
    // is the second. The modal's title and DONE/CLEAR/CANCEL come from a dump.
    this.employeeSignButton = screen.getByRole('button', { name: 'Sign' }).nth(-2);
    this.signatureModalTitle = screen.getByText(/Add a Signature/i);
    this.signatureDoneButton = screen.getByRole('button', { name: 'DONE' });
    this.signatureClearButton = screen.getByRole('button', { name: 'CLEAR' });
    this.signatureCancelButton = screen.getByRole('button', { name: 'CANCEL' });
    // Once signed, the captured signature renders as an image labelled "employee
    // signature" and the "Sign" button is replaced by "Re-sign".
    this.employeeSignatureImage = screen.getByLabel('employee signature');
    this.employeeReSignButton = screen.getByRole('button', { name: 'Re-sign' });
    // Two "Save" buttons exist (witness + bottom); the bottom one is last.
    this.saveButton = screen.getByRole('button', { name: 'Save' }).last();
    this.saveAndSendButton = screen.getByRole('button', { name: 'Save and send' });
    this.RequiredFieldMessage = screen.getByText(/This field is required/i);
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
   * Capture the Employee signature automatically: bring its "Sign" button into
   * view and tap it, draw on the modal's freehand canvas, then confirm with DONE.
   * Asserts the captured signature is reflected back on the form ("Sign" becomes
   * "Re-sign"), so a no-op draw can't pass silently.
   */
  async signEmployeeSignature() {
    // The Sign button sits mid-form, so (unlike the bottom Save buttons) we can
    // scroll it to the screen centre and tap it by locator — far more reliable
    // than tapWhenInView's edge-of-band coordinate tap, which can miss it.
    await this.centreInView(this.employeeSignButton);
    await this.employeeSignButton.tap();
    await expect(this.signatureModalTitle).toBeVisible({ timeout: 10_000 });
    await drawSignature(this.screen);
    await this.signatureDoneButton.tap();
    await expect(this.employeeReSignButton).toBeVisible({ timeout: 10_000 });
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

  /**
   * Scroll a mid-form control so its centre sits in a comfortable middle band,
   * then let it settle — the caller taps it by locator. Unlike tapWhenInView
   * (built for controls pinned to the bottom edge), this keeps the target away
   * from the sticky header and the footer/keyboard, where a tap can slip off.
   *
   * Bounds are viewport-relative in this WebView, so a target below the fold
   * reports a y past the screen height; we swipe up to pull it in and down if we
   * overshoot, using short swipes for fine control.
   */
  private async centreInView(target: Locator, top = 150, bottom = 470, maxSwipes = 18) {
    for (let i = 0; i < maxSwipes; i++) {
      const box = await target.boundingBox().catch(() => null);
      if (box) {
        const centre = box.y + box.height / 2;
        if (centre >= top && centre <= bottom) {
          await this.sleep(500); // let any inertial scroll settle before the tap
          return;
        }
        await this.screen.swipe(centre > bottom ? 'up' : 'down', { distance: 160 });
      } else {
        await this.screen.swipe('up', { distance: 160 });
      }
      await this.sleep(300);
    }
    throw new Error('centreInView: control never settled in the middle band');
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

  expectRequiredFieldsValidationErrorsShown(numberOfFields: number) {
    expect(this.RequiredFieldMessage).toHaveCount(numberOfFields, { timeout: 10_000 });
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
