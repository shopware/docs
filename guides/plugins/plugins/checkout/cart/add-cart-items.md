---
nav:
  title: Add cart items
  position: 20

---

# Add Cart Items

## Overview

This guide will show you how to create line items like products, promotion and other types and add them to the cart. It will also cover creating a custom LineItemHandler.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide), but you don't necessarily need that. It will use an example Storefront controller, so if you don't know how to add a custom Storefront controller yet, have a look at our guide about [Adding a custom page](../../storefront/add-custom-page). Furthermore, registering classes or services to the DI container is also not explained here, but it's covered in our guide about [Dependency injection](../../plugin-fundamentals/dependency-injection), so having this open in another tab won't hurt.

## Adding a simple item

For this guide, we will use an example controller, that is already registered. The process of creating such a controller is not explained here, for that case head over to our guide about [Adding a custom page](../../storefront/add-custom-page).

However, having a controller is not a necessity here, it just comes with the advantage of fetching the current cart by adding `\Shopware\Core\Checkout\Cart\Cart` as a method argument, which will automatically be filled by our argument resolver.

If you're planning to use this guide for something else but a controller, you can fetch the current cart with the `\Shopware\Core\Checkout\Cart\SalesChannel\CartService::getCart` method.

So let's add an example product to the cart using code. For that case, you'll need to have access to both the services `\Shopware\Core\Checkout\Cart\LineItemFactoryRegistry` and `\Shopware\Core\Checkout\Cart\SalesChannel\CartService` supplied to your controller or service via [Dependency injection](../../plugin-fundamentals/dependency-injection).

Let's have a look at an example.

```php
// <plugin root>/src/Service/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\LineItemFactoryRegistry;
use Shopware\Core\Checkout\Cart\SalesChannel\CartService;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Shopware\Storefront\Framework\Routing\StorefrontResponse;
use Symfony\Component\Routing\Annotation\Route;
use Shopware\Core\Checkout\Cart\Cart;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
 */
class ExampleController extends StorefrontController
{
    private LineItemFactoryRegistry $factory;

    private CartService $cartService;

    public function __construct(LineItemFactoryRegistry $factory, CartService $cartService)
    {
        $this->factory = $factory;
        $this->cartService = $cartService;
    }

    /**
     * @Route("/cartAdd", name="frontend.example", methods={"GET"})
     */
    public function add(Cart $cart, SalesChannelContext $context): StorefrontResponse
    {
        // Create product line item
        $lineItem = $this->factory->create([
            'type' => LineItem::PRODUCT_LINE_ITEM_TYPE, // Results in 'product'
            'referencedId' => 'myExampleId', // this is not a valid UUID, change this to your actual ID!
            'quantity' => 5,
            'payload' => ['key' => 'value']
        ], $context);

        $this->cartService->add($cart, $lineItem, $context);

        return $this->renderStorefront('@Storefront/storefront/base.html.twig');
    }
}
```

As mentioned earlier, you can just apply the `Cart` argument to your method and it will be automatically filled.

Afterwards you create a line item using the `LineItemFactoryRegistry` and its `create` method. It is mandatory to supply the `type` property, which can be one of the following by default:

* product
* promotion
* credit
* custom

The `LineItemFactoryRegistry` holds a collection of handlers to create a line item of a specific type. Each line item type needs an own handler, which is covered later in this guide. If the type is not supported, it will throw a `\Shopware\Core\Checkout\Cart\Exception\LineItemTypeNotSupportedException` exception.

Other than that, we apply the `referencedId`, which in this case points to the product ID that we want to add. If you were to add a line item of type `promotion`, the `referencedId` would have to point to the respective promotion ID. The `quantity` field just contains the quantity of line items which you want to add to the cart.

Now have a look at the `payload` field, which only contains dummy data in this example. The `payload` field can contain any additional data that you need to attach to a line item in order to properly handle your business logic. E.g. the information about the chosen options of a configurable product are saved in there. Feel free to use this one to apply important information to your line item, that you might have to process later on, e.g. in the template.

