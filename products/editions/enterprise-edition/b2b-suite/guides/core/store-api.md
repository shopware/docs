# Store API

We use swagger.io for the documentation of our B2B-Suite endpoints. The created [swagger.json](https://gitlab.com/shopware/shopware/enterprise/b2b/-/blob/minor/swagger.json) file can be displayed with [swagger ui](http://swagger.io/swagger-ui/).

Table of contents

* [Description](#description)
* [Authentication](#authentication)
* [Route pattern](#route-pattern)
* [Route replacement examples](#route-replacement-examples)

## Description

The B2B-Suite is compatible with the Shopware 6 Store API.

## Authentication

Every request needs two headers:

*   `sw-context-token`: At first you'll need to authenticate as a customer by sending a `POST` request to the `/account/login` route to obtain a context token.
*   `sw-access-key`: The access key for the Store API can be found in the administration, when you're editing a SalesChannel.

Please read the [official Store API guide](https://shopware.stoplight.io/docs/store-api/ZG9jOjEwODA3NjQx-authentication-and-authorisation) to learn more about the authentication.

## Route pattern

The route pattern is basically the same as in the admin api, but without the identity identifier, 
because the identity is fetched from the context token.

### Route replacement examples

*   `/api/b2b/debtor//address/type/` becomes `/store-api/v3/b2b/address/type/`
*   `/api/b2b/debtor//offer` becomes `/store-api/v3/b2b/offer`
*   `/api/b2b/debtor//order` becomes `/store-api/v3/b2b/order`