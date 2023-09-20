---
nav:
  title: Backward Compatibility
  position: 20

---

# Backward Compatibility

## Introduction

Shopware is a standard ecommerce solution used by many customers worldwide and is the technical foundation of their online business. As developers of Shopware, it is our highest goal to guarantee the reliability of the software for our customers. Always remember that every change you make can have a big impact on the life of our customers, either in a good way or in a bad way.

For the release strategy, Shopware uses a semantic [versioning](https://www.shopware.com/en/news/shopware-6-versioning-strategy/) and therefore has to be always backward compatible for minor and patch updates. This brings additional challenges when changing the code of Shopware. The following guide aims to provide you with the necessary workflows and techniques to do your changes in a backward compatible way and what to do if it is not possible.

## Annotations

During the development, different cases occur where you want to replace old code with new ones or even remove some obsolete code. As Shopware must always be backward compatible on minor and patch updates, old code should only be removed with a major release. Until the next major release, you want to mark the code with a corresponding annotation to inform other developers of the planned change. This overview shows the most important annotations and in which situation they must be used.

### @deprecated

```php
/**
 * @deprecated tag:v6.5.0 - Use NewFunction() instead
 */
```

The `@deprecated` annotation is used for obsolete public code, which will be removed with the next major release. The annotation always needs the specific major version tag, in which the code should be removed. Always add a meaningful comment with information about the corresponding replacement and how the deprecated code can be removed.

### @feature-deprecated

```php
/**
 * @feature-deprecated (flag:FEATURE_NEXT_11111)
 */
```

The `@feature-deprecated` annotation is used for obsolete code during the development of a feature when the code is still hidden behind a feature flag. This is important so that code that is not public will not trigger deprecation warnings. This annotation has to be changed to the correct `@deprecated` annotation when the feature is released, and the corresponding feature flag is removed. Always add the name of the corresponding feature flag to the annotation so that it will not be forgotten when the flag is removed.

### @major-deprecated

```php
/**
 * @major-deprecated (flag:FEATURE_NEXT_22222)
 */
```

The `@major-deprecated` annotation is used for breaking code which has to stay behind a specific major feature flag until the next major release. Always add the name of the corresponding feature flag to the annotation so that it will not be forgotten when the flag is removed.

### @internal

```php
/**
 * @internal (flag:FEATURE_NEXT_11111)
 */
```

In combination with a feature flag, like shown above, the `@internal` annotation is used for newly introduced code, which is not yet released. This ensures that it will not be treated as a public API until the corresponding feature is released and makes it possible to change the code in any way until the final release. Always add the name of the corresponding feature flag to the annotation so that it will not be forgotten when the corresponding feature is released.

## Workflows

### Backward compatible features

When developing new features, the goal should always be to do this in a backward compatible way. This ensures that the feature can be shipped with a minor release to provide value for customers as soon as possible. The following table should help you to use the correct approach for each type of change.

| Case                    | During development                                                                                                                                                                                                                                                                                                                                       | On feature release                                                                                                                                       | Next major release                          |
| ---                     | ---                                                                                                                                                                                                                                                                                                                                                      | ---                                                                                                                                                      | ---                                         |
| 🚩 **Feature Flag**     | Hide code behind normal [feature flag](../../references/adr/workflow/2020-08-10-feature-flag-system).                                                                                                                                                                                                                                                                                            | Remove the feature flag.                                                                                                                                     |                                             |
| ➕ **New code**         | Add `@internal annotation` for new public API.                                                                                                                                                                                                                                                                                                           | Remove `@internal` annotation.                                                                                                                           |                                             |
| ⚪ **Obsolete code**    | Add `@feature-deprecated` annotation.                                                                                                                                                                                                                                                                                                                    | Replace @feature-deprecated with normal `@deprecated` annotation.                                                                                        | Remove old code.                            |
| 🔴 **Breaking change**  | Add `@major-deprecated` annotation. Hide breaking code behind additional major [feature flag](../../references/adr/workflow/2020-08-10-feature-flag-system). Also, create a separate [changelog](../../references/adr/workflow/2020-08-03-implement-New-Changelog) for the change with the major flag. |                                                                                                                                                          | Remove old code. Remove the major feature flag. |
| 🔍 **Tests**            | Add new tests behind a feature flag.                                                                                                                                                                                                                                                                                                                       | Remove feature flags from new tests. Declare old tests as [legacy](https://symfony.com/doc/current/components/phpunit_bridge.html#mark-tests-as-legacy). | Remove legacy tests.                        |

You can also find more detailed information and code examples in the corresponding **[ADR](https://github.com/shopware/platform/blob/trunk/adr/)** for the deprecation strategy.

### Breaking Changes / Features

The first goal should always be to make your changes backward compatible. But there might be some special cases where it isn't possible in any way. In this case, the change can only be released with a major version. As we develop all changes in the same code base, the `trunk` branch, the changes have to stay behind a special feature flag, which is especially marked as a major feature flag.

| Case                    | During development                                                                                                                                           | Next major release (feature release) |
| ---                     | ---                                                                                                                                                          | ---                                  |
| 🚩 **Feature Flag**     | Hide code behind a major feature flag.                                                                                                                         | Remove major feature flag.           |
| ➕ **New code**         | Add `@internal` annotation for new public API.                                                                                                               | Remove `@internal` annotation.       |
| ⚪ **Obsolete code**    | Add `@major-deprecated` annotation.                                                                                                                          | Remove old code.                     |
| 🔴 **Breaking change**  | Add `@major-deprecated` annotation.                                                                                                                          | Remove old code.                     |
| 🔍 **Tests**            | Add new tests behind a major feature flag. Declare old tests as [legacy](https://symfony.com/doc/current/components/phpunit_bridge.html#mark-tests-as-legacy). | Remove legacy tests.                 |

## Compatibility sheet

To ensure backward compatibility, it is important to know what you are allowed to do and what not. The following sheet should give you an orientation on common changes and how they could affect the backward compatibility. Although a lot of effort went into this list, it is not guaranteed to be 100% complete. Always keep the persona of third-party developers in mind and challenge your changes against external needs.

### PHP

As Shopware is based on the PHP framework Symfony, we also have to make sure to use the rules which the framework follows. Besides the list below, always keep in mind the backward compatibility promise and implement your changes in a way the promise is kept.

**[Symfony Backward Compatibility Promise](https://symfony.com/doc/current/contributing/code/bc.html)**

| Use Case                                                                                                      | Allowed?   | Notes / Alternatives                                                                                                                                                                                                           |
| ---                                                                                                           | ---        | ---                                                                                                                                                                                                                            |
| Change the typehint of a class, interface or trait.                                                           | 🔴 NO      | Add the new typehint as an abstract class. <br>Code Example: [Extend class with abstract class](#extend-class-with-abstract-class)                                                                                             |
| Change the constructor of a service.                                                                          | ✅ YES     | Services have to be instantiated over the container, so the changes should not break anything.                                                                                                                                 |
| Change the constructor of a class, that is not a service. (Instantiated with new Class())                     | ⚪ PARTIAL | Only optional arguments are allowed to be added and this should be made via `func_get_args()`. <br> Code Example: [Add an argument](#add-an-argument)                                                                            |
| Change the arguments of a public method.                                                                      | ⚪ PARTIAL | Only optional arguments are allowed to be added and this should be made via `func_get_args()`. <br>Code Example: [Add an argument](#add-an-argument)                                                                             |
| Change the arguments of a protected method.                                                                   | ⚪ PARTIAL | Only optional arguments are allowed to be added and this should be made via `func_get_args()`. <br>Code Example: [Add an argument](#add-an-argument)                                                                             |
| Change the arguments of a private method.                                                                     | ✅ YES     |                                                                                                                                                                                                                                |
| Change the return the type of a method.                                                                       | 🔴 NO      | Create a new method and deprecate the old one.                                                                                                                                                                                 |
| Change the value of a public constant.                                                                        | 🔴 NO      | You should add a new constant. Annotate the old constant as deprecated and remove it in the next major version.                                                                                                                |
| Change the value of a private constant.                                                                       | ✅ YES     | Check all potential usages of the constant. Maybe it is used somewhere to be stored in the database. In that case, you must write a migration for it which ensures every use of the constant in a db-value is updated as well. |
| Change a class or method to final.                                                                            | 🔴 NO      | You will have to deprecate the class or method and add an annotation that it will be final in the next major version.                                                                                                          |
| Change the visibility of a class, method or property from public to private/protected or protected to private | 🔴 NO      | Annotate it as deprecated and change the visibility in the next major version.                                                                                                                                                 |
| Change the namespace of a class.                                                                              | 🔴 NO      | Duplicate the class and mark the old one as deprecated.                                                                                                                                                                        |
| Change static state (remove static or delete static keyword).                                                 | 🔴 NO      | Annotate it as deprecated and add or remove the static keyword in the next major version.                                                                                                                                      |
| Add parameter to interface or abstract class function.                                                        | ⚪ PARTIAL | Only optional arguments are allowed to be added and this should be made via `func_get_args()`. <br> Code Example: [Add an argument](#add-an-argument)                                                                            |
| Add new public function to interface.                                                                         | 🔴 NO      |                                                                                                                                                                                                                                |
| Add new public function to abstract class.                                                                    | ⚪ PARTIAL | Only possible if the abstract class already contains the `getDecorated` call. <br> Code Example: [Add a public function](#add-a-public-function)                                                                                 |
| Add an event or event dispatch.                                                                               | ✅ YES     |                                                                                                                                                                                                                                |
| Add a constant.                                                                                               | ✅ YES     |                                                                                                                                                                                                                                |
| Remove an event or event dispatch.                                                                            | 🔴 NO      |                                                                                                                                                                                                                                |
| Remove a public property, constant or method.                                                                 | 🔴 NO      | Annotate it as deprecated and remove it in the next major release.                                                                                                                                                             |
| Remove a protected property, constant or method.                                                              | 🔴 NO      | Annotate it as deprecated and remove it in the next major release.                                                                                                                                                             |
| Remove a private property, constant, or method.                                                               | ✅ YES     |                                                                                                                                                                                                                                |

### Storefront

#### TWIG templates

| Use Case                                                           | Allowed?     | Notes / Alternatives                                                                                                                                                                                                                                                                |
| ---                                                                | ---          | ---                                                                                                                                                                                                                                                                                 |
| Removing TWIG blocks.                                              | 🔴 NO        | Use the deprecation workflow.<br>Code Example: [Deprecate TWIG block](#deprecate-twig-block)                                                                                                                                                                                            |
| Renaming TWIG blocks.                                              | 🔴 NO        | Use the deprecation workflow. Create a new surrounding block with the new name and deprecate the old one. All variables which are defined in the scope of the old block must be moved to the new surrounding block scope.<br>Code Example: [Rename TWIG block](#rename-twig-block) |
| Moving TWIG blocks within the same file.                           | ⚪ PARTIAL   | Only within the same scope/parent block.                                                                                                                                                                                                                                          |
| Removing TWIG variables.                                           | 🔴 NO        |                                                                                                                                                                                                                                                                                     |
| Renaming TWIG variables.                                           | 🔴 NO        | Create a new variable within the same scope and deprecate the old one.                                                                                                                                                                                                              |
| Changing the value of TWIG variables                               | ⚪ PARTIAL   | The data type has to stay the same. Otherwise, use the deprecation workflow.                                                                                                                                                                                                         |
| Moving TWIG variable definitions to other TWIG blocks.             | ⚪ PARTIAL   | Only when they are being moved higher up in the block scope.                                                                                                                                                                                                                        |
| Adding TWIG blocks that affect the scope of variable definitions. | 🔴 NO        |                                                                                                                                                                                                                                                                                     |
| Moving template files to other directories.                        | 🔴 NO        |                                                                                                                                                                                                                                                                                     |

#### HTML

| Use Case                                   | Allowed?   | Notes / Alternatives                                                                              |
| ---                                        | ---        | ---                                                                                               |
| Removing HTML sections.                    | 🔴 NO      |                                                                                                   |
| Moving HTML sections within the same file. | ⚪ PARTIAL | Only within the same TWIG Block.                                                                  |
| Renaming of removing CSS selectors.        | 🔴 NO      | Use the deprecation workflow.<br>Code Example: [Deprecate CSS selectors](#deprecate-css-selectors) |

#### JavaScript

| Use Case                                           | Allowed? | Notes / Alternatives                                                                                                  |
| ---                                                | ---      | ---                                                                                                                   |
| Renaming or removing JS services.                  | 🔴 NO    | Use the deprecation workflow.<br>Code Example: [Renaming or removing JS services](#renaming-or-removing-js-services)  |
| Renaming or removing JS plugins.                | 🔴 NO    | Use the deprecation workflow.<br>Code Example: [Renaming or removing JS plugins](#renaming-or-removing-js-plugins) |
| Changing the public API of a JS plugin or service. | 🔴 NO    | Use the deprecation workflow.<br>Code Example: [Add new public function](#add-new-public-function)                    |
| Renaming methods of JS plugins or services.        | 🔴 NO    | Use the deprecation workflow.<br>Code Example: [Rename a method](#rename-a-method)                                    |
| Renaming or removing of JS events.                 | 🔴 NO    |                                                                                                                       |
| Changing the parameters of JS events.              | 🔴 NO    |                                                                                                                       |

#### Styling / CSS

| Use Case                                                  | Allowed?   | Notes / Alternatives                                                                                                                                                                                                                       |
| ---                                                       | ---        | ---                                                                                                                                                                                                                                        |
| Renaming or removing CSS definitions.                     | ⚪ PARTIAL | Only CSS properties that have a visual effect but no structure or functional CSS properties. Not allowed are: <br>`display`, `position`, `visibility`, `z-index`, `pointer-events`, `overflow`, `transform`                              |
| Changing generic selectors of the Bootstrap framework.    | ⚪ PARTIAL | Be aware of what you are doing. Fixing a small styling issue might be ok. Changing structural properties might have a big impact on the layout and functionality.                                                                      |
| Changing the CSS properties of generic Bootstrap classes. | ⚪ PARTIAL | Be aware of what you are doing. Fixing a small styling issue might be ok. Changing structural properties might have a big impact on the layout and functionality.                                                                      |
| Renaming or removing SASS variables or mixins.            | 🔴 NO      |                                                                                                                                                                                                                                            |
| Renaming or removing standard theme variables.         | 🔴 NO      |                                                                                                                                                                                                                                            |

### Administration

#### Component Templates

| Use Case                                                                        | Allowed?   | Notes / Alternatives                                                                     |
| ---                                                                             | ---        | ---                                                                                      |
| Renaming or removing TWIG blocks.                                               | 🔴 NO      | Use the deprecation workflow.<br>Code Example: [Deprecate TWIG block](#deprecate-twig-block) |
| Moving TWIG blocks within the same file.                                        | ⚪ PARTIAL | Only within the same scope/parent block.                                               |
| Changing the "ref" attribute of elements.                                       | 🔴 NO      |                                                                                          |
| Changing VueJS specific template functions, like v-if.                          | 🔴 NO      |                                                                                          |
| Changing VueJS data functions, like v-model, or v-bind.                         | 🔴 NO      |                                                                                          |
| Renaming or removing VueJS slots.                                               | 🔴 NO      | Use the deprecation workflow.<br>Code Example: [Deprecate Vue Slot](#deprecate-vue-slot) |
| Using new functionality of the VueJS framework, which has a breaking behavior. | 🔴 NO      |                                                                                          |
| Renaming or removing global available VueJS template functions.              | 🔴 NO      |                                                                                          |

#### JavaScript Modules & Components

| Use Case                                                     | Allowed?   | Notes / Alternatives                                                                                                                                                                                                                        |
|---                                                           | ---        | ---                                                                                                                                                                                                                                         |
| Renaming or removing base components.                     | 🔴 NO      | Use the deprecation workflow.<br>Code Example: [Deprecate admin components](#deprecate-admin-components)                                                                                                                                    |
| Renaming or removing module components.                   | 🔴 NO      | Use the deprecation workflow.<br>Code Example: [Deprecate admin components](#deprecate-admin-components)                                                                                                                                    |
| Renaming or removing methods                                 | 🔴 NO      | Use the deprecation workflow.<br>Code Example: [Rename a method](#rename-a-method)                                                                                                                                                          |
| Changing the return value of a method                        | 🔴 NO      | Use the deprecation workflow.<br>Code Example: [Add new public function](#add-new-public-function)                                                                                                                                          |
| Changing the parameters of a method                          | 🔴 NO      | Only with new optional parameters with a default value or if the method uses a single object as a parameter via destructuring. Otherwise, use the deprecation workflow.<br>Code Example: [Add new public function](#add-new-public-function) |
| Renaming or removing of required props                       | 🔴 NO      | Use the deprecation workflow.<br>Code Example: [Deprecate properties](#deprecate-admin-component-properties)                                                                                                                                |
| Renaming or removing of vue events                           | 🔴 NO      | Use the deprecation workflow.<br>Add a deprecation annotation to the event which needs to be renamed or removed and offer an alternative inside the deprecation comment when possible                                                       |
| Changing the parameters of a vue event                       | ⚪ PARTIAL | Only with new optional parameters with a default value.<br> Only when the method receives an object as a parameter and when working with destructuring                                                             |
| Adding required properties to components.                    | 🔴 NO      | Add the property as optional property and show a warning if the property is empty. This could be done on component creation or with a property validator.<br>Code Example: [Adding required properties to components](#adding-required-properties-to-components) |
| Renaming or removing data that is used in the data binding. | 🔴 NO      |                                                                                                                                                                                                                                             |
| Renaming or removing the routes of a module.                 | 🔴 NO      |                                                                                                                                                                                                                                             |
| Changing the parameters of a route.                          | 🔴 NO      |                                                                                                                                                                                                                                             |
| Adding required parameters to a route.                       | 🔴 NO      |                                                                                                                                                                                                                                             |
| Changing the public API of the global "Shopware" object.     | 🔴 NO      | Use the deprecation workflow. Use the same workflow as for other methods.<br>Code Example: [Rename a method](#rename-a-method)                                                                                                                  |
| Changing the public API of state stores. (VueX)              | 🔴 NO      |                                                                                                                                                                                                                                             |
| Renaming, removing, or not-using of assets or other imports.  | 🔴 NO      |                                                                                                                                                                                                                                             |

#### Component Styling

| Use Case                                                    | Allowed?   | Notes / Alternatives                                                                                                                                                                                                                                        |
| ---                                                         | ---        | ---                                                                                                                                                                                                                                                         |
| Renaming or removing CSS definitions.                       | ⚪ PARTIAL | Only CSS properties that have a visual effect but no structure or functional CSS properties. Not allowed are: <br>`display`, `position`, `visibility`, `z-index`, `pointer-events`, `overflow`, `transform`                                               |
| Renaming or removing functional selectors, like `is--*`. | 🔴 NO      |                                                                                                                                                                                                                                                             |
| Renaming or removing root CSS selectors.                    | 🔴 NO      |                                                                                                                                                                                                                                                             |

## Code Examples

### PHP

#### Extend class with abstract class

```php
/** Before */
class MailService implements MailServiceInterface
 
/** After */
class MailService extends AbstractMailService
class AbstractMailService implements MailServiceInterface
```

#### Add an argument

```php
/**
 * @feature-deprecated tag:v6.5.0 (flag:FEATURE_NEXT_22222)
 * Parameter $precision will be mandatory in future implementation
 */
public function calculate(ProductEntity $product, Context $context /*, int $precision */): Product
{
   if (Feature::isActive('FEATURE_NEXT_22222')) {
      if (\func_num_args() === 3) {
         $precision = func_get_arg(2);
         // Do new calculation
      } else {
         throw new InvalidArgumentException('Argument 3 $precision is required with feature FEATURE_NEXT_22222');
      }
   } else {
      // Do old calculation
   }
}
```

#### Add a public function

```php
/** Before */
abstract class AbstractProductRoute
{
    abstract public function getDecorated(): AbstractProductRoute;
 
    abstract public function load();
}
 
 
/** After */
abstract class AbstractProductRoute
{
    abstract public function getDecorated(): AbstractProductRoute;
 
    abstract public function load();
 
    /**
     * @deprecated tag:v6.5.0 - Will be abstract 
     */
    public function loadV2()
    {
        return $this->getDecorated()->loadV2();
    }
}
```

### TWIG & HTML

#### Deprecate TWIG block

**Storefront**: Use the `deprecated` tag from TWIG, including a comment with the normal annotation.

```html
{% block the_block_name %}
    {% deprecated '@deprecated tag:v6.5.0 - Block will be removed completely including the content' %}
    <div>Content</div>
{% endblock %}
```

**Administration**: Use normal TWIG comments for the annotation, as the other syntax is not supported.

```html
{% block the_block_name %}
    {# @deprecated tag:v6.5.0 - Block will be removed completely including the content #}
    <div>Content</div>
{% endblock %}
```

#### Rename TWIG block

```html
{% block new_block_name %}
    {% block old_block_name %}
    {% deprecated '@deprecated tag:v6.5.0 - Use `new_block_name` instead' %}
        <div>Content</div>
    {% endblock %}
{% endblock %}
```

#### Deprecate CSS selectors

```html
{# @deprecated tag:v6.5.0 - CSS class "card-primary" is deprecated, use "card-major" instead #}
<div class="card card-major card-primary">
    ...
</div>
```

#### Deprecate Vue Slot

```html
{# @deprecated tag:v6.5.0 - Use slot "main-content" instead #}
<slot name="content"></slot>
<slot name="main-content"></slot>
```

### JavaScript

#### Add new public function

```javascript
// route.service.js
export default class RouteService {
    /**
     * @deprecated tag:v6.5.0 - Use getRouteConfig() instead
     */
    getRoute(symfonyRoute) {
        // Returns string 'foo/bar'
        return this._someMagic(symfonyRoute);
    }
 
    getRouteConfig() {
        // Returns object { name: 'foo/bar', params: [] }
        return {
            url: this._someMagic(symfonyRoute).url,
            params: this._someMagic(symfonyRoute).params
        }
    }
}
```

#### Rename a method

```javascript
/**
 * @deprecated tag:v6.5.0 - Use onItemClick() instead
 */
onClick(event) {
    return onItemClick(event);
},
 
onItemClick(event) {
    // ...
}
```

#### Deprecate admin components

```javascript
/**
 * @deprecated tag:v6.5.0 - Use sw-new instead
 * @status deprecated
 */
Shopware.Component.register('sw-old', {
    deprecated: '6.5.0'
});
```

#### Deprecate admin component properties

```json
{
    name: 'example-component',
    props: {
        /** @deprecated tag:v6.5.0 - Insert additional information in comments */
        exampleProp: {
            type: String,
            required: false,
            default: 'Default value',
            deprecated: {
                version: '6.5.0',
                comment: 'Insert additional information in comments'
            }
        }
    }
}
```

#### Adding required properties to components

```json
{
    createdComponent() {
        /** @deprecated tag:v6.5.0 - Warning will be removed when prop is required */
        if (!this.newProp) {
            debug.warn(
                'sw-example-component',
                '"newProp" will be required in tag:v6.5.0'
            );
        }
    }
}
```

#### Renaming or removing JS services

```javascript
// http-client.service.js
/**
* @deprecated tag:v6.5.0 - Use NewHttpClient instead (new-http-client.service.js)
*/
export default class HttpClient {
    // ...
}
 
// new-http-client.service.js
export default class NewHttpClient {
    // ...
}
```

#### Renaming or removing JS plugins

```javascript
// buy-button.plugin.js
/**
* @deprecated tag:v6.5.0 - Use NewBuyButtonPlugin instead (new-buy-button.plugin.js)
*/
export default class BuyButtonPlugin extends Plugin {
    // ...
}
 
// new-buy-button.plugin.js
export default class NewBuyButtonPlugin extends Plugin {
    // ...
}
```
