---
nav:
  title: Create a Product and Complete Checkout
  position: 10

---

# Create a Product and Complete Checkout

This guide shows a tested local end-to-end flow for Shopware development:

1. create a category and product with the Admin API
2. read the product with the Store API
3. add the product to a cart
4. register a customer in the current Store API context
5. place an order
6. handle payment if needed

It is written as a golden path for local development on `http://127.0.0.1:8000`. Troubleshooting tips appear below.

## What to expect in local development

A few details matter a lot in local setups:

- Store API requests use `sw-access-key`, not `sw-access-token`
- on this setup, `/store-api/context` is called with `GET`
- Store API context tokens are ephemeral and may expire during longer debugging sessions
- `register` or `login` may return a new `Sw-Context-Token`
- if the context changes, your cart may no longer contain the items you added earlier
- product creation requires a price in the **system default currency**
- customer registration requires real IDs such as `salutationId` and `countryId`

Because of that, the safest approach is to follow one known good sequence from start to finish.

## Before you start

Make sure your local Shopware instance is running:

- Storefront: `http://127.0.0.1:8000`
- Administration: `http://127.0.0.1:8000/admin`

You also need:

- `curl`
- `jq`
- an admin user, for example `admin / shopware` in a local default setup
- a Store API sales channel access key

## Step 1: Get an Admin API token

For local development, you can use the Administration password grant shortcut:

```bash
ADMIN_TOKEN=$(curl -s -X POST "http://127.0.0.1:8000/api/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "client_id": "administration",
    "scopes": "write",
    "username": "admin",
    "password": "shopware"
  }' | jq -r '.access_token')

printf '%s\n' "$ADMIN_TOKEN"
```

## Step 2: Inspect your local API schemas

Use the generated schemas for two different questions:

- **OpenAPI spec**: which endpoint should I call, and what does the payload look like?
- **Entity schema**: which fields and associations exist on product, category, order, and other entities?

Download the Admin API schemas:

```bash
curl -s "http://127.0.0.1:8000/api/_info/openapi3.json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o openapi.json
```

Download the entity schema as well:

```bash
curl -s "http://127.0.0.1:8000/api/_info/open-api-schema.json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o entity-schema.json
```

Quick checks:

```bash
ls -lh openapi.json entity-schema.json
head -n 5 openapi.json
head -n 5 entity-schema.json
```

You can do the same for the Store API later with `/store-api/_info/openapi3.json`.

## Step 3: Look up the IDs you need before creating products

A product usually needs related IDs such as:

- `taxId`
- `salesChannelId`
- `currencyId`

Use Admin API search endpoints for this.

### Find a tax ID

```bash
curl -s -X POST "http://127.0.0.1:8000/api/search/tax" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "sort": [{ "field": "name", "order": "ASC" }]
  }' | jq
```

Choose the tax rate you want to use — for example, the standard rate.

### Find a sales channel ID and Store API access key

```bash
curl -s -X POST "http://127.0.0.1:8000/api/search/sales-channel" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "includes": {
      "sales_channel": ["id", "name", "accessKey"]
    }
  }' | jq
```

Pick the sales channel you want to test against — for example, `Storefront`.

### Find a currency ID

Use the system default currency, because product writes require a price in the default currency:

```bash
curl -s -X POST "http://127.0.0.1:8000/api/search/currency" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "includes": {
      "currency": ["id", "name", "isoCode", "isSystemDefault"]
    }
  }' | jq
```

### Save the IDs you want to use

```bash
TAX_ID="<example string>"
SALES_CHANNEL_ID="<example string>"
CURRENCY_ID="<example string>"
STORE_API_ACCESS_KEY="<example string>"
```

## Step 4: Create a category with the Admin API

```bash
CATEGORY_ID=$(uuidgen | tr '[:upper:]' '[:lower:]' | tr -d '-')

curl -s -X POST "http://127.0.0.1:8000/api/category" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$CATEGORY_ID\",
    \"name\": \"My Example Category\",
    \"active\": true
  }"
```

Verify it:

```bash
curl -s -X POST "http://127.0.0.1:8000/api/search/category" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"ids\": [\"$CATEGORY_ID\"],
    \"includes\": {
      \"category\": [\"id\", \"name\", \"active\"]
    }
  }" | jq
```

The `ids` and `includes` criteria are standard search-criteria features.

## Step 5: Create a product with the Admin API

