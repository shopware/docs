---
nav:
  title: Page Objects
  position: 14
---

# Page Objects

Page objects can be helpful to simplify the usage of element selectors and make them available in a reusable way. They help you to organize page-specific locators and provide helpers for interacting with a given page. Within our test suite, we try to keep the page objects very simple and not add too much logic to them. So most of the page objects resemble just a collection of element locators and maybe some little helper methods.

There are several page objects to navigate the different pages of the Administration and Storefront. You can use them as any other fixture within your test. There is also a guide on page objects in the official Playwright [documentation](https://playwright.dev/docs/pom).

## Usage

```TypeScript
import { test, expect } from './../BaseTestFile';

test('Storefront cart test scenario', async ({ StorefrontPage, StorefrontCheckoutCart }) => {

    await StorefrontPage.goto(StorefrontCheckoutCart.url());
    await expect(StorefrontCheckoutCart.grandTotalPrice).toHaveText('€100.00*');
});
```

You can get an overview of all available page objects in the [repository](https://github.com/shopware/acceptance-test-suite/tree/trunk/src/page-objects) of this test suite.

## Page Object module

The `modules` folder is designed to house reusable utility functions that operate on a `Page` object (from Playwright). These functions dynamically interact with different browser pages or contexts using the `page` parameter.
For example, utility functions like `getCustomFieldCardLocators` or `getSelectFieldListitem` are used across multiple page objects to handle specific functionality (e.g., managing custom fields or select field list items). Centralizing these utilities in the `modules` folder improves code organization, readability, and reduces duplication.
Create a new class inside a module when it helps to streamline the codebase and avoid repetitive logic across page objects.

You can find how `getCustomFieldCardLocators` is defined in the [modules folder](https://github.com/shopware/acceptance-test-suite/blob/trunk/src/page-objects/administration/modules/CustomFieldCard.ts) and used in other [page object classes](https://github.com/shopware/acceptance-test-suite/blob/trunk/src/page-objects/administration/ProductDetail.ts).

## Add new Page Objects

Page objects are organized mainly by their usage in the administration or storefront. To add a new page object, simply add it to the respective subfolder and reference it in `AdministrationPages.ts` or `StorefrontPages.ts`.

**Usage**

```TypeScript
import { test as base } from '@playwright/test';
import type { FixtureTypes } from '../types/FixtureTypes';

import { ProductDetail } from './administration/ProductDetail';
import { OrderDetail } from './administration/OrderDetail';
import { CustomerListing } from './administration/CustomerListing';
// [...]
import { MyNewPage } from './administration/MyNewPage';

export interface AdministrationPageTypes {
    AdminProductDetail: ProductDetail;
    AdminOrderDetail: OrderDetail;
    AdminCustomerListing: CustomerListing;
    // [...]
    AdminMyNewPage: MyNewPage;
}

export const AdminPageObjects = {
    ProductDetail,
    OrderDetail,
    CustomerListing,
    // [...]
    MyNewPage,
}
```
