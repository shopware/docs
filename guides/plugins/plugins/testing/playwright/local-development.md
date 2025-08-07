---
nav:
  title: Local development
  position: 18
---

# Local development with ATS

To work locally with ATS and your development setup, follow these steps:

## Create your Page Objects and TestDataService methods

In the ATS repository ([shopware/acceptance-test-suite](https://github.com/shopware/acceptance-test-suite)), create or modify your custom page objects, `TestDataService` methods, or any related files.

After making your changes, build the project by running the following command in the ATS repository:

```bash
npm run build
```

This will generate the necessary artifacts in the `dist` folder.

Copy the generated artifacts (e.g., all files in the `dist` folder) from the ATS repository to your local Shopware instance's `node_modules` folder, specifically under the ATS package path:

```bash
cp -R dist/* <path-to-your-shopware-instance>/tests/acceptance/node_modules/@shopware-ag/acceptance-test-suite/dist
```

### Adjust tests, Page Objects, and methods

In your Shopware instance, adjust any tests, page objects, `TestDataService` methods, or other related files to align them with the changes made in the ATS repository.

### Run the tests

Execute the tests to verify your changes. Use the following command from your Shopware project's acceptance test directory:

```bash
cd tests/acceptance
npx playwright test --ui
```

This will launch the Playwright Test Runner UI, where you can select and run specific tests.
By following these steps, you can work locally with the ATS and test your changes in your Shopware instance.
