---
nav:
  title: Actor Pattern
  position: 15
---

# Actor pattern

The actor pattern is a basic concept that we added to our test suite. It is something not related to Playwright, but similar concepts exist in other testing frameworks. We implemented it, because we want to have reusable test logic that can be used in a human-readable form, without abstracting away Playwright as a framework. So you are totally free to use it or not. Any normal Playwright functionality will still be usable in your tests.

The concept adds two new entities besides the already mentioned [page objects](./page-object.md)

- **Actor**: A specific user with a given context performing actions (tasks) inside the application.
- **Task**: A certain action performed by an actor.
- **Pages**: A page of the application on which an actor performs a task.

## Actors

The actor class is just a lightweight solution to simplify the execution of reusable test logic or the navigation to a certain page.

### Properties

- `name`: The human-readable name of the actor.
- `page`: A Playwright page context the actor is navigating.

### Methods

- `goesTo`: Accepts a URL of a page the actor should navigate to.
- `attemptsTo`: Accepts a "task" function with reusable test logic the actor should perform.
- `expects`: A one-to-one export of the Playwright `expect` method to use it in the actor pattern.

These methods lead to the following pattern:

- The **actor** *goes to* a **page**.
- The **actor** *attempts to* perform a certain **task**.
- The **actor** *expects* a certain result.

Translated into test code, this pattern can look like this:

```TypeScript
import { test } from './../BaseTestFile';

test('Product detail test scenario', async ({ 
    ShopCustomer, 
    StorefrontProductDetail, 
    ProductData 
}) => {

    await ShopCustomer.goesTo(StorefrontProductDetail.url(ProductData));
    await ShopCustomer.attemptsTo(AddProductToCart(ProductData));
    await ShopCustomer.expects(StorefrontProductDetail.offCanvasSummaryTotalPrice).toHaveText('€99.99*');
});
```

In this example you can see that this pattern creates tests that are very comprehensible, even for non-tech people. They also make it easier to abstract simple test logic that might be used in different scenarios into executable tasks, like adding a product to the cart.

The test suite offers two different actors by default:

- `ShopCustomer`: A user that is navigating the Storefront.
- `ShopAdmin`: A user that is managing Shopware via the Administration.

## Tasks

Tasks are small chunks of reusable test logic that can be passed to the `attemptsTo` method of an actor. They are created via Playwright fixtures and have access to the same dependencies. Every executed task will automatically be wrapped in a test step of Playwright, so you get nicely structured reports of your tests.

**Example**

```TypeScript
import { test as base } from '@playwright/test';
import type { FixtureTypes, Task } from '@shopware-ag/acceptance-test-suite';

export const Login = base.extend<{ Login: Task }, FixtureTypes>({
    Login: async ({
        ShopCustomer,
        DefaultSalesChannel,
        StorefrontAccountLogin,
        StorefrontAccount,
    }, use)=> {
        const task = () => {
            return async function Login() {
                const { customer } = DefaultSalesChannel;

                await ShopCustomer.goesTo(StorefrontAccountLogin.url());

                await StorefrontAccountLogin.emailInput.fill(customer.email);
                await StorefrontAccountLogin.passwordInput.fill(customer.password);
                await StorefrontAccountLogin.loginButton.click();

                await ShopCustomer.expects(StorefrontAccount.personalDataCardTitle).toBeVisible();
            }
        };

        await use(task);
    },
});
```

This fixture is the "login" task and performs a simple Storefront login of the default customer. Everytime we need a logged-in shop customer, we can simply reuse this logic in our test.

```TypeScript
import { test } from './../BaseTestFile';

test('Customer login test scenario', async ({ ShopCustomer, Login }) => {
    
    await ShopCustomer.attemptsTo(Login());
});
```

You can create your own tasks in the same way to make them available for the actor pattern. Every task is just a simple Playwright fixture containing a function call with the corresponding test logic. Make sure to merge your task fixtures with other fixtures you created in your base test file. You can use the `mergeTests` method of Playwright to combine several fixtures into one test extension. Use `/src/tasks/shop-customer-tasks.ts` or `/src/tasks/shop-admin-tasks.ts` for that.

To keep tests easily readable, use names for your tasks so that in the test itself the code line resembles the `Actor.attemptsTo(doSomething)` pattern as good as possible.

**Example**

```TypeScript
// Bad example
await ShopCustomer.attemptsTo(ProductCart);

// Better example
await ShopCustomer.attemptsTo(PutProductIntoCart);
```
