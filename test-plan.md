# JobSafe Web Application — Test Plan

## Document metadata

| Field | Value |
|---|---|
| **Application URL** | https://app.tst.jobsafe.cloud |
| **Environment** | TST |
| **Exploration date** | 2026-06-16 |
| **Exploration method** | `playwright-cli` (headless Chromium, snapshot-based element mapping) |
| **Seed test** | `tests/seed.spec.ts` |
| **Auth helper** | `utils/login.ts` |
| **Recommended devices** | iPhone 15, Pixel 5 (per `playwright.config.ts`) |

---

## Application overview

JobSafe is a mobile-first Ionic/Angular SPA for workplace health, safety, and incident reporting. Unauthenticated users land on `/login`. After successful authentication, users are redirected to `/app/home`, which exposes tabbed navigation (including **My Reports**) and incident-report creation flows (notably **HSSE Report**).

Primary user journeys covered in this plan:

1. **Login** — email/password authentication with inline validation
2. **Forgot password** — email capture and reset confirmation
3. **Route protection** — unauthenticated access to protected routes
4. **Dashboard (Home)** — post-login shell and tab navigation
5. **Incident reports** — list view, add-report modal, HSSE form creation

---

## Element map (from playwright-cli snapshots)

### Login — `/login`

| Ref (session) | Role / type | Label / text | Placeholder / URL | Notes |
|---|---|---|---|---|
| `e18` | heading (h1) | Login | — | Page title |
| `e19` | heading (h2) | Choose one of the following methods: | — | Subheading |
| `e31` | textbox | Email : | `Email` | Required field |
| `e49` | textbox | Password : | `Choose a password` | Required; show/hide icon (`e41`); marks `[invalid]` on validation failure |
| — | button | Login | — | **Disabled** when fields empty or invalid; enabled when both fields valid |
| `e54` | link | Forgot Password? | `/forgot-password` | Navigates to forgot-password flow |
| `e59` | text | or | — | Visual separator |
| `e65` | button | No Account? Create an account | — | Registration entry point |

**Suggested Playwright locators**

```ts
page.getByRole('heading', { name: 'Login' })
page.getByPlaceholder('Email')
page.getByPlaceholder('Choose a password')
page.getByRole('button', { name: 'Login' })
page.getByRole('link', { name: 'Forgot Password?' })
page.getByRole('button', { name: 'No Account? Create an account' })
```

**Observed validation messages**

| Trigger | Message |
|---|---|
| Email focused then blurred empty | `Email is required!` |
| Password focused then blurred empty | `Password is required!` |
| Malformed email (e.g. `testtest.com`) | `Email is invalid!` |
| Valid format but wrong credentials | `E2. Incorrect username or` (partial; full string from API) |

---

### Forgot password — `/forgot-password`

| Ref (session) | Role / type | Label / text | Placeholder / URL | Notes |
|---|---|---|---|---|
| `e79` | button | back | — | Header back navigation |
| `e83` | heading (h1) | Forgotten password | — | Page title |
| `e92` | heading (h2) | Simply provide us with your Email: | — | Instructions |
| `e96` | img | — | — | Decorative illustration |
| `e108` | textbox | Email : | `Email` | Single input field |
| — | button | Next | — | **Disabled** when email empty/invalid |
| `e118` | button | Go back to previous screen | — | Returns to login |

**Suggested Playwright locators**

```ts
page.getByRole('button', { name: 'back', exact: true })
page.getByRole('heading', { name: 'Forgotten password' })
page.getByPlaceholder('Email')
page.getByRole('button', { name: 'Next' })
page.getByRole('button', { name: 'Go back to previous screen' })
page.getByRole('banner').getByRole('button') // Need help / info icon
```

**Downstream route (from existing specs & tests)**

| URL | Key content |
|---|---|
| `/check-email-exists` | Heading `Thank you!`, subheading `We have received your request`, envelope icon, verification instructions, `Please allow up to 2 hours.`, `Change Password` button, `No Email received? - Contact us` link |

**Help modal content (from existing tests)**

- Heading: `Need help? - Contact us`
- Body: `For any help or support, kindly contact us through the following methods:`
- Phone: `0333 8000 883`
- Email: `support@jobsafe.cloud`
- Hours: `Monday - Friday | 9:00am - 5:00pm UK`
- Close via `Close` button or `Escape`

---

### Dashboard / Home — `/app/home` *(mapped from authenticated test utilities)*

> Live snapshot capture requires valid credentials (`USER_EMAIL` / `USER_PASSWORD` in `.env`). Post-login assertions below are derived from `utils/login.ts`, `utils/navigation.ts`, and existing Playwright tests.

