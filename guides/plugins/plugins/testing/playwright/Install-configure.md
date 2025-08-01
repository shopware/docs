---
nav:
  title: Installation & Configuration
  position: 11
---

# Overview

This is a setup guide for the Shopware Acceptance Test Suite (ATS). This section will walk you through initializing a Playwright project, installing the ATS package, and configuring the environment for local testing. Whether you are writing new tests or running existing ones, following these steps ensures your environment is correctly prepared.

## Installation

Start by creating your own [Playwright](https://playwright.dev/docs/intro) project.

```shell
npm init playwright@latest
```

Add the package for the Shopware Acceptance Test Suite to your project.

```shell
npm install @shopware-ag/acceptance-test-suite
```

Make sure to install Playwright and its dependencies.

```shell
npm install
npx playwright install
npx playwright install-deps
```

## Configuration

The test suite is designed to test against any Shopware instance with pure API usage. To grant access to the instance under test, you can use the following environment variables. You can decide between two authentication options - admin user or shopware integration (recommended).

```dotenv
# .env

APP_URL="<url-to-the-shopware-instance>"

# Authentication via integration
SHOPWARE_ACCESS_KEY_ID="<your-shopware-integration-id>"
SHOPWARE_SECRET_ACCESS_KEY="<your-shopware-integration-secret>"

# Autentication via admin user
SHOPWARE_ADMIN_USERNAME="<administrator-user-name>"
SHOPWARE_ADMIN_PASSWORD="<administrator-user-password>"
```

To ensure Playwright is referencing the right instance, you can use the same environment variable in your Playwright configuration.

```TypeScript
// playwright.config.ts

import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        baseURL: process.env['APP_URL'],
    }
});
```

For more information about how to configure your Playwright project, have a look into the [official documentation](https://playwright.dev/docs/test-configuration).

## Mailpit configuration

Set up your local Mailpit instance by following the instructions at [Mailpit GitHub repository](https://github.com/axllent/mailpit).  
By default, Mailpit starts a web interface at `http://localhost:8025` and listens for SMTP on port `1025`.  
Set the `MAILPIT_BASE_URL` environment variable in `playwright.config.ts` to `http://localhost:8025`. You can now run email tests, such as `tests/Mailpit.spec.ts`.

## Usage

The test suite uses the [extension system](https://playwright.dev/docs/extensibility) of Playwright and can be used as a full drop-in for Playwright. But, as you might also want to add your own extensions, the best way to use it is to create your own base test file and use it as the central reference for your test files. Add it to your project root or a specific fixture directory and name it whatever you like.

Make sure to set `"type": "module",` in your `package.json`.

```TypeScript
// BaseTestFile.ts

import { test as base } from '@shopware-ag/acceptance-test-suite';
import type { FixtureTypes } from '@shopware-ag/acceptance-test-suite';

export * from '@shopware-ag/acceptance-test-suite';

export const test = base.extend<FixtureTypes>({
    
    // Your own fixtures 
    
});
```

Within your tests you can import the necessary dependencies from your base file.

```TypeScript
// tests/MyFirstTest.spec.ts

import { test, expect } from './../BaseTestFile';

test('My first test scenario.', async ({ AdminApiContext, DefaultSalesChannel }) => {
    
    // Your test logic
    
});
```

In the example above you can see two Shopware specific fixtures that are used in the test, `AdminApiContext` and `DefaultSalesChannel`. Every fixture can be used as an argument within the test method. Read more about available [fixtures](./fixtures.md) in the next section.
