// tests/menu.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';

test.describe('Burger menu', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
  });

  test('All Items из корзины открывает /inventory.html', async ({ page }) => {
    // уйдём в корзину
    await page.locator('#shopping_cart_container a').click();
    await expect(page).toHaveURL(/cart\.html/);

    // откроем бургер-меню и кликнем All Items
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('link', { name: 'All Items' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('About открывает сайт Sauce Labs (новая вкладка/окно)', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Menu' }).click();

    const [aboutPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('link', { name: 'About' }).click(),
    ]);

    await expect(aboutPage).toHaveURL(/saucelabs\.com/);
    await aboutPage.close();
  });

  test('Reset App State очищает корзину и возвращает кнопки "Add to cart"', async ({ page }) => {
    // Добавим товар, убедимся что badge=1
    const firstCard = page.locator('.inventory_item').first();
    await firstCard.getByRole('button', { name: /Add to cart/i }).click();
    const badge = page.locator('#shopping_cart_container .shopping_cart_badge');
    await expect(badge).toHaveText('1');

    // Сброс состояния
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('link', { name: 'Reset App State' }).click();

    // Badge исчез
    await expect(badge).toHaveCount(0);

    // Кнопка на карточке снова "Add to cart"
    await expect(firstCard.getByRole('button', { name: /Add to cart/i })).toBeVisible();

    // И корзина пуста
    await page.locator('#shopping_cart_container a').click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(0);
  });
});
