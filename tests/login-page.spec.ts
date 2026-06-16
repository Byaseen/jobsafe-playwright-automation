import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';

test.describe('Login page', () => {
  test('renders core elements', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Choose one of the following methods:' })).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Choose a password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'No Account? Create an account' })).toBeVisible();
  });

  test('login button disabled when fields are empty', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  test('invalid email format shows inline error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail('testtest.com');
    await page.getByPlaceholder('Choose a password').click();
    await expect(page.locator('text=Email is invalid!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  test('valid credentials redirect to home', async ({ page }) => {
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASSWORD;
    test.skip(!email || !password, 'Missing USER_EMAIL or USER_PASSWORD');
    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(email!);
    await login.fillPassword(password!);
    await login.submit();
    await expect(page).toHaveURL(/app\/home/);
    await expect(page.locator('#job_tabs')).toBeVisible({ timeout: 20000 });
  });
});

test('empty submit shows validation errors', async ({ page }) => {
    await page.getByPlaceholder('Email').click();
    await page.getByPlaceholder('Choose a password').click();
    await page.keyboard.press('Tab');
    await expect(page.getByText('Email is required!', { exact: true })).toBeVisible();
    await expect(page.getByText('Password is required!', { exact: true })).toBeVisible();
});

test('forgot password link navigates to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot Password?' }).click();
    await expect(page).toHaveURL(/.*forgot-password/);
});

test('Need help contact us modal working when clicking on the ? icon', async ({ page }) => {
    await page.getByRole('banner').getByRole('button').click();
    await expect(page.locator('div').filter({ hasText: 'Need help? - Contact usFor' })).toBeVisible();
});
