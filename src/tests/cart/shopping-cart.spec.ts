import { expect } from '@playwright/test';
import { test } from '../../utils/test-fixtures';
import { APP_ROUTES, PRODUCTS } from '../../config/test.config';
import { setAllureMeta } from '../../utils/allure-helpers';
import { assertCartBadge } from '../../utils/custom-assertions';

test.describe('Shopping Cart', () => {
  // All cart tests start authenticated on inventory page
  test.beforeEach(async ({ authenticatedPage }) => {
    // authenticatedPage fixture provides a logged-in session on /inventory.html
  });

  test.describe('Add to Cart', () => {
    test(
      'should update cart badge when a single item is added @smoke @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Add to Cart',
          story: 'Cart badge reflects item count after adding one item',
          severity: 'blocker',
          tags: ['smoke', 'regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await assertCartBadge(inventoryPage.cartBadge, 1);
      },
    );

    test(
      'should show the added item in the cart with correct name and price @regression',
      async ({ inventoryPage, cartPage }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Add to Cart',
          story: 'Added item appears in cart with correct details',
          severity: 'critical',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();

        await cartPage.assertItemInCart(PRODUCTS.SAUCE_LABS_BACKPACK.name);
        const prices = await cartPage.getCartItemPrices();
        expect(prices[0]).toBe(PRODUCTS.SAUCE_LABS_BACKPACK.price);
      },
    );

    test(
      'should update cart badge correctly when multiple items are added @smoke @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Add to Cart',
          story: 'Cart badge reflects correct count after adding multiple items',
          severity: 'blocker',
          tags: ['smoke', 'regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BIKE_LIGHT.addToCartTestId);
        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BOLT_T_SHIRT.addToCartTestId);

        await assertCartBadge(inventoryPage.cartBadge, 3);
      },
    );

    test(
      'should show all added items in the cart @regression',
      async ({ inventoryPage, cartPage }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Add to Cart',
          story: 'All added items appear in cart list',
          severity: 'critical',
          tags: ['regression'],
        });

        const itemsToAdd = [
          PRODUCTS.SAUCE_LABS_BACKPACK,
          PRODUCTS.SAUCE_LABS_BIKE_LIGHT,
          PRODUCTS.SAUCE_LABS_FLEECE_JACKET,
        ];

        for (const item of itemsToAdd) {
          await inventoryPage.addItemToCart(item.addToCartTestId);
        }

        await inventoryPage.goToCart();

        const cartItemCount = await cartPage.getCartItemCount();
        expect(cartItemCount).toBe(itemsToAdd.length);

        for (const item of itemsToAdd) {
          await cartPage.assertItemInCart(item.name);
        }
      },
    );
  });

  test.describe('Remove from Cart', () => {
    test(
      'should remove an item from the cart and update badge @smoke @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Remove from Cart',
          story: 'Removing an item decrements the cart badge',
          severity: 'blocker',
          tags: ['smoke', 'regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await assertCartBadge(inventoryPage.cartBadge, 1);

        // Remove from the inventory page using the Remove button
        await inventoryPage.removeItemFromCart(PRODUCTS.SAUCE_LABS_BACKPACK.removeTestId);

        // Badge should disappear
        await expect(inventoryPage.cartBadge).toBeHidden();
      },
    );

    test(
      'should remove a specific item from the cart page and leave others intact @regression',
      async ({ inventoryPage, cartPage }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Remove from Cart',
          story: 'Removing one item leaves other cart items intact',
          severity: 'critical',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BIKE_LIGHT.addToCartTestId);
        await inventoryPage.goToCart();

        await cartPage.removeItem(PRODUCTS.SAUCE_LABS_BACKPACK.id);

        // Bike Light must still be in cart
        await cartPage.assertItemInCart(PRODUCTS.SAUCE_LABS_BIKE_LIGHT.name);
        await cartPage.assertItemNotInCart(PRODUCTS.SAUCE_LABS_BACKPACK.name);
        expect(await cartPage.getCartItemCount()).toBe(1);
      },
    );

    test(
      'should show Add to Cart button again after item is removed @regression',
      async ({ inventoryPage, page }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Remove from Cart',
          story: 'Add to Cart button reappears after item removal',
          severity: 'minor',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);

        // After adding, button becomes "Remove"
        await expect(
          page.getByTestId(PRODUCTS.SAUCE_LABS_BACKPACK.removeTestId),
        ).toBeVisible();

        await inventoryPage.removeItemFromCart(PRODUCTS.SAUCE_LABS_BACKPACK.removeTestId);

        // After removing, "Add to Cart" reappears
        await expect(
          page.getByTestId(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId),
        ).toBeVisible();
      },
    );

    test(
      'should show empty cart after removing all items @regression',
      async ({ inventoryPage, cartPage }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Remove from Cart',
          story: 'Cart is empty after removing the only item',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);
        await inventoryPage.goToCart();

        await cartPage.removeItem(PRODUCTS.SAUCE_LABS_BACKPACK.id);
        await cartPage.assertCartEmpty();
        await expect(cartPage.cartBadge).toBeHidden();
      },
    );
  });

  test.describe('Cart Persistence', () => {
    test(
      'should persist cart items when navigating back to inventory @regression',
      async ({ inventoryPage, cartPage }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Cart Persistence',
          story: 'Cart items survive navigation to inventory and back',
          severity: 'critical',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);

        // Navigate to cart, then back to inventory
        await inventoryPage.goToCart();
        await cartPage.continueShopping();

        // Badge still shows 1
        await assertCartBadge(inventoryPage.cartBadge, 1);

        // Navigate to cart again — item is still there
        await inventoryPage.goToCart();
        await cartPage.assertItemInCart(PRODUCTS.SAUCE_LABS_BACKPACK.name);
      },
    );

    test(
      'should persist cart items after page reload @regression',
      async ({ inventoryPage, cartPage, page }) => {
        await setAllureMeta({
          suite: 'Shopping Cart',
          feature: 'Cart Persistence',
          story: 'Cart items survive a full page reload',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.addItemToCart(PRODUCTS.SAUCE_LABS_BACKPACK.addToCartTestId);

        // Reload the inventory page
        await page.reload();
        await inventoryPage.assertInventoryLoaded();

        // Cart badge should still show the item
        await assertCartBadge(inventoryPage.cartBadge, 1);

        await inventoryPage.goToCart();
        await cartPage.assertItemInCart(PRODUCTS.SAUCE_LABS_BACKPACK.name);
      },
    );
  });
});
