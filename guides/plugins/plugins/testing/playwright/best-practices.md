---
nav:
  title: Best Practices
  position: 20
---

# Best practices

A good first read about this is the official [playwright best practices page](https://playwright.dev/docs/best-practices). It outlines the essential practices to follow when writing acceptance tests for Shopware.

The most important part is [test isolation](https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible), which helps to prevent flaky behavior and enables the test to be run in parallel and on systems with an unknown state.

## Dos

- Use the [`TestDataService`](https://github.com/shopware/acceptance-test-suite/blob/trunk/src/services/TestDataService.ts) for creating test data
- Create all the data that is required for your test case. That includes sales channels, customers, and users (the page fixtures handle most of the common use cases)
- Clean it up if you don't need it anymore. The `TestDataService` will take care of it if you used it to create the test data
- If you need specific settings for your test, set them explicitly for the `user/customer/sales` channel
- Directly jump to the detail pages with the ID of the entities you have created. If that is not possible, use the search with a unique name to filter lists to just that single entity
- If you need to skip tests, comment any relevant github issues as part of the skip method: `test.skip('Blocked by https://[...])`

## Don'ts

- Do not expect lists/tables only to contain one item; leverage unique IDs/names to open or find your entity instead
- Same with helper functions, do not expect only to get one item back from the API. Always use unique criteria for the API call
- Avoid unused fixtures. If you request a fixture but don't use any data from the fixture, the test or fixture should be refactored
- Do not depend on implicit configuration and existing data. Examples:
    - rules
    - flows
    - categories
- Do not expect the shop to have the defaults `en_GB` and `EUR`
- Do not change global settings (sales channel is ok, because we created it). Everything in "Settings" that is not specific to a sales channel (tax, search, etc.)

## Sensitive Data / Credentials

Sometimes you have to provide sensitive data or credentials for your tests to run, for example, credentials for a sandbox environment for a payment provider. Apart from avoiding having those credentials in the actual code, you should also prevent them from appearing in logs or traces. To achieve this, you should outsource steps involving sensitive data to a separate project that runs before the actual test project and disable traces for it.

**Example**

```Typescript
projects: [
    // Init project using sensitive data
 {
      name: 'init', 
      testMatch: /.*\.init\.ts/,
      use : {trace : 'off'}
 },

 {
      // actual test project
      // [...]
      dependencies: ['init'],
 }]
```

## Debugging API calls

Debugging API calls may not be an easy task at first glance, because if the call you made returns an error, it is not directly visible to you. But you can use the `errors[]` array of the response and log that on the console.

**Example**

```Typescript
const response = await this.AdminApiClient.post('some/route', {
    data: {
        limit: 1,
        filter: [
 {
                type: 'equals',
                field: 'someField',
                value: 'someValue',
 },
 ],
 },
});
const responseData = await response.json();
console.log(responseData.errors[0]);
```

## Code contribution

You can contribute to this project via its [official repository](https://github.com/shopware/acceptance-test-suite/) on GitHub.

This project uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). Make sure to form your commits accordingly to the spec.
