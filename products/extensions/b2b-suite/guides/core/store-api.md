# Store API

We use swagger.io for the documentation of our B2B Suite endpoints. The created [swagger.json](https://gitlab.com/shopware/shopware/enterprise/b2b/-/blob/minor/swagger.json) file can be displayed with [Swagger UI](http://swagger.io/swagger-ui/).

## Description

The B2B Suite is compatible with the Shopware 6 Store API.

## Authentication

Every request needs two headers:

* **`sw-context-token`**: First, you will need to authenticate as a customer by sending a `POST` request to the `/account/login` route to obtain a context token.
* **`sw-access-key`**: The access key for the Store API can be found in the Administration when editing a SalesChannel.

Refer to the [Store API](https://shopware.stoplight.io/docs/store-api/ZG9jOjEwODA3NjQx-authentication-and-authorisation) guide to learn more about authentication.

## Route pattern

The route pattern is basically the same as in the Admin API but without the identity identifier because the identity is fetched from the context token.

### Route replacement examples

* `/api/b2b/debtor/address/type/` becomes `/store-api/b2b/address/type/`
* `/api/b2b/debtor/offer` becomes `/store-api/b2b/offer`
* `/api/b2b/debtor/order` becomes `/store-api/b2b/order`