| Element | Locator strategy | Notes |
|---|---|---|
| Tab container | `#job_tabs` | Visible within 20s after successful login |
| Tab list | `getByRole('tablist')` | Ionic tab bar |
| My Reports tab | `getByRole('tab', { name: 'My Reports' })` | Primary navigation to incident reports |
| Home URL | `/app/home` | Redirect target after login |

**Suggested post-login assertion**

```ts
await expect(page).toHaveURL(/app\/home/);
await expect(page.locator('#job_tabs')).toBeVisible();
```

---

### Incident reports — `/app/settings/incident-reports`

| Element | Locator strategy | Notes |
|---|---|---|
| My Reports tab | `getByRole('tab', { name: 'My Reports' })` | Click tab control, not label text (WebKit) |
| Fallback tab click | `#job_tabs` → text `My Reports` | Used when URL does not update |
| Add report FAB | `ion-fab-button`, `.floating-plus-button__icon`, or `main button` (last) | Opens `ion-modal.add-report-modal.show-modal` |
| Report type modal | `ion-modal.add-report-modal.show-modal` | Picker for report types |
| HSSE card | `getByRole('paragraph').filter({ hasText: 'HSSE Report' })` or `div.card.hsse` | Navigates to HSSE form |
| HSSE form URL | `/hsse-report` | Form entry route |

---

### HSSE report form — `/hsse-report`

Fields exercised by `utils/hsse-form-flow.ts` and `utils/form.ts`:

| Step | Control | `formcontrolname` / selector |
|---|---|---|
| Incident dates | Syncfusion datepicker | `#ej2-datepicker_0_input`, `#ej2-datepicker_1_input` |
| Incident time | Time picker | `[formcontrolname="timeOfIncident"]` |
| Reporter | ng-select | First option selection |
| Incident type | ion-select picker | `incidentType` |
| Title | ion-input | `title` |
| Description | ion-textarea | `description` |
| Severity | ion-select picker | `severityLevel` |
| First aid | ion-select picker | `firstAid` |
| Emergency services | ion-select picker | `emergencyServices` / `emergencyService` |
| Responder name | ion-input | `responderName` |
| Tel number | ion-input | `telNumber` |
| Place on site | Location search/select | Place search + option |
| Attachment | File upload | Photo attachment control |
| Remedy / notes | Text area | Remedy notes field |
| Hazard checklists | Checklist controls | Recorded checklists |
| Save | Button / text | `Save` (exact) → returns to incident-reports list |

---

## Assumptions and prerequisites

- **Fresh state**: Each scenario starts logged out unless explicitly noted (no cookies/session).
- **Credentials**: Valid-user scenarios require `USER_EMAIL` and `USER_PASSWORD` in `.env` (see `.env.example`).
- **Hydration delay**: Ionic components may take 3–5 seconds to hydrate; wait for placeholders/roles before interacting.
- **Mobile viewport**: Primary target is mobile web (iPhone 15 / Pixel 5 profiles).
- **No screenshots**: Validation is assertion-based (URL, text, element state).

---

## Test scenarios

### 1. Authentication — Login page

**Seed:** `tests/seed.spec.ts`  
**Suggested file:** `tests/login-page.spec.ts` *(partially implemented)*

#### 1.1. Login page renders core elements

**Steps:**
1. Navigate to https://app.tst.jobsafe.cloud/login
   - expect: URL matches `/login`
   - expect: Heading `Login` is visible
   - expect: Subheading `Choose one of the following methods:` is visible
   - expect: Email field with placeholder `Email` is visible
   - expect: Password field with placeholder `Choose a password` is visible
   - expect: `Login` button is visible
   - expect: Link `Forgot Password?` is visible
   - expect: Button `No Account? Create an account` is visible

#### 1.2. Login button disabled when fields are empty

**Steps:**
1. Navigate to `/login` with empty fields
   - expect: `Login` button is disabled

#### 1.3. Empty-field validation on blur

**Steps:**
1. Navigate to `/login`
2. Click Email field, then click Password field, then press `Tab`
   - expect: `Email is required!` is displayed
   - expect: `Password is required!` is displayed
   - expect: `Login` button remains disabled

#### 1.4. Invalid email format shows inline error

**Steps:**
1. Navigate to `/login`
2. Type `testtest.com` in Email field (no `@`)
   - expect: `Email is invalid!` is displayed
   - expect: `Login` button remains disabled

#### 1.5. Invalid credentials show API error

**Steps:**
1. Navigate to `/login`
2. Enter valid-format email `test@test.com` and password `wrongpass`
3. Click `Login`
   - expect: Error message containing `E2. Incorrect username or` is displayed
   - expect: User remains on `/login`

