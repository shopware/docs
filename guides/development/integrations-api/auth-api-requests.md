---
nav:
  title: Authentication and API Requests
  position: 20
---


# Authentication and API Requests

This guide builds on the [APIs](./index.md) guide and covers additional authentication details, practical request patterns, and troubleshooting for local development.

## Local password-grant shortcut

The [APIs](./index.md) guide uses integrations with `client_credentials`, which should remain the default approach.

For local development only, you can also obtain an Admin API token with the default Administration credentials:

```bash
curl -X POST "http://localhost:8000/api/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "client_id": "administration",
    "scopes": "write",
    "username": "admin",
    "password": "shopware"
  }'
```

Example response:

```json
{
  "token_type": "Bearer",
  "expires_in": 600,
  "access_token": "...",
  "refresh_token": "..."
}
```

Use this only as a local shortcut. For integrations and reproducible setups, prefer `client_credentials` as described in the [APIs](./index.md) guide.

## Prefer search endpoints for real requests

For most real Admin API work, prefer search endpoints over simple entity listing routes.

Instead of:

```bash
curl "http://localhost:8000/api/product" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

use:

```bash
curl -X POST "http://localhost:8000/api/search/product" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Search endpoints support:

- filtering
- sorting
- pagination
- associations

## Download the OpenAPI schema

Shopware exposes OpenAPI schemas for both Admin API and Store API. These schemas are generated via PHP annotations using [swagger-php](https://github.com/zircote/swagger-php). When building custom endpoints, you can leverage these annotations to generate standardized documentation for them.

To work with the raw schema instead of the local browser reference, download it directly:

```bash
curl -X GET "http://localhost:8000/api/_info/openapi3.json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o openapi.json
```

::: warning
Due to security restrictions, your `APP_ENV` environment variable must be set to `dev` to access the specifications described below.
:::

Raw schema endpoints: `/(api|store-api)/_info/openapi3.json`.

Entity schema endpoints: `/(api|store-api)/_info/open-api-schema.json`.

## Troubleshooting local request failures

If you encounter errors like:

- `Table 'shopware.system_config' doesn't exist`
- `Table 'shopware.plugin' doesn't exist`
- `HTTP 500 on /api/_info/openapi3.json`

your database may not be initialized.

Run:

```bash
docker compose exec web bin/console system:install --create-database --basic-setup
```

If issues persist:

```bash
docker compose down -v
rm install.lock
docker compose up -d
docker compose exec web bin/console system:install --create-database --basic-setup
```

## Next steps

Learn how to structure queries using:

- [Search Criteria](../integrations-api/search-criteria.md): encapsulates the entire search definition in one generic object
- [Request Headers](../integrations-api/request-headers.md): additional instructions
- [Partial Data Loading](../integrations-api/partial-data-loading.md)
