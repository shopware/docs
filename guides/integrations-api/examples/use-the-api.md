# Import products with the Admin API

In this guide, we will create a tool that helps importing products into Shopware 6. We will be doing the following things:

1. Define a source format for our products
2. Write a parser that creates API payloads from the source
3. Build a queue which sends the API payloads to the API
4. Monitor the import

Usually, products contain several fields of data that we have to import.

* **Product Item**
  * Name
  * Description
  * ProductNumber
  * Price
  * List&lt;Image&gt;
    * Path
    * Name
  * List&lt;Property&gt;
    * Name
    * Option
  * List&lt;Category&gt;

```javascript
// Category Setup

{
  "category_setup": {
    "action": "upsert",
    "entity": "category",
    "payload": [{
      "id": "0804f0506aa84cb5b32f5919dfcad102",
      "name": "Stores",
      "active": true,
      "children": [{
        "id": "0a9fdf4890f54f3c8a3043b9ff774596",
        "name": "United Kingdom",
        "active": true
      },
      {
        "id": "6d06f6b23a8146ec9f0b6dadb6b0b014",
        "name": "Germany",
        "active": true
      }]
    }]
  }
}
```

