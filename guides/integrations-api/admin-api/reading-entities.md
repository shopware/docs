# Reading entities

The Admin API is designed in such a way that all entities of the system can be read in the same way. Once an entity is registered in the system, it can be written and read via API - this also applies to your custom entities. The appropriate routes for the entity are generated automatically and follow the REST pattern.

{% hint style="info" %}
**Example**

* The `ManufacturerEntity` is registered as `product_manufacturer` in the system and can be read `api/product-manufacturer`.
* The `ProductEntity` has an association with the property name `manufacturer`, which refers to the `ManufacturerEntity`.
* The manufacturer of a product can then be read over `api/product/{productId}/manufacturer`.
{% endhint %}

## Generated Endpoints

For an entity object, the system automatically creates the following routes through which the entity object can be read:

| Name | Method | Route | Usage |
| :--- | :--- | :--- | :--- |
| api.customer\_group.list | GET | /api/customer-group | Fetch a list of entities |
| api.customer\_group.detail | GET | /api/customer-group/{id} | Fetch a single entity |
| api.customer\_group.search | POST | /api/search/customer-group | Perform a more [sophisticated search](../general-concepts/search-criteria.md) |
| api.customer\_group.search-ids | POST | /api/search-ids/customer-group | Perform a more [sophisticated search](../general-concepts/search-criteria.md) and fetching only matching ids |

## Search Endpoint

The Admin API supports a wide range of filtering, aggregation and sorting capabilities. However, according to the REST definition, data should only be read via GET, we have provided the `/api/search/*` route for this.

The behaviour of that endpoint follows the concepts described in the [Search Criteria](../general-concepts/search-criteria.md) article.

