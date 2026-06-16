# Forgot Password Page Test Plan

## Application Overview

The Forgot Password page allows users to reset their password by providing their email address. The page validates the email format, displays appropriate error messages, and guides users through the password reset flow. After submission, users receive instructions about the verification email and timeline. The page includes help documentation and navigation options for user guidance.

## Test Scenarios

### 1. Form Validation

**Seed:** `tests/seed.spec.ts`

#### 1.1. Empty email field shows validation error

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed with an empty email field
    - expect: The Next button is disabled
  2. Click the email input field to ensure focus
    - expect: The email field is focused
  3. Click away from the email field without entering any text
    - expect: The validation message 'Email is required!' is displayed below the email field

#### 1.2. Email without @ symbol shows invalid format error

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'notanemail' in the email field
    - expect: The text 'notanemail' is entered in the email field
  3. Observe the validation feedback
    - expect: The validation message 'Email is invalid!' is displayed
    - expect: The Next button remains disabled

#### 1.3. Email with @ but missing domain extension shows invalid error

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'user@domain' in the email field (missing .extension)
    - expect: The text 'user@domain' is entered in the email field
  3. Observe the validation feedback
    - expect: The validation message 'Email is invalid!' is displayed
    - expect: The Next button remains disabled

#### 1.4. Email missing domain section shows invalid error

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'user@.com' in the email field (missing domain name)
    - expect: The text 'user@.com' is entered in the email field
  3. Observe the validation feedback
    - expect: The validation message 'Email is invalid!' is displayed
    - expect: The Next button remains disabled

#### 1.5. Valid email with basic format enables Next button

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'user@example.com' in the email field
    - expect: The text 'user@example.com' is entered in the email field
  3. Observe the form state
    - expect: No validation error message is displayed
    - expect: The Next button is enabled and clickable

#### 1.6. Valid email with plus sign enables Next button

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'user+test@example.com' in the email field
    - expect: The text 'user+test@example.com' is entered in the email field
  3. Observe the form state
    - expect: No validation error message is displayed
    - expect: The Next button is enabled and clickable

#### 1.7. Valid email with multi-level domain extension enables Next button

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'user@example.co.uk' in the email field
    - expect: The text 'user@example.co.uk' is entered in the email field
  3. Observe the form state
    - expect: No validation error message is displayed
    - expect: The Next button is enabled and clickable

#### 1.8. Email with numbers is accepted as valid format

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'user123@example456.com' in the email field
    - expect: The text 'user123@example456.com' is entered in the email field
  3. Observe the form state
    - expect: No validation error message is displayed
    - expect: The Next button is enabled and clickable

#### 1.9. Email validation clears when field is emptied

**File:** `tests/forgot-password/form-validation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'invalid.email' in the email field
    - expect: The validation message 'Email is invalid!' is displayed
    - expect: The Next button is disabled
  3. Clear the email field completely
    - expect: The validation message 'Email is required!' is displayed
    - expect: The Next button remains disabled
  4. Type 'valid@example.com' in the email field
    - expect: The text 'valid@example.com' is entered
    - expect: No validation error message is displayed
    - expect: The Next button is enabled

### 2. Successful Password Reset Flow

**Seed:** `tests/seed.spec.ts`

#### 2.1. Valid email submission shows success confirmation page

**File:** `tests/forgot-password/success-flow.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type a valid email address 'testuser@example.com' in the email field
    - expect: The Next button is enabled
  3. Click the Next button
    - expect: Page navigates to the confirmation page
    - expect: The URL changes to https://app.tst.jobsafe.cloud/check-email-exists
    - expect: Success heading 'Thank you!' is displayed

#### 2.2. Success page displays confirmation message and instructions

**File:** `tests/forgot-password/success-flow.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and submit a valid email
    - expect: The confirmation page is displayed
  2. Verify the page content
    - expect: The heading 'Thank you!' is visible
    - expect: The subheading 'We have received your request' is displayed
    - expect: An envelope icon is shown
    - expect: The instruction message is displayed: 'If your email is recognised we will send you an email back with a verification code that you will need to change your current password.'
    - expect: The timeline message is displayed: 'Please allow up to 2 hours.'

#### 2.3. Success page displays 'Change Password' button

**File:** `tests/forgot-password/success-flow.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and submit a valid email
    - expect: The confirmation page is displayed
  2. Verify the presence of the Change Password button
    - expect: A 'Change Password' button is visible and clickable

#### 2.4. Success page displays help link for missing emails

**File:** `tests/forgot-password/success-flow.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and submit a valid email
    - expect: The confirmation page is displayed
  2. Verify the presence of the help link
    - expect: The 'No Email received? - Contact us' link is visible

### 3. Navigation and User Interactions

**Seed:** `tests/seed.spec.ts`

#### 3.1. Back arrow button navigates to login page

**File:** `tests/forgot-password/navigation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Click the back arrow button in the header
    - expect: Page navigates to the login page
    - expect: The URL changes to https://app.tst.jobsafe.cloud/login

