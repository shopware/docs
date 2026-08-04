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
 * @deprecated tag:v6.8.0 - Use NewFunction() instead
 */
```

The `@deprecated` annotation is used for obsolete public code, which will be removed with the next major release. The annotation always needs the specific major version tag, in which the code should be removed. Always add a meaningful comment with information about the corresponding replacement and how the deprecated code can be removed.

Use `@deprecated` only when the symbol itself becomes obsolete — it is removed or replaced, and consumers should stop using it. A symbol that stays but *changes* (a different return type, a new parameter, becoming final, and so on) is **not** deprecated: static analysis tools would report every usage as "usage of deprecated code" although there is nothing to migrate away from. Such planned changes are announced with dedicated PHP attributes instead — see [BC-change attributes](#bc-change-attributes). The former `@deprecated tag:vX.Y.Z - reason:*` markers are migrated to these attributes, and a PHPStan rule prevents new `reason:*` markers from being introduced.

### @experimental

```php
/**
 * @experimental feature:FEATURE_FLAG stableVersion:v6.8.0
 */
```

The `@experimental` annotation is used for newly introduced code, which is not yet released. This ensures that it will not be treated as a public API until the corresponding feature is released and makes it possible to change the code in any way until the final release. Always add the name of the corresponding feature flag to the annotation so that it will not be forgotten when the corresponding feature is released.
The `@experimental` annotation should be treated like the default `@internal` annotation.
The mentioned  `stableVersion` tag is used to hint when the feature is planned to be stable.

### BC-change attributes

```php
use Shopware\Core\Framework\Deprecation\BCChange\ReturnTypeNarrowing;

