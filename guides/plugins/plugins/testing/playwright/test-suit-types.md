---
nav:
  title: Test Suite Types
  position: 16
---

# Types in the Test Suite

The Shopware Acceptance Test Suite leverages TypeScript’s static typing to ensure that test data structures, API interactions, and test logic are consistent and error-resistant.

## Shopware Types

The centralized type definition file, [ShopwareTypes.ts](https://github.com/shopware/acceptance-test-suite/blob/trunk/src/types/ShopwareTypes.ts) is tightly coupled with the TestDataService, which defines the shape and default data of all supported Shopware entities. Each supported entity—such as Product, Customer, Media, etc.—is defined with its properties and default values. These types are then referenced throughout the TestDataService to provide IntelliSense, validation, and consistent data structures.

```
export type ProductReview = components['schemas']['ProductReview'] & {
    id: string,
    productId: string,
    salesChannelId: string,
    title: string,
    content: string,
    points: number,
}
```

Within that example above you are importing the auto-generated type for `ProductReview` from the Shopware Admin API OpenAPI schema and extending it with additional or overridden fields using & { ... }.

Sometimes, you might want to remove fields from a type. TypeScript provides the Omit<T, K> utility to exclude fields from a type:

```
export type Country = Omit<components['schemas']['Country'], 'states'> & {
  id: string,
  states: [{
    name: string,
    shortCode: string,
  }],
}
```

For custom use cases, define a custom type:

```
export type CustomShippingMethod = {
  name: string;
  active: boolean;
  deliveryTimeId: string;
}
```

## Testing within the Test Suite

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

If you want to work on the test suite and try to execute tests from within this repository, you have to run a corresponding docker image for a specific Shopware version.

We publish pre-built images at the [GitHub container registry](https://github.com/orgs/shopware/packages/container/package/acceptance-test-suite%2Ftest-image). The images are built daily, check to see which versions are available.

In order to select an image, export the corresponding tag as `SHOPWARE_VERSION` and start the containers:

```bash
SHOPWARE_VERSION=trunk docker compose up --wait shopware
```

<details>
<summary>ℹ️ What if the version I'd like to test is not available as a pre-built image?</summary>

If you want to test with an image that's not available already, you can build it yourself by exporting a few more variables:

```bash
export PHP_VERSION="8.3" # PHP version of the base image
export SHOPWARE_VERSION="v6.5.8.0" # Shopware version to check out. This may bei either a branch or a tag, depending on the value of SHOPWARE_BUILD_SOURCE
export SHOPWARE_BUILD_SOURCE="tag" # Either "branch" or "tag"

docker compose up --attach-dependencies shopware # This will build the image if it's not available
```
</details>

Afterward you can execute the normal playwright commands:

```bash
npx playwright test --ui
```
