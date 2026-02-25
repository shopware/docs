---
nav:
  title: Extensibility - Events, Messages, and Extensions
  position: 10

---

# Extensibility - Events, Messages, and Extensions

This guide explains how external developers can extend Individual Pricing functionality by subscribing to events, handling messages, and using extension points.

## Overview

Individual Pricing provides three main extensibility mechanisms:

1. **Extensions** - Hook into specific moments during pricing application to add custom logic
2. **Events** - Subscribe to events for custom validation, filtering, or side effects
3. **Messages** - Handle asynchronous indexing messages for custom cache management

## Extensions

Extensions allow you to hook into specific moments during the pricing workflow. They use Shopware's Extension API.

### Available Extensions

| Name                              | Description                                                | Purpose                                                                     | Available Data                                                 |
|-----------------------------------|------------------------------------------------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------|
| `IndividualPricingApplyExtension` | Intercepts when individual pricing is applied to a product | Validation, conditional prevention, modifications, logging, or side effects | Product entity, computed pricing entity, sales channel context |

### Extension Details

#### IndividualPricingApplyExtension

**Namespace**: `Shopware\Commercial\B2B\IndividualPricing\Extension\IndividualPricingApplyExtension`

**Extension Name**: `individual_pricing.apply`

**Properties**:

- `product` (ProductEntity) - The product to which pricing is being applied
- `individualPricing` (IndividualPricingComputedCacheEntity) - The resolved individual pricing being applied
- `context` (SalesChannelContext) - Current customer/sales-channel context

**Use Cases**:

- Log pricing changes for auditing
- Validate pricing before application
- Trigger external systems when prices change
- Add custom data to products based on pricing

## Events

Events allow you to subscribe to specific moments in the pricing workflow and modify behavior.

### Available Events

| Name                                        | Description                                                    | Purpose                                               | When Dispatched                             |
|---------------------------------------------|----------------------------------------------------------------|-------------------------------------------------------|---------------------------------------------|
| `IndividualPricingIndexerEvent`             | Dispatched with individual pricing IDs that need to be indexed | React to indexing requests, invalidate related caches | When individual pricing rules need indexing |
| `IndividualPricingLookupCriteriaEvent`      | Modify criteria for single product pricing lookup              | Add custom filters/conditions to pricing resolution   | Before querying cache for single product    |
| `IndividualPricingLookupBatchCriteriaEvent` | Modify criteria for batch product pricing lookup               | Add custom filters/conditions for multiple products   | Before querying cache for product batch     |

### Event Details

#### IndividualPricingIndexerEvent

**Namespace**: `Shopware\Commercial\B2B\IndividualPricing\Event\IndividualPricingIndexerEvent`

**Properties**:

- `ids` Individual pricing IDs that need to be indexed
- `context` (Context) - Current context
- `skip` List of actions to be skipped during indexing

**Use Cases**:

- React to indexing requests for specific pricing rules
- Invalidate custom caches before/during pricing indexing
- Trigger external API updates
- Log indexing activities

#### IndividualPricingLookupCriteriaEvent

**Namespace**: `Shopware\Commercial\B2B\IndividualPricing\Event\IndividualPricingLookupCriteriaEvent`

**Properties**:

- `criteria` (Criteria) - Mutable criteria for cache lookup
- `productId` (string) - Product ID being looked up
- `audience` (AudienceContext) - Customer's audience context
- `applicableRuleIds` Rules that could apply
- `context` (Context) - Current context

**Use Cases**:

- Add custom filters to pricing resolution
- Modify sorting or limits
- Add associations for additional data

#### IndividualPricingLookupBatchCriteriaEvent

**Namespace**: `Shopware\Commercial\B2B\IndividualPricing\Event\IndividualPricingLookupBatchCriteriaEvent`

**Properties**:

- `criteria` (Criteria) - Mutable criteria for cache lookup
- `productIds` Product IDs being looked up
- `audience` (AudienceContext) - Customer's audience context
- `applicableRuleIds` Rules that could apply
- `context` (Context) - Current context

**Use Cases**:

- Apply batch-specific filtering logic
- Optimize queries for bulk operations
- Add custom aggregations

## Messages

Messages are dispatched to the message bus for asynchronous processing. They handle indexing operations.

### Available Messages

| Name                                           | Description                                          | Purpose                                   | When Dispatched                      |
|------------------------------------------------|------------------------------------------------------|-------------------------------------------|--------------------------------------|
| `IndividualPricingCacheEntryUpdaterMessage`    | Handles rule-level cache rebuilding                  | Process custom logic when rules change    | Rule create/update/delete operations |
| `IndividualPricingBuildCacheSingleRuleMessage` | Handles cache building when indexing a specific rule | Process custom logic during rule indexing | When indexing a single pricing rule  |

### Message Details

#### IndividualPricingCacheEntryUpdaterMessage

**Namespace**: `Shopware\Commercial\B2B\IndividualPricing\Domain\Indexer\IndividualPricingCacheEntryUpdaterMessage`

**Properties** (inherits from `EntityIndexingMessage`):

- `data` Individual pricing IDs to be indexed
- `offset` Pagination offset for batch processing
- `context` (Context) - Current context
- `skip` List of indexers to skip during processing
- `forceQueue` (bool) - Whether to force using the message queue
- `isFullIndexing` (bool) - Whether this is full indexing

**Purpose**: Handles cache rebuilding when specific pricing rules are created, updated, or deleted

**Use Cases**:

- Invalidate downstream caches when rules change
- Trigger partial updates in external systems
- Track rule-level changes for auditing
- Synchronize external pricing systems with rule modifications

#### IndividualPricingBuildCacheSingleRuleMessage

**Namespace**: `Shopware\Commercial\B2B\IndividualPricing\Domain\Indexer\IndividualPricingBuildCacheSingleRuleMessage`

**Properties**:

- `productIds` Product IDs to build cache for
- `ruleId` (string) - The pricing rule ID being indexed
- `context` (Context) - Current context

**Purpose**: Handles cache building when indexing a single pricing rule

**Use Cases**:

- React to individual rule indexing operations
- Fine-grained cache control per rule
- Detailed logging and monitoring of rule indexing
- Trigger external integrations when specific rules are indexed

## Examples

### Example 1: Using IndividualPricingApplyExtension

Hook into the extension to log pricing changes:

```php
<?php declare(strict_types=1);

namespace MyPlugin\Subscriber;

use Shopware\Commercial\B2B\IndividualPricing\Extension\IndividualPricingApplyExtension;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Psr\Log\LoggerInterface;

class IndividualPricingLogger implements EventSubscriberInterface
{
    public function __construct(
        private readonly LoggerInterface $logger
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            IndividualPricingApplyExtension::NAME => 'onPricingApply',
        ];
    }

    public function onPricingApply(IndividualPricingApplyExtension $extension): void
    {
        $this->logger->info('Individual pricing applied', [
            'product_id' => $extension->product->getId(),
            'product_number' => $extension->product->getProductNumber(),
            'rule_id' => $extension->individualPricing->getIndividualPricingId(),
            'customer_id' => $extension->context->getCustomer()?->getId(),
        ]);
    }
}
```
