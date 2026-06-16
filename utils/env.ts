import * as dotenv from 'dotenv';
dotenv.config();

const appOrigin =
  process.env.BASE_URL?.replace(/\/login\/?$/, '') ??
  'https://app.tst.jobsafe.cloud';

export const env = {
  baseUrl: process.env.BASE_URL ?? `${appOrigin}/login`,
  homeUrl: `${appOrigin}/app/home`,
  incidentReportsUrl: `${appOrigin}/app/settings/incident-reports`,
  email: process.env.USER_EMAIL!,
  password: process.env.USER_PASSWORD!
};

