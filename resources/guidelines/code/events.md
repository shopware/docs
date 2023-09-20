---
nav:
  title: Events
  position: 70

---

# Events

* An event must always implement the `\Shopware\Core\Framework\Event\ShopwareEvent` interface.
* Events thrown in the context of a sales channel must always implement the interfaces `ShopwareSalesChannelEvent` and `Shopware\Core\Framework\Event\SalesChannelAware`.
* Events are mostly used to allow developers to load more data. They should, as a rule, not interfere with the program flow. The decoration pattern is intended for influencing the program flow.
