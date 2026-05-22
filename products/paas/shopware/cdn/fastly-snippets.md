---
nav:
  title: Fastly Snippet
  position: 43
---

# Overview

This section provides comprehensive information about Fastly Snippet configuration.

## Storefront service

To deploy Fastly snippet for the `storefront` service you need to install the following recipe: `shopware/fastly-meta`.
For more information about this recipe, please have a look [here](https://github.com/shopware/fastly-meta).

The `FASTLY_API_KEY` and `FASTLY_SERVICE_ID` are automatically provided to the Shopware instance.

The snippet are automatically installed and configured during the application deployment, no further actions is needed.

## Limitation

For now only the snippets for the `storefront` service can be configured. We are working on provided a unified experience in regard to snippet management for both services (`storefront` and `cdn`)
