---
nav:
  title: Extension vs Events
  position: 50

---

# Extension vs Events

## Overview

Shopware 6 provides two different mechanisms for extending functionality: **Extensions** and **Events**. While they may seem similar, they serve different purposes and have distinct characteristics. Understanding when to use each approach is crucial for effective plugin development.

## Key Differences

### Purpose and Design Philosophy

#### Extensions

- **Purpose**: Replace or extend core functionality
- **Design**: Result-oriented, flow-controlling
- **Philosophy**: "I want to change how this works"

#### Events

- **Purpose**: Notify about actions that occurred
- **Design**: Notification-based, fire-and-forget
- **Philosophy**: "I want to know when this happens"

### Return Values and Flow Control

#### Extensions

```php
public function onResolveListing(ResolveListingExtension $event): void
{
    // Can return a result that replaces the default behavior
    $event->result = $this->customProductLoader->load($event->criteria, $event->context);
    
    // Can stop the default implementation
    $event->stopPropagation();
}
```

#### Events

```php
public function onProductCreated(ProductCreatedEvent $event): void
{
    // Cannot return values or control flow
    // Can only perform side effects
    $this->logger->info('Product created: ' . $event->getProduct()->getName());
    $this->notificationService->sendNotification($event->getProduct());
}
```

### Execution Timing

#### Extensions

- **Timing**: Before or during the action
- **Purpose**: Intercept and modify the process
- **Example**: Before product prices are calculated

#### Events

- **Timing**: After the action is completed
- **Purpose**: React to completed actions
- **Example**: After a product has been created

### Error Handling

#### Extensions

```php
// Built-in error handling with recovery
try {
    $extension->result = $function(...$extension->getParams());
} catch (\Throwable $e) {
    $extension->exception = $e;
    $extension->resetPropagation();
    
    // Dispatch error event for recovery
    $this->dispatcher->dispatch($extension, self::error($name));
    
    // If no recovery, rethrow
    if ($extension->result === null) {
        throw $e;
    }
}
```

#### Events

```php
// Basic error handling
public function onProductCreated(ProductCreatedEvent $event): void
{
    try {
        $this->performSideEffect($event);
    } catch (\Exception $e) {
        // Error handling is up to the developer
        $this->logger->error('Failed to process product creation', ['error' => $e->getMessage()]);
    }
}
```

## When to Use Extensions

Use Extensions when you need to:

### 1. Replace Core Functionality

```php
// Replace default product loading with custom logic
public function onResolveListing(ResolveListingExtension $event): void
{
    $event->result = $this->externalProductService->loadProducts($event->criteria);
    $event->stopPropagation();
}
```

### 2. Modify Data Before Processing

```php
// Filter products before they're displayed
public function onProductListing(ProductListingExtension $event): void
{
    $filteredProducts = $this->filterProducts($event->products, $event->context);
    $event->result = $filteredProducts;
    $event->stopPropagation();
}
```

### 3. Integrate External Systems

```php
// Use external pricing service
public function onPriceCalculation(ProductPriceCalculationExtension $event): void
{
    $prices = $this->externalPricingService->calculatePrices($event->products);
    $event->result = $prices;
    $event->stopPropagation();
}
```

### 4. Add Conditional Business Logic

```php
// Apply special pricing for VIP customers
public function onPriceCalculation(ProductPriceCalculationExtension $event): void
{
    if ($this->isVipCustomer($event->context)) {
        $event->result = $this->applyVipPricing($event->products);
        $event->stopPropagation();
    }
}
```

## When to Use Events

Use Events when you need to:

### 1. Send Notifications

```php
public function onOrderPlaced(OrderPlacedEvent $event): void
{
    $this->emailService->sendOrderConfirmation($event->getOrder());
    $this->smsService->sendOrderNotification($event->getOrder());
}
```

### 2. Log Actions

```php
public function onProductCreated(ProductCreatedEvent $event): void
{
    $this->auditLogger->log('Product created', [
        'productId' => $event->getProduct()->getId(),
        'userId' => $event->getContext()->getUserId()
    ]);
}
```

