# Jest unit tests in Shopware's storefront

## Overview

You should write a unit test for every functional change. Writing tests will ensure that your written code works and that another change can't break your code's functionality with their code.

With a good test coverage you gain confidence to deploy a stable software without the requirement to manually test every change. This little guide will guide you how to write unit tests for the administration in Shopware 6.

We are using JestJS as our testing framework as it's a solid foundation and widely used by many developers.
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://jestjs.io" caption="" %}

## Prerequisites

Before you are reading this guide you have to make sure you understand the basics of unit tests and how Jest works. You can find a good source for best practices in this Github Repo:
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://github.com/goldbergyoni/javascript-testing-best-practices" caption="" %}

In addition, you need a running Shopware 6 installation. Your repository used for that should be based on development template, as we will to use some scripts provided by it.

For one example, we use a Javascript plugin. In oder to follow this example, you need to know how to build a Javascript plugin in the first place. You can learn about it in the corresponding [guide](../storefront/add-custom-javascript.md).

## Test structure

{% hint style="warning" %}
When it comes to the path to the test folder, you are quite free to use your own requirements. You could even build up a separate test suite if you need. There's one limitation though: Please take care you place your tests according your `package.json` file!
{% endhint %}

The following configuration matches our core configuration in order to give you a starting point. In Shopware's platform repository, you will find the storefront unit tests in the following directory: `platform/src/Storefront/Resources/app/storefront/test` It may be a good convention to resemble this directory structure, but it's no fixed requirement.

Inside the test directory, you add a test for a file in the same path as the source path. You see: When creating the file, the name should also be the same as the component has with an additional `test`.

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

Please note that in this example, `<environment>` is a placeholder for the environment you are working in. In this context, that should be `storefront`.

## Writing a basic test

When writing jest unit tests in the storefront, you will soon realize that it's not that much different from writing jest unit tests in general. Unlike the [Jest unit tests in the Administration](jest-admin.md), you basically don't need to go an extra mile to write your unit tests. Services, helper and isolated ECMAScript modules are well testable because you can import them directly without mocking or stubbing dependencies. They can be used isolated and therefore are easy to test.

Let's start from scratch with a simple example: Imagine we want to write a test for a helper class, e.g. the `feature.helper` of our Storefront, handling the feature flag usage. We want to test, if our feature helper can indeed handle active feature flags.

At first, you need to create your test file, e.g. `feature.helper.test.js`. With your new created test file, let's create the test structure for it:

{% code title="<plugin root>/src/Resources/app/storefront/test/helper/feature.helper.test.js" %}
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

Now, let's fill this empty test with life. Our first step is importing the helper under test - the `feature.helper` class. However, there one more step to be done for preparation.

{% code title="<plugin root>/src/Resources/app/storefront/test/helper/feature.helper.test.js" %}
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

In order to be able to test our feature flag integration, we of course need some fixtures to be present - some active and inactive feature flags. So we need to ensure their presence before running the tests, ideally in a setup step. As you might know from other frameworks, it's convenient to use [lifecycle hooks](https://jestjs.io/docs/en/setup-teardown) for that purpose.

To sum it up, we need a feature flag fixture and the implementation of it in the `beforeEach` hook of our test. In our example, that looks like below:

{% code title="<plugin root>/src/Resources/app/storefront/test/helper/feature.helper.test.js" %}
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

