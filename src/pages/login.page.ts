import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { APP_ROUTES } from '../config/test.config';

/**
 * LoginPage — covers https://www.saucedemo.com/
 *
 * Exposes actions for filling credentials, submitting, and asserting error states.
 * Does NOT extend BasePage because the login page has no header/cart elements.
 */
export class LoginPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.locator('[data-test="error"] button');
  }

  /** Navigate to the login page. */
  async goto(): Promise<void> {
    await allure.step('Navigate to login page', async () => {
      await this.page.goto('/');
    });
  }

  /** Fill username field. */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /** Fill password field. */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /** Click the Login button. */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Fill credentials and click login.
   * Does NOT wait for navigation — use loginAndWaitForInventory for happy path.
   */
  async login(username: string, password: string): Promise<void> {
    await allure.step(`Login as "${username}"`, async () => {
      await this.fillUsername(username);
      await this.fillPassword(password);
      await this.clickLogin();
    });
  }

  /**
   * Login and wait for the inventory page to load.
   * Use for happy-path flows where login is a pre-condition, not the subject under test.
   */
  async loginAndWaitForInventory(username: string, password: string): Promise<void> {
    await allure.step(`Login and wait for inventory (user: ${username})`, async () => {
      await this.fillUsername(username);
      await this.fillPassword(password);
      await this.clickLogin();
      await this.page.waitForURL(`**${APP_ROUTES.INVENTORY}`);
    });
  }

  /** Assert the error banner is visible with the expected message. */
  async assertErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  /** Assert no error message is shown. */
  async assertNoError(): Promise<void> {
    await expect(this.errorMessage).toBeHidden();
  }

  /** Dismiss the error banner by clicking its close button. */
  async dismissError(): Promise<void> {
    await allure.step('Dismiss error banner', async () => {
      await this.errorCloseButton.click();
    });
  }

  /** Assert the login page is shown (user is not authenticated). */
  async assertOnLoginPage(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL(new RegExp(`${APP_ROUTES.HOME.replace('/', '\\/')}$`));
  }
}
