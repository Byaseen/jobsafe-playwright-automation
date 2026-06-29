import { test as setup } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { env } from '../utils/env';

const authFile = 'storageState.json';

setup('authenticate', async ({ page }) => {
  if (!env.email || !env.password) {
    throw new Error('Missing USER_EMAIL or USER_PASSWORD in .env');
  }

  const login = new LoginPage(page);
  await login.goto();
  await login.login(env.email, env.password);
  await login.expectReachedHome();
  await page.context().storageState({ path: authFile });
});
