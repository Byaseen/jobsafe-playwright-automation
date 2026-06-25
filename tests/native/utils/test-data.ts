/**
 * Shared test data for the JobSafe native specs.
 */

/** Credentials that are well-formed but not a real account — used for the
 *  invalid-login / wrong-password paths. */
export const invalidCreds = {
  email: 'test@test.com',
  password: 'wrong-password-123',
};

/**
 * A unique, human-readable title for records we create (e.g. a Near Miss
 * report), suffixed with a `YYYY-MM-DD HH:MM:SS` timestamp so each run produces
 * a distinct value we can then locate in a list to confirm it was saved.
 */
export const uniqueTitle = (prefix = 'Near Miss Test'): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp =
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${prefix} ${stamp}`;
};