#### 1.6. Valid credentials redirect to home dashboard

**Steps:**
1. Navigate to `/login`
2. Enter valid `USER_EMAIL` and `USER_PASSWORD` from environment
3. Click `Login`
   - expect: URL changes to `/app/home` within 30s
   - expect: `#job_tabs` is visible within 20s

#### 1.7. Forgot Password link navigates correctly

**Steps:**
1. Navigate to `/login`
2. Click `Forgot Password?` link
   - expect: URL matches `/forgot-password`
   - expect: Heading `Forgotten password` is visible

#### 1.8. Create account entry point is reachable

**Steps:**
1. Navigate to `/login`
2. Click `No Account? Create an account`
   - expect: User leaves login page (registration route or modal opens)
   - expect: No unhandled error in console

---

### 2. Route protection

**Seed:** `tests/seed.spec.ts`  
**Suggested file:** `tests/auth-guard.spec.ts`

#### 2.1. Unauthenticated access to home redirects to login

**Steps:**
1. Clear cookies/storage (fresh browser context)
2. Navigate directly to https://app.tst.jobsafe.cloud/app/home
   - expect: User is redirected to `/login`
   - expect: Login form is displayed

#### 2.2. Unauthenticated access to incident reports redirects to login

**Steps:**
1. Clear cookies/storage
2. Navigate directly to https://app.tst.jobsafe.cloud/app/settings/incident-reports
   - expect: User is redirected to `/login`

---

### 3. Forgot password flow

**Seed:** `tests/seed.spec.ts`  
**Reference:** `specs/forgot-password-test-plan.md` *(detailed sub-plan already exists)*  
**Suggested files:** `tests/forget-password.spec.ts`, `tests/forgot-password/form-validation.spec.ts`

#### 3.1. Forgot password page renders core elements

**Steps:**
1. Navigate to `/forgot-password`
   - expect: Heading `Forgotten password` is visible
   - expect: Subheading `Simply provide us with your Email:` is visible
   - expect: Email field is visible and empty
   - expect: `Next` button is disabled
   - expect: `Go back to previous screen` button is visible
   - expect: Header `back` button is visible

#### 3.2. Empty email shows required validation

**Steps:**
1. Navigate to `/forgot-password`
2. Click Email field, then click away without typing
   - expect: `Email is required!` is displayed
   - expect: `Next` button remains disabled

#### 3.3. Invalid email format blocks submission

**Steps:**
1. Navigate to `/forgot-password`
2. Type `invalidemail.com` in Email field
   - expect: `Email is invalid!` is displayed
   - expect: `Next` button remains disabled

#### 3.4. Valid email enables Next and advances flow

**Steps:**
1. Navigate to `/forgot-password`
2. Type a valid-format email (e.g. `test@test.com`)
   - expect: No validation errors
   - expect: `Next` button is enabled
3. Click `Next`
   - expect: URL changes to `/check-email-exists`
   - expect: Confirmation content (`Thank you!`) is displayed

#### 3.5. Back navigation returns to login

**Steps:**
1. Navigate to `/forgot-password`
2. Click header `back` button **or** `Go back to previous screen`
   - expect: URL changes to `/login`

#### 3.6. Need help modal displays contact details

**Steps:**
1. Navigate to `/forgot-password`
2. Click info/help button in banner header
   - expect: Modal with `Need help? - Contact us` is visible
   - expect: Phone, email, and operating hours are displayed
3. Close modal via `Close` or `Escape`
   - expect: Modal closes; forgot-password form remains visible

> **Note:** Comprehensive forgot-password scenarios (email format matrix, success-page content, edge cases) are documented in `specs/forgot-password-test-plan.md`.

---

### 4. Dashboard and navigation (authenticated)

**Seed:** `tests/login.spec.ts` or `tests/auth.setup.ts`  
**Suggested file:** `tests/dashboard.spec.ts`

#### 4.1. Home dashboard loads after login

**Steps:**
1. Log in with valid credentials (`utils/login.ts`)
   - expect: URL is `/app/home`
   - expect: `#job_tabs` tab container is visible

#### 4.2. My Reports tab navigates to incident reports

**Steps:**
1. Log in and land on `/app/home`
2. Click `My Reports` tab in tablist
   - expect: URL contains `incident-reports`
   - expect: Incident reports list view loads without error

#### 4.3. Direct navigation to incident reports URL works when authenticated

**Steps:**
1. Log in
2. Navigate to `/app/settings/incident-reports`
   - expect: URL matches `/incident-reports/`
   - expect: Page content loads (list or empty state)