You can find a list of all available fields in the [createValidatorDefinition method of the LineItemFactoryRegistry](https://github.com/shopware/platform/blob/v6.3.5.0/src/Core/Checkout/Cart/LineItemFactoryRegistry.php#L113-L142).

If you now call the route `/cartAdd`, it should add the product with the ID `myExampleId` to the cart, 5 times.

## Create new factory handler

Sometimes you really want to have a custom line item handler, e.g. for your own new entity, such as a bundle entity or alike. For that case, you can create your own line item handler, which will then be available in the `LineItemFactoryRegistry` as a valid `type` option.

You need to create a new class which implements the interface `\Shopware\Core\Checkout\Cart\LineItemFactoryHandler\LineItemFactoryInterface` and it needs to be registered in the DI container with the tag `shopware.cart.line_item.factory`.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ExampleHandler">
            <tag name="shopware.cart.line_item.factory" />
        </service>
    </services>
</container>
```

Let's first have a look at an example handler:

```php
// <plugin root>/src/Service/ExampleHandler.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\LineItemFactoryHandler\LineItemFactoryInterface;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class ExampleHandler implements LineItemFactoryInterface
{
    public const TYPE = 'example';

    public function supports(string $type): bool
    {
        return $type === self::TYPE;
    }

    public function create(array $data, SalesChannelContext $context): LineItem
    {
        return new LineItem($data['id'], self::TYPE, $data['referencedId'] ?? null, 1);
    }

    public function update(LineItem $lineItem, array $data, SalesChannelContext $context): void
    {
        if (isset($data['referencedId'])) {
            $lineItem->setReferencedId($data['referencedId']);
        }
    }
}
```

Implementing the `LineItemFactoryInterface` will force you to also implement three new methods:

* `supports`: A method that is applied a string `$type`. This method has to return a bool whether or not it supports this type.

  In this example, this handler supports the line item type `example`.

* `create`: This method is responsible for actually creating an instance of a `LineItem`. Apply everything necessary for your custom line item type

  here, such as fields, that always have to be set for your case. It is called when the method `create` of the `LineItemFactoryRegistry` is called,

  just like in the example earlier in this guide.

* `update`: This method is called the method `update` of the `LineItemFactoryRegistry` is called. Just as the name suggests, your line item will be updated.

  Here you can define which properties of your line item may actually be updated. E.g. if you really want property X to contain "Y", you can do so here.

Now you'll need to add a processor for your type. Otherwise your item won't be persisted in the cart. A simple processor for our ExampleHandler could look like this:

```php
// <plugin root>/Core/Checkout/Cart/ExampleProcessor.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Cart;

use Swag\BasicExample\Service\ExampleHandler;
use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartBehavior;
use Shopware\Core\Checkout\Cart\CartProcessorInterface;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\Checkout\Cart\LineItem\CartDataCollection;

class ExampleProcessor implements CartProcessorInterface
{

    public function process(CartDataCollection $data, Cart $original, Cart $toCalculate, SalesChannelContext $context, CartBehavior $behavior): void
    {
        $lineItems = $original->getLineItems()->filterFlatByType(ExampleHandler::TYPE);

        foreach ($lineItems as $lineItem){
            $toCalculate->add($lineItem);
        }
    }
}
```

As you can see, this processor takes an "original cart" as an input and adds all instances of our example type to a second cart, which will actually be persisted.

Of course you can use processors to do much more than this. Have a look at [adding cart processors and collectors](./add-cart-processor-collector).

Now register this processor in your `services.xml` like this:

```html
// <plugin root>/Resources/config/services.xml
...
<services>
    ...
    <service id="Swag\BasicExample\Core\Checkout\Cart\ExampleProcessor">
        <tag name="shopware.cart.processor" priority="4800"/>
    </service>
</services>
```

And that's it. You should now be able to create line items of type `example`.

## Adding nested line item

When implementing nested line items, the plugins have to implement their own processing logic or alternatively extend Shopware's cart processors.

A plugin that reuses core line items can easily call the other processors to handle the nested line items themselves. Refer to [nested line items](../../../../../resources/references/adr/checkout/2021-03-24-nested-line-items) section of the guide for more information.
