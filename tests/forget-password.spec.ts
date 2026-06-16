import { test, expect } from '@playwright/test';
import { login } from '../utils/login';

test.beforeEach(async ({ page }) => {
  await page.goto('/forgot-password');
  await expect(page).toHaveURL(/\/forgot-password/);
});


test('Next button is disabled when email field is empty', async ({ page }) => {
  const nextButton = page.getByRole('button', { name: 'Next' });
  await expect(nextButton).toBeDisabled();
});

test('Email field show required message when clicked on', async ({ page }) => {
    await page.getByPlaceholder('Email').click();
    await page.keyboard.press('Tab'); 
    await expect(page.getByText('Email is required!', { exact: true })).toBeVisible();
});

test('Invalid email format shows error message', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('invalidemail.com');
    await expect(page.getByText('Email is invalid!', { exact: true })).toBeVisible();
});

test('Valid email allows user to proceed', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('test@test.com');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/.*check-email-exists/);
});

test('Back to login link navigates to login page', async ({ page }) => {
    await page.getByRole('button', { name: 'Go back to previous screen' }).click();
    await expect(page).toHaveURL(/.*login/);
});

test('Need help button showing the need help contact us modal', async ({ page }) => {
    await page.getByRole('banner').getByRole('button').click();
    await expect(page.locator('div').filter({ hasText: 'Need help? - Contact usFor' })).toBeVisible();
});
