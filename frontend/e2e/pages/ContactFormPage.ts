import { type Page, type Locator, expect } from '@playwright/test';

export class ContactFormPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly noteInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator('input[name="fullName"], input[placeholder*="ad" i]');
    this.phoneInput = page.locator('input[name="phone"], input[placeholder*="telefon" i], input[type="tel"]');
    this.emailInput = page.locator('input[name="email"], input[placeholder*="email" i], input[type="email"]');
    this.noteInput = page.locator('textarea[name="note"], textarea[placeholder*="not" i]');
  }

  async fillContactForm(data: { fullName: string; phone: string; email?: string; note?: string }) {
    await this.fullNameInput.fill(data.fullName);
    await this.phoneInput.fill(data.phone);
    if (data.email) {
      await this.emailInput.fill(data.email);
    }
    if (data.note) {
      await this.noteInput.fill(data.note);
    }
  }

  async expectVisible() {
    await expect(this.fullNameInput).toBeVisible();
  }
}
