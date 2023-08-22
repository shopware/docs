# Stock

{% hint style="info" %}
This documentation concerns the new stock management system implemented in Shopware 6.5.4.0. It is only enabled if the shop owner has enabled the `STOCK_HANDLING` feature flag.
{% endhint %}

The stock management system allows the allocation of stocks to products. Stock is incremented and decremented as orders are placed, modified, canceled, and refunded.

In order to accommodate for the various use cases, the stock management system has been kept as simple as possible. The shop owner can deactivate it entirely if not required.
