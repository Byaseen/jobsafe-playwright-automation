// spec: specs/forgot-password-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Form Validation', () => {
  test('Empty email field shows validation error', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed with an empty email field
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // Verify the Next button is disabled
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    
    // 2. Click the email input field to ensure focus
    await page.getByPlaceholder('Email').click();
    
    // Verify the email field is focused
    const emailField = page.getByPlaceholder('Email');
    await expect(emailField).toBeFocused();
    
    // 3. Click away from the email field without entering any text
    await page.getByRole('heading', { name: 'Simply provide us with your' }).click();
    
    // Verify the validation message 'Email is required!' is displayed
    await expect(page.getByText('Email is required!')).toBeVisible();
  });

  test('Email without @ symbol shows invalid format error', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // 2. Type 'notanemail' in the email field
    await page.getByPlaceholder('Email').fill('notanemail');
    
    // Verify the text 'notanemail' is entered in the email field
    await expect(page.getByPlaceholder('Email')).toHaveValue('notanemail');
    
    // 3. Observe the validation feedback
    // Verify the validation message 'Email is invalid!' is displayed
    await expect(page.getByText('Email is invalid!')).toBeVisible();
    
    // Verify the Next button remains disabled
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('Email with @ but missing domain extension shows invalid error', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // 2. Type 'user@domain' in the email field (missing .extension)
    await page.getByPlaceholder('Email').fill('user@domain');
    
    // Verify the text 'user@domain' is entered in the email field
    await expect(page.getByPlaceholder('Email')).toHaveValue('user@domain');
    
    // 3. Observe the validation feedback
    // Verify the validation message 'Email is invalid!' is displayed
    await expect(page.getByText('Email is invalid!')).toBeVisible();
    
    // Verify the Next button remains disabled
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('Email missing domain section shows invalid error', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // 2. Type 'user@.com' in the email field (missing domain name)
    await page.getByPlaceholder('Email').fill('user@.com');
    
    // Verify the text 'user@.com' is entered in the email field
    await expect(page.getByPlaceholder('Email')).toHaveValue('user@.com');
    
    // 3. Observe the validation feedback
    // Verify the validation message 'Email is invalid!' is displayed
    await expect(page.getByText('Email is invalid!')).toBeVisible();
    
    // Verify the Next button remains disabled
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('Valid email with basic format enables Next button', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // 2. Type 'user@example.com' in the email field
    await page.getByPlaceholder('Email').fill('user@example.com');
    
    // Verify the text 'user@example.com' is entered in the email field
    await expect(page.getByPlaceholder('Email')).toHaveValue('user@example.com');
    
    // 3. Observe the form state
    // Verify no validation error message is displayed
    await expect(page.getByText('Email is invalid!')).not.toBeVisible();
    await expect(page.getByText('Email is required!')).not.toBeVisible();
    
    // Verify the Next button is enabled and clickable
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  test('Valid email with plus sign enables Next button', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // 2. Type 'user+test@example.com' in the email field
    await page.getByPlaceholder('Email').fill('user+test@example.com');
    
    // Verify the text 'user+test@example.com' is entered in the email field
    await expect(page.getByPlaceholder('Email')).toHaveValue('user+test@example.com');
    
    // 3. Observe the form state
    // Verify no validation error message is displayed
    await expect(page.getByText('Email is invalid!')).not.toBeVisible();
    
    // Verify the Next button is enabled and clickable
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  test('Valid email with multi-level domain extension enables Next button', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // 2. Type 'user@example.co.uk' in the email field
    await page.getByPlaceholder('Email').fill('user@example.co.uk');
    
    // Verify the text 'user@example.co.uk' is entered in the email field
    await expect(page.getByPlaceholder('Email')).toHaveValue('user@example.co.uk');
    
    // 3. Observe the form state
    // Verify no validation error message is displayed
    await expect(page.getByText('Email is invalid!')).not.toBeVisible();
    
    // Verify the Next button is enabled and clickable
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  test('Email with numbers is accepted as valid format', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // 2. Type 'user123@example456.com' in the email field
    await page.getByPlaceholder('Email').fill('user123@example456.com');
    
    // Verify the text 'user123@example456.com' is entered in the email field
    await expect(page.getByPlaceholder('Email')).toHaveValue('user123@example456.com');
    
    // 3. Observe the form state
    // Verify no validation error message is displayed
    await expect(page.getByText('Email is invalid!')).not.toBeVisible();
    
    // Verify the Next button is enabled and clickable
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  test('Email validation clears when field is emptied', async ({ page }) => {
    // 1. Navigate to https://app.tst.jobsafe.cloud/forgot-password
    await page.goto('https://app.tst.jobsafe.cloud/forgot-password');
    
    // Verify the forgot password form is displayed
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    
    // 2. Type 'invalid.email' in the email field
    await page.getByPlaceholder('Email').fill('invalid.email');
    
    // Verify the validation message 'Email is invalid!' is displayed
    await expect(page.getByText('Email is invalid!')).toBeVisible();
    
    // Verify the Next button is disabled
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    
    // 3. Clear the email field completely
    await page.getByPlaceholder('Email').fill('');
    
    // Verify the validation message 'Email is required!' is displayed
    await expect(page.getByText('Email is required!')).toBeVisible();
    
    // Verify the Next button remains disabled
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    
    // 4. Type 'valid@example.com' in the email field
    await page.getByPlaceholder('Email').fill('valid@example.com');
    
    // Verify the text 'valid@example.com' is entered
    await expect(page.getByPlaceholder('Email')).toHaveValue('valid@example.com');
    
    // Verify no validation error message is displayed
    await expect(page.getByText('Email is invalid!')).not.toBeVisible();
    await expect(page.getByText('Email is required!')).not.toBeVisible();
    
    // Verify the Next button is enabled
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  });
});
