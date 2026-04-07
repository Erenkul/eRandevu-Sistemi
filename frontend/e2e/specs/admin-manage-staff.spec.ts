import { test, expect } from '@playwright/test';
import { StaffPage } from '../pages/StaffPage';

test.describe('Staff Management', () => {
  let staffPage: StaffPage;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffPage(page);
  });

  test.skip('admin can manage staff', async ({ page }) => {
    // NOTE: This test requires Firebase emulator or real credentials

    await page.goto('/login');
    await page.locator('.role-card.business').click();
    await page.fill('.auth-form input[type="email"]', 'admin@test.com');
    await page.fill('.auth-form input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    await staffPage.goto();

    const initialCount = await page.locator('.staff-card:not(.add-card), .staff-item').count();

    await staffPage.clickAddStaff();
    await staffPage.expectModalOpen();

    const testStaffName = `Test Personel ${Date.now()}`;
    await staffPage.fillStaffForm({
      name: testStaffName,
      role: 'berber',
      phone: '5331234567',
      email: 'test@staff.com',
    });
    await staffPage.clickSave();

    await page.waitForTimeout(1000);
    await expect(page.locator(`.staff-card:has-text("${testStaffName}"), .staff-item:has-text("${testStaffName}")`)).toBeVisible();

    const editButton = page.locator('.staff-action-btn.edit').first();
    await editButton.click();
    await staffPage.expectModalOpen();
    await staffPage.clickSave();
  });

  test.skip('admin can delete staff', async ({ page }) => {
    // NOTE: This test requires Firebase emulator or real credentials

    await staffPage.goto();

    const initialCount = await page.locator('.staff-card:not(.add-card), .staff-item').count();
    if (initialCount > 1) {
      await staffPage.deleteFirstStaff();
      await page.waitForTimeout(1000);
    }
  });

  test('staff page loads', async ({ page }) => {
    await page.goto('/admin/staff');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  });
});
