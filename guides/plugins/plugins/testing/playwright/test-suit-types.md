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

Within that example above, you are importing the auto-generated type for `ProductReview` from the Shopware Admin API OpenAPI schema and extending it with additional or overridden fields using & { ... }.

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

For custom use cases, simply define a custom type:

```
export type CustomShippingMethod = {
 name: string;
 active: boolean;
 deliveryTimeId: string;
}
```
