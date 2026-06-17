# Signup Trial Test Plan

## Document metadata

| Field | Value |
|---|---|
| **Application URL** | https://app.tst.jobsafe.cloud/signup-trial |
| **Environment** | TST |
| **Exploration date** | 2026-06-17 |
| **Exploration method** | `playwright-cli` (headless browser, snapshot-based element mapping) |
| **Generated file** | `signup-test-plan.md` |
| **Notes** | No screenshot capture; assertions only |

---

## Application overview

The signup trial page is a mobile-first registration flow for JobSafe SaaS. It captures personal details, company details, password fields, optional payment card information, and agreement consent. The page includes inline validation and pathing for already-registered users.

Primary validation coverage:
1. Required field presence
2. Input format validation
3. Submit gating and registration rejection for used email
4. Confirmation email delivery

---

## Page element map

### Signup trial page — `/signup-trial`

| Ref | Element | Role / type | Label / placeholder | Notes |
|---|---|---|---|---|
| `e16` | button | back | `back` | Header back navigation |
| `e28` | label | text | `First Name :` | First name field label |
| `e33` | textbox | input | `First Name` | Required |
| `e38` | label | text | `Surname :` | Last name field label |
| `e43` | textbox | input | `Surname` | Required |
| `e49` | label | text | `Email address :` | Email label |
| `e55` | textbox | input | `Email address` | Required; validate email format |
| `e61` | label | text | `Confirm email address :` | Confirm email label |
| `e67` | textbox | input | `Email address` | Required; must match email |
| `e72` | label | text | `Phone Number :` | Phone label |
| `e77` | textbox | input | `Phone Number` | Required |
| `e82` | label | text | `Company Name :` | Company name label |
| `e87` | textbox | input | `Company Name` | Required |
| `e93` | label | text | `Choose a password :` | Password label |
| `e105` | textbox | password | `Choose a password` | Required; likely masked |
| `e111` | label | text | `Confirm password :` | Confirm password label |
| `e123` | textbox | password | `Choose a password` | Required; must match password |
| `e130` | label | text | `Name on Card :` | Optional payment field |
| `e137` | textbox | input | `Name on Card` | Optional |
| `e143` | label | text | `Card Number :` | Optional payment field |
| `e150` | textbox | input | `Card Number` | Optional |
| `e156` | label | text | `Expiry Date (MM/YYYY) :` | Optional payment field |
| `e163` | textbox | input | `Expiry Date (MM/YYYY)` | Optional |
| `e169` | label | text | `Card Verification Value (CVV) :` | Optional payment field |
| `e176` | textbox | input | `Card Verification Value (CVV)` | Optional |
| `e182` | label | text | `Country :` | Country selector label |
| `e184` | element | dropdown | `United Kingdom` | Country selector default |
| `e217` | switch | toggle | consent | I agree to the Terms & Conditions |
| `e234` | button | submit | `Register & start your FREE trial` | Primary submit |
| `e242` | button | link | `Go back to previous screen` | Secondary navigation |

---

## Recommended selectors

```ts
page.getByPlaceholder('First Name')
page.getByPlaceholder('Surname')
page.getByPlaceholder('Email address').first()
page.getByPlaceholder('Email address').nth(1)
page.getByPlaceholder('Phone Number')
page.getByPlaceholder('Company Name')
page.getByPlaceholder('Choose a password').first()
page.getByPlaceholder('Choose a password').nth(1)
page.getByRole('button', { name: 'Register & start your FREE trial' })
page.getByRole('button', { name: 'Go back to previous screen' })
page.getByRole('link', { name: 'Terms & Conditions' })
page.getByRole('button', { name: 'back', exact: true })
```

---

## Test scenarios

### 1. Verify inputs

#### 1.1. Signup page renders all required fields

- Navigate to `https://app.tst.jobsafe.cloud/signup-trial`
- Expect URL to match `/signup-trial`
- Expect visible fields:
  - First Name
  - Surname
  - Email address
  - Confirm email address
  - Phone Number
  - Company Name
  - Choose a password
  - Confirm password
  - Country selector defaulted to `United Kingdom`
  - Agreement toggle + Terms & Conditions link
  - `Register & start your FREE trial` button
  - `Go back to previous screen` button

