---
nav:
  title: Gateways
  position: 100
---

# Gateways

Gateways allow apps to influence Shopware behavior at runtime by delegating decisions to an external app server.

They are designed for dynamic, context-aware business logic that cannot be handled purely inside the Shopware instance.

Use a gateway to:

* Restrict or modify checkout behavior
* Manipulate the customer context dynamically
* Control In-App Purchase availability
* Apply external business logic during runtime
* Integrate secure server-side decision-making

Gateways require a reachable and properly secured app server, as Shopware forwards sensitive contextual data during execution.

## Available gateways

* [Checkout](./checkout/checkout-gateway.md)
* [Context](./context/context-gateway.md)
* [In-App Purchases](./in-app-purchase/in-app-purchase-gateway.md)

Each gateway supports a defined set of executable commands.
