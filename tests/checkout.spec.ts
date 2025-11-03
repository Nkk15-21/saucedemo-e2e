import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { parsePrice } from '../helpers/sorting';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
    await page.locator('.inventory_list').waitFor();
  });

  test('Step One: заполнить поля и попасть на Overview (Step Two)', async ({ page }) => {
    // добавим 2 позиции, чтобы была математика
    await page.locator('.inventory_item').nth(0).getByRole('button', { name: /Add to cart/i }).click();
    await page.locator('.inventory_item').nth(1).getByRole('button', { name: /Add to cart/i }).click();

    await page.locator('#shopping_cart_container a').click();
    await page.getByRole('button', { name: /Checkout/i }).click();

    // Позитив
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await page.getByPlaceholder('First Name').fill('Test');
    await page.getByPlaceholder('Last Name').fill('User');
    await page.getByPlaceholder('Zip\/Postal Code').fill('12345');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(2);
  });

  test('Step One: негатив — пустые поля по очереди с точными сообщениями', async ({ page }) => {
    await page.locator('.inventory_item').first().getByRole('button', { name: /Add to cart/i }).click();
    await page.locator('#shopping_cart_container a').click();
    await page.getByRole('button', { name: /Checkout/i }).click();

    // пусто всё
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText('Error: First Name is required')).toBeVisible();

    await page.getByPlaceholder('First Name').fill('A');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText('Error: Last Name is required')).toBeVisible();

    await page.getByPlaceholder('Last Name').fill('B');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText('Error: Postal Code is required')).toBeVisible();

    // Cancel уводит назад в корзину
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page).toHaveURL(/cart\.html/);
  });

  test('Математика на Overview: Item total, Tax, Total', async ({ page }) => {
    // 2 товара
    const prices: number[] = [];
    for (const i of [0, 1]) {
      const card = page.locator('.inventory_item').nth(i);
      prices.push(parsePrice(await card.locator('.inventory_item_price').innerText()));
      await card.getByRole('button', { name: /Add to cart/i }).click();
    }
    const expectedSum = prices[0] + prices[1];

    await page.locator('#shopping_cart_container a').click();
    await page.getByRole('button', { name: /Checkout/i }).click();
    await page.getByPlaceholder('First Name').fill('T');
    await page.getByPlaceholder('Last Name').fill('U');
    await page.getByPlaceholder('Zip\/Postal Code').fill('10000');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);

    const itemTotalText = await page.locator('.summary_subtotal_label').innerText(); // "Item total: $XX.XX"
    const taxText = await page.locator('.summary_tax_label').innerText();            // "Tax: $X.XX"
    const totalText = await page.locator('.summary_total_label').innerText();        // "Total: $YY.YY"

    const itemTotal = Number(itemTotalText.replace(/[^0-9.]/g, ''));
    const tax = Number(taxText.replace(/[^0-9.]/g, ''));
    const total = Number(totalText.replace(/[^0-9.]/g, ''));

    expect(itemTotal).toBeCloseTo(expectedSum, 2);
    expect(total).toBeCloseTo(itemTotal + tax, 2);
  });

  test('Step One: Cancel → назад в корзину', async ({ page }) => {
    await page.locator('.inventory_item').first().getByRole('button', { name: /Add to cart/i }).click();
    await page.locator('#shopping_cart_container a').click();
    await page.getByRole('button', { name: /Checkout/i }).click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page).toHaveURL(/cart\.html/);
  });

  test('Checkout lõpuni (Finish) → complete', async ({ page }) => {
    await page.locator('.inventory_item').first().getByRole('button', { name: /Add to cart/i }).click();
    await page.locator('#shopping_cart_container a').click();
    await page.getByRole('button', { name: /Checkout/i }).click();
    await page.getByPlaceholder('First Name').fill('Complete');
    await page.getByPlaceholder('Last Name').fill('Flow');
    await page.getByPlaceholder('Zip\/Postal Code').fill('55555');
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('button', { name: /Finish/i }).click();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.getByText(/Thank you for your order!/i)).toBeVisible();
  });
});
