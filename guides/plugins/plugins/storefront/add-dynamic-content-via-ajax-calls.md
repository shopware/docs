# Add dynamic content via AJAX calls

## Overview

This guide will show you how to add dynamic content to your storefront. It combines and builds upon the the guides about [adding custom Javascript](add-custom-javascript.md) and [adding a custom controller](add-custom-controller.md), so you should probably read them first.

## Setting up the Controller

For this guide we will use a very simple controller that returns a timestamp wrapped in the JSON format.

<!-- markdown-link-check-disable-next-line -->
{% hint style="info" %}
Here's a video dealing with the creation of a controller that returns JSON data from our free online training ["Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).

**[Creating a JSON controller](https://www.youtube.com/watch?v=VzREUDdpZ3E)**
{% endhint %}

As mentioned before this guide builds up upon the [adding a custom controller](add-custom-controller.md) guide. This means that this article will only cover the differences between returning a template and a `JSON` response and making it accessible to `XmlHttpRequests`.

{% code title="<plugin base>/Storefront/Controller/ExampleController.php" %}
```php
<?php declare(strict_types=1);

namespace SwagBasicExample\Storefront\Controller;

use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @RouteScope(scopes={"storefront"})
 */
class ExampleController extends StorefrontController
{
   /**
    * @Route("/example", name="frontend.example.example", defaults={"XmlHttpRequest"=true}, methods={"GET"})
    */
    public function showExample(): JsonResponse
    {
        return new JsonResponse(['timestamp' => (new \DateTime())->format(\DateTimeInterface::W3C)]);
    }
}
```
{% endcode %}

As you might have seen this controller isn't too different from the controller used in the article mentioned before. The route annotation has an added `defaults={"XmlHttpRequest"=true}` to allow XmlHttpRequest and it returns a `JsonResponse` instead of a normal `Response`. Using a `JsonResponse` instead of a normal `Response` causes the data structures passed to it to be automatically turned into a `JSON` string.

The following `services.xml` and `routes.xml` are identical as in the before mentioned article, but here they are for reference anyways:

{% code title="<plugin root>/src/Resources/config/services.xml" %}
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

{% code title="<plugin root>/src/Resources/config/routes.xml" %}
```markup
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
{% endcode %}

## Preparing the Plugin

Now we have to add a `Storefront Javascript plugin` to display the timestamp we get from our controller.

Again this is built upon the [adding custom Javascript](add-custom-javascript.md) article, so if you don't already know what storefront `plugins` are, hold on and read it first.

{% code title="<plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js" %}
```javascript
import HttpClient from 'src/service/http-client.service';
import Plugin from 'src/plugin-system/plugin.class';

export default class AjaxPlugin extends Plugin {
    init() {
        // initalize the HttpClient
        this._client = new HttpClient();

        // get refernces to the dom elements
        this.button = this.el.children['ajax-button'];
        this.textdiv = this.el.children['ajax-display'];

        // register the events
        this._registerEvents();
    }

    _registerEvents() {
        // fetch the timestamp, when the button is clicked
        this.button.onclick = this._fetch.bind(this);
    }

    _fetch() {
        // make the network request and call the `_setContent` function as a callback
        this._client.get('/example', this._setContent.bind(this), 'application/json', true)
    }

    _setContent(data) {
        // parse the response and set the `textdiv.innerHTML` to the timestamp
        this.textdiv.innerHTML = JSON.parse(data).timestamp;
    }
}
```
{% endcode %}

## Adding the Template

The only thing that is now left, is to provide a template for the storefront plugin to hook into:

{% code title="<plugin root>/src/Resources/views/storefront/page/content/index.html.twig" %}
```text
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
{% endcode %}

## Next steps

The controller we used in this example doesn't do a lot, but this pattern of providing and using data is generally the same. Even if you use it to fetch data form the database, but in that case you probably want to learn more about the DAL [here](../../../../concepts/framework/data-abstraction-layer.md).

