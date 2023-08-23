# Configuration

## Overview

When running Shopware 6, you can use various configuration options to customize your installation. This page will give you an overview of the different configuration options and how they affect Shopware. The configuration for Shopware 6 resides in the general bundle configuration:

```text
<project root>
└── config
   └── packages
      └── shopware.yaml
```

## Feature Flags

Some features of Shopware are only activated when the corresponding feature flag is enabled. Feature flags can be enabled in your project's `.env` file:

{% code title="<project root>/.env" %}

```shell
STOCK_HANDLING=1
```

{% endcode %}

### Stock

#### Enable stock management system

As of Shopware 6.5.4, the stock management system has been rewritten. The `product.stock` field is now the primary source for real-time product stock values.

The new system is not enabled by default. To enable it, set the `STOCK_HANDLING` feature flag to `1`.

{% code title="<project root>/.env" %}

```shell
STOCK_HANDLING=1
```

{% endcode %}

In the next major version of Shopware, the new stock management system will become the default.

#### Disable stock management system

Please note this only applies if you have the `STOCK_HANDLING` feature flag enabled.

You can completely disable Shopware's default stock management system. When disabled, none of the event subscribers for order transitions will be executed. In practice, this means that none of the subscribers in `Shopware\Core\Content\Product\Stock\OrderStockSubscriber` will be executed.

To disable, set `shopware.stock.enable_stock_management` to `false`:

{% code title="<project root>/config/packages/shopware.yaml" %}

```yaml
shopware:
  stock:
    enable_stock_management: false
```

{% endcode %}
