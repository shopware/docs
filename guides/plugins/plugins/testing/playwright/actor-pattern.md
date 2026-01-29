---
nav:
  title: Actor Pattern
  position: 15
---

# Actor pattern

The actor pattern is a basic concept that we added to our test suite. It is something not related to Playwright, but similar concepts exist in other testing frameworks. We implemented it to create reusable test logic that can be used in a human-readable form, without abstracting away Playwright as a framework. So you are free to use it or not. Any standard Playwright functionality will still be usable in your tests.

The concept adds two new entities besides the already mentioned [page objects](./page-object.md)

- **Actor**: A specific user with a given context performing actions (tasks) inside the application.
- **Task**: A specific action performed by an actor.
- **Pages**: A page of the application on which an actor performs a task.

## Actors

The Actor class is a lightweight solution to simplify the execution of reusable test logic or navigate to a specific page.

## Properties

- `name`: The human-readable name of the actor.
- `page`: A Playwright page context that the actor is navigating.

## Primary methods

- `goesTo`: Accepts a URL of a page the actor should navigate to.
- `attemptsTo`: Accepts a "task" function with reusable test logic that the actor should perform.
- `expects`: A one-to-one export of the Playwright `expect` method to use it in the actor pattern.

These methods lead to the following pattern:

- The **actor** _goes to_ a **page**.
- The **actor** _attempts to_ perform a certain **task**.
- The **actor** _expects_ a certain result.

Translated into test code, this pattern can look like this:

```typescript
import { test } from "./../BaseTestFile";

test("Product detail test scenario", async ({
  ShopCustomer,
  StorefrontProductDetail,
  TestDataService,
}) => {
  const product = await TestDataService.createBasicProduct();

  await ShopCustomer.goesTo(StorefrontProductDetail.url(product));
  await ShopCustomer.attemptsTo(AddProductToCart(product));
  await ShopCustomer.expects(
    StorefrontProductDetail.offCanvasSummaryTotalPrice,
  ).toHaveText("€99.99*");
});
```

In this example, you can see that this pattern creates very comprehensible tests, even for non-tech people. They also make it easier to abstract simple test logic that might be used in different scenarios into executable tasks, like adding a product to the cart.

The test suite offers two different actors by default:

- `ShopCustomer`: A user that is navigating the Storefront.
- `ShopAdmin`: A user who manages Shopware via the Administration.

## Accessibility methods

- `a11y_checks`: Accepts a locator and verifies if the desired locator is both focused and displays a visible focus indicator. This is automatically called via `presses`, `fillsIn`, and `selectsRadioButton`.
- `presses`: An extension of the Playwright `press` method to include `a11y_checks` as well as automatically apply a keyboard key press per default browser keyboard mappings (which can also be overridden). A keyboard focused alternative to the Playwright `click` method.
- `fillsIn`: An extension of the Playwright `fill` method to include `a11y_checks`.
- `selectsRadioButton`: Selects radio buttons using keyboard navigation in addition to verifying visible focus (via `presses`).

These methods serve as a way to enforce better accessibility practices by using keyboard navigation and checking for visible focus indicators (both of which are WCAG requirements). They can be used both in tests and tasks.

