# JobSafe Native App — Test Automation Documentation

> Engineering reference for the native (iOS / Android) automated test suite of the
> JobSafe mobile app. Covers the framework, what is automated, current status, gaps,
> known issues, technical decisions, project structure, and how to run/extend the suite.

| Field | Value |
|---|---|
| **App under test** | JobSafe mobile app (`cloud.jobsafe.jobsafeapp`) — a WebView (Ionic/Angular) app shipped as a native APK / IPA |
| **Framework** | [MobileWright](https://www.npmjs.com/package/mobilewright) (`mobilewright`, `@mobilewright/test`, `@mobilewright/core`) on the Playwright test runner |
| **Test directory** | `tests/native/` |
| **Config** | `mobilewright.config.ts` (native) — separate from `playwright.config.ts` (web) |
| **Pattern** | Page Object Model (POM) |
| **Languages** | TypeScript |
| **Primary device** | `Ideveloper's iPhone` (real iPhone 13,2, iOS) — Android emulator also supported |
| **Doc owner** | QA / Automation |
| **Last updated** | 2026-06-29 |

---

## 1. Overview of the native automation framework

### 1.1 What MobileWright is

MobileWright is a mobile-native automation framework that runs on top of the Playwright
test runner. It gives you a Playwright-style API (`test`, `expect`, locators, `beforeEach`,
`test.step`, projects, retries, reporters) but drives a **real device or emulator** instead
of a browser. The fixture injected into each test is a `screen` object (the device surface),
not a `page`.

Because the JobSafe app is a **WebView app** (Ionic/Angular wrapped natively), the element
tree exposed to automation is a hybrid of native accessibility nodes and web content. This
shapes almost every technical decision in this suite (see §6).

### 1.2 Locator model

Locators are created from the `screen` fixture and resolve against the live device view tree:

| Locator | Use |
|---|---|
| `screen.getByText(/regex/i)` | Visible text / labels (the most reliable handle in this app) |
| `screen.getByPlaceholder('Email')` | Input fields by placeholder |
| `screen.getByRole('button', { name: 'Login' })` | Labelled buttons |
| `screen.getByLabel('employee signature')` | Accessibility-labelled elements |
| `screen.getByType('TextField').nth(n)` | Positional fallback for unlabelled inputs |
| `screen.tap(x, y)` | Raw coordinate tap — last resort for node-less / icon-only controls |

### 1.3 Execution model

- **Serial only.** A physical device hosts exactly one automation session at a time.
  Multiple workers collide on the lockdown tunnel port (`bind: address already in use`)
  and `launchApp` hangs. Native tests run with `workers: 1`, `fullyParallel: false`.
- **Session persistence.** A successful login persists across app relaunches, so most
  specs log in **once** (guarded by `login.isShowing()`) and reuse the session for the
  rest of the file. Test *order* therefore matters (see §6.3).
- **Retries.** JobSafe native projects use `retries: 2` because over a long serial run the
  on-device agent can degrade (iOS memory pressure / Jetsam), stalling a later test's
  `beforeEach`. A retry relaunches the app fresh and almost always clears the transient stall.
- **View tree on failure.** `viewTree: 'on-failure'` dumps the element tree when a test
  fails, which is the primary debugging aid for locator drift.

### 1.4 Config summary (`mobilewright.config.ts`)

| Setting | Value | Reason |
|---|---|---|
| `testDir` | `tests/native` | Native specs only |
| `timeout` | `90_000` | Long WebView loads + server round-trips |
| `actionTimeout` | `10_000` | Per-action ceiling |
| `workers` | `1` | One device session at a time |
| `fullyParallel` | `false` | Serial execution |
| `viewTree` | `on-failure` | Debugging |
| `reporter` | `list` | Console-friendly |

Three projects are defined, each gated on env vars so the suite degrades gracefully when a
target isn't configured:

| Project | `testMatch` | Enabled when | Platform |
|---|---|---|---|
| `sample-android` | `sample-*.spec.ts` | always | Android (ApiDemos sample APK) |
| `jobsafe-android` | `jobsafe-*.spec.ts` | `ANDROID_PACKAGE` set | Android |
| `jobsafe-ios` | `jobsafe-*.spec.ts` | `IOS_BUNDLE_ID` set | iOS (real device) |

---

## 2. Implemented test cases by feature

All JobSafe native specs skip themselves (`test.skip`) unless `ANDROID_PACKAGE` or
`IOS_BUNDLE_ID` is set, and assert `USER_EMAIL` / `USER_PASSWORD` exist in `beforeAll`.

### 2.1 Login — `jobsafe-login.spec.ts`

| # | Test | What it verifies |
|---|---|---|
| 1 | Login screen elements are visible | Email, password, Login button, Forgot-password link, "Login" heading render |
| 2 | Rejects invalid credentials, stays on login | Wrong creds → "Incorrect username or password", never reaches home. *Runs first on purpose* (before a successful login persists a session) |
| 3 | Email & password required validation | Empty submit shows "Email is required!" / "Password is required!" |
| 4 | Email format validation | `invalid-email` → "Email is invalid!" |
| 5 | Forgot-password link navigates | Lands on the Forgot Password screen |
| 6 | Need Help button opens help modal | Opens the shared Need Help modal |
| 7 | Valid login reaches home | Correct creds → home ("My Reports" visible) |

### 2.2 Forgot Password — `jobsafe-forgot-password.spec.ts`

`beforeEach` navigates login → Forgot Password.

| # | Test | What it verifies |
|---|---|---|
| 1 | Forgot Password screen (grouped, 3 `test.step`s) | (a) empty email → required error; (b) invalid format → invalid error; (c) Need Help opens modal |
| 2 | "Go back to login" button | Returns to login |
| 3 | Back-arrow button | Returns to login |
| 4 | Thank you screen (grouped, 2 `test.step`s) | Valid email → "Thank you!" confirmation; "No Email received?" opens the Need Help modal |

### 2.3 Reset / Change Password — `jobsafe-reset-password.spec.ts`

`beforeEach` navigates login → Forgot Password → request code → Thank you → Change Password.

| # | Test | What it verifies |
|---|---|---|
| 1 | Reset screen elements visible | Code, New/Confirm password, Reset Now render |
| 2 | "Still need help?" opens modal | Opens the Need Help modal |
| 3 | Form validation (grouped, 5 `test.step`s) | Required errors; every password-rule error on a weak password; rules clear on a valid password; matching confirm = no mismatch; mismatched confirm = mismatch error |
| 4 | Wrong-code screen (grouped, multi-step) | Bad code → error screen; Need help opens modal; "Try again" returns to reset screen; "Request another code" returns to Forgot Password |
| 5 | Reset succeeds with a real emailed code | **Manual, gated behind `RUN_MANUAL=1`.** Resets to `USER_NEW_PASSWORD`, then proves old password fails and new password logs in. Pauses for you to type the emailed code on-device |

### 2.4 Near Miss report — `jobsafe-near-miss-report.spec.ts`

`beforeEach` logs in (once) → My Reports → "+" FAB → confirm picker opened → select Near Miss.

| # | Test | What it verifies |
|---|---|---|
| 1 | Form opens, validates, saves a draft (grouped, 4 `test.step`s) | Form loads; required text fields show validation when emptied; tapping Save with empty required fields shows 4 validation errors; then fill + auto-sign Employee signature + **Save as draft**, and confirm the titled report appears in the Reports list |
| 2 | Create + Save and send | Fill + auto-sign + **Save and send** → "sent successfully" → report appears in the list |

### 2.5 Reports list — `jobsafe-reports.spec.ts`

`beforeEach` logs in (once) → My Reports.

| # | Test | What it verifies |
|---|---|---|
| 1 | Reports page empty state | "No reports found" shows (valid for an account with no reports) |

### 2.6 Admin Home / Dashboard — `jobsafe-admin-home-dashboard.spec.ts`

`beforeEach` logs in once (skips if already on home).

| # | Test | What it verifies |
|---|---|---|
| 1 | Dashboard elements visible | Tab bar + summary widgets (Today/This week/This month, Overdue Actions, Incidents this week, Days since last report) and the below-the-fold widgets after scrolling |
| 2 | Sidebar items visible | All 11 sidebar menu items render |
| 3 | Sidebar opens and closes | Hamburger toggles the drawer open/closed |
| 4 | Sidebar shows user name | Top of drawer matches `USER_FIRST_NAME USER_LAST_NAME` |
| 5 | Support link opens help modal | Opens the Need Help modal |
| 6 | Notifications bell opens modal | "Your notifications" modal opens |
| 7 | Logout | Logout returns to the login screen. *Runs last* (drops the session) |

### 2.7 Sample app — `sample-api-demos.spec.ts`

Not a JobSafe test. A self-contained smoke test of the public Android **ApiDemos** APK, used
to validate the toolchain/device setup without needing the real JobSafe build. Tours the
menu (Animation → App → Content → Media → View, optionally Graphics/Text). Scales by env
flags (`NATIVE_FULL`, `NATIVE_EXTENDED`, `NATIVE_DEMO`).

### 2.8 Test count summary

| Spec | Active `test()` blocks | Notes |
|---|---|---|
| `jobsafe-login` | 7 | |
| `jobsafe-forgot-password` | 4 | 2 are multi-step groupings |
| `jobsafe-reset-password` | 5 | 1 manual-gated |
| `jobsafe-near-miss-report` | 2 | |
| `jobsafe-reports` | 1 | |
| `jobsafe-admin-home-dashboard` | 7 | |
| `jobsafe-hsse` | 0 | **fully commented out** |
| `sample-api-demos` | 1 | sample app, not JobSafe |
| **Total JobSafe** | **26** | |

---

## 3. Implementation status by feature

| Feature / module | Status | Notes |
|---|---|---|
| Login (elements, validation, invalid creds, navigation, help) | ✅ Complete | |
| Forgot Password (validation, navigation, thank-you) | ✅ Complete | |
| Reset Password (validation, wrong-code recovery) | ✅ Complete | Happy path is manual-gated |
| Reset Password happy path (real emailed code) | ⚠️ Manual only | Gated behind `RUN_MANUAL=1`; needs a human to type the emailed code |
| Admin Home / Dashboard + sidebar + notifications + logout | ✅ Complete | |
| Reports list (empty state) | ✅ Partial | Only the empty state is asserted |
| Near Miss report (draft + save-and-send, auto signature) | ✅ Complete | Most complex flow; relies on coordinate taps + canvas drawing |
| HSSE report | ❌ Not implemented | Spec exists but is **entirely commented out** (§4) |
| Incident / Other report types | ❌ Not implemented | Report-type picker recognises them; no creation flow automated |
| Sample app smoke (ApiDemos) | ✅ Complete | Toolchain validation only |

Legend: ✅ done · ⚠️ partial/conditional · ❌ not started

---

## 4. Remaining test cases / features to automate

| Area | Gap | Suggested priority |
|---|---|---|
| **HSSE report creation** | `jobsafe-hsse.spec.ts` is fully commented out. Needs an `HSSEReportPage` POM and an active spec, mirroring the Near Miss pattern | High |
| **Incident report creation** | The report-type picker exposes "Incident"; no creation flow is automated | Medium |
| **"Other" report creation** | Same as above for the "Other" type | Low |
| **Reports list — populated state** | Only the empty state is covered. Add filtering, opening a report, archiving | Medium |
| **Reset Password happy path in CI** | Currently manual (`RUN_MANUAL=1`). Needs a mailbox API / test inbox to fetch the emailed code automatically | Medium |
| **Documents tab** | Tab exists in the bottom nav; no tests | Low |
| **SOS flow** | SOS tab exists; not exercised on native (only on web) | Low |
| **Signup / free trial** | Covered on web, not on native | Low |
| **Android parity run** | Specs are device-agnostic but tuned/verified on iPhone; coordinate constants (FAB, signature band) need re-measuring for Android | Medium |
| **Profile / settings, Analytics, User Management** | Sidebar items are asserted visible but their destinations aren't tested | Low |

---

## 5. Known issues, limitations, and blockers

### 5.1 Device / signing (iOS real device)

- **7-day free-signing expiry.** The on-device WebDriverAgent/DeviceKit runner is signed with
  a **free** Apple developer profile that expires every 7 days. When it lapses, runs fail with
  `timed out waiting for WebDriverAgent to be ready`. Renewal procedure is documented in the
  project memory note `ios-real-device-agent-signing.md`. A **paid** Apple Developer account
  with a wildcard profile removes both the 7-day expiry and the bundle-id-matching requirement.
- **3-app install cap.** The free profile allows only 3 apps installed at once
  (`MIInstallerErrorDomain Code 13`).
- **Phone must be unlocked** during runs; the runner agent version must match what `mobilecli`
  expects.

### 5.2 WebView-specific limitations

- **Viewport-relative bounds.** Element bounds are reported relative to the current viewport,
  not the document. A control below the fold reports an off-screen `y`, so a naive `.tap()`
  misses. Worked around in `NearMissReportPage` with custom `tapWhenInView` / `centreInView`
  scroll-then-tap helpers.
- **`isVisible()` is always true** in this WebView, so the built-in `scrollDownToReveal`
  no-ops and `scrollIntoViewIfNeeded` mis-picks its swipe direction on long forms. We scroll
  manually by swiping up until the live bounding box sits inside a target band.
- **Node-less canvas.** The signature pad exposes no accessibility node — it can only be drawn
  on by raw coordinates (`drawSignature`).
- **Icon-only controls.** The Reports "+" FAB, the report-type modal close (X), and some header
  icons have no text/label. The FAB is tapped by a hard-coded coordinate; the modal X locator
  is still unconfirmed.

### 5.3 Serial-run fragility

- Only one device session at a time → no parallelism → the full suite is slow.
- Over a long serial run the on-device agent can degrade (memory pressure / Jetsam), stalling a
  later `beforeEach`. Mitigated with `retries: 2` (a retry relaunches the app fresh).

### 5.4 Manual-input dependency

- The reset-password happy path needs a human to read the emailed code and type it on the
  device. It is skipped unless `RUN_MANUAL=1` and **cannot run in CI** (no interactive stdin,
  no mailbox access).

### 5.5 Hard-coded device geometry

- The "+" FAB coordinate `(342, 705)` and the signature canvas band are measured from an
  iPhone 390×844 pt view-tree dump. **They must be re-measured** if the layout or target device
  changes (e.g. an Android run or a different iPhone size).

---

## 6. Assumptions, workarounds & technical decisions

### 6.1 Page Object Model

Every screen/modal is a class under `tests/native/pages/`. Specs contain only test logic;
all locators and interactions live in page objects. This keeps tests readable and absorbs
locator churn in one place.

### 6.2 Text-first locators

The app is a WebView with few stable accessibility labels, so **visible text (regex)** is the
most reliable handle and is used wherever possible. Positional (`getByType(...).nth(n)`) and
coordinate locators are deliberate fallbacks, each documented inline with the view-tree
position they were derived from.

### 6.3 Login once + ordered tests

The app persists the session across relaunches, so specs log in once (guarded by
`login.isShowing()`) rather than per test. Consequences encoded as deliberate ordering:

- **Login spec:** the invalid-credentials test runs **first** (while still logged out); the
  valid-login test runs last.
- **Dashboard spec:** logout runs **last** (it drops the session).

### 6.4 `test.step` to amortise expensive navigation

Reaching deep screens (e.g. the Near Miss form, or the wrong-code error screen) is expensive.
Where several checks act on the *same* freshly-reached screen, they're folded into **one test**
with labelled `test.step()` blocks instead of re-navigating from zero each time. This was a
specific optimisation applied to the Forgot Password, Reset Password, and Near Miss specs to
cut run time while keeping each assertion individually labelled in the report.

### 6.5 `dismissKeyboard` before taps

The iOS keyboard overlaps lower fields and submit buttons. Every fill is followed by
`dismissKeyboard(screen)` (a tap on the non-interactive logo band at `195,150`) so a follow-up
tap doesn't land on a keyboard key.

### 6.6 Automated signature capture

`signEmployeeSignature()` scrolls the Sign button to centre, opens the canvas modal, draws a
few coordinate strokes (`drawSignature`), confirms with DONE, and asserts the button flips to
"Re-sign" — so a no-op draw can't pass silently.

### 6.7 Graceful skip / env gating

- No native app configured (`ANDROID_PACKAGE` / `IOS_BUNDLE_ID` unset) → whole describe skips.
- Missing `USER_EMAIL` / `USER_PASSWORD` → `beforeAll` throws a clear message.
- Manual-input tests gated behind `RUN_MANUAL=1`.
- Sidebar-name test requires `USER_FIRST_NAME` / `USER_LAST_NAME`.

### 6.8 Unique titles for created records

`uniqueTitle()` stamps each created report with a `YYYY-MM-DD HH:MM:SS` suffix so the test can
locate the exact record it just created in the Reports list.

---

## 7. Project structure & POM organisation

```
tests/native/
├── jobsafe-login.spec.ts                 # specs: one per feature/module
├── jobsafe-forgot-password.spec.ts
├── jobsafe-reset-password.spec.ts
├── jobsafe-near-miss-report.spec.ts
├── jobsafe-reports.spec.ts
├── jobsafe-admin-home-dashboard.spec.ts
├── jobsafe-hsse.spec.ts                  # commented-out placeholder
├── sample-api-demos.spec.ts              # sample-app smoke test
│
├── pages/                                # Page Object Model
│   ├── loginPage.ts
│   ├── forgotPasswordPage.ts
│   ├── resetPasswordPage.ts
│   ├── thankYouPage.ts
│   ├── reportsPage.ts
│   ├── reportTypeModal.ts                # the "+" report-type picker
│   ├── nearMissReportPage.ts
│   ├── adminDashboardPage.ts             # home + sidebar + notifications
│   └── components/
│       └── needHelpModal.ts              # shared modal (appears on many screens)
│
└── utils/                                # cross-page helpers
    ├── keyboard.ts                       # dismissKeyboard()
    ├── scroll.ts                         # scrollDownToReveal()
    ├── signature.ts                      # drawSignature()
    ├── manual-input.ts                   # waitForDeviceInput(), promptManualInput()
    └── test-data.ts                      # invalidCreds, uniqueTitle()

mobilewright.config.ts                    # native runner config + projects
utils/native-env.ts                       # env var loader (nativeEnv)
.env                                       # secrets/config (gitignored); see .env.example
```

### 7.1 Page object conventions

Every page object follows the same shape (use `loginPage.ts` as the template):

```ts
import { expect } from '@mobilewright/test';
import type { Screen, Locator } from '@mobilewright/core';

/** JSDoc describing the screen and how it's reached. */
export class LoginPage {
  readonly screen: Screen;
  readonly email: Locator;          // readonly Locator fields, grouped with // dividers
  // ...

  constructor(screen: Screen) {     // always constructed from the screen fixture
    this.screen = screen;
    this.email = screen.getByPlaceholder('Email');
    // ...
  }

  // ─── Actions ───────────────────────────────────────────────────
  async login(email: string, password: string) { /* verbs: tap, fill, open, submit */ }

  // ─── Assertions ────────────────────────────────────────────────
  async expectLoaded() { /* expect*() methods own the assertions */ }
}
```

Conventions:
- **Constructor** takes `screen: Screen`; all locators initialised there.
- **`readonly` Locator fields**, grouped by area with `//` comment dividers.
- **`// ─── Actions ───` / `// ─── Assertions ───`** section headers.
- Action methods use verbs (`fill*`, `tap*`, `open*`, `submit`); assertions are `expect*()`.
- **Numeric-separator timeouts** (`10_000`, `60_000`); tunable `timeout =` defaults where a
  flow round-trips to the server.
- **JSDoc** on every class (and on any non-obvious locator/coordinate, citing the view-tree
  position it came from).
- **Shared modals** live in `pages/components/`; the *open* action stays on each page, the
  modal owns `expectOpen()`.
- **Utilities** are named arrow-function exports under `utils/`.

---

## 8. Running the tests

### 8.1 Prerequisites

1. Node dependencies: `npm install`.
2. A target device:
   - **iOS real device** — the DeviceKit agent installed & signed (see the memory note
     `ios-real-device-agent-signing.md`; free signing expires every 7 days). Phone unlocked.
   - **Android** — an emulator or device with `ANDROID_HOME` set. Verify with
     `npm run native:doctor`.
3. A `.env` file (copy `.env.example`). Relevant keys:

| Env var | Purpose |
|---|---|
| `USER_EMAIL`, `USER_PASSWORD` | Test account credentials (required) |
| `IOS_BUNDLE_ID` | Enables the `jobsafe-ios` project (`cloud.jobsafe.jobsafeapp`) |
| `ANDROID_PACKAGE` | Enables the `jobsafe-android` project |
| `ANDROID_APK_PATH` / `IOS_APP_PATH` | Optional — auto-install the build before running |
| `USER_NEW_PASSWORD` | Required for the manual reset happy path; must differ from `USER_PASSWORD` |
| `USER_FIRST_NAME`, `USER_LAST_NAME` | Required for the sidebar user-name test |
| `RUN_MANUAL=1` | Opt-in for the manual-input reset test |

### 8.2 Commands

```bash
# Health check the native toolchain / devices
npm run native:doctor
npm run native:devices

# Run the JobSafe native suite on Android
npm run native:test:jobsafe

# Run on the real iPhone (project-scoped)
npx mobilewright test -c mobilewright.config.ts --project jobsafe-ios --reporter=list

# Run a single spec or a single test by title
npx mobilewright test -c mobilewright.config.ts --project jobsafe-ios \
  tests/native/jobsafe-login.spec.ts
npx mobilewright test -c mobilewright.config.ts --project jobsafe-ios \
  --grep "reaches home"

# Manual reset-password happy path (pauses for the emailed code)
RUN_MANUAL=1 npx mobilewright test -c mobilewright.config.ts \
  --project jobsafe-ios --grep "emailed code"

# Sample-app smoke test (no JobSafe build needed)
npm run native:test:sample          # short tour
npm run native:test:sample:full     # full tour

# View the last report
npm run native:report
```

> The JobSafe specs **skip themselves** if neither `ANDROID_PACKAGE` nor `IOS_BUNDLE_ID` is set,
> so running with an incomplete `.env` is safe — it just reports skips.

---

## 9. Adding a new test

### 9.1 New test on an existing screen

1. Add an action and/or `expect*()` method to the relevant page object — never put raw
   locators in the spec.
2. Add a `test(...)` to the spec, delegating to the page object.
3. If the new check shares an expensive navigation with existing checks, fold it into the
   existing grouped test as a new `test.step()` rather than re-navigating.

### 9.2 New screen / feature (e.g. HSSE)

1. **Create the page object** under `tests/native/pages/<feature>Page.ts` following the
   template in §7.1. Dump the on-device view tree (run a throwaway test and let
   `viewTree: 'on-failure'` capture it, or use MobileWright's inspector) to find stable
   locators. Prefer text; document any positional/coordinate locator with the dump position.
2. **Reuse `pages/components/` modals** (e.g. `NeedHelpModal`) rather than re-implementing.
3. **Create the spec** `tests/native/jobsafe-<feature>.spec.ts` mirroring an existing one:
   - `import { test } from '@mobilewright/test'` and `nativeEnv`.
   - `const hasNativeApp = Boolean(nativeEnv.androidPackage || nativeEnv.iosBundle)`.
   - Describe-level `test.skip(!hasNativeApp, ...)`.
   - `beforeAll` asserting credentials; `beforeEach` for shared navigation (log in once via
     `login.isShowing()`).
4. **Mind ordering** for any test that changes session/global state (login/logout).
5. **Use `uniqueTitle()`** for any record you create, and assert it back in the list.
6. Run it project-scoped and iterate against the view-tree dumps until locators are stable.

---

## 10. Recommendations for future improvements

1. **Implement the HSSE report flow** — un-comment/rebuild `jobsafe-hsse.spec.ts` with a proper
   `HSSEReportPage`, mirroring Near Miss. This is the largest known coverage gap.
2. **Automate the reset-password happy path** by integrating a test-mailbox API (e.g. Mailosaur
   / a catch-all inbox) to fetch the emailed code, removing the `RUN_MANUAL` human step and
   enabling CI coverage.
3. **Move to a paid Apple Developer profile** to eliminate the 7-day signing renewal and the
   3-app install cap — currently the single biggest operational drag on iOS runs.
4. **CI integration** — wire the suite into CI with a hosted/cloud device (e.g. the optional
   `mobile-use.com` cloud devices referenced in `.env.example`) so it runs unattended. Keep
   `RUN_MANUAL` tests excluded there.
5. **Android parity pass** — verify the suite on Android and externalise the hard-coded iPhone
   geometry (FAB coordinate, signature band) into per-device constants so coordinate-based
   steps don't silently miss.
6. **Centralise magic coordinates/timeouts** — the FAB coordinate and signature band live in
   different files; a small `device-geometry.ts` would make re-measuring for a new device a
   one-file change.
7. **Confirm icon-only locators** — pin the report-type modal close (X) and Reports header
   filter/help icons from a view-tree dump so they can be driven by locator instead of guessed.
8. **Expand Reports coverage** — populated list, filtering, opening, archiving — beyond the
   current empty-state check.
9. **Reduce coordinate reliance** — where the app team can add accessibility labels/test IDs to
   the WebView, replace positional/coordinate locators with stable handles to cut maintenance.
10. **Trend/flake tracking** — capture pass/fail history per test to spot the agent-degradation
    stalls (currently absorbed by `retries: 2`) before they become chronic.

---

## Appendix A — Shared utilities reference

| Utility | File | Purpose |
|---|---|---|
| `dismissKeyboard(screen, x?, y?)` | `utils/keyboard.ts` | Tap a non-interactive band to retract the iOS keyboard before a follow-up tap |
| `scrollDownToReveal(screen, locator, maxSwipes?)` | `utils/scroll.ts` | Swipe up until a below-the-fold element reports visible |
| `drawSignature(screen, band?)` | `utils/signature.ts` | Draw coordinate strokes on the node-less signature canvas |
| `waitForDeviceInput(read, opts)` | `utils/manual-input.ts` | Poll a field until the user types the emailed code on-device |
| `promptManualInput(question, opts)` | `utils/manual-input.ts` | Read a value from the controlling terminal (`/dev/tty`) mid-test |
| `invalidCreds` | `utils/test-data.ts` | Well-formed but invalid login data |
| `uniqueTitle(prefix?)` | `utils/test-data.ts` | Timestamped unique title for created records |

## Appendix B — Page object reference

| Page object | Screen | Key methods |
|---|---|---|
| `LoginPage` | Login | `login`, `submitEmpty`, `tapForgotPassword`, `openHelp`, `isShowing`, `expectLoaded`, `expectRejected`, `expectReachedHome` |
| `ForgotPasswordPage` | Forgot Password | `requestReset`, `fillEmail`, `submit`, `tapBack`, `tapBackArrow`, `openHelp`, `expectLoaded`, `expect*EmailError` |
| `ThankYouPage` | Reset confirmation | `tapChangePassword`, `tapNoEmailReceived`, `expectLoaded` |
| `ResetPasswordPage` | Reset / wrong-code | `reset`, `submitEmpty`, `fill*`, `waitForEmailedCode`, `expectPasswordRuleErrors`, `expectWrongCodeScreen`, `expectResetSuccess` |
| `AdminDashboardPage` | Home + sidebar | `openMyReports`, `openSidebar`/`closeSidebar`, `openNotifications`, `logout`, `expectDashboardWidgets`, `expectSidebarItems`, `expectUserName` |
| `ReportsPage` | Reports list | `openCreateReport`, `expectLoaded`, `expectEmptyState`, `expectReportListed` |
| `ReportTypeModal` | "+" type picker | `selectNearMiss`, `close`, `expectOpen` |
| `NearMissReportPage` | Near Miss form | `fillRequiredFields`, `signEmployeeSignature`, `save`, `saveAndSend`, `expectLoaded`, `expectSentSuccessfully`, `expectRequiredWhenEmpty` |
| `NeedHelpModal` (component) | Shared help modal | `expectOpen`, `close` |
