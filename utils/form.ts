import { expect, type Locator, type Page } from '@playwright/test';

/** Scroll into view and fill ion-input (no separate click — works on iPhone WebKit). */
export async function fillIonInput(
  page: Page,
  formControlName: string,
  value: string
) {
  const input = page.locator(`ion-input[formcontrolname="${formControlName}"] input`).first();
  await input.scrollIntoViewIfNeeded();
  await input.fill(value, { force: true });
  await input.dispatchEvent('ionInput');
  await input.dispatchEvent('ionChange');
  await input.blur();
}

/** Fill ion-textarea / native textarea below the fold on mobile. */
export async function fillTextarea(
  page: Page,
  selector: string,
  value: string
) {
  const field = page.locator(selector).first();
  await field.scrollIntoViewIfNeeded();
  await field.fill(value, { force: true });
  await field.evaluate((el) => {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

/** ion-select → pick option in alert → OK */
export async function selectIonPicker(
  page: Page,
  formControlName: string,
  optionText: RegExp | string
) {
  const select = page.locator(`ion-select[formcontrolname="${formControlName}"]`).first();
  await select.scrollIntoViewIfNeeded();
  await select.click({ force: true });

  const option =
    typeof optionText === 'string'
      ? page.getByRole('radio', { name: optionText, exact: true })
      : page
          .locator('ion-alert:not(.overlay-hidden) button[role="radio"]')
          .filter({ hasText: optionText });

  await expect(option.first()).toBeVisible({ timeout: 8000 });
  await option.first().click({ force: true });
  await page.getByRole('button', { name: 'OK' }).last().click({ force: true });
  await page.locator('ion-alert').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
}

/** Both date fields — direct input sync (stable on WebKit). */
export async function selectIncidentDates(page: Page) {
  const today = new Date();
  const isoDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (const inputId of ['#ej2-datepicker_0_input', '#ej2-datepicker_1_input']) {
    if ((await page.locator(inputId).count()) > 0) {
      await setInputValue(page, inputId, isoDate);
    }
  }
}

/** Time picker — popup on iOS; direct input on Android when popup differs. */
export async function selectTimeOption(page: Page, timeLabel: string) {
  const timeField = page
    .locator(
      'ejs-timepicker[formcontrolname="timeOfIncident"] input, [formcontrolname="timeOfIncident"] input, .e-time-wrapper input'
    )
    .first();

  await timeField.scrollIntoViewIfNeeded();
  const current = await timeField.inputValue().catch(() => '');
  if (current && (current === timeLabel || /12:30/i.test(current))) {
    return;
  }

  try {
    const icon = page.locator('.e-input-group-icon.e-time-icon, .e-time-icon').first();
    await icon.click({ force: true });
    await page.getByRole('option', { name: timeLabel }).click({ force: true, timeout: 5000 });
  } catch {
    await timeField.fill(timeLabel, { force: true });
    await timeField.evaluate((el) => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    });
  }
}

/** First ng-select on form */
export async function selectNgSelectFirstOption(page: Page, optionText: string) {
  await page.locator('.ng-arrow-wrapper').first().click({ force: true });
  await page.getByLabel('Options List').getByText(optionText, { exact: true }).click({ force: true });
}

/** Place(on site) typeahead */
export async function selectPlaceOnSite(
  page: Page,
  search: string,
  optionText?: string
) {
  const wrapper = page.locator('app-form-control-wrapper').filter({ hasText: 'Place(on site) :' });
  await wrapper.scrollIntoViewIfNeeded();
  const combobox = wrapper.getByRole('combobox');
  await combobox.click({ force: true }).catch(() => undefined);
  await combobox.fill(search);

  if (optionText) {
    await page.getByText(optionText, { exact: true }).click({ force: true });
  } else {
    const option = page
      .locator('ng-dropdown-panel .ng-option, [role="option"]')
      .filter({ hasText: new RegExp(search, 'i') })
      .first();
    await expect(option).toBeVisible({ timeout: 8000 });
    await option.click({ force: true });
  }
}

/** Visible upload — scroll to section and tap "Choose file..." before setInputFiles. */
export async function uploadAttachmentVisible(page: Page) {
  const section = page.getByText('Attach Photo / Receipt', { exact: false });
  await section.scrollIntoViewIfNeeded();

  const chooseFile = page.getByText('Choose file...', { exact: true });
  if (await chooseFile.isVisible().catch(() => false)) {
    await chooseFile.click({ force: true });
  }

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'incident_attachment.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    ),
  });
  await fileInput.dispatchEvent('change');
}

