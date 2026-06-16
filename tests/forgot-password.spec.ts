import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';

test.describe('Forgot password flow', () => {
    test('forgot password page renders core elements', async ({ page }) => {
        const forgot = new ForgotPasswordPage(page);
        await forgot.goto();
        await expect(page.getByRole('heading', { name: 'Forgotten password' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Simply provide us with your Email:' })).toBeVisible();
        await expect(page.getByPlaceholder('Email')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Go back to previous screen' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'back', exact: true })).toBeVisible();
    });

    test('empty email shows required validation', async ({ page }) => {
        const forgot = new ForgotPasswordPage(page);
        await forgot.goto();
        await page.getByPlaceholder('Email').focus();
        await page.getByRole('button', { name: 'back', exact: true }).click();
        await forgot.goto();
        await page.getByPlaceholder('Email').focus();
        await page.getByPlaceholder('Email').press('Tab');
        await expect(page.locator('text=Email is required!')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    test('valid email enables Next and advances flow', async ({ page }) => {
        const forgot = new ForgotPasswordPage(page);
        await forgot.goto();
        await forgot.fillEmail('test@test.com');
        await expect(page.locator('text=Email is invalid!')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
        await forgot.clickNext();
        await expect(page).toHaveURL(/check-email-exists/);
        await expect(page.getByRole('heading', { name: 'Thank you!' })).toBeVisible();
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

    test('Change passowrd button is working in forget password thankyou page', async ({ page }) => {
        await page.getByPlaceholder('Email').fill('test@test.com');
        await page.getByRole('button', { name: 'Next' }).click();
        await expect(page).toHaveURL(/.*check-email-exists/);
        await page.getByRole('button', { name: 'Change Password' }).click();
        await expect(page).toHaveURL(/.*change-password/);

    });

});
