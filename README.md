# JobSafe Native App — Test Automation

Automated end-to-end tests for the **JobSafe mobile app** (iOS / Android), built with
[MobileWright](https://www.npmjs.com/package/mobilewright) on the Playwright test runner and
organised with the Page Object Model (POM).

> **Looking for the deep reference?** This README is the setup & contribution guide.
> For the full feature matrix, test inventory, known issues, and technical decisions, see
> [`docs/native-test-automation.md`](docs/native-test-automation.md).

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [Installation & setup](#3-installation--setup)
4. [Environment configuration](#4-environment-configuration)
5. [Running the tests](#5-running-the-tests)
6. [Project structure](#6-project-structure)
7. [Page Object Model](#7-page-object-model)
8. [Adding a new test](#8-adding-a-new-test)
9. [Troubleshooting](#9-troubleshooting)
10. [Best practices & conventions](#10-best-practices--conventions)
11. [Known limitations & pending work](#11-known-limitations--pending-work)

---

## 1. Project overview

The JobSafe app is a **WebView (Ionic/Angular) app** shipped as a native APK / IPA
(`cloud.jobsafe.jobsafeapp`). This project drives the **real native build on a real device or
emulator** — not a browser — to validate the critical user journeys end to end:

- Login & authentication (validation, invalid credentials, navigation)
- Forgot password / reset password flows
- Admin home dashboard, sidebar, notifications, logout
- Reports list and **Near Miss** report creation (including signature capture)

MobileWright gives a Playwright-style API (`test`, `expect`, locators, `beforeEach`,
`test.step`, projects, retries, reporters) but injects a `screen` fixture (the device surface)
instead of a `page`.

> The repository also contains a **mobile-web** Playwright suite (`tests/*.spec.ts`, driven by
> `playwright.config.ts`). This README focuses on the **native** suite under `tests/native/`.
> The two are configured and run independently.

**Current native coverage:** 26 JobSafe test cases across 6 active specs, plus a sample-app
smoke test for toolchain validation. See the
[status matrix](docs/native-test-automation.md#3-implementation-status-by-feature).

---

## 2. Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js** | v18+ recommended (LTS). Needed for the runner and `ts-node`. |
| **npm** | The project ships a `package-lock.json`; use `npm` for reproducible installs. |
| **MobileWright** | Installed as a project dependency (`mobilewright`, `@mobilewright/test`, `@mobilewright/core`) plus the `mobilecli` device tool. No global install required. |
| **A test device** | One of: an **Android emulator/device**, or a **real iOS device** with the signed agent (see below). |
| **JobSafe build** | The `.apk` (Android) and/or the app installed on the device with a known bundle id (iOS). The JobSafe specs **skip** if no native target is configured. |
| **A JobSafe test account** | `USER_EMAIL` / `USER_PASSWORD` for a working account in the TST environment. |

### Android prerequisites
- Android SDK with `ANDROID_HOME` set, and a running emulator or a connected device.
- Verify your setup with `npm run native:doctor` and `npm run native:devices`.

### iOS prerequisites (real device)
- The on-device **WebDriverAgent / DeviceKit** runner must be installed and **code-signed** for
  the device, and the phone must be **unlocked** during runs.
- ⚠️ With a **free** Apple developer profile, signing **expires every 7 days** and only 3 apps
  may be installed at once. Renewal steps are documented in the project memory note
  `ios-real-device-agent-signing.md`. A **paid** Apple Developer account with a wildcard profile
  removes both constraints.
- Symptom of a lapsed agent: `timed out waiting for WebDriverAgent to be ready`.

---

## 3. Installation & setup

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd MobileWright-main

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
#   then edit .env (see section 4)

# 4. Verify the native toolchain & visible devices
npm run native:doctor
npm run native:devices
```

To validate the toolchain **without** the JobSafe build, run the sample-app smoke test against
a free public Android APK (auto-downloaded):

```bash
npm run native:test:sample
```

---

## 4. Environment configuration

Configuration is read from `.env` (gitignored) via `utils/native-env.ts`. Copy `.env.example`
and fill in the relevant keys.

| Variable | Required? | Purpose |
|---|---|---|
| `USER_EMAIL` | ✅ | JobSafe test account email |
| `USER_PASSWORD` | ✅ | JobSafe test account password |
| `IOS_BUNDLE_ID` | iOS | Enables the `jobsafe-ios` project (e.g. `cloud.jobsafe.jobsafeapp`) |
| `ANDROID_PACKAGE` | Android | Enables the `jobsafe-android` project |
| `ANDROID_APK_PATH` | optional | Auto-install the APK before running |
| `IOS_APP_PATH` | optional | Auto-install the IPA before running |
| `USER_NEW_PASSWORD` | manual flow | Reset-password happy path target; **must differ** from `USER_PASSWORD` |
| `USER_FIRST_NAME` | sidebar test | Expected display name (first) |
| `USER_LAST_NAME` | sidebar test | Expected display name (last) |
| `RUN_MANUAL` | manual flow | Set to `1` to enable the manual-input reset test |

> **Graceful skip:** the JobSafe native specs skip themselves unless `ANDROID_PACKAGE` **or**
> `IOS_BUNDLE_ID` is set, and throw a clear error in `beforeAll` if credentials are missing.
> Running with a partial `.env` is safe — you'll just see skips.

---

## 5. Running the tests

The native suite is driven by `mobilewright.config.ts` (separate from the web
`playwright.config.ts`). It runs **serially** (`workers: 1`) because a physical device hosts
only one automation session at a time.

### Common commands

```bash
# Health checks
npm run native:doctor          # toolchain diagnostics
npm run native:devices         # list connected devices/emulators

# JobSafe native suite — Android
npm run native:test:jobsafe

# JobSafe native suite — real iPhone (project-scoped)
npx mobilewright test -c mobilewright.config.ts --project jobsafe-ios --reporter=list

# Sample-app smoke test (no JobSafe build needed)
npm run native:test:sample          # short menu tour
npm run native:test:sample:full     # full tour

# View the last HTML report
npm run native:report
```

### Targeting specific tests

```bash
# A single spec file
npx mobilewright test -c mobilewright.config.ts --project jobsafe-ios \
  tests/native/jobsafe-login.spec.ts

# A single test by title (regex)
npx mobilewright test -c mobilewright.config.ts --project jobsafe-ios \
  --grep "reaches home"
```

### The manual reset-password flow

The reset-password happy path needs a human to read the emailed code and type it on the device.
It is skipped unless `RUN_MANUAL=1` and **cannot run in CI** (no interactive stdin):

```bash
RUN_MANUAL=1 npx mobilewright test -c mobilewright.config.ts \
  --project jobsafe-ios --grep "emailed code"
```

### Available projects

| Project | Runs | Enabled when |
|---|---|---|
| `sample-android` | `sample-*.spec.ts` | always |
| `jobsafe-android` | `jobsafe-*.spec.ts` | `ANDROID_PACKAGE` is set |
| `jobsafe-ios` | `jobsafe-*.spec.ts` | `IOS_BUNDLE_ID` is set |

---

## 6. Project structure

```
.
├── mobilewright.config.ts          # NATIVE runner config + projects (this suite)
├── playwright.config.ts            # web runner config (separate suite)
├── .env / .env.example             # environment configuration
├── docs/
│   └── native-test-automation.md   # full reference (feature matrix, issues, decisions)
├── utils/
│   └── native-env.ts               # loads & exposes env vars as `nativeEnv`
└── tests/
    └── native/                     # ← the native test suite
        ├── jobsafe-login.spec.ts
        ├── jobsafe-forgot-password.spec.ts
        ├── jobsafe-reset-password.spec.ts
        ├── jobsafe-near-miss-report.spec.ts
        ├── jobsafe-reports.spec.ts
        ├── jobsafe-admin-home-dashboard.spec.ts
        ├── jobsafe-hsse.spec.ts            # placeholder (commented out)
        ├── sample-api-demos.spec.ts        # sample-app smoke test
        │
        ├── pages/                  # Page Object Model — one class per screen/modal
        │   ├── loginPage.ts
        │   ├── forgotPasswordPage.ts
        │   ├── resetPasswordPage.ts
        │   ├── thankYouPage.ts
        │   ├── reportsPage.ts
        │   ├── reportTypeModal.ts
        │   ├── nearMissReportPage.ts
        │   ├── adminDashboardPage.ts
        │   └── components/
        │       └── needHelpModal.ts        # shared modal used by several screens
        │
        └── utils/                  # cross-page helpers
            ├── keyboard.ts         # dismissKeyboard()
            ├── scroll.ts           # scrollDownToReveal()
            ├── signature.ts        # drawSignature()
            ├── manual-input.ts     # waitForDeviceInput(), promptManualInput()
            └── test-data.ts        # invalidCreds, uniqueTitle()
```

| Folder | What it holds |
|---|---|
| `tests/native/` | The spec files — one per feature/module. Specs contain **test logic only**. |
| `tests/native/pages/` | Page objects — all locators and interactions for each screen. |
| `tests/native/pages/components/` | Reusable UI pieces shared across screens (e.g. the Need Help modal). |
| `tests/native/utils/` | Stateless helpers (keyboard, scroll, signature, manual input, test data). |
| `utils/native-env.ts` | Central env loader exposing the typed `nativeEnv` object. |
| `docs/` | Long-form documentation. |

---

## 7. Page Object Model

Every screen and modal is a class under `tests/native/pages/`. **Specs never touch raw
locators** — they call page-object methods. This keeps tests readable and isolates locator
churn in one place.

### Anatomy of a page object

```ts
import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';
import { dismissKeyboard } from '../utils/keyboard';

/** The login screen — the app's launch screen while logged out. */
export class LoginPage {
  readonly screen: Screen;
  readonly email: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(screen: Screen) {
    this.screen = screen;
    this.email = screen.getByPlaceholder('Email');
    this.password = screen.getByPlaceholder('Choose a password');
    this.loginButton = screen.getByRole('button', { name: 'Login' });
  }

  // ─── Actions ───────────────────────────────────────────────────
  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await dismissKeyboard(this.screen);   // keyboard overlaps the submit button
    await this.loginButton.tap();
  }

  // ─── Assertions ────────────────────────────────────────────────
  async expectReachedHome(timeout = 30_000) {
    await expect(this.screen.getByText(/My Reports/i).first()).toBeVisible({ timeout });
  }
}
```

### Conventions

- **Constructor** takes `screen: Screen`; all `readonly` Locator fields are initialised there.
- Locator fields are grouped by area with `//` comment dividers.
- Methods are split under `// ─── Actions ───` and `// ─── Assertions ───` headers.
- **Actions** use verbs (`fill*`, `tap*`, `open*`, `submit`); **assertions** are `expect*()`.
- **Timeouts** use numeric separators (`10_000`, `60_000`); add a tunable `timeout =` default
  on flows that round-trip to the server.
- **JSDoc** on every class, and on any non-obvious (positional/coordinate) locator — cite the
  view-tree position it was derived from.
- **Shared modals** live in `pages/components/`. The *open* action stays on the page that
  opens it; the modal owns its `expectOpen()`.

### Locator strategy (text-first)

The app is a WebView with few stable accessibility labels, so prefer in this order:

1. `getByText(/regex/i)` / `getByPlaceholder(...)` / `getByRole(...)` / `getByLabel(...)`
2. Positional fallback: `getByType('TextField').nth(n)` — **document the index**.
3. Coordinate tap: `screen.tap(x, y)` — last resort for node-less/icon-only controls
   (e.g. the Reports "+" FAB, the signature canvas). **Document the measured coordinate.**

---

## 8. Adding a new test

### On an existing screen

1. Add an action and/or `expect*()` method to the relevant page object — never put raw
   locators in the spec.
2. Add a `test(...)` block that delegates to the page object.
3. If the new check **shares an expensive navigation** with existing checks, fold it into the
   existing grouped test as a new `test.step()` rather than re-navigating from scratch.

### A new screen / feature

1. **Create the page object** at `tests/native/pages/<feature>Page.ts` following the template
   in §7. Find stable locators from an on-device view-tree dump (`viewTree: 'on-failure'`
   captures one on failure). Prefer text; document any positional/coordinate locator.
2. **Reuse `pages/components/`** modals instead of re-implementing them.
3. **Create the spec** `tests/native/jobsafe-<feature>.spec.ts`, mirroring an existing one:

```ts
import { test } from '@mobilewright/test';
import { nativeEnv } from '../../utils/native-env';
import { LoginPage } from './pages/loginPage';
import { AdminDashboardPage } from './pages/adminDashboardPage';

const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle);

test.describe('JobSafe native — <Feature>', () => {
  test.skip(!hasNativeApp, 'Set ANDROID_PACKAGE or IOS_BUNDLE_ID when you have the APK/IPA');

  test.beforeAll(() => {
    if (!nativeEnv.email || !nativeEnv.password) {
      throw new Error('Set USER_EMAIL and USER_PASSWORD in .env');
    }
  });

  // Log in ONCE — the app keeps the session across tests.
  test.beforeEach(async ({ screen }) => {
    const login = new LoginPage(screen);
    if (await login.isShowing()) {
      await login.login(nativeEnv.email, nativeEnv.password);
      await new AdminDashboardPage(screen).expectLoaded();
    }
    // ...navigate to your feature's screen...
  });

  test('<does the thing>', async ({ screen }) => {
    // delegate to your page object
  });
});
```

4. **Mind ordering** for tests that change session/global state (put logout last; run
   invalid-login before a successful one).
5. **Use `uniqueTitle()`** for any record you create, then assert it back in the list.
6. Run it project-scoped and iterate against the view-tree dumps until locators are stable.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| All JobSafe tests **skipped** | No native target configured | Set `ANDROID_PACKAGE` or `IOS_BUNDLE_ID` in `.env` |
| `beforeAll` throws "Set USER_EMAIL…" | Missing credentials | Fill `USER_EMAIL` / `USER_PASSWORD` |
| `timed out waiting for WebDriverAgent to be ready` (iOS) | Agent not installed / **free signing expired** (7-day) | Reinstall & re-sign the agent (see `ios-real-device-agent-signing.md`); unlock the phone |
| `bind: address already in use` / `launchApp` hangs | Multiple sessions on one device | Run serially (`workers: 1` — already the default); don't start a second run |
| `MIInstallerErrorDomain Code 13` (iOS) | Free-profile 3-app install cap reached | Remove a throwaway app from the device |
| A tap "misses" a control on a long form | WebView reports **viewport-relative** bounds | Use the scroll-then-tap helpers (`tapWhenInView` / `centreInView` in `NearMissReportPage`) |
| `scrollDownToReveal` does nothing | `isVisible()` is always true in this WebView | Swipe manually until the live bounding box is in band (already done in helpers) |
| A follow-up tap lands on a keyboard key | iOS keyboard overlaps lower fields | Call `dismissKeyboard(screen)` after filling |
| Flaky late-test stall in a long run | On-device agent degradation (memory/Jetsam) | Already mitigated by `retries: 2` (relaunches the app) |
| Coordinate tap (FAB/signature) misses on a new device | Hard-coded iPhone geometry | Re-measure from a view-tree dump for the new device/layout |
| Device not detected | SDK/agent setup | Run `npm run native:doctor` and `npm run native:devices` |

---

## 10. Best practices & conventions

- **Keep specs thin.** Test logic only — all locators and interactions belong in page objects.
- **Text-first locators.** Prefer visible text/roles/labels; use positional or coordinate
  locators only as a documented fallback.
- **Document fragile locators.** Any `nth(n)` or coordinate tap must carry a comment citing the
  view-tree position/measurement it came from, and a note to re-measure on layout/device change.
- **Log in once.** Reuse the persisted session (`login.isShowing()` guard) instead of logging
  in per test.
- **Mind test order.** Tests that mutate global/session state (login/logout) must be ordered
  deliberately — the suite is serial by design.
- **Amortise expensive navigation** with `test.step()` — group checks that act on the same
  freshly-reached screen into one test instead of re-navigating each time.
- **Dismiss the keyboard** before taps that follow a text fill.
- **Unique data.** Use `uniqueTitle()` for created records so you can find them again.
- **Assert outcomes, not no-ops.** e.g. signing asserts the button flips to "Re-sign" so an
  empty draw can't pass silently.
- **Numeric-separator timeouts** and tunable `timeout =` defaults for server round-trips.
- **Gate environment-dependent tests** (`RUN_MANUAL`, name checks) so the default run stays
  CI-safe.

---

## 11. Known limitations & pending work

**Limitations**
- **Serial only** — one device session at a time; the full suite is slow and can't parallelise.
- **iOS free signing** — agent must be re-signed every 7 days; 3-app install cap.
- **WebView quirks** — viewport-relative bounds, always-true `isVisible()`, a node-less
  signature canvas, and icon-only controls force scroll-then-tap and coordinate workarounds.
- **Hard-coded iPhone geometry** — the "+" FAB coordinate and signature band are measured for
  iPhone 390×844 pt and must be re-measured for Android or other devices.
- **Manual reset flow** — the reset-password happy path needs human input and can't run in CI.

**Pending work** (see the [full gap list](docs/native-test-automation.md#4-remaining-test-cases--features-to-automate))
- Implement the **HSSE report** flow (`jobsafe-hsse.spec.ts` is currently commented out).
- Automate **Incident** / **Other** report types.
- Expand **Reports** coverage beyond the empty state (populated list, filtering, archiving).
- Automate the reset-password code via a **test mailbox** to remove the manual step / enable CI.
- **Android parity** run + externalised per-device geometry.
- **CI integration** (e.g. cloud devices) for unattended runs.

---

## Further reading

- [`docs/native-test-automation.md`](docs/native-test-automation.md) — full reference: feature
  matrix, per-spec test inventory, status, known issues, technical decisions, and appendices.
- MobileWright on npm: <https://www.npmjs.com/package/mobilewright>
