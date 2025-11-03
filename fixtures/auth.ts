import { Page, expect } from '@playwright/test';

export async function login(page: Page, user: string, pass: string) {
  // логин всегда через полный URL, чтобы не зависеть от baseURL
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill(user);
  await page.getByPlaceholder('Password').fill(pass);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
}
