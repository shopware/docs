---
nav:
  title: Playwright E2E testing
  position: 10
---

# Shopware Acceptance Test Suite: Playwright

[Playwright](https://playwright.dev/) is a powerful tool for end-to-end testing of web applications. It allows you to automate browser interactions, making it ideal for testing the functionality of your [Shopware](https://github.com/shopware/shopware) plugins and themes.

It provides several useful Playwright [fixtures](https://playwright.dev/docs/test-fixtures) to start testing with Shopware right away, including page contexts and [page objects](https://playwright.dev/docs/pom) for Storefront and Administration, API clients, test data creation, and reusable test logic.

## Test an existing storefront

To run selected tests against a deployed shop's existing sales channel, see [Test an existing storefront](./existing-storefront.md).
This opt-in mode uses the channel's current domain, theme and localization; the default mode continues to create an isolated channel per worker.
