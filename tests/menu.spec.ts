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

  // tests/menu.spec.ts
  test('Reset App State очищает корзину и возвращает кнопки "Add to cart"', async ({ page }) => {
    const firstCard = page.locator('.inventory_item').first();
    const addBtn = firstCard.getByRole('button', { name: /Add to cart/i });
    const badge = page.locator('#shopping_cart_container .shopping_cart_badge');

    // добавим товар
    await addBtn.click();
    await expect(badge).toHaveText('1');

    // reset
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('link', { name: 'Reset App State' }).click();

    // чаще всего сбрасывается, но меню ещё открыто → закроем
    await page.getByRole('button', { name: 'Close Menu' }).click().catch(() => {});
    // и гарантируем обновление страницы/состояния
    await page.reload();

    // badge исчез
    await expect(badge).toHaveCount(0);

    // кнопка снова "Add to cart"
    await expect(firstCard.getByRole('button', { name: /Add to cart/i })).toBeVisible({ timeout: 10000 });

    // и корзина пуста
    await page.locator('#shopping_cart_container a').click();
    await expect(page.locator('.cart_item')).toHaveCount(0);
  });

});
