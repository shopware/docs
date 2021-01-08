# Jest unit tests in Shopware's administration

You should write a unit test for every functional change. It should guarantee that 
your written code works and that a third developer can't break the functionality with their code.

With a good test coverage we can have the confidence to deploy a stable software without needing to manually 
test the software in its entirety.
This little guide will guide you how to write unit tests for the administration in Shopware 6.

We are using [Jest](https://jestjs.io/) as our testing framework. It's a solid foundation and widely
used by many developers. Before you are reading this guide you have to make sure you understand the
basics of unit tests and how Jest works.

You can find a good source for best practices in this Github Repo: 
[https://github.com/goldbergyoni/javascript-testing-best-practices](https://github.com/goldbergyoni/javascript-testing-best-practices) 

## Prerequisites

This tutorial will have a strong focus on how unit tests should be written when it comes to components in the 
administration. So please make sure you already know what a unit test is and why we are doing it. 
Furthermore, you should know what components tests are and what we want to achieve with them.

In addition, you need a running Shopware 6 installation. Your repository used for that should be based on 
development template, as we need to use some scripts provided by it.

## Folder structure

The test folder structure should match the source folder structure. You add a test for a file in the same
path as the source path.
You see: When creating the file, the name should also be the same as the component has with an additional .spec 
before the file extension `.js`. The `.spec` suffix is a well-known naming convention of frontend testing files.
```bash
Resources
  `-- app
    `-- <environment>
      `-- test
        `-- app
          `-- component
            `-- base
              `-- sw-alert.spec.js
```

## Setup for testing services and ES modules

Services and isolated EcmaScript modules are good testable because
you can import them directly without mocking or stubbing dependencies.

Let's have a look at an example:

```javascript
// sanitizer.helper.spec.js

import Sanitizer from 'src/core/helper/sanitizer.helper';

describe('core/helper/sanitizer.helper.js', () => {
    it('should sanitize the html', () => {
        expect(Sanitizer.sanitize('<A/hREf="j%0aavas%09cript%0a:%09con%0afirm%0d``">z'))
            .toBe('<a href="j%0aavas%09cript%0a:%09con%0afirm%0d``">z</a>');
    });
    
    it('should remove script functions from dom elements', () => {
        expect(Sanitizer.sanitize('<details open ontoggle=confirm()>'))
            .toBe('<details open=""></details>');
    });
    
    it('should remove script functions completely', () => {
        expect(Sanitizer.sanitize(`<script y="><">/*<script* */prompt()</script`))
            .toBe('');
    });

    it('should sanitize js in links', () => {
        expect(Sanitizer.sanitize('<a href=javas&#99;ript:alert(1)>click'))
            .toBe('<a>click</a>');
    });

    // ...more tests 
});
``` 

The service can be used isolated and therefore is easy to test.

## Setup for testing Vue components

We are using the [Vue Test Utils](https://vue-test-utils.vuejs.org/) for easier testing of Vue components. 
If you don't have experience with testing Vue components it is useful to read some basic guides on this topic. 
The main part of testing components is similar in Shopware 6.

However, there are some important differences. We can't test components that easily like in other Vue projects because we
are supporting template inheritance and extendability for third party developers. This causes overhead which we need
to bear in mind.

We are using a global object as an interface for the whole administration. Every component gets registered to this 
object, e.g. `Shopware.Component.register()`. Therefore, we have access to Component with the `Shopware.Component.build()`
method. This creates a native Vue component with a working template. Every override and extension from another
components are resolved in the built component.

### Practical example

Fot better understanding how to write component tests for Shopware 6 let's write a test. In our example
we are using the component `sw-multi-select`.

When you want to mount your component it needs to be imported first:
```javascript
// test/app/component/form/select/base/sw-multi-select.spec.js

import 'src/app/component/form/select/base/sw-multi-select';
```

You see that we import the `sw-multi-select` without saving the return value. This
blackbox import only executes code. However, this is important because this registers
the component to the Shopware object:
```javascript
// src/app/component/form/select/base/sw-multi-select.js

Shopware.Component.register('sw-multi-select', {
    // The vue component
});
```

In the next step we can mount our Vue component which we get from the global Shopware object:
```javascript
// test/app/component/form/select/base/sw-multi-select.spec.js

import 'src/app/component/form/select/base/sw-multi-select';

shallowMount(Shopware.Component.build('sw-multi-select'));
```

The `build` method resolves the twig template and returns a vue component. Now you can test the component like any other
Vue component. Let's try to write our first test: 
```javascript
// test/app/component/form/select/base/sw-multi-select.spec.js

import { shallowMount } from '@vue/test-utils';
import 'src/app/component/form/select/base/sw-multi-select';

describe('components/sw-multi-select', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(Shopware.Component.build('sw-multi-select'));
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it('should be a Vue.js component', () => {
        expect(wrapper.vm).toBeTruthy();
    });
});
```
We create a new `wrapper` before each test. This contains our component. In our first test we only
check if the wrapper is a Vue instance. 

Now lets start the watcher to see if the test works. You can do this with our PSH command `./psh.phar administration:unit-watch`.
You should see a result like this: `Test Suites: 1 passed, 1 total`. You
should also see several warnings like this:

- `[Vue warn]: Missing required prop: "options"`
- `[Vue warn]: Missing required prop: "value"`
- `[Vue warn]: Unknown custom element: <sw-select-base> - did you register the component correctly? ...`

The first two warnings are solved easily by providing the required props to our shallowMount:
```javascript
wrapper = shallowMount(Shopware.Component.build('sw-multi-select'), {
    props: {
        options: [],
        value: ''
    }
});
```

Now you should only see the last warning with an unknown custom element. The reason for this is that
most components contain other components. In our case the `sw-multi-select` needs the 
`sw-select-base` component. Now we have several solutions to solve this. The two most common ways
are stubbing or using the component.

```javascript
import 'src/app/component/form/select/base/sw-select-base'; // Option 2: You need to import the component first before using it

wrapper = shallowMount(Shopware.Component.build('sw-multi-select'), {
    props: {
        options: [],
        value: ''
    },
    stubs: {
        'sw-select-base': true,
        'sw-select-base': Shopware.Component.build('sw-select-base'),
    }
});
```

You need to choose which way is needed. Many tests do not need the real component, but in our case we
need the real implementation. You will see that if we import another component that they can create
also warnings. Let's look at the code that solve all warnings and then we should have a code like this:

```javascript
// test/app/component/form/select/base/sw-multi-select.spec.js

import { shallowMount } from '@vue/test-utils';
import 'src/app/component/form/select/base/sw-multi-select';
import 'src/app/component/form/select/base/sw-select-base';
import 'src/app/component/form/field-base/sw-block-field';
import 'src/app/component/form/field-base/sw-base-field';
import 'src/app/component/form/field-base/sw-field-error';
import 'src/app/component/form/select/base/sw-select-selection-list';
import 'src/app/component/form/select/base/sw-select-result-list';
import 'src/app/component/utils/sw-popover';
import 'src/app/component/form/select/base/sw-select-result';
import 'src/app/component/base/sw-highlight-text';
import 'src/app/component/base/sw-label';
import 'src/app/component/base/sw-button';

describe('components/sw-multi-select', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(Shopware.Component.build('sw-multi-select'), {
            props: {
                options: [],
                value: ''
            },
            stubs: {
                'sw-select-base': Shopware.Component.build('sw-select-base'),
                'sw-block-field': Shopware.Component.build('sw-block-field'),
                'sw-base-field': Shopware.Component.build('sw-base-field'),
                'sw-icon': '<div></div>',
                'sw-field-error': Shopware.Component.build('sw-field-error'),
                'sw-select-selection-list': Shopware.Component.build('sw-select-selection-list'),
                'sw-select-result-list': Shopware.Component.build('sw-select-result-list'),
                'sw-popover': Shopware.Component.build('sw-popover'),
                'sw-select-result': Shopware.Component.build('sw-select-result'),
                'sw-highlight-text': Shopware.Component.build('sw-highlight-text'),
                'sw-label': Shopware.Component.build('sw-label'),
                'sw-button': Shopware.Component.build('sw-button')
            }
        });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it('should be a Vue.js component', () => {
        expect(wrapper.vm).toBeTruthy();
    });
});
```

The more components you're depending on the more you have to create a complex setup for the test. Your 
component get also depends on other dependencies like `$tc`, directives or injections. When you are
using this you need to mock them as well. I show you some common warnings here:

#### Warning 
`[Vue warn]: Error in render: "TypeError: $tc is not a function"`

#### Solution:
```javascript
shallowMount(Shopware.Component.build('your-component'), {
    mocks: {
        $tc: key => key // your mock (here a simple function returning the translation path)
    }
});
```

#### Warning:
`[Vue warn]: Failed to resolve directive: popover`

#### Solution:
You need to use [localVue](https://vue-test-utils.vuejs.org/api/#createlocalvue) to provide the directive mock.

```javascript
import { shallowMount, createLocalVue } from '@vue/test-utils';

