import type { Screen } from '@mobilewright/core';

/**
 * Dismiss the on-screen iOS keyboard.
 *
 * JobSafe is a WebView app, so tapping a non-input area blurs the focused
 * field and the native keyboard retracts. This matters because the keyboard
 * overlaps the lower part of the screen (e.g. the confirm-password field and
 * the "Reset Now" button); without dismissing it first, a follow-up
 * .tap()/.fill() lands on a keyboard key instead of the intended element.
 *
 * (195, 150) is the logo/header band — non-interactive on the JobSafe auth
 * screens. Pass a different coordinate for a screen that has something
 * tappable there.
 */
export const dismissKeyboard = async (screen: Screen, x = 195, y = 150) => {
  await screen.tap(x, y);
};
