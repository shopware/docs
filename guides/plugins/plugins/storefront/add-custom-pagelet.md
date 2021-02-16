# Add custom pagelet

## Overview

In this guide you'll learn how to create custom pagelets for your Storefront pages.
What exactly pages and pagelets are, can be found on our respective concept guide [PLACEHOLDER-LINK: Concept pages & pagelets].

In short: Pages are exactly that, a fully functioning page ob your store with a template loaded by a route.
A pagelet is an important and reusable fraction of several pages, such as a footer or the navigation.

## Prerequisites

In order to add your own custom pagelet for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).
Since a pagelet is just part of another page, we're going to use the page created in our guide about [PLACEHOLDER-LINK: Add custom page].

## Adding custom pagelet

### Example PageLoader class

First of all we have to create a PageLoader class in `<plugin root>/src/Storefront/Page/<name of page>/`, in this case we named it `Example`, so our loader will be named `ExamplePageLoader`. A page loader is just a normal service, if you don't know much about services, head over to our guide about creating a custom service [PLACEHOLDER-LINK: Add a custom class / service].
In our page loader we inject `Shopware\Storefront\Page\GenericPageLoader`, `Swag\BasicExample\Core\Content\Example\SalesChannel\AbstractExampleRoute` and `Symfony\Component\EventDispatcher\EventDispatcherInterface`.
Next, we create a private function called `getExample` where we return a collection of our example data we got by the store api.

Here's an example class:

{% code title="<plugin root>/src/Storefront/Page/Example/ExamplePageLoader.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\Checkout\Cart\Exception\CustomerNotLoggedInException;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\GenericPageLoader;
use Swag\BasicExample\Core\Content\Example\SalesChannel\AbstractExampleRoute;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;

class ExamplePageLoader
{
    /**
     * @var GenericPageLoader
     */
    private $genericLoader;

    /**
     * @var EventDispatcherInterface
     */
    private $eventDispatcher;
    
    /**
     * @var AbstractExampleRoute
     */
    private $exampleRoute;

    public function __construct(GenericPageLoader $genericLoader, EventDispatcherInterface $eventDispatcher, AbstractExampleRoute $exampleRoute)
    {
        $this->genericLoader = $genericLoader;
        $this->eventDispatcher = $eventDispatcher;
        $this->exampleRoute = $exampleRoute;
    }

    private function getExample(SalesChannelContext $context): ExampleCollection
    {
        return $this->exampleRoute->load((new Criteria()), $context)->getExamples();
    }
}
```
{% endcode %}

After we created our page loader class, we have to inject it via the DI-Container.

Here's an example `services.xml`:

{% code title="<plugin root>/src/Resources/config/services.xml" %}
```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        ...
        
        <service id="Swag\BasicExample\Storefront\Page\Example\ExamplePageLoader">
            <argument type="service" id="Shopware\Storefront\Page\GenericPageLoader"/>
            <argument type="service" id="Symfony\Component\EventDispatcher\EventDispatcherInterface"/>
            <argument type="service" id="swag_example.repository"/>
        </service>
    </services>
</container>
```
{% endcode %}

### ExamplePage class

Now we create a page class called `ExamplePage` extending from `Shopware\Storefront\Page\Page` which comes with some page functions such as setting meta information.
We will add a getter and setter function for our `ExampleCollection` we want to use. Below you can find an example implementation.

{% code title="<plugin root>/src/Storefront/Page/Example/ExamplePage.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Storefront\Page\Page;
use Swag\BasicExample\Core\Content\Example\ExampleCollection;

class ExamplePage extends Page
{
    /**
     * @var ExampleCollection
     */
    protected $examples;

    public function getExamples(): ExampleCollection
    {
        return $this->examples;
    }

    public function setExamples(ExampleCollection $collection): void
    {
        $this->examples = $collection;
    }
}
```
{% endcode %}

### Example PageLoadedEvent class

After we've created our page class, we have to create a `PageLoadedEvent`. In this example we name it `ExamplePageLoadedEvent` which has to extend from `Shopware\Storefront\Page\PageLoadedEvent`.
This event will be fired, when our page gets loaded. In the constructor we have to inject our `ExamplePage` we've created in the previous step, the `Shopware\Core\System\SalesChannel\SalesChannelContext` and the `Symfony\Component\HttpFoundation\Request`.
Our `ExamplePage` has to be stored in a protected variable. The `SalesChannelContext` and the `Request` will be used to call the parent constructor.
Last, we add a function `getPage` returning our `ExamplePage` we stored in a variable.

This is how your class could look like then:

{% code title="<plugin root>/src/Storefront/Page/Example/ExamplePageLoadedEvent.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Page\Example;

use Shopware\Core\Framework\Struct\Struct;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\PageLoadedEvent;
use Symfony\Component\HttpFoundation\Request;

class ExamplePageLoadedEvent extends PageLoadedEvent
{
    /**
     * @var ExamplePage
     */
    protected $page;

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
{% endcode %}

Finnaly we add a function called `load` to our `ExamplePageLoader` where we load a generic page struct. With this struct we can create our `ExamplePage` struct from it.
Then we can assign some meta information or other stuff provided by the struct. After the assignment we dispatch our `ExamplePageLoadedEvent` event with the page, our context and the request.
Last, you return the page struct. Below you can find an example how it could look like.

```php
public function load(Request $request, SalesChannelContext $context): ExamplePage
{
    // If we want to check whether we are logged-in
    if (!$context->getCustomer() instanceof CustomerEntity) {
        throw new CustomerNotLoggedInException();
    }
    
    $page = $this->genericLoader->load($request, $context);
    
    $example = $this->getExample($context);
    
    $page = ExamplePage::createFrom($page);
        
    // Assign some meta informations
    if ($page->getMetaInformation()) {
        $page->getMetaInformation()->setRobots('noindex,follow');
    }
        
    $page->setExample($example);
        
    $this->eventDispatcher->dispatch(
        new ExamplePageLoadedEvent($page, $context, $request)
    );

    return $page;
}
```

## Next steps

Now that you know, how you can create your custom pagelet, you could take a look at our [PLACEHOLDER-LINK: Add custom page] guide to create your first page.