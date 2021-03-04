# Jest unit tests in Shopware's storefront

## Overview

You should write a unit test for every functional change. Writing tests will ensure that your written code works and 
that another change can't break your code's functionality with their code.

With a good test coverage you gain confidence to deploy a stable software without the requirement to manually test 
every change. This little guide will guide you how to write unit tests for the administration in Shopware 6.

We are using [Jest](https://jestjs.io/) as our testing framework. It's a solid foundation and widely used by many 
developers.

## Prerequisites

Before you are reading this guide you have to make sure you understand the basics of unit tests and how Jest works.
You can find a good source for best practices in this Github Repo: [https://github.com/goldbergyoni/javascript-testing-best-practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Test structure

When it comes to the path to the test folder, you are quite free to use your own requirements. You could even build up
a separate test suite if you need. The following configuration matches our core configuration to give you a 
little starting point. In Shopware's platform repository, you will find the storefront unit tests in the following 
directory: `platform/src/Storefront/Resources/app/storefront/test`
It may be a good idea to resemble this directory structure, but it's no fixed requirement.

The exact test folder structure looks like seen below, starting in `Storefront` bundle:
```bash
Resources
  `-- app
    `-- <environment>
      `-- test
        `-- plugin
          `-- <plugin-name>
            `-- js-plugin-test.spec.js  
```

Please note that in this example, `<environment>` is a placeholder for the environment you are working in. 
In this context, that should be `storefront`.

## Writing a basic test

When writing jest unit tests in the storefront, you will soon realize that it's not that much different from 
writing jest unit tests in general. Unlike the [Jest unit tests in the Administration](./jest-admin.md), you
basically don't need to go an extra mile to write your unit tests. Services, helper and isolated ECMAScript modules 
are well testable because you can import them directly without mocking or stubbing dependencies. 
They can be used isolated and therefore are easy to test.

Let's start from scratch with a simple example: Imagine we want to write a test for a helper class, e.g. the 
`feature.helper` of our Storefront, handling the feature flag usage. We want to test, if our feature helper can
indeed handle active feature flags.

At first, you need to create your test file, e.g. `feature.helper.test.js`. With your new created test file, 
let's create the test structure for it:

{% code title="Resources/app/storefront/test/helper/feature.helper.test.js" %}
```javascript
// descrube is meant for grouping and structure
describe('feature.helper.js', () => {

    // This is your actual test
    test('checks the flags', () => {
        // Assertions come here
    });
});
```
{% endcode %}

Now, let's fill this empty test with life. Our first step is importing the helper under test - the `feature.helper` class.
However, there one more step to be done for preparation.

{% code title="Resources/app/storefront/test/helper/feature.helper.test.js" %}
```javascript
// Import for the helper to test
import Feature from 'src/helper/feature.helper';

describe('feature.helper.js', () => {
    test('checks the flags', () => {
        // Assertions come here
    });
});
```
{% endcode %}

In order to be able to test our feature flag integration, we of course need some fixtures to be present - some active and
inactive feature flags. So we need to ensure their presence before running the tests, ideally in a setup step. 
As you might know from other frameworks, it's convenient to use[lifecycle hooks](https://jestjs.io/docs/en/setup-teardown)
for that purpose. 

To sum it up, we need a feature flag fixture and the implementation of it in the `beforeEach` hook of our test.
In our example, that looks like below:

{% code title="Resources/app/storefront/test/helper/feature.helper.test.js" %}
```javascript
import Feature from 'src/helper/feature.helper';

// One flag should be active, the other shouldn't.
const default_flags = {
    test1: true,
    test2: false
};

describe('feature.helper.js', () => {
    
    // This hook is executed before every test
    beforeEach(() => {
        // Applying the flag fixture
        Feature.init(default_flags);
    });

    test('checks the flags', () => {
        // Assertions come here
    });
});
```
{% endcode %}

Alright, let's get to the point now, writing the actual test. Remember we want to make sure we have active and 
inactive feature flags. In addition, it may be useful to check the behavior if a third, non-existent feature flag is
introduced. Using [Jest's matchers](https://jestjs.io/docs/en/using-matchers) for these assertions, we get the 
following test:

{% code title="Resources/app/storefront/test/helper/feature.helper.test.js" %}
```javascript
import Feature from 'src/helper/feature.helper';

const default_flags = {
    test1: true,
    test2: false
};

describe('feature.helper.js', () => {
    beforeEach(() => {
        Feature.init(default_flags);
    });

    test('checks the flags', () => {
        expect(Feature.isActive('test1')).toBeTruthy();
        expect(Feature.isActive('test2')).toBeFalsy();
        expect(Feature.isActive('test3')).toBeFalsy();
    });
});
```
{% endcode %}

That's basically it! We wrote our first jest unit test in the Storefront.

## Next steps

You might to write more tests for your plugin, so we got you covered with even more guides on testing:
* [Unit testing with PHPUnit](./php-unit.md)
* [Jest unit tests in Shopware's administration](./jest-admin.md)
* [End-to-End testing in Shopware](./end-to-end-testing.md)