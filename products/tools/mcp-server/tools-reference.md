---
nav:
  title: Tools Reference
  position: 70

---

# Tools Reference

This page documents all built-in tools, resources, and the system prompt provided by Shopware's MCP server.

## Response format

All core tools return a consistent JSON envelope via `McpToolResponse`. It is the first text block of the result:

**Success:**

```json
{"success": true, "data": [], "_meta": {"total": 42, "page": 1, "limit": 25}}
```

**Error:**

```json
{"success": false, "error": "Human-readable message telling the agent what to do next", "code": "tool_error"}
```

The `_meta` field is optional and used for pagination context, dry-run status, and sales channel scope.

Starting with Shopware 6.7.16.0, every tool call returns a standard MCP `CallToolResult` around this text block:

- **`structuredContent`** holds the result data, so clients don't need to parse JSON out of the text. Data that is not a JSON object, such as a list of rows, is wrapped as `{"result": …}`. A failed call has `structuredContent.error` with `code`, `message`, and, if present, `details`.
- **`isError`** is `true` for a failed call.
- **`_meta["shopware/generatedAt"]`** holds the time the result was created.

The error `code` is stable and one of `tool_error`, `missing_privilege`, `invalid_arguments`, or `not_found`. The text block carries the same code. Clients that negotiate a protocol revision before `2025-06-18` get no `structuredContent`, because that revision introduced it. They still get `isError` and `_meta`.

```json
{
  "content": [{"type": "text", "text": "{\"success\":false,\"error\":\"Missing privilege: order:read\",\"code\":\"missing_privilege\"}"}],
  "isError": true,
  "structuredContent": {"error": {"code": "missing_privilege", "message": "Missing privilege: order:read"}},
  "_meta": {"shopware/generatedAt": "2026-10-15T10:00:00+00:00"}
}
```

:::info Shopware 6.8
With the `v6.8.0.0` feature flag, the first text block holds the plain data, or the error message for a failed call, instead of the `success` envelope. The summary and the metadata (`{"_meta": …}`) follow as text blocks of their own, and each metadata key is also sent as `_meta["shopware/<key>"]`. Read `structuredContent`, `isError`, and `_meta` instead of parsing the envelope, so your client works on both.
:::

`shopware-entity-search`, `shopware-entity-read`, `shopware-entity-aggregate`, `shopware-entity-upsert`, `shopware-entity-delete`, and `shopware-theme-config` describe each parameter in their `inputSchema`. Parameters that take a JSON-encoded string, such as `criteria` or `aggregations`, state whether an object or an array is expected and include an example.

When `shopware-entity-search`, `shopware-entity-read`, or `shopware-entity-aggregate` receives criteria or aggregations it cannot parse, the error names every rejected element by its JSON pointer:

```json
{"success": false, "error": "Invalid criteria: /aggregations/0/avg/field: The aggregation should contain a \"field\".", "code": "invalid_arguments"}
```

Correct the named element and call the tool again.

## Discovery tools

