/**
 * JobSafe web — login smoke test.
 */
import { test } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { env } from '../utils/env';

// Ignore any saved storageState for this smoke test — always log in fresh.
test.use({ storageState: { cookies: [], origins: [] } });

const hasCreds = Boolean(env.email && env.password);

test.describe('JobSafe web — Login smoke', () => {
  test.skip(!hasCreds, 'Missing USER_EMAIL or USER_PASSWORD');

  test('TC01 - logs in successfully', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(env.email, env.password);
    await login.expectReachedHome();
  });
});
