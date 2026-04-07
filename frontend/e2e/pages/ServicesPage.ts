import { type Page, type Locator, expect } from '@playwright/test';

export class ServicesPage {
  readonly page: Page;
  readonly serviceCards: Locator;
  readonly addButton: Locator;
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly durationInput: Locator;
  readonly priceInput: Locator;
  readonly categorySelect: Locator;
  readonly saveButton: Locator;
  readonly deleteButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.serviceCards = page.locator('.service-card:not(.add-card)');
    this.addButton = page.locator('button:has-text("Yeni Hizmet"), .add-service-btn');
    this.modal = page.locator('.modal-content');
    this.nameInput = this.modal.locator('input[type="text"], input[name="name"]');
    this.durationInput = this.modal.locator('input[type="number"][min="5"]');
    this.priceInput = this.modal.locator('input[type="number"][min="0"]');
    this.categorySelect = this.modal.locator('select');
    this.saveButton = this.modal.locator('button:has-text("Ekle"), button:has-text("Güncelle")');
    this.deleteButtons = page.locator('.service-action-btn.delete');
  }

  async goto() {
    await this.page.goto('/admin/services');
  }

  async clickAddService() {
    await this.addButton.click();
  }

  async fillServiceForm(data: { name: string; duration: number; price: number; category?: string }) {
    await this.nameInput.fill(data.name);
    await this.durationInput.fill(String(data.duration));
    await this.priceInput.fill(String(data.price));
    if (data.category) {
      await this.categorySelect.selectOption(data.category);
    }
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async deleteFirstService() {
    await this.deleteButtons.first().click();
    await this.page.on('dialog', dialog => dialog.accept());
  }

  async expectModalOpen() {
    await expect(this.modal).toBeVisible();
  }

  async expectServiceCount(minCount: number) {
    await expect(this.serviceCards).toHaveCount({ timeout: 5000 }, minCount);
  }
}
