import { expect } from '@playwright/test';
import { test } from '../../utils/test-fixtures';
import { envConfig } from '../../config/env.config';
import { EXPECTED_PRODUCT_COUNT, SORT_OPTIONS } from '../../config/test.config';
import { setAllureMeta, attachJson } from '../../utils/allure-helpers';
import {
  assertAscendingOrder,
  assertDescendingOrder,
} from '../../utils/custom-assertions';
import productsData from '../../fixtures/products.json';

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
  });

  test.describe('Product Listing', () => {
    test(
      'should display the correct number of products @smoke @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Listing',
          story: 'All 6 products are shown',
          severity: 'blocker',
          tags: ['smoke', 'regression'],
        });

        const count = await inventoryPage.getItemCount();
        expect(count).toBe(EXPECTED_PRODUCT_COUNT);
      },
    );

    test(
      'should display correct product names @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Listing',
          story: 'Product names match expected catalogue',
          severity: 'critical',
          tags: ['regression'],
        });

        const names = await inventoryPage.getItemNames();
        expect(names).toHaveLength(EXPECTED_PRODUCT_COUNT);

        const expectedNames = productsData.expectedProducts.map((p) => p.name);
        for (const name of expectedNames) {
          expect(names).toContain(name);
        }
      },
    );

    test(
      'should display prices for all products @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Listing',
          story: 'All products have visible price labels',
          severity: 'critical',
          tags: ['regression'],
        });

        const prices = await inventoryPage.getItemPrices();
        expect(prices).toHaveLength(EXPECTED_PRODUCT_COUNT);

        for (const price of prices) {
          expect(price).toBeGreaterThan(0);
        }
      },
    );

    test(
      'should display product images with non-empty src attributes (standard_user) @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Listing',
          story: 'All product images load correctly for standard_user',
          severity: 'normal',
          tags: ['regression'],
        });

        const srcs = await inventoryPage.getItemImageSrcs();
        expect(srcs).toHaveLength(EXPECTED_PRODUCT_COUNT);

        for (const src of srcs) {
          expect(src.length).toBeGreaterThan(0);
          expect(src).not.toContain('sl-404');
        }
      },
    );
  });

  test.describe('Sorting', () => {
    test(
      'should sort products by Name A→Z @smoke @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Sorting',
          story: 'Name A→Z sort produces alphabetical order',
          severity: 'critical',
          tags: ['smoke', 'regression'],
        });

        await inventoryPage.sortBy(SORT_OPTIONS.NAME_A_Z);
        const names = await inventoryPage.getItemNames();

        expect(names).toEqual(productsData.sortedNameAZ);
      },
    );

    test(
      'should sort products by Name Z→A @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Sorting',
          story: 'Name Z→A sort produces reverse alphabetical order',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.sortBy(SORT_OPTIONS.NAME_Z_A);
        const names = await inventoryPage.getItemNames();

        expect(names).toEqual(productsData.sortedNameZA);
      },
    );

    test(
      'should sort products by Price Low→High @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Sorting',
          story: 'Price Low→High sort produces ascending price order',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_HIGH);
        const prices = await inventoryPage.getItemPrices();

        assertAscendingOrder(prices);
        await attachJson('Prices after low→high sort', prices);
      },
    );

    test(
      'should sort products by Price High→Low @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Sorting',
          story: 'Price High→Low sort produces descending price order',
          severity: 'normal',
          tags: ['regression'],
        });

        await inventoryPage.sortBy(SORT_OPTIONS.PRICE_HIGH_LOW);
        const prices = await inventoryPage.getItemPrices();

        assertDescendingOrder(prices);
        await attachJson('Prices after high→low sort', prices);
      },
    );

    test(
      'should re-sort correctly when switching sort options @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Sorting',
          story: 'Switching sort options re-orders the list correctly',
          severity: 'minor',
          tags: ['regression'],
        });

        await inventoryPage.sortBy(SORT_OPTIONS.NAME_A_Z);
        const azNames = await inventoryPage.getItemNames();
        expect(azNames).toEqual(productsData.sortedNameAZ);

        await inventoryPage.sortBy(SORT_OPTIONS.NAME_Z_A);
        const zaNames = await inventoryPage.getItemNames();
        expect(zaNames).toEqual(productsData.sortedNameZA);
      },
    );
  });

  test.describe('problem_user Visual Regression', () => {
    test(
      'should detect that problem_user sees incorrect/broken product images @regression',
      async ({ loginPage, inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Visual Regression',
          story: 'problem_user sees broken/mismatched product images (known defect)',
          severity: 'normal',
          tags: ['regression'],
        });

        await loginPage.goto();
        await loginPage.loginAndWaitForInventory(
          envConfig.users.problem.username,
          envConfig.users.problem.password,
        );

        const srcs = await inventoryPage.getItemImageSrcs();
        await attachJson('problem_user image srcs', srcs);

        const uniqueSrcs = new Set(srcs);

        const hasImageDefect = uniqueSrcs.size < EXPECTED_PRODUCT_COUNT;
        if (hasImageDefect) {
          const brokenSrc = productsData.problemUserImageSrc;
          const allBroken = srcs.every((src) => src.includes('sl-404') || src === brokenSrc);
          expect(
            allBroken || uniqueSrcs.size === 1,
            `problem_user image defect confirmed: ${srcs.length} images, ${uniqueSrcs.size} unique src(s)`,
          ).toBeTruthy();
        }
      },
    );

    test(
      'should confirm standard_user sees unique product images @regression',
      async ({ inventoryPage }) => {
        await setAllureMeta({
          suite: 'Product Catalog',
          feature: 'Visual Regression',
          story: 'standard_user sees 6 distinct product images',
          severity: 'normal',
          tags: ['regression'],
        });

        const srcs = await inventoryPage.getItemImageSrcs();
        const uniqueSrcs = new Set(srcs);

        await attachJson('standard_user image srcs', srcs);

        expect(uniqueSrcs.size).toBe(EXPECTED_PRODUCT_COUNT);
      },
    );
  });
});
