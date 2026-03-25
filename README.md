# SauceDemo — Playwright E2E Test Framework

[![Playwright Tests](https://github.com/Zahedcse/Softwrd-task-Saucedemo/actions/workflows/ci.yml/badge.svg)](https://github.com/Zahedcse/Softwrd-task-Saucedemo/actions/workflows/ci.yml)
[![Allure Report](https://img.shields.io/badge/Allure%20Report-Live-blue)](https://zahedcse.github.io/Softwrd-task-Saucedemo/allure-report/)

> **[View Latest Test Report](https://zahedcse.github.io/Softwrd-task-Saucedemo/allure-report/)**

Production-grade end-to-end test automation framework for [SauceDemo](https://www.saucedemo.com), built with **Playwright** + **TypeScript**.

---

## Table of Contents

1. [Framework Choice & Rationale](#1-framework-choice--rationale)
2. [Architecture Overview](#2-architecture-overview)
3. [Setup & Run Instructions](#3-setup--run-instructions)
4. [CI/CD Pipeline](#4-cicd-pipeline)
5. [Test Coverage Summary](#5-test-coverage-summary)

---

## 1. Framework Choice & Rationale

### Chosen Stack: Playwright + TypeScript

| Criterion | Decision |
|-----------|----------|
| **Test runner** | Playwright Test (`@playwright/test`) |
| **Language** | TypeScript — type safety eliminates a class of selector/data bugs at compile time |
| **Reporting** | Playwright HTML + Allure (dual reporters serving different audiences) |
| **CI** | GitHub Actions with browser matrix (Chromium, Firefox, WebKit) |

### Why Playwright over the alternatives?

After evaluating the usual suspects — Selenium, Cypress, and WebdriverIO — Playwright was the clear choice for this project. Selenium's verbosity and reliance on explicit waits adds unnecessary complexity for a modern web app like SauceDemo. Cypress has a great developer experience but its lack of native multi-browser support and cross-origin iframe limitations make it unsuitable for a cross-browser test suite. WebdriverIO is capable but carries more configuration overhead than the task warrants.

Playwright hits the right balance: built-in auto-wait on every action eliminates flaky sleep calls entirely, TypeScript-first support catches selector and data type bugs at compile time, and the Trace Viewer makes debugging CI failures straightforward without needing to reproduce them locally. The `test.extend()` fixture system gave us clean dependency injection for the Page Object layer, and the native browser matrix (Chromium, Firefox, WebKit) meant cross-browser coverage required no extra tooling.

That's why I chose Playwright.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Test Specs  (*.spec.ts)                        │
│         Tagged: @smoke | @regression | @security | @performance  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ imports `test` from
┌──────────────────────▼──────────────────────────────────────────┐
│              test-fixtures.ts  (Custom test extensions)          │
│   Injects Page Objects + authenticatedPage pre-login fixture     │
└───────────┬──────────────────────────────┬──────────────────────┘
            │                              │
┌───────────▼───────────┐    ┌─────────────▼──────────────────────┐
│     Page Objects       │    │           Utilities                 │
│  base.page.ts          │    │  smart-waits.ts  — no hardcoded    │
│  login.page.ts         │    │    delays, Playwright waitFor API  │
│  inventory.page.ts     │    │  custom-assertions.ts — domain     │
│  cart.page.ts          │    │    specific expect() wrappers      │
│  checkout-step-one.ts  │    │  allure-helpers.ts — step/attach   │
│  checkout-step-two.ts  │    └────────────────────────────────────┘
│  checkout-complete.ts  │
└───────────┬───────────┘
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                     Configuration Layer                           │
│  env.config.ts   — runtime: BASE_URL, credentials, timeouts      │
│  test.config.ts  — stable: routes, sort keys, products, tax      │
└───────────┬──────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                    Fixture Data (JSON)                            │
│  users.json | products.json | checkout.json | error-messages.json│
└──────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**Page Object Model with `BasePage`**
All authenticated page objects extend `BasePage`, which owns the shared header/cart/menu locators. Tests never construct locators directly — page objects expose named action methods.

**`data-test` attribute strategy**
All selectors use `getByTestId()` mapped to `data-test` attributes (`testIdAttribute: 'data-test'` in `playwright.config.ts`). CSS class names and XPath are never used — they are brittle to styling refactors and DOM restructures.

**Fixture-based dependency injection**
Tests import a custom `test` object (from `utils/test-fixtures.ts`) that extends Playwright's base `test`. Page objects are injected as fixtures — tests request what they need, nothing more. The `authenticatedPage` fixture handles login as a pre-condition silently.

**Two-layer configuration**
- `env.config.ts` — everything that varies between environments (URL, credentials, timeouts). Read from `.env`.
- `test.config.ts` — application constants that never change between environments (routes, error messages, product catalogue, tax rate).

**Allure step wrapping**
Every page object action wraps its body in `allure.step()`, producing a readable step-by-step execution trace in the report without any test-side instrumentation.

**Known-defect documentation over skipping**
`problem_user` and `error_user` exhibit intentional bugs. Tests for these users assert the observed error state and attach JSON evidence to the Allure report. This keeps the report as a living specification of both working and broken features.

---

## 3. Setup & Run Instructions

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20.x |
| npm | ≥ 10.x |
| Java 17+ | Only for Allure CLI report generation |

### Quick Start — two commands from a clean clone

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/saucedemo-playwright.git
cd saucedemo-playwright
npm ci          # install all dependencies
npm test        # installs Chromium automatically, then runs all 55 tests
```

> **No `.env` file needed.** All SauceDemo credentials are public and fall back to safe defaults built into `src/config/env.config.ts`. The `pretest` hook in `package.json` runs `playwright install --with-deps chromium` automatically before the first test run.

### All available commands

```bash
npm test                    # full suite (Chromium, headless)
npm run test:smoke          # @smoke tagged tests only — fast sanity check
npm run test:regression     # full @regression suite
npm run test:headed         # run in a visible browser window
npm run test:auth           # authentication tests only
npm run test:catalog        # product catalog tests only
npm run test:cart           # shopping cart tests only
npm run test:checkout       # checkout flow tests only
npm run test:performance    # performance & resilience tests only
npm run report:html         # open the Playwright HTML report
npm run allure:serve        # serve the Allure report (requires allure-commandline)
npm run typecheck           # TypeScript type check with no test execution

# Interactive Playwright UI mode
npx playwright test --ui
```

### Viewing Reports

```bash
# Playwright HTML report (opens in browser)
npm run report:html

# Generate + open Allure report (requires Java 17+ and allure-commandline)
npm install -g allure-commandline
npm run report:allure

# Serve existing Allure results
npm run allure:serve
```

---

## 4. CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

The pipeline runs on every `push` and `pull_request` to `main` / `develop`.

**Pipeline stages:**

```
push / PR
    │
    ▼
[typecheck]  ── TypeScript compiler check (fast-fail before tests run)
    │
    ▼
[test] ─── matrix: chromium | firefox | webkit (parallel)
    │         • Install deps → cache Playwright browsers
    │         • Run tests with list + HTML + Allure + JUnit reporters
    │         • Upload artifacts: HTML report, Allure results, JUnit XML
    │         • Upload failure artifacts on test failure (screenshots/videos/traces)
    │
    ▼
[allure-report]  ── Merge all browser Allure results → generate combined report
    │               Upload as artifact → deploy to GitHub Pages (main branch only)
    │
    ▼
[pr-comment]  ── Post JUnit test summary as PR comment (PRs only)
```

**Single command to run all tests:**
```bash
npm test
```

**Viewing CI artifacts:**
1. Go to the repository → **Actions** tab
2. Select a workflow run
3. Scroll to **Artifacts** section
4. Download `html-report-chromium`, `allure-report-merged`, or `test-artifacts-*`

**Live Allure report (main branch):**
Published to GitHub Pages after each successful push to `main`:
`https://<YOUR_GITHUB_USERNAME>.github.io/saucedemo-playwright/allure-report/`

---

## 5. Test Coverage Summary

### What is covered

| Area | Scenarios | Tags |
|------|-----------|------|
| **2.1 Authentication** | Valid login (standard_user), wrong password, empty username, empty password, both empty, SQL injection, XSS attempt, error dismissal, locked_out_user, session persistence across navigation, logout, unauthenticated direct URL access, back-nav after logout | `@smoke` `@regression` `@security` |
| **2.2 Product Catalog** | 6 products load, correct names and prices, images not broken (standard_user), sort A→Z, sort Z→A, sort Price Low→High, sort Price High→Low, re-sort switching, problem_user image defect detection, standard_user unique image verification | `@smoke` `@regression` |
| **2.3 Shopping Cart** | Add single item + badge update, item details correct, add multiple items + badge, all items in cart list, remove item from inventory page, selective removal from cart, Add to Cart button toggles, cart persistence across navigation, cart persistence on page reload | `@smoke` `@regression` |
| **2.4 Checkout Flow** | Full purchase (single item), full purchase (multiple items), cart cleared after order, missing first name validation, missing last name validation, missing postal code validation, all fields empty, error dismissal, order summary math (single item), order summary math (multiple items), payment info display, shipping info display, confirmation screen elements, Back Home navigation | `@smoke` `@regression` `@e2e` |
| **2.5 Performance & Resilience** | performance_glitch_user login within extended timeout (smart wait), inventory loads after delay, add-to-cart despite delay, error_user login success, error_user checkout failure (defect documented), error_user cart removal failure (defect documented), error_user add-to-cart failure (defect documented) | `@smoke` `@regression` `@performance` |

**Total: ~45 test cases** across 5 feature areas and 3 browsers = **~135 test executions** per CI run.

### What is intentionally excluded

| Excluded | Reason |
|----------|--------|
| **Product detail page (item.html)** | No specific scenarios in the assessment scope; the POM can be extended trivially |
| **API / network layer testing** | SauceDemo has no documented public API; all state changes go through the UI |
| **Visual pixel comparison (screenshot diffing)** | The assessment's "visual regression" requirement is fulfilled by `src` attribute comparison as hinted in the spec. Full pixel-diff testing (Percy/Applitools) would require a paid service or additional infrastructure |
| **Accessibility testing** | Not in scope; would be added with `@axe-core/playwright` if required |
| **Mobile viewports** | Not in scope; Playwright device emulation can be added as a project configuration |
| **`visual_user`** | Not listed in the assessment credential table; the user type is acknowledged in the performance spec as a low-priority smoke check |

---

## Project Structure

```
saucedemo-playwright/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions pipeline
├── src/
│   ├── config/
│   │   ├── env.config.ts             # Runtime: URL, credentials, timeouts
│   │   └── test.config.ts            # Stable: routes, products, error messages, tax
│   ├── fixtures/
│   │   ├── users.json                # Invalid credentials + security payloads
│   │   ├── products.json             # Expected catalogue + sort orders
│   │   ├── checkout.json             # Customer info variations
│   │   └── error-messages.json       # Expected error strings
│   ├── pages/
│   │   ├── base.page.ts              # Shared header/nav/cart — POM base class
│   │   ├── login.page.ts             # Login page
│   │   ├── inventory.page.ts         # Product catalog
│   │   ├── cart.page.ts              # Shopping cart
│   │   ├── checkout-step-one.page.ts # Customer info form
│   │   ├── checkout-step-two.page.ts # Order review
│   │   └── checkout-complete.page.ts # Confirmation screen
│   ├── tests/
│   │   ├── auth/
│   │   │   └── authentication.spec.ts
│   │   ├── catalog/
│   │   │   └── product-catalog.spec.ts
│   │   ├── cart/
│   │   │   └── shopping-cart.spec.ts
│   │   ├── checkout/
│   │   │   └── checkout-flow.spec.ts
│   │   └── performance/
│   │       └── performance-resilience.spec.ts
│   └── utils/
│       ├── test-fixtures.ts          # Playwright custom test + page object injection
│       ├── smart-waits.ts            # waitFor wrappers, measureTime, no sleep
│       ├── custom-assertions.ts      # Domain assertions, price parsing, math checks
│       └── allure-helpers.ts         # Allure metadata, step, attachment helpers
├── reports/                          # Generated (gitignored)
├── allure-results/                   # Generated (gitignored)
├── test-results/                     # Screenshots/videos/traces (gitignored)
├── .env                              # Local env (gitignored)
├── .env.example                      # Template — commit this
├── .gitignore
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```
