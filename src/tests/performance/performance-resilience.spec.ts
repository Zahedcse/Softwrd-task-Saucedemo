import { expect } from '@playwright/test';
import { test } from '../../utils/test-fixtures';
import { envConfig } from '../../config/env.config';
import { APP_ROUTES, PRODUCTS } from '../../config/test.config';
import { setAllureMeta, attachJson } from '../../utils/allure-helpers';
import {
  measureTime,
  waitForWithGlitchTimeout,
  waitForNavigationWithGlitchTimeout,
} from '../../utils/smart-waits';
import checkoutData from '../../fixtures/checkout.json';

test.describe('Performance & Resilience', () => {
  test.describe('performance_glitch_user', () => {
    test(
      'should complete login successfully despite response delay @smoke @regression @performance',
      async ({ loginPage, inventoryPage, page }) => {
        await setAllureMeta({
          suite: 'Performance & Resilience',
          feature: 'Performance Glitch User',
          story: 'Login completes within extended timeout despite server delay',
          severity: 'critical',
          tags: ['smoke', 'regression', 'performance'],
        });

        const glitchTimeout = envConfig.timeouts.glitchUser;

        await loginPage.goto();

        const [, loginDurationMs] = await measureTime(async () => {
          await loginPage.login(
            envConfig.users.performanceGlitch.username,
            envConfig.users.performanceGlitch.password,
          );
          await waitForNavigationWithGlitchTimeout(page, `**${APP_ROUTES.INVENTORY}`, glitchTimeout);
        });

        await attachJson('performance_glitch_user login timing', {
          durationMs: Math.round(loginDurationMs),
          timeoutAllowedMs: glitchTimeout,
          withinTimeout: loginDurationMs <= glitchTimeout,
        });

        await waitForWithGlitchTimeout(inventoryPage.inventoryContainer, glitchTimeout);
        await inventoryPage.assertInventoryLoaded();

        expect(loginDurationMs).toBeLessThan(glitchTimeout);
      },
    );

    test(
      'should display all products after login despite delay @regression @performance',
      async ({ loginPage, inventoryPage, page }) => {
        await setAllureMeta({
          suite: 'Performance & Resilience',
          feature: 'Performance Glitch User',
          story: 'Inventory loads with all products after slow login',
          severity: 'normal',
          tags: ['regression', 'performance'],
        });

        const glitchTimeout = envConfig.timeouts.glitchUser;

        await loginPage.goto();
        await loginPage.login(
          envConfig.users.performanceGlitch.username,
          envConfig.users.performanceGlitch.password,
        );

        await waitForNavigationWithGlitchTimeout(page, `**${APP_ROUTES.INVENTORY}`, glitchTimeout);
        await waitForWithGlitchTimeout(inventoryPage.inventoryContainer, glitchTimeout);

        const count = await inventoryPage.getItemCount();
        expect(count).toBe(6);
      },
    );

    test(
      'should successfully add item to cart despite glitch delay @regression @performance',
      async ({ loginPage, inventoryPage, page }) => {
        await setAllureMeta({
          suite: 'Performance & Resilience',
          feature: 'Performance Glitch User',
          story: 'Add to Cart action succeeds despite response delay',
          severity: 'normal',
          tags: ['regression', 'performance'],
        });

        const glitchTimeout = envConfig.timeouts.glitchUser;

        await loginPage.goto();
        await loginPage.login(
          envConfig.users.performanceGlitch.username,
          envConfig.users.performanceGlitch.password,
        );
        await waitForNavigationWithGlitchTimeout(page, `**${APP_ROUTES.INVENTORY}`, glitchTimeout);
        await waitForWithGlitchTimeout(inventoryPage.inventoryContainer, glitchTimeout);

        const [, addDurationMs] = await measureTime(async () => {
          await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
          await waitForWithGlitchTimeout(inventoryPage.cartBadge, glitchTimeout);
        });

        await attachJson('Add-to-cart timing (glitch user)', {
          durationMs: Math.round(addDurationMs),
        });

        const cartCount = await inventoryPage.getCartCount();
        expect(cartCount).toBe(1);
      },
    );
  });

  test.describe('error_user Failure States', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.loginAndWaitForInventory(
        envConfig.users.error.username,
        envConfig.users.error.password,
      );
    });

    test(
      'should login successfully and display inventory @smoke @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Performance & Resilience',
          feature: 'Error User',
          story: 'error_user can login and view inventory',
          severity: 'normal',
          tags: ['smoke', 'regression'],
        });

        await inventoryPage.assertInventoryLoaded();
        await inventoryPage.assertCurrentUrl(APP_ROUTES.INVENTORY);
      },
    );

    test(
      'should fail to proceed past checkout step one — documents known defect @regression',
      async ({ inventoryPage, cartPage, checkoutStepOnePage, page }) => {
        await setAllureMeta({
          suite: 'Performance & Resilience',
          feature: 'Error User',
          story: 'error_user checkout form submission fails — known defect',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();

        await checkoutStepOnePage.fillCheckoutInfo(checkoutData.validCustomer);
        await checkoutStepOnePage.clickContinue();

        const currentUrl = page.url();
        await attachJson('error_user checkout step one behavior', {
          submittedData: checkoutData.validCustomer,
          resultUrl: currentUrl,
          note: 'error_user is expected to fail on checkout form submission',
        });

        expect(currentUrl).not.toContain(APP_ROUTES.CHECKOUT_COMPLETE);
      },
    );

    test(
      'should fail to remove item from cart — documents known defect @regression',
      async ({ inventoryPage, cartPage }) => {
        await setAllureMeta({
          suite: 'Performance & Resilience',
          feature: 'Error User',
          story: 'error_user remove-from-cart silently fails — known defect',
          severity: 'minor',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();

        const countBefore = await cartPage.getCartItemCount();
        expect(countBefore).toBe(1);

        await cartPage.removeItem(PRODUCTS.SAUCE_LABS_BACKPACK.id);

        const countAfter = await cartPage.getCartItemCount();

        await attachJson('error_user cart removal behavior', {
          countBefore,
          countAfter,
          itemRemoved: countAfter < countBefore,
          note: 'error_user remove action is a known defect — item may not be removed',
        });

        expect(countAfter).toBeGreaterThanOrEqual(0);
        expect(countAfter).toBeLessThanOrEqual(1);
      },
    );

    test(
      'should fail to add item to cart — documents known defect @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Performance & Resilience',
          feature: 'Error User',
          story: 'error_user add-to-cart may trigger error — known defect',
          severity: 'minor',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);

        const cartCount = await inventoryPage.getCartCount();

        await attachJson('error_user add-to-cart behavior', {
          cartCountAfterAdd: cartCount,
          note: 'error_user may fail silently on add-to-cart',
        });

        expect(cartCount).toBeGreaterThanOrEqual(0);
        expect(cartCount).toBeLessThanOrEqual(1);
      },
    );
  });
});
