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

Use this only as a local shortcut.
For integrations and reproducible setups, prefer `client_credentials` as described in the [APIs](./index.md) guide.

## Impersonate a customer

Support tooling can open a Store API context as an existing customer without knowing the customer's password.

1. With an Admin API token belonging to a user with `api_proxy_imitate-customer` ACL privilege, request a short-lived token:

   ```http
   POST /api/_proxy/generate-imitate-customer-token
   {
     "salesChannelId": "SALES_CHANNEL_ID",
     "customerId": "CUSTOMER_ID"
   }
   ```

2. Redeem that token through the Store API and use the returned context token for subsequent requests:

   ```http
   POST /store-api/account/login/imitate-customer
   {
     "token": "IMPERSONATION_TOKEN_FROM_STEP_1",
     "customerId": "CUSTOMER_ID",
     "userId": "ADMIN_USER_ID"
   }
   ```

::: warning
Impersonation performs a real customer login, so login events fire, and cart changes affect the customer's cart.
Grant the ACL privilege only to trusted users and use this flow only for support or testing.
:::

## Prefer search endpoints for real requests

For most real Admin API work, prefer search endpoints over simple entity listing routes.

Instead of:

```bash
curl "http://localhost:8000/api/product" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

Use:

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
- loading associations (loading relations of the entity in the same request)

## Download the OpenAPI schema

Shopware exposes OpenAPI schema endpoints for both Admin API and Store API.
If you want to work with the raw Admin API schemas instead of the browser reference, you can download them directly.

### OpenAPI specification

Use the OpenAPI spec when you need the full API contract for tooling, client generation, or inspection of available endpoints.

```bash
curl -X GET "http://localhost:8000/api/_info/openapi3.json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o openapi.json
```

This saves the file as `openapi.json` in your current working directory.

To verify where it was written and inspect it:

```bash
pwd
ls -lh openapi.json
head -n 5 openapi.json
```

### Entity schema

Use the entity schema when you need metadata about entities and their fields:

```bash
curl -X GET "http://localhost:8000/api/_info/open-api-schema.json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o entity-schema.json
```

To verify the downloaded file:

```bash
pwd
ls -lh entity-schema.json
head -n 5 entity-schema.json
```

::: warning
Due to security restrictions, your `APP_ENV` environment variable must be set to `dev` to access the specifications described below.
:::

Available raw schema endpoints:

- OpenAPI spec: `/(api|store-api)/_info/openapi3.json`.
- Entity schema: `/(api|store-api)/_info/open-api-schema.json`.

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

## Next steps

Learn how to structure queries using:

- [Search Criteria](../integrations-api/search-criteria.md): Encapsulates the entire search definition in one generic object.
- [Request Headers](../integrations-api/request-headers.md): Covers optional headers that customize API requests.
- [Partial Data Loading](../integrations-api/partial-data-loading.md): Limits responses to the fields you actually need.
