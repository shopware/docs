# Fastly

Fastly allows Shopware to store the HTTP Cache at the nearest edge server to the end customer. This saves a lot of resources as the cached responses don't reach the actual application, and it decreases the response time drastically worldwide. Another benefit is that the Redis cache is not used anymore and will have less cache items.

## Setup

::: info
Fastly is supported in Shopware versions 6.4.11 or newer.
:::

1. Make sure `FASTLY_API_TOKEN` and `FASTLY_SERVICE_ID` are set in the environment or contact the support when they are missing.
1. Install the Fastly Composer package using `composer req paas`.
1. Disable caching in the `.platform/routes.yaml`.
1. Push the new config and Fastly gets enabled.
