---
nav:
  title: HTTP Reverse Proxy Configuration
  position: 43
---

# HTTP Reverse Proxy Configuration

## Overview

Shopware supports Fastly as an HTTP reverse proxy out of the box.
Shopware is automatically configured with this feature enabled.

## Configuration

To override these defaults, add the variables to `app.environment_variables` in your [`application.yaml`](../fundamentals/environment-variables.md) with `scope: RUN`, then redeploy the application. The following default values apply:

- `HTTP_CACHE_CONTROL_STALE_WHILE_REVALIDATE`: Sets the `stale-while-revalidate` directive of the `Cache-Control` header sent by Shopware. After a cached page expires or is soft-purged (for example, after a product update), Fastly keeps serving the outdated (stale) page for this duration while it fetches a fresh version from Shopware in the background. Customers get a fast cached response instead of waiting for the page to be regenerated. The default value is `300` seconds.
- `HTTP_CACHE_CONTROL_STALE_IF_ERROR`: Sets the `stale-if-error` directive of the `Cache-Control` header sent by Shopware. If Shopware is unreachable or returns an error (for example, a `5xx` response during a deployment or an outage), Fastly keeps serving the outdated (stale) cached page for this duration instead of showing an error page to customers. The default value is `3600` seconds.
