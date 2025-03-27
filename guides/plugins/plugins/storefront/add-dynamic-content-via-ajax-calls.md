---
nav:
  title: Add dynamic content via AJAX calls
  position: 40

---

# Add Dynamic Content via AJAX Calls

## Overview

This guide will show you how to add dynamic content to your Storefront.
It combines and builds upon the guides about [adding custom Javascript](add-custom-javascript) and [adding a custom controller](add-custom-controller), so you should probably read them first.

## Setting up the Controller

For this guide we will use a very simple controller that returns a timestamp wrapped in the JSON format.

::: info
Refer to this video on **[Creating a JSON controller](https://www.youtube.com/watch?v=VzREUDdpZ3E)** dealing with the creation of a controller that returns JSON data.
Available also on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

As mentioned before this guide builds up upon the [adding a custom controller](add-custom-controller) guide.
This means that this article will only cover the differences between returning a template and a `JSON` response and making it accessible to `XmlHttpRequests`.

```php
// <plugin base>/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace SwagBasicExample\Storefront\Controller;

use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['storefront']])]
class ExampleController extends StorefrontController
{
    #[Route(path: '/example', name: 'frontend.example.example', methods: ['GET'], defaults: ['XmlHttpRequest' => 'true'])]
    public function showExample(): JsonResponse
    {
        return new JsonResponse(['timestamp' => (new \DateTime())->format(\DateTimeInterface::W3C)]);
    }
}
```

As you might have seen this controller isn't too different from the controller used in the article mentioned before.
The route attribute has an added `defaults: ['XmlHttpRequest' => true]` to allow XmlHttpRequest, and it returns a `JsonResponse` instead of a normal `Response`.
Using a `JsonResponse` instead of a normal `Response` causes the data structures passed to it to be automatically turned into a `JSON` string.

The following `services.xml` and `routes.xml` are identical as in the before mentioned article, but here they are for reference anyway:

::: code-group

```xml [<plugin root>/src/Resources/config/services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services" 
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="SwagBasicExample\Storefront\Controller\ExampleController" public="true">
            <call method="setContainer">
                <argument type="service" id="service_container"/>
            </call>
        </service>
    </services>
</container>
```

```xml [<plugin root>/src/Resources/config/routes.xml]
<?xml version="1.0" encoding="UTF-8" ?>
<routes xmlns="http://symfony.com/schema/routing"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://symfony.com/schema/routing
        https://symfony.com/schema/routing/routing-1.0.xsd">

    <import resource="../../Storefront/Controller/**/*Controller.php" type="attribute" />
</routes>
```

:::

## Preparing the Plugin

Now we have to add a `Storefront Javascript plugin` to display the timestamp we get from our controller.

Again this is built upon the [adding custom Javascript](add-custom-javascript) article, so if you don't already know what Storefront `plugins` are, hold on and read it first.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
const { PluginBaseClass } = window;

export default class AjaxLoadPlugin extends PluginBaseClass {
    init() {
        this.button = this.el.children['ajax-button'];
        this.textdiv = this.el.children['ajax-display'];

        this._registerEvents();
    }

    _registerEvents() {
        // fetch the timestamp, when the button is clicked
        this.button.onclick = this._fetch.bind(this);
    }

    async _fetch() {
        const response = await fetch('/example');
        const data = await response.json();
        this.textdiv.innerHTML = data.timestamp;
    }
}
```

and register it in the `main.js`

```javascript
import AjaxLoadPlugin from './example-plugin/example-plugin.plugin';

window.PluginManager.register('AjaxLoadPlugin', AjaxLoadPlugin, '[data-ajax-helper]');
```

## Adding the Template

The only thing that is now left, is to provide a template for the Storefront plugin to hook into:

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block cms_content %}
    <div>
        <h1>Swag AJAX Example</h1>

        <div data-ajax-helper>
            <div id="ajax-display"></div>
            <button id="ajax-button">Button</button>
        </div>
    </div>
{% endblock %}
```

## Next steps

The controller we used in this example doesn't do a lot, but this pattern of providing and using data is generally the same.
Even if you use it to fetch data form the database, but in that case you probably want to learn more about the [DAL](../../../../concepts/framework/data-abstraction-layer).
