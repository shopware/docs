---
nav:
  title: Add custom controller
  position: 20

---

# Add Custom Controller

## Overview

In this guide you will learn how to create a custom Storefront controller.

## Prerequisites

In order to add your own controller for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide).

::: info
Refer to this video on **[Common Storefront controller tasks](https://www.youtube.com/watch?v=5eXXNh4cQG0)** explaining the basics about Storefront controllers. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Adding custom Storefront controller

### Storefront Controller class example

First of all we have to create a new controller which extends from the `StorefrontController` class. A controller is also just a service which can be registered via the service container. Furthermore, we have to define our `Route` with `defaults` and `_routeScope` via annotation, it is used to define which domain a route is part of and **needs to be set for every route**. In our case the scope is `storefront`.

::: info
Prior to Shopware 6.4.11.0 the `_routeScope` was configured by a dedicated annotation: `@RouteScope`. This way of defining the route scope is deprecated for the 6.5 major version.
:::

Go ahead and create a new file `ExampleController.php` in the directory `<plugin root>/src/Storefront/Controller/`.

```php
// <plugin root>/src/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Storefront\Controller\StorefrontController;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
 */
class ExampleController extends StorefrontController
{
}
```

Now we can create a new example method with a `Route` annotation which has to contain our route, in this case it will be `/example`. The route defines how our new method will be accessible.

Below you can find an example implementation of a controller method including a route, where we render an `example.html.twig` template file with a template variable `example`.

```php
// <plugin root>/src/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
 */
class ExampleController extends StorefrontController
{
    /**
    * @Route("/example", name="frontend.example.example", methods={"GET"})
    */
    public function showExample(): Response
    {
        return $this->renderStorefront('@SwagBasicExample/storefront/page/example.html.twig', [
            'example' => 'Hello world'
        ]);
    }
}
```

The name of the method does not really matter, but it should somehow fit its purpose. More important is the `Route` annotation, that points to the route `/example`. Also note its name, which is also quite important. Make sure to use prefixes `frontend`, `api` or `store-api` here, depending on what your route does. Inside the method, we're using the method `renderStorefront` to render a twig template file in addition with the template variable `example`, which contains `Hello world`. This template variable will be usable in the rendered template file. The method `renderStorefront` then returns a `Response`, as every routed controller method has to.

It is also possible to define the `_routeScope` per route.

::: info
Prior to Shopware 6.4.11.0 the `_routeScope` was configured by a dedicated annotation: `@RouteScope`. This way of defining the route-scope is deprecated for the 6.5 major version.
:::

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
    * @Route("/example", name="frontend.example.example", methods={"GET"}, defaults={"_routeScope"={"storefront"}})
    */
    public function showExample(): Response
    {
        ...
    }
}
```

### Services.xml example

Next, we need to register our controller in the DI-container and make it public.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services" 
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Storefront\Controller\ExampleController" public="true">
            <call method="setContainer">
                <argument type="service" id="service_container"/>
            </call>
        </service>
    </services>
</container>
```

Please also note the `call` tag, which is necessary in order to set the DI container to the controller.

### Routes.xml example

Once we‘ve registered our new controller, we have to tell Shopware how we want it to search for new routes in our plugin. This is done with a `routes.xml` file at `<plugin root>/src/Resources/config/` location. Have a look at the official [Symfony documentation](https://symfony.com/doc/current/routing.html) about routes and how they are registered.

```xml
// <plugin root>/src/Resources/config/routes.xml
<?xml version="1.0" encoding="UTF-8" ?>
<routes xmlns="http://symfony.com/schema/routing"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://symfony.com/schema/routing
        https://symfony.com/schema/routing/routing-1.0.xsd">

    <import resource="../../Storefront/Controller/**/*Controller.php" type="annotation" />
</routes>
```

### Adding template

Now we registered our controller and Shopware indexes the route, but the template file, that is supposed to be rendered, is still missing. Let's change that now.

As previously mentioned, the code will try to render an `index.html.twig` file. Thus we have to create an `index.html.twig` in the `<plugin root>/src/Resources/views/storefront/page/example` directory, as defined in our controller. Below you can find an example, where we extend from the template `base.html.twig` and override the block `base_content`. In our [Customize templates](customize-templates) guide, you can learn more about customizing templates.

```twig
// <plugin root>/src/Resources/views/storefront/page/example.html.twig
{% sw_extends '@Storefront/storefront/base.html.twig' %}

{% block base_content %}
    <h1>Our example controller!</h1>
{% endblock %}
```

### Request and Context

If necessary, we can access the `Request` and `SalesChannelContext` instances in our controller method.

Here's an example:

```php
// <plugin root>/src/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
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

## Next steps

Since you've already created a controller now, which is also part of creating a so called "page" in Shopware, you might want to head over to our guide about [creating a page](add-custom-page).
