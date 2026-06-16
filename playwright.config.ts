import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/** Set PW_DEMO=1 in .env or shell for slower, labelled demo run */
const demoMode =
  process.env.PW_DEMO === '1' ||
  process.env.npm_lifecycle_event === 'test:demo' ||
  process.env.npm_lifecycle_event === 'test:form';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/native/**'],
  fullyParallel: false,
  timeout: demoMode ? 300000 : 90000,
  expect: { timeout: 10000 },

  use: {
    baseURL:
      process.env.BASE_URL?.replace(/\/login\/?$/, '') ??
      'https://app.tst.jobsafe.cloud',
    headless: false,
    screenshot: demoMode ? 'on' : 'only-on-failure',
    trace: demoMode ? 'on' : 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    launchOptions: {
      slowMo: demoMode ? 400 : 0,
    },
  },

  projects: [
    {
      name: 'iPhone 15',
      use: {
        ...devices['iPhone 15'],
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'Android Mobile',
      use: {
        ...devices['Pixel 5'],
        storageState: { cookies: [], origins: [] },
      },
    },
  ],
});
