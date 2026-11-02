---
nav:
  title: Shipping Method Prices
  position: 80

---

# Shipping Method Prices

Shipping costs are stored in the `shipping_method_price` entity, a child of the shipping method. This page lists the fields of the entity and explains how the `DeliveryCalculator` uses them to pick the shipping cost of a delivery. Use it when you create or import shipping methods with prices through the API or a plugin.

## Entity definition

The entity is defined in `Shopware\Core\Checkout\Shipping\Aggregate\ShippingMethodPrice\ShippingMethodPriceDefinition`:

* Entity name: `shipping_method_price`
* Entity class: `ShippingMethodPriceEntity`
* Collection class: `ShippingMethodPriceCollection`
* Parent definition: `ShippingMethodDefinition`
* Available since: `6.0.0.0`

### Fields

All fields in the table are flagged as `ApiAware`. The associations are not.

| Field               | Type             | Description                                                                     |
| :------------------ | :--------------- | :------------------------------------------------------------------------------ |
| `id`                | ID               | Primary key, required.                                                          |
| `shippingMethodId`  | Foreign key      | The shipping method the price belongs to, required.                             |
| `ruleId`            | Foreign key      | Rule that groups this price. Prices without a rule are the default prices.      |
| `calculation`       | Integer          | What the quantity range refers to, see [Calculation types](#calculation-types). |
| `calculationRuleId` | Foreign key      | Rule that decides whether this price applies, instead of the quantity range.    |
| `quantityStart`     | Float            | Lower bound of the range.                                                       |
| `quantityEnd`       | Float            | Upper bound of the range.                                                       |
| `currencyPrice`     | Price collection | Prices per currency, each with `currencyId`, `net`, `gross`, and `linked`.      |
| `customFields`      | Custom fields    | Additional custom data.                                                         |

### Associations

* `shippingMethod`, `rule`, and `calculationRule` are many-to-one associations. `rule` and `calculationRule` both point to the `rule` entity.
* The shipping method exposes its prices through the one-to-many association `prices`. It is flagged with `CascadeDelete`, so deleting a shipping method deletes its prices.

The database table has a unique index `uniq.shipping_method_quantity_start` on `shipping_method_id`, `rule_id`, and `quantity_start`. The index doesn't include `calculation`, so two prices of the same shipping method and rule can't share the same start value, even with different calculation types. For prices without a rule, `rule_id` is `NULL`, and a unique index in MySQL treats `NULL` values as distinct, so the index doesn't prevent duplicate start values there.

## Calculation types

The `calculation` field takes one of the constants of `Shopware\Core\Checkout\Cart\Delivery\DeliveryCalculator`. For any other value, the compared value is the total price of the line items divided by 100:

| Value | Constant                         | Compared value                        |
| :---- | :------------------------------- | :------------------------------------ |
| `1`   | `CALCULATION_BY_LINE_ITEM_COUNT` | Quantity of the delivery positions    |
| `2`   | `CALCULATION_BY_PRICE`           | Total price of the delivery positions |
| `3`   | `CALCULATION_BY_WEIGHT`          | Weight of the delivery positions      |
| `4`   | `CALCULATION_BY_VOLUME`          | Volume of the delivery positions      |

Only positions whose line item has delivery information with free delivery disabled are counted.

## How a price is selected

The calculator picks a price from the price matrix only when the delivery doesn't already carry a shipping cost, the cart has no manual shipping costs, the cart behavior doesn't skip the recalculation of a zero shipping cost, and not all items of the delivery are free of shipping. In that case, it selects the shipping cost in these steps:

1. For each rule ID of the current context, in order, it takes the prices with that `ruleId` and looks for a matching price. The first rule that yields a price wins.
2. If no rule yields a price, it uses the prices with `ruleId` set to `null`.
3. If there is still no price, the cart receives a `ShippingMethodBlockedError` with the reason `no shipping costs found`.

Within one group, prices are sorted by their price in the context currency, lowest first. The first entry that matches and has a `currencyPrice` is used.

### Matching a single price

* If `calculationRuleId` is set, the price matches only when this rule is among the rule IDs of the context. The quantity range isn't checked.
* Otherwise, the compared value must be greater than or equal to `quantityStart` and less than or equal to `quantityEnd`. Both bounds are inclusive.
* An empty bound is ignored. Because the check uses `!$start` and `!$end`, a bound of `0` is ignored as well.

::: info
With the feature flag `SHIPPING_PRICE_RANGE_CURRENCY_CONVERSION` active, the bounds of prices with calculation type `2` are multiplied by the currency factor of the context. The flag is disabled by default and is planned to become standard with Shopware 6.8.0.
:::

### Currency and tax state

The calculator reads the entry of `currencyPrice` for the context currency. If there is no entry for that currency, it falls back to the entry for the default currency. It uses the gross value when the context tax state is gross and the net value otherwise. If the resolved price is in the default currency, its value is multiplied by the currency factor of the context.

## Example

The following `prices` payload for a shipping method defines a default price for orders up to 50 and free shipping above that, both by cart price:

```json
{
    "prices": [
        {
            "calculation": 2,
            "quantityStart": 0,
            "quantityEnd": 50,
            "currencyPrice": [
                { "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca", "net": 4.20, "gross": 5.00, "linked": true }
            ]
        },
        {
            "calculation": 2,
            "quantityStart": 50.01,
            "currencyPrice": [
                { "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca", "net": 0, "gross": 0, "linked": true }
            ]
        }
    ]
}
```

Both entries have no `ruleId`, so they act as default prices. Keep a default price for every shipping method, so that customers who match none of the rules still get shipping costs.
