import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';

/**
 * The Reports screen, reached from the home bottom-nav "My Reports" tab.
 *
 * Layout (from the design): a header with a back arrow, the "Reports" title, and
 * filter (funnel) + help (?) icons; the report list body (or a "No reports found"
 * empty state); and a green "+" floating button to create a report.
 *
 * Note: the header icons and the "+" FAB are icon-only (no text label), so their
 * locators still need to be pinned from an on-device view-tree dump before they
 * can be driven — left out here until confirmed. The title and empty-state are
 * plain text and reliable.
 */
export class ReportsPage {
  readonly screen: Screen;
  readonly title: Locator;
  readonly emptyState: Locator;
  /** The green "+" FAB that opens the report-type picker. Icon-only (no label),
   *  so located by position: on the Reports screen it's the 6th Button — after
   *  menu, bell, back, filter, help — sitting bottom-right above the footer nav
   *  (bounds ~x314,y677,56x56), confirmed from a view-tree dump. */
  readonly addButton: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    // Exact match so it targets the header title and not the "My Reports" tab
    // or the "No reports found" text.
    this.title = screen.getByText('Reports');
    this.emptyState = screen.getByText(/No reports found/i);
    this.addButton = screen.getByType('Button').nth(5);
  }

  /** Open the report-type picker modal via the "+" FAB. */
  async openCreateReport() {
    await this.addButton.tap();
  }

  /** We've navigated to the Reports screen (header title is shown). */
  async expectLoaded() {
    await expect(this.title).toBeVisible({ timeout: 15_000 });
  }

  /** The empty-state message (valid only for an account with no reports). */
  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10_000 });
  }
}
