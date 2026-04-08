---
nav:
  title: APIs
  position: 10

---

# APIs

This guide helps you make your first successful API request. Your Shopware instance should already be running and accessible. If it is not, return to the [Installation Guide](../../installation/index.md).

Shopware provides two HTTP APIs:

- **Admin API** for backend operations such as products, orders, customers, plugins, and (via the Sync API) bulk processing
- **Store API** for storefront-facing interactions such as headless frontends, mobile apps, carts, checkout, and sales channel access

For the complete endpoint reference and schemas, use the official Stoplight documentation:

- [Admin API](https://shopware.stoplight.io/docs/admin-api/twpxvnspkg3yu-quick-start-guide)
- [Store API](https://shopware.stoplight.io/docs/store-api/38777d33d92dc-quick-start-guide)

This page is a practical quick start and does not duplicate the full API reference.

## API overview

### Admin API

Use the [Admin API](https://shopware.stoplight.io/docs/admin-api/twpxvnspkg3yu-quick-start-guide) for backend and administrative tasks such as:

- Managing entities like products, categories, and orders
- Running backend integrations and import or export workflows
- Performing bulk operations
- Building Admin-side applications

Base path: `/api/*`

Complete endpoint documentation (local instance required): `/api/_info/stoplightio.html`.

A common search endpoint looks like this: `POST /api/search/{entity}`

### Store API

Use the [Store API](https://shopware.stoplight.io/docs/store-api/38777d33d92dc-quick-start-guide) for customer-facing use cases such as:

- Working with products and listings
- Managing carts and checkout
- Building headless storefronts or mobile apps (requires a Sales Channel access key)
- Serving anonymous or authenticated customers

Base path: `/store-api/*`.

Local API reference: `/store-api/_info/stoplightio.html`

### Step 1: Verify that the instance is running

Open Storefront:

```text
http://127.0.0.1:8000
```

Open Admin:

```text
http://localhost:8000/admin
```

If both pages load, continue.

If `http://127.0.0.1:8000` does not work, open the Administration and go to `Sales Channels → Storefront (or your active channel) → Domains`. Add `http://127.0.0.1:8000` as an additional domain for that sales channel, then save your changes.

When running Shopware locally (e.g., via Docker), ensure the environment is in development mode for better error visibility. The default variable is `APP_ENV=dev`.

If running the command `docker compose exec web printenv APP_ENV` does not return `dev`, create or update the variable in the `.env.local` file. Then restart the container with `make up` (this step is required).

## Step 2: Get an Admin API access token

The Admin API uses OAuth with integration credentials.

First, create an integration in the Administration under **Settings → System → Integrations**. Ensure that the toggle is set to "Administrator" to enable integration permissions.

After creating the integration, copy these values:

- **Access key ID**: maps to the OAuth field `client_id`
- **Secret access key**: maps to the OAuth field `client_secret`

Use them to request an OAuth access token from your local Shopware instance:

```bash
curl -s "http://127.0.0.1:8000/api/oauth/token" \
 -H "Content-Type: application/json" \
  -d '{
 "grant_type": "client_credentials",
 "client_id": "YOUR_ACCESS_KEY_ID",
 "client_secret": "YOUR_SECRET_ACCESS_KEY"
 }'
```

A successful response returns JSON containing an `access_token` for authenticated Admin API requests. The payload will look like this:

```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "..."
}
```

Copy that value and use it as the Bearer token in Step 3. If the response does not appear immediately in your terminal, exit any nested shell session and retry in your normal shell.

If you only want to verify that the token request works, use `127.0.0.1:8000` consistently in your API examples, because it is often already configured by default in local setups.

## Step 3: Make an authenticated API request

After obtaining an access token, test your setup with a protected Admin API endpoint.

Replace `YOUR_ACCESS_TOKEN` with the fresh `access_token` returned in Step 2.

```bash
curl -X POST "http://127.0.0.1:8000/api/search/product" \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
 -d '{}'
```

A successful response returns JSON with the search result. If your instance does not contain any products yet, the `data` array may be empty.

Use `127.0.0.1:8000` consistently in local API examples if that is the URL already configured in your local setup.

If the JSON response includes keys such as `data`, `meta`, and `aggregations`, your request was successful. If `data` is empty, the request still succeeded, but your instance does not yet contain any matching products.

## Step 4: Access the Store API

The [Store API](../../../concepts/api/store-api.md) uses a sales channel access key. Use this key to authenticate Store API requests - for example, when fetching product or category data from an external app, headless storefront, or API client.

Open the Administration and go to **Sales Channels → Storefront (or your active sales channel)**. In the **API access** section, copy the **API access key** for that sales channel.

If needed, you can generate a new API key there. Be aware that generating a new key invalidates the old one.

Use the access key in the `sw-access-key` header when calling the Store API:

```bash
curl -s "http://127.0.0.1:8000/store-api/product" \
 -H "sw-access-key: YOUR_ACCESS_KEY"
```

If the API returns JSON, the request was successful. An empty `elements` array means the request worked, but no products were found yet.

## Step 5: Work with data

Both APIs share the same core concepts:

- Search criteria such as filtering, sorting, and pagination
- Context-aware responses based on permissions or sales channel state

These concepts define how data is filtered, structured, and returned.

For architectural background, see the [API overview](./../../../concepts/api/index.md).

## Result

At this point, you should be able to:

- Authenticate with the Admin API
- Make authenticated API requests
- Access data from your Shopware instance

## Next step

Continue with your first real integration: [Authentication and API Requests](./auth-api-requests.md)
