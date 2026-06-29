import type { SignupTrialData } from '../pages/signupTrialPage';

/**
 * Shared web test data — no Page dependency, importable from any spec. Mirrors
 * the native `tests/native/utils/test-data.ts` helper.
 */

/** A unique email so repeated signup runs never collide with a prior account. */
export const uniqueEmail = (prefix = 'test'): string => `${prefix}+${Date.now()}@example.com`;

/** Fields shared by every signup fixture; only the email/password vary per case. */
const baseSignup = {
  firstName: 'Test',
  surname: 'User',
  phoneNumber: '+441234567890',
  companyName: 'JobSafe Test Ltd',
  password: 'P@ssw0rd123!',
  confirmPassword: 'P@ssw0rd123!',
} as const;

/** Valid data with a fresh unique email — used for the happy-path signup. */
export const validSignup = (): SignupTrialData => {
  const email = uniqueEmail();
  return { ...baseSignup, email, confirmEmail: email };
};

/** Valid except the confirm-password field does not match. */
export const passwordMismatchSignup = (): SignupTrialData => {
  const email = uniqueEmail();
  return { ...baseSignup, email, confirmEmail: email, confirmPassword: 'Mismatch123!' };
};

/** A malformed email whose confirm field also differs — triggers both the
 *  "Email is invalid!" and "Emails are not matching" errors. */
export const invalidEmailSignup = (): SignupTrialData => ({
  ...baseSignup,
  email: 'userexample.com',
  confirmEmail: 'different@example.com',
});

/** An email already registered — exercises the "Email already in use" path. */
export const usedEmailSignup = (): SignupTrialData => {
  const email = 'wifihaf124@fanchatu.com';
  return { ...baseSignup, email, confirmEmail: email };
};