With core alone, a fresh MCP session advertises only the three discovery tools below; every other core tool becomes visible when its toolset is enabled for the session. The `discovery` group is reserved for these three tools. Starting with Shopware 6.7.16.0, a plugin or bundle tool that declares `#[McpToolGroup('discovery')]` is moved to the `other` toolset. It stays callable and can be enabled, but it is not advertised from the start. To show tools on the first `tools/list`, connect with [`?toolsets=<group>`](./getting-started.md#select-toolsets-when-connecting). See [Assign a tool group](../../../guides/plugins/plugins/mcp-server.md#step-2-assign-a-tool-group).

### shopware-tool-search

Search the tool catalogue using a free-text query. The search covers every registered tool, including tools that are not currently advertised, and drops everything the effective allowlist does not permit.

| Name         | Type   | Required | Default | Description                                              |
| ------------ | ------ | -------- | ------- | -------------------------------------------------------- |
| `query`      | string | yes      | —       | Free-text search query, such as `upload a product image` |
| `maxResults` | int    | no       | 3       | Maximum number of results, capped at 20                  |

Each result contains the complete `tool` definition, a `score`, and `matchedIn` — the places the query matched, such as `name:prefix`, `description`, or `parameter`. The `_meta` field reports the echoed `query`, the number of `totalCandidates` considered, and a `usage` hint describing the next step.

Matches below an internal relevance threshold are discarded, so receiving fewer results than `maxResults` — or none at all — is normal for a vague query. Out-of-range `maxResults` values are clamped rather than rejected.

Some clients can call a returned tool definition directly. Otherwise, find and enable its toolset before calling it.

### shopware-toolsets-list

List toolsets available to the current principal. Each entry contains the toolset `name`, `title`, `description`, `tools` (the tool names it contains), and `enabled` — whether it is already active for the current session. A toolset whose tools are all denied by the allowlist is not listed at all.

This tool has no parameters. Without an `Mcp-Session-Id` header, every entry reports `enabled: false`.

### shopware-toolset-enable

Enable one toolset for the current MCP session.

| Name      | Type   | Required | Description                                       |
| --------- | ------ | -------- | ------------------------------------------------- |
| `toolset` | string | yes      | Toolset name returned by `shopware-toolsets-list` |

Enable one toolset per call. There is no counterpart for disabling a toolset, and enabling the same toolset twice is a no-op. The call needs an active MCP session; without one it fails with `Cannot enable an MCP toolset without an active MCP session.` An unknown or non-visible name fails with `Unknown MCP toolset "<name>". Call shopware-toolsets-list first to list available toolsets.`

The response sets `_meta.listChanged` to `true` and Shopware emits `notifications/tools/list_changed`. Clients that do not refresh automatically must request `tools/list` again. Enabling a toolset does not grant permission to call its tools; the effective MCP allowlist remains the security boundary.

For clients that never refresh `tools/list`, name the toolsets in the connection URL instead, for example `/api/_mcp?toolsets=entity,order`. See [Select toolsets when connecting](./getting-started.md#select-toolsets-when-connecting).

## Toolsets

Every tool belongs to exactly one group, and every group except `discovery` becomes a toolset that a client can enable. Core ships these toolsets:

| Toolset         | Title               | Tools                                                                                                                                                       |
| --------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entity`        | Entity tools        | `shopware-entity-schema`, `shopware-entity-search`, `shopware-entity-read`, `shopware-entity-aggregate`, `shopware-entity-upsert`, `shopware-entity-delete` |
| `system-config` | System config tools | `shopware-system-config-read`, `shopware-system-config-write`                                                                                               |
| `media`         | Media tools         | `shopware-media-upload`                                                                                                                                     |
| `order`         | Order tools         | `shopware-order-state`                                                                                                                                      |
| `theme`         | Theme tools         | `shopware-theme-config` (Storefront bundle)                                                                                                                 |
| `store-api`     | Store api tools     | `shopware-store-api-context` — [Store API endpoint](./store-api.md) only                                                                                    |

The `discovery` group holds `shopware-tool-search`, `shopware-toolsets-list`, and `shopware-toolset-enable`. It is always advertised and never appears in `shopware-toolsets-list`, so it cannot be enabled or disabled. No other tool can join this group.

Titles and descriptions are generated from the group name: `#[McpToolGroup('swag-my-plugin')]` produces the title "Swag my plugin tools". Extensions cannot override the generated label, so choose the group name accordingly.

## Large tool results

A tool response larger than 100 KB is not returned inline. Shopware stores it and returns a reference instead: `_meta.resourceUri` contains a `shopware://tool-result/…` URI that the client reads with `resources/read` through the matching resource template. This applies to core tools and to plugin and bundle tools that extend `McpToolResponse`, on both endpoints. App tools are never offloaded.

Starting with Shopware 6.7.16.0, the URI is a signed pointer for the caller and expires after one hour. `_meta.expiresAt` holds the expiry. Clients on protocol `2025-06-18` or later also get the URI as a `resource_link` content block. Read it on the same endpoint as the same caller:

- On `/api/_mcp`, the same integration or user.
- On `/store-api/_mcp`, the same sales channel and `sw-context-token`. A Store API call without `sw-context-token` gets its result inline, because no later request could read it back.

The read works on any later request of that caller, with or without an MCP session. Any other caller gets `Tool result "<id>" not found. It may have expired or been stored by another caller.`

Stored results are deleted when the client ends its session with `DELETE`, and otherwise by the hourly `mcp_tool_result_cache.cleanup` scheduled task after `shopware.mcp.tool_result_cache_ttl` seconds, 24 hours by default. See [Configuration](./configuration.md#shopware-mcp-configuration). Before 6.7.16.0, results were only removed when the session ended, and the Store API endpoint could not read its links back.

## Dry-run behavior

All write tools default to `dryRun=true`. In dry-run mode:

- Changes are validated and previewed but **not persisted**
- A database transaction is opened, the operation runs, then the transaction is rolled back
- Flow Builder actions are suppressed (`SKIP_TRIGGER_FLOW`)
- The response shows what would have happened

Pass `dryRun=false` explicitly to commit the change.

## Tool dependency graph

When you enable a tool in the integration's tool allowlist, its declared dependencies are automatically included:

| Tool                           | Depends on                    |
| ------------------------------ | ----------------------------- |
| `shopware-entity-read`         | `shopware-entity-schema`      |
| `shopware-entity-search`       | `shopware-entity-schema`      |
| `shopware-entity-aggregate`    | `shopware-entity-schema`      |
| `shopware-entity-upsert`       | `shopware-entity-schema`      |
| `shopware-entity-delete`       | `shopware-entity-search`      |
| `shopware-system-config-write` | `shopware-system-config-read` |

## Read Tools

The entity tools below belong to the `entity` toolset, `shopware-system-config-read` to `system-config`. Enable the toolset before calling them.

### shopware-entity-schema

Get the field and association schema of any Shopware entity. Use this first to discover field names and types before building search criteria.

**Parameters:**

| Name     | Type   | Required | Description                                        |
| -------- | ------ | -------- | -------------------------------------------------- |
| `entity` | string | yes      | Entity name (e.g., `product`, `order`, `customer`) |

**Example:**

```json
{"entity": "product"}
```

The response contains `entity`, `fields` with `name`, `type`, and `required`, and `associations` with `name`, `type`, and `entity`. For a many-to-many association, `entity` is the target entity, such as `category`. Starting with Shopware 6.7.16.0, `mappingEntity` names the mapping entity, such as `product_category`, which `shopware-entity-delete` uses to remove a link. Before 6.7.16.0, `entity` named the mapping entity for many-to-many associations.

**ACL:** None (schema introspection only).

### shopware-entity-search

Search, list, and page through records of any entity type, such as orders, products, customers, or categories, using Admin API criteria. Returns entity rows with pagination metadata. Use `criteria.sort` for requests such as "the last 10 orders". Does **not** return aggregation results; use `shopware-entity-aggregate` for counts, averages, and other metrics.

**Response optimization:** When no `includes` are specified in the criteria, responses are automatically trimmed to scalar fields and explicitly requested associations. This strips thumbnails, extensions, and translated duplicates, keeping responses well within the 100 KB limit.

**Parameters:**

| Name       | Type   | Required | Default | Description                                      |
| ---------- | ------ | -------- | ------- | ------------------------------------------------ |
| `entity`   | string | yes      | —       | Entity name                                      |
| `criteria` | string | no       | `{}`    | JSON criteria object                             |
| `limit`    | int    | no       | 25      | Results per page, up to `shopware.api.max_limit` |
| `page`     | int    | no       | 1       | Page number                                      |
| `term`     | string | no       | —       | Full-text search term                            |

**Criteria supports:** `filter`, `sort`, `limit`, `page`, `associations`, `includes`, `fields`, `ids`, `term`, `query`, `post-filter`, `grouping`, `total-count-mode`. A `limit` inside the criteria JSON takes precedence over the top-level `limit`. The top-level `page` replaces the criteria page when it is greater than 1, and a non-empty top-level `term` replaces the criteria term.

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

Use this instead of `shopware-entity-search` when you need counts, averages, sums, or bucket distributions. Mixing entity rows with aggregations in a single response could exceed the 100 KB limit.

**Parameters:**

| Name           | Type   | Required | Default | Description                                                                                                                                                                                                                                           |
| -------------- | ------ | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entity`       | string | yes      | —       | Entity name                                                                                                                                                                                                                                           |
| `aggregations` | string | yes      | —       | JSON array of aggregation definitions. Each element needs `name` and `type`, and every type except `filter` also needs `field`. A `filter` element takes `filter` and a nested `aggregation` instead. A single object instead of an array is rejected |
| `filters`      | string | no       | `[]`    | JSON array of filter definitions narrowing what is aggregated                                                                                                                                                                                         |

**Supported aggregation types:** `avg`, `sum`, `min`, `max`, `stats`, `count`, `terms`, `histogram` (a date histogram with `interval`), `range`, `filter`, `entity`

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

| Name       | Type   | Required | Description                    |
| ---------- | ------ | -------- | ------------------------------ |
| `entity`   | string | yes      | Entity name                    |
| `id`       | string | yes      | Entity UUID                    |
| `criteria` | string | no       | JSON criteria for associations |

**ACL:** `{entity}:read`

### shopware-system-config-read

Read system configuration values. Pass a domain prefix to retrieve all keys under it, or a full key for a single value.

**Parameters:**

| Name             | Type   | Required | Description                                        |
| ---------------- | ------ | -------- | -------------------------------------------------- |
| `key`            | string | yes      | Config key or domain prefix (e.g., `core.listing`) |
| `salesChannelId` | string | no       | Scope the read to a specific sales channel         |

**ACL:** `system_config:read`

## Write Tools

Most write tools default to `dryRun=true`. Always preview before committing. `shopware-media-upload` is the exception — it performs the upload immediately and has no dry-run mode.

These tools are spread across the `entity`, `system-config`, `order`, and `media` toolsets. Enable the toolset before calling them.

### shopware-entity-upsert

Create or update entity data. Use `shopware-entity-schema` to discover required fields first.

ACL is checked per item: payloads **without** an `id` require `{entity}:create`; payloads **with** an `id` require `{entity}:update`. An integration with only one privilege can use the tool for that subset.

**Parameters:**

| Name      | Type   | Required | Default | Description                                                                   |
| --------- | ------ | -------- | ------- | ----------------------------------------------------------------------------- |
| `entity`  | string | yes      | —       | Entity name                                                                   |
| `payload` | string | yes      | —       | JSON object or array of objects. Omit `id` to create; include `id` to update. |
| `dryRun`  | bool   | no       | `true`  | Preview without persisting                                                    |

Upsert can only add many-to-many links, such as product categories. A `remove` or `delete` flag inside `categories` is written to the category itself. To remove a link, use `shopware-entity-delete` on the mapping entity.

**ACL:** `{entity}:create` and/or `{entity}:update`

### shopware-entity-delete

Delete entities by their UUIDs. Returns a cascade impact preview in dry-run mode.

Starting with Shopware 6.7.16.0, the tool also removes a many-to-many link without deleting either side. Delete the row of the mapping entity, such as `product_category` or `product_property`. `shopware-entity-schema` names it as `mappingEntity`.

**Parameters:**

| Name     | Type   | Required | Default | Description                                                                                                                                                                |
| -------- | ------ | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entity` | string | yes      | —       | Entity name, or a mapping entity such as `product_category`                                                                                                                |
| `ids`    | string | yes      | —       | JSON array of UUIDs, or a comma-separated list. For a mapping entity, a JSON array of objects that name every key field, such as `[{"productId": "…", "categoryId": "…"}]` |
| `dryRun` | bool   | no       | `true`  | Preview cascade effects                                                                                                                                                    |

Each response entry contains `entity`, `ids`, and `operation`. `operation` is `delete` for deleted rows and `update` for the entities whose links changed. If only some rows don't exist, their keys are listed in `_meta.notFound`. If none exist, the call fails with `Nothing was deleted, none of these rows exist: […]`.

**Example:** Remove a product from a category.

```json
{"entity": "product_category", "ids": "[{\"productId\": \"<product-id>\", \"categoryId\": \"<category-id>\"}]", "dryRun": true}
```

**ACL:** `{entity}:delete`, for a mapping entity such as `product_category:delete`

### shopware-system-config-write

Update a system configuration value. Shows a before/after diff in dry-run mode.

:::warning Sensitive values
`system_config` can contain SMTP credentials, payment API keys, and other sensitive data. Restrict this tool's access accordingly.
:::

**Parameters:**

| Name             | Type   | Required | Default | Description                                |
| ---------------- | ------ | -------- | ------- | ------------------------------------------ |
| `key`            | string | yes      | —       | Full config key                            |
| `value`          | string | yes      | —       | New value (JSON-encoded for complex types) |
| `salesChannelId` | string | no       | —       | Scope to a sales channel                   |
| `dryRun`         | bool   | no       | `true`  | Preview the diff                           |

**ACL:** `system_config:update`

### shopware-order-state

Change the state of an order, its transactions, and/or its deliveries in one call. Provide at least one action parameter. See the `shopware://state-machines` resource for valid actions per state machine.

**Parameters:**

| Name                | Type   | Required | Default | Description                                                            |
| ------------------- | ------ | -------- | ------- | ---------------------------------------------------------------------- |
| `orderNumber`       | string | one of   | —       | Order number (e.g., `10001`). Mutually exclusive with `orderId`        |
| `orderId`           | string | one of   | —       | Order UUID. Mutually exclusive with `orderNumber`                      |
| `orderAction`       | string | no       | —       | Action for the order (e.g., `cancel`, `process`, `complete`, `reopen`) |
| `transactionAction` | string | no       | —       | Action for all transactions (e.g., `cancel`, `paid`, `refund`)         |
| `deliveryAction`    | string | no       | —       | Action for all deliveries (e.g., `cancel`, `ship`, `retour`, `reopen`) |
| `dryRun`            | bool   | no       | `true`  | Preview transitions without executing                                  |

**ACL:** `order:read` always; `order:update`, `order_transaction:update`, `order_delivery:update` per action on commit.

**Examples:**

```json
{"orderNumber": "10001", "deliveryAction": "ship", "dryRun": true}
```

```json
{"orderNumber": "10001", "orderAction": "cancel", "transactionAction": "refund", "deliveryAction": "cancel", "dryRun": false}
```

### shopware-media-upload

Upload a media file from a public URL. Optionally, assign it as the product's cover image.

**Parameters:**

| Name            | Type   | Required | Description                                                          |
| --------------- | ------ | -------- | -------------------------------------------------------------------- |
| `url`           | string | yes      | Public URL of the file to download                                   |
| `fileName`      | string | no       | Desired file name (defaults to basename of URL)                      |
| `mediaFolderId` | string | no       | UUID of the media folder                                             |
| `productId`     | string | no       | If provided, assigns the uploaded media as the product's cover image |

**ACL:** `media:create`; additionally `product:update` when `productId` is provided.

## Storefront Bundle Tools

Registered by the Storefront bundle in the `theme` toolset.

### shopware-theme-config

Read or update the theme configuration for a sales channel. Manages brand colors, logos, and fonts. This tool lives in the Storefront bundle and depends on `ThemeService`.

**Parameters:**

| Name             | Type   | Required                   | Default | Description                                                                                                                                                                                                                            |
| ---------------- | ------ | -------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `salesChannelId` | string | yes (validated at runtime) | `""`    | Sales channel UUID, or its name as shown in the Administration, such as "Storefront". Optional in the JSON schema, so agents do not refuse the call when the user has not provided one; the tool returns an actionable error if empty. |
| `action`         | string | no                         | `"get"` | `get` or `update`                                                                                                                                                                                                                      |
| `config`         | string | no                         | `"{}"`  | For `update`: JSON key-value pairs, e.g., `{"sw-color-brand-primary": {"value": "#0000ff"}}`                                                                                                                                           |
| `dryRun`         | bool   | no                         | `true`  | For `update`: preview without persisting                                                                                                                                                                                               |

**ACL:** `theme:read` for `get`; `theme:update` for `update`.

## Resources

Resources are static reference data available via MCP resource URIs. They require no tool call and do not consume tool-call budget.

| URI                           | Description                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `shopware://entities`         | All registered entity names                                                                                  |
| `shopware://sales-channels`   | All sales channels with IDs, names, types, and domains                                                       |
| `shopware://currencies`       | All currencies with ISO codes, symbols, and factors                                                          |
| `shopware://languages`        | All languages with locale codes                                                                              |
| `shopware://state-machines`   | All state machines with states and valid transitions                                                         |
| `shopware://business-events`  | All events that can trigger flows                                                                            |
| `shopware://flow-actions`     | All flow actions available in Flow Builder                                                                   |
| `shopware://extensions`       | Active plugins and bundles with additional MCP tools, including tool prefix and install command              |
| `shopware://tool-result/{id}` | Resource template for a stored tool result larger than 100 KB, see [Large tool results](#large-tool-results) |

## Prompts

### shopware-context

The system prompts that explain how to work with the Shopware MCP server. It covers:

- Core entity relationships (product, order, customer, category)
- How to use the DAL criteria format
- Available tools grouped by purpose
- Common multi-step workflows as recipes
- Error recovery guidance
- Best practices (use `shopware-entity-schema` first, use `dryRun`, use `includes`)

Clients can request this prompt to initialize an AI session with Shopware domain knowledge.
