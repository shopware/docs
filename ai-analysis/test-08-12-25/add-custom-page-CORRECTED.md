---
nav:
  title: Add custom page
  position: 100

---

# Add Custom Page

## Overview

In this guide, you will learn how to create a custom page for your Storefront.
A page consists of **four main components**:

1. **Controller** - Handles the HTTP request and response
2. **Page Loader** - Loads and prepares page data
3. **Page Class** - A struct containing all necessary data for the page
4. **Page Loaded Event** - Allows other code to react to your page being loaded

::: warning
**Best Practice:** Do not use direct or indirect repository calls in controllers or page loaders. Always use Store API routes to get or put data. This ensures proper encapsulation and maintains the separation between storefront and core layers.
:::

## Prerequisites

To add your own custom page for your plugin, you first need a plugin as base.
Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide). Since you need to load your page with a controller, you might want to have a look at our guide about [creating a controller](add-custom-controller) first.

## Architecture Overview

Before diving into implementation, let's understand the flow:

```
Request → Controller → Page Loader → Store API → Page Class → Event → Template → Response
```

1. User requests `/example-page`
2. Controller receives request and calls page loader
3. Page loader fetches data via Store API routes (not repositories!)
4. Page loader creates page object with data
5. Page loader dispatches page loaded event
6. Other code can listen to event and modify page
7. Controller renders template with page data
8. Response is returned to user

## Implementation Steps

### Step 1: Create the Page Class

First, create the page class that will hold all data for your page.

::: code-group

```php [src/Storefront/Page/Example/ExamplePage.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\Framework\Struct\ArrayEntity;
use Shopware\Storefront\Page\Page;

/**
 * Page class for custom example page.
 * 
 * This class extends from the base Page class, which provides:
 * - Meta information (SEO, robots, etc.)
 * - Helper methods from Struct class
 */
class ExamplePage extends Page
{
    /**
     * Custom data for this page.
     * Can be any type - entity, collection, array, etc.
     */
    protected ?ArrayEntity $exampleData = null;

    public function getExampleData(): ?ArrayEntity
    {
        return $this->exampleData;
    }

    public function setExampleData(ArrayEntity $exampleData): void
    {
        $this->exampleData = $exampleData;
    }
}
```

:::

::: info
**Why extend from `Page`?**

The base `Page` class from Shopware provides:
- `metaInformation` property (SEO meta tags, robots, etc.)
- Extends `Struct` which provides `assign()`, `createFrom()`, and other helper methods
- Standard structure that integrates with Shopware's page rendering system
:::

### Step 2: Create the Page Loaded Event

Create the event that will be dispatched when your page is loaded.

::: code-group

