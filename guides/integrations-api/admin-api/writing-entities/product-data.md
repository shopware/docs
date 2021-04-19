# Product Data

## Overview

In this section the handling of the product data structure is explained, because the product contains a few special fields which might not be very clear at first looking at the API schema.

## Simple payload

A product has only a handful of required fields:

* `name` \[string\]
* `productNumber` \[string\]
* `taxId` \[string\]
* `price` \[object\]
* `stock` \[int\]

The smallest required payload for a product can therefore be as follows:

```javascript
{
    "name": "test",
    "productNumber": "random",
    "stock": 10,
    "taxId": "db6f3ed762d14b0395a3fd2dc460db42",
    "price": [
        {
            "currencyId" : "b7d2554b0ce847cd82f3ac9bd1c0dfca", 
            "gross": 15, 
            "net": 10, 
            "linked" : false
        }
    ]
}
```

The following payload examples contain UUIDs for various entities such as currencies, tax rates, manufacturers or properties. These IDs are different on each system and must be adjusted accordingly.

## Price handling

Price handling is one of the edge cases in the product data structure. There are three different prices for a product, which can be queried via API:

* `product.price`
* `product.prices`
* `product.listingPrices`

Only the first two can be written via API \(`product.price`, `product.prices`\). The `product.price` is the "simple" price of a product. It does not contain any quantity information nor is it bound to any `rule`.

## Currency price structure

Within the price, the different currency prices are available. Each of these currency prices includes the following properties:

* `currencyId`  - ID of the currency to which the price belongs
* `gross`       - This price is displayed to customers who see gross prices in the shop
* `net`         - This price is shown to customers who see net prices in the shop
* `linked`      - This is a flag for the administration. If it is set to `true`, the gross or net counterpart is calculated when a price is entered in the administration.

To define prices for a product in different currencies, this is an exemplary payload:

```javascript
{
    "name": "test",
    "productNumber": "random",
    "stock": 10,
    "taxId": "db6f3ed762d14b0395a3fd2dc460db42",
    "price": [
        {
            // euro price
            "currencyId" : "db6f3ed762d14b0395a3fd2dc460db42", 
            "gross": 15, 
            "net": 10, 
            "linked" : false
        },
        {
            // dollar price
            "currencyId" : "16a190bd85b741c08873cfeaeb0ad8e1", 
            "gross": 120, 
            "net": 100.84, 
            "linked" : true
        },
        {
            // pound price
            "currencyId" : "b7d2554b0ce847cd82f3ac9bd1c0dfca", 
            "gross": 66, 
            "net": 55.46, 
            "linked" : true
        }
    ]
}
```

## Quantity and rule price structure

As an extension to the `product.price` there are `product.prices`. These are prices that are bound to a `rule`. Rules \(`rule` entity\) are prioritised. If there are several rules for a customer, the customer will see the rule price with the highest priority. In addition to the dependency on a rule, a quantity discount can be defined using these prices.

Each price in `product.prices` has the following properties:

* `quantityStart` \[int\]     - Indicates the quantity from which this price applies
* `quantityEnd` \[int\|null\]  - Specifies the quantity until this price is valid. 
* `ruleId` \[string\]         - Id of the rule to which the price applies
* `price` \[object\[\]\]        - Includes currency prices \(same structure as `product.price`\)

To define prices for a rule including a quantity discount, this is an exemplary payload:

```javascript
{
    "name": "test",
    "productNumber": "random",
    "stock": 10,
    "taxId": "db6f3ed762d14b0395a3fd2dc460db42",
    "price": [
        { 
            "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca", 
            "gross": 15, 
            "net": 10, 
            "linked": false 
        }
    ],
    "prices": [
        { 
            "id": "9fa35118fe7c4502947986849379d564",
            "quantityStart": 1,
            "quantityEnd": 10,
            "ruleId": "43be477b241448ecacd7ea2a266f8ec7",
            "price": [
                { 
                    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca", 
                    "gross": 20, 
                    "net": 16.81, 
                    "linked": true 
                }
            ]

        },
        { 
            "id": "db6f3ed762d14b0395a3fd2dc460db42",
            "quantityStart": 11,
            "quantityEnd": null,
            "ruleId": "43be477b241448ecacd7ea2a266f8ec7",
            "price": [
                { 
                    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca", 
                    "gross": 19, 
                    "net": 15.97, 
                    "linked": true 
                }
            ]
        }
    ]
}
```

