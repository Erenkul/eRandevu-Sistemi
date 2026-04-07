import { type Page, type Locator, expect } from '@playwright/test';

export class BookingPage {
  readonly page: Page;
  readonly serviceCards: Locator;
  readonly staffCards: Locator;
  readonly datePicker: Locator;
  readonly timeSlots: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.serviceCards = page.locator('.service-card:not(.add-card)');
    this.staffCards = page.locator('.staff-card, .staff-item');
    this.datePicker = page.locator('input[type="date"], .date-picker, .calendar-input');
    this.timeSlots = page.locator('.time-slot, .slot-button, button:has-text("09:")');
    this.nextButton = page.locator('button:has-text("Devam"), button:has-text("Onayla")');
    this.backButton = page.locator('button:has-text("Geri")');
  }

  async goto(slug: string) {
    await this.page.goto(`/book/${slug}`);
  }

  async selectService(name: string) {
    await this.serviceCards.filter({ hasText: name }).first().click();
  }

  async selectStaff(name: string) {
    await this.staffCards.filter({ hasText: name }).first().click();
  }

  async selectDate(date: string) {
    await this.datePicker.fill(date);
  }

  async selectTimeSlot(time: string) {
    await this.timeSlots.filter({ hasText: time }).first().click();
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async expectServiceSelection() {
    await expect(this.serviceCards.first()).toBeVisible();
  }

  async expectConfirmation() {
    await expect(this.page.locator('.booking-success, .confirmation-card')).toBeVisible();
  }
}