```php [src/Storefront/Page/Example/ExamplePageLoadedEvent.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\PageLoadedEvent;
use Symfony\Component\HttpFoundation\Request;

/**
 * Event dispatched when ExamplePage is loaded.
 * 
 * Other code can subscribe to this event to:
 * - Add additional data to the page
 * - Modify existing page data
 * - Track analytics
 * - Cache page data
 */
class ExamplePageLoadedEvent extends PageLoadedEvent
{
    /**
     * @param ExamplePage $page The loaded page instance
     * @param SalesChannelContext $salesChannelContext Current sales channel context
     * @param Request $request The original HTTP request
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

::: info
**Why create a custom event?**

Events allow:
- **Extensibility**: Other plugins can listen and modify your page
- **Separation of concerns**: Keep page loading logic modular
- **Testability**: Easy to test event subscribers independently
- **Shopware conventions**: All pages follow this pattern
:::

### Step 3: Create the Page Loader

The page loader is responsible for loading data and creating the page instance.

::: code-group

```php [src/Storefront/Page/Example/ExamplePageLoader.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\GenericPageLoaderInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\Service\ServiceSubscriberInterface;

/**
 * Loads the ExamplePage with all necessary data.
 * 
 * IMPORTANT: Do not use repositories directly! Always use Store API routes.
 * This ensures proper:
 * - Encapsulation between storefront and core
 * - Cache handling
 * - Event dispatching
 * - Permission checks
 */
class ExamplePageLoader implements ServiceSubscriberInterface
{
    /**
     * @param GenericPageLoaderInterface $genericPageLoader Loads base page data (meta info, etc.)
     * @param EventDispatcherInterface $eventDispatcher For dispatching page loaded event
     */
    public function __construct(
        private readonly GenericPageLoaderInterface $genericPageLoader,
        private readonly EventDispatcherInterface $eventDispatcher
    ) {
    }

    /**
     * Loads the complete ExamplePage with all data.
     *
     * @param Request $request The HTTP request
     * @param SalesChannelContext $context Current sales channel context
     * @return ExamplePage The fully loaded page
     */
    public function load(Request $request, SalesChannelContext $context): ExamplePage
    {
        // Step 1: Load generic page data (meta information, etc.)
        $page = $this->genericPageLoader->load($request, $context);

        // Step 2: Convert generic page to our custom page type
        // createFrom() is inherited from Struct class and copies all properties
        $page = ExamplePage::createFrom($page);

        // Step 3: Load custom data for this page
        // IMPORTANT: Use Store API routes, not repositories!
        // Example: $data = $this->loadDataFromStoreApi($context);
        // $page->setExampleData($data);

        // For demonstration, we'll use a simple ArrayEntity
        // In a real implementation, call a Store API route here
        $exampleData = new \Shopware\Core\Framework\Struct\ArrayEntity([
            'title' => 'Example Page',
            'description' => 'This is loaded via page loader',
        ]);
        $page->setExampleData($exampleData);

        // Step 4: Dispatch page loaded event
        // This allows other code to modify the page before it's rendered
        $this->eventDispatcher->dispatch(
            new ExamplePageLoadedEvent($page, $context, $request)
        );

        // Step 5: Return the fully loaded page
        return $page;
    }

    public static function getSubscribedServices(): array
    {
        return [
            GenericPageLoaderInterface::class,
            EventDispatcherInterface::class,
        ];
    }
}
```

:::

::: warning
**Critical: Why not use repositories directly?**

Shopware's architecture enforces that:
- **Storefront controllers/page loaders** → Must use **Store API routes**
- **Store API routes** → Can use **repositories** internally

This separation:
- ✅ Ensures consistent caching behavior
- ✅ Maintains proper event dispatching
- ✅ Enforces permission checks
- ✅ Allows API-first development (headless compatibility)
- ✅ Keeps storefront decoupled from core data layer

Example of correct pattern:
```php
// ❌ WRONG: Direct repository usage in page loader
$products = $this->productRepository->search($criteria, $context);

// ✅ CORRECT: Use Store API route
$products = $this->productListingRoute->load($request, $context)->getResult();
```
:::

### Step 4: Create the Controller

The controller handles the HTTP request and delegates to the page loader.

::: code-group

```php [src/Storefront/Controller/ExampleController.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Swag\BasicExample\Storefront\Page\Example\ExamplePageLoader;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Controller for custom example page.
 * 
 * @internal
 * Do not use direct or indirect repository calls in a controller. Always use a store-api route to get or put data
 */
#[Route(defaults: ['_routeScope' => ['storefront']])]
class ExampleController extends StorefrontController
{
    /**
     * @param ExamplePageLoader $examplePageLoader Loads the example page
     */
    public function __construct(
        private readonly ExamplePageLoader $examplePageLoader
    ) {
    }

    /**
     * Displays the custom example page.
     *
     * Route: /example-page
     * Name: frontend.example.page
     * Methods: GET
     *
     * @param Request $request The HTTP request
     * @param SalesChannelContext $context Current sales channel context
     * @return Response The rendered page
     */
    #[Route(
        path: '/example-page',
        name: 'frontend.example.page',
        defaults: ['_httpCache' => true],
        methods: ['GET']
    )]
    public function showPage(Request $request, SalesChannelContext $context): Response
    {
        // Load the page using the page loader
        $page = $this->examplePageLoader->load($request, $context);

        // Render the template with page data
        return $this->renderStorefront(
            '@SwagBasicExample/storefront/page/example/index.html.twig',
            ['page' => $page]
        );
    }
}
```

:::

::: info
**Route Configuration Explained**

- **`defaults: ['_routeScope' => ['storefront']]`**: Marks this as a storefront route (not admin or API)
- **`path: '/example-page'`**: The URL path for accessing this page
- **`name: 'frontend.example.page'`**: Unique route name for generating URLs
- **`defaults: ['_httpCache' => true]`**: Enables HTTP caching for this page (optional)
- **`methods: ['GET']`**: Only accept GET requests
:::

::: warning
**Route Scope Evolution**

Shopware 6.7 uses a simplified route scope syntax:
```php
// ✅ NEW (Shopware 6.7+): Simplified syntax
#[Route(defaults: ['_routeScope' => ['storefront']])]

// ⚠️ OLD (Shopware 6.5/6.6): Still works but verbose
#[Route(defaults: [PlatformRequest::ATTRIBUTE_ROUTE_SCOPE => [StorefrontRouteScope::ID]])]
```

Both work in Shopware 6.7, but the new syntax is recommended for clarity.
:::

### Step 5: Register Services

Register all services in your `services.xml`.

::: code-group

```xml [src/Resources/config/services.xml]
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <!-- Page Loader -->
        <service id="Swag\BasicExample\Storefront\Page\Example\ExamplePageLoader" public="true">
            <argument type="service" id="Shopware\Storefront\Page\GenericPageLoader"/>
            <argument type="service" id="event_dispatcher"/>
        </service>

        <!-- Controller -->
        <service id="Swag\BasicExample\Storefront\Controller\ExampleController" public="true">
            <argument type="service" id="Swag\BasicExample\Storefront\Page\Example\ExamplePageLoader"/>
            <call method="setContainer">
                <argument type="service" id="service_container"/>
            </call>
            <tag name="controller.service_arguments"/>
        </service>
    </services>
