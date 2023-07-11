# Stock

{% hint style="info" %}
This documentation concerns the new stock management system implemented in Shopware 6.5.4.0. It is only enabled if the shop owner has the `STOCK_HANDLING` feature flag enabled.
{% endhint %}

The stock inventory system allows products to be assigned stock. Stock is incremented and decremented as orders are placed, modified, cancelled and refunded.

In order to accommodate for the various different use-cases, the system has been kept as simple as possible, with the ability to be completely disabled by the shop owner if not required.
