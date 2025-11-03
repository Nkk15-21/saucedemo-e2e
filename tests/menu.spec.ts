import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

test.describe('Burger menu', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
  });

  test('All Items из корзины открывает /inventory.html', async ({ page }) => {
    await page.locator('#shopping_cart_container a').click();
    await expect(page).toHaveURL(/cart\.html/);

    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('link', { name: 'All Items' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('About открывает сайт Sauce Labs', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('link', { name: 'About' }).click();

    await expect(page).toHaveURL(/saucelabs\.com/);
  });

  test('Reset App State очищает корзину и возвращает кнопки "Add to cart"', async ({ page }) => {
    const firstCard = page.locator('.inventory_item').first();
    await firstCard.getByRole('button', { name: /Add to cart/i }).click();
    const badge = page.locator('#shopping_cart_container .shopping_cart_badge');
    await expect(badge).toHaveText('1');

    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('link', { name: 'Reset App State' }).click();

    await expect(badge).toHaveCount(0);
    // ждём появления "Add to cart" заново
    await expect(firstCard.getByRole('button', { name: /Add to cart/i }))
      .toBeVisible({ timeout: 5000 });

    await page.locator('#shopping_cart_container a').click();
    await expect(page.locator('.cart_item')).toHaveCount(0);
  });
});
