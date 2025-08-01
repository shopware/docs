---
nav:
  title: Fixtures
  position: 13
---

# General fixtures

## DefaultSalesChannel

We try to encapsulate test execution within the system under test and make tests as deterministic as possible. The idea is, to have a separate sales channel created which is used to do tests within the standard Storefront. The `DefaultSalesChannel` fixture is a worker scoped fixture and is there to achieve exactly that. Using it will provide you with a new sales channel with default settings, including a default Storefront customer.

### Properties

- `salesChannel`: The Shopware sales channel reference.
- `customer`: A default Storefront customer reference.
- `url`: The url to the sales channel Storefront.

## AdminApiContext

This context provides a ready to use client for the Admin-API of Shopware. It is based on the standard Playwright [APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext), but will handle authentication for you, so you can start doing API request to the Shopware instance under test right away. You can use it, for example, for test data creation or API testing. Learn more about the usage of the Shopware Admin-API in the [API documentation](https://shopware.stoplight.io/docs/admin-api).

### Methods

- `get`
- `post`
- `patch`
- `delete`
- `fetch`
- `head`

### Usage

```TypeScript
import { test, expect } from './../BaseTestFile';

test('Property group test scenario', async ({ AdminApiContext }) => {

    const response = await AdminApiContext.post('property-group?_response=1', {
        data: {
            name: 'Size',
            description: 'Size',
            displayType: 'text',
            sortingType: 'name',
            options: [{
                name: 'Small',
            }, {
                name: 'Medium',
            }, {
                name: 'Large',
            }],
        },
    });

    expect(response.ok()).toBeTruthy();
});
```

## StoreApiContext

This context provides a ready to use client for the Store-API of Shopware and is based on the standard Playwright [APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext). You can do API calls on behalf of a Storefront user. Learn more about the usage of the Shopware Store-API in the [documentation](https://shopware.stoplight.io/docs/store-api/).

Note that, other than the AdminApiContext, the StoreApiContext won't do an automated login of the shop customer. This is, because a Storefront user isn't always a registered user by default, and you might want to test this behaviour explicitly. You can use the `login` method to simply login as a registered shop customer.

### Methods

- `login(user)`: Does a login of a customer and will store the login state for future requests. 
- `get`
- `post`
- `patch`
- `delete`
- `fetch`
- `head`

### Usage

```TypeScript
import { test, expect } from './../BaseTestFile';

test('Store customer test scenario', async ({ StoreApiContext, DefaultSalesChannel }) => {

    // Login as the default customer.
    await StoreApiContext.login(DefaultSalesChannel.customer);

    // Create a new cart for the customer.
    const response = await StoreApiContext.post('checkout/cart', {
        data: { name: 'default-customer-cart' },
    });

    expect(response.ok()).toBeTruthy();
});
```

## AdminPage

This fixture provides a Playwright [page](https://playwright.dev/docs/api/class-page) context for the Shopware Administration. It creates a new admin user with an authenticated session. You can start testing within the Administration using this page right away.

### Usage

```TypeScript
import { test, expect } from './../BaseTestFile';

test('Shopware admin test scenario', async ({ AdminPage }) => {

    await AdminPage.goto('#/sw/product/index');
    await expect(AdminPage.locator('.sw-product-list__add-physical-button')).toBeVisible();
});
```

Note that this is just a very rough example. In most cases you won't use this page context directly, but maybe a [page-object](#page-objects) using this page.

## StorefrontPage

This fixture provides a Playwright [page](https://playwright.dev/docs/api/class-page) context for the Shopware Storefront of the default sales channel.

## Add new fixtures

To add new general fixtures create them inside the `src/fixtures` folder. Keep in mind, that you need to merge your new fixture inside the `/src/index.ts` file.
