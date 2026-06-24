import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';

/**
 * The report-type picker modal shown after tapping the "+" FAB on the Reports
 * screen. It offers four report types — HSSE Report, Incident, Other, Near Miss
 * — as cards, plus a close (X) in the top-right.
 *
 * The type cards carry visible text, so they're matched by text. The close (X)
 * is icon-only and its locator still needs confirming from an on-device dump.
 */
export class ReportTypeModal {
  readonly screen: Screen;
  readonly hsseReport: Locator;
  readonly incident: Locator;
  readonly other: Locator;
  readonly nearMiss: Locator;
  /** Top-right close (X). Icon-only — verify before driving it. */
  readonly closeButton: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.hsseReport = screen.getByText(/HSSE/i);
    this.incident = screen.getByText(/Incident/i);
    this.other = screen.getByText(/Other/i);
    this.nearMiss = screen.getByText(/Near Miss/i);
    this.closeButton = screen.getByType('Button').first();
  }

  // ─── Actions ───────────────────────────────────────────────────
  async selectNearMiss() {
    await this.nearMiss.tap();
  }

  async close() {
    await this.closeButton.tap();
  }

  // ─── Assertions ────────────────────────────────────────────────
  /** The modal is open with all four report-type cards visible. */
  async expectOpen() {
    await expect(this.hsseReport).toBeVisible({ timeout: 10_000 });
    await expect(this.incident).toBeVisible({ timeout: 10_000 });
    await expect(this.other).toBeVisible({ timeout: 10_000 });
    await expect(this.nearMiss).toBeVisible({ timeout: 10_000 });
  }
}