:::info
Be aware that the Playwright `click` method automatically includes a number of [actionability checks](https://playwright.dev/docs/actionability) to combat flakiness. When utilizing the Actor accessibility methods, you may need to adjust your tests to individually assert some of these actionability checks for certain locators yourself.
:::

## Tasks

Tasks are small chunks of reusable test logic that can be passed to the `attemptsTo` method of an actor. They are created via Playwright fixtures and have access to the same dependencies. Every executed task will automatically be wrapped in a test step of Playwright, so you get nicely structured reports of your tests.

**Basic Example**

```typescript
import { test as base } from "@playwright/test";
import type { Task } from "../../../types/Task";
import type { FixtureTypes } from "../../../types/FixtureTypes";
import type { Customer } from "../../../types/ShopwareTypes";

export const Login = base.extend<{ Login: Task }, FixtureTypes>({
  Login: async (
    {
      ShopCustomer,
      DefaultSalesChannel,
      StorefrontAccountLogin,
      StorefrontAccount,
    },
    use,
  ) => {
    const task = (customCustomer?: Customer) => {
      return async function Login() {
        const customer = customCustomer
          ? customCustomer
          : DefaultSalesChannel.customer;

        await ShopCustomer.goesTo(StorefrontAccountLogin.url());

        await ShopCustomer.fillsIn(
          StorefrontAccountLogin.emailInput,
          customer.email,
        );
        await ShopCustomer.fillsIn(
          StorefrontAccountLogin.passwordInput,
          customer.password,
        );
        await ShopCustomer.presses(StorefrontAccountLogin.loginButton);

        await ShopCustomer.expects(
          StorefrontAccount.personalDataCardTitle,
        ).toBeVisible();
      };
    };

    await use(task);
  },
});
```

This fixture is the "Login" task and performs a simple Storefront login of the default customer via keyboard navigation (automatically includes `a11y_checks` assertions). Every time we need a logged-in shop customer, we can simply reuse this logic in our test.

```typescript
import { test } from "./../BaseTestFile";

test("Customer login test scenario", async ({ ShopCustomer, Login }) => {
  await ShopCustomer.attemptsTo(Login());
});
```

To keep tests easily readable, use names for your tasks so that in the test itself, the code line resembles the `Actor.attemptsTo(doSomething)` pattern as closely as possible.

```typescript
// Bad example
await ShopCustomer.attemptsTo(ProductCart);

// Better example
await ShopCustomer.attemptsTo(PutProductIntoCart);
```

**Page Object Model Example**

```typescript
import type { Page, Locator } from "playwright-core";
import type { PageObject } from "../../types/PageObject";

export class CheckoutConfirm implements PageObject {
  public readonly paymentMethodRadioGroup: Locator;
  public readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.paymentMethodRadioGroup = page.locator(".checkout-card", {
      hasText: "Payment Method",
    });
  }

  url() {
    return "checkout/confirm";
  }
}
```

This page object defines the payment method radio group locator.

```typescript
import { test as base } from "@playwright/test";
import type { Task } from "../../../types/Task";
import type { FixtureTypes } from "../../../types/FixtureTypes";

export const SelectPaymentMethod = base.extend<
  { SelectPaymentMethod: Task },
  FixtureTypes
>({
  SelectPaymentMethod: async (
    { ShopCustomer, StorefrontCheckoutConfirm },
    use,
  ) => {
    const task = (paymentOptionName: string) => {
      return async function SelectPaymentMethod() {
        const paymentMethods =
          StorefrontCheckoutConfirm.paymentMethodRadioGroup;
        const paymentOptionRadioButton = paymentMethods.getByRole("radio", {
          name: paymentOptionName,
        });

        await ShopCustomer.selectsRadioButton(
          paymentMethods,
          paymentOptionName,
        );
        await ShopCustomer.expects(paymentOptionRadioButton).toBeChecked();
      };
    };

    await use(task);
  },
});
```

This fixture is the "SelectPaymentMethod" task, which selects the desired radio button in the `paymentMethodRadioGroup` defined in the page object using keyboard navigation (automatically includes `a11y_checks` assertions).

To use "SelectPaymentMethod" in a test, you simply pass the name of the desired payment option. Here is a sample scenario for a successful checkout that shows how you can combine multiple tasks to build your test scenarios.

```typescript
import { test } from "./../BaseTestFile";

test("Customer successfully orders product", async ({
  ShopCustomer,
  TestDataService,
  Login,
  StorefrontProductDetail,
  AddProductToCart,
  ProceedFromProductToCheckout,
  SelectPaymentMethod,
  ConfirmOrder,
}) => {
  const product = await TestDataService.createBasicProduct();
  await ShopCustomer.attemptsTo(Login());
  await ShopCustomer.goesTo(StorefrontProductDetail.url(product));
  await ShopCustomer.attemptsTo(AddProductToCart(product));
  await ShopCustomer.attemptsTo(ProceedFromProductToCheckout());
  await ShopCustomer.attemptsTo(SelectPaymentMethod("Invoice"));
  await ShopCustomer.attemptsTo(ConfirmOrder());
});
```

You can create your tasks in the same way to make them available for the actor pattern. Every task is just a simple Playwright fixture containing a function call with the corresponding test logic. Make sure to merge your task fixtures with other fixtures you created in your base test file. You can use the `mergeTests` method of Playwright to combine several fixtures into one test extension. Use `/src/tasks/shop-customer-tasks.ts` or `/src/tasks/shop-admin-tasks.ts` for that.
