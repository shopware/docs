---
nav:
  title: Examples
  position: 50

---

# Examples

Step-by-step workflows showing how the built-in tools and resources work together. Each section shows the sequence of tool calls an AI agent would make for a common task.

## Exploring the data model

**Discover all entity names:**
Read the `shopware://entities` resource with no tool call needed.

**Understand an entity's fields and associations:**

::: code-group

```json [Tool: shopware-entity-schema]
{"entity": "product"}
```

:::

Use the schema result to understand which fields and association names are valid before building search criteria.

## Searching for products

**Simple term search:**

::: code-group

```json [Tool: shopware-entity-search]
{"entity": "product", "term": "shirt", "limit": 5}
```

:::

**Filter with criteria JSON for active products with stock above 10, sorted by name:**

::: code-group

```json [Tool: shopware-entity-search]
{
    "entity": "product",
    "criteria": "{\"filter\": [{\"type\": \"multi\", \"operator\": \"AND\", \"queries\": [{\"type\": \"equals\", \"field\": \"active\", \"value\": true}, {\"type\": \"range\", \"field\": \"stock\", \"parameters\": {\"gte\": 10}}]}], \"sort\": [{\"field\": \"name\", \"order\": \"ASC\"}]}"
}
```

:::

**Paginate through results:**

::: code-group

```json [Tool: shopware-entity-search]
{"entity": "product", "limit": 10, "page": 3}
```

:::

Continue incrementing `page` until `page * limit >= _meta.total`.

**Select specific fields with explicit includes:**

::: code-group

```json [Tool: shopware-entity-search]
{
    "entity": "product",
    "criteria": "{\"includes\": {\"product\": [\"id\", \"name\", \"productNumber\", \"stock\"], \"product_manufacturer\": [\"id\", \"name\"]}, \"associations\": {\"manufacturer\": {}}}"
}
```

:::

## Working with orders

**Recent orders with line items and transactions:**

::: code-group

```json [Tool: shopware-entity-search]
{
    "entity": "order",
    "criteria": "{\"sort\": [{\"field\": \"createdAt\", \"order\": \"DESC\"}], \"limit\": 5, \"associations\": {\"lineItems\": {}, \"transactions\": {}}}"
}
```

:::

**Preview shipping a delivery:**

::: code-group

```json [Tool: shopware-order-state]
{"orderNumber": "10001", "deliveryAction": "ship", "dryRun": true}
```

:::

**Execute the shipment:**

::: code-group

```json [Tool: shopware-order-state]
{"orderNumber": "10001", "deliveryAction": "ship", "dryRun": false}
```

:::

**Preview full cancellation (order + transaction + delivery):**

::: code-group

```json [Tool: shopware-order-state]
{"orderNumber": "10001", "orderAction": "cancel", "transactionAction": "cancel", "deliveryAction": "cancel", "dryRun": true}
```

:::

**Cancel order and refund paid transaction:**

::: code-group

```json [Tool: shopware-order-state]
{"orderNumber": "10001", "orderAction": "cancel", "transactionAction": "refund", "deliveryAction": "cancel", "dryRun": false}
```

:::

Read `shopware://state-machines` first to see valid actions for each state machine state.

## System configuration

**Read all listing settings:**

::: code-group

```json [Tool: shopware-system-config-read]
{"key": "core.listing"}
```

:::

**Preview a config change:**

::: code-group

```json [Tool: shopware-system-config-write]
{"key": "core.listing.defaultSorting", "value": "\"price-asc\"", "dryRun": true}
```

:::

**Apply the change:**

::: code-group

```json [Tool: shopware-system-config-write]
{"key": "core.listing.defaultSorting", "value": "\"price-asc\"", "dryRun": false}
```

:::

## Creating and updating entities

**Create a product (preview first):**

::: code-group

```json [Tool: shopware-entity-upsert]
{
    "entity": "product",
    "payload": "{\"name\": \"New Product\", \"productNumber\": \"SW-NEW-001\", \"stock\": 100, \"taxId\": \"<tax-uuid>\", \"price\": [{\"currencyId\": \"<currency-uuid>\", \"gross\": 29.99, \"net\": 25.20, \"linked\": true}]}",
    "dryRun": true
}
```

:::

Use `shopware://currencies` to find `currencyId`. Use `shopware-entity-search` on `tax` to find `taxId`.

**Update an existing entity:**

::: code-group

```json [Tool: shopware-entity-upsert]
{
    "entity": "product",
    "payload": "{\"id\": \"<product-uuid>\", \"stock\": 50}",
    "dryRun": false
}
```

:::

## Analytics and reporting

**Count opt-in newsletter subscribers:**

::: code-group

```json [Tool: shopware-entity-aggregate]
{
    "entity": "newsletter_recipient",
    "aggregations": "[{\"type\": \"count\", \"name\": \"total\", \"field\": \"id\"}]",
    "filters": "[{\"type\": \"equals\", \"field\": \"status\", \"value\": \"optIn\"}]"
}
```

:::

**Average order value for the current month:**

::: code-group

```json [Tool: shopware-entity-aggregate]
{
    "entity": "order",
    "aggregations": "[{\"type\": \"avg\", \"name\": \"avgOrderValue\", \"field\": \"amountTotal\"}]",
    "filters": "[{\"type\": \"range\", \"field\": \"orderDateTime\", \"parameters\": {\"gte\": \"2026-04-01\"}}]"
}
```

:::

**Orders by month (date histogram):**

::: code-group

```json [Tool: shopware-entity-aggregate]
{
    "entity": "order",
    "aggregations": "[{\"type\": \"date-histogram\", \"name\": \"ordersByMonth\", \"field\": \"orderDateTime\", \"interval\": \"month\"}]"
}
```

:::

## Media and appearance

**Upload a product image from a URL:**

::: code-group

```json [Tool: shopware-media-upload]
{"url": "https://example.com/images/product.jpg", "productId": "<product-uuid>"}
```

:::

**Upload a logo and update the theme:**

**Step 1:** Upload the image:

::: code-group

```json [Tool: shopware-media-upload]
{"url": "https://example.com/logo.svg", "fileName": "shop-logo"}
```

:::

**Step 2:** Use the returned `mediaId` to update the theme:

::: code-group

```json [Tool: shopware-theme-config]
{
    "salesChannelId": "<sales-channel-uuid>",
    "action": "update",
    "config": "{\"sw-logo-desktop\": {\"value\": \"<mediaId>\"}}",
    "dryRun": false
}
```

:::

Read `shopware://sales-channels` to find `salesChannelId`.

## Using resources

**Find sales channel IDs:**
Read `shopware://sales-channels` to get all sales channels with IDs, names, types, and domains.

**Discover available flow events and actions:**
Read `shopware://business-events` and `shopware://flow-actions`.

**Check valid state transitions for orders:**
Read `shopware://state-machines` to see all states and valid transition actions for the order, delivery, and transaction state machines.

## Merchant workflow tools

Higher-level tools for merchant operations (order summaries, customer lookup, product creation with human-readable parameters, revenue and bestseller reports, storefront search, cart management, and checkout flows) are provided by the [SwagMcpMerchantTools](./shopware-extensions.md#swagmcpmerchanttools) plugin under the `merchant-*` namespace. Refer to that plugin's documentation for examples.
