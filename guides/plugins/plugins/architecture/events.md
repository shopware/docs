---
nav:
  title: Event Extension Architecture
  position: 70

---

# Event Extension Architecture

Events provide extension points for loading additional data or reacting to system changes. They are designed for observation and enrichment, not for altering core control flow.

## Design Principles

* Events expose extension points without breaking encapsulation.
* Events should not mutate core program flow.
* Business logic replacement must use decoration, not events.
* Events must remain predictable and side-effect aware.

## Extension Guidelines

* Use events to add data, not to override behavior.
* Avoid heavy computation or database queries inside event subscribers.
* Keep subscribers idempotent and deterministic.
* Prefer decoration when you need to change logic execution.

## Technical Requirements

* Events must always implement the `\Shopware\Core\Framework\Event\ShopwareEvent` interface.
* Sales channel events must implement these interfaces:
  * `ShopwareSalesChannelEvent`
  * `\Shopware\Core\Framework\Event\SalesChannelAware`
* Events are intended for enrichment and extension, not for control-flow modification.
