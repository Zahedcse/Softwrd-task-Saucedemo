import { Locator, Page } from '@playwright/test';

export async function waitForVisible(
  locator: Locator,
  timeout?: number,
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
}

export async function waitForHidden(
  locator: Locator,
  timeout?: number,
): Promise<void> {
  await locator.waitFor({ state: 'hidden', timeout });
}

export async function waitForUrl(
  page: Page,
  urlPattern: string | RegExp,
  timeout?: number,
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout });
}

export async function waitForNetworkIdle(page: Page, timeout?: number): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

export async function waitForDomContentLoaded(page: Page, timeout?: number): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout });
}

export async function measureTime<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = Date.now();
  const result = await fn();
  return [result, Date.now() - start];
}

export async function waitForWithGlitchTimeout(
  locator: Locator,
  glitchTimeout: number,
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: glitchTimeout });
}

export async function waitForNavigationWithGlitchTimeout(
  page: Page,
  urlPattern: string | RegExp,
  glitchTimeout: number,
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout: glitchTimeout });
}
