import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';
import { APP_ROUTES } from '../config/test.config';
import { parsePriceString } from '../utils/custom-assertions';

export class CartPage extends BasePage {
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartList = page.getByTestId('cart-list');
    this.cartItems = page.getByTestId('inventory-item');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto(): Promise<void> {
    await this.page.goto(APP_ROUTES.CART);
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async getCartItemPrices(): Promise<number[]> {
    const texts = await this.page.getByTestId('inventory-item-price').allTextContents();
    return texts.map(parsePriceString);
  }

  async removeItem(productId: string): Promise<void> {
    await allure.step(`Remove "${productId}" from cart`, async () => {
      await this.page.getByTestId(`remove-${productId}`).click();
    });
  }

  async assertItemInCart(itemName: string): Promise<void> {
    const names = await this.getCartItemNames();
    expect(names).toContain(itemName);
  }

  async assertItemNotInCart(itemName: string): Promise<void> {
    const names = await this.getCartItemNames();
    expect(names).not.toContain(itemName);
  }

  async assertCartEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }

  async proceedToCheckout(): Promise<void> {
    await allure.step('Proceed to checkout', async () => {
      await this.checkoutButton.click();
      await this.page.waitForURL(`**${APP_ROUTES.CHECKOUT_STEP_ONE}`);
    });
  }

  async continueShopping(): Promise<void> {
    await allure.step('Continue shopping', async () => {
      await this.continueShoppingButton.click();
      await this.page.waitForURL(`**${APP_ROUTES.INVENTORY}`);
    });
  }

  async assertOnCartPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(APP_ROUTES.CART.replace(/\//g, '\\/')));
  }
}
