---
nav:
  title: Fastly Snippets
  position: 43
---

# Overview

This section provides comprehensive information about Fastly snippets configuration.

## Storefront service

To deploy Fastly snippets for the `storefront` service, you need to install the following recipe: `shopware/fastly-meta`.
For more information about this recipe, please have a look [here](https://github.com/shopware/fastly-meta).

The `FASTLY_API_KEY` and `FASTLY_SERVICE_ID` are automatically provided to the Shopware instance.

The snippets are automatically installed and configured during the application deployment, and no further action is needed.

## Limitation

For now only the snippets for the `storefront` service can be configured. We are working on providing a unified experience in regard to snippet management for both services (`storefront` and `cdn`)
