import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Admin Login & Dashboard', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test.skip('admin can login and view dashboard', async ({ page }) => {
    // NOTE: This test requires:
    // 1. Firebase emulator running OR valid Firebase credentials in .env.local
    // 2. Test admin account created in Firebase
    // 3. A business with onboarding completed
    //
    // To run with Firebase emulator:
    // 1. Start emulator: npx firebase emulators:start
    // 2. Create test data and accounts
    // 3. Run tests: npx playwright test

    await loginPage.goto();
    await loginPage.loginAsBusiness('admin@test.com', 'password123');

    await page.waitForURL(/\/admin/, { timeout: 10000 });

    await dashboardPage.expectLoaded();
    await dashboardPage.expectStatsLoaded();
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page shows role selection', async ({ page }) => {
    await loginPage.goto();
    await expect(page.locator('.auth-page')).toBeVisible();
    await expect(page.locator('.role-card.business')).toBeVisible();
    await expect(page.locator('.role-card.customer')).toBeVisible();
  });
});
