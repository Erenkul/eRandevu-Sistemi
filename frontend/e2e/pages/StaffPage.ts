import { type Page, type Locator, expect } from '@playwright/test';

export class StaffPage {
  readonly page: Page;
  readonly staffCards: Locator;
  readonly addButton: Locator;
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly roleSelect: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly deleteButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.staffCards = page.locator('.staff-card, .staff-item');
    this.addButton = page.locator('button:has-text("Yeni Personel"), .add-staff-btn');
    this.modal = page.locator('.modal-content');
    this.nameInput = this.modal.locator('input[type="text"], input[name="name"]');
    this.roleSelect = this.modal.locator('select[name="role"], select');
    this.phoneInput = this.modal.locator('input[type="tel"], input[name="phone"]');
    this.emailInput = this.modal.locator('input[type="email"], input[name="email"]');
    this.saveButton = this.modal.locator('button:has-text("Ekle"), button:has-text("Güncelle")');
    this.deleteButtons = page.locator('.staff-action-btn.delete');
  }

  async goto() {
    await this.page.goto('/admin/staff');
  }

  async clickAddStaff() {
    await this.addButton.click();
  }

  async fillStaffForm(data: { name: string; role?: string; phone?: string; email?: string }) {
    await this.nameInput.fill(data.name);
    if (data.role) {
      await this.roleSelect.selectOption(data.role);
    }
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
    if (data.email) {
      await this.emailInput.fill(data.email);
    }
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async deleteFirstStaff() {
    await this.deleteButtons.first().click();
    await this.page.on('dialog', dialog => dialog.accept());
  }

  async expectModalOpen() {
    await expect(this.modal).toBeVisible();
  }
}
