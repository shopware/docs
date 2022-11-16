# Custom Pricing

The Custom Pricing feature allows massive advances in the pricing model capabilities in the Shopware 6 ecosystem.

The API interface exposed by this module allows the user to operate a set of commands which will enable the granular
''overriding'' of prices via an external data repository or ERP system. This is achieved by defining a custom
relationship between the current price and one of the following entities:

- Customer

## Pre-requisites and setup

As Custom Pricing is part of the Commercial plugin, it requires an existing Shopware 6 installation and the activated
Shopware 6 Commercial plugin on top. This plugin Commercial plugin can be installed as per the familiar
[install instructions](guides/plugins/plugins/plugin-base-guide#install-your-plugin). In addition, the `Custom Prices` feature needs
to be activated within the relevant merchant account.

## Working with the API route

To create, alter and/or delete customer-specific prices, you can use the API endpoint `/api/_action/product-customer-price`. As like with any other admin request in Shopware, you first need to authenticate yourself. Therefore, please head over to the
[authentication guide](https://shopware.stoplight.io/docs/admin-api/ZG9jOjEwODA3NjQx-authentication) for details.

Otherwise, the Custom Pricing API interface models itself upon the interface of the sync API, so you will
be able to package your requests similarly, see our [API documentation](https://shopware.stoplight.io/docs/admin-api).

{% hint style="info" %}
You can use the route with single `upsert` and `delete` actions or even combine those in a single request: you can pack several different commands inside one sync API request, and each of them is executed in an independent and isolated way
{% endhint %}

So, it's not surprising that the request body looks like a familiar sync request. In the payload for the `upsert` action, you pass the following data:

- `productId`: The product whose price should be overwritten
- `customerId`: The customer for whom we will assign a custom price
- `price`: The new custom price you want to use.

This way, we come to use a payload as seen in the example below:

```json
[
  {
    "action": "upsert",
    "payload": [
      {
        "productId": "0001e32041ac451386bf9b7351c540f3",
        "customerId": "02a3c82b5ca842c492f8656029b2e63e",
        "price": [
          {
            "quantityStart": 1,
            "quantityEnd": null,
            "price": [
              {
                "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
                "gross": 682.0,
                "net": 682.0,
                "linked": true
              }
            ]
          }
        ]
      }
    ]
  }
]
```

For the `delete` action, we will send a smaller dataset: you only need to define the `productId`s for the product whose prices you want to remove.

```json
[
  {
    "action": "delete",
    "payload": [
      {
        "productIds": [
          "0001e32041ac451386bf9b7351c540f3",
          "363a6985f6434a7493b1ef3dabeed40f"
        ]
      }
    ]
  }
]
```

{% hint style="info" %}
In case of an error occurs, the response will not return an error code - which is typical for the sync API; instead, any validation errors will be stored within the `errors` key.
{% endhint %}

{% hint style="warning" %}
When working with this route, one difference sets it apart from the familiar `sync` requests: You cannot specify headers to adapt the endpoint's behavior.
{% endhint %}

## Known caveats or issues

When working with custom prices, there are currently some caveats or issues to keep in mind:

- Price filtering (within the product listing page) will _currently_ not support the overridden prices.
- ElasticSearch product mapping does not currently support the Custom Pricing data
- Optional header flags within the core `sync` API are not supported within the provided endpoint
(`indexing-behavior, single-operation`). Indexing of any relevant database (product) data is handled on a per-request basis, without the need to specify indexing handling.
- The `customerGroupId` parameter within a Custom Pricing API request body is a stub implementation to avoid breaking

changes in future versions and is not currently functional. Any data provided for this parameter will not affect the storefront.
