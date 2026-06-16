import type { Page } from '@playwright/test';
import { hsseForm } from './test-data';
import { formStep } from './step';
import {
  fillIonInput,
  fillTextarea,
  selectIonPicker,
  selectIncidentDates,
  selectTimeOption,
  selectNgSelectFirstOption,
  selectPlaceOnSite,
  uploadAttachmentVisible,
  fillRemedyNotes,
  tapRecordedChecklists,
} from './form';

type FormData = typeof hsseForm;

/** Fill the HSSE report form — each field is a labelled, visible step in demo mode. */
export async function fillHsseForm(page: Page, data: FormData = hsseForm) {
  await formStep(page, 'Wait for form', async () => {
    await page.waitForSelector('ion-input[formcontrolname="title"]', {
      state: 'visible',
      timeout: 15000,
    });
  });

  await formStep(page, 'Incident dates', () => selectIncidentDates(page));
  await formStep(page, 'Incident time', () => selectTimeOption(page, data.time));
  await formStep(page, 'Reporter', () => selectNgSelectFirstOption(page, data.reporter));
  await formStep(page, 'Incident type', () => selectIonPicker(page, 'incidentType', data.incidentType));
  await formStep(page, 'Title', () => fillIonInput(page, 'title', data.title));
  await formStep(page, 'Description', () =>
    fillTextarea(page, 'ion-textarea[formcontrolname="description"] textarea', data.description)
  );
  await formStep(page, 'Severity', () => selectIonPicker(page, 'severityLevel', data.severity));
  await formStep(page, 'First aid', () => selectIonPicker(page, 'firstAid', data.firstAid));
  await formStep(page, 'Emergency services', () =>
    selectIonPicker(page, 'emergencyServices', data.emergency).catch(() =>
      selectIonPicker(page, 'emergencyService', data.emergency)
    )
  );
  await formStep(page, 'Responder name', () => fillIonInput(page, 'responderName', data.responder));
  await formStep(page, 'Tel number', () => fillIonInput(page, 'telNumber', data.tel));
  await formStep(page, 'Place (on site)', () => selectPlaceOnSite(page, data.placeSearch, data.placeOption));
  await formStep(page, 'Attach photo', () => uploadAttachmentVisible(page));
  await formStep(page, 'Remedy / notes', () => fillRemedyNotes(page, data.remedy).catch(() => undefined));
  await formStep(page, 'Hazard checklists', () => tapRecordedChecklists(page));
}
