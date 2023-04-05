# Add Cart Validator

## Overview

The cart in Shopware is constantly being validated by so called "validators". This way we can check for an invalid cart, e.g. for invalid line items \(label missing\) or an invalid shipping address.

This guide will cover the subject on how to add your own custom cart validator.

## Prerequisites

For this guide, you will need a working plugin, which you learn to create [here](../../plugin-base-guide.md). Also, you will have to know the [Dependency Injection container](../../plugin-fundamentals/dependency-injection.md), since that's going to be used in order to register your custom validator.

## Adding a custom cart validator

We'll create several things throughout this guide, in that order:

* The validator itself
* A new exception being thrown by the validator if needed
* Snippets to print a proper error message

### The validator

The validator being created in this example is assuming you've got custom payload data in your line items to validate against. This is just an example and will always result in an error, since the data requested doesn't exist by default, until you add them.

A validator should be placed in the proper domain. That means, that an Address validator should be in a directory `<plugin root>/src/Core/Checkout/Cart/Address`. Since the validator in the following example will be called `CustomCartValidator`, its directory will be `<plugin root>/src/Core/Checkout/Cart/Custom`.

Your validator has to implement the interface `Shopware\Core\Checkout\Cart\CartValidatorInterface`. This forces you to also implement a `validate` method.

But let's have a look at the example validator first:

```php
// <plugin root>/src/Core/Checkout/Cart/Custom/CustomCartValidator.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Cart\Custom;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartValidatorInterface;
use Shopware\Core\Checkout\Cart\Error\ErrorCollection;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Swag\BasicExample\Core\Checkout\Cart\Custom\Error\CustomCartBlockedError;

class CustomCartValidator implements CartValidatorInterface
{
    public function validate(Cart $cart, ErrorCollection $errorCollection, SalesChannelContext $salesChannelContext): void
    {
        foreach ($cart->getLineItems()->getFlat() as $lineItem) {
            if (!array_key_exists('customPayload', $lineItem->getPayload()) || $lineItem->getPayload()['customPayload'] !== 'example') {
                $errorCollection->add(new CustomCartBlockedError($lineItem->getId()));

                return;
            }
        }
    }
}
```

As already said, a cart validator has to implement the `CartValidatorInterface` and therefore implement a `validate` method. This method has access to some important parts of the checkout, such as the cart and the current sales channel context. Also you have access to the error collection, which may or may not contain errors from other earlier validators.

In this example we're dealing with the line items and are validating them, so we're iterating over each line item. This example assumes that your line items got a custom payload, called `customPayload`, and it expects a value in there.

If the condition doesn't match and the line item seems to be invalid, you'll have to add a new error to the error collection. You can't just use any exception here, but a class which has to extend from `Shopware\Core\Checkout\Cart\Error\Error`. Most likely you want to create your own error class here, which will be done in the next step.

Important to note is the `return` statement afterwards. If you wouldn't return here, it would add an error to the error collection for each invalid line item, resulting in several errors displayed on the checkout or the cart page. E.g. if you had four invalid items in your cart, four separate errors would be shown. This way, only one message is shown, so it depends on what you're validating and what you want to happen.

#### Registering the validator

One more thing to do is to register your new validator to the [dependency injection container](../../plugin-fundamentals/dependency-injection.md).

Your validator has to be registered using the tag `shopware.cart.validator`:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Core\Checkout\Cart\Custom\CustomCartValidator">
            <tag name="shopware.cart.validator"/>
        </service>
    </services>
</container>
```

### Adding the custom cart error

The custom cart error class will be called `CustomCartBlockedError` and should be located in a `Error` directory in the same domain as the validator. Since the validator was located in the directory `<plugin root>/src/Core/Checkout/Cart/Custom`, the error class will be located in the directory `<plugin root>/src/Core/Checkout/Cart/Custom/Error`.

It has to extend from the abstract class `Shopware\Core\Checkout\Cart\Error\Error`, which asks you to implement a few methods:

* `getId`: Here you have to return a unique ID, since your error will be saved via this ID in the error collection. In this example,

  we'll just use the line item ID here.

* `getMessageKey`: The snippet key of the message to be displayed. In this example it will be `custom-line-item-blocked`, which is important

  for the next section of this guide, for adding the snippets.

* `getLevel`: The kind of error, available are `notice`, `warning` and `error`. Depending on that decision, the error will be printed in a blue,

  yellow or red box respectively. This example will use the error here.
* `blockOrder`: Return a boolean on whether this exception should block the possibility to actually finish the checkout.

  In this case it will be `true`, hence the error level defined earlier. It wouldn't make sense to block the checkout, but only display a notice.

* `blockResubmit`: Optional, return a boolean on whether this exception block the user from trying to finish the checkout again.

  If you want to use it, add the method `blockResubmit(): bool` to your custom error. If you don't, it is `true` by default.
* `getParameters`: You can add custom payload here. Technically any plugin or code could read the errors of the cart and act accordingly.

  If you need extra payload to your error class, this is the place to go.

So now let's have a look at the example error class:

```php
// <plugin root>/src/Core/Checkout/Cart/Custom/Error/CustomCartBlockedError.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Cart\Custom\Error;

use Shopware\Core\Checkout\Cart\Error\Error;

class CustomCartBlockedError extends Error
{
    private const KEY = 'custom-line-item-blocked';

    private string $lineItemId;

    public function __construct(string $lineItemId)
    {
        $this->lineItemId = $lineItemId;
        parent::__construct();
    }

    public function getId(): string
    {
        return $this->lineItemId;
    }

    public function getMessageKey(): string
    {
        return self::KEY;
    }

    public function getLevel(): int
    {
//        return self::LEVEL_NOTICE;
//        return self::LEVEL_WARNING;
        return self::LEVEL_ERROR;
    }

    public function blockOrder(): bool
    {
        return true;
    }

    public function getParameters(): array
    {
        return [ 'lineItemId' => $this->lineItemId ];
    }
}
```

The constructor was overridden so we can ask for the line item ID and save it in a property. Since we already used this class in the validator, we're basically done with that part here.

Only the snippets are missing.

### Adding the snippet

First of all you should know our guide about [adding storefront snippets](../../storefront/add-translations.md), since that won't be explained in detail here.

You've defined the error key to be `custom-line-item-blocked` in your custom error class `CustomCartBlockedError`. Once your validator finds an invalid line item in your cart, Shopware is going to search for a respective snippet. In the cart, Shopware will be looking for the following snippet key: `checkout.custom-line-item-blocked`. Meanwhile it will be looking for a key `error.custom-line-item-blocked` in the checkout steps. This way you could technically define two different messages for the cart and the following checkout steps.

Now let's have a look at an example snippet file:

```js
// <plugin root>/src/Resources/snippet/en\_GB/example.en-GB.jsonon
{
    "checkout": {
        "custom-line-item-blocked": "Example error message for the cart"
    },
    "error": {
        "custom-line-item-blocked": "Example error message for the checkout"
    }
}
```

This way Shopware will find the new snippets in your plugin and display the respective error message.

And that's it, you've now successfully added your own cart validator.

## Next steps

In the examples mentioned above, we're asking for custom line item payloads. This subject is covered in our guide about [adding cart items](add-cart-items.md), so you might want to have a look at that.
