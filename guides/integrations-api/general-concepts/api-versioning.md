---
nav:
  title: API Versioning
  position: 40

---

# API Versioning

## Overview

Starting with Shopware version 6.4.0.0, we decided to change our API versioning strategy. This article will cover what has been done and changed, how it used to be, and what the version strategy looks like now.

### Versioning prior to 6.4.0.0

Prior to Shopware 6.4.0.0, the API version was mainly found in the routes themselves.

`/api/v3/example-route`

By using the version, one could ensure that his application keeps on working because we are not going to introduce breaking changes within a version. Yet, versions had to be removed every now and then, which would then still break the application.

More on this can be found in our guide [ADR regarding the API version removal](https://github.com/shopware/platform/blob/6.4.0.0/adr/2020-12-02-removing-api-version.md) section.

### Versioning starting with 6.3.5.0

With Shopware 6.4.0.0, we removed the API version from the routes.

**Old**:

`/api/v3/example-route`

**New**:

`/api/example-route`

The version inside the route will keep working with Shopware 6.3.\*, but it will be removed with the next major Shopware version, 6.4.0.

### Deprecations

Deprecations are now added with patch and minor releases but only removed with a major release. This has always been the case for the Core and is now adapted to the API.

Also, deprecated fields and routes are now shown in the Swagger documentation. Have a look at the FAQ beneath to learn how to open Swagger. Have a look for the `@deprecated` annotation on routes or the `Deprecated` flag on entity fields to see which fields or routes are deprecated in the code.

### Route and field availability

The Swagger API reference now includes the necessary information about the route and field availability. For routes, this can look like this:

![Availability route](../../../.gitbook/assets/availability_route.png)

Note the availability information.

Same for fields, here is an example of how it would look like:

![Availability field](../../../.gitbook/assets/availability_field.png)

### API expectations

API expectations can be used as a request header to define necessary conditions for the server side. Example conditions could be the Shopware version, the existence of plugins, or the version of a plugin. There are some examples:

```text
GET /api/test
sw-expect-packages: shopware/core:~6.4
```

This would expect that at least Shopware with version 6.4 is installed.

```text
GET /api/test
sw-expect-packages: shopware/core:~6.4,swag/paypal:*
```

This would expect that the Shopware version is at least 6.4 and PayPal is installed in any version.

If the conditions are not met, the backend will answer with a *417 Expectation Failed* error.

## FAQ

### I ensure that my application will keep on working by using the version in the route. What now?

Yes, this was necessary for the previous versioning strategy since breaks were also introduced with Shopware minor releases. The new versioning strategy comes with the benefit that breaks are only introduced with major releases, which were always breaking anyway. Thus, one route will keep working for you until the next major release.

### How do I get the currently used version via the API?

You can read the currently used version in the API as well. Starting with Shopware 6.3.5.0, you can use this route to fetch the current version: `GET /api/_info/version`

Prior to that, the version was readable using the following route: `GET /api/v2/_info/config`

### How do I open up the Swagger page?

Simply navigate to the following URL in your shop: `/api/_info/swagger.html`