## Listing price handling

The third price property that is available on the product is the `product.listingPrices`. These prices are determined automatically by the system. The price ranges for the corresponding product are available here. The prices are determined on the base of all variants of prices that could be displayed to the customer in the shop.

Each price within this object contains the following properties:

* `currencyId` \[string\] - The currency to which this price applies
* `ruleId` \[string\]     - The rule to which this price applies
* `from` \[price-obj\]    - The lowest price possible for the product in this currency
* `to` \[price-obj\]      - The highest price that is possible for the product in this currency

### Assigning of properties and categories

The product has various `many-to-many` associations. This type of association is a link between the records. Examples are the `properties` and `categories` of a product.

For assigning several `properties` and `categories` this is an exemplary payload:

```javascript
{
    "name": "test",
    "productNumber": "random",
    "stock": 10,
    "taxId": "db6f3ed762d14b0395a3fd2dc460db42",
    "properties": [
        { "id": "b6dd111fff0f4e3abebb88d02fe2021e"},
        { "id": "b9f4908785ef4902b8d9e64260f565ae"}
    ],
    "categories": [
        { "id": "b7d2554b0ce847cd82f3ac9bd1c0dfca" },
        { "id": "cdea94b4f9452254a20b91ec1cd538b9" }
    ]
}
```

To remove these `properties` and `categories`, the corresponding routes can be used for the mapping entities:

* `DELETE /api/product/{productId}/properties/{optionId}`
* `DELETE /api/product/{productId}/categories/{categoryId}`

To delete several assignments at once, the `/_action/sync` route can be used:

```text
{
    // This key can be defined individually
    "unassign-categories": {
        "entity": "product_category",
        "action": "delete",
        "payload": [
            { "productId": "069d109b9b484f9d992ec5f478f9c2a1", "categoryId": "1f3cf89039e44e67aa74cccd90efb905" },
            { "productId": "073db754b4d14ecdb3aa6cefa2ba98a7", "categoryId": "a6d1212c774546db9b54f05d355376c1" }
        ]
    },

    // This key can be defined individually
    "unassign-properties": {
        "entity": "product_property",
        "action": "delete",
        "payload": [
            { "productId": "069d109b9b484f9d992ec5f478f9c2a1", "optionId": "2d858284d5864fe68de046affadb1fc3" },
            { "productId": "069d109b9b484f9d992ec5f478f9c2a1", "optionId": "17eb3eb8f77f4d87835abb355e41758e" },
            { "productId": "073db754b4d14ecdb3aa6cefa2ba98a7", "optionId": "297b6bd763c94210b5f8ee5e700fadde" }
        ]
    }
}
```

### `CategoriesRo` Association

The `product.categories` association contains the assignment of products and their categories. This table is not queried in the storefront, because all products of subcategories should be displayed in listings as well. Therefore there is another association: `product.categoriesRo`. This association is read-only and is filled automatically by the system. This table contains all assigned categories of the product as well as all parent categories.

## Media handling

Media of products are maintained via the association `product.media` and `product.cover`. The `product.media` association is a `one-to-many` association on the `product_media` entity. To assign a media to a product, a new `product_media` entity must be created, in which the foreign key for the corresponding `media` entity is defined. In addition to the foreign key, a `position` can be specified, which defines the display order.

```text
{
    "name": "test",
    "productNumber": "random",
    "stock": 10,
    "taxId": "5f78f2d4b19f49648eb1b38881463da0",
    "price": [
        { "currencyId" : "b7d2554b0ce847cd82f3ac9bd1c0dfca", "gross": 15, "net": 10, "linked" : false }
    ],
    "media": [
        {
            "id": "5f78f2d4b19f49648eb1b38881463da0",
            "mediaId": "00a9742db2e643ccb9d969f5a30c2758",
            "position": 1
        }
    ]
}
```

