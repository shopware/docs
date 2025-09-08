---
nav:
  title: Creating Custom Extension Points
  position: 30

---

# Creating Custom Extension Points

## Overview

While Shopware provides many built-in extension points, you may need to create custom extension points for your specific use cases. This guide will walk you through creating custom extension points that follow Shopware's extension system patterns.

## Extension Class Structure

### Basic Extension Class

All extension points must extend the base `Extension` class and define a typed result:

```php
<?php declare(strict_types=1);

namespace MyPlugin\Extension;

use Shopware\Core\Framework\Extensions\Extension;
use Shopware\Core\Framework\Log\Package;

/**
 * @extends Extension<MyResultType>
 */
#[Package('my-plugin')]
final class MyCustomExtension extends Extension
{
    public const NAME = 'my-plugin.custom-extension';
    
    public function __construct(
        /**
         * @public
         * @description Input data for processing
         */
        public readonly array $inputData,
        
        /**
         * @public
         * @description Context for the operation
         */
        public readonly Context $context
    ) {
    }
}
```

### Key Components

1. **Generic Type**: `@extends Extension<ResultType>` defines the return type
2. **NAME Constant**: Unique identifier for the extension
3. **Public Properties**: Input parameters marked with `@public` for API documentation
4. **Package Attribute**: Identifies the package/plugin

## Example: Custom Product Filter Extension

Let's create a custom extension point for filtering products based on custom business logic:

### 1. Define the Extension Class

```php
<?php declare(strict_types=1);

namespace MyPlugin\Extension;

use Shopware\Core\Content\Product\ProductCollection;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\EntitySearchResult;
use Shopware\Core\Framework\Extensions\Extension;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

/**
 * @extends Extension<EntitySearchResult<ProductCollection>>
 */
#[Package('my-plugin')]
final class CustomProductFilterExtension extends Extension
{
    public const NAME = 'my-plugin.product-filter';
    
    public function __construct(
        /**
         * @public
         * @description The search criteria for products
         */
        public readonly Criteria $criteria,
        
        /**
         * @public
         * @description The sales channel context
         */
        public readonly SalesChannelContext $context,
        
        /**
         * @public
         * @description Custom filter parameters
         */
        public readonly array $filterParams
    ) {
    }
}
```

### 2. Create the Service that Dispatches the Extension

```php
<?php declare(strict_types=1);

namespace MyPlugin\Service;

use MyPlugin\Extension\CustomProductFilterExtension;
use Shopware\Core\Content\Product\ProductCollection;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\EntitySearchResult;
use Shopware\Core\Framework\Extensions\ExtensionDispatcher;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

#[Package('my-plugin')]
class CustomProductService
{
    public function __construct(
        private readonly ExtensionDispatcher $extensionDispatcher,
        private readonly EntityRepository $productRepository
    ) {
    }
    
    public function filterProducts(
        Criteria $criteria,
        SalesChannelContext $context,
        array $filterParams = []
    ): EntitySearchResult {
        $extension = new CustomProductFilterExtension(
            $criteria,
            $context,
            $filterParams
        );
        
        return $this->extensionDispatcher->publish(
            CustomProductFilterExtension::NAME,
            $extension,
            function() use ($criteria, $context) {
                // Default implementation
                return $this->productRepository->search($criteria, $context->getContext());
            }
        );
    }
}
```

### 3. Create an Event Subscriber

```php
<?php declare(strict_types=1);

namespace MyPlugin\Subscriber;

use MyPlugin\Extension\CustomProductFilterExtension;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CustomProductFilterSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ExternalApiService $apiService,
        private readonly ProductFilterService $filterService
    ) {
    }
    
    public static function getSubscribedEvents(): array
    {
        return [
            'my-plugin.product-filter.pre' => 'onProductFilter',
        ];
    }
    
    public function onProductFilter(CustomProductFilterExtension $event): void
    {
        // Check if we should apply custom filtering
        if (!$this->shouldApplyCustomFilter($event->filterParams)) {
            return;
        }
        
        // Get filtered product IDs from external API
        $filteredIds = $this->apiService->getFilteredProductIds(
            $event->criteria,
            $event->context,
            $event->filterParams
        );
        
        if (empty($filteredIds)) {
            // No products match the filter
            $event->result = new EntitySearchResult(
                'product',
                0,
                new ProductCollection(),
                null,
                $event->criteria,
                $event->context->getContext()
            );
            $event->stopPropagation();
            return;
        }
        
        // Create new criteria with filtered IDs
        $newCriteria = clone $event->criteria;
        $newCriteria->setIds($filteredIds);
        
        // Apply additional filtering
        $filteredProducts = $this->filterService->applyBusinessRules(
            $newCriteria,
            $event->context
        );
        
        $event->result = $filteredProducts;
        $event->stopPropagation();
    }
    
    private function shouldApplyCustomFilter(array $filterParams): bool
    {
        return isset($filterParams['custom_filter']) && $filterParams['custom_filter'] === true;
    }
}
```

### 4. Register Services

