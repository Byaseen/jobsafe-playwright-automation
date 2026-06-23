import { expect } from '@mobilewright/test';
import type { Screen } from '@mobilewright/core';

/**
 * Shared assertions for components that appear on more than one native screen.
 *
 * These only ASSERT the rendered state — the action that opens the component
 * (e.g. tapping the help button) lives in each spec, because the trigger
 * differs per screen.
 */

/** Assert the "Need Help?" modal is open and shows its support message. */
export const expectNeedHelpModal = async (screen: Screen) => {
  await expect(screen.getByText(/Need Help\?/i)).toBeVisible({ timeout: 10_000 });
  await expect(
    screen.getByText(
      /If you are experiencing any issues, Please attempt to refresh the page before contacting support. Thank you/i,
    ),
  ).toBeVisible({ timeout: 10_000 });
};
