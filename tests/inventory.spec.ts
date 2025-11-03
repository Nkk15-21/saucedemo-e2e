import { test, expect, Page } from '@playwright/test';
import { login } from '../fixtures/auth';
import { byNameAsc, byNameDesc, byPriceAsc, byPriceDesc, parsePrice } from '../helpers/sorting';

function sortSelect(page: Page) {
  // Универсальный локатор: data-test или класс
  return page.locator(
    'select[data-test="product_sort_container"], select.product_sort_container, [data-test="product_sort_container"]'
  );
}

async function readCards(page: Page): Promise<{ names: string[]; prices: number[]; count: number }> {
  const cards = page.locator('.inventory_item');
  const count = await cards.count();
  const names: string[] = [];
  const prices: number[] = [];
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const name = await card.locator('.inventory_item_name, [data-test="inventory-item-name"]').innerText();
    const priceText = await card.locator('.inventory_item_price').innerText();
    names.push(name.trim());
    prices.push(parsePrice(priceText));
  }
  return { names, prices, count };
}

test.describe('Inventory sorting & navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
    await page.locator('.inventory_list').waitFor();
    await expect(sortSelect(page)).toBeVisible({ timeout: 10000 });
  });

  test('Name (A to Z)', async ({ page }) => {
    const sort = sortSelect(page);
    await sort.scrollIntoViewIfNeeded();
    await sort.selectOption('az');

    const { names } = await readCards(page);
    const sorted = [...names].sort(byNameAsc);
    expect(names).toEqual(sorted);
  });

  test('Name (Z to A)', async ({ page }) => {
    const sort = sortSelect(page);
    await sort.selectOption('za');

    const { names } = await readCards(page);
    const sorted = [...names].sort(byNameDesc);
    expect(names).toEqual(sorted);
  });

  test('Price (low to high)', async ({ page }) => {
    const sort = sortSelect(page);
    await sort.selectOption('lohi');

    const { prices } = await readCards(page);
    const sorted = [...prices].sort(byPriceAsc);
    expect(prices).toEqual(sorted);
  });

  test('Price (high to low)', async ({ page }) => {
    const sort = sortSelect(page);
    await sort.selectOption('hilo');

    const { prices } = await readCards(page);
    const sorted = [...prices].sort(byPriceDesc);
    expect(prices).toEqual(sorted);
  });

  test('Back navigation säilitab sorteerimise', async ({ page }) => {
    const sort = sortSelect(page);
    await sort.selectOption('hilo');
    const selectedBefore = await sort.inputValue();

    await page.locator('.inventory_item').first()
      .locator('.inventory_item_name, [data-test="inventory-item-name"]').click();
    await expect(page).toHaveURL(/inventory-item/);

    await page.getByRole('button', { name: /Back to products/i }).click();
    await expect(page).toHaveURL(/inventory\.html/);

    // ждём пока сортировка снова появится
    await expect(sortSelect(page)).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');

    const selectedAfter = await sortSelect(page).inputValue();
    expect(selectedAfter).toBe(selectedBefore);
  });

  test('performance_glitch_user: каталог рендерится', async ({ browser }) => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto('https://www.saucedemo.com/');
    await p.getByPlaceholder('Username').fill('performance_glitch_user');
    await p.getByPlaceholder('Password').fill('secret_sauce');
    await p.getByRole('button', { name: 'Login' }).click();
    await expect(p).toHaveURL(/inventory\.html/);

    const items = p.locator('.inventory_list .inventory_item');
    expect(await items.count()).toBeGreaterThan(0);

    await items.first().locator('.inventory_item_name, [data-test="inventory-item-name"]').click();
    await expect(p.getByRole('button', { name: /Back to products/i })).toBeVisible();
    await p.goBack();
    await expect(p.locator('.inventory_list')).toBeVisible();

    await ctx.close();
  });
});
