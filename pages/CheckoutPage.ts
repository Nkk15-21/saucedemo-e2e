import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly postalCode: Locator;
  private readonly continueBtn: Locator;
  private readonly finishBtn: Locator;
  private readonly successMsg: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueBtn = page.locator('[data-test="continue"]');
    this.finishBtn = page.locator('[data-test="finish"]');
    this.successMsg = page.getByText(/Thank you for your order!/i);
  }

  async fillStepOne(first: string, last: string, zip: string) {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.postalCode.fill(zip);
    await this.continueBtn.click();
  }

  async finishOrder() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await this.finishBtn.click();
  }

  async expectSuccess() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.successMsg).toBeVisible();
  }
}
