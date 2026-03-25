import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';
import { APP_ROUTES, SORT_OPTIONS } from '../config/test.config';
import { parsePriceString } from '../utils/custom-assertions';

type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

/**
 * InventoryPage — product catalog at /inventory.html
 */
export class InventoryPage extends BasePage {
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryContainer = page.getByTestId('inventory-container');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.pageTitle = page.getByTestId('title');
  }

  /** Navigate directly to the inventory page (requires prior authentication). */
  async goto(): Promise<void> {
    await this.page.goto(APP_ROUTES.INVENTORY);
  }

  /** Assert the inventory container and items are visible. */
  async assertInventoryLoaded(): Promise<void> {
    await expect(this.inventoryContainer).toBeVisible();
    await expect(this.inventoryItems.first()).toBeVisible();
  }

  /** Return the number of product items displayed. */
  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  /** Return all product names as an array of strings. */
  async getItemNames(): Promise<string[]> {
    const nameLocators = this.page.getByTestId('inventory-item-name');
    return nameLocators.allTextContents();
  }

  /** Return all product prices as floats. */
  async getItemPrices(): Promise<number[]> {
    const priceLocators = this.page.getByTestId('inventory-item-price');
    const texts = await priceLocators.allTextContents();
    return texts.map(parsePriceString);
  }

  /** Return the src attribute of every product image (in DOM order). */
  async getItemImageSrcs(): Promise<string[]> {
    const images = this.page.locator('.inventory_item_img img');
    const count = await images.count();
    const srcs: string[] = [];
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src');
      srcs.push(src ?? '');
    }
    return srcs;
  }

  /** Select a sort option from the dropdown. */
  async sortBy(option: SortOption): Promise<void> {
    await allure.step(`Sort products by "${option}"`, async () => {
      await this.sortDropdown.selectOption(option);
    });
  }

  /** Click the Add to Cart button for a product by its data-test id. */
  async addItemToCart(addToCartTestId: string): Promise<void> {
    await allure.step(`Add item to cart (${addToCartTestId})`, async () => {
      await this.page.getByTestId(addToCartTestId).click();
    });
  }

  /** Click the Remove button for a product by its data-test id. */
  async removeItemFromCart(removeTestId: string): Promise<void> {
    await allure.step(`Remove item from cart (${removeTestId})`, async () => {
      await this.page.getByTestId(removeTestId).click();
    });
  }

  /** Assert inventory page URL. */
  async assertOnInventoryPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(APP_ROUTES.INVENTORY.replace(/\//g, '\\/')));
  }
}
