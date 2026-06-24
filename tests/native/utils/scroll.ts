import type { Screen, Locator } from '@mobilewright/core';

/**
 * Scroll a below-the-fold element into view.
 *
 * scrollIntoViewIfNeeded auto-picks its swipe direction from the element's
 * reported bounds, which misfires on long screens (it swipes down when the
 * content is below). Swipe UP ourselves — revealing lower content — until the
 * target reports visible.
 */
export const scrollDownToReveal = async (screen: Screen, locator: Locator, maxSwipes = 12) => {
  for (let i = 0; i < maxSwipes; i++) {
    if (await locator.isVisible({ timeout: 800 }).catch(() => false)) return;
    await screen.swipe('up');
  }
};
