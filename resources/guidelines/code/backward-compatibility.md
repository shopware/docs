# Backward Compatibility

## Introduction
Shopware is a standard eCommerce solution which is used by many customers around the world and is the technical foundation of their online business. As developers of Shopware it is our highest goal to guarantee the reliability of the software for our customers. Always keep in mind that every change you make can have a big impact on the live of our customers, either in a good way, but also in a bad way.

For the release strategy Shopware uses a semantic [versioning](https://www.shopware.com/en/news/shopware-6-versioning-strategy/) and therefore has to be always backward compatible for minor and patch updates. This brings additional challenges, when changing the code of Shopware. The following guide aims to provide you with the necessary workflows and techniques to do your changes in a backward compatible way and what to do, if it is not possible.

## Annotations
During the development different cases occur, where you want to replace old code with new one or even remove some obsolete code. As Shopware must always be backward compatible on minor and patch updates, old code should only be removed with a major release. Until the next major release you want to mark the code with a corresponding annotation, to inform other developers of the planned change. This overview shows the most important annotations and in which situation they have to be used.

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
The `@feature-deprecated` annotation is used for obsolete code during the development of a feature, when the code is still hidden behind a feature flag. This is important, so that code, that is not public, will not trigger deprecation warnings. This annotation has to be changed to the correct `@deprecated` annotation, when the feature is released and the corresponding feature flag is removed. Always add the name of the corresponding feature flag to the annotation, so that it will not be forgotten, when the flag is removed.

### @major-deprecated
```php
/**
 * @major-deprecated (flag:FEATURE_NEXT_22222)
 */
```
The `@major-deprecated` annotation is used for breaking code which has to stay behind a specific major feature flag until the next major release. Always add the name of the corresponding feature flag to the annotation, so that it will not be forgotten, when the flag is removed.

### @internal
```php
/**
 * @internal (flag:FEATURE_NEXT_11111)
 */
```
The `@internal` annotation is used for new introduced code, which is not yet released or hidden behind a feature flag. This ensures, that it will not be treated as public API until the corresponding feature is released and makes it possible to change the code in any way until the final release. Always add the name of the corresponding feature flag to the annotation, so that it will not be forgotten, when the corresponding feature is released.

## Workflows
### Backward Compatible Features
When developing new features, the goal should always be, to do this in a backward compatible way. This ensures that the feature can be shipped with a minor release, to provide value for customers as soon as possible. The following table should help you to use the correct approach for each type of change.

<table>
	<tr>
		<th width=180>Case</th>
		<th>During development</th>
		<th>On feature release</th>
		<th>Next major release</th>
	</tr>
	<tr>
		<td>🚩 <b>Feature Flag</b></td>
		<td>Hide code behind normal [feature flag](#using-feature-flags).</td>
		<td>Remove feature flag.</td>
		<td></td>
	</tr>
	<tr>
		<td>➕ <b>New code</b></td>
		<td>Add <code>@internal</code> annotation for new public API.</td>
		<td>Remove <code>@internal</code> annotation.</td>
		<td></td>
	</tr>
	<tr>
		<td>⚪ <b>Obsolete code</b></td>
		<td>Add <code>@feature-deprecated</code> annotation.</td>
		<td>Replace <code>@feature-deprecated</code> with normal <code>@deprecated</code> annotation.</td>
		<td>Remove old code.</td>
	</tr>
	<tr>
		<td>🔴 <b>Breaking change</b></td>
		<td>Add <code>@major-deprecated</code> annotation. Hide breaking code behind additional <i>major</i> [feature flag](https://github.com/shopware/platform/blob/trunk/adr/2020-08-10-Feature-flag-system.md)!<br><br>Also create a separate [changelog](https://github.com/shopware/platform/blob/master/adr/2020-08-03-Implement-New-Changelog.md) for the change with the <i>major</i> flag.</td>
		<td></td>
		<td>Remove old code. Remove <i>major</i> feature flag.</td>
	</tr>
	<tr>
		<td>🔍 <b>Tests</b></td>
		<td>Add new tests behind feature flag.</td>
		<td>Remove feature flags from new tests. Declare old tests as [legacy](https://symfony.com/doc/current/components/phpunit_bridge.html#mark-tests-as-legacy).</td>
		<td>Remove legacy tests.</td>
	</tr>
</table>

You can also find more detailed information and code examples in the corresponding **[ADR](https://github.com/shopware/platform/blob/trunk/adr/)** for the deprecation strategy.

### Breaking Changes / Features
The first goal should always be to make your changes backward compatible. But there might be some special case, where it isn't possible in any way. In this case, the change can only be released with a major version. As we develop all changes in the same code base, the `trunk` branch, the changes have to stay behind a special feature flag, which is especially marked as a major feature flag.

<table>
	<tr>
		<th width=180>Case</th>
		<th>During development</th>
		<th>Next major release (feature release)</th>
	</tr>
	<tr>
		<td>🚩 <b>Feature Flag</b></td>
		<td>Hide code behind <i>major</i> feature flag.</td>
		<td>Remove <i>major</i> feature flag.</td>
	</tr>
	<tr>
		<td>➕ <b>New code</b></td>
		<td>Add <code>@internal</code> annotation for new public API.</td>
		<td>Remove <code>@internal</code> annotation.</td>
	</tr>
	<tr>
		<td>⚪ <b>Obsolete code</b></td>
		<td>Add <code>@major-deprecated</code> annotation.</td>
		<td>Remove old code.</td>
	</tr>
	<tr>
		<td>🔴 <b>Breaking change</b></td>
		<td>Add <code>@major-deprecated</code> annotation.</td>
		<td>Remove old code.</td>
	</tr>
	<tr>
		<td>🔍 <b>Tests</b></td>
		<td>Add new tests behind <i>major</i> feature flag. Declare old tests as [legacy](https://symfony.com/doc/current/components/phpunit_bridge.html#mark-tests-as-legacy).</td>
		<td>Remove legacy tests.</td>
	</tr>
</table>

## Compatibility Sheet
To ensure the backward compatibility it is important to know, what you are allowed to do and what not. The following sheet should give you an orientation on common changes and how they could affect the backward compatibility. Although a lot of effort went into this list, it is not guaranteed to be a 100% complete. Always keep the persona of third-party developers in mind and challenge your changes against external needs.

### PHP
As Shopware is based on the PHP framework Symfony, we also have to make sure to use the rules, which the framework follows. Besides the list below, always keep in mind the backward compatibility promise and implement your changes in a way the promise is kept.

**[Symfony Backward Compatibility Promise](https://symfony.com/doc/current/contributing/code/bc.html)**

<table>
    <tr>
        <th width=260>Use Case</th>
        <th width=120>Allowed?</th>
        <th>Notes / Alternatives</th>
    </tr>
    <tr>
        <td>Change the typehint of a class, interface or trait.</td>
        <td>🔴 NO</td>
        <td>Add the new typehint as an abstract class.<br><br>Code Example: [Extend class with abstract class](#extend-class-with-abstract-class)</td>
    </tr>
    <tr>
        <td>Change the constructor of a service.</td>
        <td>✅ YES</td>
        <td>Services have to be instantiated over the container, so the changes should not break anything.</td>
    </tr>
    <tr>
        <td>Change the constructor of a class, that is not a service.<br><br>  
(Instantiated with <code>new Class()</code>)</td>
        <td>⚪ PARTIAL</td>
        <td>Only optional arguments are allowed to be added and this should be made via <code>func_get_args()</code>.<br><br>Code Example: [Add an argument](#add-an-argument)</td>
    </tr>
    <tr>
        <td>Change the arguments of a public method.</td>
        <td>⚪ PARTIAL</td>
        <td>Only optional arguments are allowed to be added and this should be made via <code>func_get_args()</code>.<br><br>Code Example: [Add an argument](#add-an-argument)</td>
    </tr>
    <tr>
        <td>Change the arguments of a protected method.</td>
        <td>⚪ PARTIAL</td>
        <td>Only optional arguments are allowed to be added and this should be made via <code>func_get_args()</code>.<br><br>Code Example: [Add an argument](#add-an-argument)</td>
    </tr>
    <tr>
        <td>Change the arguments of a private method.</td>
        <td>✅ YES</td>
        <td></td>
    </tr>
    <tr>
        <td>Change return the type of a method.</td>
        <td>🔴 NO</td>
        <td>Create a new method and deprecate the old one.</td>
    </tr>
    <tr>
        <td>Change the value of a public constant.</td>
        <td>🔴 NO</td>
        <td>You should add a new constant. Annotate the old constant as deprecated and remove it in the next major version.</td>
    </tr>
    <tr>
        <td>Change the value of a private constant.</td>
        <td>✅ YES</td>
        <td>Check all potential usages of the constant. Maybe it is used somewhere to be stored in the database. In that case, you must write a migration for it which ensures every use of the constant in a db-value is updated as well.</td>
    </tr>
    <tr>
        <td>Change a class or method to final.</td>
        <td>🔴 NO</td>
        <td>You will have to deprecate the class or method and add an annotation that it will be final in the next major version.</td>
    </tr>
    <tr>
        <td>Change the visibility of a class, method or property from public to private/protected or protected to private</td>
        <td>🔴 NO</td>
        <td>Annotate it as deprecated and change the visibility in the next major version.</td>
    </tr>
    <tr>
        <td>Change the namespace of a class.</td>
        <td>🔴 NO</td>
        <td>Duplicate the class and mark the old one as deprecated.</td>
    </tr>
    <tr>
        <td>Change static state (remove static or delete static keyword).</td>
        <td>🔴 NO</td>
        <td>Annotate it as deprecated and add or remove the static keyword in the next major version.</td>
    </tr>
    <tr>
        <td>Add parameter to interface or abstract class function.</td>
        <td>⚪ PARTIAL</td>
        <td>Only optional arguments are allowed to be added and this should be made via <code>func_get_args()</code>.<br><br>Code Example: [Add an argument](#add-an-argument)</td>
    </tr>
    <tr>
        <td>Add new public function to interface.</td>
        <td>🔴 NO</td>
        <td></td>
    </tr>
    <tr>
        <td>Add new public function to abstract class.</td>
        <td>⚪ PARTIAL</td>
        <td>Only possible if the abstract class already contains the <code>getDecorated</code> call.<br><br>Code Example: [Add a public function](#add-a-public-function)</td>
    </tr>
    <tr>
        <td>Add an event or event dispatch.</td>
        <td>✅ YES</td>
        <td></td>
    </tr>
    <tr>
        <td>Add a constant.</td>
        <td>✅ YES</td>
        <td></td>
    </tr>
    <tr>
        <td>Remove an event or event dispatch.</td>
        <td>🔴 NO</td>
        <td></td>
    </tr>
    <tr>
        <td>Remove a public property, constant or method.</td>
        <td>🔴 NO</td>
        <td>Annotate it as deprecated and remove it in the next major release.</td>
    </tr>
    <tr>
        <td>Remove a protected property, constant or method.</td>
        <td>🔴 NO</td>
        <td>Annotate it as deprecated and remove it in the next major release.</td>
    </tr>
    <tr>
        <td>Remove a private property, constant, or method.</td>
        <td>✅ YES</td>
        <td></td>
    </tr>
</table>

### Storefront
#### TWIG Templates
<table>
	<tr>
		<th width=260>Use Case</th>
		<th width=120>Allowed?</th>
		<th>Notes / Alternatives</th>
	</tr>
	<tr>
		<td>Removing TWIG blocks.</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Deprecate TWIG block](#deprecate-twig-block)</td>
	</tr>
	<tr>
		<td>Renaming TWIG blocks.</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow. Create a new surrounding block with the new name and deprecate the old one. All variables which are defined in the scope of the old block, must be moved to the new surrounding block scope.<br><br>Code Example: [Rename TWIG block](#rename-twig-block)</td>
	</tr>
	<tr>
		<td>Moving TWIG blocks within the same file.</td>
		<td>⚪ PARTIAL</td>
		<td>Only within the same scope / parent block.</td>
	</tr>
	<tr>
		<td>Removing TWIG variables.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Renaming TWIG variables.</td>
		<td>🔴 NO</td>
		<td>Create a new variable within the same scope and deprecate the old one.</td>
	</tr>
	<tr>
		<td>Changing the value of TWIG variables</td>
		<td>⚪ PARTIAL</td>
		<td>The data type has to stay the same. Otherwise use the deprecation workflow.</td>
	</tr>
	<tr>
		<td>Moving TWIG variable definitions to other TWIG blocks.</td>
		<td>⚪ PARTIAL</td>
		<td>Only when they are being moved higher up in the block scope.</td>
	</tr>
	<tr>
		<td>Adding TWIG blocks which affect the scope of variable definitions.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Moving template files to other directories.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
</table>

#### HTML
<table>
	<tr>
		<th width=260>Use Case</th>
		<th width=120>Allowed?</th>
		<th>Notes / Alternatives</th>
	</tr>
	<tr>
		<td>Removing HTML sections.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Moving HTML sections within the same file.</td>
		<td>⚪ PARTIAL</td>
		<td>Only within the same TWIG Block.</td>
	</tr>
	<tr>
		<td>Renaming of removing CSS selectors.</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Deprecate CSS selectors](#deprecate-css-selectors)</td>
	</tr>
</table>

#### JavaScript
<table>
	<tr>
		<th width=260>Use Case</th>
		<th width=120>Allowed?</th>
		<th>Notes / Alternatives</th>
	</tr>
	<tr>
		<td>Renaming or removing JS services.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Renaming or removing of JS plugins.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Changing the public API of a JS plugin or service.</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Add new public function](#add-new-public-function)</td>
	</tr>
	<tr>
		<td>Renaming methods of JS plugins or services.</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Rename a method](#rename-a-method)</td>
	</tr>
	<tr>
		<td>Renaming or removing of JS events.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Changing the parameters of JS events.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
</table>

#### Styling / CSS
<table>
	<tr>
		<th width=260>Use Case</th>
		<th width=120>Allowed?</th>
		<th>Notes / Alternatives</th>
	</tr>
	<tr>
		<td>Renaming or removing CSS definitions.</td>
		<td>⚪ PARTIAL</td>
		<td>Only CSS properties which have a visual effect, but no structure or functional CSS properties. Not allowed are:<br><br>

*  display
*  position
*  visibility
*  z-index
*  pointer-events
*  overflow
*  transform
</td>
	</tr>
	<tr>
		<td>Changing generic selectors of the Bootstrap framework.</td>
		<td>⚪ PARTIAL</td>
		<td>Be aware of what you are doing. Fixing a small styling issue might be ok. Changing structural properties might have a big impact on the layout and the functionality.</td>
	</tr>
	<tr>
		<td>Changing the CSS properties of generic Bootstrap classes.</td>
		<td>⚪ PARTIAL</td>
		<td>Be aware of what you are doing. Fixing a small styling issue might be ok. Changing structural properties might have a big impact on the layout and the functionality.</td>
	</tr>
	<tr>
		<td>Renaming or removing SASS variables or mixins.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Renaming or removing of standard theme variables.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
</table>

### Administration
#### Component Templates
<table>
	<tr>
		<th width=260>Use Case</th>
		<th width=120>Allowed?</th>
		<th>Notes / Alternatives</th>
	</tr>
	<tr>
		<td>Renaming or removing TWIG blocks.</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Deprecate TWIG block](#deprecate-twig-block)</td>
	</tr>
	<tr>
		<td>Moving TWIG blocks within the same file.</td>
		<td>⚪ PARTIAL</td>
		<td>Only within the same scope / parent block.</td>
	</tr>
	<tr>
		<td>Changing the "ref" attribute of elements.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Changing VueJS specific template functions, like v-if.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Changing VueJS data functions, like v-model, or v-bind.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Renaming or removing VueJS slots.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Using new functionality of the VueJS framework, which has a breaking behaviour.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Renaming or removing of global available VueJS template functions.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
</table>

#### JavaScript Modules & Components
<table>
	<tr>
		<th width=260>Use Case</th>
		<th width=120>Allowed?</th>
		<th>Notes / Alternatives</th>
	</tr>
	<tr>
		<td>Renaming or removing of base components.</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Deprecate admin components](#deprecate-admin-components)</td>
	</tr>
	<tr>
		<td>Renaming or removing of module components.</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Deprecate admin components](#deprecate-admin-components)</td>
	</tr>
	<tr>
		<td>Renaming or removing methods</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Rename a method](#rename-a-method)</td>
	</tr>
	<tr>
		<td>Changing the return value of a method</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Add new public function](#add-new-public-function)</td>
	</tr>
	<tr>
		<td>Changing the parameters of a method</td>
		<td>🔴 NO</td>
		<td>Only with new optional parameters which have a default value or if the method uses a single object as parameter via destructering. Otherwise use the deprecation workflow.<br><br>Code Example: [Add new public function](#add-new-public-function)</td>
	</tr>
	<tr>
		<td>Renaming or removing of required props</td>
		<td>🔴 NO</td>
		<td>Use the deprecation workflow.<br><br>Code Example: [Deprecate properties](#deprecate-admin-component-properties)</td>
	</tr>
	<tr>
		<td>Renaming or removing of vue events</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Changing the parameters of a vue event</td>
		<td>⚪ PARTIAL</td>
		<td></td>
	</tr>
	<tr>
		<td>Adding required properties to components.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Renaming or removing data which is used in the data binding.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Renaming or removing the routes of a module.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Changing the parameters of a route.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Adding required parameters to a route.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Changing the public API of the global "Shopware" object.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Changing the public API of state stores. (VueX)</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
	<tr>
		<td>Renaming, removing or not-using of assets or other imports.</td>
		<td>🔴 NO</td>
		<td></td>
	</tr>
</table>

#### Component Styling
<table>
	<tr>
		<th width=260>Use Case</th>
		<th width=120>Allowed?</th>
		<th>Notes / Alternatives</th>
	</tr>
	<tr>
		<td>Renaming or removing CSS definitions.</td>
		<td>⚪ PARTIAL</td>
		<td>Only CSS properties which have a visual effect, but no structure or functional CSS properties. Not allowed are:<br><br>

*  display
*  position
*  visibility
*  z-index
*  pointer-events
*  overflow
*  transform</td>
   </tr>
   <tr>
   	<td>Renaming or removing of functional selectors, like "is--*".</td>
   	<td>🔴 NO</td>
   	<td></td>
   </tr>
   <tr>
   	<td>Renaming or removing root CSS selectors.</td>
   	<td>🔴 NO</td>
   	<td></td>
   </tr>
</table>

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
**Storefront**: Use the `deprecated` tag from TWIG including a comment with the normal annotation.
```HTML
{% block the_block_name %}
    {% deprecated '@deprecated tag:v6.5.0 - Block will be removed completely including the content' %}
    <div>Content</div>
{% endblock %}
```

**Administration**: Use normal TWIG comments for the annotation, as the other syntax is not supported.
```HTML
{% block the_block_name %}
    {# @deprecated tag:v6.5.0 - Block will be removed completely including the content #}
    <div>Content</div>
{% endblock %}
```



#### Rename TWIG block
```HTML
{% block new_block_name %}
    {% block old_block_name %}
    {% deprecated '@deprecated tag:v6.5.0 - Use `new_block_name` instead' %}
        <div>Content</div>
    {% endblock %}
{% endblock %}
```

#### Deprecate CSS selectors
```HTML
{# @deprecated tag:v6.5.0 - CSS class "card-primary" is deprecated, use "card-major" instead #}
<div class="card card-major card-primary">
    ...
</div>
```

## JavaScript

### Add new public function
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
```javascript
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