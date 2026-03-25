import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutStepOnePage } from '../pages/checkout-step-one.page';
import { CheckoutStepTwoPage } from '../pages/checkout-step-two.page';
import { CheckoutCompletePage } from '../pages/checkout-complete.page';
import { envConfig } from '../config/env.config';

/**
 * Custom fixture types — each test receives these via destructuring.
 */
export type AppFixtures = {
  /** Unauthenticated login page */
  loginPage: LoginPage;
  /** Inventory/catalog page (unauthenticated — test must log in) */
  inventoryPage: InventoryPage;
  /** Cart page */
  cartPage: CartPage;
  /** Checkout step 1 — customer info form */
  checkoutStepOnePage: CheckoutStepOnePage;
  /** Checkout step 2 — order review */
  checkoutStepTwoPage: CheckoutStepTwoPage;
  /** Checkout complete — confirmation screen */
  checkoutCompletePage: CheckoutCompletePage;
  /** Pre-authenticated page — logged in as standard_user before each test */
  authenticatedPage: Page;
};

/**
 * Extended Playwright test with injected page objects.
 *
 * Tests import `test` from this file instead of `@playwright/test` directly.
 * This eliminates `new XxxPage(page)` boilerplate in every test file.
 */
export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutStepOnePage: async ({ page }, use) => {
    await use(new CheckoutStepOnePage(page));
  },

  checkoutStepTwoPage: async ({ page }, use) => {
    await use(new CheckoutStepTwoPage(page));
  },

  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  /**
   * authenticatedPage: navigates to login, performs login as standard_user,
   * then yields the page. Tears down cleanly after the test (Playwright handles browser cleanup).
   *
   * Tests that need to start logged in request this fixture — tests that test login
   * itself use `loginPage` directly.
   */
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForInventory(
      envConfig.users.standard.username,
      envConfig.users.standard.password,
    );
    await use(page);
  },
});

export { expect } from '@playwright/test';
