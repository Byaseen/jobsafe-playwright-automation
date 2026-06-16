import { test } from '@playwright/test';
import { login } from '../utils/login';

// 💡 Tell Playwright to ignore storageState.json ONLY for this test file
test.use({ storageState: { cookies: [], origins: [] } });

test('TC01 - Login', async ({ page }) => {
  await login(page);
});