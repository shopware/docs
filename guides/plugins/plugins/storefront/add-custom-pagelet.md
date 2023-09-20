# Add Custom Pagelet

## Overview

In this guide you will learn how to create custom pagelets for your Storefront pages.

In short: Pages are exactly that, a fully functioning page of your store with a template loaded by a route. A pagelet is an important and reusable fraction of several pages, such as a footer or the navigation.

## Prerequisites

In order to add your own custom pagelet for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide). Since a pagelet is just part of another page, we are going to use the page created in our guide about [adding a custom page](add-custom-page).

## Adding custom pagelet

Bssically a pagelet is created exactly like a page: You need a pagelet loader, a pagelet struct to hold the data and a pagelet loaded event.

Since creating this kind of classes is explained in detail in our guide about [adding a custom page](add-custom-page), it is not going to be explained here in detail again. Yet, there's some differences worth mentioning:

* The struct to hold the data has to extend from the `Shopware\Storefront\Pagelet\Pagelet` class instead of `Shopware\Storefront\Page\Page`
* A pagelet doesn't have to be bound to a controller, e.g. with an extra route. It can have a route though!
* A pagelet is mostly loaded by another page or multiple pages, that's their purpose
* The `GenericPageLoaderInterface` is not used, since it is responsible to load the footer or header pagelet. You don't want to load

  a pagelet \(footer or header\) into your pagelet

* The pagelet instance is not created via `Pagelet::createFrom()`, but rather you just create a new instance yourself. That's because the

  `Pagelet::createFrom()` was only necessary to create a new instance of your page, which already contains the footer & header pagelets.

  Once again: You don't want that in your pagelet.

* The pagelet loaded event class extends from `Shopware\Storefront\Pagelet\PageletLoadedEvent` instead of `Shopware\Storefront\Page\PageLoadedEvent`

Let's now have a look at the example classes. The pagelet is going to be called `ExamplePagelet` in the following examples.

### The ExamplePageletLoader

```php
// <plugin root>/src/Storefront/Pagelet/Example/ExamplePageletLoader.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Pagelet\Example;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\GenericPageLoaderInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;

class ExamplePageletLoader
{
    private EventDispatcherInterface $eventDispatcher;

    public function __construct(EventDispatcherInterface $eventDispatcher)
    {
        $this->eventDispatcher = $eventDispatcher;
    }

    public function load(Request $request, SalesChannelContext $context): ExamplePagelet
    {
        $pagelet = new ExamplePagelet();

        // Do additional stuff, e.g. load more data from store-api and add it to page
        $pagelet->setExampleData(...);

        $this->eventDispatcher->dispatch(
            new ExamplePageletLoadedEvent($pagelet, $context, $request)
        );

        return $pagelet;
    }
}
```

Note the instance creation without the `::createFrom()` call. The rest is quite equal, you can load your data, set it to the pagelet struct, you fire an event and you return the pagelet.

### The ExamplePagelet struct

```php
// <plugin root>/src/Storefront/Pagelet/Example/ExamplePagelet.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Pagelet\Example;

use Shopware\Storefront\Pagelet\Pagelet;
use Swag\BasicExample\Core\Content\Example\ExampleEntity;

class ExamplePagelet extends Pagelet
{
    protected ExampleEntity $exampleData;

    public function getExampleData(): ExampleEntity
    {
        return $this->exampleData;
    }

    public function setExampleData(ExampleEntity $exampleData): void
    {
        $this->exampleData = $exampleData;
    }
}
```

Just like the page struct, this is basically just a class holding data. Note the different `extend` though, you're not extending from `Shopware\Storefront\Page\Page` here. It only contained helper method for the header & footer pagelets.

### The ExamplePageletLoadedEvent

```php
// <plugin root>/src/Storefront/Pagelet/Example/ExamplePageletLoadedEvent.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Pagelet\Example;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Pagelet\PageletLoadedEvent;
use Symfony\Component\HttpFoundation\Request;

class ExamplePageletLoadedEvent extends PageletLoadedEvent
{
    protected ExamplePagelet $pagelet;

    public function __construct(ExamplePagelet $pagelet, SalesChannelContext $salesChannelContext, Request $request)
    {
        $this->pagelet = $pagelet;
        parent::__construct($salesChannelContext, $request);
    }

    public function getPagelet(): ExamplePagelet
    {
        return $this->pagelet;
    }
}
```

Note the different `extends`, which uses the `PageletLoadedEvent` class instead. Also, the getter method is no longer `getPage`, but `getPagelet` instead.

## Loading the pagelet

### Loading the pagelet via another page

Most times you want to load your pagelet as part of another page. This is simply done by calling the `load` method of your pagelet in another page's `load` method.

Using the example from our [adding a custom page](add-custom-page) guide, this is what the `load` method could look like:

```php
// <plugin root>/src/Storefront/Page/Example/ExamplePageLoader.php
public function load(Request $request, SalesChannelContext $context): ExamplePage
{
    $page = $this->genericPageLoader->load($request, $context);
    $page = ExamplePage::createFrom($page);

    $page->setExamplePagelet($this->examplePageletLoader->load($request, $context));

    // Do additional stuff, e.g. load more data from store-api and add it to page
     $page->setExampleData(...);

    $this->eventDispatcher->dispatch(
        new ExamplePageletLoadedEvent($page, $context, $request)
    );

    return $page;
}
```

Of course, in this example your `ExamplePage` struct needs a method `setExamplePagelet`, as well as the respective getter method `getExamplePagelet`. And then that's it, you've loaded your pagelet as part of another page.

### Loading the pagelet via route

As already mentioned, a pagelet can be loaded via a route if you want it to. For that case, you can simply add a new route to your controller and load the pagelet via the `ExamplePageletLoader`:

```php
/**
 * @Route("/example-pagelet", name="frontend.example.pagelet", methods={"POST"}, defaults={"XmlHttpRequest"=true})
 */
public function examplePagelet(Request $request, SalesChannelContext $context): Response
{
    $pagelet = $this->examplePageletLoader->load($request, $context);

    return $this->renderStorefront('@Storefront/storefront/pagelet/example/index.html.twig', [
        'pagelet' => $pagelet
    ]);
}
```

Using the part `defaults={"XmlHttpRequest"=true}` in the annotation ensures, that this pagelet can be loaded using an XML HTTP Request.
