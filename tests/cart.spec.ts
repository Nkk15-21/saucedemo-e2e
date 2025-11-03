import { test, expect, Page, Locator } from '@playwright/test';
import { login } from '../fixtures/auth';
import { parsePrice } from '../helpers/sorting';

async function addItemByIndex(page: Page, index: number) {
  const card = page.locator('.inventory_item').nth(index);
  await card.getByRole('button', { name: /Add to cart/i }).click();
  const name = (await card.locator('.inventory_item_name, [data-test="inventory-item-name"]').innerText()).trim();
  const price = parsePrice(await card.locator('.inventory_item_price').innerText());
  return { name, price };
}

function cartBadge(page: Page): Locator {
  return page.locator('#shopping_cart_container .shopping_cart_badge');
}

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
    await page.locator('.inventory_list').waitFor();
  });

  test('добавить 2 разных товара, удалить 1, проверить badge и содержимое', async ({ page }) => {
    const a = await addItemByIndex(page, 0);
    const b = await addItemByIndex(page, 1);
    await expect(cartBadge(page)).toHaveText('2');

    await page.locator('#shopping_cart_container a').click();
    await expect(page).toHaveURL(/cart\.html/);

    const items = page.locator('.cart_item');
    await expect(items).toHaveCount(2);

    const names = (await items.locator('.inventory_item_name').allInnerTexts()).map(x => x.trim());
    expect(new Set(names)).toEqual(new Set([a.name, b.name]));

    const pricesText = await items.locator('.inventory_item_price').allInnerTexts();
    const prices = pricesText.map(parsePrice);
    expect(new Set(prices)).toEqual(new Set([a.price, b.price]));

    await items.first().getByRole('button', { name: /Remove/i }).click();
    await expect(items).toHaveCount(1);
    await expect(cartBadge(page)).toHaveText('1');
  });

  test('корзина по иконке из каталога', async ({ page }) => {
    await page.locator('#shopping_cart_container a').click();
    await expect(page).toHaveURL(/cart\.html/);
  });

  test('"Continue Shopping" возвращает в каталог и сохраняет badge', async ({ page }) => {
    await addItemByIndex(page, 2);
    await expect(cartBadge(page)).toHaveText('1');

    await page.locator('#shopping_cart_container a').click();
    await page.getByRole('button', { name: /Continue Shopping/i }).click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(cartBadge(page)).toHaveText('1');
  });

  test('состояние кнопки и после удаления в корзине', async ({ page }) => {
    const card = page.locator('.inventory_item').first();
    await card.getByRole('button', { name: /Add to cart/i }).click();
    await expect(card.getByRole('button', { name: /Remove/i })).toBeVisible();

    await page.locator('#shopping_cart_container a').click();
    await page.locator('.cart_item').first().getByRole('button', { name: /Remove/i }).click();
    await expect(page.locator('.cart_item')).toHaveCount(0);

    await page.getByRole('button', { name: /Continue Shopping/i }).click();
    await expect(card.getByRole('button', { name: /Add to cart/i })).toBeVisible();
  });

  test('problem_user: добавление в корзину работает', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill('problem_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);

    await page.locator('.inventory_item').first().getByRole('button', { name: /Add to cart/i }).click();
    await expect(cartBadge(page)).toHaveText('1');

    await page.locator('#shopping_cart_container a').click();
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });
});
