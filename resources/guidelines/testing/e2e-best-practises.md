# Best practices for writing end-to-end tests

## Overview

A typical E2E test can be complex, with many steps that take a lot of time to complete manually. Because of this complexity, E2E tests can be difficult to automate and slow to execute. The following tips can help reduce the cost and pain of E2E testing and still reap the benefits.

Cypress got you covered with their best practices as well: So please also look at their best practices to get to know their patterns:

<PageRef page="https://docs.cypress.io/guides/references/best-practices.html" title="Best Practices | Cypress Documentation" target="_blank" />

::: warning
We strongly recommend following Cypress own best practices as well.
:::

## Amount and prioritization of end-to-end tests

### Video

When it comes to dividing test types, selecting and prioritizing test cases, and thus designing tests, things get a bit more complicated. We have generally aligned our test strategy with the test pyramid, although not 100%. The pyramid states that end-to-end tests should be written in a few but well chosen test cases because end-to-end tests are slow and expensive.

At [Shopware Community Day](https://scd.shopware.com/en/) 2020, we gave a talk on how we approach automated testing in Shopware, how far we have come on this journey, and what we have gained so far:

<YoutubeRef video="sxvQoWF4KS0" title="A matter of trust – test - #SCD20 (ENG) - YouTube" target="_blank" />

To sum it up briefly, the end-to-end tests are slow and thus expensive to maintain. That is why we need a way to prioritize our test cases.

### When should I write an end-to-end test

::: danger
Cover every possible workflow with E2E tests.
:::

::: tip
Use proper prioritization to choose test cases covered by E2E tests.
:::

Due to running times, it is not advisable to cover every single workflow available. The following criteria may help you with that:

* **Cover the most general, most used workflows of a feature**, e.g., CRUD operations. The term "[happy path](https://en.wikipedia.org/wiki/Happy_path)" describes those workflows quite well.
* **Beware the critical path**: Cover those workflows with E2E tests, which are the most vulnerable and would cause the most damage if broken.
* **Avoid duplicate coverage**: E2E tests should only cover what they can, usually big-picture user stories \(workflows\) that contain many components and views.
  * Sometimes, unit tests are better suited. For example, use an E2E test to test your application's reaction to a failed validation, not the validation itself.

## Workflow-based end-to-end tests

::: danger
Write the E2E test as you would write unit tests.
:::

::: tip
Writing E2E tests in a "workflow-based" manner means writing the test describing a real user's workflow just like a real user would use your application.
:::

A test should be written "workflow-based" - We like to use this word very much because it is simply apt for this purpose. You should always keep your persona and goal of an E2E test in mind. The test is then written from the user's point of view, not from the developer's point of view.

## Structure and scope

### Test scope

::: danger
Write long E2E tests covering lots of workflows and use cases.
:::

::: tip
Keep tests as simple as possible. Only test the workflow you explicitly want to test. Ideally, use **one test for one workflow**.
:::

The second most important thing is to test the workflow you explicitly want to test. Any other steps or workflows to get your test running should be done using API operations in the `beforeEach` hook, as we don't want to test them more than once. For example, if you want to test the checkout process, you shouldn't do all the steps, like creating the sales channel, products, and categories, although you need them to process the checkout. Use the API to create these things and let the test just do the checkout.

You need to focus on the workflow to be tested to ensure minimum test runtimes and to get a valid result of your test case if it fails. For this workflow, you have to think like the end-user would do - Focus on the usage of your feature, not technical implementation.

Other examples of steps or workflow to cut off the actual tests are:

* The routines which should only provide the data we need: Just use test fixtures to create this data to have everything available before the test starts.
* Logging in to the Administration: You need it in almost every Administration test, but writing it in all tests is pure redundancy and way more error sensitive.

::: info
This [scope practice](https://docs.cypress.io/guides/references/best-practices.html#Organizing-Tests-Logging-In-Controlling-State) is also mentioned in Cypress best practices as well.
:::

### Focus on stability first

::: danger
Design your tests dependent on each other, doing lots of write operations without removing corresponding data.
:::

::: tip
Keep tests isolated, enable them to run independently, and restore a clean installation between tests
:::

It is important to focus on stability as the most important asset of a test suite. A flaky test like this can block the continuous deployment pipeline, making feature delivery slower than it needs to be. Moreover, imagine the following case: Tests that fail to deliver deterministic results: Those flaky test is problematic because they won't show valid results anymore, making them useless. After all, you wouldn't trust one any more than you would trust a liar. If you want to find out more on that topic, including solutions, please take a look at this article:

<PageRef page="https://www.smashingmagazine.com/2021/04/flaky-tests-living-nightmare/" title="Flaky tests" target="_blank" />

This was one of the reasons you need stable tests to create value. To achieve that, you have several possibilities. We will introduce you to some of them in the following paragraphs.

Let's start with some easy strategy. Keep tests as simple as possible, and avoid a lot of logic in each one. Think about it this way, the more you do in a test, the more you can go wrong. In addition, by avoiding big tests, you avoid causing load on your application and resource leaks in your environment.

When planning your test cases and structure, always keep your tests isolated from other tests so that they are able to be run in an independent or random order. Don't ever rely on previous tests. You need to test specs in isolation to take control of your application’s state. Every test is supposed to be able to run on its own and independent from any other tests. This is crucial to ensure valid test results. You can realize these using test fixtures to create all data you need beforehand and take care of the cleanup of your application using an appropriate reset method.

## Choosing selectors

::: danger
Choose fuzzy selectors which are prone to change, e.g. xpath.
:::

::: tip
Use selectors which won't change often.
:::

XPath selectors are quite fuzzy and rely a lot on the texts, which can change quickly. Please avoid using them as much as possible. If you work in Shopware platform and notice that one selector is missing or not unique enough, just add another one in the form of an additional class.

### Avoid framework specific selectors

::: danger
Choose framework specific syntax as a selector prone to change, e.g. `.btn-primary`.
:::

::: tip
Use individual selectors which won't often change, e.g., `.btn-buy`.
:::

Using selectors which rely on a framework specific syntax can be unstable because the framework selectors are prone to change. Instead, you should use individual selectors, which are less likely to change.

```html
<button class="btn btn-primary btn-buy">Add to cart</button>
```

```javascript
// ✗ Avoid using framework specific syntax from Bootstrap as a selector.
cy.get('.btn.btn-primary').click();

// ✓ Instead, you should use a shopware specific class like `.btn-buy`.
// (This also remains stable when the button variant is changed to, e.g., `.btn-secondary`.)
cy.get('.btn-buy').click();
```

```html
<button
    data-toggle="modal"
    data-target="#exampleModal"
    class="btn btn-primary btn-open-settings">
    Open settings modal
</button>
```

```javascript
// ✗ Avoid using framework specific syntax from Bootstrap as a selector.
cy.get('[data-toggle="modal"]').click();

// ✓ Instead, you should use a shopware specific class like `.btn-open-settings`.
cy.get('.btn-open-settings').click();
```

```html
<div class="custom-control custom-checkbox">
  <label 
      for="tos" 
      class="checkout-confirm-tos-label custom-control-label">
      I have read and accepted the general terms and conditions.
  </label>
</div>
```

```javascript
// ✗ Avoid using framework specific syntax from Bootstrap as a selector.
cy.get('.custom-checkbox label').click();

// ✓ Instead, you should use a shopware specific class like `.checkout-confirm-tos-label`.
cy.get('.checkout-confirm-tos-label').click();
```

If there are no suitable selectors available, please add descriptive classes or IDs for your desired elements.

## Waiting in E2E tests

::: danger
Waiting for arbitrary time periods, e.g., using `cy.wait(500)`
:::

::: tip
Use route aliases or assertions to guard Cypress from proceeding until an explicit condition is met.
:::

Never use fixed waiting times in the form of `.wait(500)` or similar. Using Cypress, you never need to do this. Cypress has a built-in retry-ability in almost every command, so you don't need to wait, e.g., if an element already exists. If you need more than that, we got you covered. Wait for changes in the UI instead, notifications, API requests, etc., via the appropriate assertions. For example, if you need to wait for an element to be visible:

```javascript
cy.get('.sw-category-tree').should('be.visible');
```

Another useful way for waiting in the Administration is using Cypress possibility to work with [network requests](https://docs.cypress.io/guides/guides/network-requests.html). Here you can let the test wait for a successful API response:

```javascript
cy.server();

// Route POST requests with matching URL and assign an alias to it
cy.route({
    url: '/api/search/category',
    method: 'post'
}).as('getData');

// Later, you can use the alias to wait for the API response
cy.wait('@getData').then((xhr) => {
    expect(xhr).to.have.property('status', 200);
});
```

::: info
This [best practice](https://docs.cypress.io/guides/references/best-practices#Unnecessary-Waiting) is also mentioned in Cypress best practices as well. Actually, it can be considered a general best practice to avoid flakiness.
:::

## Cypress commands and their queue

::: danger
Using vanilla JavaScript logic alongside cypress commands without further caution
:::

::: tip
If you need vanilla Javascript in your test, wrap it in a Cypress `then` or build a custom command to get it queued.
:::

Cypress commands are asynchronous and get queued for execution at a later time. During execution, subjects are yielded from one command to the next, and a lot of helpful Cypress code runs between each command to ensure everything is in order.

This won't happen with Vanilla JS, though. It will be executed immediately. In the worst case, this difference can cause timing issues. So always wrap your vanilla JavaScript code into Cypress commands or `then` in order to make use of Cypress command queue.

::: warning
Concerning Cypress `then`: Even though Cypress commands look like promises, they aren't completely the same. Head over to the [Cypress docs](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress#Commands-Are-Not-Promises) for more information.
:::
