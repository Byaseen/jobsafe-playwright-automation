import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { HomePage } from './pages/homePage';

const email = process.env.USER_EMAIL;
const password = process.env.USER_PASSWORD;

test.describe('Home page', () => {
    test.beforeAll(function () {
        test.skip(!email || !password, 'Missing USER_EMAIL or USER_PASSWORD');
    });

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.fillEmail(email!);
        await loginPage.fillPassword(password!);
        await loginPage.submit();
    });

    test('should load the home page after login', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.expectHomeLoaded();
    });

    test('should display homepage navigation buttons', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.expectNavigationButtons();
    });

    test('My reports tab should navigate to the reports page', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.myReportsTab.click();
        await expect(page).toHaveURL(/\/incident-reports/, { timeout: 20000 });
    });

    test('Documents tab should navigate to the documents page', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.documentsTab.click();
        await expect(page).toHaveURL(/\/company-documents/, { timeout: 20000 });
    });

    test('sidebar menu should open and display navigation items', async ({ page }) => {
        await page.getByRole('button', { name: 'menu' }).click();
        await expect(page.locator('ion-item-divider')).toBeVisible();
        await expect(page.getByText('Settings', { exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Submitted Report' })).toBeVisible();
        await expect(page.getByText('Admin', { exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'User Management' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();
        await expect(page.getByText('Logout', { exact: true })).toBeVisible();
    });

    test('SOS tab should show SOS modal', async ({ page }) => {
        await page.getByRole('tab', { name: 'SOS' }).click();
        await expect(page.getByText('Choose an emergency contact option', { exact: true })).toBeVisible();
    });

    test('should navigate to profile settings from the homepage menu', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.goToProfile();
    });
});
