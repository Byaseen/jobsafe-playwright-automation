import { test } from '@playwright/test';
import { login } from '../utils/login';
import {
  goToIncidentReports,
  clickAddReport,
  selectHsseReport,
} from '../utils/navigation';

/** Opens HSSE form and pauses — record one step in Inspector. Run: npm run record:step */
test('pause on HSSE form for single-step recording', async ({ page }) => {
  test.setTimeout(0);

  await login(page);
  await goToIncidentReports(page);
  await clickAddReport(page);
  await selectHsseReport(page);

  await page.waitForSelector('ion-input[formcontrolname="title"]', {
    state: 'visible',
    timeout: 20000,
  });

  await page.pause();
});
