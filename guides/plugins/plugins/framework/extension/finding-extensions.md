---
nav:
  title: Finding Extensions
  position: 20

---

# Finding Extensions

## Overview

Shopware 6 provides a modern extension system that allows you to intercept and modify core functionality. Unlike traditional events that are primarily for notifications, Extensions are designed for **replacing and extending** core system processes.

This guide will cover how you can find available Extensions in the Shopware codebase to use them in your plugin.

## Extension Classes

Extensions in Shopware extend the base `Extension` class and are typically located in domain-specific directories. They follow a consistent naming pattern and structure.

### Finding Extension Classes

You can find Extension classes by searching for the following patterns in the Shopware source code:

#### Search Terms
- `extends Extension`: Find all Extension classes
- `Extension<`: Find typed Extensions with specific return types
- `ExtensionDispatcher`: Find where Extensions are dispatched

#### Common Locations

Extensions are typically located in:

- `src/Core/Content/*/Extension/`
- `src/Core/Checkout/*/Extension/`
- `src/Core/Content/Cms/Extension/`
- `src/Core/Content/Product/Extension/`

### Example Extension Classes

Here are some common Extension classes you might encounter:

#### Product Extensions
```php
// Product price calculation
src/Core/Content/Product/Extension/ProductPriceCalculationExtension.php

// Product listing resolution
src/Core/Content/Product/Extension/ResolveListingExtension.php

// Product listing criteria modification
src/Core/Content/Product/Extension/ProductListingCriteriaExtension.php
```

#### Cart Extensions
```php
// Checkout place order
src/Core/Checkout/Cart/Extension/CheckoutPlaceOrderExtension.php

// Cart rule loading
src/Core/Checkout/Cart/Extension/CheckoutCartRuleLoaderExtension.php
```

#### CMS Extensions
```php
// CMS slots data enrichment
src/Core/Content/Cms/Extension/CmsSlotsDataEnrichExtension.php

// CMS slots data resolution
src/Core/Content/Cms/Extension/CmsSlotsDataResolveExtension.php
```

## Extension Naming Convention

Extensions follow a consistent naming pattern:

### Event Names
Extensions use a `NAME` constant that defines the event name:

```php
final class ResolveListingExtension extends Extension
{
    public const NAME = 'listing-loader.resolve';
    
    // ...
}
```

### Event Lifecycle
Extensions are dispatched with lifecycle suffixes:
- `{name}.pre` - Before the default implementation
- `{name}.post` - After the default implementation  
- `{name}.error` - When an error occurs

## Finding Extension Usage

### In Service Definitions

Services that use Extensions typically inject the `ExtensionDispatcher`:

```xml
<service id="Some\Service">
    <argument type="service" id="Shopware\Core\Framework\Extensions\ExtensionDispatcher"/>
</service>
```

### In Constructor Parameters

Look for services that inject the `ExtensionDispatcher`:

```php
public function __construct(
    private readonly ExtensionDispatcher $extensionDispatcher
) {
}
```

### Extension Dispatch Pattern

Extensions are typically dispatched using this pattern:

```php
$extension = new SomeExtension($parameters);
$result = $this->extensionDispatcher->publish(
    SomeExtension::NAME,
    $extension,
    function() use ($parameters) {
        // Default implementation
        return $this->defaultImplementation($parameters);
    }
);
```

## Common Extension Types

### Product Extensions

#### ProductPriceCalculationExtension
**Purpose**: Intercept and modify product price calculations
**Event Name**: `product.calculate-prices`
**Return Type**: `void`

```php
final class ProductPriceCalculationExtension extends Extension
{
    public const NAME = 'product.calculate-prices';
    
    public function __construct(
        public readonly iterable $products,
        public readonly SalesChannelContext $context
    ) {}
}
```

#### ResolveListingExtension
**Purpose**: Replace product listing resolution logic
**Event Name**: `listing-loader.resolve`
**Return Type**: `EntitySearchResult<ProductCollection>`

```php
final class ResolveListingExtension extends Extension
{
    public const NAME = 'listing-loader.resolve';
    
    public function __construct(
        public readonly Criteria $criteria,
        public readonly SalesChannelContext $context
    ) {}
}
```

### Cart Extensions

