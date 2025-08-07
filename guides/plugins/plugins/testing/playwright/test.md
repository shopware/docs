---
nav:
  title: Test Suite
  position: 17
---

# Testing within the Test Suite

The `tests` folder ensures the reliability of the testing framework by validating the functionality of tools and data used in tests. Add tests to verify any new features or changes you introduce:

- **Page Objects**: Ensure they are correctly implemented and interact with the application as expected, including navigation, element visibility, and user interactions.
- **TestDataService Methods**: Verify that methods for creating, getting, and cleaning up test data (e.g., products, customers, orders) work correctly and produce consistent results.

```TypeScript
//Example for page objects

await ShopAdmin.goesTo(AdminManufacturerCreate.url());
await ShopAdmin.expects(AdminManufacturerCreate.nameInput).toBeVisible();
await ShopAdmin.expects(AdminManufacturerCreate.saveButton).toBeVisible();
```

```TypeScript
//Example for TestDataService

const product = await TestDataService.createProductWithImage({ description: 'Test Description' });
expect(product.description).toEqual('Test Description');
expect(product.coverId).toBeDefined();
```

## Running tests in the Test Suite

To work on the test suite and execute tests from within this repository, you must run a corresponding Docker image for the specific Shopware version.

We publish pre-built images at the [GitHub container registry](https://github.com/orgs/shopware/packages/container/package/acceptance-test-suite%2Ftest-image). The images are built daily; check to see which versions are available.

To select an image, export the corresponding tag as `SHOPWARE_VERSION` and start the containers:

```bash
SHOPWARE_VERSION=trunk docker compose up --wait shopware
```

<details>
<summary>What if the version I would like to test is not available as a pre-built image?</summary>

If you want to test with an image that's not available already, you can build it yourself by exporting a few more variables:

```bash
export PHP_VERSION="8.3" # PHP version of the base image
export SHOPWARE_VERSION="v6.5.8.0" # Shopware version to check out. This may be either a branch or a tag, depending on the value of SHOPWARE_BUILD_SOURCE
export SHOPWARE_BUILD_SOURCE="tag" # Either "branch" or "tag"

docker compose up --attach-dependencies shopware # This will build the image if it's not available
```

</details>

Afterwards, you can execute the normal playwright commands:

```bash
npx playwright test --ui
```
