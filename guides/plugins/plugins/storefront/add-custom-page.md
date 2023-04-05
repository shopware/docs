---
nav:
  title: Add custom page
  position: 100

---

# Add Custom Page

## Overview

In this guide you will learn how to create custom page for your Storefront. A page in general consists of a controller, a page loader, a "page loaded" event and a page class, which is like a struct and contains most necessary data for the page.

## Prerequisites

In order to add your own custom page for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide). Since you need to load your page with a controller, you might want to have a look at our guide about [creating a controller](add-custom-controller) first. The controller created in the previously mentioned controller guide will also be used in this guide.

## Adding custom page

In the following sections, we'll create each of the necessary classes one by one. The first one will be controller, whose creation is not going to explained here again. Have a look at the guide about [creating a controller](add-custom-controller) to see why it works.

### Creating ExampleController

Let's have a look at an example controller.

```php
// <plugin root>/src/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
 */
class ExampleController extends StorefrontController
{
    /**
     * @Route("/example-page", name="frontend.example.page", methods={"GET"})
     */
    public function examplePage(): Response
    {
    }
}
```

It has a method `examplePage`, which is accessible via the route `example-page`. This method will be responsible for loading your page later on, but we'll leave it like that for now.

Don't forget to [register your controller via the DI](add-custom-controller#Services.xml%20example).

### Creating the pageloader

In order to stick to Shopware's default location for the page loader, we'll have to create a new directory: `<plugin root>/src/Storefront/Page/Example`.

In there, we will proceed to create all page related classes, such as the page loader.

Go ahead and create a new file called `ExamplePageLoader.php`. It's a new service, which doesn't have to extend from any other class. You might want to implement a `ExamplePageLoaderInterface` interface, which is not explained in this guide. You can do that in order to have a decoratable page loader class.

The page loader is responsible for creating your page class instance \(`ExamplePage`, will be created in the next section\), filling it with data, e.g. from store api, and firing a `PageLoaded` event, so others can react to your page being loaded.
Do not use a repository directly in a page loader. Always get the data for your pages from a store api route instead.

Let's have a look at a full example `ExamplePageLoader`:

```php
// <plugin root>/src/Storefront/Page/Example/ExamplePageLoader.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\GenericPageLoaderInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;

class ExamplePageLoader
{
    private GenericPageLoaderInterface $genericPageLoader;

    private EventDispatcherInterface $eventDispatcher;

    public function __construct(GenericPageLoaderInterface $genericPageLoader, EventDispatcherInterface $eventDispatcher)
    {
        $this->genericPageLoader = $genericPageLoader;
        $this->eventDispatcher = $eventDispatcher;
    }

    public function load(Request $request, SalesChannelContext $context): ExamplePage
    {
        $page = $this->genericPageLoader->load($request, $context);
        $page = ExamplePage::createFrom($page);

        // Do additional stuff, e.g. load more data from store api and add it to page
         $page->setExampleData(...);

        $this->eventDispatcher->dispatch(
            new ExamplePageLoadedEvent($page, $context, $request)
        );

        return $page;
    }
}
```

So first of all, as already mentioned: This is a new class or service, which doesn't have to extend from any other class. The constructor is passed two arguments: The `GenericPageLoaderInterface` and the `EventDispatcherInterface`.

The first one is not necessary, but useful, since it loads all kind of default page stuff, such as a footer and a header and loads some additional helpful data. Once again, you don't have to do that, but if you want your page to have a footer etc., you should add it.

The `EventDispatcherInterface` is of course necessary in order to fire an event later on.

Every page loader should implement a `load` method, which is not mandatory, but convention. You want your page loader to work like all the other page loaders, right? It should return an instance of your example page, in this case `ExamplePage`. Don't worry, we haven't created that one yet, it will be created in the next sections. So, the first thing it does is basically creating a `Page` instance, containing all necessary basic data, such as the footer etc.

