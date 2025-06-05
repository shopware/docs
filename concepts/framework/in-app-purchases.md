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

## Token
Bought in-app purchases are provided as a signed JSON Web Token (JWT) per extension.
This prevents anyone from tampering with or spoofing purchased IAPs and provides a way to verify their authenticity.

The JWKS for verifing the JWT signature is provided under `https://api.shopware.com/inappfeatures/jwks`.
Shopware automatically verifies the signature for the use within the Core or Admin.

All tokens are fetched either when a new purchase is made or periodically.
A update can be forced with the command `bin/console scheduled-task:run-single in-app-purchase.update` or by calling the `/api/_action/in-app-purchases/refresh` endpoint

## Extensions
In-App purchases are designed to work well with app servers.
Each time Shopware makes a request to the app server, the app server is provided with an [IAP JWT](#token), which it can use to verify the authenticity and validity of active purchases and enable features.

While IAPs can work with plugins, due to the open nature is almost impossible to do it securely and spoof-proof.

<PageRef page="../../guides/plugins/apps/in-app-purchase" title="In-App purchases for Apps" />
<PageRef page="../../guides/plugins/plugins/in-app-purchase" title="In-App purchases for Plugins" />
