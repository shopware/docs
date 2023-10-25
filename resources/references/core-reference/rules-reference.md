---
nav:
  title: Rules Reference
  position: 30

---

# Rules Reference

List of all rule classes across Shopware 6.

## Checkout

| Class | Description |
| :--- | :--- |
| [Shopware\Core\Checkout\Cart\Rule\AlwaysValidRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/AlwaysValidRule.php) | Matches always |
| [Shopware\Core\Checkout\Cart\Rule\CartAmountRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/CartAmountRule.php) | Matches a specific number to the carts total price. |
| [Shopware\Core\Checkout\Cart\Rule\CartHasDeliveryFreeItemRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/CartHasDeliveryFreeItemRule.php) | Matches if the cart has a free delivery item. |
| [Shopware\Core\Checkout\Cart\Rule\CartWeightRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/CartWeightRule.php) | Matches a specific number to the current cart's total weight. |
| [Shopware\Core\Checkout\Cart\Rule\GoodsCountRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/GoodsCountRule.php) | Matches a number to the current cart's line item goods count. |
| [Shopware\Core\Checkout\Cart\Rule\GoodsPriceRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/GoodsPriceRule.php) | Matches a specific number to the carts goods price. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemClearanceSaleRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemClearanceSaleRule.php) | Matches a specific line item which is on clearance sale |
| [Shopware\Core\Checkout\Cart\Rule\LineItemCreationDateRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemCreationDateRule.php) | Matches if a line item has a specific creation date. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemCustomFieldRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemCustomFieldRule.php) | Matches if a line item has a specific custom field. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemDimensionHeightRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemDimensionHeightRule.php) | Matches a specific line item's height. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemDimensionLengthRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemDimensionLengthRule.php) | Matches a specific line item's length. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemDimensionWeightRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemDimensionWeightRule.php) | Matches a specific line item's weight. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemDimensionWidthRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemDimensionWidthRule.php) | Matches a specific line item's width. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemGroupRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemGroupRule.php) | Matches if a line item has a specific group. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemInCategoryRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemInCategoryRule.php) | Matches if a line item is in a specific category. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemIsNewRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemIsNewRule.php) | Matches if a line item is marked as new. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemListPriceRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemListPriceRule.php) | Matches a specific line item has a specific list price. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemOfManufacturerRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemOfManufacturerRule.php) | Matches a specific line item has a specific manufacturer. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemOfTypeRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemOfTypeRule.php) | Matches a specific type name to the line item's type. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemPromotedRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemPromotedRule.php) | Matches if a line item is promoted. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemPropertyRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemPropertyRule.php) | Matches if a line item has a specific property. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemPurchasePriceRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemPurchasePriceRule.php) | Matches if a line item has a specific purchase price. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemReleaseDateRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemReleaseDateRule.php) | Matches a specific line item's release date. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemRule.php) | Matches multiple identifiers to a line item's keys. True if one identifier matches. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemTagRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemTagRule.php) | Matches multiple tags to a line item's tag. True if one tag matches. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemTaxationRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemTaxationRule.php) | Matches if a line item has a specific tax. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemTotalPriceRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemTotalPriceRule.php) | Matches a number to the current cart's line item total price. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemUnitPriceRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemUnitPriceRule.php) | Matches a specific number to a line item's price. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemWithQuantityRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemWithQuantityRule.php) | Matches a specific line item's quantity to the current line item's quantity. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemWrapperRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemWrapperRule.php) | Internally handled scope changes. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemsInCartCountRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemsInCartCountRule.php) | Matches a number to the current cart's line item count. |
| [Shopware\Core\Checkout\Cart\Rule\LineItemsInCartRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/LineItemsInCartRule.php) | Matches multiple identifiers to a carts line item's identifier. True if one identifier matches. |
| [Shopware\Core\Checkout\Cart\Rule\PaymentMethodRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/PaymentMethodRule.php) | Matches if a specific payment method is used |
| [Shopware\Core\Checkout\Cart\Rule\ShippingMethodRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Cart/Rule/ShippingMethodRule.php) | Matches if a specific shipping method is used |
| [Shopware\Core\Checkout\Customer\Rule\BillingCountryRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/BillingCountryRule.php) | Matches multiple countries to the customer's active billing address country. |
| [Shopware\Core\Checkout\Customer\Rule\BillingStreetRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/BillingStreetRule.php) | Matches multiple street names to the customer's active billing address street name. |
| [Shopware\Core\Checkout\Customer\Rule\BillingZipCodeRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/BillingZipCodeRule.php) | Matches multiple zip codes to the customer's active billing address zip code. |
| [Shopware\Core\Checkout\Customer\Rule\CustomerGroupRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/CustomerGroupRule.php) | Matches multiple customer groups to the current customers group. True if one customer group matches. |
| [Shopware\Core\Checkout\Customer\Rule\CustomerNumberRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/CustomerNumberRule.php) | Matches multiple numbers to the active customers number. |
| [Shopware\Core\Checkout\Customer\Rule\CustomerTagRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/CustomerTagRule.php) | Matches a tag set to customers |
| [Shopware\Core\Checkout\Customer\Rule\DaysSinceLastOrderRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/DaysSinceLastOrderRule.php) | Matches a specific number of days to the last order creation date. |
| [Shopware\Core\Checkout\Customer\Rule\DifferentAddressesRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/DifferentAddressesRule.php) | Matches if active billing address is not the default. |
| [Shopware\Core\Checkout\Customer\Rule\IsCompanyRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/IsCompanyRule.php) | Matches if the customer is a company |
| [Shopware\Core\Checkout\Customer\Rule\IsNewCustomerRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/IsNewCustomerRule.php) | Matches if a customer is new, by matching the `firstLogin` property with today. |
| [Shopware\Core\Checkout\Customer\Rule\LastNameRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/LastNameRule.php) | Exactly matches a string to the customer's last name. |
| [Shopware\Core\Checkout\Customer\Rule\OrderCountRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/OrderCountRule.php) | Matches a specific number to the number of orders of the current customer. |
| [Shopware\Core\Checkout\Customer\Rule\ShippingCountryRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/ShippingCountryRule.php) | Matches multiple countries to the customer's active shipping address country. True if one country matches. |
| [Shopware\Core\Checkout\Customer\Rule\ShippingStreetRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/ShippingStreetRule.php) | Matches multiple street names to the customer's active shipping address street name. True if one street name matches. |
| [Shopware\Core\Checkout\Customer\Rule\ShippingZipCodeRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Checkout/Customer/Rule/ShippingZipCodeRule.php) | Matches multiple zip codes to the customer's active shipping address zip code. True if one zip code matches. |

