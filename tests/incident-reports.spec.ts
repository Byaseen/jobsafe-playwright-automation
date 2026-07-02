/**
 * JobSafe web — Incident Reports listing page (/app/settings/incident-reports).
 *
 * Covers: page load, report list display, filter panel open/close/fields, archive
 * dialog, FAB report-type modal, help button, and navigation.
 *
 * The HSSE form happy path is covered by incident-report.spec.ts — tests here do
 * NOT duplicate that flow.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { IncidentReportsPage } from './pages/incidentReportsPage';
import { ContactUsModal } from './pages/components/contactUsModal';
import { env } from '../utils/env';

const hasCreds = Boolean(env.email && env.password);

test.describe('JobSafe web — Incident Reports list', () => {
  test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, env.password);
    await login.expectReachedHome();
    const ir = new IncidentReportsPage(page);
    await ir.goto();
    await ir.expectLoaded();
  });

  // ─── Page load ─────────────────────────────────────────────────

  test('loads at the correct URL with the "Reports" page title', async ({ page }) => {
    await new IncidentReportsPage(page).expectPageTitle();
  });

  test('shows the report table on load', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await expect(ir.reportsTable).toBeVisible();
  });

  // ─── Report list ───────────────────────────────────────────────

  // test('report rows show type/ID, title, creation info, and status badge', async ({ page }) => {
  //   const ir = new IncidentReportsPage(page);
  //   await expect(ir.reportsTable.getByRole('cell', { name: 'INC-001' })).toBeVisible();
  //   await expect(ir.reportsTable.getByRole('cell', { name: 'Near Miss' })).toBeVisible();
  //   await expect(ir.reportsTable.getByRole('cell', { name: 'Test title report' })).toBeVisible();
  //   await expect(ir.reportsTable.getByRole('cell', { name: 'Draft' })).toBeVisible();
  // });

  test('clicking a report row navigates to the report detail page', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.clickRow('INC-001');
    await expect(page).toHaveURL(/incident-reports\/near-miss-report\//, { timeout: 20_000 });
  });

  // ─── Filter panel ──────────────────────────────────────────────

  test('filter button opens the filter panel', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.openFilterPanel();
    await ir.expectFilterPanelVisible();
  });

  test('filter panel contains Type chips, Status chips, search input, and Apply Filter button', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.openFilterPanel();
    await expect(ir.filterTypeButton('HSSE Report')).toBeVisible();
    await expect(ir.filterTypeButton('Incident Report')).toBeVisible();
    await expect(ir.filterTypeButton('Near Miss')).toBeVisible();
    await expect(ir.filterTypeButton('Other')).toBeVisible();
    await expect(ir.filterStatusButton('Draft')).toBeVisible();
    await expect(ir.filterStatusButton('Pending')).toBeVisible();
    await expect(ir.filterStatusButton('In review')).toBeVisible();
    await expect(ir.filterStatusButton('Archived')).toBeVisible();
    await expect(ir.filterStatusButton('Resolved')).toBeVisible();
    await expect(ir.filterStatusButton('Excluded')).toBeVisible();
    await expect(ir.applyFilterButton).toBeVisible();
  });

  test('filter panel X button dismisses the panel', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.openFilterPanel();
    await ir.expectFilterPanelVisible();
    await ir.closeFilterPanel();
    await ir.expectFilterPanelHidden();
  });

  test('selecting a Type chip and clicking Apply Filter closes the panel', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.openFilterPanel();
    await ir.filterTypeButton('Near Miss').click();
    await ir.applyFilter();
    await ir.expectFilterPanelHidden();
    await expect(page).toHaveURL(/incident-reports/);
  });

  // ─── Archive dialog ────────────────────────────────────────────

  test('action button on a report row opens the archive confirmation dialog', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.clickRowActionButton('INC-001');
    await ir.expectArchiveDialogVisible();
  });

  test('Cancel button in the archive dialog dismisses it without archiving', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.clickRowActionButton('INC-001');
    await ir.expectArchiveDialogVisible();
    await ir.archiveCancelButton.click();
    await ir.expectArchiveDialogDismissed();
    await ir.expectReportListed('INC-001');
  });

  // ─── Help button ───────────────────────────────────────────────

  test('help button opens the contact-us modal', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.helpButton.click();
    await new ContactUsModal(page).expectOpen();
  });

  // ─── Report Type filter ────────────────────────────────────────

  test.describe('Report Type filter', () => {
    // ── Type filter results ──────────────────────────────────────

    test('filtering by "Near Miss" shows only Near Miss reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterTypeButton('Near Miss').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Near Miss');
    });

    test('filtering by "HSSE Report" shows only HSSE reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterTypeButton('HSSE Report').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('HSSE Report');
    });

    test('filtering by "Incident Report" shows only Incident reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterTypeButton('Incident Report').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Incident Report');
    });

    test('filtering by "Other" shows only Other reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterTypeButton('Other').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Other');
    });

    // ── Chip selection state ─────────────────────────────────────

    test('selecting a type chip marks it as selected', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterTypeButton('Near Miss').click();
      await ir.expectFilterChipSelected('nearMissReport');
    });

    test('clicking a selected type chip deselects it', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterTypeButton('Near Miss').click();
      await ir.expectFilterChipSelected('nearMissReport');
      await ir.filterTypeButton('Near Miss').click();
      await ir.expectFilterChipDeselected('nearMissReport');
    });

    test('multiple type chips can be selected simultaneously', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterTypeButton('Near Miss').click();
      await ir.filterTypeButton('HSSE Report').click();
      await ir.expectFilterChipSelected('nearMissReport');
      await ir.expectFilterChipSelected('hsseReport');
    });

    // ── Multi-type filter ────────────────────────────────────────

    test('filtering by multiple types shows reports matching any selected type', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterTypeButton('Near Miss').click();
      await ir.filterTypeButton('HSSE Report').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Near Miss', 'HSSE Report');
    });

    // ── Clear filter ─────────────────────────────────────────────

    test('"Clear filter" resets the filter and restores all reports', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      // Apply a filter that hides all reports
      await ir.openFilterPanel();
      await ir.filterTypeButton('HSSE Report').click();
      await ir.applyFilter();
      await ir.expectNoReports();
      // Reopen panel and clear
      await ir.openFilterPanel();
      await ir.clearFilter();
      await ir.expectFilterPanelHidden();
      await expect(ir.reportsTable).toBeVisible();
      await ir.expectRowsOfType('Near Miss','HSSE Report','Incident Report','Other');
    });

    test('"Clear filter" closes the filter panel', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.expectFilterPanelVisible();
      await ir.filterTypeButton('HSSE Report').click();
      await ir.clearFilter();
      await ir.expectFilterPanelHidden();
    });

    // ── Close-without-apply ──────────────────────────────────────

    test('closing the panel via X without applying does not change the report list', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      // Establish a known filter state: Near Miss applied
      await ir.openFilterPanel();
      await ir.filterTypeButton('Near Miss').click();
      await ir.applyFilter();
      await ir.expectRowsOfType('Near Miss');
      // Open panel, select HSSE but close without applying
      await ir.openFilterPanel();
      await ir.filterTypeButton('HSSE Report').click();
      await ir.closeFilterPanel();
      await ir.expectFilterPanelHidden();
      // Table should still show Near Miss rows (previous applied filter unchanged)
      await ir.expectRowsOfType('Near Miss');
    });
  });

  // ─── Status filter ────────────────────────────────────────────

  test.describe('Status filter', () => {
    // ── Status filter results ────────────────────────────────────

    test('filtering by "Draft" shows only Draft reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Draft').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Draft');
    });

    test('filtering by "Pending" shows only Pending reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Pending').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Pending');
    });

    test('filtering by "In review" shows only In review reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('In review').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('In review');
    });

    test('filtering by "Archived" shows only Archived reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Archived').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Archived');
    });

    test('filtering by "Resolved" shows only Resolved reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Resolved').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Resolved');
    });

    test('filtering by "Excluded" shows only Excluded reports or empty state', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Excluded').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Excluded');
    });

    // ── Chip selection state ─────────────────────────────────────

    test('selecting a status chip marks it as selected', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Pending').click();
      await ir.expectStatusFilterChipSelected('pending');
    });

    test('clicking a selected status chip deselects it', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Pending').click();
      await ir.expectStatusFilterChipSelected('pending');
      await ir.filterStatusButton('Pending').click();
      await ir.expectStatusFilterChipDeselected('pending');
    });

    test('multiple status chips can be selected simultaneously', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Draft').click();
      await ir.filterStatusButton('Pending').click();
      await ir.expectStatusFilterChipSelected('draft');
      await ir.expectStatusFilterChipSelected('pending');
    });

    // ── Multi-status filter ──────────────────────────────────────

    test('filtering by multiple statuses shows reports matching any selected status', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Draft').click();
      await ir.filterStatusButton('Pending').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Draft', 'Pending');
    });

    // ── Clear filter ─────────────────────────────────────────────

    test('"Clear filter" resets the status filter and restores all reports', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.filterStatusButton('Archived').click();
      await ir.applyFilter();
      await ir.expectNoReports();
      await ir.openFilterPanel();
      await ir.clearFilter();
      await ir.expectFilterPanelHidden();
      await expect(ir.reportsTable).toBeVisible();
      await ir.expectRowsOfType('Draft', 'Pending' , 'In review', 'Archived', 'Resolved', 'Excluded');
    });

    test('"Clear filter" closes the filter panel', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      await ir.openFilterPanel();
      await ir.expectFilterPanelVisible();
      await ir.filterStatusButton('Draft').click();
      await ir.clearFilter();
      await ir.expectFilterPanelHidden();
    });

    // ── Close-without-apply ──────────────────────────────────────

    test('closing the panel via X without applying does not change the report list', async ({ page }) => {
      const ir = new IncidentReportsPage(page);
      // Establish a known filter state: Pending applied
      await ir.openFilterPanel();
      await ir.filterStatusButton('Pending').click();
      await ir.applyFilter();
      await ir.expectFilterPanelHidden();
      await ir.expectRowsOfType('Pending');
      // Open panel, select Draft but close without applying
      await ir.openFilterPanel();
      await ir.filterStatusButton('Draft').click();
      await ir.closeFilterPanel();
      await ir.expectFilterPanelHidden();
      // Table should still show only Pending rows (previous applied filter unchanged)
      await ir.expectRowsOfType('Pending');
    });
  });

  // ─── Add New + report-type modal ──────────────────────────────

  test('"Add New" button opens the report type selection modal', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.openAddReportModal();
    await ir.expectAddReportModalOpen();
  });

  test('report type modal shows all four report types', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.openAddReportModal();
    await expect(ir.hsseCard).toBeVisible();
    await expect(ir.incidentCard).toBeVisible();
    await expect(ir.otherCard).toBeVisible();
    await expect(ir.nearMissCard).toBeVisible();
  });

  // ─── Navigation ────────────────────────────────────────────────

  test('back button navigates away from the incident reports page', async ({ page }) => {
    const ir = new IncidentReportsPage(page);
    await ir.backButton.click();
    await expect(page).not.toHaveURL(/incident-reports$/, { timeout: 10_000 });
  });
});