</container>
```

:::

::: info
**Service Registration Notes**

- **Page Loader**: Must be `public="true"` to be injected into controller
- **Controller**: Must have `controller.service_arguments` tag for Symfony routing
- **`setContainer` call**: Required for `StorefrontController` to access services like `renderStorefront()`
:::

### Step 6: Create the Template

Create a simple template to display your page.

::: code-group

```twig [src/Resources/views/storefront/page/example/index.html.twig]
{% sw_extends '@Storefront/storefront/base.html.twig' %}

{% block base_content %}
    <div class="container">
        <h1>{{ page.exampleData.title }}</h1>
        <p>{{ page.exampleData.description }}</p>

        {# Access meta information from base page #}
        <p>Page Title: {{ page.metaInformation.metaTitle }}</p>
    </div>
{% endblock %}
```

:::

## Testing Your Page

After implementation:

1. **Clear cache**: `bin/console cache:clear`
2. **Visit your page**: Navigate to `https://your-shop.com/example-page`
3. **Check for errors**: Monitor the Symfony profiler and logs
4. **Test event dispatching**: Add an event subscriber to verify your `ExamplePageLoadedEvent` is fired

### Example Event Subscriber (for testing)

::: code-group

```php [src/Subscriber/ExamplePageSubscriber.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Swag\BasicExample\Storefront\Page\Example\ExamplePageLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ExamplePageSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ExamplePageLoadedEvent::class => 'onExamplePageLoaded',
        ];
    }

    public function onExamplePageLoaded(ExamplePageLoadedEvent $event): void
    {
        // Add custom data or modify the page
        $page = $event->getPage();
        
        // Example: Add additional data
        $additionalData = $page->getExampleData();
        $additionalData->assign(['addedBySubscriber' => true]);
    }
}
```

:::

Register the subscriber:

```xml
<service id="Swag\BasicExample\Subscriber\ExamplePageSubscriber">
    <tag name="kernel.event_subscriber"/>
</service>
```

## Common Pitfalls

### ❌ Using Repositories Directly

```php
// DON'T DO THIS in page loader or controller
public function load(Request $request, SalesChannelContext $context): ExamplePage
{
    $products = $this->productRepository->search($criteria, $context); // ❌ WRONG
    // ...
}
```

### ✅ Use Store API Routes Instead

```php
// DO THIS instead
public function load(Request $request, SalesChannelContext $context): ExamplePage
{
    $products = $this->productListingRoute->load($request, $context); // ✅ CORRECT
    // ...
}
```

### ❌ Forgetting to Dispatch Event

```php
public function load(Request $request, SalesChannelContext $context): ExamplePage
{
    $page = ExamplePage::createFrom($this->genericPageLoader->load($request, $context));
    // Missing: $this->eventDispatcher->dispatch(new ExamplePageLoadedEvent(...));
    return $page; // ❌ Event not dispatched
}
```

### ❌ Wrong Route Scope

```php
// If you use the wrong scope, your route won't work
#[Route(defaults: ['_routeScope' => ['api']])] // ❌ WRONG for storefront
class ExampleController extends StorefrontController { }
```

## Architecture Summary

The complete page architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ HTTP Request: GET /example-page                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ ExampleController::showPage()                               │
│ - Receives request and context                              │
│ - Calls page loader                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ ExamplePageLoader::load()                                   │
│ 1. Load generic page (meta info)                            │
│ 2. Convert to ExamplePage                                   │
│ 3. Load data via Store API (not repository!)                │
│ 4. Set data on page                                          │
│ 5. Dispatch ExamplePageLoadedEvent                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Event Subscribers (optional)                                │
│ - Modify page data                                           │
│ - Add additional information                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Controller renders template                                 │
│ - Passes page object to Twig                                │
│ - Returns Response                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ HTTP Response: Rendered HTML                                │
└─────────────────────────────────────────────────────────────┘
```

## Next Steps

You've now successfully created a complete custom storefront page following Shopware's best practices.

**Recommended next steps:**

- **[Add custom pagelet](add-custom-pagelet)** - Learn about reusable page fragments
- **[Add custom controller](add-custom-controller)** - More controller patterns
- **[Store API routes](../../framework/store-api/add-store-api-route)** - Create your own Store API routes for data loading
- **[Add custom complex data](../framework/data-handling/add-custom-complex-data)** - Create custom entities for your page data

## Key Takeaways

✅ **Always extend from base `Page` class** for meta information and helpers  
✅ **Always use Store API routes**, never repositories directly  
✅ **Always dispatch a page loaded event** for extensibility  
✅ **Use correct route scope** (`['_routeScope' => ['storefront']]`)  
✅ **Follow naming conventions** (Page, PageLoader, PageLoadedEvent)  
✅ **Register all services** in `services.xml` with correct dependencies  

## Validation

This documentation has been validated against:
- **Shopware Version**: 6.7.5.0
- **Validation Date**: December 8, 2025
- **Code References**:
  - `platform/src/Storefront/Controller/StorefrontController.php`
  - `platform/src/Storefront/Page/GenericPageLoader.php`
  - `platform/src/Storefront/Page/Page.php`
  - `platform/src/Storefront/Controller/LandingPageController.php` (reference implementation)

