# Add custom storefront controller

## Overview

In this guide you'll learn how to create a custom storefront controller.

## Prerequisites

In order to add your own controller for your plugin, you first need a plugin as base.
Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).

## Adding custom storefront controller

### Storefront Controller class example

First of all we have to create a new controller which extends from the `StorefrontController` class.
A controller is also just a service which can be registered via the DI-Container.
Furthermore, we have to define our `RouteScope` via annotation, it is used to define which domain a route is part of and **needs to be set for every route**.
In our case the scope is `storefront`.

Go ahead and create a new file `ExampleController.php` in the directory `<plugin root>/src/Storefront/Controller/`.

{% code title="<plugin root>/src/Storefront/Controller/ExampleController.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Storefront\Controller\StorefrontController;

/**
 * @RouteScope(scopes={"storefront"})
 */
class ExampleController extends StorefrontController
{
}
```
{% endcode %}

Now we can create a new example method with a `Route` annotation which has to contain our route, in this case it will be `/example`.
The route defines how our new method will be accessible.

Below you can find an example implementation of a controller method including a route, where we render an `example.html.twig` template file with a template variable `example`.

{% code title="<plugin root>/src/Storefront/Controller/ExampleController.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @RouteScope(scopes={"storefront"})
 */
class ExampleController extends StorefrontController
{
    /**
    * @Route("/example", name="frontend.example.example", methods={"GET"})
    */
    public function showExample(): Response
    {
        return $this->renderStorefront('@SwagBasicExample/storefront/page/example/index.html.twig', [
            'example' => 'Hello world'
        ]);
    }
}
```
{% endcode %}

The name of the method does not really matter, but it should somehow fit its purpose.
More important is the `Route` annotation, that points to the route `/example`.
Inside the method, we're using the method `renderStorefront` to render a twig template file in addition with
the template variable `example`, which contains `Hello world`. This template variable will be usable in the rendered
template file.
The method `renderStorefront` then returns a `Response`, as every routed controller method has to.


It is also possible to define the `RouteScope` per route and also multiple scopes at once, as you can see below.

{% code title="<plugin root>/src/Storefront/Controller/ExampleController.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @RouteScope(scopes={"storefront"})
 */
class ExampleController extends StorefrontController
{
    /**
    * @RouteScope(scopes={"storefront", "custom-scope"})
    * @Route("/example", name="frontend.example.example", methods={"GET"})
    */
    public function showExample(): Response
    {
        ...
    }
}
```
{% endcode %}

### Services.xml example

Next, we need to register our controller in the DI-container and make it public.

{% code title="<plugin root>/src/Resources/config/services.xml" %}
```markup
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services" 
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Storefront\Controller\ExampleController" public="true"/>
    </services>
</container>
```
{% endcode %}

### Routes.xml example

Once we‘ve registered our new controller, we have to tell Shopware how we want it to search for new routes in our plugin.
This is done with a `routes.xml` file at `<plugin root>/src/Resources/config/` location.
Have a look at the official [Symfony documentation](https://symfony.com/doc/current/routing.html) about routes and how they are registered.

{% code title="<plugin root>/src/Resources/config/routes.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8" ?>
<routes xmlns="http://symfony.com/schema/routing"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://symfony.com/schema/routing
        https://symfony.com/schema/routing/routing-1.0.xsd">

    <import resource="../../Storefront/Controller/**/*Controller.php" type="annotation" />
</routes>
```
{% endcode %}

### Adding template

Now we registered our controller and Shopware indexes the route, but the template file, that is supposed to be rendered, is still missing.
Let's change that now.

As previously mentioned, the code will try to render an `index.html.twig` file.
Thus we have to create an `index.html.twig` in the `<plugin root>/src/Resources/views/storefront/page/example` directory, as defined in our controller.
Below you can find an example, where we extend from the template `base.html.twig` and override the block `base_content`.
In our [Customize templates guide](./customize-templates.md), you can learn more about customizing templates.

{% code title="<plugin root>/src/Resources/views/storefront/page/example.html.twig" %}
```text
{% sw_extends '@Storefront/storefront/base.html.twig' %}

{% block base_content %}
    <h1>Our example controller!</h1>
{% endblock %}
```
{% endcode %}

### Request and Context

If necessary, we can access the `Request` and `SalesChannelContext` instances in our controller method.

Here's an example:

{% code title="<plugin root>/src/Storefront/Controller/ExampleController.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @RouteScope(scopes={"storefront"})
 */
class ExampleController extends StorefrontController
{
    /**
    * @Route("/example", name="frontend.example.example", methods={"GET"})
    */
    public function showExample(Request $request, SalesChannelContext $context): Response
    {
        ...
    }
}
```
{% endcode %}

## Next steps

Now that you know how to create a custom controller, you can make it more beautiful with some styling.
To get a grip on it, head over to our guide on [Add custom styling](add-custom-styling.md).

Since you've already created a controller now, which is also part of creating a so called "page" in Shopware,
you might want to head over to our guide about [creating a page](add-custom-page.md).

