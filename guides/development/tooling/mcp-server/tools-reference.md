---
nav:
  title: Tools Reference
  position: 70

---

# Tools Reference

This page documents all built-in tools, resources, and the system prompt provided by Shopware's MCP server.

## Response format

All core tools return a consistent JSON envelope via `McpToolResponse`:

**Success:**

```json
{"success": true, "data": [...], "_meta": {"total": 42, "page": 1, "limit": 25}}
```

**Error:**

```json
{"success": false, "error": "Human-readable message telling the agent what to do next"}
```

The `_meta` field is optional and used for pagination context, dry-run status, and sales channel scope.

## Dry-run behavior

All write tools default to `dryRun=true`. In dry-run mode:

- Changes are validated and previewed but **not persisted**
- A database transaction is opened, the operation runs, then the transaction is rolled back
- Flow Builder actions are suppressed (`SKIP_TRIGGER_FLOW`)
- The response shows what would have happened

Pass `dryRun=false` explicitly to commit the change.

## Tool dependency graph

When you enable a tool in the integration's tool allowlist, its declared dependencies are automatically included:

| Tool | Depends on |
|---|---|
| `shopware-entity-read` | `shopware-entity-schema` |
| `shopware-entity-search` | `shopware-entity-schema` |
| `shopware-entity-aggregate` | `shopware-entity-schema` |
| `shopware-entity-upsert` | `shopware-entity-schema` |
| `shopware-entity-delete` | `shopware-entity-search` |
| `shopware-system-config-write` | `shopware-system-config-read` |

## Read Tools

### shopware-entity-schema

Get the field and association schema of any Shopware entity. Use this first to discover field names and types before building search criteria.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `entity` | string | yes | Entity name (e.g., `product`, `order`, `customer`) |

**Example:**

```json
{"entity": "product"}
```

**ACL:** None (schema introspection only).

### shopware-entity-search

Search entity records using Admin API criteria. Returns entity rows with pagination metadata. Does **not** return aggregation results; use `shopware-entity-aggregate` for counts, averages, and other metrics.

**Response optimization:** When no `includes` are specified in the criteria, responses are automatically trimmed to scalar fields and explicitly requested associations. This strips thumbnails, extensions, and translated duplicates, keeping responses well within the 100 KB limit.

**Parameters:**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `entity` | string | yes | — | Entity name |
| `criteria` | string | no | `{}` | JSON criteria object |
| `limit` | int | no | 25 | Results per page |
| `page` | int | no | 1 | Page number |
| `term` | string | no | — | Full-text search term |

**Criteria supports:** `filter`, `sort`, `limit`, `page`, `associations`, `includes`, `fields`, `ids`, `term`, `query`, `post-filter`, `grouping`, `total-count-mode`. Top-level `limit`, `page`, and `term` parameters override values in criteria JSON.

**Pagination:** The response `_meta` block always includes `total`, `page`, and `limit`. Iterate by incrementing `page` until `page * limit >= total`.

**Examples:**

```json
{"entity": "product", "term": "shirt", "limit": 5}
```

```json
{"entity": "product", "criteria": "{\"filter\": [{\"type\": \"range\", \"field\": \"stock\", \"parameters\": {\"lte\": 5}}], \"sort\": [{\"field\": \"stock\", \"order\": \"ASC\"}]}"}
```

**ACL:** `{entity}:read`

### shopware-entity-aggregate

Run aggregations over any entity without fetching records. Always returns zero entity rows (`limit: 0` internally), so the response size is bounded regardless of dataset size.

Use this instead of `shopware-entity-search` when you need counts, averages, sums, or bucket distributions. Mixing entity rows with aggregations in one response would risk exceeding the 100 KB limit.

**Parameters:**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `entity` | string | yes | — | Entity name |
| `aggregations` | string | yes | — | JSON array of aggregation definitions |
| `filters` | string | no | `[]` | JSON array of filter definitions |

**Supported aggregation types:** `avg`, `sum`, `min`, `max`, `count`, `terms`, `date-histogram`, `range`, `filter`, `entity`

**Response:** `{"success": true, "data": {"aggregations": {"<name>": {...}}}}`

**Examples:**

```json
{"entity": "order", "aggregations": "[{\"type\": \"avg\", \"name\": \"avgOrderValue\", \"field\": \"amountTotal\"}]"}
```

```json
{
  "entity": "newsletter_recipient",
  "aggregations": "[{\"type\": \"count\", \"name\": \"total\", \"field\": \"id\"}]",
  "filters": "[{\"type\": \"equals\", \"field\": \"status\", \"value\": \"optIn\"}]"
}
```

**ACL:** `{entity}:read`

### shopware-entity-read

Read a single entity by its UUID. Use when you already have an entity ID; for searching by other fields, use `shopware-entity-search`.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `entity` | string | yes | Entity name |
| `id` | string | yes | Entity UUID |
| `criteria` | string | no | JSON criteria for associations |

**ACL:** `{entity}:read`

### shopware-system-config-read

Read system configuration values. Pass a domain prefix to retrieve all keys under it, or a full key for a single value.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `key` | string | yes | Config key or domain prefix (e.g., `core.listing`) |
| `salesChannelId` | string | no | Scope the read to a specific sales channel |