```bash
PRODUCT_ID=$(uuidgen | tr '[:upper:]' '[:lower:]' | tr -d '-')
PRODUCT_NUMBER="MyExample-001"

curl -s -X POST "http://127.0.0.1:8000/api/product" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$PRODUCT_ID\",
    \"name\": \"My Example Product\",
    \"productNumber\": \"$PRODUCT_NUMBER\",
    \"stock\": 10,
    \"active\": true,
    \"taxId\": \"$TAX_ID\",
    \"price\": [
      {
        \"currencyId\": \"$CURRENCY_ID\",
        \"gross\": 19.99,
        \"net\": 16.80,
        \"linked\": true
      }
    ],
    \"visibilities\": [
      {
        \"salesChannelId\": \"$SALES_CHANNEL_ID\",
        \"visibility\": 30
      }
    ],
    \"categories\": [
      { \"id\": \"$CATEGORY_ID\" }
    ]
  }"
```

Verify it:

```bash
curl -s -X POST "http://127.0.0.1:8000/api/search/product" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "sw-inheritance: 1" \
  -d "{
    \"ids\": [\"$PRODUCT_ID\"],
    \"associations\": {
      \"categories\": {}
    },
    \"includes\": {
      \"product\": [\"id\", \"name\", \"productNumber\", \"active\", \"translated\", \"categories\"],
      \"category\": [\"id\", \"name\"]
    }
  }" | jq
```

The `sw-inheritance` header tells the API to consider parent-child inheritance when reading products and variants.

## Step 6: Create a Store API context

The Store API uses two important headers:

- `sw-access-key`: authenticates against the Store API sales channel
- `sw-context-token`: identifies the shopper context

Get a fresh Store API context:

```bash
curl -i "http://127.0.0.1:8000/store-api/context" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY"
```

Look for the `Sw-Context-Token` response header and store its value:

```bash
STORE_CONTEXT_TOKEN="REPLACE_ME"
echo "$STORE_CONTEXT_TOKEN"
```

You can also extract it automatically:

```bash
STORE_CONTEXT_TOKEN=$(curl -si "http://127.0.0.1:8000/store-api/context" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  | tr -d '\r' | awk -F': ' 'tolower($1)=="sw-context-token" {print $2}')

echo "$STORE_CONTEXT_TOKEN"
```

## Step 7: Read the product with the Store API

Use a Store API search request with search criteria. An example of searching by term and sorting by name:

```bash
curl -s -X POST "http://127.0.0.1:8000/store-api/search" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "term": "My Example Product",
    "limit": 5,
    "sort": [
      { "field": "name", "order": "ASC", "naturalSorting": true }
    ],
    "includes": {
      "product": ["id", "name", "translated", "calculatedPrice"]
    }
  }' | jq
```

An example to prove you can find the created product in a storefront-style listing:

```bash
curl -s -X POST "http://127.0.0.1:8000/store-api/search" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"filter\": [
      { \"type\": \"equals\", \"field\": \"active\", \"value\": true },
      { \"type\": \"equals\", \"field\": \"productNumber\", \"value\": \"$PRODUCT_NUMBER\" }
    ],
    \"sort\": [
      { \"field\": \"name\", \"order\": \"ASC\" }
    ],
    \"page\": 1,
    \"limit\": 10,
    \"includes\": {
      \"product\": [\"id\", \"name\", \"productNumber\", \"translated\", \"calculatedPrice\"]
    }
  }" | jq
```

Useful search-criteria knobs:

- `includes` restricts the response to the fields you need
- `page` and `limit` control pagination
- `filter` applies exact or nested filtering
- `term` performs weighted text search
- `sort` controls ordering

If your project uses a different Store API search/listing endpoint, confirm the exact path in your local `store-api/_info/openapi3.json`.

## Step 8: Add the product to the cart

Use the product ID from the previous step:

```bash
curl -s -X POST "http://127.0.0.1:8000/store-api/checkout/cart/line-item" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      {
        \"id\": \"$PRODUCT_ID\",
        \"referencedId\": \"$PRODUCT_ID\",
        \"type\": \"product\",
        \"quantity\": 1
      }
    ]
  }" | jq
```

Verify the cart:

```bash
curl -s -X GET "http://127.0.0.1:8000/store-api/checkout/cart" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" | jq
```

If your local schema shows slightly different cart payload requirements, trust your local `store-api` OpenAPI spec.

## Step 9: Prepare checkout state

Before placing an order, you typically need:

- a customer in the current Store API context
- active billing and shipping addresses
- a shipping method
- a payment method

You can inspect your local Store API reference in the browser at `http://127.0.0.1:8000/store-api/_info/stoplightio.html`, or inspect the raw schema:

