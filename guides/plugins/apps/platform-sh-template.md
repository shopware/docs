# Platform.sh template

## Overview

If you want to develop your own app but don't want to host it yourself this will fit perfect for you. This guide will walk you through the process of getting started with our template for [Platform.sh](https://platform.sh).

## Getting started

In order to use [the template](https://github.com/shopwareLabs/AppTemplate) for development or for production you need to configure two things.

* The `APP_NAME` \(the unique name of your app, the root app folder has to be named equally\)
* The `APP_SECRET` \(a secret which is needed for the registration process\)

You need to set both of them in your `manifest.xml` but also in the `.platform.app.yaml`.

An example for the `manifest.xml` would be:

{% code title="manifest.xml" %}
```markup
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/app-system/0.1.0/src/Core/Content/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <name>myAppName</name>
    </meta>
    <setup>
        <secret>myAppSecret</secret>
    </setup>
</manifest>
```
{% endcode %}

An example for the [.platform.app.yaml](https://github.com/shopwareLabs/AppTemplate/blob/master/.platform.app.yaml) would be:

{% code title=".platform.app.yaml" %}
```yaml
variables:
    env:
        APP_NAME: myExampleApp
        APP_SECRET: myAppSecret
```
{% endcode %}

Also change them in the `.env` to develop locally.

## Create the manifest.xml

The easiest way to create `manifest.xml`-files is the `bin/console app:create-manifest` command. This command will generate a manifest from the [template](https://github.com/shopwareLabs/AppTemplate/blob/master/templates/manifest-template.xml). For testing purposes this is the default manifest template from our example app.  
In there you can use `{{ APP_NAME }}`,`{{ APP_SECRET }}`,`{{ APP_URL_CLIENT }}` and `{{ APP_URL_BACKEND }}` which will get replaced by the values configured in your `.env`. Further more you can use your own variables like `{{ MY_OWN_VARIABLE }}` and declare them when executing the command like this `bin/console app:create-manifest MY_OWN_VARIABLE=MY_OWN_VARIABLE_VALUE`.  
This allows you to change URL's in your `manifest.xml` without changing the `.env` file. The generated `manifest.xml` can be found in `build/dev`.

## Development

This development template is symfony based. To register your app you only need to configure your manifest. The registration URL is `https://www.my-app.com/registration`.

The `SwagAppsystem\Client` and `SwagAppsystem\Event` will be injected in each controller when you need them. For example:

{% code title="AppExample/src/Controller/Order/OrderController.php" %}
```php
<?php declare(strict_types=1);

namespace App\Controller;

use App\SwagAppsystem\Client;
use App\SwagAppsystem\Event;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;

class OrderController
{
    /**
     * @Route("/order/placed/event", methods={"POST"})
     */
    public function orderPlacedEvent(Client $client, Event $event): Response
    {
        ...
    }
}
```
{% endcode %}

## Testing

To test your app you can use [PHPUnit](https://phpunit.de/index.html).  
You can write your own tests in `tests` and execute them using `vendor/bin/phpunit`.

To check your code style you can use [EasyCodingStandard](https://github.com/symplify/easy-coding-standard)  
Execute `vendor/bin/ecs check` to check your code against the provided style or add `--fix` to also fix your code.

## The registration process

The registration is the most important thing in your app. It is handled by the [Registration controller](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Controller/Registration.php).

The registration will go through several steps.

* authenticate the registration request
* generate a unique secret for the shop
* save the secret with the id and the url of the shop
* send the secret to the shop with a confirmation url
* authenticate the confirmation request
* save the access keys for the shop

Now the shop is registered to the app, and it can start communicating with it.

## Communicating with the shop

The communication with the shop is done through the [Client](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Client.php). The client includes all necessary functionality for communication purposes.

It will lazily authenticate itself to the shop whenever needed.  
For example if you want to search a specific product it will first authenticate itself to get the bearer token from the shop. Then it will set the necessary headers which are needed and then perform your search.

If there is some functionality which isn't implemented into the client you can access the underlying http client with `$client->getHttpClient`. This client has already the needed header and token to communicate with the shop. Now you can perform your own requests.

## Handling events

In your manifest you can define webhooks.  
These are handled in your app through the [Event](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Event.php). You can use it whenever an event gets triggered.

The event itself has all the necessary information you might need. It includes the `shopUrl`, `shopId`, `appVersion` and the `eventData`.

## The argument resolvers

The above objects are provided by two argument resolvers. One for the [Client](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Client.php) and one for the [Event](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Event.php).  
The purpose of those is to inject the [Client](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Client.php) and the [Event](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Event.php) whenever you need them.

For example, you define a route for incoming webhooks and want to fetch some extra data. Then you can use them as a parameter of the method which will be called when a request is sent to the route.

But how do you know that the request is from the shop and not from someone who is sending post requests to your app? The argument resolvers take care of it. Whenever you use one of them as a parameter the request will be authenticated. If the request isn't authenticated the [Client](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Client.php) or the [Event](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Event.php) will be null.

## The shop repository

The [ShopRepository](https://github.com/shopwareLabs/AppTemplate/blob/master/src/Repository/ShopRepository.php) provides the secret of the shop and its [Credentials](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Credentials.php).  
This comes in handy if you want to build your own [Client](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Client.php). You can use the [ShopRepository](https://github.com/shopwareLabs/AppTemplate/blob/master/src/Repository/ShopRepository.php) to get the [Credentials](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/Credentials.php) for a specific `shopId` and build your client with it.

## App lifecycle events

There are five app lifecycle events which can be triggered during the lifecycle of an app. The events are `app.installed`, `app.updated`, `app.deleted`, `app.activated` and `app.deactivated`. To use this events you have to create the webhooks in your manifest. If you want to implement your own code you need to implement the [AppLifecycleHandler](https://github.com/shopwareLabs/AppTemplate/blob/master/src/SwagAppsystem/AppLifecycleHandler.php) interface and write your own code.

The `app.installed` event gets triggered each time the app gets installed. This will also trigger the `app.activated` event. At each of these events the shop is already installed and registered at your app. The webhook could look like this:

{% code title="manifest.xml" %}
```markup
<webhook name="appLifecycleInstalled" url="https://your-shop-url/applifecycle/installed" event="app.installed"/>
```
{% endcode %}

The `app.updated` event gets triggered each time a shop updated your app.  
The webhook could look like this:

{% code title="manifest.xml" %}
```markup
<webhook name="appLifecycleUpdated" url="https://your-shop-url/applifecycle/updated" event="app.updated"/>
```
{% endcode %}

The `app.deleted` event gets triggered each time a shop deletes your app. At this point the shop is deleted using the [shopRepository](https://github.com/shopwareLabs/AppTemplate/blob/master/src/Repository/ShopRepository.php). You need to delete all the shop's data you have saved, and are not legally required to keep, then stop the communication with the shop.  
The webhook could look like this:

{% code title="manifest.xml" %}
```markup
<webhook name="appLifecycleDeleted" url="https://your-shop-url/applifecycle/deleted" event="app.deleted"/>
```
{% endcode %}

The `app.activated` event gets triggered each time your app gets installed or activated. At this point you can start the communication with the shop.  
The webhook could look like this:

{% code title="manifest.xml" %}
```markup
<webhook name="appLifecycleActivated" url="https://your-shop-url/applifecycle/activated" event="app.activated"/>
```
{% endcode %}

The `app.deactivated` event gets triggered each time your app gets deactivated. At this point you should stop the communication with the shop.  
The webhook could look like this:

{% code title="manifest.xml" %}
```markup
<webhook name="appLifecycleDeactivated" url="https://your-shop-url/applifecycle/deactivated" event="app.deactivated"/>
```
{% endcode %}

## Deployment on Platform.sh

To deploy your app on [Platform.sh](https://platform.sh) you might check out the [Platform.sh Deployment](hosting-guide/platform-sh-deployment.md) part of our documentation.

## Infrastructure

Let's talk about the infrastructure.  
The infrastructure is coupled to your plan which you are paying for. Each resource whether it is CPU and RAM or disc space is only for one environment / cluster. It is not shared between multiple environments / clusters.

### CPU and RAM

The resources for cpu and ram are shared between all your container in the cluster. If one container in your application needs much more ram than another application then you can set the resources with the `size` key.  
You can configure this for your application in your [.platform.app.yaml](https://github.com/shopwareLabs/AppTemplate/blob/master/.platform.app.yaml). And configure this for your services in your [services.yaml](https://github.com/shopwareLabs/AppTemplate/blob/master/.platform/services.yaml).

This key is optional and by default set to `AUTO`. However, if you want to change it, you can set it to `S`, `M`, `L`, `XL`, `2XL` or `4XL`.  
This defines how much resources one container gets. If the total resources requested by all apps and services is larger than that what the plan size allows then a production deployment will fail with an error.

You need to keep in mind that the `size` key only has impact on your production environment. The key will be ignored in the development environment and will be set to `S`. If you need to increase this you can do it on you plan settings page for a fee.

### Disc space

Another thing you can configure is the disk space of each application and service. You can also configure this in [.platform.app.yaml](https://github.com/shopwareLabs/AppTemplate/blob/master/.platform.app.yaml#L40) and [services.yaml](https://github.com/shopwareLabs/AppTemplate/blob/master/.platform/services.yaml).

The resources for the disc space are also shared between all container in the cluster. The key for this is the `disk` key. It is optional so if you don't set it Platform.sh will handle it for you.  
However, if you need much storage for your database then you can change this key in your [services.yaml](https://github.com/shopwareLabs/AppTemplate/blob/master/.platform/services.yaml). The value of this key is always in MB. For our example we used 2GB or 2048MB for our application and another 2GB or 2048MB for our database.  
The default storage you get with each plan is 5GB or 5120MB. In our case we only used 4GB or 4096MB so you have 1GB or 1024 left which you can give to your application or to your database. Whether you use it or not won't affect your costs.

