import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { APP_ROUTES } from '../config/test.config';

/**
 * BasePage — root of the Page Object hierarchy.
 *
 * Contains shared UI elements present across all authenticated pages
 * (header, burger menu, cart icon). All other page objects extend this.
 */
export abstract class BasePage {
  readonly page: Page;

  // ── Header / Navigation ──────────────────────────────────────
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly burgerMenuButton: Locator;
  readonly menuAllItems: Locator;
  readonly menuAbout: Locator;
  readonly menuLogout: Locator;
  readonly menuResetAppState: Locator;
  readonly menuCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.burgerMenuButton = page.getByTestId('open-menu');
    this.menuAllItems = page.getByTestId('inventory-sidebar-link');
    this.menuAbout = page.getByTestId('about-sidebar-link');
    this.menuLogout = page.getByTestId('logout-sidebar-link');
    this.menuResetAppState = page.getByTestId('reset-sidebar-link');
    this.menuCloseButton = page.getByTestId('close-menu');
  }

  /** Navigate to the shopping cart. */
  async goToCart(): Promise<void> {
    await allure.step('Navigate to cart', async () => {
      await this.cartLink.click();
      await this.page.waitForURL(`**${APP_ROUTES.CART}`);
    });
  }

  /** Open the burger menu. */
  async openMenu(): Promise<void> {
    await allure.step('Open burger menu', async () => {
      // The burger menu icon (data-test="open-menu") is an <img> overlaid by a <button>.
      // Use force:true to dispatch the click directly on the element.
      await this.burgerMenuButton.click({ force: true });
      await this.menuLogout.waitFor({ state: 'visible' });
    });
  }

  /** Log out via the burger menu. */
  async logout(): Promise<void> {
    await allure.step('Log out', async () => {
      await this.openMenu();
      await this.menuLogout.click();
      await this.page.waitForURL(`**${APP_ROUTES.HOME}`);
    });
  }

  /** Reset the app state via the burger menu (clears cart, resets sort). */
  async resetAppState(): Promise<void> {
    await allure.step('Reset app state via menu', async () => {
      await this.openMenu();
      await this.menuResetAppState.click();
      await this.menuCloseButton.click();
    });
  }

  /** Return the current cart item count from the badge, or 0 if no badge. */
  async getCartCount(): Promise<number> {
    const badge = this.cartBadge;
    const isVisible = await badge.isVisible();
    if (!isVisible) return 0;
    const text = await badge.textContent();
    return parseInt(text ?? '0', 10);
  }

  /** Assert the page URL matches the expected route. */
  async assertCurrentUrl(route: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(route.replace(/\//g, '\\/')));
  }
}
