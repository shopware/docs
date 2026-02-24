---
nav:
  title: Plugin Architecture
  position: 1

---

# Plugin Architecture

This section defines the architectural rules and extension contracts for core subsystems.

These documents describe how to safely extend Shopware without breaking determinism, performance, or system boundaries.

## Subsystems

* [Cart Extension Architecture](cart-process.md)
* [Rule System Extension Architecture](context-rules-rule-systems.md)
* [Page Loader Extension Architecture](pageloader.md)
* [Event Extension Architecture](events.md)
* [Dependency Injection and Dependency Handling](dependency-injection-dependency-handling.md)

These guidelines are mandatory for plugin developers extending core functionality.
