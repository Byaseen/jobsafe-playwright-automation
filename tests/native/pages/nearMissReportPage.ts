import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';
import { dismissKeyboard } from '../utils/keyboard';

/**
 * The Near Miss report creation screen, reached via Reports → "+" → Near Miss.
 *
 * Field labels are stable StaticText and used for assertions. The inputs are
 * mostly unlabelled TextFields, so the few we drive (Title, Incident Time) are
 * located by their position among all TextFields — confirmed from a view-tree
 * dump. Severity Level is a dropdown and the date/time use pickers; those
 * interactions still need to be worked out before a full submit test.
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

  async saveAndSend() {
    await this.saveAndSendButton.tap();
  }

  // ─── Assertions ────────────────────────────────────────────────
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
