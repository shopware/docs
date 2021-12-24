# Best practises on writing end-to-end tests

## Overview

A typical E2E test can be complex, with many steps that take a lot of time to complete manually. Because of this complexity, E2E tests can be difficult to automate and slow to execute. The following tips can help reduce the cost and pain of E2E testing and still reap the benefits.

Cypress got you covered with their best practices as well: So please also look at their best practices to get to know their patterns:
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://docs.cypress.io/guides/references/best-practices.html" caption="" %}

{% hint style="warning" %}
We strongly recommend following Cypress' own best practices as well.
{% endhint %}

## Amount and prioritisation of end-to-end tests

### Video

When it comes to dividing test types, selecting and prioritizing test cases, and thus designing tests, things get a bit more complicated. We have generally aligned our test strategy with the test pyramid, although not 100%. The pyramid states that end-to-end tests should be written in a few, but well-chosen test cases - because end-to-end tests are slow and therefore expensive.

At [Shopware Community Day](https://scd.shopware.com/en/) 2020, we gave a talk on how we approach automated testing in Shopware, how far we have come on this journey, and what we have gained so far:
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://www.youtube.com/watch?v=sxvQoWF4KS0" caption="" %}

To sum it up briefly for your End-to-End testing context, End-To-End tests are the one tests being slow and thus expensive to maintain. That's why we need a way to prioritize our test cases.

### When should I write an end-to-end test?

{% hint style="danger" %}
Cover every possible workflow with E2E tests.
{% endhint %}

{% hint style="success" %}
Use proper prioritisation to choose test cases covered by E2E tests.
{% endhint %}

You see, due to running times it is not advisable to cover every single workflow available. The following criteria may help you with that:

* **Cover the most general, most used workflows of a feature**, e.g. CRUD operations. The term "[happy path](https://en.wikipedia.org/wiki/Happy_path)" describes those workflows quite well.
* **Beware the critical path**: Cover those workflows with E2E tests, which are most vulnerable and would cause most damage if broken.
* **Avoid duplicate coverage**: E2E tests should only cover what they can cover, usually big-picture user stories \(workflows\) that contain many components and views.
  * Sometimes unit tests are suited better: For example, use an E2E test to test your application's reaction on a failed validation, not the validation itself.

## Workflow-based end-to-end tests

{% hint style="danger" %}
Write E2E test as you would write unit tests.
{% endhint %}

{% hint style="success" %}
Write E2E tests in a "workflow-based" manner, that means writing the test describing a real user's workflow - just like a real user would use your application.
{% endhint %}

A test should be written "workflow-based" - We like to use this word very much, because it is simply apt for this purpose. You should always keep your persona and goal of an E2E test in mind: The test is then written from the user's point of view, not from the developer's point of view.

## Structure and scope

### Test scope

{% hint style="danger" %}
Write long E2E tests, covering lots of workflows and use cases.
{% endhint %}

{% hint style="success" %}
Keep tests as simple as possible! Only test the workflow you explicitly want to test - ideally use **one test for one workflow**.
{% endhint %}

The second most important thing is to just test the workflow you explicitly want to test: Any other steps or workflows to get your test running should be done using API operations in the `beforeEach` hook, as we don't want to test them more than once. For example: if you want to test the checkout process you shouldn't do all the steps like create the sales channel, products and categories although you need them in order to process the checkout. Use the API to create these things and let the test just do the checkout.

You need to focus on the workflow to be tested to ensure minimum test runtimes and to get a valid result of your test case if it fails. Fot this workflow, you have to think like the end-user would do: Focus on usage of your feature, not technical implementation.

Other examples of steps or workflow to cut off the actual tests are:

* The routines which should only provide the data we need: Just use test fixtures to create this data to have everything available before the test starts.
* Logging in to the Administration: You need it in almost every Administration test, but writing it in all tests is pure redundancy and way more error sensitive.

{% hint style="info" %}
This [scope practice](https://docs.cypress.io/guides/references/best-practices.html#Organizing-Tests-Logging-In-Controlling-State) is also mentioned in Cypress' best practices as well.
{% endhint %}

### Focus on stability first!

{% hint style="danger" %}
Design your tests dependent on each other, doing lots of write operations without removing corresponding data.
{% endhint %}

{% hint style="success" %}
Keep tests isolated, enable them to run independently and restore a clean installation between tests
{% endhint %}

It's important to focus stability as most important asset of a test suite. A flaky test like this can block the continuous deployment pipeline, making feature delivery slower than it needs to be. Moreover, imagine the following case: Tests that fail to deliver deterministic results: Those flaky test is problematic because their won't show valid results anymore — making it useless. After all, you wouldn't trust one any more than you would trust a liar. If you want to find out more on that topic, including solutions, please take a look at this article:
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://www.smashingmagazine.com/2021/04/flaky-tests-living-nightmare/" caption="Flaky tests" %}

This was one of the reasons you absolutely need stable tests to create value. To achieve that, you have several possibilities. We will introduce you some of them in the following paragraphs.

Let's start with a sometimes easy strategy: Keep tests as simple as possible, and avoid a lot of logic in each one. Think about it this way: The more you do in a test, the more can go wrong. In addition, with avoiding big tests you avoid causing load on your application and resource leaks in your environment.

When planning your test cases and structure, always keep your tests isolated from other tests, so that they’re able to be run in an independent or random order. Don't ever rely on previous tests! You need to test specs in isolation in order to take control of your application’s state. Every test is supposed to be able to run on its own and independent from any other tests. This is crucial to ensure valid test results. You can realize this using test fixtures to create all data you need beforehand and taking care of the cleanup of your application using an appropriate reset method.

## Choosing selectors

{% hint style="danger" %}
Choose fuzzy selectors which are prone to change, e.g. xpath.
{% endhint %}

{% hint style="success" %}
Use selectors which won't change often.
{% endhint %}

XPath selectors are quite fuzzy and rely a lot on the texts, which can change quickly. Please avoid using them as much as possible. If you work in Shopware platform and notice that one selector is missing or not unique enough, just add another one in the form of an additional class.

### Avoid framework specific selectors

{% hint style="danger" %}
Choose framework specific syntax as a selector which is prone to change, e.g. `.btn-primary`.
{% endhint %}

{% hint style="success" %}
Use individual selectors which won't change often, e.g. `.btn-buy`.
{% endhint %}

Using selectors which rely on a framework specific syntax can be unstable because the framework selectors are prone to change. Instead, you should use individual selectors which are less likely to change.

```html
<button class="btn btn-primary btn-buy">Add to cart</button>
```

```javascript
// ✗ Avoid using framework specific syntax from Bootstrap as a selector.
cy.get('.btn.btn-primary').click();

// ✓ Instead, you should use a shopware specific class like `.btn-buy`.
// (This also remains stable when the button variant is changed to e.g. `.btn-secondary`.)
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

{% hint style="danger" %}
Waiting for arbitrary time periods, e.g. using `cy.wait(500)`
{% endhint %}

{% hint style="success" %}
Use route aliases or assertions to guard Cypress from proceeding until an explicit condition is met.
{% endhint %}

Never use fixed waiting times in the form of `.wait(500)` or similar. Using Cypress, you never need to do this. Cypress has a built-in retry-ability in almost every command, so you don't need to wait e.g. if an element already exists. If you need more than that, we got you covered: Wait for changes in the UI instead, notification, API requests, etc. via the appropriate assertions. For example, if you need to wait for an element to be visible:

```javascript
cy.get('.sw-category-tree').should('be.visible');
```

Another useful way for waiting in the Administration is using Cypress' possibility to work with [network requests](https://docs.cypress.io/guides/guides/network-requests.html). Here you can let the test wait for a successful API response:

```javascript
cy.server();

// Route POST requests with matching url and assign an alias to it
cy.route({
    url: '/api/search/category',
    method: 'post'
}).as('getData');

// Later, you can use the alias to wait for the API response
cy.wait('@getData').then((xhr) => {
    expect(xhr).to.have.property('status', 200);
});
```

{% hint style="info" %}
This [best practice](https://docs.cypress.io/guides/references/best-practices#Unnecessary-Waiting) is also mentioned in Cypress' best practices as well. Actually, it can be considered as general best practice to avoid flakiness.
{% endhint %}

## Cypress' commands and their queue

{% hint style="danger" %}
Using vanilla JavaScript logic alongside cypress commands without further caution
{% endhint %}

{% hint style="success" %}
If you need vanilla Javascript in your test, wrap it in a Cypress' `then` or build a custom command in order to get it queued.
{% endhint %}

Cypress commands are asynchronous and get queued for execution at a later time. During execution, subjects are yielded from one command to the next, and a lot of helpful Cypress code runs between each command to ensure everything is in order.

This won't happen with Vanilla JS though, it will be executed immediately. In the worst case, this difference can cause timing issues. So always wrap your vanilla JavaScript code into Cypress commands or `then` in order to make use of Cypress' command queue.

{% hint style="warning" %}
Concerning Cypress' `then`: Even though Cypress' commands look like promises, they aren't completely the same! Head over to the [Cypress docs](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress#Commands-Are-Not-Promises) for more information.
{% endhint %}

