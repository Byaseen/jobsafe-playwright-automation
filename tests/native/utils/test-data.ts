/**
 * Shared test data for the JobSafe native specs.
 */

/** Credentials that are well-formed but not a real account — used for the
 *  invalid-login / wrong-password paths. */
export const invalidCreds = {
  email: 'test@test.com',
  password: 'wrong-password-123',
};