Afterwards you're creating your own page instance by using the method `createFrom`. This method is available, since your `ExamplePage` has to extend from the `Page` struct, which in return extends from the `Struct` class. The latter implements the [CreateFromTrait](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Framework/Struct/CreateFromTrait.php) containing this method. In short, this will create an instance of your `ExamplePage`, containing all the data from the generic `Page` object.

Afterwards, you can add more data to your page instance by using a setter. Of course, your example page class then has to have such a setter method, as well as a getter.

As already mentioned, you should also fire an event once your page was loaded. For this case, you need a custom page loaded event class, which is also created in the next sections. It will be called `ExamplePageLoadedEvent`.

The last thing to do in this method is to return your new page instance.

Remember to register your new page loader in the DI container:

```html
// <plugin root>/src/Resources/config/services.xml
<service id="Swag\BasicExample\Storefront\Page\Example\ExamplePageLoader" public="true">
    <argument type="service" id="Shopware\Storefront\Page\GenericPageLoader" />
    <argument type="service" id="event_dispatcher"/>
</service>
```

#### Adjusting the controller

Theoretically, this is all your page loader does - but it's not being used yet. Therefore, you have to inject your page loader to your custom controller and execute the `load` method.

```php
// <plugin root>/src/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

...

class ExampleController extends StorefrontController
{
    private ExamplePageLoader $examplePageLoader;

    public function __construct(ExamplePageLoader $examplePageLoader)
    {
        $this->examplePageLoader = $examplePageLoader;
    }

    /**
     * @Route("/example-page", name="frontend.example.page", methods={"GET"})
     */
    public function examplePage(Request $request, SalesChannelContext $context): Response
    {
        $page = $this->examplePageLoader->load($request, $context);

        return $this->renderStorefront('@SwagBasicExample/storefront/page/example/index.html.twig', [
            'example' => 'Hello world',
            'page' => $page
        ]);
    }
}
```

Note, that we've added the page to the template variables.

### Creating the example page

So now we're going to create the example page class, that was already used in our page loader, `ExamplePage`.

It has to extend from the `Shopware\Storefront\Page\Page` class in order to contain a field for the header, the footer etc., as well as some helper methods.

Let's have a look at an example:

```php
// <plugin root>/src/Storefront/Page/Example/ExamplePage.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Storefront\Page\Page;
use Swag\BasicExample\Core\Content\Example\ExampleEntity;

class ExamplePage extends Page
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

As explained in the page loader section, your page can contain all kinds of custom data. It has to provide a getter and a setter for the custom data, so it can be applied and read. In this example, the entity from our guide about [creating custom complex data](../framework/data-handling/add-custom-complex-data#Entity%20class) is being used.

And that's it already. Your page is ready to go.

### Creating the page loaded event

One more class is missing, the custom event class. It has to extend from the `Shopware\Storefront\Page\PageLoadedEvent` class.

Its constructor parameter will be the `ExamplePage`, which it has to save into a property and there needs to be a getter in order to get the example page instance. Additional constructor parameters are the `Request` and the `SalesChannelContext`, which you have to pass to the parent's constructor.

Here's the example:

```php
// <plugin root>/src/Storefront/Page/Example/ExamplePageLoadedEvent.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\PageLoadedEvent;
use Symfony\Component\HttpFoundation\Request;

class ExamplePageLoadedEvent extends PageLoadedEvent
{
    protected ExamplePage $page;

    public function __construct(ExamplePage $page, SalesChannelContext $salesChannelContext, Request $request)
    {
        $this->page = $page;
        parent::__construct($salesChannelContext, $request);
    }

    public function getPage(): ExamplePage
    {
        return $this->page;
    }
}
```

And that's it for your `ExamplePageLoadedEvent` class.

Your example page should now be fully functioning.

## Next steps

You've now successfully created a whole new page, including a custom controller, a custom template, and the necessary classes to create a new page, a loader, the page struct and the page loaded event.

In your `load` method, you've used the `GenericPageLoader`, which takes care of such a thing as the footer or the header. Those two are so called "pagelets", basically reusable fractions of a page. Learn how to [create a custom pagelet](add-custom-pagelet).