#### 3.2. 'Go back to previous screen' button navigates to login page

**File:** `tests/forgot-password/navigation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Click the 'Go back to previous screen' button
    - expect: Page navigates to the login page
    - expect: The URL changes to https://app.tst.jobsafe.cloud/login

#### 3.3. Back button from success page returns to forgot password form

**File:** `tests/forgot-password/navigation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and submit a valid email
    - expect: The confirmation page is displayed at /check-email-exists
  2. Click the back arrow button in the header
    - expect: Page navigates back to the forgot password form
    - expect: The URL changes back to https://app.tst.jobsafe.cloud/forgot-password

#### 3.4. Info icon opens help dialog

**File:** `tests/forgot-password/navigation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Click the info icon button in the header
    - expect: A help dialog is opened
    - expect: The dialog displays 'Need help? - Contact us' heading

#### 3.5. Help dialog shows contact information

**File:** `tests/forgot-password/navigation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and click the info icon
    - expect: The help dialog is displayed
  2. Verify the dialog content
    - expect: The dialog displays the text: 'For any help or support, kindly contact us through the following methods:'
    - expect: A phone number link '0333 8000 883' is displayed
    - expect: An email link 'support@jobsafe.cloud' is displayed
    - expect: Operating hours 'Monday - Friday | 9:00am - 5:00pm UK' are displayed

#### 3.6. Help dialog can be closed by pressing Escape

**File:** `tests/forgot-password/navigation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and open the help dialog
    - expect: The help dialog is displayed
  2. Press the Escape key
    - expect: The help dialog closes
    - expect: The forgot password form is visible again

#### 3.7. Help link on success page opens contact dialog

**File:** `tests/forgot-password/navigation.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and submit a valid email
    - expect: The confirmation page is displayed
  2. Click the 'No Email received? - Contact us' link
    - expect: A help dialog is opened with contact information

### 4. Edge Cases and Special Scenarios

**Seed:** `tests/seed.spec.ts`

#### 4.1. Email with underscore and dash is accepted as valid

**File:** `tests/forgot-password/edge-cases.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'user_name-test@example.com' in the email field
    - expect: The text 'user_name-test@example.com' is entered
  3. Observe the validation state
    - expect: No validation error is displayed
    - expect: The Next button is enabled

#### 4.2. Email with leading or trailing spaces is handled appropriately

**File:** `tests/forgot-password/edge-cases.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type ' user@example.com ' (with leading and trailing spaces) in the email field
    - expect: The text is entered in the email field
  3. Check if the form accepts or rejects the input
    - expect: The system either trims spaces and accepts the email, or displays an invalid format error

#### 4.3. Email with lowercase letters is accepted

**File:** `tests/forgot-password/edge-cases.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'user@example.com' (all lowercase) in the email field
    - expect: The text is entered and accepted
  3. Observe the validation state
    - expect: The Next button is enabled

#### 4.4. Email with uppercase letters is accepted

**File:** `tests/forgot-password/edge-cases.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'USER@EXAMPLE.COM' (all uppercase) in the email field
    - expect: The text is entered
  3. Observe the validation state
    - expect: The Next button is enabled (email validation is case-insensitive)

#### 4.5. Email with mixed case is accepted

**File:** `tests/forgot-password/edge-cases.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type 'User@Example.Com' (mixed case) in the email field
    - expect: The text is entered
  3. Observe the validation state
    - expect: The Next button is enabled

#### 4.6. Very long but valid email is accepted

**File:** `tests/forgot-password/edge-cases.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    - expect: The forgot password form is displayed
  2. Type a very long but valid email 'verylongusernamewithmanycharacters@verylongdomainnamewithmanycharacters.com' in the email field
    - expect: The email is entered in the field
  3. Observe the validation state
    - expect: The Next button is enabled

#### 4.7. Form preserves email value when navigating back from success page

**File:** `tests/forgot-password/edge-cases.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and submit email 'test@example.com'
    - expect: The confirmation page is displayed
  2. Click the back button to return to the forgot password form
    - expect: The forgot password form is displayed
  3. Verify if the email field still contains the previous email value
    - expect: Either the email is pre-filled (showing 'test@example.com') or the field is empty for a fresh start

#### 4.8. Double-clicking the Next button does not submit form twice

**File:** `tests/forgot-password/edge-cases.spec.ts`

**Steps:**
  1. Navigate to https://app.tst.jobsafe.cloud/forgot-password and enter a valid email
    - expect: The Next button is enabled
  2. Double-click the Next button rapidly
    - expect: Only one submission is processed
    - expect: The page navigates to the confirmation page only once
