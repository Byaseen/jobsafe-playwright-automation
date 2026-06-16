# Change Password Page Test Plan

## Application Overview

Structured test plan for the Change Password page at https://app.tst.jobsafe.cloud/change-password, covering page rendering, form verification, invalid code handling, support links, and end-to-end password reset validation.

## Test Scenarios

### 1. Change Password Flow

**Seed:** `tests/seed.spec.ts`

#### 1.1. Verify Change password page

**File:** `change-password-test-plan.md`

**Steps:**
  1. -
    - expect: Navigate to https://app.tst.jobsafe.cloud/change-password
    - expect: URL contains /change-password
    - expect: Page title text Reset your password is visible
    - expect: Heading Enter your new password below: is visible
    - expect: Code input field is visible
    - expect: New Password and Confirm Password fields are visible
    - expect: Reset Now button is visible and disabled on page load
    - expect: Still need help? - Contact us link or text is visible

#### 1.2. Verify form inputs

**File:** `change-password-test-plan.md`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/change-password
    - expect: The change password form is displayed
  2. Enter a verification code into the code input field
    - expect: The code field contains the entered value
  3. Enter a new password into the New Password field
    - expect: The New Password field contains the entered value
  4. Enter the same password into the Confirm Password field
    - expect: The Confirm Password field contains the entered value
    - expect: Both password values match

#### 1.3. Verify trying wrong code

**File:** `change-password-test-plan.md`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/change-password
    - expect: The change password form is displayed
  2. Enter an invalid or expired verification code into the code field
    - expect: The code field contains the entered invalid value
  3. Enter matching valid values into New Password and Confirm Password
    - expect: Both password fields contain the entered values
  4. Attempt to submit the form by clicking Reset Now
    - expect: An error is displayed for the invalid code
    - expect: Reset Now action is rejected or validation feedback is shown

#### 1.4. Verify Wrong code page

**File:** `change-password-test-plan.md`

**Steps:**
  1. Use an invalid verification code and submit the form
    - expect: The wrong code or failure page is displayed
    - expect: A message indicates the verification code is incorrect or expired
    - expect: The page offers a request another code option

#### 1.5. Verify Request another code link

**File:** `change-password-test-plan.md`

**Steps:**
  1. On the wrong code page or invalid-code state, locate Request another code
    - expect: The Request another code link or button is visible
    - expect: Clicking Request another code begins the resend/reset flow or navigates to the code request page

#### 1.6. Verify "Still need help? - Contact us" link

**File:** `change-password-test-plan.md`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/change-password
    - expect: The Still need help? - Contact us link is visible
  2. Click the Still need help? - Contact us link
    - expect: The support contact option is displayed or navigates to support information
    - expect: The contact route or modal provides assistance details

#### 1.7. Verify Reset the password

**File:** `change-password-test-plan.md`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/change-password
    - expect: The change password page is displayed
  2. Enter a valid verification code, a new password, and matching confirm password
    - expect: The Reset Now button becomes enabled if the form is valid
  3. Click Reset Now
    - expect: The password reset completes successfully
    - expect: A confirmation message or redirect indicates the password has been changed

#### 1.8. Verify that user is unable to login using old password

**File:** `change-password-test-plan.md`

**Steps:**
  1. After completing the password reset flow, navigate to https://app.tst.jobsafe.cloud/login
    - expect: The login page is displayed
  2. Attempt to login with the old password
    - expect: Login fails
    - expect: An authentication error is displayed
    - expect: The user remains on the login page

#### 1.9. Verify login with the new password

**File:** `change-password-test-plan.md`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/login
    - expect: The login page is displayed
  2. Login with the username/email and the newly reset password
    - expect: Login succeeds
    - expect: User is redirected to the authenticated landing page or dashboard
