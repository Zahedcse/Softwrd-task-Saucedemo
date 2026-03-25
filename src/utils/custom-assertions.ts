import { expect, Locator, Page } from '@playwright/test';

/**
 * Domain-specific assertion helpers.
 *
 * Wraps Playwright's expect() in named helpers so test files read as plain English
 * and assertion intent is clear without needing to inspect locators.
 */

/** Assert that the page URL contains the given path. */
export async function assertUrlContains(page: Page, path: string): Promise<void> {
  await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/')));
}

/** Assert that a locator is visible on the page. */
export async function assertVisible(locator: Locator, message?: string): Promise<void> {
  await expect(locator, message).toBeVisible();
}

/** Assert that a locator is not visible or not attached to the DOM. */
export async function assertHidden(locator: Locator, message?: string): Promise<void> {
  await expect(locator, message).toBeHidden();
}

/** Assert exact text content of a locator. */
export async function assertText(locator: Locator, expected: string): Promise<void> {
  await expect(locator).toHaveText(expected);
}

/** Assert that a locator's text contains the given substring. */
export async function assertContainsText(locator: Locator, substring: string): Promise<void> {
  await expect(locator).toContainText(substring);
}

/** Assert that the cart badge shows the expected item count. */
export async function assertCartBadge(badgeLocator: Locator, expectedCount: number): Promise<void> {
  await expect(badgeLocator).toHaveText(String(expectedCount));
}

/** Assert that a list of prices is sorted in ascending order. */
export function assertAscendingOrder(prices: number[]): void {
  for (let i = 0; i < prices.length - 1; i++) {
    expect(
      prices[i],
      `Expected price at index ${i} (${prices[i]}) to be ≤ price at index ${i + 1} (${prices[i + 1]})`,
    ).toBeLessThanOrEqual(prices[i + 1]);
  }
}

/** Assert that a list of prices is sorted in descending order. */
export function assertDescendingOrder(prices: number[]): void {
  for (let i = 0; i < prices.length - 1; i++) {
    expect(
      prices[i],
      `Expected price at index ${i} (${prices[i]}) to be ≥ price at index ${i + 1} (${prices[i + 1]})`,
    ).toBeGreaterThanOrEqual(prices[i + 1]);
  }
}

/**
 * Assert order summary math is correct.
 * SauceDemo tax = 8% of item total; final total = item total + tax.
 */
export function assertOrderMath(itemTotal: number, tax: number, total: number): void {
  const expectedTax = Math.round(itemTotal * 0.08 * 100) / 100;
  const expectedTotal = Math.round((itemTotal + tax) * 100) / 100;

  expect(
    Math.abs(tax - expectedTax),
    `Tax ${tax} does not match 8% of item total ${itemTotal} (expected ~${expectedTax})`,
  ).toBeLessThan(0.02); // tolerance for floating point

  expect(
    Math.abs(total - expectedTotal),
    `Final total ${total} ≠ item total ${itemTotal} + tax ${tax} = ${expectedTotal}`,
  ).toBeLessThan(0.02);
}

/** Parse a price string like "$29.99" into a float. */
export function parsePriceString(priceText: string): number {
  return parseFloat(priceText.replace('$', '').trim());
}
