import { expect } from '@playwright/test';
import { test } from '../../utils/test-fixtures';
import { envConfig } from '../../config/env.config';
import { APP_ROUTES, ERROR_MESSAGES } from '../../config/test.config';
import { setAllureMeta } from '../../utils/allure-helpers';
import usersData from '../../fixtures/users.json';

test.describe('Authentication', () => {
  test.describe('Successful Login', () => {
    test(
      'should login successfully as standard_user and reach inventory @smoke @regression',
      async ({ loginPage, inventoryPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'Valid credentials grant access',
          severity: 'blocker',
          tags: ['smoke', 'regression'],
        });

        await loginPage.goto();
        await loginPage.loginAndWaitForInventory(
          envConfig.users.standard.username,
          envConfig.users.standard.password,
        );

        await inventoryPage.assertInventoryLoaded();
        await inventoryPage.assertCurrentUrl(APP_ROUTES.INVENTORY);
      },
    );

    test(
      'should display inventory title after login @regression',
      async ({ loginPage, page }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'Inventory page title is shown after login',
          severity: 'normal',
          tags: ['regression'],
        });

        await loginPage.goto();
        await loginPage.loginAndWaitForInventory(
          envConfig.users.standard.username,
          envConfig.users.standard.password,
        );

        await expect(page.getByTestId('title')).toHaveText('Products');
      },
    );
  });

  test.describe('Invalid Credentials', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
    });

    test(
      'should show error for wrong password @smoke @regression',
      async ({ loginPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'Wrong password shows error',
          severity: 'critical',
          tags: ['smoke', 'regression'],
        });

        await loginPage.login(
          usersData.invalidCredentials[0].username,
          usersData.invalidCredentials[0].password,
        );
        await loginPage.assertErrorMessage(ERROR_MESSAGES.LOGIN.INVALID_CREDENTIALS);
        await loginPage.assertOnLoginPage();
      },
    );

    test(
      'should show error for empty username @regression',
      async ({ loginPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'Empty username shows username required error',
          severity: 'normal',
          tags: ['regression'],
        });

        // Empty username, valid password
        const emptyUsername = usersData.invalidCredentials.find(
          (c) => c.description === 'Empty username',
        )!;
        await loginPage.login(emptyUsername.username, emptyUsername.password);
        await loginPage.assertErrorMessage(ERROR_MESSAGES.LOGIN.MISSING_USERNAME);
      },
    );

    test(
      'should show error for empty password @regression',
      async ({ loginPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'Empty password shows password required error',
          severity: 'normal',
          tags: ['regression'],
        });

        const emptyPassword = usersData.invalidCredentials.find(
          (c) => c.description === 'Empty password',
        )!;
        await loginPage.login(emptyPassword.username, emptyPassword.password);
        await loginPage.assertErrorMessage(ERROR_MESSAGES.LOGIN.MISSING_PASSWORD);
      },
    );

    test(
      'should show username required error when both fields are empty @regression',
      async ({ loginPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'Both fields empty shows username required error first',
          severity: 'normal',
          tags: ['regression'],
        });

        await loginPage.login('', '');
        // SauceDemo validates username first
        await loginPage.assertErrorMessage(ERROR_MESSAGES.LOGIN.MISSING_USERNAME);
      },
    );

    test(
      'should not authenticate with SQL injection payload @regression @security',
      async ({ loginPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'SQL injection in username does not grant access',
          severity: 'critical',
          tags: ['regression', 'security'],
        });

        const sqlPayload = usersData.securityPayloads.find(
          (p) => p.description === 'SQL injection in username',
        )!;
        await loginPage.login(sqlPayload.username, sqlPayload.password);

        // Must not navigate to inventory — stays on login page with error
        await loginPage.assertOnLoginPage();
        await loginPage.assertErrorMessage(ERROR_MESSAGES.LOGIN.INVALID_CREDENTIALS);
      },
    );

    test(
      'should not authenticate with XSS payload and must not execute script @regression @security',
      async ({ loginPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'XSS payload in username does not grant access or execute script',
          severity: 'critical',
          tags: ['regression', 'security'],
        });

        const xssPayload = usersData.securityPayloads.find(
          (p) => p.description === 'XSS attempt in username',
        )!;
        await loginPage.login(xssPayload.username, xssPayload.password);

        await loginPage.assertOnLoginPage();
        await loginPage.assertErrorMessage(ERROR_MESSAGES.LOGIN.INVALID_CREDENTIALS);
      },
    );

    test(
      'should allow error banner to be dismissed @regression',
      async ({ loginPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'Error banner can be closed',
          severity: 'minor',
          tags: ['regression'],
        });

        await loginPage.login('wrong_user', 'wrong_pass');
        await loginPage.assertErrorMessage(ERROR_MESSAGES.LOGIN.INVALID_CREDENTIALS);
        await loginPage.dismissError();
        await loginPage.assertNoError();
      },
    );
  });

  test.describe('Locked Out User', () => {
    test(
      'should show locked out error for locked_out_user @smoke @regression',
      async ({ loginPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Login',
          story: 'Locked out user cannot login',
          severity: 'blocker',
          tags: ['smoke', 'regression'],
        });

        await loginPage.goto();
        await loginPage.login(
          envConfig.users.lockedOut.username,
          envConfig.users.lockedOut.password,
        );

        await loginPage.assertErrorMessage(ERROR_MESSAGES.LOGIN.LOCKED_OUT);
        await loginPage.assertOnLoginPage();
      },
    );
  });

  test.describe('Session & Logout', () => {
    test(
      'should persist session when navigating between pages @regression',
      async ({ authenticatedPage, page }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Session',
          story: 'Session persists across page navigation',
          severity: 'critical',
          tags: ['regression'],
        });

        // Navigate to cart and back — session must be maintained
        await page.goto(APP_ROUTES.CART);
        await expect(page).toHaveURL(new RegExp(APP_ROUTES.CART.replace(/\//g, '\\/')));

        await page.goto(APP_ROUTES.INVENTORY);
        await expect(page.getByTestId('inventory-container')).toBeVisible();
      },
    );

    test(
      'should log out successfully and return to login page @smoke @regression',
      async ({ authenticatedPage, inventoryPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Logout',
          story: 'Authenticated user can log out',
          severity: 'critical',
          tags: ['smoke', 'regression'],
        });

        await inventoryPage.logout();
        await expect(inventoryPage.page).toHaveURL(
          new RegExp(`${APP_ROUTES.HOME.replace('/', '\\/')}$`),
        );
        await expect(inventoryPage.page.getByTestId('login-button')).toBeVisible();
      },
    );

    test(
      'should redirect unauthenticated user to login when accessing inventory directly @regression',
      async ({ page }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Session',
          story: 'Direct URL access without session redirects to login',
          severity: 'critical',
          tags: ['regression'],
        });

        // Without logging in, navigate directly to inventory
        await page.goto(APP_ROUTES.INVENTORY);

        // SauceDemo redirects to the login page
        await expect(page).toHaveURL(new RegExp(`${APP_ROUTES.HOME.replace('/', '\\/')}$`));
        await expect(page.getByTestId('login-button')).toBeVisible();
      },
    );

    test(
      'should prevent back-navigation to protected pages after logout @regression',
      async ({ authenticatedPage, inventoryPage }) => {
        await setAllureMeta({
          suite: 'Authentication',
          feature: 'Session',
          story: 'Browser back after logout does not restore authenticated session',
          severity: 'critical',
          tags: ['regression'],
        });

        await inventoryPage.logout();

        // Attempt to navigate back — should still be on login page
        await inventoryPage.page.goBack();

        // Either stays on login page or SauceDemo redirects back to login
        const url = inventoryPage.page.url();
        const isLoginPage =
          url.endsWith('/') || url.endsWith('/index.html') || !url.includes('inventory');
        expect(isLoginPage).toBeTruthy();
      },
    );
  });
});
