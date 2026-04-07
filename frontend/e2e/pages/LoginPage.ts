import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly businessRoleCard: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.businessRoleCard = page.locator('.role-card.business');
    this.emailInput = page.locator('.auth-form input[type="email"]');
    this.passwordInput = page.locator('.auth-form input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]:has-text("Giriş")');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async selectBusinessRole() {
    await this.businessRoleCard.click();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAsBusiness(email: string, password: string) {
    await this.businessRoleCard.click();
    await this.page.waitForTimeout(500);
    await this.page.waitForSelector('.auth-form', { state: 'attached', timeout: 15000 });
    await this.login(email, password);
  }

  async expectLoginFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}
