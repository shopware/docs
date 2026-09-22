---
nav:
  title: Price rule calculation limit
  position: 40

---

# Price rule calculation limit

Shopware considers up to 100 matching rules by default when calculating the cheapest price used for listing filters and sorting.
If a customer context matches more rules, the remaining rules are ignored for this calculation and Shopware logs a warning.
Product prices can still appear correct on the detail page while listing order or filters are wrong.

First, reduce unnecessary overlap between rules.
If the limit must be raised, configure it in `config/packages/prod/shopware.yaml`:

```yaml
shopware:
    dal:
        max_rule_prices: 200
```

::: warning
Raising the limit increases the cost of listing queries.
Monitor listing performance and logs after changing it.
:::