## Framework

| Class | Description |
| :--- | :--- |
| [Shopware\Core\Framework\Rule\Container\AndRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Rule/Container/AndRule.php) | Composition of rules. Matches if all match. |
| [Shopware\Core\Framework\Rule\Container\NotRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Rule/Container/NotRule.php) | Negates one rule. |
| [Shopware\Core\Framework\Rule\Container\OrRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Rule/Container/OrRule.php) | Composition of rules. Matches if at least one rule matches. |
| [Shopware\Core\Framework\Rule\Container\XorRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Rule/Container/XorRule.php) | Composition of rules. Matches if exactly one matches. |
| [Shopware\Core\Framework\Rule\DateRangeRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Rule/DateRangeRule.php) | Match a fixed date range to now. |
| [Shopware\Core\Framework\Rule\SalesChannelRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Rule/SalesChannelRule.php) | Match a specific sales channel to the current context. |
| [Shopware\Core\Framework\Rule\TimeRangeRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Rule/TimeRangeRule.php) | Matches a fixed time range to now. |
| [Shopware\Core\Framework\Rule\WeekdayRule](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Rule/WeekdayRule.php) | Matches a fixed day of the week to now. |

## System

| Class | Description |
| :--- | :--- |
| [Shopware\Core\System\Currency\Rule\CurrencyRule](https://github.com/shopware/shopware/blob/trunk/src/Core/System/Currency/Rule/CurrencyRule.php) | Match a specific currency to the current context. |

## B2B

| Class                         | Description                                                           | Component           |
|:------------------------------|:----------------------------------------------------------------------|:--------------------|
| EmployeeOrderRule             | Matches if the order was placed by an employee                        | Employee Management |
| EmployeeOfBusinessPartnerRule | Matches if the customer is an employee of a specific business partner | Employee Management |
| EmployeeRoleRule              | Matches if a specific role is assigned to an employee                 | Employee Management |
| EmployeeStatusRule            | Matches if the employee as a specific status                          | Employee Management |
| IsEmployeeRule                | Matches if the customer is an employee                                | Employee Management |
