import { Locator, Page } from '@playwright/test';

/**
 * Smart wait utilities.
 *
 * All waits use Playwright's built-in waiting mechanisms (no Thread.sleep / hardcoded delays).
 * Timeouts are configurable per caller to handle slow environments like performance_glitch_user.
 */

/**
 * Wait for a locator to be visible and stable (not moving/animating).
 */
export async function waitForVisible(
  locator: Locator,
  timeout?: number,
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
}

/**
 * Wait for a locator to be hidden or detached.
 */
export async function waitForHidden(
  locator: Locator,
  timeout?: number,
): Promise<void> {
  await locator.waitFor({ state: 'hidden', timeout });
}

/**
 * Wait for page URL to contain a given path segment.
 */
export async function waitForUrl(
  page: Page,
  urlPattern: string | RegExp,
  timeout?: number,
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Wait for a network request/response cycle to settle after triggering an action.
 * Useful when an action triggers a network call whose completion triggers a UI change.
 */
export async function waitForNetworkIdle(page: Page, timeout?: number): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for the DOM to be loaded and the page to be interactive.
 */
export async function waitForDomContentLoaded(page: Page, timeout?: number): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout });
}

/**
 * Measure how long an async operation takes (ms).
 * Returns [result, durationMs].
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = Date.now();
  const result = await fn();
  return [result, Date.now() - start];
}

/**
 * Extended wait strategy for performance_glitch_user.
 * Waits for the locator using the glitch-user timeout from env config.
 */
export async function waitForWithGlitchTimeout(
  locator: Locator,
  glitchTimeout: number,
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: glitchTimeout });
}

/**
 * Wait for navigation to a URL with the glitch-user extended timeout.
 */
export async function waitForNavigationWithGlitchTimeout(
  page: Page,
  urlPattern: string | RegExp,
  glitchTimeout: number,
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout: glitchTimeout });
}
