---
nav:
  title: In-App Purchases
  position: 90

---

# In-App purchases (IAP)

::: info
In-App Purchase is available since Shopware version 6.6.9.0
:::

In-App Purchases are a way to lock certain features behind a paywall within the same extension.
This is useful for developers who want to offer a free version of their extension with limited features and a paid version with more features.

## Creation

In-App Purchases can be created in the Shopware Account.

<!-- Link to Account docs -->

## Token

Each in-app purchase is represented by a signed JSON Web Token (JWT), issued per extension.
This JWT ensures that purchase data cannot be tampered with or spoofed and allows verification of its authenticity.
All bought In-App Purchases are part of the JWT claims.

To verify the JWT signature, you can use the JSON Web Key Set (JWKS) available at: [https://api.shopware.com/inappfeatures/jwks](https://api.shopware.com/inappfeatures/jwks)
Shopware automatically verifies the signature for the use within the Core and Admin.

Tokens are retrieved when a new purchase is made and during periodic updates.
You can also manually trigger an update by running the command `bin/console scheduled-task:run-single in-app-purchase.update` or by calling the `/api/_action/in-app-purchases/refresh` endpoint.

## Extensions

In-app purchases are optimized for use with app servers.

Whenever Shopware sends a request to the app server, it includes the [IAP JWT](#token).
The app server can use this token to validate active purchases and unlock related features accordingly.

Plugins are inherently less secure, as their open nature makes them more vulnerable to spoofing or tampering.

<PageRef page="../../guides/plugins/apps/in-app-purchase" title="In-App purchases for Apps" />
<PageRef page="../../guides/plugins/plugins/in-app-purchase" title="In-App purchases for Plugins" />

## Checkout Process

When integrating In-App Purchases, shopware takes care of the whole checkout process, including payment handling and subscription management.

To trigger the checkout process, you need to provide the identifier of the In-App Purchase you want to offer. This will trigger a modal that allows the user to complete the purchase.
