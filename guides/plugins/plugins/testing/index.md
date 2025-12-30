---
nav:
  title: Testing
  position: 80

---

# Testing

Robust testing is crucial for developing reliable and maintainable Shopware plugins and themes. Shopware provides tooling and guidance for several types of tests, ensuring your code is production-ready and meets community standards.

## Unit Testing

Unit testing is the base layer of an effective test strategy. Shopware supports both PHP backend logic and JavaScript components (for Storefront and Administration):

Use PHPUnit to write and run backend unit tests for your PHP code.
  
<PageRef page="php-unit" />

Use Jest to test Storefront JS and Vue components following modern best practices.

<PageRef page="jest-storefront" />

Test custom Administration panel modules and components using Jest with the Shopware admin setup.
  
<PageRef page="jest-admin" />

## End-to-End (E2E) Testing

For simulating real user journeys and integration scenarios, Shopware recommends end-to-end (E2E) testing. Playwright is the officially supported tool for automating entire workflows across the application.

Automate browser interactions to verify plugins and customizations work as intended in real-world Shopware environments.

<PageRef page="playwright/" />

Refer to the individual guides for setup, examples, and best practices for each testing type.
