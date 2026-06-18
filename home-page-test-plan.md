# Home Page Test Plan

## Document metadata

| Field | Value |
|---|---|
| Application URL | https://app.tst.jobsafe.cloud |
| Environment | TST |
| Exploration date | 2026-06-17 |
| Exploration method | `playwright-cli` headless browser session with `snapshot` mapping |
| Auth credentials | `USER_EMAIL` / `USER_PASSWORD` from `.env` |
| Session route after login | `/app/home` |
| Seed test / helper reference | `utils/login.ts` |

---

## Exploration summary

Using the Playwright CLI in headless mode, I logged in with the provided credentials and verified the authenticated homepage route at `/app/home`. I also inspected the profile/settings navigation using `playwright-cli snapshot` to capture element refs and visible structure.

The plan covers:
- Login flow and homepage validation
- Homepage tab navigation and core authenticated elements
- Profile/settings entry points

---

## Element map

### Login page (`/login`)

- `Email` textbox by placeholder: `Email`
- `Password` textbox by placeholder: `Choose a password`
- `Login` button
- `Forgot Password?` link to `/forgot-password`
- `No Account? Create an account` button

### Homepage authenticated shell (`/app/home`)

- Active `Home` tab/button
- `My Reports` button (linked to `/app/settings/incident-reports`)
- `Documents` button (linked to `/app/settings/company-documents`)
- Side menu navigation items discovered in DOM:
  - `Settings`
  - `Submitted Report`
  - `Admin`
  - `User Management`
  - `Sites & Depots`
  - `Your Profile` (linked to `/app/settings/profile`)
  - `Company Details` (linked to `/app/settings/company-details`)
  - `Departments` (linked to `/app/settings/departments`)
  - `System Settings` (linked to `/app/settings/personalisation`)
  - `Subscription Billing`
  - `Company Docs`
  - `Support / Contact`
  - `Logout`

---

## Test scenarios

### 1. Login and homepage landing

**Purpose**: Verify valid authentication and homepage load for an authenticated user.

**Steps**:
1. Open `https://app.tst.jobsafe.cloud/login`.
2. Fill `Email` with the valid credential from `.env`.
3. Fill `Password` with the valid credential from `.env`.
4. Click the `Login` button.
5. Verify the page redirects to `/app/home`.
6. Verify the page title or content indicates the authenticated home view.
7. Verify the homepage tab container `#job_tabs` is visible.

**Expected results**:
- Login succeeds.
- URL changes to `/app/home`.
- `Home` tab is active.
- Core authenticated navigation elements are present.

### 2. Homepage navigation and settings entry point

**Purpose**: Confirm homepage navigation controls and profile/settings access.

**Steps**:
1. From `/app/home`, verify the `Home` button is visible and active.
2. Verify `My Reports` and `Documents` navigation buttons exist.
3. Open the side or user menu.
4. Verify `Your Profile` is available.
5. Click `Your Profile`.
6. Verify navigation reaches `/app/settings/profile` or equivalent profile settings route.

**Expected results**:
- `My Reports` and `Documents` controls are visible.
- Profile/settings links are accessible in the menu.
- `Your Profile` routes to the profile settings page.

### 3. Optional: Direct route protection and fallback

**Purpose**: Ensure direct route access and authentication state handling are consistent.

**Steps**:
1. Open `/app/home` in a fresh session with no auth state.
2. Verify unauthenticated access redirects to `/login`.
3. After login, verify the homepage loads successfully and `#job_tabs` is visible.

**Expected results**:
- Protected routes require authentication.
- `/app/home` loads successfully after login.

---

## Notes and recommendations

- The homepage is an Ionic SPA with tabbed navigation and side menu entries. The profile/settings menu is the likely source for account-level actions.
- The change-password page is a standalone route with a form that requires a verification code, new password, and confirm password entry.
- Element mapping was obtained using `playwright-cli snapshot` rather than image screenshots, preserving token efficiency.
- Use explicit `page.getByPlaceholder(...)`, `page.getByRole(...)`, and URL assertions to make the automation resilient.
- If the direct menu path to change password is not always visible, the tests can still validate the standalone `/change-password` page and linked profile navigation.
