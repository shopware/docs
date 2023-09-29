---
nav:
  title: Stock
  position: 20

---

# Stock Configuration

When running Shopware 6 there are various configuration options you can use to customize your installation. These configurations reside in the general [bundle configuration](../../../../guides/hosting/configurations/).

Some features of Shopware are only activated when the corresponding feature flag is enabled. Feature flags can be enabled in your project's `.env` file:

<<< @/docs/snippets/config/stock.sh

## Enable stock management system

As of Shopware 6.5.5, the stock management system has been rewritten. The `product.stock` field is now the primary source for real-time product stock values.

The new system is not enabled by default. To enable it, set the `STOCK_HANDLING` feature flag to `1`.

<<< @/docs/snippets/config/stock.sh

In the next major version of Shopware, the new stock management system will become the default.

## Disable stock management system

Please note this only applies if you have the `STOCK_HANDLING` feature flag enabled.

You can completely disable Shopware's default stock management system. When disabled, none of the event subscribers for order transitions will be executed. In practice, this means that none of the subscribers in `Shopware\Core\Content\Product\Stock\OrderStockSubscriber` will be executed.

To disable, set `shopware.stock.enable_stock_management` to `false`:

<<< @/docs/snippets/config/stock_disabled.yaml

For more detailed implementation refer to [Stock](../../../../guides/plugins/plugins/content/stock/) guide section.
