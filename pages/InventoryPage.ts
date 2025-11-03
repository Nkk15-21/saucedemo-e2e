import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  private readonly title: Locator;
  private readonly firstItem: Locator;
  private readonly cartBadge: Locator;
  private readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByText('Products');
    this.firstItem = page.locator('.inventory_item').first();
    this.cartBadge = page.locator('#shopping_cart_container .shopping_cart_badge');
    this.cartLink = page.locator('#shopping_cart_container a');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toBeVisible();
  }

  async addFirstItem() {
    await this.firstItem.getByRole('button', { name: /add to cart/i }).click();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async expectCartCount(n: number) {
    await expect(this.cartBadge).toHaveText(String(n));
  }
}
