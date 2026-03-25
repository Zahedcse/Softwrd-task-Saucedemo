import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';
import { APP_ROUTES, CHECKOUT_COMPLETE } from '../config/test.config';

export class CheckoutCompletePage extends BasePage {
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly ponyExpressImage: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.ponyExpressImage = page.locator('.pony_express');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async assertOrderConfirmed(): Promise<void> {
    await allure.step('Assert order confirmation screen', async () => {
      await expect(this.completeHeader).toHaveText(CHECKOUT_COMPLETE.HEADER);
      await expect(this.completeText).toHaveText(CHECKOUT_COMPLETE.TEXT);
      await expect(this.ponyExpressImage).toBeVisible();
      await expect(this.backHomeButton).toBeVisible();
    });
  }

  async goBackHome(): Promise<void> {
    await allure.step('Click Back Home', async () => {
      await this.backHomeButton.click();
      await this.page.waitForURL(`**${APP_ROUTES.INVENTORY}`);
    });
  }

  async assertOnCompletePage(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(APP_ROUTES.CHECKOUT_COMPLETE.replace(/\//g, '\\/')),
    );
  }
}