export async function fillRemedyNotes(page: Page, value: string) {
  const byControl = page.locator('ion-textarea[formcontrolname="remedy"] textarea');
  const byPlaceholder = page.getByPlaceholder('Remedy / Notes');
  const field = (await byControl.count()) > 0 ? byControl.first() : byPlaceholder.first();

  await field.scrollIntoViewIfNeeded({ timeout: 10000 });
  await field.fill(value, { force: true });
}

/** Hazard checklist */
export async function tapRecordedChecklists(page: Page) {
  const sectionRequired = page
    .locator('.requir-checkbox > .cursor-pointer > div > .md > .icon-inner > .s-ion-icon')
    .first();
  if (await sectionRequired.isVisible().catch(() => false)) {
    await sectionRequired.click({ force: true });
  }

  for (const label of [
    /^General Observations$/i,
    /^Slips, trips, and falls$/i,
    /^Section Required$/i,
  ]) {
    try {
      await tapChecklistByLabel(page, label);
    } catch {
      // optional row
    }
  }
}

export async function tapChecklistByLabel(
  page: Page,
  label: RegExp | string,
  index = 0
) {
  const text =
    typeof label === 'string'
      ? page.getByText(label, { exact: true })
      : page.getByText(label);

  const item = text.nth(index);
  await item.scrollIntoViewIfNeeded();

  const row = item.locator('..');
  const icon = row.locator('img, ion-icon, [role="img"]').first();
  if (await icon.isVisible().catch(() => false)) {
    await icon.click({ force: true });
  } else {
    await row.click({ force: true });
  }
}

/** HSSE signatures (optional — enable in spec when needed). */
export async function signHsseForm(page: Page) {
  const section = page.getByRole('heading', { name: /Signature Capture/i });
  if (await section.isVisible().catch(() => false)) {
    await section.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  const signButtons = page.getByRole('button', { name: 'Sign', exact: true });
  const count = await signButtons.count();
  let signed = 0;

  for (let i = 0; i < count; i++) {
    const btn = signButtons.nth(i);
    if (!(await btn.isVisible().catch(() => false))) continue;

    await btn.scrollIntoViewIfNeeded();
    await btn.click({ force: true });

    const pad = page.locator('ion-modal.show-modal canvas, ion-modal canvas').last();
    await expect(pad).toBeVisible({ timeout: 8000 });
    await drawSignatureStroke(page, pad);

    const modal = page.locator('ion-modal.show-modal').last();
    const confirm = modal.getByRole('button', { name: /save|done|ok|confirm|apply/i }).last();
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click({ force: true });
    }
    await modal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);
    signed++;
  }

  expect(signed, 'Expected at least one Sign button on the HSSE form').toBeGreaterThan(0);
}

async function drawSignatureStroke(page: Page, pad: Locator) {
  const box = await pad.boundingBox();
  if (!box || box.width < 80) return false;

  const y = box.y + box.height * 0.55;
  const x1 = box.x + box.width * 0.15;
  const x2 = box.x + box.width * 0.85;

  await pad.scrollIntoViewIfNeeded();
  await page.mouse.move(x1, y);
  await page.mouse.down();
  await page.mouse.move(x2, y - 4, { steps: 12 });
  await page.mouse.move(x2 - 24, y + 10, { steps: 6 });
  await page.mouse.up();
  return true;
}

export async function setInputValue(page: Page, selector: string, value: string) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.evaluate(
    ({ sel, val }) => {
      const el = document.querySelector(sel);
      if (el instanceof HTMLInputElement) {
        el.removeAttribute('readonly');
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    },
    { sel: selector, val: value }
  );
}
