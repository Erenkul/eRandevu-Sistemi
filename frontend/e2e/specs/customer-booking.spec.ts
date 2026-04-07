import { test, expect } from '@playwright/test';
import { BookingPage } from '../pages/BookingPage';
import { ContactFormPage } from '../pages/ContactFormPage';

test.describe('Customer Booking Journey', () => {
  let bookingPage: BookingPage;
  let contactFormPage: ContactFormPage;

  test.beforeEach(({ page }) => {
    bookingPage = new BookingPage(page);
    contactFormPage = new ContactFormPage(page);
  });

  test.skip('customer can complete full booking flow', async ({ page }) => {
    // NOTE: This test requires:
    // 1. Firebase emulator running OR real Firebase data with a business
    // 2. Business with services, staff, and available slots
    //
    // To run properly:
    // 1. Start dev server with Firebase emulator
    // 2. Ensure test business exists with services and staff
    // 3. Run: npx playwright test

    await page.goto('/');

    const businessCard = page.locator('.business-card, .business-item').first();
    await businessCard.click();
    await expect(page).toHaveURL(/\/book\//);

    await bookingPage.expectServiceSelection();
    const firstService = page.locator('.service-card:not(.add-card)').first();
    await firstService.click();
    await bookingPage.clickNext();

    await page.waitForSelector('.staff-card, .staff-item, .staff-card-content');
    const firstStaff = page.locator('.staff-card:not(.add-card), .staff-item').first();
    await firstStaff.click();
    await bookingPage.clickNext();

    await page.waitForSelector('input[type="date"], .date-picker, .calendar-input', { timeout: 5000 });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateStr);

    await page.waitForSelector('.time-slot, .slot-button, button:has-text("09:")', { timeout: 5000 });
    await page.locator('.time-slot, .slot-button, button:has-text("09:")').first().click();
    await bookingPage.clickNext();

    await contactFormPage.fillContactForm({
      fullName: 'Test Kullanıcı',
      phone: '5331234567',
      email: 'test@example.com',
    });

    await page.locator('button:has-text("Randevuyu Onayla"), button:has-text("Onayla")').click();

    await expect(page.locator('.booking-success, .confirmation-card, .confirmation-code')).toBeVisible({ timeout: 10000 });
  });

  test('homepage loads without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.business-card').first()).toBeVisible({ timeout: 10000 });
  });
});
