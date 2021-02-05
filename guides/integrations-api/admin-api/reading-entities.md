# Reading entities

The Admin API is designed in such a way that all entities of the system can be read in the same way. Once an entity is registered in the system, it can be written and read via API - this also applies to your custom entities. The appropriate routes for the entity are generated automatically and follow the REST pattern.

{% hint style="info" %}
**Example**

* The `ManufacturerEntity` is registered as `product_manufacturer` in the system and can be read `api/v{version}/product-manufacturer`.
* The `ProductEntity` has an association with the property name `manufacturer`, which refers to the `ManufacturerEntity`.
* The manufacturer of a product can then be read over `api/v1/product/{productId}/manufacturer`.
{% endhint %}

For an entity object, the system automatically creates the following routes through which the entity object can be read:

| Name | Method | Route | Usage |
| :--- | :--- | :--- | :--- |
| api.customer\_group.list | GET | /api/v{version}/customer-group | Fetch a list of entities |
| api.customer\_group.detail | GET | /api/v{version}/customer-group/{id} | Fetch a single entity  |
| api.customer\_group.search | POST | /api/v{version}/search/customer-group | Perform a more sophisticated search |
| api.customer\_group.search-ids | POST | /api/v{version}/search-ids/customer-group | Perform a more sophisticated search and fetching only matching ids |

A list of all routes and registered entities in the system can be dynamically read via the `/api/v3/_info/*` routes:

* `/api/v3/_info/openapi3.json`
* `/api/v3/_info/open-api-schema.json`
* `/api/v3/_info/entity-schema.json`