```bash
curl -s "http://127.0.0.1:8000/store-api/_info/openapi3.json" -o store-openapi.json
jq -r '.paths | keys[]' store-openapi.json | grep -E 'checkout|account|address|payment|shipping|order|context'
```

Typical relevant endpoints include:

- `/account/register`
- `/account/login`
- `/account/address`
- `/context`
- `/payment-method`
- `/shipping-method`
- `/checkout/cart`
- `/checkout/order`
- `/handle-payment`

Rule of thumb:

- Admin API: create and manage test data
- Store API: act like a shopper

## Step 10: Register or log in a customer, then place the order

On a typical local setup, `POST /store-api/checkout/order` requires a logged-in customer. If you call it with an anonymous context, Shopware returns `Customer is not logged in.` Register or log in a customer in the current Store API context first.

### 10.1 Fetch salutationId and countryId

For registration, fetch real IDs for:

- `salutationId` from `/store-api/salutation`
- `countryId` from `/store-api/country`

For example:

```bash
COUNTRY_ID="019d2b446e29724fa4715c70c9c3eae1"
SALUTATION_ID="019d2b446e2573ba9a3ea2d002050cbe"
```

### 10.2 Register the customer

```bash
curl -i -X POST "http://127.0.0.1:8000/store-api/account/register" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"salutationId\": \"$SALUTATION_ID\",
    \"firstName\": \"FirstName\",
    \"lastName\": \"LastName\",
    \"email\": \"name-test@example.com\",
    \"password\": \"shopware123!\",
    \"acceptedDataProtection\": true,
    \"storefrontUrl\": \"http://127.0.0.1:8000\",
    \"billingAddress\": {
      \"firstName\": \"FirstName\",
      \"lastName\": \"LastName\",
      \"street\": \"Teststr. 1\",
      \"zipcode\": \"12345\",
      \"city\": \"Test City\",
      \"countryId\": \"$COUNTRY_ID\"
    }
  }"
```

Use the latest returned `Sw-Context-Token` header for subsequent requests:

```bash
STORE_CONTEXT_TOKEN="REPLACE_ME_WITH_NEW_TOKEN"
```

### 10.3 Re-add the product if the context token changed

After `/store-api/account/register` or `/store-api/account/login`, Shopware may return a new `Sw-Context-Token`. If the token changes, add the product to the cart again in that new context before calling `/store-api/checkout/order`.

```bash
curl -s -X POST "http://127.0.0.1:8000/store-api/checkout/cart/line-item" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      {
        \"id\": \"$PRODUCT_ID\",
        \"referencedId\": \"$PRODUCT_ID\",
        \"type\": \"product\",
        \"quantity\": 1
      }
    ]
  }" | jq
```

Verify that the cart is not empty:

```bash
curl -s "http://127.0.0.1:8000/store-api/checkout/cart" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" | jq
```

### 10.4 Place the order

Once the Store API context has:

- a logged-in customer
- a cart with your product
- valid billing and shipping data

you can usually place the order directly on a local default setup. If your instance requires an explicit payment or shipping selection first, inspect `/payment-method`, `/shipping-method`, and `/context`.

Create the order:

```bash
curl -s -X POST "http://127.0.0.1:8000/store-api/checkout/order" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerComment": "Test order from local API walkthrough"
  }' | jq
```

If the cart is empty, Shopware returns: `Cart is empty.`

In that case, add the product to the cart again in the current context, then retry the order request.

### 10.5 Handle payment if required

Some payment methods require an extra payment step after order creation:

```bash
curl -s -X POST "http://127.0.0.1:8000/store-api/handle-payment" \
  -H "sw-access-key: $STORE_API_ACCESS_KEY" \
  -H "sw-context-token: $STORE_CONTEXT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "REPLACE_ME",
    "finishUrl": "http://127.0.0.1:8000/checkout/finish",
    "errorUrl": "http://127.0.0.1:8000/checkout/confirm"
  }' | jq
```

If `/store-api/handle-payment` returns `"redirectUrl": null`, the selected payment method does not require an additional redirect-based flow.

## Troubleshooting

### Schema endpoints return `500` or missing-table errors

Your database may not be initialized correctly. Re-run installation and setup.

### Product does not show up in the Store API

Check all of the following:

- the product is `active`
- the product has a valid `price`
- the product has `visibilities` for your sales channel
- you are using the correct Store API access key
- your Storefront sales channel domain matches your local URL

### Which headers matter most?

For this walkthrough:

- Admin API: `Authorization: Bearer $ADMIN_TOKEN`, optionally `sw-language-id`, `sw-version-id`, `sw-inheritance`, `sw-currency-id` depending on your use case
- Store API: `sw-access-key`, `sw-context-token`