#### CheckoutPlaceOrderExtension
**Purpose**: Intercept order placement process
**Event Name**: `checkout.place-order`
**Return Type**: `OrderPlaceResult`

```php
final class CheckoutPlaceOrderExtension extends Extension
{
    public const NAME = 'checkout.place-order';
    
    public function __construct(
        public readonly Cart $cart,
        public readonly SalesChannelContext $context
    ) {}
}
```

### CMS Extensions

#### CmsSlotsDataEnrichExtension
**Purpose**: Enrich CMS slot data before rendering
**Event Name**: `cms.slots.data-enrich`
**Return Type**: `CmsSlotCollection`

```php
final class CmsSlotsDataEnrichExtension extends Extension
{
    public const NAME = 'cms.slots.data-enrich';
    
    public function __construct(
        public readonly CmsSlotCollection $slots,
        public readonly SalesChannelContext $context
    ) {}
}
```

## Using Extensions in Your Plugin

### Event Subscriber

Create an event subscriber to listen for Extensions:

```php
<?php declare(strict_types=1);

namespace MyPlugin\Subscriber;

use Shopware\Core\Content\Product\Extension\ResolveListingExtension;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ProductListingSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            'listing-loader.resolve.pre' => 'onResolveListing',
        ];
    }
    
    public function onResolveListing(ResolveListingExtension $event): void
    {
        // Custom logic here
        $event->result = $this->customProductLoader->load($event->criteria, $event->context);
        $event->stopPropagation();
    }
}
```

### Service Registration

Register your subscriber in the service configuration:

```xml
<service id="MyPlugin\Subscriber\ProductListingSubscriber">
    <tag name="kernel.event_subscriber"/>
</service>
```

## Extension Lifecycle

Extensions follow a specific lifecycle:

1. **Pre-Event**: `{name}.pre` - Before default implementation
2. **Default Implementation**: Core logic (if not stopped)
3. **Post-Event**: `{name}.post` - After implementation
4. **Error-Event**: `{name}.error` - If an error occurs

### Lifecycle Example

```php
public function handleExtension(SomeExtension $event): void
{
    // This runs in the .pre phase
    if ($this->shouldReplaceDefault($event)) {
        $event->result = $this->customImplementation($event);
        $event->stopPropagation(); // Prevents default implementation
    }
}

public function handlePostExtension(SomeExtension $event): void
{
    // This runs in the .post phase
    $this->logger->info('Extension completed', ['result' => $event->result]);
}
```

## Best Practices

### 1. Use Type Hints
Always use proper type hints for Extension parameters:

```php
public function onResolveListing(ResolveListingExtension $event): void
{
    // Type-safe access to properties
    $criteria = $event->criteria;
    $context = $event->context;
}
```

### 2. Handle Results Properly
Check if a result has already been set:

```php
public function onExtension(SomeExtension $event): void
{
    if ($event->result !== null) {
        // Another extension already provided a result
        return;
    }
    
    $event->result = $this->myImplementation($event);
}
```

### 3. Use Stop Propagation Wisely
Only stop propagation when you're providing a complete replacement:

```php
public function onExtension(SomeExtension $event): void
{
    if ($this->shouldReplaceDefault($event)) {
        $event->result = $this->completeReplacement($event);
        $event->stopPropagation();
    }
    // If not stopped, default behavior continues
}
```

### 4. Error Handling
Extensions have built-in error handling, but you can also handle errors gracefully:

```php
public function onExtension(SomeExtension $event): void
{
    try {
        $event->result = $this->riskyOperation($event);
    } catch (\Exception $e) {
        // Log the error but don't stop the extension
        $this->logger->error('Extension failed', ['error' => $e->getMessage()]);
        // Let the extension system handle the error
    }
}
```

## Debugging Extensions

### Using the Symfony Profiler

The Symfony profiler shows all dispatched Extensions in the "Events" tab. Look for events with `.pre`, `.post`, or `.error` suffixes.

### Logging Extension Calls

You can log Extension calls to understand the flow:

```php
public function onExtension(SomeExtension $event): void
{
    $this->logger->debug('Extension called', [
        'extension' => get_class($event),
        'hasResult' => $event->result !== null,
        'stopped' => $event->isPropagationStopped()
    ]);
}
```

This comprehensive guide should help you find and use Extensions effectively in your Shopware plugins.
