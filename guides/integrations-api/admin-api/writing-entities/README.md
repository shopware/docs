# Writing entities

## Overview

Analogous to the reading endpoints, the API also provides endpoints for all entities to be written in the same way. Once an entity is registered in the system, it can also be written via API. The appropriate routes for the entity are generated automatically and follow the REST pattern.

**Example:** The entity `customer_group` is available under the endpoint `api/customer-group`. For an entity, the system automatically generates the following routes where the entity can be written

| Name | Method | Route | Usage |
| :--- | :--- | :--- | :--- |
| api.customer\_group.update | PATCH | /api/customer-group/{id} | Update the entity with the provided ID |
| api.customer\_group.delete | DELETE | /api/customer-group/{id} | Delete the entity |
| api.customer\_group.create | POST | /api/customer-group | Create a new entity |

## Payload

The payload for writing entities is dictated by the API scheme, which in turn is generated from entity definitions which are part of the Shopware core \(unless they are custom entities\).

See this section on [opening the schema](../../general-concepts/generated-reference.md#entity-schema) of the API payloads.

{% hint style="info" %}
If it is not clear how the data has to be sent despite the scheme, it is also possible to open the administration and to have a look at the corresponding requests. To do this, simply open the network tab in the developer tools of your browser, which lists all requests and payloads sent by the administration.
{% endhint %}

![](../../../../.gitbook/assets/image%20%286%29.png)

### Primary Keys

Shopware 6 works with UUIDv4 as primary keys instead of auto increments. We have opted for this standard for the following reasons:

* IDs can be provided \(client-generated\) when creating an entity
* Minuscule likelihood of generating ID collisions
* Data integrations become easier, because existing primary keys can be hashed to generate UUIDs

### **Bulk Payloads**

If you intend to write multiple entities of a different type or perform various operations \(update, delete\) within a single request, take a look at the [sync endpoint or Sync API](bulk-payloads.md).

## Creating entities

When creating an entity, all `required` fields must be provided in the request body. If one or more fields have not been passed or contain incorrect data, the API outputs all errors for an entity:

```javascript
// POST /api/product/
{
    "name" : "test"
}

{
    "errors": [
        {
            "code": "c1051bb4-d103-4f74-8988-acbcafc7fdc3",
            "status": "400",
            "detail": "This value should not be blank.",
            "source": {
                "pointer": "/0/taxId"
            }
        },
        {
            "code": "c1051bb4-d103-4f74-8988-acbcafc7fdc3",
            "status": "400",
            "detail": "This value should not be blank.",
            "source": {
                "pointer": "/0/stock"
            }
        },
        {
            "code": "c1051bb4-d103-4f74-8988-acbcafc7fdc3",
            "status": "400",
            "detail": "This value should not be blank.",
            "source": {
                "pointer": "/0/price"
            }
        },
        {
            "code": "c1051bb4-d103-4f74-8988-acbcafc7fdc3",
            "status": "400",
            "detail": "This value should not be blank.",
            "source": {
                "pointer": "/0/productNumber"
            }
        }
    ]
}
```

If the entity has been successfully created, the API responds with a `204 No Content` status code.

```javascript
// POST /api/product/

{
    "name" : "test",
    "productNumber" : "random",
    "stock" : 10,
    "price" : [
        {
            "currencyId" : "b7d2554b0ce847cd82f3ac9bd1c0dfca", 
            "gross": 15, 
            "net": 10, 
            "linked" : false
        }
    ],
    "tax" : {
        "name": "test", 
        "taxRate": 15
    }    
}
```

## Updating entities

Updating an entity can, and should, be done partially. This means that only the fields to be updated should be sent in the request. This is recommended because the system reacts differently in the background to certain field changes.

For example, to update the stock of a product and update the price at the same time, we recommend the following partial payload:

```javascript
// PATCH /api/product/021523dde52d42c9a0b005c22ac85043

{
    "stock": 10,
    "price": [
        {
            "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
            "gross": 99.99,
            "net": 89.99,
            "linked": false
        }    
    ]
}
```

## Deleting entities

To delete an entity the route `DELETE /api/product/{id}` can be used. If the entity has been successfully deleted, the API returns a `204 - No Content` response.

When deleting data, it can happen that this is prevented by foreign key restrictions. This happens if the entity is still linked to another entity which requires the relation. For example, if you try to delete a tax record which is marked as required for a product, the delete request will be prevented with a `409 - Conflict.` Make sure to resolve these cascading conflicts before deleting a referenced entity.

```javascript
// DELETE /api/tax/5840ff0975ac428ebf7838359e47737f

{
    "errors": [
        {
            "status": "409",
            "code": "FRAMEWORK__DELETE_RESTRICTED",
            "title": "Conflict",
            "detail": "The delete request for tax was denied due to a conflict. The entity is currently in use by: product (32)"
        }
    ]
}
```

## Cloning an entity

To clone an entity the route `POST /api/_action/clone/{entity}/{id}` can be used. The API clones all associations which are marked with `CascadeDelete`.

{% hint style="success" %}
The behaviour can be disabled explicitly by setting the constructor argument for `CascadeDelete` to false in the entity definition

```php
(new OneToManyAssociationField('productReviews', /* ... */))
    ->addFlags(new CascadeDelete(false)),
```
{% endhint %}

Some entities have a `ChildrenAssociationField`. The children are also considered in a clone request. However, since this results in large amounts of data, the parameter `cloneChildren: false` can be sent in the payload so that they are no longer duplicated. It is also possible to overwrite fields in the clone using the payload parameter 'overwrites'. This is especially helpful if the entity has a unique constraint in the database. As response, the API returns the new id of the entity:

```javascript
// POST /api/_action/clone/product/53be6fb93e4b44ed877736cbe01a47b8

{
    "overwrites": {
        "name" : "New name",
        "productNumber" : "new number"
    },
    "cloneChildren": false
}

{
    "id": "cddde8ad9f81497b9a280c7eb5c6bd2e"
}
```

