# Admin API Guide

In this guide, you'll learn how to use the Admin API. If you want to understand the concept behind the API or find a full endpoint reference, please visit the following sections:

{% page-ref page="../../../concepts/api/" %}

The Admin API provides an interface for all CRUD \(create, read, update, delete\) operations on every entity within Shopware. In the following guide, we'll discuss it's usage throughout these topics:

* Authenticate as an API user
* Create, read, modify and delete resources
* Use the sync endpoint
* Call additional, non-CRUD routes

In order to have a good base for understanding this guide, we recommend you have read these guides or articles which gives an Introduction to the general handling of our APIs

{% page-ref page="../general-concepts/" %}

## General

The Admin API provides a base endpoint to which all other endpoints are relative.

The base endpoint depends on your Shopware host URL - for example:

```text
https://shop.example.com/api
```

From this base endpoint, we can assemble almost all paths described in the subsequent sections.

## Request format

In Shopware 6, the request body has to be JSON encoded. Always set the `Content-Type` header to `application/json` if you're sending data to the API.

It's mandatory to use type-safe values, e.g. if the API expects an integer value, you're required to provide an actual integer. If you're using a Date field, make sure to use an ISO 8601 compatible date format.

```javascript
{
    "id": "01bd7e70a50443ec96a01fd34890dcc5",
    "name": "Example product",
    "taxId": "792203a53e564e28bcb7ffa1867fb485",
    "stock": 708,
    "createdAt": "2018-09-13T10:17:05+02:00"
}
```

## Response format

The Admin API generally supports two response body formats. A simple json format to no explicit specification and the [JSON:API](http://jsonapi.org/) standard format. By default, the response will be in JSON:API format. You can control the response format using the `Accept` header.

<table>
  <thead>
    <tr>
      <th style="text-align:left">Accept</th>
      <th style="text-align:left">Format</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><code>application/vnd.api+json</code>
      </td>
      <td style="text-align:left">
        <p><b>Default</b>
        </p>
        <p>JSON:API formatted response</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><code>application/json</code>
      </td>
      <td style="text-align:left">Simple JSON format</td>
    </tr>
  </tbody>
</table>

### **JSON:API**

The format has a rich structure that makes discovering the API easier, even without documentation. Some libraries can even generate user interfaces from it. It provides relationships to other resources and additional information about the resource. You can see a shortened example response below

```javascript
// Accept: application/vnd.api+json (default)

{
    "data": [
        {
            "id": "01bd7e70a50443ec96a01fd34890dcc5",
            "type": "product",
            "attributes": {
                "active": true,
                "stock": 708,
                "createdAt": "2018-09-13T10:17:05+02:00",
                "manufacturerId": "f85bda8491fd4d61bcd2c7982204c638",
                "taxId": "792203a53e564e28bcb7ffa1867fb485",
                "price": {
                    "net": 252.94117647058826,
                    "gross": 301,
                    "linked": true
                }
            },
            "links": {
                "self": "http://localhost:8000/api/product/01bd7e70a50443ec96a01fd34890dcc5"
            },
            "relationships": {
                "children": {
                    "data": [],
                    "links": {
                        "related": "http://localhost:8000/api/product/01bd7e70a50443ec96a01fd34890dcc5/children"
                    }
                }
            }
        }
    ],
    "included": [
        {
            "id": "792203a53e564e28bcb7ffa1867fb485",
            "type": "tax",
            "attributes": {
                "taxRate": 20,
                "name": "20%",
                "createdAt": "2018-09-13T09:54:01+02:00"
            },
            "links": {
                "self": "http://localhost:8000/api/tax/792203a53e564e28bcb7ffa1867fb485"
            },
            "relationships": {
                "products": {
                    "data": [],
                    "links": {
                        "related": "http://localhost:8000/api/tax/792203a53e564e28bcb7ffa1867fb485/products"
                    }
                }
            }
        }
    ],
    "links": {
        "first": "http://localhost:8000/api/product?limit=1&page=1",
        "last": "http://localhost:8000/api/product?limit=1&page=50",
        "next": "http://localhost:8000/api/product?limit=1&page=2",
        "self": "http://localhost:8000/api/product?limit=1"
    },
    "meta": {
        "fetchCount": 1,
        "total": 50
    },
    "aggregations": []
}
```

### **Simple JSON**

The simple JSON format only contains essential information, and skips JSON:API specific fields related to pagination or self-discovery. Associations are placed directly within the entities rather than in a separate section. It is sometimes favourable, because it's less "blown-up" and as such easier for clients to consume. You can see a shortened example below:

```javascript
// Accept: application/json

{
    "total": 50,
    "data": [
        {
            "taxId": "792203a53e564e28bcb7ffa1867fb485",
            "manufacturerId": "f85bda8491fd4d61bcd2c7982204c638",
            "active": true,
            "price": {
                "net": 252.94117647058826,
                "gross": 301,
                "linked": true,
                "extensions": []
            },
            "stock": 708,
            "tax": {
                "taxRate": 20,
                "name": "20%",
                "createdAt": "2018-09-13T09:54:01+02:00",
                "id": "792203a53e564e28bcb7ffa1867fb485"
            },
            "manufacturer": {
                "catalogId": "20080911ffff4fffafffffff19830531",
                "name": "Arnold",
                "createdAt": "2018-09-13T10:17:04+02:00",
                "products": null,
                "id": "f85bda8491fd4d61bcd2c7982204c638"
            },
            "parent": null,
            "children": null,
            "id": "01bd7e70a50443ec96a01fd34890dcc5"
        }
    ],
    "aggregations": []
}
```

