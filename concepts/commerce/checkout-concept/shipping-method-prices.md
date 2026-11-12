---
nav:
  title: Shipping Method Prices
  position: 15

---

# Shipping Method Prices

A shipping method can define several price rows. Shopware checks those rows against the rules and delivery contents of the current cart to choose a shipping cost. During an Administration order edit, Shopware keeps the shipping price already saved on the order, including zero. A manual shipping price for the edit takes precedence over the saved amount. For a delivery with no existing shipping price or manual override, shipping is free when every item is marked for free shipping.

## How Shopware selects a price

Shopware checks the rules that match the current cart in priority order, highest first. Rules with the same priority are ordered by ID. The first rule with a matching price row wins. If no matching rule has a price, Shopware checks rows without a rule. If no row matches, the shipping method is blocked for that cart and an order cannot be placed with it. In the Storefront, Shopware can switch to another available, unblocked shipping method if recalculation leaves no blocked shipping or payment method.

Within each rule group, rows are considered from the lowest resolved price to the highest. Shopware uses the first row that matches and has a `currencyPrice` collection. It resolves the price for the active currency; if that currency has no entry, it uses the default currency price and applies the currency factor.

::: info
With the `v6.8.0.0` feature flag active, the rules and calculation rules of the price rows are matched for each delivery, against its own shipping address and shipping method, instead of once for the cart.
The same applies to the availability rule of the shipping method.
A cart with a single delivery gets the same price as before.
See [Rule evaluation](../../framework/rule-system/rule-evaluation.md) for details.
:::

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

Only positions whose line item has delivery information with free delivery disabled are counted. Without `SHIPPING_PRICE_RANGE_CURRENCY_CONVERSION`, price bounds are compared unchanged with the delivery total in the active currency. With the feature enabled, price bounds are treated as amounts in the default currency and non-null bounds are multiplied by the context currency factor. The feature is disabled by default in 6.7 and is declared to become standard in 6.8.

## Price basis and tax rules

Before Shopware 6.7.17.0, shipping prices use the stored gross price in a gross tax state and the stored net price otherwise. Starting with Shopware 6.7.17.0, shipping price selection also follows the customer group's price basis. When the price basis differs from the tax display mode and the context tax state matches that display mode, Shopware derives the amount from the stored price basis and the delivery's shipping tax rules. For example, with a net price basis, gross display, and a gross tax state, it derives the gross amount from the stored net price.

## Example

Within one rule group and with the default currency (factor 1), this `prices` payload uses the delivery total. The paid row has no limit on either side, so it matches every total. The free row matches from 50 on. Because Shopware checks matching rows in ascending resolved-price order, a total of 50 or more selects the free row in this group.

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
