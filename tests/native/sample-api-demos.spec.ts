/**
 * ApiDemos menu tour order:
 *   Animation → App → Content → Media → View  (then Graphics/Text if extended)
 *
 *   npm run native:test:sample       — Animation, App, Content (peek)
 *   npm run native:test:sample:full  — full tour through View
 */
import type { Screen } from '@mobilewright/core';
import { test, expect } from '@mobilewright/test';

const demo = process.env.NATIVE_DEMO === '1';
const full = process.env.NATIVE_FULL === '1' || demo;
const extended = process.env.NATIVE_EXTENDED === '1';

const T = {
  home: demo ? 15_000 : 12_000,
  tap: demo ? 10_000 : 8_000,
  peek: demo ? 500 : 200,
};

test.use({ video: demo ? 'on' : 'off', viewTree: 'off' });

/** Order matters: top of list first, scroll only for lower sections. */
const MENUS = [
  { section: 'Animation', item: 'Bouncing Balls', scrollHome: false },
  { section: 'App', item: 'Activity', scrollHome: false },
  { section: 'Content', item: 'Resources', scrollHome: true },
  { section: 'Media', item: 'AudioFx', scrollHome: true },
  { section: 'View', item: 'Buttons', scrollHome: true },
] as const;

const MENUS_EXTRA = [
  { section: 'Graphics', item: 'Arcs', scrollHome: true },
  { section: 'Text', item: 'Dialog', scrollHome: true },
] as const;

function menusForRun() {
  if (!full) return MENUS.slice(0, 3);
  if (extended) return [...MENUS, ...MENUS_EXTRA];
  return [...MENUS];
}

async function isHomeList(screen: Screen) {
  const animation = await screen.getByText('Animation', { exact: true }).isVisible({ timeout: T.peek }).catch(() => false);
  const app = await screen.getByText('App', { exact: true }).isVisible({ timeout: T.peek }).catch(() => false);
  return animation && app;
}

async function waitForHomeList(screen: Screen) {
  await expect(screen.getByText('API Demos')).toBeVisible({ timeout: T.home });
  await expect(screen.getByText('App', { exact: true })).toBeVisible({ timeout: T.tap });
}

async function returnToHome(screen: Screen) {
  for (let i = 0; i < 8; i++) {
    if (await isHomeList(screen)) return;
    await screen.goBack();
  }
  await expect(screen.getByText('App', { exact: true })).toBeVisible({ timeout: T.tap });
}

/** Swipe home list (faster than scrollIntoViewIfNeeded when hunting lower rows). */
async function tapHomeRow(screen: Screen, section: string, scrollHome: boolean) {
  const row = screen.getByText(section, { exact: true });
  if (scrollHome) {
    for (let i = 0; i < 5; i++) {
      if (await row.isVisible({ timeout: T.peek }).catch(() => false)) break;
      await screen.swipe('up', { duration: 200 });
    }
  }
  await row.tap({ timeout: T.tap });
}

async function openMenuPath(
  screen: Screen,
  section: string,
  item: string,
  scrollHome: boolean,
  openScreen: boolean,
) {
  await returnToHome(screen);
  await tapHomeRow(screen, section, scrollHome);

  const sub = screen.getByText(item, { exact: true });
  await expect(sub).toBeVisible({ timeout: T.tap });

  if (openScreen) {
    await sub.tap({ timeout: T.tap });
    await screen.goBack();
  }

  await screen.goBack();
  await returnToHome(screen);
}

test.describe('ApiDemos', () => {
  test.describe.configure({ retries: 1 });

  test('menu tour', async ({ screen }) => {
    test.setTimeout(demo ? 300_000 : full ? 150_000 : 90_000);
    await waitForHomeList(screen);

    for (const menu of menusForRun()) {
      await openMenuPath(screen, menu.section, menu.item, menu.scrollHome, full);
    }
  });
});
