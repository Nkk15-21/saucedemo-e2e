import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('standard_user → /inventory.html', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('locked_out_user → точный текст ошибки и URL не меняется', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Sorry, this user has been locked out.')).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('пустые поля → нужные сообщения', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Username is required')).toBeVisible();

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('неверный пароль → "do not match" и URL не меняется', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('wrong');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Username and password do not match/i)).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  // redirect tests
  test('direct /inventory ilma sisselogimiseta → redirect /', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/inventory.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('direct /cart ilma sisselogimiseta → redirect /', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