const localVue = createLocalVue();
localVue.directive('popover', {}); // add directive mock to localVue

shallowMount(Shopware.Component.build('your-component'), {
    localVue
});
```

#### Warning:
`[Vue warn]: Injection "repositoryFactory" not found`

#### Solution:
You need to provide the injected data, services...

```javascript
shallowMount(Shopware.Component.build('your-component'), {
    provide: {
        repositoryFactory: {
            create: () => 'fooBar', // you need to mock the return values for your test
            search: () => 'fooBar' // you need to mock the return values for your test
        }
    }
});
```

#### Warning:

`[Vue warn]: Error in foo: "TypeError: Cannot read property 'create' of undefined"`

#### Solution:

This could causes several reason. The best way to find out the solution is to look at the source of the
code and find out what is missing. In this example the service `repositoryFactory` is missing:

```javascript
Shopware.Service('repositoryFactory').create('product');
```

To fix this you need to add the mocked service before all tests. In our case we need to register the
service:

```javascript
beforeAll(() => {
  Shopware.Service.register('repositoryFactory', {
    // your service mock
  });
});
```

## Write tests for components

After setting up your component test you need to write your tests. A good way to write them is to test input
and output. The most common tests are:

- set Vue Props and check if component looks correctly
- interact with the DOM and check if the desired behaviour is happening

However, it depends on what you are trying to achieve with your component. Here is one little example concerning the 
component `sw-alert`. You can find an in-depth example of this and another test case in the 
[linked video](https://www.youtube.com/watch?v=nWUBK3fjwVg)

### Basic test: Rendering of component

Let's fill our test file with life. At first, we need to import the things we need. Typically, we need a wrapper to depict our alert:
```javascript
import { shallowMount } from '@vue/test-utils';
```

Remember, a Wrapper is an object that contains a mounted component or vnode and methods to test. Of course, we need to import our component itself as well. Our test file should look like this:
```javascript
import { shallowMount } from '@vue/test-utils';
import 'src/app/component/base/sw-alert';
```

Let's continue with the test structure itself. We'll use the Mocha syntax you might already know if you have written frontend tests before. First things first, we need to begin with the desribe function. It can be seen as a frame for structuring our tests and is important for the usage of lifecycle hooks. Afterwards, we will use the it function representing the test itself.
```javascript
import { shallowMount } from '@vue/test-utils';
import 'src/app/component/base/sw-alert';

