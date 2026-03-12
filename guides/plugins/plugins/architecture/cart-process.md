---
nav:
  title: Cart Extension Architecture
  position: 30

---

# Cart Extension Architecture

## Extension guidelines

* `CartProcessorInterface::process()` must not execute queries, as it runs multiple times per request to resolve the dependencies of the elements in the shopping cart.
* The `\Shopware\Core\Checkout\Cart\CartDataCollectorInterface::collect()` method must check whether the required data was already loaded. This is to avoid executing unnecessary queries on the database. loaded data will be appended to `CartDataCollection`.
* Line items must be created via a `LineItemFactoryHandler` class.
* All price calculations and adjustments must take place via an appropriate `PriceCalculator`, which is stored inside the `Shopware\Core\Checkout\Cart\Price` class.
* Cart-related functions must be mapped via corresponding Store API routes in the `Shopware\Core\Checkout\Cart\SalesChannel` namespace.