#### 4.4. Session expiry returns user to login

**Steps:**
1. Log in successfully
2. Clear auth cookies / invalidate session
3. Navigate to `/app/home`
   - expect: User is redirected to `/login`

---

### 5. Incident report creation — HSSE

**Seed:** `tests/login.spec.ts`  
**Suggested files:** `tests/incident-report.spec.ts`, `tests/form-demo.spec.ts`

#### 5.1. Add report modal opens from FAB

**Steps:**
1. Log in and navigate to incident reports (`utils/navigation.ts`)
2. Click floating plus / FAB button
   - expect: `ion-modal.add-report-modal.show-modal` is visible
   - expect: Report type options include `HSSE Report`

#### 5.2. HSSE card opens HSSE form

**Steps:**
1. Open add-report modal
2. Click `HSSE Report` card
   - expect: URL matches `/hsse-report/`
   - expect: Form field `ion-input[formcontrolname="title"]` is visible within 15s

#### 5.3. Complete HSSE form and save

**Steps:**
1. Open HSSE form
2. Fill all required fields per `utils/hsse-form-flow.ts` (dates, time, reporter, incident type, title, description, severity, first aid, emergency services, responder, tel, place, attachment, remedy, checklists)
3. Click `Save`
   - expect: URL returns to `/incident-reports/`
   - expect: Saved report title appears in list body text

#### 5.4. Required-field validation on HSSE form

**Steps:**
1. Open HSSE form
2. Attempt to save without filling required fields
   - expect: Inline validation prevents save **or** error messaging is shown
   - expect: User remains on HSSE form

#### 5.5. Cancel / back from HSSE form discards or confirms

**Steps:**
1. Open HSSE form and enter partial data
2. Navigate back / cancel
   - expect: User is prompted or returned to incident reports without unintended save

---

## Cross-cutting non-functional checks

| Area | Scenario | Expected outcome |
|---|---|---|
| **Performance** | Login → home | Redirect within 30s on TST |
| **Performance** | Open HSSE form | Title field visible within 15s |
| **Accessibility** | Login & forgot-password | Headings, labels, and buttons expose accessible names matching visible text |
| **Mobile layout** | iPhone 15 viewport | All primary controls reachable without horizontal scroll |
| **Mobile layout** | Pixel 5 viewport | Tab navigation and FAB usable via touch targets |
| **Error handling** | Network failure on login | Graceful error message; no blank screen |
| **Security** | Protected routes | No dashboard content rendered before auth redirect |

---

## Coverage matrix

| Journey | Happy path | Validation / negative | Navigation | Implemented tests |
|---|---|---|---|---|
| Login | 1.6 | 1.2–1.5 | 1.7, 1.8 | `tests/login-page.spec.ts`, `tests/login.spec.ts` |
| Route guard | — | 2.1, 2.2 | — | Partial (manual exploration) |
| Forgot password | 3.4 | 3.2, 3.3 | 3.5, 3.6 | `tests/forget-password.spec.ts`, `tests/forgot-password/form-validation.spec.ts` |
| Dashboard | 4.1 | 4.4 | 4.2, 4.3 | Via `utils/login.ts` helpers |
| HSSE report | 5.3 | 5.4, 5.5 | 5.1, 5.2 | `tests/incident-report.spec.ts`, `tests/form-demo.spec.ts` |

---

## Recommended execution order

1. **Auth setup (once):** `npx playwright test tests/auth.setup.ts` → writes `storageState.json`
2. **Unauthenticated suites:** Login page, forgot password, route guard
3. **Authenticated suites:** Dashboard navigation, incident reports, HSSE form
4. **Demo / regression:** `npm run test:demo` (full HSSE flow on iPhone 15)

---

## Out of scope (this plan)

- Native Android/iOS app flows (`tests/native/*`) — covered separately via MobileWright
- Account registration end-to-end (Create account flow not fully mapped in this session)
- Admin/settings areas beyond incident reports
- Email delivery verification for password reset
- Multi-user / role-based access control

---

## Exploration notes

- Snapshots were captured headlessly via `playwright-cli` without image screenshots.
- Ionic hydration can produce empty snapshots if captured immediately after navigation; allow 3–5s or wait for placeholder locators before mapping refs.
- Element refs (e.g. `e31`, `e54`) are **session-scoped** and change between runs; prefer semantic locators (`getByRole`, `getByPlaceholder`) in automated tests.
- Unauthenticated navigation to `/app/home` was observed to redirect to `/login` during exploration.
- Existing `storageState.json` contained analytics cookies only (no auth session); authenticated dashboard mapping relies on project test utilities and should be re-verified after running `tests/auth.setup.ts`.