describe('components/base/sw-alert', () => {
    it('should be a Vue.js component', () => {

    });
});
```

In our test, we can use the wrapper now to use our component to test. So let's mount our alert component in order to have a wrapper to work with.
```javascript
import { shallowMount } from '@vue/test-utils';
import 'src/app/component/base/sw-alert';

describe('components/base/sw-alert', () => {
    it('should be a Vue.js component', () => {
        
        // Here we use our wrapper to mount the component
        const wrapper = shallowMount(Shopware.Component.build('sw-alert'), {
            stubs: ['sw-icon']
        });
    });
});
```

Next we are ready to start writing assertions. A test assertion is a statement that describes the logic of the 
system under test. So we're checking our component with use of these assertion. In our test, it looks like this:
```javascript
import { shallowMount } from '@vue/test-utils';
import 'src/app/component/base/sw-alert';

describe('components/base/sw-alert', () => {
    it('should be a Vue.js component', () => {
        const wrapper = shallowMount(Shopware.Component.build('sw-alert'), {
            stubs: ['sw-icon']
        });
        
        // Assert if our component is a vue instance = mountes correctly
        expect(wrapper.vm).toBeTruthy();
    });
});
```

Ok, we completed our test now, at least in theory. Let's see how it turns out when running it.

## Executing tests

Before you are using the commands make sure that you installed all dependencies for your administration.
If you haven't done this already, then you can do it running the following PSH command:
`./psh.phar administration:install-dependencies`

In order to run jest unit tests of the administration, you can use the psh commands provided by our development template. 
Beware: This only applies to the Shopware provided Administration! If you use unit tests in your Plugin, you might need to write your own scripts 
for that.

This command executes all unit tests and shows you the complete code coverage.  
`./psh.phar administration:unit`

This command executes only unit tests of changed files. It automatically restarts if a file
gets saved. This should be used during the development of unit tests.  
`./psh.phar administration:unit-watch`