Alright, let's get to the point now, writing the actual test. Remember we want to make sure we have active and inactive feature flags. In addition, it may be useful to check the behavior if a third, non-existent feature flag is introduced. Using [Jest's matchers](https://jestjs.io/docs/en/using-matchers) for these assertions, we get the following test:

{% code title="<plugin root>/src/Resources/app/storefront/test/helper/feature.helper.test.js" %}
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

## Executing the tests

Before you are using the commands make sure that you installed all dependencies for your storefront. If you haven't done this already, then you can do it running the following PSH command:

```bash
> ./psh.phar storefront:install-dependencies
```

In order to run jest unit tests of the storefront, you can use the psh commands provided by our development template. This command executes all unit tests and shows you the complete code coverage.

```bash
> ./psh.phar storefront:unit
```

{% hint style="info" %}
This only applies to the Shopware provided Storefront! If you use unit tests in your Plugin, you might need to write your own scripts for that.
{% endhint %}

## Mocking JavaScript plugins

Now, let's have a look at a intermediate example: As you're writing JavaScript plugins, you may want to test those. As you need to mock some things in this case, this kind of test might be a bit more complex.

{% hint style="info" %}
The folder structure, and the corresponding file locations of the following example will resemble the one used in `platform` repository.
{% endhint %}

Let's start with the plugin we want to test later. For the sake of simplicity, we will use a plugin which returns "Hello world":

{% code title="<plugin root>/src/Resources/app/storefront/src/plugin/hello-world/hello-world.plugin.js" %}
```javascript
import Plugin from 'src/plugin-system/plugin.class'

export default class HelloWorldPlugin extends Plugin {
    static options = {};

    init() {
        console.log('Hello World!', this.el);
    }

    sayHello() {
        return "Hello World!"
    }
}
```
{% endcode %}

Of course, you need to make sure that your plugin is registered, more details in the guide on [Javascript plugins](../storefront/add-custom-javascript.md).

In the beginning, writing plugin tests is still similar to other jest unit tests: You import your plugin's class and use the familiar test structure:

{% code title="<plugin root>/src/Resources/app/storefront/test/plugin/hello-world/hello-world.plugin.test.js" %}
```javascript
/**
 * @jest-environment jsdom
 */

// import your plugin here
import HelloWorldPlugin from 'src/plugin/hello-world/hello-world.plugin';

describe('HelloWorldPlugin tests', () => {

    beforeEach(() => {
        // Here we need to do all the mocking
    });

    afterEach(() => {
        // Teardown
    });

    test('custom plugin exists', () => {
        // your actual test
    });
});
```
{% endcode %}

You might notice the lifecycle hook we use in this test. These will be important in the next steps where we begin to mock our plugin and clean it up after our tests.

The `beforeEach` hook will be executed before each test. Thus, it's the perfect location for creating our plugin under test. Therefore, we need to get an element first. We'll use it to create our plugin - resembling the usage of a plugin on an element.

{% code title="<plugin root>/src/Resources/app/storefront/test/plugin/hello-world/hello-world.plugin.test.js" %}
```javascript
/**
 * @jest-environment jsdom
 */

import HelloWorldPlugin from 'src/plugin/hello-world/hello-world.plugin';

describe('HelloWorldPlugin tests', () => {

    // Definition of plugin
    let plugin;

    beforeEach(() => {
        // you need to get an element for the plugin
        const mockedElement = document.createElement('div');
        plugin = new HelloWorldPlugin(mockedElement);

    });

    afterEach(() => {
        // Teardown
    });

    test('custom plugin exists', () => {
        // your actual test, temporary filled with a placeholder
        console.log(plugin);
    });
});
```
{% endcode %}

If you execute your test now, you'll run into an error:

```bash
      HelloWorldPlugin tests
        ✕ custom plugin exists (32ms)

      ● HelloWorldPlugin tests › custom plugin exists

        TypeError: Cannot read property 'getPluginInstancesFromElement' of undefined

          119 |      */
          120 |     _registerInstance() {
        > 121 |         const elementPluginInstances = window.PluginManager.getPluginInstancesFromElement(this.el);
              |                                                             ^
          122 |         elementPluginInstances.set(this._pluginName, this);
          123 |
          124 |         const plugin = window.PluginManager.getPlugin(this._pluginName, false);
```

This was to be expected because you need to mock some more things required for the plugin to run. To solve this issue, you need to mock the `PluginManager` which holds all plugin instances globally in the Storefront. Because our test is just testing the single plugin class, the actual implementation on the real DOM element in the storefront isn't too important at this moment.

{% code title="<plugin root>/src/Resources/app/storefront/test/plugin/hello-world/hello-world.plugin.test.js" %}
```javascript
/**
 * @jest-environment jsdom
 */

import HelloWorldPlugin from 'src/plugin/hello-world/hello-world.plugin';

describe('HelloWorldPlugin tests', () => {
    let plugin;

    beforeEach(() => {

        // Mocking PluginManager to get the plugin working
        window.PluginManager = {
            getPluginInstancesFromElement: () => {
                return new Map();
            },
            getPlugin: () => {
                return {
                    get: () => []
                };
            }
        };

        const mockedElement = document.createElement('div');
        plugin = new HelloWorldPlugin(mockedElement);
    });

    afterEach(() => {
        // Set your plugin to null to clean up afterwards
        plugin = null;
    });

    test('custom plugin exists', () => {
        // your actual test, temporary filled with a placeholder
        console.log(plugin);
    });
});
```
{% endcode %}

{% hint style="warning" %}
Don't forget the cleanup after each test! You need to set your plugin to `null` in your `afterEach` hook to ensure an isolated test.
{% endhint %}

Finally, we're ready to write our actual test. Write your assertions as you're used to. In this example, we first want to test if our plugin can be instantiated:

{% code title="<plugin root>/src/Resources/app/storefront/test/plugin/hello-world/hello-world.plugin.test.js" %}
```javascript
/**
 * @jest-environment jsdom
 */

import HelloWorldPlugin from 'src/plugin/hello-world/hello-world.plugin';

describe('HelloWorldPlugin tests', () => {
    let plugin;

    beforeEach(() => {
        window.PluginManager = {
            getPluginInstancesFromElement: () => {
                return new Map();
            },
            getPlugin: () => {
                return {
                    get: () => []
                };
            }
        };

        const mockedElement = document.createElement('div');
        plugin = new HelloWorldPlugin(mockedElement);
    });

    afterEach(() => {
        plugin = null;
    });

    test('The HelloWorld plugin can be instantiated', () => {

        // Our assertions will be done here
        expect(plugin).toBeInstanceOf(HelloWorldPlugin);
    });
});
```
{% endcode %}

Afterwards, we can add more tests as we want to. To give an example, it's useful to rest if our plugin returns the "Hello World" test as expected:

{% code title="<plugin root>/src/Resources/app/storefront/test/plugin/hello-world/hello-world.plugin.test.js" %}
```javascript
    test('Shows text', () => {
        expect(plugin.sayHello()).toBe('Hello World!')
    });
```
{% endcode %}

Now you're ready to go! Below the full example of our test, for reference:

{% code title="<plugin root>/src/Resources/app/storefront/test/plugin/hello-world/hello-world.plugin.test.js" %}
```javascript
/**
 * @jest-environment jsdom
 */

import HelloWorldPlugin from 'src/plugin/hello-world/hello-world.plugin';

describe('HelloWorldPlugin tests', () => {

    let plugin;

    beforeEach(() => {
        window.PluginManager = {
            getPluginInstancesFromElement: () => {
                return new Map();
            },
            getPlugin: () => {
                return {
                    get: () => []
                };
            }
        };

        const mockedElement = document.createElement('div');
        plugin = new HelloWorldPlugin(mockedElement);
    });

    afterEach(() => {
        // Teardown
        plugin = null;
    });

    test('The cookie configuration plugin can be instantiated', () => {
        // your actual test
        expect(plugin).toBeInstanceOf(HelloWorldPlugin);
    });

    test('Shows text', () => {
        expect(plugin.sayHello()).toBe('Hello World!')
    });
});
```
{% endcode %}

## More interesting topics

* [Jest tests for the storefront](jest-storefront.md)
* [PHPUnit tests](php-unit.md)
* [End-to-end tests](end-to-end-testing.md)

