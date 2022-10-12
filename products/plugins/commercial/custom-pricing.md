# Custom Pricing

The Custom Pricing feature allows massive advances in the pricing model capabilities in the Shopware 6 ecosystem.

The API interface exposed by this module allows the user to operate a set of commands which allow for the granular 'overriding' of prices via an external data repository or ERP system. This is achieved by defining a custom relationship between a existing price and one of the following entities:

- Customer

<!-- These price->entity relationships will come later
- Customer Group 
- Group Id
- Rule Id
-->

## API usage

The Custom Pricing API interface models itself upon the interface of the sync API, therefore you will be able to package your requests in a similar manner, see our [API documentation](https://shopware.stoplight.io/docs/admin-api).

## Setup

### Requirements

- Installed Shopware 6
- Commercial plugin is installed as per the [install instructions](guides/plugins/plugins/plugin-base-guide#install-your-plugin)
- An activated 'CustomPricing' feature within the merchant's account

## Known caveats or issues

- Price filtering (within the product listing page) will _currently_ not support the overridden prices.
- ElasticSearch product mapping does not currently support the Custom Pricing data
- Optional header flags within the core sync API are not supported within the provided endpoint (`indexing-behavior, single-operation`). Indexing of any relevant database (product) data is handled on a per-request basis, without the need to specify indexing handling.
- The 'customerGroupId' parameter within a Custom Pricing API request body is a stub implementation to avoid breaking changes in future versions, and is not currently functional. Any data provided for this parameter will not provide an effect to the storefront.
