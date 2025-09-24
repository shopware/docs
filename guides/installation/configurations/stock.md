---
nav:
  title: Stock Management
  position: 20

---

# Stock Management

When running Shopware 6 there are various configuration options you can use to customize your installation. These configurations reside in the general [bundle configuration](../../../../guides/hosting/configurations/).

## Stock management system

As of Shopware 6.5.5, the stock management system has been rewritten. The `product.stock` field is now the primary source for real-time product stock values.

The new system is **enabled by default** and automatically manages product stock levels. When enabled, Shopware will:

- **Decrease stock** when orders are placed and order transactions are processed
- **Increase stock** when orders are cancelled or returned
- **Track stock levels** in real-time across all sales channels
- **Prevent overselling** by checking stock availability during checkout

This ensures accurate inventory management and prevents stock discrepancies. In the next major version of Shopware, this will be the only available stock management system.

## Disable stock management system

You can completely disable Shopware's automatic stock management system. When disabled:

- **Stock levels will not be automatically updated** when orders are placed, cancelled, or returned
- **No stock validation** will occur during checkout (potentially allowing overselling)
- **Manual stock management** will be required to track inventory changes

To disable, set `shopware.stock.enable_stock_management` to `false`:

<<< @/docs/snippets/config/stock_disabled.yaml

For more detailed implementation refer to [Stock](../../../../guides/plugins/plugins/content/stock/) guide section.

<!-- {"WATCHER_URL":"https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/Resources/config/packages/shopware.yaml","WATCHER_HASH":"183f85ba8f15e8e7d0006b70be20940f","WATCHER_CONTAINS":"enable_stock_management"} -->
