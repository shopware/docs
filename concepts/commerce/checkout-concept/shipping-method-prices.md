---
nav:
  title: Shipping Method Prices
  position: 15

---

# Shipping Method Prices

A shipping method can define several price rows. Shopware checks those rows against the rules and delivery contents of the current cart to choose a shipping cost. Shopware selects a matrix price when the delivery has no existing positive shipping cost or manual shipping cost, cart behavior does not skip recalculating a zero shipping cost, and at least one delivery item has delivery information with free delivery disabled.

## How Shopware selects a price

Shopware checks the rules that match the current cart in priority order, highest first. Rules with the same priority are ordered by ID. The first rule with a matching price row wins. If no matching rule has a price, Shopware checks rows without a rule. If no row matches, Shopware cannot calculate a shipping cost for that method.

Within each rule group, rows are considered from the lowest resolved price to the highest. Shopware uses the first row that matches and has a `currencyPrice` collection. It resolves the price for the active currency; if that currency has no entry, it uses the default currency price and applies the currency factor.

## Matching a price row

A row can match in one of two ways:

* If `calculationRuleId` is set, it matches when that rule applies to the cart. The quantity range is ignored.
* Otherwise, Shopware compares a value from the delivery positions with `quantityStart` and `quantityEnd`. The bounds are inclusive. A missing bound or a bound of `0` means there is no limit on that side.

The `calculation` field selects which delivery value is compared:

| Value | Constant                         | Compared value                        |
| :---- | :------------------------------- | :------------------------------------ |
| `1`   | `CALCULATION_BY_LINE_ITEM_COUNT` | Quantity of the delivery positions    |
| `2`   | `CALCULATION_BY_PRICE`           | Total price of the delivery positions |
| `3`   | `CALCULATION_BY_WEIGHT`          | Weight of the delivery positions      |
| `4`   | `CALCULATION_BY_VOLUME`          | Volume of the delivery positions      |

Only positions whose line item has delivery information with free delivery disabled are counted. When `SHIPPING_PRICE_RANGE_CURRENCY_CONVERSION` is enabled, price-based range bounds are multiplied by the context currency factor.

## Price basis and tax rules

In Shopware 6.7.15.1, shipping prices use the stored gross amount for a gross context tax state and the stored net amount otherwise. Starting with the planned Shopware 6.7.17.0 release, shipping price selection also considers the customer group's price basis.

When a customer group's price basis differs from its tax display mode and the context tax state matches that display mode, Shopware derives the amount from the stored price basis and the applicable shipping tax rules. For example, with a net price basis, gross display, and a gross tax state, it derives the gross amount from the stored net amount.

## Example

With the default currency (factor 1), this `prices` payload uses the delivery total: the paid row matches below 50, and the free row matches from 50 onward. At 50 both rows match, so Shopware selects the free row because it sorts rows by resolved price from lowest to highest.

```json
{
    "prices": [
        {
            "calculation": 2,
            "quantityStart": 0,
            "currencyPrice": [
                { "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca", "net": 4.20, "gross": 5.00, "linked": true }
            ]
        },
        {
            "calculation": 2,
            "quantityStart": 50,
            "currencyPrice": [
                { "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca", "net": 0, "gross": 0, "linked": true }
            ]
        }
    ]
}
```

Rows without a `ruleId` are default rows. A default price can cover customers who match none of the shipping method's rules.