**ACL:** `system_config:read`

## Write Tools

Most write tools default to `dryRun=true`. Always preview before committing. `shopware-media-upload` is the exception — it performs the upload immediately and has no dry-run mode.

### shopware-entity-upsert

Create or update entity data. Use `shopware-entity-schema` to discover required fields first.

ACL is checked per item: payloads **without** an `id` require `{entity}:create`; payloads **with** an `id` require `{entity}:update`. An integration with only one privilege can use the tool for that subset.

**Parameters:**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `entity` | string | yes | — | Entity name |
| `payload` | string | yes | — | JSON object or array of objects. Omit `id` to create; include `id` to update. |
| `dryRun` | bool | no | `true` | Preview without persisting |

**ACL:** `{entity}:create` and/or `{entity}:update`

### shopware-entity-delete

Delete entities by their UUIDs. Returns a cascade impact preview in dry-run mode.

**Parameters:**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `entity` | string | yes | — | Entity name |
| `ids` | string | yes | — | JSON array of UUIDs |
| `dryRun` | bool | no | `true` | Preview cascade effects |

**ACL:** `{entity}:delete`

### shopware-system-config-write

Update a system configuration value. Shows a before/after diff in dry-run mode.

:::warning Sensitive values
`system_config` can contain SMTP credentials, payment API keys, and other sensitive data. Restrict this tool's access accordingly.
:::

**Parameters:**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `key` | string | yes | — | Full config key |
| `value` | string | yes | — | New value (JSON-encoded for complex types) |
| `salesChannelId` | string | no | — | Scope to a sales channel |
| `dryRun` | bool | no | `true` | Preview the diff |

**ACL:** `system_config:update`

### shopware-order-state

Change the state of an order, its transactions, and/or its deliveries in one call. Provide at least one action parameter. See the `shopware://state-machines` resource for valid actions per state machine.

**Parameters:**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `orderNumber` | string | one of | — | Order number (e.g., `10001`). Mutually exclusive with `orderId` |
| `orderId` | string | one of | — | Order UUID. Mutually exclusive with `orderNumber` |
| `orderAction` | string | no | — | Action for the order (e.g., `cancel`, `process`, `complete`, `reopen`) |
| `transactionAction` | string | no | — | Action for all transactions (e.g., `cancel`, `paid`, `refund`) |
| `deliveryAction` | string | no | — | Action for all deliveries (e.g., `cancel`, `ship`, `retour`, `reopen`) |
| `dryRun` | bool | no | `true` | Preview transitions without executing |

**ACL:** `order:read` always; `order:update`, `order_transaction:update`, `order_delivery:update` per action on commit.

**Examples:**

```json
{"orderNumber": "10001", "deliveryAction": "ship", "dryRun": true}
```

```json
{"orderNumber": "10001", "orderAction": "cancel", "transactionAction": "refund", "deliveryAction": "cancel", "dryRun": false}
```

### shopware-media-upload

Upload a media file from a public URL. Optionally assign it as the cover image of a product.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `url` | string | yes | Public URL of the file to download |
| `fileName` | string | no | Desired file name (defaults to basename of URL) |
| `mediaFolderId` | string | no | UUID of the media folder |
| `productId` | string | no | If provided, assigns the uploaded media as the product's cover image |

**ACL:** `media:create`; additionally `product:update` when `productId` is provided.

## Storefront Bundle Tools

### shopware-theme-config

Read or update theme configuration for a sales channel. Manages brand colors, logos, and fonts. This tool lives in the Storefront bundle and depends on `ThemeService`.

**Parameters:**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `salesChannelId` | string | yes | — | Sales channel UUID |
| `action` | string | no | `"get"` | `get` or `update` |
| `config` | string | no | `"{}"` | For `update`: JSON key-value pairs, e.g. `{"sw-color-brand-primary": {"value": "#0000ff"}}` |
| `dryRun` | bool | no | `true` | For `update`: preview without persisting |

**ACL:** `theme:read` for `get`; `theme:update` for `update`.

## Resources

Resources are static reference data available via MCP resource URIs. They require no tool call and do not consume tool-call budget.

| URI | Description |
|---|---|
| `shopware://entities` | All registered entity names |
| `shopware://sales-channels` | All sales channels with IDs, names, types, and domains |
| `shopware://currencies` | All currencies with ISO codes, symbols, and factors |
| `shopware://languages` | All languages with locale codes |
| `shopware://state-machines` | All state machines with states and valid transitions |
| `shopware://business-events` | All events that can trigger flows |
| `shopware://flow-actions` | All flow actions available in Flow Builder |
| `shopware://extensions` | Active plugins and bundles with additional MCP tools, including tool prefix and install command |

## Prompts

### shopware-context

The system prompt that explains how to work with the Shopware MCP server. It covers:

- Core entity relationships (product, order, customer, category)
- How to use the DAL criteria format
- Available tools grouped by purpose
- Common multi-step workflows as recipes
- Error recovery guidance
- Best practices (use `shopware-entity-schema` first, use `dryRun`, use `includes`)

Clients can request this prompt to initialize an AI session with Shopware domain knowledge.