### 3. Update External Systems

```php
public function onCustomerRegistered(CustomerRegisteredEvent $event): void
{
    $this->crmService->syncCustomer($event->getCustomer());
    $this->analyticsService->trackRegistration($event->getCustomer());
}
```

### 4. Trigger Follow-up Actions

```php
public function onOrderCompleted(OrderCompletedEvent $event): void
{
    $this->inventoryService->reserveStock($event->getOrder());
    $this->shippingService->schedulePickup($event->getOrder());
}
```

## Comparison Table

| Aspect                     | Extensions                    | Events               |
|----------------------------|-------------------------------|----------------------|
| **Purpose**                | Replace/Extend functionality  | Notify about actions |
| **Return Values**          | Yes (via `result` property)   | No                   |
| **Flow Control**           | Yes (via `stopPropagation()`) | No                   |
| **Error Handling**         | Advanced with recovery        | Basic                |
| **Timing**                 | Pre/during action             | Post-action          |
| **Use Case**               | Core functionality            | Side effects         |
| **Performance Impact**     | Can be significant            | Usually minimal      |
| **Complexity**             | Higher                        | Lower                |
| **Backward Compatibility** | Easier to maintain            | More complex         |

## Real-World Examples

### E-commerce Scenarios

#### Product Pricing (Extension)

```php
// Replace default pricing with dynamic pricing from external API
public function onPriceCalculation(ProductPriceCalculationExtension $event): void
{
    $dynamicPrices = $this->pricingApi->getPrices($event->products, $event->context);
    $event->result = $dynamicPrices;
    $event->stopPropagation();
}
```

#### Order Notification (Event)

```php
// Send notifications after an order is placed
public function onOrderPlaced(OrderPlacedEvent $event): void
{
    $this->emailService->sendOrderConfirmation($event->getOrder());
    $this->slackService->notifyTeam($event->getOrder());
}
```

#### Product Search (Extension)

```php
// Replace default search with AI-powered search
public function onProductSearch(ProductSearchExtension $event): void
{
    $aiResults = $this->aiSearchService->search($event->query, $event->context);
    $event->result = $aiResults;
    $event->stopPropagation();
}
```

#### Inventory Update (Event)

```php
// Update an external inventory system after a product update
public function onProductUpdated(ProductUpdatedEvent $event): void
{
    $this->inventoryService->syncProduct($event->getProduct());
}
```

## Migration from Events to Extensions

If you're currently using Events for functionality replacement, consider migrating to Extensions:

### Before (Event-based)

```php
// Old approach - using events for functionality replacement
public function onProductListingCriteria(ProductListingCriteriaEvent $event): void
{
    // Modify criteria
    $event->getCriteria()->addFilter(new EqualsFilter('active', true));
}

public function onProductLoaded(ProductLoadedEvent $event): void
{
    // Post-process products
    foreach ($event->getProducts() as $product) {
        $product->addExtension('customData', $this->getCustomData($product));
    }
}
```

### After (Extension-based)

```php
// New approach - using extensions for functionality replacement
public function onResolveListing(ResolveListingExtension $event): void
{
    // Replace entire listing resolution
    $event->result = $this->customListingService->resolve($event->criteria, $event->context);
    $event->stopPropagation();
}
```

## Best Practices

### For Extensions

1. **Use sparingly**: Only when you need to replace core functionality
2. **Handle errors gracefully**: Provide fallback implementations
3. **Document thoroughly**: Extensions are part of the public API
4. **Test extensively**: Extensions can break core functionality
5. **Consider performance**: Extensions can impact performance significantly

### For Events

1. **Keep side effects minimal**: Don't perform heavy operations
2. **Handle errors gracefully**: Don't let event failures break the main flow
3. **Use async processing**: For heavy operations, use message queues
4. **Document side effects**: Make it clear what the event does
5. **Test in isolation**: Events should be testable independently
