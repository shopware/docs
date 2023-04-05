---
nav:
  title: Cart Process
  position: 30

---

# Cart Process

* Within `\Shopware\Core\Checkout\Cart\CartProcessorInterface::process`, no queries may be executed because this method is executed several times in a row to resolve the dependencies of the elements in the shopping cart.
* The `\Shopware\Core\Checkout\Cart\CartDataCollectorInterface::collect` method must always check if the required data has already been loaded. This is to avoid having to execute unnecessarily many queries on the database. The loaded data will be appended to the passed *CartDataCollection*.
* The creation of line items must always take place via a `LineItemFactoryHandler` class.
* All price calculations must take place via an appropriate `PriceCalculator`. All price calculators are stored inside the `Shopware\Core\Checkout\Cart\Price` class.
* All shopping cart functions must be mapped via a corresponding store API route. The routes are located in the `Shopware\Core\Checkout\Cart\SalesChannel` namespace.
