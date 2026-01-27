---
nav:
  title: Stock
  position: 20

---

# Stock Configuration

When running Shopware 6 there are various configuration options you can use to customize your installation. These configurations reside in the general [bundle configuration](../../../../guides/hosting/configurations/).

## Stock management system

The stock management system manages stock levels automatically when orders are placed, cancelled, or completed. The `product.stock` field is the primary source for real-time product stock values.

The stock management system is enabled by default. No additional configuration is required.

## Disable stock management system

You can completely disable Shopware's default stock management system. When disabled, the `product.stock` field will not be updated automatically when orders are placed or completed.

To disable, set `shopware.stock.enable_stock_management` to `false`:

<<< @/docs/snippets/config/stock_disabled.yaml

For more detailed implementation refer to [Stock](../../../../guides/plugins/plugins/content/stock/) guide section.

<!-- {"WATCHER_URL":"https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/Resources/config/packages/shopware.yaml","WATCHER_HASH":"183f85ba8f15e8e7d0006b70be20940f","WATCHER_CONTAINS":"enable_stock_management"} -->
