
# Fetch a single product

`POST /product/{productId}` | ProductDetailRoute

## Parameters


**Path**

**`navigationId`** | uuid | required
Identifier of a product. If it points to a "parent" product, it returns the cheapest variant of that product.


**Body**

[`Search Criteria`](../../../../guides/integrations-api/general-concepts/seach-criteria.md) | Criteria | optional


## Returns

Returns a single product together with a configurator object that contains its variant options.

{% tabs %}
{% tab title="200 OK" %}
```javascript
{
  "apiAlias": "product_detail",
  "product": { ... }
  "configurator": []
}
```
{% endtab %}

{% tab title="404 Not Found" %}
```javascript
{
  "errors": [
    {
      "status": "404",
      "code": "CONTENT__PRODUCT_NOT_FOUND",
      "title": "Not Found",
      "detail": "Product for id c9b1c3a8b48446a9b092e31d0f49020c not found.",
      "meta": {
        "parameters": {
          "productId": "c9b1c3a8b48446a9b092e31d0f49020c"
        }
      }
    }
  ]
}
```
{% endtab %}
{% endtabs %}

# Fetch a list of products by category

`POST /product-listing/{categoryId}` | ProductListingRoute

## Parameters


**Path**

**`navigationId`** | uuid | required
Identifier of a category.


**Body**

[`Search Criteria`](../../../../guides/integrations-api/general-concepts/seach-criteria.md) | Criteria | optional


## Returns

Returns a product listing containing all products and additional fields to display a listing.

{% tabs %}
{% tab title="200 OK" %}
```javascript
{
  "sorting": "name-asc",
  "currentFilters": { ... },
  "page": 1,
  "limit": 24,
  "sortings": [],
  "availableSortings": [ ... ],
  "total": 1,
  "aggregations": { ... },
  "elements": [ ... ],
  "apiAlias": "product_listing"
}
```
{% endtab %}
{% endtabs %}

# Fetch a list of products by criteria

`POST /product` | ProductListListRoute

## Parameters


**Body**

[`Search Criteria`](../../../../guides/integrations-api/general-concepts/seach-criteria.md) | Criteria | optional


## Returns

Returns a search result containing products, aggregations and pagination properties.

{% tabs %}
{% tab title="200 OK" %}
```javascript
{
  "total": 1,
  "aggregations": [],
  "page": 1,
  "limit": 10,
  "elements": [ ... ],
  "apiAlias": "dal_entity_search_result"
}
```
{% endtab %}
{% endtabs %}


# Fetch cross-selling groups of a product

`POST /product/{productId}/cross-selling` | ProductCrossSellingRoute

## Parameters


**Path**

**`productId`** | uuid | required
Identifier of a product.


**Body**

`includes` | object | optional


## Returns

Returns a list of cross-selling groups for the given product including their respective items.

{% tabs %}
{% tab title="200 OK" %}
```javascript
[
  {
    "crossSelling": {
      "name": "Gear",
      "position": 1,
      "sortBy": "name",
      "sortDirection": "ASC",
      "limit": 24,
      "active": true,
      "type": "productList",
      "translations": null,
      "_uniqueIdentifier": "1cd3dd88584748bf92d1b0eabd0700ec",
      "versionId": null,
      "translated": {
        "name": "Gear"
      },
      "createdAt": "2021-02-22T15:40:52.802+00:00",
      "updatedAt": null,
      "extensions": {
        "foreignKeys": {
          "apiAlias": "array_struct"
        }
      },
      "id": "1cd3dd88584748bf92d1b0eabd0700ec",
      "apiAlias": "product_cross_selling"
    },
    "products": [ ... ],
    "total": 1,
    "apiAlias": "cross_selling_element"
  }
]
```
{% endtab %}
{% endtabs %}


# Search for products

`POST /search` | ProductSearchRoute

`POST /search-suggest` | ProductSuggestRoute

## Parameters


**Body**

**`search`** | string | required
Term to search after.

[`Search Criteria`](../../../../guides/integrations-api/general-concepts/seach-criteria.md) | Criteria | optional


## Returns

Returns a product listing including all products that match your search term.  Additionally, all products contain a extensions.search._score field, which shows the relevance score of the product.

When you're using the /search-suggest endpoint, aggregations, currentFilters and availableSortings are not included in the response.

{% tabs %}
{% tab title="200 OK" %}
```javascript
{
  "sorting": "score",
  "currentFilters": { ... },
  "page": 1,
  "limit": 24,
  "sortings": [],
  "availableSortings": [ ... ],
  "total": 1,
  "aggregations": { ... },
  "elements": [
    {
      ...
      "extensions": {
        "search": {
          "_score": "9520",
        }
      },
      "apiAlias": "product"
    }
  ],
  "apiAlias": "product_listing"
}
```
{% endtab %}
{% endtabs %}


# Fetch product reviews

`POST /product/{productId}/reviews` | ProductReviewRoute

## Parameters


**Path**

**`productId`** | uuid | required
Identifier of a product.


**Body**

[`Search Criteria`](../../../../guides/integrations-api/general-concepts/seach-criteria.md) | Criteria | optional


## Returns

Returns a search result containing all reviews for the given product.

{% tabs %}
{% tab title="200 OK" %}
```javascript
{
  "total": 1,
  "aggregations": [],
  "page": 1,
  "limit": null,
  "elements": [
    {
      "productId": "2450b6fe553e4759b710733213751af0",
      "salesChannelId": "7f67a49297f8480484e5b696d2f0b627",
      "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
      "points": null,
      "status": true,
      "comment": "We are very sorry for disappointing you. We've sent you a voucher for future purchases.",
      "content": "The images were way better than the actual product.",
      "title": "Underwhelming",
      "_uniqueIdentifier": "75d0676027924597847d8c2b0a3aa969",
      "versionId": null,
      "translated": [],
      "createdAt": "2021-02-22T16:13:47.373+00:00",
      "updatedAt": "2021-02-22T16:27:24.176+00:00",
      "extensions": {
        "foreignKeys": {
          "apiAlias": "array_struct"
        }
      },
      "id": "75d0676027924597847d8c2b0a3aa969",
      "productVersionId": "0fa91ce3e96a4bc2be4bd9ce752c3425",
      "apiAlias": "product_review"
    }
  ],
  "apiAlias": "dal_entity_search_result"
}
```
{% endtab %}
{% endtabs %}


# Save product reviews

`POST /product/{productId}/review` | ProductReviewSaveRoute

## Parameters


**Header**

**`sw-context-token`** | string | required
Context token of a [logged in](../../../../guides/integrations-api/store-api-guide/register-a-customer.md#logging-in) user.

**Path**

**`productId`** | uuid | required
Identifier of a product.


**Body**

**`title`** | string | required
Identifier of a product.

**`content`** | string | required
Identifier of a product.

`id` | uuid | optional
Used for edits only. The review will be updated, if it's created by the [logged in](../../../../guides/integrations-api/store-api-guide/register-a-customer.md#logging-in) user.

`name` | string | optional
Name of the reviewer. If not set, it defaults to the customer's first name.

`email` | string | optional
Identifier of a product. If not set, it defaults to the customer's email

`points` | float | optional
Identifier of a product.


## Returns

Returns an empty when the response was created or modified.


{% tabs %}
{% tab title="204 No Content" %}
```javascript
// No Content
```
{% endtab %}
{% endtabs %}