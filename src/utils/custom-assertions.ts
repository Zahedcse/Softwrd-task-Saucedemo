import { expect, Locator, Page } from '@playwright/test';

export async function assertUrlContains(page: Page, path: string): Promise<void> {
  await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/')));
}

export async function assertVisible(locator: Locator, message?: string): Promise<void> {
  await expect(locator, message).toBeVisible();
}

export async function assertHidden(locator: Locator, message?: string): Promise<void> {
  await expect(locator, message).toBeHidden();
}

export async function assertText(locator: Locator, expected: string): Promise<void> {
  await expect(locator).toHaveText(expected);
}

export async function assertContainsText(locator: Locator, substring: string): Promise<void> {
  await expect(locator).toContainText(substring);
}

export async function assertCartBadge(badgeLocator: Locator, expectedCount: number): Promise<void> {
  await expect(badgeLocator).toHaveText(String(expectedCount));
}

export function assertAscendingOrder(prices: number[]): void {
  for (let i = 0; i < prices.length - 1; i++) {
    expect(
      prices[i],
      `Expected price at index ${i} (${prices[i]}) to be ≤ price at index ${i + 1} (${prices[i + 1]})`,
    ).toBeLessThanOrEqual(prices[i + 1]);
  }
}

export function assertDescendingOrder(prices: number[]): void {
  for (let i = 0; i < prices.length - 1; i++) {
    expect(
      prices[i],
      `Expected price at index ${i} (${prices[i]}) to be ≥ price at index ${i + 1} (${prices[i + 1]})`,
    ).toBeGreaterThanOrEqual(prices[i + 1]);
  }
}

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

export function parsePriceString(priceText: string): number {
  return parseFloat(priceText.replace('$', '').trim());
}
