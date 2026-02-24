---
nav:
  title: Individual Pricing
  position: 40

---

# Individual Pricing

Individual Pricing is a B2B component that enables merchants to define catalog-wide discounts and special pricing based on flexible conditions, specifically tailored for B2B scenarios.

::: info
This feature is available since Shopware 6.7.8.0
:::

## Basic idea

Individual Pricing allows merchants to create sophisticated pricing strategies for their B2B customers. Instead of manually managing prices for each product and customer combination, merchants can define pricing rules that automatically apply discounts or custom prices based on various conditions such as customer company, product tags, and purchase quantities.

This component is particularly powerful in B2B contexts where:

- Different companies negotiate different pricing agreements
- Volume-based pricing (tiered pricing) is common
- Specific customer segments receive special pricing
- Seasonal or time-limited promotions need to be managed centrally

## Key features

### Target-based pricing

Individual Pricing supports two target types:

- **Companies**: Apply pricing to specific companies or organization units or employees
- **Tags**: Apply pricing to customers or products with specific tags

### Volume pricing (Tiers)

Define quantity-based pricing tiers where prices decrease as purchase quantities increase. Each tier can have different prices across multiple currencies.

### Product filtering

Control which products the pricing applies to:

- Apply to all products in the catalog
- Use condition components to target specific product sets based on properties, categories, manufacturers, etc.

### Priority-based rule evaluation

When multiple pricing rules could apply, only rules at the highest priority level are evaluated. If multiple rules match at that level, the one that results in the lowest price for the customer is automatically selected. Lower priority rules are never considered.

### Validity periods

Set time-based validity for pricing rules with optional start and end dates, perfect for seasonal promotions or temporary pricing agreements.

### Strike-through pricing

Optionally display the original price with a strike-through effect to highlight the discount being applied to the customer.

## Requirements

- Employee Management component and Organization Unit component must be installed and activated (see [Employee Management](../employee-management/) and [Organization Unit](../organization-unit/))

## How it works

When a customer browses products or adds items to their cart:

1. The system identifies all active individual pricing rules that could apply based on the customer's context (company, tags)
2. Only rules at the highest priority level are considered
3. All rules at this priority level are evaluated together
4. Determine which products qualify for each rule
5. If multiple rules match, the one producing the lowest price is selected
6. If no rules match at the highest priority, standard catalog pricing is used
7. If volume pricing is configured, the appropriate tier is selected based on quantity
8. The calculated price is applied to the product, overriding the standard catalog price
9. If strike-through is enabled, the original price is preserved for display purposes

## Performance optimization

Individual Pricing uses a hybrid caching strategy: pre-computed cache entries for specific products (instant lookup) and runtime-evaluated entries if the rule is applied to all products. The cache is automatically maintained through background indexing and incremental updates.
x
This approach ensures fast pricing lookups even with thousands of products while keeping storage requirements minimal.

## Extensibility

Individual Pricing provides comprehensive extensibility through:

- **Extensions**: Hook into pricing application moments (e.g., `IndividualPricingApplyExtension`)
- **Events**: Subscribe to events for custom validation and filtering (e.g., `IndividualPricingLookupCriteriaEvent`)
- **Messages**: Handle asynchronous indexing operations (e.g., `IndividualPricingIndexingMessage`)

For detailed information on all available extensibility points, see [Extensibility - Events, Messages, and Extensions](guides/01-extensibility-events-messages.md).