```xml
<!-- services.xml -->
<service id="MyPlugin\Service\CustomProductService">
    <argument type="service" id="Shopware\Core\Framework\Extensions\ExtensionDispatcher"/>
    <argument type="service" id="product.repository"/>
</service>

<service id="MyPlugin\Subscriber\CustomProductFilterSubscriber">
    <argument type="service" id="MyPlugin\Service\ExternalApiService"/>
    <argument type="service" id="MyPlugin\Service\ProductFilterService"/>
    <tag name="kernel.event_subscriber"/>
</service>
```

## Advanced Extension Patterns

### 1. Conditional Extension Execution

```php
public function onExtension(MyExtension $event): void
{
    // Only execute under certain conditions
    if (!$this->shouldExecute($event)) {
        return;
    }
    
    $event->result = $this->customImplementation($event);
    $event->stopPropagation();
}

private function shouldExecute(MyExtension $event): bool
{
    return $event->context->getSalesChannelId() === 'special-sales-channel';
}
```

### 2. Extension with Error Handling

```php
public function onExtension(MyExtension $event): void
{
    try {
        $event->result = $this->riskyOperation($event);
        $event->stopPropagation();
    } catch (\Exception $e) {
        // Log the error but don't stop the extension
        $this->logger->error('Custom extension failed', [
            'error' => $e->getMessage(),
            'extension' => get_class($event)
        ]);
        
        // The extension system will handle the error
        // and potentially dispatch error events
    }
}
```

### 3. Extension with Data Enrichment

```php
public function onExtension(MyExtension $event): void
{
    // Don't replace the result, just enrich it
    if ($event->result !== null) {
        $enrichedResult = $this->enrichResult($event->result, $event);
        $event->result = $enrichedResult;
    }
}

private function enrichResult($result, MyExtension $event)
{
    // Add custom data to the result
    $result->addExtension('customData', new CustomStruct([
        'processedAt' => new \DateTime(),
        'context' => $event->context->getSalesChannelId()
    ]));
    
    return $result;
}
```

### 4. Multi-Phase Extension

```php
public static function getSubscribedEvents(): array
{
    return [
        'my-extension.pre' => 'onPrePhase',
        'my-extension.post' => 'onPostPhase',
        'my-extension.error' => 'onErrorPhase',
    ];
}

public function onPrePhase(MyExtension $event): void
{
    // Prepare data before default implementation
    $event->addExtension('preparedData', $this->prepareData($event));
}

public function onPostPhase(MyExtension $event): void
{
    // Process result after default implementation
    if ($event->result !== null) {
        $event->result = $this->postProcess($event->result, $event);
    }
}

public function onErrorPhase(MyExtension $event): void
{
    // Handle errors gracefully
    if ($event->exception !== null) {
        $event->result = $this->fallbackImplementation($event);
    }
}
```

## Extension Lifecycle Management

### Pre-Phase Extensions

Use `.pre` events to:

- Validate input data
- Modify criteria or parameters
- Replace default implementation entirely

### Post-Phase Extensions

Use `.post` events to:

- Enrich results
- Log completion
- Trigger follow-up actions

### Error-Phase Extensions

Use `.error` events to:

- Provide fallback implementations
- Log errors
- Recover from failures

## Best Practices

### 1. Naming Conventions

- Use descriptive, domain-specific names
- Follow the pattern: `{plugin}.{domain}.{action}`
- Use kebab-case for event names

### 2. Type Safety

- Always define generic types for extension points
- Use proper type hints for parameters
- Validate input data in constructors

### 3. Documentation

- Document all public properties with `@public` and `@description`
- Provide clear examples in docblocks
- Include usage examples in plugin documentation

### 4. Error Handling

- Use try-catch blocks for risky operations
- Provide meaningful error messages
- Consider fallback implementations

### 5. Performance

- Avoid expensive operations in Extensions
- Cache results when appropriate
- Use lazy loading for heavy dependencies

### 6. Testing

- Write unit tests for extension point classes
- Test event subscribers thoroughly
- Mock external dependencies

## Example: Complete Plugin with Custom Extension Point

Here's a complete example of a plugin that creates and uses a custom extension point:

```php
// 1. Extension class
final class ProductRecommendationExtension extends Extension
{
    public const NAME = 'my-plugin.product-recommendation';
    
    public function __construct(
        public readonly ProductEntity $product,
        public readonly SalesChannelContext $context,
        public readonly int $limit = 5
    ) {}
}

// 2. Service that uses the extension
class ProductRecommendationService
{
    public function getRecommendations(ProductEntity $product, SalesChannelContext $context): ProductCollection
    {
        $extension = new ProductRecommendationExtension($product, $context);
        
        return $this->extensionDispatcher->publish(
            ProductRecommendationExtension::NAME,
            $extension,
            function() use ($product, $context) {
                // Default recommendation logic
                return $this->getDefaultRecommendations($product, $context);
            }
        );
    }
}

// 3. Subscriber that provides custom logic
class ProductRecommendationSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            'my-plugin.product-recommendation.pre' => 'onGetRecommendations',
        ];
    }
    
    public function onGetRecommendations(ProductRecommendationExtension $event): void
    {
        // Custom AI-powered recommendations
        $recommendations = $this->aiService->getRecommendations(
            $event->product,
            $event->context,
            $event->limit
        );
        
        $event->result = $recommendations;
        $event->stopPropagation();
    }
}
```

This comprehensive guide should help you create custom extension points that integrate seamlessly with Shopware's extension system.
