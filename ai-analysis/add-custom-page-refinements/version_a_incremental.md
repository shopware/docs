---
nav:
  title: Add custom page
  position: 100

---

# Add Custom Page

## Overview

In this guide, you will learn how to create a custom page for your Storefront.
A page in general consists of a controller, a page loader, a "page loaded" event and a page class, which is like a struct and contains the most necessary data for the page.

::: info Why use this architecture?
This separation of concerns allows for better testability, reusability, and extensibility. The page loader handles data fetching, the page class structures the data, and events allow other plugins to modify or react to your page loading.
:::

## Prerequisites

To add your own custom page for your plugin, you first need a plugin as base.
Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide). Since you need to load your page with a controller, you might want to have a look at our guide about [creating a controller](add-custom-controller) first.
The controller created in the previously mentioned controller guide will also be used in this guide.

## Adding custom page

In the following sections, we'll create each of the necessary classes one by one.
The first one will be a controller, whose creation is not going to be explained here again.
Have a look at the guide about [creating a controller](add-custom-controller) to see why it works.

### Creating ExampleController

Let's have a look at an example controller.

::: code-group

```php [PLUGIN_ROOT/src/Storefront/Controller/ExampleController.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Swag\BasicExample\Storefront\Page\Example\ExamplePageLoader;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * @internal
 * Do not use direct or indirect repository calls in a controller. Always use a store-api route to get or put data
 */
#[Route(defaults: ['_routeScope' => ['storefront']])]
#[Package('storefront')]
class ExampleController extends StorefrontController
{
    /**
     * @internal
     */
    public function __construct(
        private readonly ExamplePageLoader $examplePageLoader
    ) {
    }

    #[Route(path: '/example-page', name: 'frontend.example.page', methods: ['GET'])]
    public function showPage(Request $request, SalesChannelContext $context): Response
    {
        $page = $this->examplePageLoader->load($request, $context);

        return $this->renderStorefront('@SwagBasicExample/storefront/page/example/index.html.twig', [
            'page' => $page
        ]);
    }
}
```

:::

::: warning Critical Best Practices
- Mark internal classes with `@internal` PHPDoc
- Never use repositories in controllers - always use Store API routes
- Use PHP 8 attributes for routing instead of annotations
- Use readonly properties with constructor property promotion
:::

It has a method `showPage`, which is accessible via the route `example-page`.
This method will be responsible for loading your page later on.

Don't forget to [register your controller via the DI](add-custom-controller#services-xml-example).

### Creating the pageloader

To stick to Shopware's default location for the page loader, we'll have to create a new directory: `<plugin root>/src/Storefront/Page/Example`.

In there, we will proceed to create all page related classes, such as the page loader.

Go ahead and create a new file called `ExamplePageLoader.php`.
It's a new service, which doesn't have to extend from any other class.
You might want to implement a `ExamplePageLoaderInterface` interface, which is not explained in this guide.
You can do that to have a decoratable page loader class.

::: info Why use a page loader?
The page loader is responsible for creating your page class instance, filling it with data from Store API routes, and firing a `PageLoaded` event so others can react to your page being loaded. This separation keeps your controller thin and focused on HTTP concerns.
:::

::: warning Repository Usage
Do not use a repository directly in a page loader. Always get the data for your pages from a Store API route instead. This ensures proper access control, caching, and API consistency.
:::

Let's have a look at a full example `ExamplePageLoader`:

::: code-group

```php [PLUGIN_ROOT/src/Storefront/Page/Example/ExamplePageLoader.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\GenericPageLoaderInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 */
#[Package('storefront')]
class ExamplePageLoader
{
    /**
     * @internal
     */
    public function __construct(
        private readonly GenericPageLoaderInterface $genericPageLoader,
        private readonly EventDispatcherInterface $eventDispatcher
    ) {
    }

    public function load(Request $request, SalesChannelContext $context): ExamplePage
    {
        $page = $this->genericPageLoader->load($request, $context);
        $page = ExamplePage::createFrom($page);

        // Load additional data from Store API routes
        // Example: $exampleData = $this->loadExampleDataFromStoreApi($context);
        // $page->setExampleData($exampleData);

        $this->eventDispatcher->dispatch(
            new ExamplePageLoadedEvent($page, $context, $request)
        );

        return $page;
    }

    private function loadExampleDataFromStoreApi(SalesChannelContext $context): array
    {
        // Use Store API routes to fetch data instead of repositories
        // This ensures proper access control and caching
        return [
            'title' => 'Example Page',
            'content' => 'This is example content loaded from Store API'
        ];
    }
}
```

:::

So first of all, as already mentioned: This is a new class or service, which doesn't have to extend from any other class.
The constructor is passed two arguments: The `GenericPageLoaderInterface` and the `EventDispatcherInterface`.

The first one is not necessary, but useful, since it loads all kinds of default page data like meta information, header, footer, and navigation data.

The `EventDispatcherInterface` is necessary to fire an event after the page is loaded.

