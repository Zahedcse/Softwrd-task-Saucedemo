import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';
import { APP_ROUTES } from '../config/test.config';
import { parsePriceString } from '../utils/custom-assertions';

/**
 * CartPage — shopping cart at /cart.html
 */
export class CartPage extends BasePage {
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartList = page.getByTestId('cart-list');
    // SauceDemo uses data-test="inventory-item" on cart item rows (not "cart-item")
    this.cartItems = page.getByTestId('inventory-item');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  /** Navigate directly to the cart page. */
  async goto(): Promise<void> {
    await this.page.goto(APP_ROUTES.CART);
  }

  /** Return the number of items in the cart list. */
  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  /** Return all item names in the cart. */
  async getCartItemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  /** Return all item prices in the cart as floats. */
  async getCartItemPrices(): Promise<number[]> {
    const texts = await this.page.getByTestId('inventory-item-price').allTextContents();
    return texts.map(parsePriceString);
  }

  /** Remove a cart item by its product id (e.g. 'sauce-labs-backpack'). */
  async removeItem(productId: string): Promise<void> {
    await allure.step(`Remove "${productId}" from cart`, async () => {
      await this.page.getByTestId(`remove-${productId}`).click();
    });
  }

  /** Assert a specific item name is present in the cart. */
  async assertItemInCart(itemName: string): Promise<void> {
    const names = await this.getCartItemNames();
    expect(names).toContain(itemName);
  }

  /** Assert a specific item name is NOT in the cart. */
  async assertItemNotInCart(itemName: string): Promise<void> {
    const names = await this.getCartItemNames();
    expect(names).not.toContain(itemName);
  }

  /** Assert the cart is empty (no items listed). */
  async assertCartEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }

  /** Click the Checkout button to proceed to checkout step 1. */
  async proceedToCheckout(): Promise<void> {
    await allure.step('Proceed to checkout', async () => {
      await this.checkoutButton.click();
      await this.page.waitForURL(`**${APP_ROUTES.CHECKOUT_STEP_ONE}`);
    });
  }

  /** Click Continue Shopping to return to inventory. */
  async continueShopping(): Promise<void> {
    await allure.step('Continue shopping', async () => {
      await this.continueShoppingButton.click();
      await this.page.waitForURL(`**${APP_ROUTES.INVENTORY}`);
    });
  }

  /** Assert that the cart page is displayed. */
  async assertOnCartPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(APP_ROUTES.CART.replace(/\//g, '\\/')));
  }
}
