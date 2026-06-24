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
  await expect(screen.getByText(/Call on/i)).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/Email us on/i)).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/Monday - Friday | 9:00am - 5:00pm UK /i)).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByRole('button', { name: 'Close' })).toBeVisible({ timeout: 10_000 });
};

/** Assert the Forgot Password screen is shown with its email form. */
export const expectForgotPasswordScreen = async (screen: Screen) => {
  await expect(screen.getByText(/Simply provide us with your Email/i)).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByPlaceholder('Email')).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByRole('button', { name: 'Next' })).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByRole('button', { name: 'Go back to previous screen' })).toBeVisible({ timeout: 10_000 });
};

/** Assert the Thank you confirmation screen is shown after a valid request. */
export const expectThankYouScreen = async (screen: Screen) => {
  await expect(screen.getByText(/Thank you!/i)).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/We have received your request/i)).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/If your email is recognised we will send you an email back with a verification code that you will need to change your current password/i)).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByRole('button', { name: 'Change Password' })).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/No Email received\?/i)).toBeVisible({ timeout: 10_000 });
};

export const expectLoginScreen = async (screen: Screen) => {
  await expect(screen.getByText(/Login/i)).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByPlaceholder('Email')).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByPlaceholder('Choose a password')).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/Forgot password\?/i)).toBeVisible({ timeout: 10_000 });
}

export const expectHomeScreen = async (screen: Screen) => {
  await expect(screen.getByText(/My Reports/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/Documents/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/SOS/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByText(/Home/i).first()).toBeVisible({ timeout: 10_000 });
}