Every page loader should implement a `load` method, which is not mandatory, but convention.
You want your page loader to work like all the other page loaders, right?
It should return an instance of your example page, in this case `ExamplePage`.

So, the first thing it does is basically creating a `Page` instance, containing basic data, like the meta-information.

Afterwards, you're creating your own page instance by using the method `createFrom`.
This method is available, since your `ExamplePage` has to extend from the `Page` struct, which in return extends from the `Struct` class.
The latter implements the [CreateFromTrait](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Struct/CreateFromTrait.php) containing this method.
In short, this will create an instance of your `ExamplePage`, containing all the data from the generic `Page` object.

Afterwards, you can add more data to your page instance by using a setter.
Of course, your example page class then has to have such a setter method, as well as a getter.

As already mentioned, you should also fire an event once your page was loaded.
For this case, you need a custom page loaded event class, which is also created in the next sections.
It will be called `ExamplePageLoadedEvent`.

The last thing to do in this method is to return your new page instance.

Remember to register your new page loader in the DI container:

::: code-group

```xml [PLUGIN_ROOT/src/Resources/config/services.xml]
<service id="Swag\BasicExample\Storefront\Page\Example\ExamplePageLoader" public="true">
    <argument type="service" id="Shopware\Storefront\Page\GenericPageLoader" />
    <argument type="service" id="event_dispatcher"/>
</service>

<service id="Swag\BasicExample\Storefront\Controller\ExampleController" public="true">
    <argument type="service" id="Swag\BasicExample\Storefront\Page\Example\ExamplePageLoader" />
    <call method="setContainer">
        <argument type="service" id="service_container"/>
    </call>
</service>
```

:::

### Creating the example page

So now we're going to create the example page class, that was already used in our page loader, `ExamplePage`.

It has to extend from the `Shopware\Storefront\Page\Page` class to contain the meta information, as well as some helper methods.

Let's have a look at an example:

::: code-group

```php [PLUGIN_ROOT/src/Storefront/Page/Example/ExamplePage.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Page;

/**
 * @internal
 */
#[Package('storefront')]
class ExamplePage extends Page
{
    protected array $exampleData = [];

    public function getExampleData(): array
    {
        return $this->exampleData;
    }

    public function setExampleData(array $exampleData): void
    {
        $this->exampleData = $exampleData;
    }

    public function getTitle(): string
    {
        return $this->exampleData['title'] ?? 'Example Page';
    }

    public function getContent(): string
    {
        return $this->exampleData['content'] ?? '';
    }
}
```

:::

As explained in the page loader section, your page can contain all kinds of custom data.
It has to provide a getter and a setter for the custom data, so it can be applied and read.
In this example, we're using a simple array structure, but you could also use custom entity classes from our guide about [creating custom complex data](../framework/data-handling/add-custom-complex-data#entity-class).

And that's it already.
Your page is ready to go.

### Creating the page loaded event

One more class is missing, the custom event class.
It has to extend from the `Shopware\Storefront\Page\PageLoadedEvent` class.

Its constructor parameter will be the `ExamplePage`, which it has to save into a property and there needs to be a getter to get the example page instance.
Additional constructor parameters are the `SalesChannelContext` and the `Request`, which you have to pass to the parent's constructor.

Here's the example:

::: code-group

```php [PLUGIN_ROOT/src/Storefront/Page/Example/ExamplePageLoadedEvent.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\PageLoadedEvent;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 */
#[Package('storefront')]
class ExamplePageLoadedEvent extends PageLoadedEvent
{
    /**
     * @internal
     */
    public function __construct(
        protected ExamplePage $page,
        SalesChannelContext $salesChannelContext,
        Request $request
    ) {
        parent::__construct($salesChannelContext, $request);
    }

    public function getPage(): ExamplePage
    {
        return $this->page;
    }
}
```

:::

::: info Why create a custom event?
Custom page loaded events allow other plugins to modify your page data, add additional information, or react to your page being loaded. This is essential for extensibility in the Shopware ecosystem.
:::

And that's it for your `ExamplePageLoadedEvent` class.

Your example page should now be fully functioning.

## Template Integration

Don't forget to create the corresponding Twig template for your page:

::: code-group

```twig [PLUGIN_ROOT/src/Resources/views/storefront/page/example/index.html.twig]
{% sw_extends '@Storefront/storefront/base.html.twig' %}

{% block base_content %}
    <div class="example-page">
        <div class="container">
            <h1>{{ page.title }}</h1>
            <div class="example-content">
                {{ page.content }}
            </div>
        </div>
    </div>
{% endblock %}
```

:::

## Next steps

You've now successfully created a whole new page, including a custom controller, a custom template,
and the necessary classes to create a new page: a loader, the page struct and the page loaded event.

In your `load` method, you've used the `GenericPageLoader`, which takes care of the meta-information of the page.
There are also "pagelets", basically reusable fractions of a page. Learn how to [create a custom pagelet](add-custom-pagelet).