# Manipulate the cart with App Scripts

If your app needs to manipulate the cart, you can do so by using the [`cart`](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md#cart) script hook.

::: info
Note that app scripts were introduced in Shopware 6.4.8.0, and are not supported in previous versions.
:::

## Overview

The cart manipulation in App Scripts expands on the general [cart concept](../../../../concepts/commerce/checkout-concept/cart). In that concept your cart scripts act as another [cart processor](../../../../concepts/commerce/checkout-concept/cart.md#cart-processors---price-calculation-and-validation).

Your `cart` scripts run whenever the cart is calculated, this means that the script will be executed when an item is added to the cart, when the selected shipping and payment methods change, etc.
You have access to a `cart`-service that provides a [fluent API](https://www.martinfowler.com/bliki/FluentInterface.html) to get data from the cart or to manipulate the cart. For an overview of all data and services that are available, please refer to the [cart hook reference](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md#cart).

## Prerequisites

To get a better understanding of the cart, please make yourself familiar with the [cart concept](../../../../concepts/commerce/checkout-concept/cart) in general.
We will expand on that concept and refer to ideas defined there in this guide.

## Calculating the cart

If you add line-items (products, discounts, etc.) in your `cart`-script it may be necessary to manually recalculate the cart.
After changing the price definitions in the cart, the total prices of the cart are not recalculated automatically, the recalculation will only happen automatically after your whole script was executed.

But if your script depends on updated and recalculated prices, you can recalculate the entire cart manually.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% do services.cart.products.add(productId) %}

{% do services.cart.calculate() %}
```


</CodeBlock>

The `calculate()` call will recalculate the whole cart and update the total prices, etc. For this the complete [`process`-step](../../../../concepts/commerce/checkout-concept/cart.md#calculation) is executed again.

::: warning
Note that by executing the `process`-step all properties of the cart (e.g. `products()`, `items()`, `price()`) are recreated and thus will return new instances.
This means if your script still holds references to those properties inside variables from before the recalculation, those are outdated after the recalculation.
:::

### Multiple calculations

Your `cart`-script will probably run multiple times per cart, whenever the cart is recalculated, e.g. whenever a new product is added to the cart.
This means that you have to check, that your script works when it is executed multiple times.

The safest way to ensure is, that you check the cart if the action of your script was already take and only execute it if not.
For example, you could only add a discount to the cart, if it not already exists.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% if not services.cart.has('my-custom-discount') %}
    {% do services.cart.discount('my-custom-discount', 'percentage', 10, 'A custom discount') %}
{% endif %}
```


</CodeBlock>

An alternative solution would be to mark that you already did perform an action by adding a custom state to the cart.
This way you can only perform the action, if your custom state is not present and additionally, you can remove the state again when you revert your action.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% set isEligable = services.cart.items.count > 3 %}

{% if not services.cart.states.has('swag-my-state') %}

    {% if isEligable %}
        {# perform action #}
    {% endif %}

{% else %}

    {% if not isEligable %}
        {# revert action #}
    {% endif %}

{% endif %}
```


</CodeBlock>

::: info
Note that the state name should be unique, this means you should always use your vendor prefix in the state name.
:::

## Price definitions

In general, Shopware prices consist of gross and net prices and are currency dependent.  If you need price definitions in your app scripts (e.g. to add a absolute discount with a specific price) there are multiple ways to do so.

### Price fields inside custom fields

You can define price fields for [custom fields](../custom-data/custom-fields)

<CodeBlock title="manifest.xml">

```xml
<custom-fields>
    <custom-field-set>
        <name>custom_field_test</name>
        <label>Custom field test</label>
        <label lang="de-DE">Zusatzfeld Test</label>
        <related-entities>
            <product/>
            <customer/>
        </related-entities>
        <fields>
            <price name="test_price_field">
                <label>Test price field</label>
            </price>
        </fields>
    </custom-field-set>
</custom-fields>
```

</CodeBlock>

### Price fields inside app config

You can define price fields for [app configuration](../configuration).

<CodeBlock title="Resources/config/config.xml">

```xml
<card>
    <title>Basic configuration</title>
    <title lang="de-DE">Grundeinstellungen</title>
    <name>TestCard</name>
    <input-field type="price">
        <name>priceField</name>
        <label>Test price field</label>
        <defaultValue>null</defaultValue>
    </input-field>
</card>
```

</CodeBlock>

### Manual price definition

The simplest way is to define the price manually and hard coded into your app scripts. We provide a factory method that you can use to create price definitions.
You can specify the `gross` and `net` prices for each currency.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% set price = services.cart.price.create({
    'default': { 'gross': 19.99, 'net': 19.99},
    'EUR': { 'gross': 19.99, 'net': 19.99},
    'USD': { 'gross': 24.99, 'net': 21.37},
}) %}
```


</CodeBlock>

### Prices inside the app config

As described above, it is also possible to use price fields inside the [app configuration](../configuration). In your cart scripts you can access those config values over the [`config` service](../../../../resources/references/app-reference/script-reference/miscellaneous-script-services-reference.md#SystemConfigFacade) and pass them to the same price factory as the manual definitions.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% set priceData = services.config.app('myCustomPrice') %}

{% set discountPrice = services.cart.price.create(priceData) %}
```


</CodeBlock>

Note, that if you don't provide a default value for your configuration, you should add a null-check, to verify that the config value you want to use was actually configured by the merchant.

## Line-items

Inside your cart scripts you can modify the line-items inside the current cart.

### Add product a line-item

You can add a new product line-item simply by providing the product `id` of the product that should be added.
Additionally, you may provide a quantity as second parameter if the product should be added with a quantity higher than 1.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% do services.cart.products.add(productId) %}

{% do services.cart.products.add(productId, 4) %}
```


</CodeBlock>

### Add an absolute discount

To add an absolute discount you can use the `discount()` function, but you have to define a [price definition](#price-definitions) beforehand.
The first argument is the `id` of the line-item you can use that `id`, e.g. to check if the discount was already added to cart.
The fourth parameter is the label of the discount, you can either use a hard coded string label, or use the `|trans` filter to use a storefront snippet as the label.

Note that you should check if your discount was already added, as your script may run multiple times.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% set discountPrice = services.cart.price.create({
    'default': { 'gross': 19.99, 'net': 19.99},
    'EUR': { 'gross': 19.99, 'net': 19.99},
}) %}

{% if not services.cart.has('my-custom-discount') %}
    {% do services.cart.discount('my-custom-discount', 'absolute', discountPrice, 'my.custom.discount.label'|trans) %}
{% endif %}
```


</CodeBlock>

### Add a relative discount

Adding a relative discount is very similiar to adding an absolute discount. Instead of providing a price definition, you can provide a percentage value that should be discounted and the absolute value will be calculated automatically based on the current total price of the cart.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% do services.cart.discount('my-custom-discount', 'percentage', 10, 'A custom 10% discount') %}
```


</CodeBlock>

### Remove a line item

You can remove line items by providing the `id` of the line-item that should be removed.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{# first add the product #}
{% do services.cart.products.add(productId) %}
{# then remove it again #}
{% do services.cart.remove(productId) %}

{# first add the discount #}
{% do services.cart.discount('my-custom-discount', 'percentage', 10, 'A custom 10% discount') %}
{# then remove it again #}
{% do services.cart.remove('my-custom-discount') %}
```


</CodeBlock>

## Split line-items

It is also possible to split one line-item with a quantity of 2 or more.
You can use the `take()`-method on the line-item that should be split and provide the quantity that should be split from the original line-item.
Optionally you can provide the new `id` of the new line-item as a second parameter.

Note that the `take()` method won't automatically add the new line-item to the cart, but instead it returns the split line-item,
so you have to add it to the corresponding line-item collection manually in your script.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% set existingLineItem = services.cart.products.get(productId) %}

{% if existingLineItem and existingLineItem.quantity > 3 %}
    {% set newLineItem = existingLineItem.take(2, newLineItemId) %}
    {% do services.cart.products.add(newLineItem) %}
{% endif %}
```


</CodeBlock>

## Add custom data to line-items

You can add custom (meta-) data to line-items in the cart by manipulating the payload of the cart items.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% set lineItem = services.cart.get(lineItemId) %}
{# Add a custom payload value #}
{% do lineItem.payload.set('custom-payload', myValue) %}
{# Access the value #}
{%  set value = lineItem.payload['custom-payload']) %}
```


</CodeBlock>

## Add errors and notifications to the cart

Your app script can block the checkout of the cart by raising an error.
As the first parameter you have to provide the [snippet key](../../plugins/storefront/add-translations) of the error message that should be displayed to the user.
As the second optional parameter you can specify a `id` for the error, so you can reference the error later on in your script.
Lastly you can provide an array of parameters as the optional third parameter, in case that you need to pass parameters to the snippet.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% if not cartIsValid %}
    {# add a new error #}
    {% do services.cart.errors.error('my-error-message', 'error-id') %}
{% else %}
    {% do services.cart.errors.remove('error-id') %}
{% endif %}
```


</CodeBlock>

If you only want to display some information to the user, during the checkout process you can also add messages using `warning` and `notice`. Those will be displayed during the checkout process, but won't prevent the customer from completing the checkout.

The API is basically the same as for adding errors.

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% do services.cart.errors.notice('my-notice') %}
```


</CodeBlock>

## Rule based cart scripts

The cart scripts automatically integrate with the [Rule Builder](../../../../concepts/framework/rules) and you can use the full power of the rule builder to only do your cart manipulations if a given rule matches.
For example, you can add an entity-single-select field to your [apps config](../configuration) to allow the merchant to choose a rule that needs to match for your app script taking affect.

<CodeBlock title="Resources/config/config.xml">

```xml
<card>
    <title>Basic configuration</title>
    <title lang="de-DE">Grundeinstellungen</title>
    <name>TestCard</name>
    <component name="sw-entity-single-select">
        <name>exampleRule</name>
        <entity>rule</entity>
        <label>Choose a rule that activates the cart script</label>
    </component>
</card>
```

</CodeBlock>

Inside your cart script you can check if the rule matches, by checking if the configures rule id exists in the list of matched rule ids of the context:

<CodeBlock title="Resources/scripts/cart/my-cart-script.twig">


```twig
{% set ruleId = services.config.app('exampleRule') %}

{% if ruleId and ruleId in hook.context.ruleIds %}
    {# perform action #}
{% else %}
   {# revert action #}
{% endif %}
```


</CodeBlock>

## Further information

<PageRef page="../../../../resources/references/app-reference/script-reference/cart-manipulation-script-services-reference" title="<<<title-missing>>>" />
