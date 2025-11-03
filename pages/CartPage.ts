import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  private readonly items: Locator;
  private readonly checkoutBtn: Locator;

  constructor(private readonly page: Page) {
    this.items = page.locator('.cart_item');
    this.checkoutBtn = page.locator('[data-test="checkout"]');
  }

  async expectOpened() {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async expectItemsCount(n: number) {
    await expect(this.items).toHaveCount(n);
  }

  async checkout() {
    await this.checkoutBtn.click();
  }
}
