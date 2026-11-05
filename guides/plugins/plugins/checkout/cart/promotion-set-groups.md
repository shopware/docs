---
nav:
  title: Promotion Set Groups
  position: 80

---

# Promotion Set Groups

## Overview

The core has no bundle product. A product in the core is either physical or digital, and the core does not offer a separate product type for a bundle. To sell a set of products at a discount, for example a bundle of three products, use a promotion with set groups and a discount with the scope `set`. The promotion describes which products make up one set, and the discount is applied to every complete set in the cart. If you need a bundle that is a single item in the cart instead, see the section about nested line items in [Add cart items](add-cart-items.md).

This guide is for shop operators and plugin developers. It shows how to configure a set discount in the Administration, explains how a set group fills its group from the cart, lists the built-in `packager` and sorter keys, and shows how to register your own. For rules in general, see the [Rule system](../../../../../concepts/framework/rule-system/index.md) concept.

## Selling a set of products with a discount

A promotion has one or more set groups. Each set group describes one part of the set with a `packager` key, a `value`, a sorter key, and product rules. The set is complete when every set group of the promotion can be filled from the cart.

The built-in `COUNT` `packager` adds up units, not different products. A single set group with the `value` 3 and a product rule that covers three different products is also satisfied by three units of one of those products. To sell a mixed bundle of three different products, create three set groups with the `value` 1, and give each group a product rule that matches only one of the products.

To configure this in the Administration:

1. Open the promotion and go to the **Conditions** tab. Switch on **Promote sets of products**. You need the `promotion.editor` permission to change it.
2. Click **Add product set** once for each product of the bundle. A new group starts with the **Mode** Quantity, the **Value** 2, and the **Sorting** Price, ascending.
3. In each group, set **Value** to 1 and keep the mode Quantity. Under **Product rules**, select a rule that matches only the product of this group. To create one, use **Create new rule** and add a product condition such as **Items in cart**, where you pick the product.
4. Save the promotion.
5. Go to the **Discounts** tab and click **Add discount**. Set **Apply to:** to **Entire set**, and choose the **Type** and **Value** of the discount.

The discount is calculated for every complete set in the cart. If the cart holds the three products twice, the discount applies to two sets. Extra units do not make additional sets: with three groups of the `value` 1 for the products A, B, and C, a cart with six units of A, two of B, and two of C holds two complete sets. The discount applies to two units of A, two of B, and two of C, and the other four units of A are not discounted.

With the type **Fixed price**, the discount is the difference between the total price of the items in all complete sets and the **Value** multiplied by the number of complete sets. The discount is never negative: if the items cost less than the **Value**, there is no discount.

Keep the product rules of different set groups apart, so that no product matches the rules of two groups. If the rules overlap, one unit can satisfy several groups. For example, three groups of the `value` 1 that all use a rule for the products A, B, or C are all satisfied by a cart that holds only one unit of A and one of B, and this cart counts as holding two complete sets.

### Making the promotion apply in the shop

A set discount only applies when the promotion itself is usable:

* On the **General** tab, the **Active** switch must be on. If you set **Valid from** or **Valid until**, the current time must be within that range. A promotion without dates has no date limit.
* On the **Conditions** tab, the promotion must be assigned to the sales channel in **Sales Channels**.
* On the **General** tab, **Code options** decides how customers get the discount. With **No promotion code required**, the promotion applies automatically when its conditions are met. With **Fixed promotion code** or **Individual promotion codes**, the customer has to enter a code.

In the product rule field, rules that contain a cart amount, shipping cost, or order condition are greyed out and cannot be selected. For a product, use a line item condition such as **Items in cart** (you pick the products), **Item in category**, or **Item in dynamic product group**.

## How a set group fills its group

When the promotion is evaluated, the cart is processed like this:

1. Only the line items of the type product are used, and every quantity is split into single units.
2. The set groups are processed one after another. For each set group, the sorter sorts all single units of the cart before the product rules are matched.
3. The product rules of the set group select the units that can be part of the group. If the set group has no product rules, every unit matches. With the default rule matcher, a unit matches when any one of several product rules matches.
4. The `packager` builds a group from the sorted matching units. If it returns an empty group, the processing of this set group ends.
5. As long as the `packager` returns a group, it is called again with the matching units that are left. The units of a built group are not used again for the same set group. This is how one set group can produce several groups, and how the cart can contain several complete sets.

## Built-in `packager` and sorter keys

The core registers these `packager` keys:

