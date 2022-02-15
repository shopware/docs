# Add data to storefront page

## Overview

Pages or pagelets are the objects that get handed to the templates and provide all necessary information for the template to render.

If you make template changes you probably want to display some data that is currently not available in the page.
In this case you will have to listen on the page loaded event and then load the additional data and add it to the page object.
This guide will show you how to achieve this, by adding the total number of active products to the footer pagelet and displaying them in the storefront.

## Prerequisites

This guide is built upon our [Plugin base guide](../plugin-base-guide.md), so keep that in mind.

Also the following knowledge is necessary, even though some of them are covered here as well:

* Knowing how to [listen to events by using a subscriber](../plugin-fundamentals/listening-to-events.md)
* Knowing how to [customize storefront templates](customize-templates.md)
* Knowing how to [read data using our data abstraction layer](../framework/data-handling/reading-data.md)

## Adding data to the storefront

The workflow you need here was already described in the overview: 

1. Figure out which page you want to change 
2. Register to the event that this page is firing 
3. Add data to the page via the event 
4. Display this data in the storefront


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

```markup
<!-- in Resources/config/services.xml -->
<service id="Swag\BasicExample\Service\AddDataToPage" >
    <tag name="kernel.event_subscriber" />
</service>
```

### Adding data to the page

Now that we have registered our Subscriber to the right event, we first need to fetch the additional data we need and then add it as an extension to the pagelet.

If you don't understand what's happening in the example, make sure to have a look at our guide about [reading data](../framework/data-handling/reading-data.md) first.

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Aggregation\Metric\CountAggregation;
use Shopware\Core\Framework\DataAbstractionLayer\Search\AggregationResult\Metric\CountResult;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Storefront\Pagelet\Footer\FooterPageletLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class AddDataToPage implements EventSubscriberInterface
{
    private EntityRepositoryInterface $productRepository;

    public function __construct(EntityRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            FooterPageletLoadedEvent::class => 'addActiveProductCount'
        ];
    }

    public function addActiveProductCount(FooterPageletLoadedEvent $event): void
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('product.active', true));
        $criteria->addAggregation(new CountAggregation('productCount', 'product.id'));

        /** @var CountResult $productCountResult */
        $productCountResult = $this->productRepository
            ->aggregate($criteria, $event->getContext())
            ->get('productCount');

        $event->getPagelet()->addExtension('product_count', $productCountResult);
    }
}
```

So you should know and understand the first few lines if you've read our guide about [reading data](../framework/data-handling/reading-data.md) first.
Make sure to also understand the usage of aggregations, since this is what is done here.
The only main difference you might notice is, that we're using the `aggregate()` method instead of the `search()` method.
This will not actually search for any products and return the whole products dataset, but rather just the aggregated data, nothing else.

Completely new should only be the last line: `$event->getPagelet()->addExtension('product_count', $productCountResult);`

Basically you're doing here, is to fetch actual pagelet instance from the event and add the data to the template.
This data will then be available via the name `product_count`, but we'll get to that in the next section.

Now you only have to adjust your service definition to inject the product repository:

```markup
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\AddDataToPage" >
            <argument type="service" id="product.repository"/>
            <tag name="kernel.event_subscriber" />
        </service>
    </services>
</container>
```

### Displaying the data in the storefront

To display the additional data we need to override the footer template and render the data.
You can find detailed information on how to extend templates and override blocks [here](customize-templates.md).

For our case we extend the footer template and add a new column to the navigation block:

{% raw %}
```text
<!-- in Resources/views/storefront/layout/footer/footer.html.twig -->
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
{% endraw %}

Note the usage of the variable here. You're accessing the footer object, in which you can now find the path `extensions.product_count.count`.

That's it for this guide, you've successfully added data to a storefront page\(let\).
