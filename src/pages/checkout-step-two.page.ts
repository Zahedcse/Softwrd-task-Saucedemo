import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';
import { APP_ROUTES } from '../config/test.config';

/**
 * CheckoutStepTwoPage — order review at /checkout-step-two.html
 */
export class CheckoutStepTwoPage extends BasePage {
  readonly summaryContainer: Locator;
  readonly cartItems: Locator;
  readonly paymentInfoLabel: Locator;
  readonly shippingInfoLabel: Locator;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.summaryContainer = page.getByTestId('checkout-summary-container');
    this.cartItems = page.getByTestId('cart-item');
    this.paymentInfoLabel = page.getByTestId('payment-info-value');
    this.shippingInfoLabel = page.getByTestId('shipping-info-value');
    this.itemTotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  /** Parse the item subtotal from the summary label ("Item total: $29.99" → 29.99). */
  async getItemTotal(): Promise<number> {
    const text = await this.itemTotalLabel.textContent() ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  /** Parse the tax value from the summary label ("Tax: $2.40" → 2.40). */
  async getTax(): Promise<number> {
    const text = await this.taxLabel.textContent() ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  /** Parse the total from the summary label ("Total: $32.39" → 32.39). */
  async getTotal(): Promise<number> {
    const text = await this.totalLabel.textContent() ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  /** Assert payment info text. */
  async assertPaymentInfo(expectedText: string): Promise<void> {
    await expect(this.paymentInfoLabel).toHaveText(expectedText);
  }

  /** Assert shipping info text. */
  async assertShippingInfo(expectedText: string): Promise<void> {
    await expect(this.shippingInfoLabel).toHaveText(expectedText);
  }

  /** Click Finish to place the order. */
  async finish(): Promise<void> {
    await allure.step('Click Finish to place order', async () => {
      await this.finishButton.click();
      await this.page.waitForURL(`**${APP_ROUTES.CHECKOUT_COMPLETE}`);
    });
  }

  /** Assert the order review page is displayed. */
  async assertOnStepTwo(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(APP_ROUTES.CHECKOUT_STEP_TWO.replace(/\//g, '\\/')),
    );
    await expect(this.summaryContainer).toBeVisible();
  }
}