| `packager` key     | Administration label | Behavior                                                                                                                                                    |
| :----------------- | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COUNT`            | Quantity             | Adds units until their number reaches `value`. If fewer units match, the group is empty.                                                                    |
| `PRICE_UNIT_GROSS` | Amount (gross)       | Adds units until the sum of their gross unit prices reaches `value`. If the sum stays below `value`, the group is empty. Units without a price are skipped. |
| `PRICE_UNIT_NET`   | Amount (net)         | Works like `PRICE_UNIT_GROSS` with the net unit price, which is the unit price minus the amount of the calculated taxes.                                    |

With `PRICE_UNIT_GROSS` and `PRICE_UNIT_NET`, the group contains all units that were added, so its sum can be higher than `value`.

The core registers these sorter keys:

| Sorter key   | Administration label | Behavior                                     |
| :----------- | :------------------- | :------------------------------------------- |
| `PRICE_ASC`  | Price, ascending     | Sorts the units by unit price, lowest first  |
| `PRICE_DESC` | Price, descending    | Sorts the units by unit price, highest first |

Keys are compared case-insensitively. If no registered `packager` matches the key of a set group, a `CartException` with the error code `CHECKOUT__GROUP_PACKAGER_NOT_FOUND` is thrown. An unknown sorter key throws a `CartException` with the error code `CHECKOUT__GROUP_SORTER_NOT_FOUND`.

## Adding your own `packager` or sorter

`packager` and sorter keys are not fixed. Both are services that the core collects by tag:

* A `packager` implements `Shopware\Core\Checkout\Cart\LineItem\Group\LineItemGroupPackagerInterface` and is tagged `lineitem.group.packager`. Its `getKey` method returns the key, and `buildGroupPackage(float $value, LineItemFlatCollection $sortedItems, SalesChannelContext $context)` returns a `LineItemGroup`. An empty `LineItemGroup` means that no group can be built.
* A sorter implements `Shopware\Core\Checkout\Cart\LineItem\Group\LineItemGroupSorterInterface` and is tagged `lineitem.group.sorter`. Its `getKey` method returns the key, and `sort(LineItemFlatCollection $items)` returns the sorted `LineItemFlatCollection`.

Register the services in your `services.php`:

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Swag\BasicExample\Checkout\Cart\ExamplePackager;
use Swag\BasicExample\Checkout\Cart\ExampleSorter;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(ExamplePackager::class)
        ->tag('lineitem.group.packager');

    $services->set(ExampleSorter::class)
        ->tag('lineitem.group.sorter');
};
```

The registered keys are available through two read endpoints. Both require the `promotion:read` privilege and return a JSON array of keys:

| Method | Route                                      | Returns                        |
| :----- | :----------------------------------------- | :----------------------------- |
| `GET`  | `/api/_action/promotion/setgroup/packager` | The registered `packager` keys |
| `GET`  | `/api/_action/promotion/setgroup/sorter`   | The registered sorter keys     |

The Administration loads the keys from these endpoints and looks up the label of each key in the snippet `sw-promotion-v2.detail.conditions.setgroups.packager.<KEY>` or `sw-promotion-v2.detail.conditions.setgroups.sorter.<KEY>`.

## Set groups in the promotion requirements

If a promotion has the field `useSetGroups` set to `true` and at least one set group, each set group becomes a `LineItemGroupRule` with the group ID, `packagerKey`, `value`, `sorterKey`, and product rules. All of these rules are combined in an `AndRule`, which is added to the requirements of the promotion. A `LineItemGroupRule` matches when at least one group can be built for its set group. As a result, every set group must be fillable for the promotion to apply.

## Discount scopes for sets

A promotion discount has one of the scopes `cart`, `delivery`, `set`, or `setgroup`.

The scope `set` discounts the whole set and only applies to complete sets:

* The number of complete sets is the lowest group count among all set groups. For example, two groups of A and one group of B count as one complete set.
* If the lowest count is `0`, the discount gets no items.
* Otherwise, the items of each complete set are collected separately, so a set can be discounted several times.

The scope `setgroup` discounts a single set group. In the Administration, the **Apply to:** field offers an entry **Set group-1**, **Set group-2**, and so on for each saved set group of the promotion, which is stored in the discount as `setgroup-1`, `setgroup-2`, and so on. The number selects the set group by its position in the list of set groups of the promotion, counting from 1. The discount only applies when all set groups of the promotion are complete, and it covers at most as many groups as there are complete sets.

## Reference: the set group data

A promotion has the boolean field `useSetGroups`, which defaults to `false`, and the association `setgroups`. Set groups are deleted together with their promotion. Each set group is stored in the entity `promotion_setgroup` with these fields:

| Field           | Type                                         | Description                                                                       |
| :-------------- | :------------------------------------------- | :-------------------------------------------------------------------------------- |
| `promotionId`   | Foreign key, required                        | The promotion the set group belongs to.                                           |
| `packagerKey`   | String, required                             | Key of the `packager` that builds the group, for example `COUNT`.                 |
| `sorterKey`     | String with a maximum length of 32, required | Key of the sorter that orders the units before grouping, for example `PRICE_ASC`. |
| `value`         | Float, required                              | The value the `packager` uses to fill the group.                                  |
| `setGroupRules` | Many-to-many association to `rule`           | Product rules that line items must match to be part of the group.                 |
