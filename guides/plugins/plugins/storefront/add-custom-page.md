# Add custom page

## Overview

In this guide you'll learn how to create a custom storefront page.

## Prerequisites

In order to add your own page service for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).

Also having understood the concepts behind pages, pagelets and the pageloader [PLACEHOLDER-LINK: Page, pagelet, pageloader concept] will come in handy here.

## Adding custom storefront page

### Storefront Controller Class example

First of all we have to create a new controller which extends from the `StorefrontController`. A controller is also just a service which can be registered via the DI-Container. Furthermore, we have to define our `RouteScope` via annotation, it is used to define which domain a route is part of and **needs to be set for every route**. In our case the scope is `storefront`. Now we can create an example function with a `Route` annotation which has to contain our route, in this case it's `/example`. Below you can find an example implementation where we render an `example.html.twig` template file with a template variable `example`.

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
    * @Route("/example", name="frontend.example", methods={"GET"})
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

It is also possible to define the `RouteScope` per route and also multiple scopes, as you can see below.

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
    * @Route("/example", name="frontend.example", methods={"GET"})
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

Once we‘ve registered our new controller, we have to tell Shopware how we want it to search for new routes in our plugin. This is done with a `routes.xml` file at `<plugin root>/src/Resources/config/` location. Have a look at the official [Symfony documentation](https://symfony.com/doc/current/routing.html) about routes and how they are registered.

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

Now we registered our controller and Shopware indexes the route but at the moment we have no view, let's change this.
As previously mentioned, the code will try to render an `index.html.twig` file.
Thus we have to create an `index.html.twig` in the `<plugin root>/src/Resources/views/storefront/page/example` directory, as defined in our controller.
Below you can find an example, where we extend from the template `base.html.twig` and override the block `base_content`.
In our [Customize templates guide](./customize-templates.md), you can learn more about customizing templates.

{% code title="<plugin root>/src/Resources/views/storefront/page/example.html.twig" %}
```text
{% sw_extends '@Storefront/storefront/base.html.twig' %}

{% block base_content %}
    <h1>Our example page!</h1>
{% endblock %}
```
{% endcode %}

### Request and Context

If necessary, we can access the `Request` and `SalesChannelContext` in our function.

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
    * @Route("/example", name="frontend.example", methods={"GET"})
    */
    public function showExample(Request $request, SalesChannelContext $context): Response
    {
        ...
    }
}
```
{% endcode %}

## Next steps

Now that you know how to create a custom page, you can make it more beautiful with some styling.
To get a grip on it, head over to our guide on [Add custom styling](add-custom-styling.md).
Or maybe you want to make your page more dynamically with a bit javascript, which is explained in our [Add custom Javascript](add-custom-javascript.md) guide.

Also, you should know about pagelets, which are covered here [PLACEHOLDER-LINK: Pagelets guide].

