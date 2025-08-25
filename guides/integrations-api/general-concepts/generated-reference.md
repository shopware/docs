---
nav:
  title: Generated Reference
  position: 30

---

# Generated Reference

Shopware generates schemas for both HTTP APIs that can be interpreted by API client libraries and documentation tools, such as [Swagger.io](https://swagger.io/).

These schemas are generated using PHP annotations based on the [swagger-php](https://github.com/zircote/swagger-php) library. When building API extensions, you can also leverage these annotations to let Shopware generate standardized endpoint documentation for your custom endpoints on-the-fly.

::: warning
Due to security restrictions, your **`APP_ENV`** environment variable has to be set to **`dev`** to access any of the specifications described below.
:::

## Stoplight

The easiest way to access the generated schema is Stoplight. [Stoplight](https://docs.stoplight.io/) is a collaborative platform equipping your team with tooling across the API lifecycle that helps them build quality APIs efficiently. Shopware already ships with these user interfaces. They are accessible at the following endpoint relative to their respective base path:

```text
/(api|store-api)/_info/stoplightio.html
```

::: info
The above path is relative and contains `api` (Admin API) and `store-api` seperated by a pipe. Please choose the appropriate option.
:::

You will find a list of all generic endpoints (entity endpoints like product, category, etc.) for the **Admin API** here `api/_info/stoplightio.html?type=jsonapi#/` or access it via the top navigation bar.

## OpenAPI schema

If you don't want to bother with the UI but just fetch the schema definition instead, use the following endpoint:

```text
/(api|store-api)/_info/openapi3.json
```

## Entity schema

If you would like to access the schema definitions of all available entities instead of an endpoint reference, use one of the corresponding schema endpoints instead:

```text
/(api|store-api)/_info/open-api-schema.json
```
