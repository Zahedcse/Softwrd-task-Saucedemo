import { expect } from '@playwright/test';
import { test } from '../../utils/test-fixtures';
import {
  APP_ROUTES,
  PRODUCTS,
  CHECKOUT_COMPLETE,
  ERROR_MESSAGES,
  PAYMENT_INFO,
  SHIPPING_INFO,
} from '../../config/test.config';
import { setAllureMeta, attachJson } from '../../utils/allure-helpers';
import { assertOrderMath } from '../../utils/custom-assertions';
import checkoutData from '../../fixtures/checkout.json';

test.describe('Checkout Flow', () => {
  // All checkout tests start authenticated
  test.beforeEach(async ({ authenticatedPage }) => {
    // authenticatedPage fixture logs in as standard_user on /inventory.html
  });

  test.describe('Successful Purchase', () => {
    test(
      'should complete a full purchase with a single item @smoke @regression @e2e',
      async ({
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
      }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Purchase',
          story: 'Full purchase flow completes successfully',
          severity: 'blocker',
          tags: ['smoke', 'regression', 'e2e'],
        });

        // Add item
        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();

        // Verify item in cart
        await cartPage.assertItemInCart(PRODUCTS.SAUCE_LABS_BACKPACK.name);
        await cartPage.proceedToCheckout();

        // Fill info
        await checkoutStepOnePage.fillAndContinue(checkoutData.validCustomer);

        // Review order
        await checkoutStepTwoPage.assertOnStepTwo();
        await checkoutStepTwoPage.finish();

        // Confirm
        await checkoutCompletePage.assertOrderConfirmed();
      },
    );

    test(
      'should complete a full purchase with multiple items @regression @e2e',
      async ({
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
      }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Purchase',
          story: 'Full purchase flow with multiple items completes successfully',
          severity: 'critical',
          tags: ['regression', 'e2e'],
        });

        const itemsToAdd = [
          PRODUCTS.SAUCE_LABS_BACKPACK,
          PRODUCTS.SAUCE_LABS_BIKE_LIGHT,
          PRODUCTS.SAUCE_LABS_ONESIE,
        ];

        for (const item of itemsToAdd) {
          await inventoryPage.addItemToCart(item.addToCartTestId);
        }

        await inventoryPage.goToCart();
        expect(await cartPage.getCartItemCount()).toBe(itemsToAdd.length);

        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.fillAndContinue(checkoutData.validCustomer);
        await checkoutStepTwoPage.finish();
        await checkoutCompletePage.assertOrderConfirmed();
      },
    );

    test(
      'should clear the cart after a successful order @regression',
      async ({
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
      }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Purchase',
          story: 'Cart is empty after order completion',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.fillAndContinue(checkoutData.validCustomer);
        await checkoutStepTwoPage.finish();

        await checkoutCompletePage.assertOnCompletePage();
        await checkoutCompletePage.goBackHome();

        // Cart badge should be gone after order
        await expect(inventoryPage.cartBadge).toBeHidden();
      },
    );
  });

  test.describe('Checkout Validation — Required Fields', () => {
    // Set up cart and navigate to step one before each validation test
    test.beforeEach(async ({ authenticatedPage, inventoryPage, cartPage }) => {
      await inventoryPage.assertInventoryLoaded();
      await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
    });

    test(
      'should block checkout when first name is missing @smoke @regression',
      async ({ checkoutStepOnePage }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Validation',
          story: 'Missing first name blocks checkout progress',
          severity: 'critical',
          tags: ['smoke', 'regression'],
        });

        await checkoutStepOnePage.fillCheckoutInfo(checkoutData.missingFirstName);
        await checkoutStepOnePage.clickContinue();

        await checkoutStepOnePage.assertErrorMessage(ERROR_MESSAGES.CHECKOUT.MISSING_FIRST_NAME);
        await checkoutStepOnePage.assertStillOnStepOne();
      },
    );

    test(
      'should block checkout when last name is missing @regression',
      async ({ checkoutStepOnePage }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Validation',
          story: 'Missing last name blocks checkout progress',
          severity: 'critical',
          tags: ['regression'],
        });

        await checkoutStepOnePage.fillCheckoutInfo(checkoutData.missingLastName);
        await checkoutStepOnePage.clickContinue();

        await checkoutStepOnePage.assertErrorMessage(ERROR_MESSAGES.CHECKOUT.MISSING_LAST_NAME);
        await checkoutStepOnePage.assertStillOnStepOne();
      },
    );

    test(
      'should block checkout when postal code is missing @regression',
      async ({ checkoutStepOnePage }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Validation',
          story: 'Missing postal code blocks checkout progress',
          severity: 'critical',
          tags: ['regression'],
        });

        await checkoutStepOnePage.fillCheckoutInfo(checkoutData.missingPostalCode);
        await checkoutStepOnePage.clickContinue();

        await checkoutStepOnePage.assertErrorMessage(ERROR_MESSAGES.CHECKOUT.MISSING_POSTAL_CODE);
        await checkoutStepOnePage.assertStillOnStepOne();
      },
    );

    test(
      'should block checkout when all fields are empty @regression',
      async ({ checkoutStepOnePage }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Validation',
          story: 'All empty fields blocks checkout — first name validated first',
          severity: 'normal',
          tags: ['regression'],
        });

        await checkoutStepOnePage.fillCheckoutInfo(checkoutData.allFieldsEmpty);
        await checkoutStepOnePage.clickContinue();

        // SauceDemo validates first name first
        await checkoutStepOnePage.assertErrorMessage(ERROR_MESSAGES.CHECKOUT.MISSING_FIRST_NAME);
        await checkoutStepOnePage.assertStillOnStepOne();
      },
    );

    test(
      'should allow dismissing the checkout error banner @regression',
      async ({ checkoutStepOnePage }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Validation',
          story: 'Checkout error banner can be dismissed',
          severity: 'minor',
          tags: ['regression'],
        });

        await checkoutStepOnePage.fillCheckoutInfo(checkoutData.missingFirstName);
        await checkoutStepOnePage.clickContinue();
        await checkoutStepOnePage.assertErrorMessage(ERROR_MESSAGES.CHECKOUT.MISSING_FIRST_NAME);

        await checkoutStepOnePage.dismissError();
        await expect(checkoutStepOnePage.errorMessage).toBeHidden();
      },
    );
  });

  test.describe('Order Summary Verification', () => {
    test(
      'should display mathematically correct order summary for a single item @regression',
      async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Order Summary',
          story: 'Item total, tax (8%), and final total are mathematically correct',
          severity: 'critical',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.fillAndContinue(checkoutData.validCustomer);

        const itemTotal = await checkoutStepTwoPage.getItemTotal();
        const tax = await checkoutStepTwoPage.getTax();
        const total = await checkoutStepTwoPage.getTotal();

        await attachJson('Order summary', { itemTotal, tax, total });

        expect(itemTotal).toBe(PRODUCTS.SAUCE_LABS_BACKPACK.price);
        assertOrderMath(itemTotal, tax, total);
      },
    );

    test(
      'should display mathematically correct order summary for multiple items @regression',
      async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Order Summary',
          story: 'Multi-item subtotal, tax, and total are mathematically correct',
          severity: 'critical',
          tags: ['regression'],
        });

        const itemsToAdd = [PRODUCTS.SAUCE_LABS_BACKPACK, PRODUCTS.SAUCE_LABS_BIKE_LIGHT];
        const expectedSubtotal = itemsToAdd.reduce((sum, item) => sum + item.price, 0);

        for (const item of itemsToAdd) {
          await inventoryPage.addItemToCart(item.addToCartTestId);
        }

        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.fillAndContinue(checkoutData.validCustomer);

        const itemTotal = await checkoutStepTwoPage.getItemTotal();
        const tax = await checkoutStepTwoPage.getTax();
        const total = await checkoutStepTwoPage.getTotal();

        await attachJson('Multi-item order summary', {
          expectedSubtotal,
          itemTotal,
          tax,
          total,
        });

        // Allow floating point tolerance
        expect(Math.abs(itemTotal - expectedSubtotal)).toBeLessThan(0.01);
        assertOrderMath(itemTotal, tax, total);
      },
    );

    test(
      'should display correct payment and shipping information on order review @regression',
      async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Order Summary',
          story: 'Payment and shipping info are shown correctly on review page',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.fillAndContinue(checkoutData.validCustomer);

        await checkoutStepTwoPage.assertPaymentInfo(PAYMENT_INFO);
        await checkoutStepTwoPage.assertShippingInfo(SHIPPING_INFO);
      },
    );
  });

  test.describe('Confirmation Screen', () => {
    test(
      'should display correct confirmation screen content after successful order @smoke @regression',
      async ({
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
      }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Confirmation',
          story: 'Confirmation screen shows correct header, message, image, and button',
          severity: 'blocker',
          tags: ['smoke', 'regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.fillAndContinue(checkoutData.validCustomer);
        await checkoutStepTwoPage.finish();

        await checkoutCompletePage.assertOnCompletePage();
        await checkoutCompletePage.assertOrderConfirmed();
      },
    );

    test(
      'should navigate back to inventory from confirmation screen @regression',
      async ({
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
      }) => {
        await setAllureMeta({
          suite: 'Checkout Flow',
          feature: 'Confirmation',
          story: 'Back Home button navigates to inventory after order',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.fillAndContinue(checkoutData.validCustomer);
        await checkoutStepTwoPage.finish();

        await checkoutCompletePage.goBackHome();
        await inventoryPage.assertInventoryLoaded();
        await inventoryPage.assertCurrentUrl(APP_ROUTES.INVENTORY);
      },
    );
  });
});
