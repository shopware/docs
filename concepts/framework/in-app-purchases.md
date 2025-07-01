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

In-App Purchases can be created in the Shopware Account. You can find out how to do this in the [Documentation for Extension Partner](https://docs.shopware.com/en/account-en/extension-partner/in-app-purchases).

## Token

Each in-app purchase is represented by a signed JSON Web Token (JWT), issued per extension.
This JWT ensures that purchase data cannot be tampered with or spoofed and allows verification of its authenticity.
All bought In-App Purchases are part of the JWT claims.

To verify the JWT signature, you can use the JSON Web Key Set (JWKS) available at [`https://api.shopware.com/inappfeatures/jwks`](https://api.shopware.com/inappfeatures/jwks)
Shopware automatically verifies the signature for the use within the Core and Admin.

Tokens are retrieved when a new purchase is made and during periodic updates.
You can also manually trigger an update by running the command `bin/console scheduled-task:run-single in-app-purchase.update` or by calling the `/api/_action/in-app-purchases/refresh` endpoint.

## Extensions

In-app purchases are optimized for use with app servers.

Whenever Shopware sends a request to the app server, it includes the [IAP JWT](#token).
The app server can use this token to validate active purchases and unlock related features accordingly.

Plugins are inherently less secure, as their open nature makes them more vulnerable to spoofing or tampering.

<PageRef page="../../guides/plugins/apps/in-app-purchases" title="In-App purchases for Apps" />
<PageRef page="../../guides/plugins/plugins/in-app-purchases" title="In-App purchases for Plugins" />

## Checkout Process

When integrating In-App Purchases, Shopware handles the entire checkout process for you—including payment processing and subscription management.

To initiate a purchase, simply provide the identifier of the desired In-App Purchase. This will trigger a modal window where the user can complete the transaction.
