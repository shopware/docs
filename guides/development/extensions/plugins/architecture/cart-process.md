---
nav:
  title: Cart Extension Architecture
  position: 30

---

# Cart Extension Architecture

The cart is recalculated multiple times per request to resolve dependencies between line items. Custom extensions must follow strict performance and determinism rules.

## Design principles

* Cart processing is multi-pass and must remain deterministic.
* Data loading must be separated from calculation to ensure stable performance.
* Price logic must be centralized and reusable.

## Extension guidelines

* Use `CartDataCollector` to load external data once.
* Use `CartProcessor` to modify calculated items.
* Never perform database queries in `process()`.
* Always use `PriceCalculator` classes for price adjustments.

## Technical rules

* `CartProcessorInterface::process()` must not execute queries, as it runs multiple times per request.
* The `\Shopware\Core\Checkout\Cart\CartDataCollectorInterface::collect()` method must check whether data was already loaded and append it to `CartDataCollection`. This is to avoid having to execute unnecessarily many queries on the database.
* Line items must be created via a `LineItemFactoryHandler` class.
* All price calculations must use the `Shopware\Core\Checkout\Cart\Price` calculators, which are stored inside the `Shopware\Core\Checkout\Cart\Price` class.
* Cart-related functions must be mapped via corresponding Store API routes in the `Shopware\Core\Checkout\Cart\SalesChannel` namespace.