#### 1.2. Required inputs are present and accessible

- Expect field labels to read:
  - `First Name :`
  - `Surname :`
  - `Email address :`
  - `Confirm email address :`
  - `Phone Number :`
  - `Company Name :`
  - `Choose a password :`
  - `Confirm password :`
- Expect the registration button is visible but not necessarily enabled until required values are provided

---

### 2. Verify input validation

#### 2.1. Required field validation

- Leave all fields empty and blur each field in turn
- Expect inline errors for required fields, including:
  - `First Name is required`
  - `Surname is required`
  - `Email is required`
  - `Confirm email is required`
  - `Phone Number is required`
  - `Company Name is required`
  - `Password is required`
  - `Confirm password is required`
- Expect `Register & start your FREE trial` remains disabled or blocked from submission

#### 2.2. Email validation

- Enter invalid email format in Email address field (e.g. `userexample.com`)
- Enter a different value in Confirm email address (e.g. `user@example.com`)
- Expect an error for invalid email format
- Expect an error for mismatched confirmation email

#### 2.3. Password validation

- Enter values that fail password requirements, for example:
  - too short
  - no special character
- Enter a different value in Confirm password
- Expect inline mismatch or password-strength error

#### 2.4. Optional card fields do not block registration when empty

- Leave all optional payment fields blank
- Fill required fields correctly
- Expect registration can proceed if optional card fields remain empty

#### 2.5. Country selector scaling and agreement toggle

- Confirm default country value is `United Kingdom`
- Toggle the agreement switch off and attempt registration
- Expect a consent-required error or blocked submission until toggle is enabled

---

### 3. Verify registration using used email

#### 3.1. Attempt registration with a previously registered email

- Fill valid data in all required fields
- Use an email already registered in the system
- Enable the agreement toggle
- Click `Register & start your FREE trial`
- Expect an error message indicating the email is already in use, such as:
  - `Email already registered`
  - `This email is already in use`
- Expect the page remains on `/signup-trial`
- Expect the user is not redirected to a confirmation or onboarding page

#### 3.2. Reuse current page state for negative path

- Verify the email field retains the typed value after the `used email` error
- Verify the user can update the email and resubmit

---

### 4. Verify receiving confirmation email

#### 4.1. Successful signup sends confirmation email

- Register with a fresh test email address not already in the system
- Enable agreement switch
- Click `Register & start your FREE trial`
- Expect a success confirmation UI or message on-screen, such as:
  - `Registration successful`
  - `Check your email`
- Expect redirect or step progression to an email verification notice

#### 4.2. Confirmation email delivery assertion

- Verify the confirmation email is received in the test inbox
- Assert email contents include:
  - relevant subject line, e.g. `Confirm your JobSafe account`
  - confirmation link or activation instructions
- If direct mailbox access is unavailable, assert that the UI shows explicit instruction to check email

#### 4.3. Confirmation link navigation

- From the received email, click the provided verification link
- Expect the application to mark the account as verified or prompt credentials success
- Expect user can complete onboarding after email confirmation

---

## Notes and assumptions

- The page is mobile-first and may use Ionic components. Allow 2-4 seconds for hydration before interacting with inputs.
- Inline validation messages are inferred from standard form patterns; verify exact text during automation development.
- Email confirmation verification requires access to a test mailbox or a mail API.
- The `playwright-cli` snapshot file was generated during exploration and confirms the field labels, placeholder text, and submit button label.
- Payment fields are optional; the primary registration path should not require card details for trial signup unless the UI indicates otherwise.

---

## Suggested test implementation

- `tests/signup.spec.ts`
- `tests/signup-validation.spec.ts`
- `tests/signup-negative.spec.ts`
- `tests/signup-email-confirmation.spec.ts`

### Suggested locator strategy

Use `page.getByPlaceholder(...)` for form fields and `page.getByRole('button', { name: 'Register & start your FREE trial' })` for submission.

### Recommended environment

- Mobile viewport: `iPhone 15` or `Android Mobile`
- Base URL: `https://app.tst.jobsafe.cloud`
- No screenshots required for element mapping
- Use `headless` mode for CI and `--workers=1` when running mobile web tests on this route
