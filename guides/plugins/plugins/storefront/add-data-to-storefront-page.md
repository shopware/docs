# Add Data to Storefront Page

## Overview

Pages or pagelets are the objects that get handed to the templates and provide all necessary information for the template to render.

If you make template changes you probably want to display some data that is currently not available in the page.
In this case you will have to listen on the page loaded event and then load the additional data and add it to the page object.
This guide will show you how to achieve this, by adding the total number of active products to the footer pagelet and displaying them in the Storefront.

## Prerequisites

This guide is built upon our [Plugin base guide](../plugin-base-guide.md), so keep that in mind.

Also the following knowledge is necessary, even though some of them are covered here as well:

* Knowing how to [listen to events by using a subscriber](../plugin-fundamentals/listening-to-events.md)
* Knowing how to [customize storefront templates](customize-templates.md)
* Knowing how to [read data using our data abstraction layer](../framework/data-handling/reading-data.md)
* Knowing how to [add a store-api route](../framework/store-api/add-store-api-route.md)

## Adding data to the Storefront

The workflow you need here was already described in the overview:

1. Figure out which page you want to change
1. Register to the event that this page is firing
1. Add a store-api route for your needed data
1. Add data to the page via the event
1. Display this data in the Storefront

### Subscribe to an event

So first of all, you need to know which page or pagelet you actually want to extend.
In this example, we're going to extend the [FooterPagelet](https://github.com/shopware/platform/blob/trunk/src/Storefront/Pagelet/Footer/FooterPagelet.php).
All pages or pagelets throw `Loaded` events and this is the right event to subscribe to if you want to add data to the page or pagelet.
In our case we want to add data to the `FooterPagelet` so we need to subscribe to the `FooterPageletLoadedEvent`.

```php
// SwagBasicExample/src/Service/AddDataToPage.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Storefront\Pagelet\Footer\FooterPageletLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class AddDataToPage implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            FooterPageletLoadedEvent::class => 'addActiveProductCount'
        ];
    }

    public function addActiveProductCount(FooterPageletLoadedEvent $event): void
    {

    }
}
```

The next thing we need to do is register our subscriber in the DI-Container and tag it as an event subscriber:

```xml
// Resources/config/services.xml
<?xml version="1.0" ?>
<service id="Swag\BasicExample\Service\AddDataToPage" >
    <tag name="kernel.event_subscriber" />
</service>
```

### Adding data to the page

Now that we have registered our Subscriber to the right event, we first need to fetch the additional data we need and then add it as an extension to the pagelet.

Because we are in an event of a Pagelet we should not directly call the DAL to fetch the data. Instead we should check if there is a proper store-api route to fetch our data.
If we just wanted to add specific products data we could use the ProductListRoute. But we want to fetch data that is currently not returned in a performant way with the store-api.
The ProductListRoute could return the data but it would return way to much data for our purpose. Because of that we will add a new store-api route for our data.

First you should read our guide for [adding store-api routes](../framework/store-api/add-store-api-route).

Our new Route should look like this:

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use OpenApi\Annotations as OA;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Plugin\Exception\DecorationPatternException;
use Shopware\Core\Framework\Routing\Annotation\Entity;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route(defaults={"_routeScope"={"store-api"}})
 */
class ProductCountRoute extends AbstractProductCountRoute
{
    protected EntityRepository $productRepository;

    public function __construct(EntityRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function getDecorated(): AbstractExampleRoute
    {
        throw new DecorationPatternException(self::class);
    }

    /**
     * @Entity("swag_get_active_product_count")
     * @OA\Post(
     *      path="/get-active-product-count",
     *      summary="This route can be used to get the count of all active products",
     *      operationId="readProductCount",
     *      tags={"Store API", "productCount"},
     *      @OA\Parameter(name="Api-Basic-Parameters"),
     *      @OA\Response(
     *          response="200",
     *          description="",
     *          @OA\JsonContent(type="object",
     *              @OA\Property(
     *                  property="productCount",
     *                  type="integer",
     *                  description="Total amount"
     *              )
     *          )
     *     )
     * )
     * @Route("/store-api/get-active-product-count", name="store-api.product-count.get", methods={"GET", "POST"})
     */
    public function load(Criteria $criteria, SalesChannelContext $context): ProductCountRouteResponse
    {
        criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('product.active', true));
        $criteria->addAggregation(new CountAggregation('productCount', 'product.id'));

        /** @var CountResult $productCountResult */
        $productCountResult = $this->productRepository
            ->aggregate($criteria, $event->getContext())
            ->get('productCount');
            
        return new ProductCountRouteResponse($productCountResult);
    }
}
```

So you should know and understand the first few lines if you have read our guide about [Reading data](../framework/data-handling/reading-data.md) first.
Make sure to also understand the usage of aggregations, since this is what is done here.
The only main difference you might notice is, that we're using the `aggregate()` method instead of the `search()` method.
This will not actually search for any products and return the whole products dataset, but rather just the aggregated data, nothing else.

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Content\Product\SalesChannel\ProductCountRoute;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Aggregation\Metric\CountAggregation;
use Shopware\Core\Framework\DataAbstractionLayer\Search\AggregationResult\Metric\CountResult;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Storefront\Pagelet\Footer\FooterPageletLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class AddDataToPage implements EventSubscriberInterface
{
    private ProductCountRoute $productCountRoute;

    public function __construct(ProductCountRoute $productCountRoute)
    {
        $this->productCountRoute = $productCountRoute;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            FooterPageletLoadedEvent::class => 'addActiveProductCount'
        ];
    }

    public function addActiveProductCount(FooterPageletLoadedEvent $event): void
    {
        $productCountResponse = $this->productCountRoute->load(new Criteria(), $event->getContext());

        $event->getPagelet()->addExtension('product_count', $productCountResponse->getProductCount());
    }
}
```

The first line should be nothing new as it is only the call for the store-api route, we created.
Completely new should only be the last line: `$event->getPagelet()->addExtension('product_count', $productCountResult);`

Basically what you're doing here, is to fetch the actual pagelet instance from the event and add the data to the template.
This data will then be available via the name `product_count`, but we'll get to that in the next section.

Now you only have to adjust your service definition to inject the productCountRoute:

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\AddDataToPage" >
            <argument type="service" id="Swag\BasicExample\Core\Content\Example\SalesChannel\ProductCountRoute"/>
            <tag name="kernel.event_subscriber" />
        </service>
    </services>
</container>
```

### Displaying the data in the Storefront

To display the additional data we need to override the footer template and render the data.
Refer to the respective section of this guide for detailed information on how to [extend templates and override blocks](customize-templates.md).

For our case we extend the footer template and add a new column to the navigation block:

```twig
// Resources/views/storefront/layout/footer/footer.html.twig
{% sw_extends '@Storefront/storefront/layout/footer/footer.html.twig' %}

{% block layout_footer_navigation_columns %}
    {{ parent() }}

    {% if page.footer.extensions.product_count %}
        <div class="col-md-4 footer-column">
            <p>This shop offers you {{ page.footer.extensions.product_count.count }} products</p>
        </div>
    {% endif %}
{% endblock %}
```

Note the usage of the variable here. You're accessing the footer object, in which you can now find the path `extensions.product_count.count`.

That's it for this guide, you've successfully added data to a Storefront page\(let\).