#[ReturnTypeNarrowing(version: 'v6.8.0', newType: 'static')]
public function assign(array $options): self
```

Planned changes to symbols that **stay** — signature changes, visibility changes, a class becoming final — are announced with attributes from the `Shopware\Core\Framework\Deprecation\BCChange` namespace instead of `@deprecated`. Each attribute states the version in which the change happens and carries the announced declaration as a machine-readable payload (types are referenced via `::class`), so IDEs, Rector, and other tooling can act on it.

Every attribute implements one or both of two marker interfaces that tell you whether your code is affected:

* `CallSiteCompatibilityChange` — affects code that **calls** the symbol.
* `ExtenderCompatibilityChange` — affects classes that **extend or override** the symbol.

Usage is validated by PHPStan: the announced change must be structurally possible (for example, referenced parameters must exist, an announced exception must not already be covered by the current `@throws` contract), extender-only changes must not be announced on final symbols, and changes whose legacy usage is detectable at runtime must trigger a conditional deprecation via `Feature::triggerDeprecationOrThrow()`. Stale attributes fail the build once the announced version is released.

See [Announced API changes](#announced-api-changes-bc-change-attributes) for every attribute and how to make your code compatible with the current and the next major version at the same time.

## Workflows

### Backward-compatible features

When developing new features, the goal should always be to do this in a backward compatible way. This ensures that the feature can be shipped with a minor release to provide value for customers as soon as possible. The following table should help you to use the correct approach for each type of change.

| Case                   | During development                                                                                                                                                                                                                                                                         | On feature release                                                                                                                                       | Next major release                              |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| 🚩 **Feature Flag**    | Hide code behind normal [feature flag](https://developer.shopware.com/docs/resources/references/adr/2020-08-10-feature-flag-system.html).                                                                                                                                                                                            | Remove the feature flag.                                                                                                                                 |                                                 |
| ➕ **New code**         | Add `@internal annotation` for new public API.                                                                                                                                                                                                                                             | Remove `@internal` annotation.                                                                                                                           |                                                 |
| ⚪ **Obsolete code**    | Add `@feature-deprecated` annotation.                                                                                                                                                                                                                                                      | Replace @feature-deprecated with normal `@deprecated` annotation.                                                                                        | Remove old code.                                |
| 🔴 **Breaking change** | Add `@major-deprecated` annotation. Hide breaking code behind additional major [feature flag](https://developer.shopware.com/docs/resources/references/adr/2020-08-10-feature-flag-system.html). Also, create a separate [changelog](https://developer.shopware.com/docs/resources/references/adr/2020-08-03-implement-new-changelog.html) for the change with the major flag. |                                                                                                                                                          | Remove old code. Remove the major feature flag. |
| 🔍 **Tests**           | Add new tests behind a feature flag.                                                                                                                                                                                                                                                       | Remove feature flags from new tests. Declare old tests as [legacy](https://symfony.com/doc/current/components/phpunit_bridge.html#mark-tests-as-legacy). | Remove legacy tests.                            |

You can also find more detailed information and code examples in the corresponding **[ADR](https://github.com/shopware/shopware/tree/trunk/adr)** for the deprecation strategy.

### Breaking Changes / Features

The first goal should always be to make your changes backward compatible. But there might be some special cases where it isn't possible in any way. In this case, the change can only be released with a major version. As we develop all changes in the same code base, the `trunk` branch, the changes have to stay behind a special feature flag, which is especially marked as a major feature flag.

| Case                    | During development                                                                                                                                           | Next major release (feature release) |
| ---                     | ---                                                                                                                                                          | ---                                  |
| 🚩 **Feature Flag**     | Hide code behind a major feature flag.                                                                                                                         | Remove major feature flag.           |
| ➕ **New code**         | Add `@internal` annotation for new public API.                                                                                                               | Remove `@internal` annotation.       |
| ⚪ **Obsolete code**    | Add `@major-deprecated` annotation.                                                                                                                          | Remove old code.                     |
| 🔴 **Breaking change**  | Add `@major-deprecated` annotation.                                                                                                                          | Remove old code.                     |
| 🔍 **Tests**            | Add new tests behind a major feature flag. Declare old tests as [legacy](https://symfony.com/doc/current/components/phpunit_bridge.html#mark-tests-as-legacy). | Remove legacy tests.                 |

## Announced API changes (BC-change attributes)

This section lists every BC-change attribute, who is affected, and how to write extension code **today** that keeps working after the announced change. The directional naming is deliberate: PHP's variance rules make one direction of every change safe to anticipate, so in almost all cases a single code path is compatible with the current *and* the next major version — no version checks needed.

| Attribute                 | Announces                                             | Affects                | Safe opt-in today                                                             |
|---------------------------|-------------------------------------------------------|------------------------|-------------------------------------------------------------------------------|
| `#[ReturnTypeNarrowing]`  | Return type becomes narrower                          | Extenders              | ✅ Declare the announced type in your override now                             |
| `#[ReturnTypeWidening]`   | Return type becomes wider                             | Call sites             | ✅ Handle the announced type now                                               |
| `#[ParameterTypeNarrowing]` | Parameter type becomes narrower                     | Call sites             | ✅ Pass only values of the announced type now                                  |
| `#[ParameterTypeWidening]` | Parameter type becomes wider                         | Extenders              | ✅ Declare the announced type in your override now                             |
| `#[NewOptionalParameter]` | A new optional parameter is added                     | Extenders              | ✅ Add the parameter to your override now                                      |
| `#[NewRequiredParameter]` | A new required parameter is added                     | Call sites & extenders | ✅ Pass the parameter now / add it (optional) to your override now             |
| `#[ParameterNameChange]`  | A parameter is renamed                                | Call sites (named args) | ✅ Use positional arguments now                                               |
| `#[ParameterRemoval]`     | An (optional) parameter is removed                    | Call sites             | ✅ Stop passing it now                                                         |
| `#[ExceptionChange]`      | The thrown exception types change                     | Call sites             | ✅ Catch the current and the announced exceptions now                          |
| `#[BecomesAbstract]`      | A method loses its default implementation             | Extenders              | ✅ Implement the method in your subclass now                                   |
| `#[BecomesFinal]`         | A class or method becomes final                       | Extenders              | ⚠️ Switch from inheritance to decoration/composition — works on both versions |
| `#[BecomesInternal]`      | A symbol becomes `@internal`                          | Call sites & extenders | ✅ Stop using it now                                                           |
| `#[VisibilityChange]`     | Visibility is reduced (e.g., public → protected)      | Call sites & extenders | ✅ Stop calling it from outside the announced scope now                        |
| `#[ClassHierarchyChange]` | The inheritance chain of a class changes              | Call sites & extenders | ⚠️ Depends on the change — stop relying on ancestors that go away             |

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

**Call sites**: Nothing to do — calling a final class or method is unaffected.

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

**Call sites**: Stop calling the method from outside the announced scope now — inline the logic or use the replacement named in the description. That code works on both versions.

**Extending classes**: Your override may keep its current visibility (PHP allows an override to be more visible than its parent), so the signature needs no change. But treat the method as having the announced visibility: do not rely on it being callable from outside, and do not build new public API on top of it.

#### ClassHierarchyChange

```php
#[ClassHierarchyChange(version: 'v6.8.0', description: 'Will no longer extend EntitySearchResult, but will keep extending Struct.')]
class ProductListingResult extends EntitySearchResult
```

**Call sites**: The required description states exactly what changes. Stop type-hinting or `instanceof`-checking against ancestors that leave the hierarchy — reference the class itself or an ancestor that stays. That code works on both versions.

