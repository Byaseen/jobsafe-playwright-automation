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
/**
 * The green "+" FAB that opens the report-type picker is icon-only (no label),
 * and its index among all Buttons shifts with the screen's state (filter/clear
 * controls appear and disappear, the archive icon on each report row, etc.), so
 * a positional locator like getByType('Button').nth(n) is unreliable. The FAB
 * sits at a fixed spot — bottom-right, above the footer nav — so we tap its
 * centre by coordinate instead.
 *
 * Centre derived from its bounds (x314, y677, 56x56) → (342, 705), measured from
 * a view-tree dump on the iPhone (390×844 pt) Reports screen. Re-measure if the
 * layout or target device changes.
 */
const ADD_FAB = { x: 342, y: 705 } as const;

export class ReportsPage {
  readonly screen: Screen;
  readonly title: Locator;
  readonly emptyState: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    // Exact match so it targets the header title and not the "My Reports" tab
    // or the "No reports found" text.
    this.title = screen.getByText('Reports');
    this.emptyState = screen.getByText(/No reports found/i);
  }

  /** Open the report-type picker modal by tapping the "+" FAB's centre. */
  async openCreateReport() {
    await this.screen.tap(ADD_FAB.x, ADD_FAB.y);
  }

  /** We've navigated to the Reports screen (header title is shown). The timeout
   *  is configurable because some entry points (e.g. after a "Save and send"
   *  that round-trips to the server) take noticeably longer to land here. */
  async expectLoaded(timeout = 15_000) {
    await expect(this.title).toBeVisible({ timeout });
  }

  /** The empty-state message (valid only for an account with no reports). */
  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10_000 });
  }

  /**
   * A report with the given title appears in the list — used after creating one
   * to confirm it was saved. A freshly created report lands at the top, so no
   * scrolling is needed; the timeout covers the brief list refresh after save.
   */
  async expectReportListed(title: string, timeout = 15_000) {
    await expect(this.screen.getByText(title)).toBeVisible({ timeout });
  }
}
