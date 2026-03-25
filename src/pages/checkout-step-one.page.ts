import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';
import { APP_ROUTES } from '../config/test.config';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/**
 * CheckoutStepOnePage — customer information form at /checkout-step-one.html
 */
export class CheckoutStepOnePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.locator('[data-test="error"] button');
  }

  /** Fill all checkout info fields. Empty strings are allowed for negative test cases. */
  async fillCheckoutInfo(info: CheckoutInfo): Promise<void> {
    await allure.step('Fill checkout information', async () => {
      await this.firstNameInput.fill(info.firstName);
      await this.lastNameInput.fill(info.lastName);
      await this.postalCodeInput.fill(info.postalCode);
    });
  }

  /** Click the Continue button. */
  async clickContinue(): Promise<void> {
    await allure.step('Click Continue', async () => {
      await this.continueButton.click();
    });
  }

  /**
   * Fill info and click Continue, then wait for step 2.
   * Use for happy-path flows.
   */
  async fillAndContinue(info: CheckoutInfo): Promise<void> {
    await this.fillCheckoutInfo(info);
    await this.continueButton.click();
    await this.page.waitForURL(`**${APP_ROUTES.CHECKOUT_STEP_TWO}`);
  }

  /** Assert error message is visible with the expected text. */
  async assertErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  /** Assert still on checkout step one (error did not advance the flow). */
  async assertStillOnStepOne(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(APP_ROUTES.CHECKOUT_STEP_ONE.replace(/\//g, '\\/')),
    );
  }

  /** Dismiss the error banner. */
  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }
}