**Extending classes**: The same applies to your subclass, plus one more thing: methods and properties your subclass inherits *through* a leaving ancestor disappear with it. Stop using them, or implement them yourself — both work on both versions.

## Compatibility sheet

To ensure backward compatibility, it is important to know what you are allowed to do and what not. The following sheet should give you an orientation on common changes and how they could affect the backward compatibility. Although a lot of effort went into this list, it is not guaranteed to be 100% complete. Always keep the persona of third-party developers in mind and challenge your changes against external needs.

### PHP

As Shopware is based on the PHP framework Symfony, we also have to make sure to use the rules which the framework follows. Besides the list below, always keep in mind the backward compatibility promise and implement your changes in a way the promise is kept.

**[Symfony Backward Compatibility Promise](https://symfony.com/doc/current/contributing/code/bc.html)**

| Use Case                                                                                                      | Allowed?   | Notes / Alternatives                                                                                                                                                                                                           |
| ---                                                                                                           | ---        | ---                                                                                                                                                                                                                            |
| Change the typehint of a class, interface or trait.                                                           | 🔴 NO      | Add the new typehint as an abstract class. <br>Code Example: [Extend class with abstract class](#extend-class-with-abstract-class)                                                                                             |
| Change the constructor of a service.                                                                          | ✅ YES     | Services have to be instantiated over the container, so the changes should not break anything.                                                                                                                                 |
| Change the constructor of a class, that is not a service. (Instantiated with new Class())                     | ⚪ PARTIAL | Only optional arguments are allowed to be added and this should be made via `func_get_args()`. Announce the parameter with `#[NewOptionalParameter]` or `#[NewRequiredParameter]`. <br> Code Example: [Add an argument](#add-an-argument)                                                                            |
| Change the arguments of a public method.                                                                      | ⚪ PARTIAL | Only optional arguments are allowed to be added and this should be made via `func_get_args()`. Announce the parameter with `#[NewOptionalParameter]` or `#[NewRequiredParameter]`. <br>Code Example: [Add an argument](#add-an-argument)                                                                             |
| Change the arguments of a protected method.                                                                   | ⚪ PARTIAL | Only optional arguments are allowed to be added and this should be made via `func_get_args()`. Announce the parameter with `#[NewOptionalParameter]` or `#[NewRequiredParameter]`. <br>Code Example: [Add an argument](#add-an-argument)                                                                             |
| Change the arguments of a private method.                                                                     | ✅ YES     |                                                                                                                                                                                                                                |
| Change the return the type of a method.                                                                       | ⚪ PARTIAL | Announce it with `#[ReturnTypeNarrowing]` / `#[ReturnTypeWidening]` and apply the change in the next major version. For changes that are neither a narrowing nor a widening, create a new method and deprecate the old one.       |
| Change the value of a public constant.                                                                        | 🔴 NO      | You should add a new constant. Annotate the old constant as deprecated and remove it in the next major version.                                                                                                                |
| Change the value of a private constant.                                                                       | ✅ YES     | Check all potential usages of the constant. Maybe it is used somewhere to be stored in the database. In that case, you must write a migration for it which ensures every use of the constant in a db-value is updated as well. |
| Change a class or method to final.                                                                            | 🔴 NO      | Announce it with `#[BecomesFinal]` and apply the change in the next major version.                                                                                                                                             |
| Change the visibility of a class, method or property from public to private/protected or protected to private | 🔴 NO      | Announce it with `#[VisibilityChange]` and change the visibility in the next major version.                                                                                                                                    |
| Change the namespace of a class.                                                                              | 🔴 NO      | Duplicate the class and mark the old one as deprecated.                                                                                                                                                                        |
| Change static state (remove static or delete static keyword).                                                 | 🔴 NO      | Annotate it as deprecated and add or remove the static keyword in the next major version.                                                                                                                                      |
| Add parameter to interface or abstract class function.                                                        | ⚪ PARTIAL | Only optional arguments are allowed to be added and this should be made via `func_get_args()`. Announce the parameter with `#[NewOptionalParameter]` or `#[NewRequiredParameter]`. <br> Code Example: [Add an argument](#add-an-argument)                                                                            |
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

### Feature Flags

Feature flags itself, mainly the name and existence of the feature flag itself, are part of the backward compatibility promise.
Which means feature flags won't be removed in a minor version and will be deprecated instead.

However, the behavior behind the feature flag might change at any time, this might include the complete removal of the feature behind the flag, or the use of a new flag to toggle the behaviour.
In these cases the old feature flag will still be registered, so checks for that feature flag won't throw any error, but the feature flag itself will do nothing.

This allows for easier compatibility across different versions in plugins, as the feature flag checks can stay in the plugin code.
All changes to the functionality behind the feature flag will be documented in the release notes.

## Code Examples

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
