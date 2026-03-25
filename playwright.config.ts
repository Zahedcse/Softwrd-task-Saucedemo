import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load .env before anything else reads process.env
dotenv.config();

const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'ci';
const headless = process.env.HEADLESS !== 'false';

export default defineConfig({
  testDir: './src/tests',
  testMatch: '**/*.spec.ts',

  // ── Timeouts ────────────────────────────────────────────────────
  timeout: Number(process.env.TEST_TIMEOUT) || 60_000,
  expect: { timeout: 10_000 },

  // ── Parallelism ─────────────────────────────────────────────────
  // Run tests sequentially locally so you can watch each step clearly
  fullyParallel: isCI ? true : false,
  workers: isCI ? 2 : 1,

  // ── Retries: 0 locally so failures surface immediately; 2 on CI ─
  retries: isCI ? 2 : 0,

  // ── Reporters ───────────────────────────────────────────────────
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],

  // ── Shared browser options ───────────────────────────────────────
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    headless,

    // Use data-test as the attribute for getByTestId()
    testIdAttribute: 'data-test',

    // Add a visible delay between actions so you can follow along
    launchOptions: {
      slowMo: isCI ? 0 : 600,
    },

    // Capture on failure only to keep artifacts lean
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: Number(process.env.ACTION_TIMEOUT) || 10_000,
    navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT) || 30_000,
  },

  // ── Output directory for traces/screenshots/videos ───────────────
  outputDir: 'test-results',

  // ── Browser projects ─────────────────────────────────────────────
  // Default: Chromium only for local runs; CI matrix runs all three
  projects: isCI
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      ],
});