To delete a media assignment, the ID of the `product_media` entity is required. In the above case this is the `5f78f2d4b19f49648eb1b38881463da0`. The corresponding route `DELETE /api/product/{productId}/media/{productMediaId}` can be used for this. To delete multiple assignments, the `/_action/sync` route can also be used here:

```text
{
    // This key can be defined individually
    "unassign-media": {
        "entity": "product_media",
        "action": "delete",
        "payload": [
            { "id": "5f78f2d4b19f49648eb1b38881463da0" },
            { "id": "18ada8e085d240369d06bb4b11eed3b5" }
        ]
    }
}
```

## Setting the cover

The `cover` of a product is controlled via `coverId` and the `cover` association. This contains a direct reference to a `product_media` entity. To set the cover of a product the following payload can be used:

```text
{
    "name": "test",
    "productNumber": "random",
    "stock": 10,
    "taxId": "5f78f2d4b19f49648eb1b38881463da0",
    "price": [
        { "currencyId" : "b7d2554b0ce847cd82f3ac9bd1c0dfca", "gross": 15, "net": 10, "linked" : false }
    ],
    "coverId": "00a9742db2e643ccb9d969f5a30c2758"
}
```

To reset the cover, the value `null` can be passed instead of a UUID.

## Visibility handling

The `visibilities` control in which sales channel the product should be visible. This association is a `one-to-many` association.

Instead of just assigning a sales channel, the data structure allows a specification where the product should be displayed inside the sales channel using the `visibility` property.

This can be set to three different values:

| **Visbility** | **Behaviour** |
| :--- | :--- |
| 10 | The product is only available via a direct link. It does not appear in listings or searches. |
| 20 | The product is only available via a direct link or search. The product is not displayed in listings. |
| 30 | The product is displayed everywhere. |

Since visibility can be configured per sales channel, the entity also has its own ID. This is needed to delete or update the assignment later. To assign a product to several sales channels, the following payload can be used:

```javascript
{
    "name": "test",
    "productNumber": "random",
    "stock": 10,
    "taxId": "5f78f2d4b19f49648eb1b38881463da0",
    "price": [
        { "currencyId" : "b7d2554b0ce847cd82f3ac9bd1c0dfca", "gross": 15, "net": 10, "linked" : false }
    ],
    "visibilities": [
        { "id": "5f78f2d4b19f49648eb1b38881463da0", "salesChannelId": "98432def39fc4624b33213a56b8c944d", "visibility": 20 },
        { "id": "b7d2554b0ce847cd82f3ac9bd1c0dfca", "salesChannelId": "ddcb57c32d6e4b598d8b6082a9ca7b42", "visibility": 30 }
    ]
}
```

Deleting a sales channel assignment is done via the route `/api/product/{productId}/visibilities/{visibilityId}`. To delete several assignments at once, the `/_action/sync` route can be used:

```text
{
    // This key can be defined individually
    "unassign-media": {
        "entity": "product_visibility",
        "action": "delete",
        "payload": [
            { "id": "5f78f2d4b19f49648eb1b38881463da0" },
            { "id": "b7d2554b0ce847cd82f3ac9bd1c0dfca" }
        ]
    }
}
```

## Variant handling

Variants are child elements of a product. As soon as a product is configured with variants, the parent product is only a kind of container. To create a variant, the following properties are required:

* `parentId` \[string\]      - Defines for which product the variant should be created
* `stock` \[int\]            - Defines the stock of the variant
* `productNumber` \[string\] - Defines the unique product number
* `options` \[array\]        - Defines the characteristic of the variant.

```javascript
{
    "id": "0d0adf2a3aa1488eb177288cfac9d47e",
    "parentId": "17f255e0a12848c38b7ec6767a6d6adf",
    "productNumber": "child.1",
    "stock": 10,
    "options": [
        {"id": "0584efb5f86142aaac44cc3beeeeb84f"},    // red
        {"id": "0a30f132eb1b4f34a05dcb1c6493ced7"}  // xl
    ]
}
```

## Inheritance

Data that is not defined in a variant, is inherited from the parent product. If the variants have not defined their own `price`, the `price` of the parent product is displayed. This logic applies to different fields, but also to associations like `product.prices`, `product.categories` and many more.

