---
nav:
  title: Public APIs
  position: 100

---

# Public APIs

* Services not intended for decoration or direct use must be marked with `@internal` and have an appropriate comment in the docblock why they should not be used or decorated directly.
* Classes marked with `@internal` need not be kept compatible for third-party developers. Here the public API can change at any time.
* `__construct` methods of services instantiated via DI container are not public API and can be changed at any time.
* `__construct` functions of Data Transfer Objects \(DTO\), which the developer himself could therefore instantiate \(e.g. `CalculatedPrice`, `QuantityPriceDefinition`\), are public API and must be kept backward compatible.
