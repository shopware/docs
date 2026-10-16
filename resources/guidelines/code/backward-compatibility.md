---
nav:
  title: Keeping extensions compatible
  position: 20

---

# Keeping extensions compatible

## Introduction

Shopware follows a semantic [versioning strategy](https://www.shopware.com/en/news/shopware-6-versioning-strategy/): minor and patch releases are backward compatible, breaking changes ship only with a major release.

This page is for developers of plugins, apps and themes. It explains how Shopware announces an upcoming change in its public API and how you write extension code that works on the current and the next major version at the same time.

The rules that Shopware's core developers follow when they change public API, including what counts as a break and what may change in a minor release, are in the [Backward compatibility](./core/backward-compatibility.md) guideline. That page is mirrored from the `shopware/shopware` repository and is the source of truth for those rules.

## Annotations

Shopware marks upcoming changes directly in the code. When you extend or call core code, these markers tell you what will change and when.

### @deprecated

```php
/**
 * @deprecated tag:v6.8.0 - Use NewFunction() instead
 */
```

A symbol marked `@deprecated` is removed or replaced with the named major version. The comment names the replacement. Migrate to it before you raise your minimum supported version to that major.

Calling deprecated code triggers a deprecation notice until the major release and throws an exception once the major feature flag is active. Run your test suite with the upcoming major flag enabled to find remaining usages early; see [feature flags](#feature-flags).

`@deprecated` is only used when the symbol itself goes away. A symbol that stays but changes, for example a return type that narrows or a class that becomes final, is announced with a [BC-change attribute](#bc-change-attributes) instead, so that static analysis does not report a usage that has nothing to migrate.

### @experimental

```php
/**
 * @experimental feature:FEATURE_FLAG stableVersion:v6.8.0
 */
```

Code marked `@experimental` is not part of the public API yet. It can change in any way until the named stable version, and it may still be removed. Treat it like `@internal`: do not build on it unless you accept that your extension can break on a minor update. The named feature flag is the one that enables the experimental feature.

### BC-change attributes

```php
use Shopware\Core\Framework\Deprecation\BCChange\ReturnTypeNarrowing;

#[ReturnTypeNarrowing(version: 'v6.8.0', newType: 'static')]
public function assign(array $options): self
```

A planned change to a symbol that **stays**, such as a signature change, a visibility change or a class becoming final, is announced with an attribute from the `Shopware\Core\Framework\Deprecation\BCChange` namespace. Each attribute states the version in which the change happens and carries the announced declaration as a machine-readable payload, so IDEs, Rector and other tooling can act on it.

Every attribute implements one or both of two marker interfaces that tell you whether your code is affected:

* `CallSiteCompatibilityChange` — affects code that **calls** the symbol.
* `ExtenderCompatibilityChange` — affects classes that **extend or override** the symbol.

Where the legacy usage can be detected at runtime, for example a call that omits a parameter that becomes required, the core method also triggers a deprecation notice, so your test suite shows the usages to adapt.

See [Announced API changes](#announced-api-changes-bc-change-attributes) for every attribute and how to make your code compatible with the current and the next major version at the same time.

## Announced API changes (BC-change attributes)

This section lists every BC-change attribute, who is affected, and how to write extension code **today** that keeps working after the announced change. The directional naming is deliberate: PHP's variance rules make one direction of every change safe to anticipate, so in almost all cases a single code path is compatible with the current *and* the next major version — no version checks needed.

| Attribute                        | Announces                                        | Affects                 | Safe opt-in today                                                             |
| -------------------------------- | ------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------- |
| `#[ReturnTypeNarrowing]`         | Return type becomes narrower                     | Extenders               | ✅ Declare the announced type in your override now                            |
| `#[ReturnTypeWidening]`          | Return type becomes wider                        | Call sites              | ✅ Handle the announced type now                                              |
| `#[ParameterTypeNarrowing]`      | Parameter type becomes narrower                  | Call sites              | ✅ Pass only values of the announced type now                                 |
| `#[ParameterTypeWidening]`       | Parameter type becomes wider                     | Extenders               | ✅ Declare the announced type in your override now                            |
| `#[NewOptionalParameter]`        | A new optional parameter is added                | Extenders               | ✅ Add the parameter to your override now                                     |
| `#[NewRequiredParameter]`        | A new required parameter is added                | Call sites & extenders  | ✅ Pass the parameter now / add it (optional) to your override now            |
| `#[ParameterDefaultValueChange]` | A parameter default value changes                | Call sites              | ✅ Pass the current value explicitly now                                      |
| `#[ParameterNameChange]`         | A parameter is renamed                           | Call sites (named args) | ✅ Use positional arguments now                                               |
| `#[ParameterRemoval]`            | An (optional) parameter is removed               | Call sites              | ✅ Stop passing it now                                                        |
| `#[ExceptionChange]`             | The thrown exception types change                | Call sites              | ✅ Catch the current and the announced exceptions now                         |
| `#[BecomesAbstract]`             | A method loses its default implementation        | Extenders               | ✅ Implement the method in your subclass now                                  |
| `#[BecomesFinal]`                | A class becomes final                            | Extenders               | ⚠️ Switch from inheritance to decoration/composition — works on both versions |
| `#[BecomesInternal]`             | A symbol becomes `@internal`                     | Call sites & extenders  | ✅ Stop using it now                                                          |
| `#[VisibilityChange]`            | Visibility is reduced (e.g., public → protected) | Call sites & extenders  | ⚠️ Stop external calls now; narrow overrides in the next major                |
| `#[PropertyTypeNarrowing]`       | A property type becomes narrower                 | Call sites & extenders  | ✅ Assign only values of the announced type; stop redeclaring the property    |
| `#[PropertyTypeWidening]`        | A property type becomes wider                    | Call sites & extenders  | ✅ Handle the announced type when reading; stop redeclaring the property      |
| `#[BecomesReadonly]`             | A property becomes `readonly`                    | Call sites & extenders  | ✅ Stop assigning it outside the declaring class; stop redeclaring it         |
| `#[ClassHierarchyChange]`        | The inheritance chain of a class changes         | Call sites & extenders  | ⚠️ Depends on the change — stop relying on ancestors that go away             |
| `#[ClassMoved]`                  | A class moves to another namespace               | Call sites & extenders  | ✅ Use the new fully qualified class name now                                 |

### Quick guides per attribute

Each guide covers both audiences. "Nothing to do" means the change cannot break that side of the contract — the reasoning is given so you can verify it for your case.

#### ReturnTypeNarrowing

```php
#[ReturnTypeNarrowing(version: 'v6.8.0', newType: 'static')]
public function assign(array $options): self
```

**Call sites**: Nothing to do — a narrower return value satisfies every consumer of the current, wider type.

**Extending classes**: PHP return types are covariant: an override may always declare a narrower type than its parent. Declare the announced type in your override now — it is valid against the current declaration and stays valid after the change:

```php
// works on both versions
class MyStruct extends CoreStruct
{
    public function assign(array $options): static
    {
        // ...
    }
}
```

#### ReturnTypeWidening

```php
#[ReturnTypeWidening(version: 'v6.8.0', newType: '?array')]
public function getIncludes(): array
```

**Call sites**: Handle the announced (wider) type already. The extra handling is dead code today, but becomes required after the change:

```php
// works on both versions
$includes = $criteria->getIncludes() ?? [];
```

**Extending classes**: Your override may keep its current, narrower return type — after the change it is simply narrower than the parent, which covariance allows. If your override delegates to `parent::`, handle the announced type there like a call site.

#### ParameterTypeNarrowing

```php
#[ParameterTypeNarrowing(version: 'v6.8.0', parameterName: 'id', newType: 'string')]
public function load(int|string $id): void
```

**Call sites**: Pass only values of the announced (narrower) type. A `string` is accepted by `int|string` today and by `string` after the change:

```php
// works on both versions
$service->load((string) $productId);
```

**Extending classes**: Nothing to do — your override may keep the current, wider parameter type; after the change it is simply wider than the parent, which contravariance allows.

#### ParameterTypeWidening

```php
#[ParameterTypeWidening(version: 'v6.8.0', parameterName: 'value', newType: 'string|int')]
public function format(string $value): string
```

**Call sites**: Nothing to do — everything you pass today stays valid. Start passing values of the additional types only once your minimum supported Shopware version declares them.

**Extending classes**: PHP parameter types are contravariant: an override may always declare a wider type than its parent. Declare the announced type in your override now:

```php
// works on both versions
class MyFormatter extends CoreFormatter
{
    public function format(string|int $value): string
    {
        // ...
    }
}
```

#### NewOptionalParameter

```php
#[NewOptionalParameter(version: 'v6.8.0', parameterName: 'states', parameterType: 'array')]
public function scope(string $scope, callable $callback /* , array $states = [] */): void
```

**Call sites**: Nothing required — the parameter is optional. Some implementations already read it via `func_get_args()`, but that is not guaranteed for every implementation of an interface, so only start passing it once your minimum supported Shopware version declares the parameter.

**Extending classes**: An override may declare additional optional parameters that its parent does not have, so add the announced parameter to your override now. The signature is compatible with the current parent declaration and with the future one:

```php
// works on both versions
class MyContext extends Context
{
    public function scope(string $scope, callable $callback, array $states = []): void
    {
        // ...
    }
}
```

#### NewRequiredParameter

```php
#[NewRequiredParameter(version: 'v6.8.0', parameterName: 'criteria', parameterType: Criteria::class)]
public function get(string $id, SalesChannelContext $context /* , Criteria $criteria */): Response
{
    if (\func_num_args() < 3) {
        Feature::triggerDeprecationOrThrow('v6.8.0.0', '...');
    }
    // ...
}
```

**Call sites**: Pass the parameter today — extra arguments are valid PHP, and an implementation announcing this change reads the parameter via `func_get_args()` and triggers a deprecation when it is missing:

```php
// works on both versions
$route->get($id, $context, new Criteria());
```

**Extending classes**: Add the announced parameter to your override as an *optional* parameter now. That signature is a valid override of the current parent declaration, and an optional parameter also satisfies a required parent parameter after the change:

```php
// works on both versions
class MyRoute extends CoreRoute
{
    public function get(string $id, SalesChannelContext $context, ?Criteria $criteria = null): Response
    {
        $criteria ??= new Criteria();
        // ...
    }
}
```

#### ParameterDefaultValueChange

```php
#[ParameterDefaultValueChange(version: 'v6.8.0', parameterName: 'allowedWriteScopes', newDefaultValue: [Context::SYSTEM_SCOPE, Context::CRUD_API_SCOPE])]
public function __construct(array $allowedWriteScopes = [Context::SYSTEM_SCOPE])
```

**Call sites**: Omitting the parameter uses the announced default value after the change. Pass the current value explicitly to retain today's behavior on both versions:

```php
// works on both versions
new CreatedByField([Context::SYSTEM_SCOPE]);
```

**Extending classes**: Nothing to do — calls that pass the parameter explicitly and overriding declarations are unaffected.

#### ParameterNameChange

```php
#[ParameterNameChange(version: 'v6.8.0', parameterName: 'salesChannelContext', newName: 'context')]
public function process(Cart $cart, SalesChannelContext $salesChannelContext): void
```

**Call sites**: Named arguments break when the parameter is renamed. Use positional arguments — they work with either name:

```php
// breaks after the rename
$processor->process(salesChannelContext: $context, cart: $cart);

// works on both versions
$processor->process($cart, $context);
```

**Extending classes**: Parameter names are not part of PHP's override contract, so your override stays valid with either name. Rename the parameter to the announced name once you raise your minimum supported version — until then, callers using named arguments against *your* class are bound to the name you declare.

#### ParameterRemoval

```php
#[ParameterRemoval(version: 'v6.8.0', parameterName: 'options')]
public function __construct(?array $options = null)
```

**Call sites**: The parameter is optional today — simply stop passing it:

```php
// works on both versions
new CustomerEmailUnique();
```

**Extending classes**: Keep the parameter in your override and stop using its value. PHP does not allow an override to drop an optional parent parameter, and after the removal your extra optional parameter remains a valid override — so the unchanged signature works on both versions. You can drop it whenever you raise your minimum supported version.

#### ExceptionChange

```php
/**
 * @throws TableNotFoundException
 */
#[ExceptionChange(version: 'v6.8.0', newExceptions: [UtilException::class])]
protected function columnExists(Connection $connection, string $table, string $column): bool
```

**Call sites**: The announced exception classes already exist, so catch both. Multi-catch works on both versions:

```php
// works on both versions
try {
    $this->columnExists($connection, 'product', 'custom_field');
} catch (TableNotFoundException | UtilException $e) {
    // ...
}
```

Note: an `#[ExceptionChange]` is only used when the new exceptions fall **outside** the current `@throws` contract. If a method starts throwing a *narrower* exception (a subclass of what it throws today), existing `catch` blocks keep working and no announcement is made.

**Extending classes**: If your override throws the current exception types itself, switch to the announced types when you raise your minimum supported version. If it delegates to `parent::` and handles its exceptions, apply the call-site guidance above.

#### BecomesAbstract

```php
#[BecomesAbstract(version: 'v6.8.0')]
public function getNextExecutionTime(): ?\DateTimeInterface
{
    // default implementation, removed in v6.8.0
}
```

**Call sites**: Nothing to do — the method stays callable; only the default implementation disappears.

**Extending classes**: The default implementation goes away. Implement the method in your subclass now, without calling `parent::` — overriding a concrete method is always allowed, so this works on both versions.

#### BecomesFinal

```php
#[BecomesFinal(version: 'v6.8.0')]
class RuleConditionRegistry
```

**Call sites**: Nothing to do — calling a final class is unaffected.

**Extending classes**: Extending stops working at the announced version, so this is the one change that usually requires a refactor: replace inheritance with [decoration](../../../guides/plugins/plugins/plugin-fundamentals/adjusting-service.md) or composition. The refactored code works on both versions — do it now rather than at upgrade time.

#### BecomesInternal

```php
#[BecomesInternal(version: 'v6.8.0')]
class ImitateCustomerTokenGenerator
```

**Call sites**: Stop calling the symbol and switch to the replacement named in the description — that code works on both versions.

**Extending classes**: Stop extending or overriding the symbol — it leaves the public API entirely, so internal changes will no longer be announced afterwards.

#### VisibilityChange

```php
#[VisibilityChange(version: 'v6.8.0', newVisibility: 'protected')]
public function buildName(string $id): string
```

**Call sites**: Stop accessing the symbol from outside the announced scope now — inline the logic or use the replacement named in the description. For a property, this includes reads and writes. That code works on both versions.

**Extending classes**: For methods, PHP allows an override to be more visible than its parent, so the current public signature remains valid during the transition. Before the announced version, stop relying on external calls to the override; then narrow its visibility to the announced one in the next major. Do not build new public API on top of it. For properties, stop accessing the property from outside the announced scope; a property that becomes private must also not be redeclared in a subclass.

#### PropertyTypeNarrowing

```php
#[PropertyTypeNarrowing(version: 'v6.8.0', newType: 'string')]
public string|int $externalId;
```

**Call sites**: Reading the property is unchanged: every future value is already covered by the current type. Assign only values of the announced type now:

```php
// works on both versions
$entity->externalId = (string) $externalId;
```

**Extending classes**: Stop redeclaring the property. PHP property types are invariant, so no redeclaration can use both the current and announced type. Move the extension state to a differently named property or a separate object.

#### PropertyTypeWidening

```php
#[PropertyTypeWidening(version: 'v6.8.0', newType: 'string|null')]
public string $externalId;
```

**Call sites**: Assignments remain compatible because every value accepted today remains accepted. Prepare reads for every announced value now:

```php
// works on both versions
$externalId = $entity->externalId ?? '';
```

**Extending classes**: Stop redeclaring the property. PHP property types are invariant, so no redeclaration can use both the current and announced type. Move the extension state to a differently named property or a separate object.

#### BecomesReadonly

```php
#[BecomesReadonly(version: 'v6.8.0')]
public string $externalId;
```

**Call sites**: Stop assigning to the property outside its declaring class. Pass the value to the constructor or use the replacement mutation method instead. Reading the property remains compatible.

**Extending classes**: Stop redeclaring the property. A `readonly` property cannot be made compatible with a mutable redeclaration across both versions; keep extension state in a differently named property or a separate object.

`#[BecomesReadonly]` intentionally applies to properties, not classes. If a class is made readonly only because all of its properties become readonly, announce the change on each affected property. Making a whole class readonly can also affect dynamic properties, untyped or static properties, and inheritance, so it needs a separate BC assessment.

#### ClassHierarchyChange

```php
#[ClassHierarchyChange(version: 'v6.8.0', description: 'Will no longer extend EntitySearchResult, but will keep extending Struct.')]
class ProductListingResult extends EntitySearchResult
```

**Call sites**: The required description states exactly what changes. Stop type-hinting or `instanceof`-checking against ancestors that leave the hierarchy — reference the class itself or an ancestor that stays. That code works on both versions.

**Extending classes**: The same applies to your subclass, plus one more thing: methods and properties your subclass inherits *through* a leaving ancestor disappear with it. Stop using them, or implement them yourself — both work on both versions.

#### ClassMoved

```php
use Shopware\Core\Framework\Deprecation\BCChange\ClassMoved;

#[ClassMoved(
    version: 'v6.8.0',
    previousClassName: 'Shopware\OldNamespace\ExampleClass',
)]
class ExampleClass
{
}
```

`#[ClassMoved]` marks the class in its new, canonical namespace. Until the announced version, Shopware registers the previous fully qualified name as an eager `class_alias()`, so both names resolve to the same runtime class. This preserves construction, type declarations, static access, and inheritance without creating a compatibility subclass or a second class identity. Reflection reports the canonical declaration, so do not rely on the previous name being a distinct class.

**Call sites**: Import and use the canonical class name now. If the class is a dependency-injection service, use the canonical class name as the service ID as well. The previous class and service names remain available only for backward compatibility and are removed in the announced version.

**Extending classes**: Extend the canonical class name now. The alias preserves the same inheritance behavior during the transition, but disappears in the announced version.

The attribute means that the implementation survives under a new fully qualified name. It does not announce that the class's behavior is removed or replaced.

## Feature flags

Feature flags itself, mainly the name and existence of the feature flag itself, are part of the backward compatibility promise.
Which means feature flags won't be removed in a minor version and will be deprecated instead.

However, the behavior behind the feature flag might change at any time, this might include the complete removal of the feature behind the flag, or the use of a new flag to toggle the behaviour.
In these cases the old feature flag will still be registered, so checks for that feature flag won't throw any error, but the feature flag itself will do nothing.

This allows for easier compatibility across different versions in plugins, as the feature flag checks can stay in the plugin code.
All changes to the functionality behind the feature flag will be documented in the release notes.

## How deprecations look in core code

The following examples show how Shopware marks deprecations in PHP, Storefront templates, Administration components and JavaScript, so that you recognize them when you call or override that code.

### PHP

#### Extend a class with an abstract class

```php
/** Before */
class MailService implements MailServiceInterface

/** After */
class MailService extends AbstractMailService
class AbstractMailService implements MailServiceInterface
```

#### Add an argument

```php
#[NewRequiredParameter(version: 'v6.8.0', parameterName: 'precision', parameterType: 'int')]
public function calculate(ProductEntity $product, Context $context /* , int $precision */): Product
{
    if (\func_num_args() < 3) {
        Feature::triggerDeprecationOrThrow(
            'v6.8.0.0',
            'Calling calculate() without the $precision parameter is deprecated. It will be required in v6.8.0.0.'
        );
    }

    $precision = \func_num_args() >= 3 ? func_get_arg(2) : self::DEFAULT_PRECISION;

    // ...
}
```

The commented-out parameter in the signature documents the future declaration, the attribute announces it for tooling, and the conditional runtime deprecation (enforced by PHPStan for detectable changes) warns legacy callers. Use `#[NewOptionalParameter]` instead when the parameter will be optional; the runtime deprecation is not needed in that case. Methods that are invoked by the framework itself, such as controller actions with a `#[Route]` attribute, must not trigger the runtime deprecation — the framework always calls them with the declared parameters.

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

```javascript
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