To define a separate `price` for a variant, the same payload can be used as for a non-variant products:

```javascript
{
    "id": "0d0adf2a3aa1488eb177288cfac9d47e",
    "parentId": "17f255e0a12848c38b7ec6767a6d6adf",
    "productNumber": "child.1",
    "stock": 10,
    "options": [
        {"id": "0584efb5f86142aaac44cc3beeeeb84f"},    // red
        {"id": "0a30f132eb1b4f34a05dcb1c6493ced7"}  // xl
    ],
    "price": [
        { "currencyId" : "b7d2554b0ce847cd82f3ac9bd1c0dfca", "gross": 15, "net": 10, "linked" : false }
    ]
}
```

To restore inheritance, the value `null` can be passed for simple data fields:

```text
// PATCH /api/product/0d0adf2a3aa1488eb177288cfac9d47e
{
    "price": null
}
```

In order to have an association such as `product.prices` inherited again from the parent product, the corresponding entities must be deleted.

If a variant is read via `/api`, only the not inherited data is returned. The data of the parent is not loaded here. In the `store-api`, however, the variant is always read with the inheritance, so that all information is already available to display the variant in a shop.

However, it is also possible to resolve the inheritance in the `/api` by providing the `sw-inheritance` header.

## Configurator handling

To create a complete product with variants, not only the variants have to be created but also the corresponding `options` have to be configured. For the variants this is done via the `options` association. This association defines the characteristics of the variant, i.e. whether it is the yellow or red t-shirt. For the parent product, the `configuratorSettings` association must be defined. This defines which options are generally available. The Admin UI and the Storefront UI are built using this data. The following payload can be used to generate a product with the variants: red-xl, red-l, yellow-xl, yellow-l.

```javascript
{
    "stock": 10,
    "productNumber": "random",
    "name": "random",
    "taxId": "9d4a11eeaf3a41bea44fdfb599d57058",
    "price": [
        {
            "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
            "net": 1,
            "gross": 1,
            "linked": true
        }
    ],
    "configuratorGroupConfig": [
        {
            "id": "d1f3079ffea34441b0b3e3096ac4821a",       //group id for "color"
            "representation": "box",
            "expressionForListings": true                   // display all colors in listings
        },
        {
            "id": "e2d24e55b56b4a4a8f808478fbd30333",       // group id for "size"
            "representation": "box",
            "expressionForListings": false
        }
    ],
    "children": [
        {
            "productNumber": "random.4",
            "stock": 10,
            // own pricing
            "price": [
                {
                    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
                    "net": 1,
                    "gross": 1,
                    "linked": true
                }
            ],
            "options": [
                { "id": "4053fb11b4114d2cac7381c904651b6b" },   // size:  L
                { "id": "ae821a4395f34b22b6dea9963c7406f2" }    // color: yellow
            ]
        },
        {
            "productNumber": "random.3",
            "stock": 10,
            "options": [
                { "id": "ea14a701771148d6b04045f99c502829" },   // size:  XL
                { "id": "ae821a4395f34b22b6dea9963c7406f2" }    // color: yellow
            ]
        },
        {
            "productNumber": "random.1",
            "stock": 10,
            "options": [
                { "id": "ea14a701771148d6b04045f99c502829" },   // size:  XL
                { "id": "0b9627a94fc2446498ec6abac0f03581" }    // color: red
            ]
        },
        {
            "productNumber": "random.2",
            "stock": 10,
            "options": [
                { "id": "4053fb11b4114d2cac7381c904651b6b" },   // size:  L
                { "id": "0b9627a94fc2446498ec6abac0f03581" }    // color: red
            ]
        }
    ],
    "configuratorSettings": [
        { "optionId": "0b9627a94fc2446498ec6abac0f03581" },     // color: red
        { "optionId": "4053fb11b4114d2cac7381c904651b6b" },     // size:  L
        { "optionId": "ae821a4395f34b22b6dea9963c7406f2" },     // color: yellow
        { "optionId": "ea14a701771148d6b04045f99c502829" }      // size:  XL
    ]
}
```

