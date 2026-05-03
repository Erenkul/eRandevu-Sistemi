import { test, expect } from '@playwright/test';
import { ServicesPage } from '../pages/ServicesPage';

test.describe('Service Management', () => {
  let servicesPage: ServicesPage;

  test.beforeEach(async ({ page }) => {
    servicesPage = new ServicesPage(page);
  });

  test.skip('admin can manage services', async ({ page }) => {
    // NOTE: This test requires Firebase emulator or real credentials

    await page.goto('/login');
    await page.locator('.role-card.business').click();
    await page.fill('.auth-form input[type="email"]', 'admin@test.com');
    await page.fill('.auth-form input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    await servicesPage.goto();

    await servicesPage.clickAddService();
    await servicesPage.expectModalOpen();

    const testServiceName = `Test Hizmet ${Date.now()}`;
    await servicesPage.fillServiceForm({
      name: testServiceName,
      duration: 30,
      price: 150,
      category: 'Saç',
    });
    await servicesPage.clickSave();

    await page.waitForTimeout(1000);
    await expect(page.locator(`.service-card:has-text("${testServiceName}")`)).toBeVisible();

    const editButton = page.locator('.service-action-btn.edit').first();
    await editButton.click();
    await servicesPage.expectModalOpen();
    await servicesPage.clickSave();
  });

  test.skip('admin can delete service', async ({ page }) => {
    // NOTE: This test requires Firebase emulator or real credentials

    await servicesPage.goto();

    if (await page.locator('.service-card:not(.add-card)').count() > 1) {
      await servicesPage.deleteFirstService();
      await page.waitForTimeout(1000);
    }
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/admin/services');
    await page.waitForURL(/\/(login|admin\/services)/, { timeout: 10000 });
    const url = page.url();
    if (url.includes('/login')) {
      await expect(page.locator('.role-card.business')).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.locator('.admin-dashboard, .admin-main')).toBeVisible({ timeout: 5000 });
    }
  });
});
