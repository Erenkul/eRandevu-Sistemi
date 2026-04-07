import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly statsCards: Locator;
  readonly fabButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('.admin-sidebar');
    this.statsCards = page.locator('.stats-card, .dashboard-stats');
    this.fabButton = page.locator('.fab-button');
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async expectLoaded() {
    await expect(this.page.locator('.admin-dashboard')).toBeVisible();
  }

  async expectStatsLoaded() {
    await expect(this.statsCards.first()).toBeVisible({ timeout: 10000 });
  }
}
