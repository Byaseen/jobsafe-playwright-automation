import type { Page } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const demoMode =
  process.env.PW_DEMO === '1' ||
  process.env.npm_lifecycle_event === 'test:demo' ||
  process.env.npm_lifecycle_event === 'test:form';

const pauseMs = demoMode ? Number(process.env.STEP_PAUSE_MS ?? 800) : 0;

async function runStep<T>(page: Page, name: string, action: () => Promise<T>): Promise<T> {
  console.log(`\n▶ ${name}`);
  await page
    .evaluate((label) => {
      document.title = `[Test] ${label}`;
    }, name)
    .catch(() => undefined);
  if (pauseMs > 0) {
    await page.waitForTimeout(pauseMs);
  }
  return action();
}

/** Any step (login, nav, etc.) — pauses only in demo mode. */
export async function step<T>(page: Page, name: string, action: () => Promise<T>): Promise<T> {
  return runStep(page, name, action);
}

/** HSSE form fields — always logs; uses longer pause in demo / test:form. */
export async function formStep<T>(page: Page, name: string, action: () => Promise<T>): Promise<T> {
  return runStep(page, `[Form] ${name}`, action);
}
