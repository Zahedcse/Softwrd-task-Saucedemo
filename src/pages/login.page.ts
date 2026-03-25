import { Page, Locator, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { APP_ROUTES } from '../config/test.config';

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

  async goto(): Promise<void> {
    await allure.step('Navigate to login page', async () => {
      await this.page.goto('/');
    });
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await allure.step(`Login as "${username}"`, async () => {
      await this.fillUsername(username);
      await this.fillPassword(password);
      await this.clickLogin();
    });
  }

  async loginAndWaitForInventory(username: string, password: string): Promise<void> {
    await allure.step(`Login and wait for inventory (user: ${username})`, async () => {
      await this.fillUsername(username);
      await this.fillPassword(password);
      await this.clickLogin();
      await this.page.waitForURL(`**${APP_ROUTES.INVENTORY}`);
    });
  }

  async assertErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  async assertNoError(): Promise<void> {
    await expect(this.errorMessage).toBeHidden();
  }

  async dismissError(): Promise<void> {
    await allure.step('Dismiss error banner', async () => {
      await this.errorCloseButton.click();
    });
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL(new RegExp(`${APP_ROUTES.HOME.replace('/', '\\/')}$`));
  }
}
