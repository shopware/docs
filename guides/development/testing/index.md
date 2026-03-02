---
nav:
  title: Testing
  position: 80

---

# Testing

This section covers automated testing strategies and quality requirements for Shopware extensions.

## End-to-End testing

For simulating real user journeys and integration scenarios, Shopware recommends end-to-end (E2E) testing. Playwright is the officially supported tool for automating entire workflows across the application. 

Playwright provides:

* Preconfigured fixtures
* Storefront and Administration page objects
* API clients
* Test data helpers

<PageRef page="./e2e-playwright/index.md" />

## Unit testing

Shopware supports both PHP backend logic and JavaScript components (for Storefront and Administration). Unit tests validate isolated logic in your extension.

### PHP (PHPUnit)

Use PHPUnit to write and run backend unit tests for your PHP code.
  
<PageRef page="./unit-testing/php-unit.md" />

### JavaScript (Jest)

Use Jest to test Storefront JS and Vue components following modern best practices.

<PageRef page="./unit-testing/jest-storefront.md" />

Test custom Administration panel modules and components using Jest with the Shopware admin setup.

<PageRef page="./unit-testing/jest-admin.md" />

## Continuous Integration (CI)

Automate quality checks, builds, and artifact creation in your CI pipeline to keep extensions reproducible and safe to deploy.

Learn how to structure CI for projects and plugins, including static analysis, test execution, and artifact promotion:

<PageRef page="./ci.md" />

## Testing guidelines for extensions

To publish your extension in the Shopware Store, follow the testing criteria used during the Store review process.

<PageRef page="./testing-guidelines.md" />

It focuses on how your extension is functionally tested before approval.

For the official publication requirements, legal conditions, and compliance rules, see:

<PageRef page="../store/quality-guidelines.md" />
