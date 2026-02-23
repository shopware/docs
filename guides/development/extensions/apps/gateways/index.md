---
nav:
  title: Gateways
  position: 40
---

# Gateways

Gateways allow apps and plugins to influence Shopware behavior at runtime by delegating decisions to an external app server.

They are designed for dynamic, context-aware business logic that cannot be handled purely inside the Shopware instance.

Use a gateway to:

* Restrict or modify checkout behavior
* Manipulate the customer context dynamically
* Control In-App Purchase availability
* Apply external business logic during runtime
* Integrate secure server-side decision-making

Gateways require a reachable and properly secured app server, as Shopware forwards sensitive contextual data during execution.

## Available gateways

* <PageRef page="./checkout-gateway" />
* <PageRef page="./context-gateway" />
* <PageRef page="./in-app-purchase-gateway" />

## Command references

Each gateway supports a defined set of executable commands:

* <PageRef page="./command-reference" />  
* <PageRef page="./checkout-gateway-command-reference" />
