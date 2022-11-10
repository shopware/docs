# App Base Guide

## Overview

This guide will walk you through the process of adding your own app to Shopware and configuring it, so it is able to communicate to your external backend server.

## Prerequisites

If you're not familiar with the app system, please take a look at the concept first.

<PageRef page="../../../concepts/extensions/apps-concept" title="<<<title-missing>>>" />

## File structure

To get started with your app, create an `apps` folder inside the `custom` folder of your Shopware dev installation. In there, create another folder for your application and provide a manifest file in it.

```text
└── custom
    ├── apps
    │   └── MyExampleApp
    │       └── manifest.xml
    └── plugins
```

## Manifest File

The manifest file is the central point of your app. It defines the interface between your app and the Shopware instance. It provides all the information concerning your app, as seen in the minimal version below:

<CodeBlock title="manifest.xml">

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <name>MyExampleApp</name>
        <label>Label</label>
        <label lang="de-DE">Name</label>
        <description>A description</description>
        <description lang="de-DE">Eine Beschreibung</description>
        <author>Your Company Ltd.</author>
        <copyright>(c) by Your Company Ltd.</copyright>
        <version>1.0.0</version>
        <icon>Resources/config/plugin.png</icon>
        <license>MIT</license>
    </meta>
</manifest>
```

</CodeBlock>

::: warning
The name of your app, that you provide in the manifest file, needs to match the folder name of your app.
:::

The app can now be installed by running the following command:

```sh
bin/console app:install --activate MyExampleApp
```

By default, your app files will be [validated](app-base-guide.md#validation) before installation, to skip the validation you may use the `--no-validate` flag.

::: info
Apps get installed as inactive. You can activate them by passing the `--activate` flag to the `app:install` command or by executing the `app:activate` command after installation.
:::

For a complete reference of the structure of the manifest file take a look at the [Manifest reference](../../../resources/references/app-reference/manifest-reference).

## Setup

If your app backend server and Shopware need to communicate, it is necessary that a registration is performed during the installation of your app.
This process is called setup.  
During the setup it is verified, that Shopware connects to the right backend server and keys are exchanged to secure all further communications.
During the setup process your app backend will obtain credentials that can be used to authenticate against the Shopware API.
Additionally, your app will provide a secret that Shopware will use to sign all further requests it makes to your app backend, allowing you to verify that the incoming requests originate from authenticated Shopware installations.

The setup workflow is shown in the following schema, each step will be explained in detail.

![Setup request workflow](../../../.gitbook/assets/shop-app-communication-1-.svg)

::: info
The timeout for the requests against app server is 5 seconds.
:::

### Registration Request

The registration request is made as a GET request against a URL that you provide in the manifest file of your app.

<CodeBlock title="manifest.xml">

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        ...
    </meta>
    <setup>
        <registrationUrl>https://my.example.com/registration</registrationUrl>
    </setup>
</manifest>
```

</CodeBlock>

The following query parameters will be sent with the request:

- `shop-id`: The unique identifier of the shop the app was installed |
- `shop-url`: The URL of the shop, this can later be used to access the Shopware API |
- `timestamp`: The Unix timestamp when the request was created |

Additionally, the request has the following headers:

- `shopware-app-signature`: The signature of the query string
- `sw-version`: The Shopware version of the shop _(since 6.4.1.0)_

An example request may look like this:

```
GET https://my.example.com/registration?shop-id=KIPf0Fz6BUkN&shop-url=http%3A%2F%2Fmy.shop.com&timestamp=159239728
shopware-app-signature: a8830aface4ac4a21be94844426e62c77078ca9a10f694737b75ca156b950a2d
sw-version: 6.4.5.0
```

Additionally, the `shopware-app-signature` header will be provided, which contains a cryptographic signature of the query string.  
The secret used to generate this signature is the `app secret`, that is unique per app and will be provided by the Shopware Account if you upload your app to the store. This secret won't leave the Shopware Account, so it won't be even leaked to the shops installing your app.

::: danger
You and the Shopware Account are the only parties that should know your `app-secret`, therefore make sure you never accidentally publish your `app-secret`.
:::

::: warning
For **local development** you can specify a `<secret>` in the manifest file, that is used for signing the registration request. However, if an app uses a hard-coded secret in the manifest it can not be uploaded to the store.

If you're developing a **private app** - which is not published in the Shopware Store - you **must** also provide the `<secret>` if you have an external app server.
:::

To verify that the registration can only be triggered by authenticated Shopware shops you need to recalculate the signature and check that the signatures match, thus you've verified that the sender of the request possesses the `app secret`.

The following code snippet can be used to recalculate the signature:

<Tabs>
<Tab title="PHP">

```php
use Psr\Http\Message\RequestInterface;

/** @var RequestInterface $request */
$queryString = $request->getUri()->getQuery();
$signature = hash_hmac('sha256', $queryString, $appSecret);
```

</Tab>
</Tabs>

### Registration Response

There may be valid cases where the app installation fails, because the domain is blocked, or some other prerequisite in that shop is not met, in which case you can return the message error as follows

```json
{
  "error": "The shop URL is invalid"
}
```

When the registration is successful.
To verify that you are also in possession of the `app secret` you need to provide a proof that is signed with the `app secret` too. The proof consist of the sha256 hmac of the concatenated `shopId`, `shopUrl` and your app's name.

Following code snippet can be used to calculate the proof:

<Tabs>
<Tab title="PHP">

```php
use Psr\Http\Message\RequestInterface;

/** @var RequestInterface $request */
$queryString = $request->getUri()->getQuery();
parse_str($queryString, $queryValues);
$proof = \hash_hmac(
    'sha256',
    $queryValues['shop-id'] . $queryValues['shop-url'] . $appname,
    $appSecret
);
```

</Tab>
</Tabs>

Besides the proof, your app needs to provide a randomly generated secret, that should be used to sign every further request from this shop. Make sure to save the `shopId`, `shopUrl` and generated secret, so you can associate and use this information later.

::: info
This secret will be called `shop-secret` to distinguish it from the `app-secret`. The `app-secret` is unique for your app and is used to sign the registration request of every shop that installs your app. The `shop-secret` will be provided by your app during the registration and should be unique for every shop
:::

The last thing needed in the registration response is a URL, to which the confirmation request will be sent.

A sample registration response may look like this:

```json
{
  "proof": "94b42d39280141de84bd6fc8e538946ccdd182e4558f1e690eabb94f924e7bc7",
  "secret": "random secret string",
  "confirmation_url": "https://my.example.com/registration/confirm"
}
```

### Confirmation Request

If the proof you provided in the [registration response](app-base-guide.md#registration-response) matched the one generated on the shop side the registration is completed. As a result your app will receive a POST request against the URL specified as the `confirmation_url` of the registration with the following parameters send in the request body:

- `apiKey`: The API key used to authenticate against the Shopware Admin API
- `secretKey`: The secret key used to authenticate against the Shopware Admin API
- `timestamp`: The Unix timestamp when the request was created
- `shopUrl`: The URL of the shop
- `shopId`: The unique identifier of the shop
- `shopSecret`: The secret for the shop generated by the app and used for signing requests

The payload of that request may look like this:

```json
{
  "apiKey": "SWIARXBSDJRWEMJONFK2OHBNWA",
  "secretKey": "Q1QyaUg3ZHpnZURPeDV3ZkpncXdSRzJpNjdBeWM1WWhWYWd0NE0",
  "timestamp": "1592398983",
  "shopUrl": "http://my.shop.com",
  "shopId": "sqX6cqHi6hbj",
  "shopSecret": "b49b082162c95b8afd322dffcc82b3550a64ad5b06a05813d431090d32a4b5f3"
}
```

Make sure that you save the API credentials for that `shopId`. You can use the `apiKey` and
the `secretKey` as `client_id` and `client_secret` respectively when you request an OAuth token
from the Admin API.

You can find out more about how to use these credentials in our Admin API authentication guide:

<!-- markdown-link-check-disable-next-line -->
<PageRef page="https://shopware.stoplight.io/docs/admin-api/ZG9jOjEwODA3NjQx-authentication-and-authorisation#integration-client-credentials-grant-type" title="Admin API Authentication & Authorisation" />

::: info
Starting from Shopware version 6.4.1.0, the current Shopware version will be sent as a `sw-version` header.
Starting from Shopware version 6.4.5.0, the current language id of the Shopware context will be sent as a `sw-context-language` header , and the locale of the user or locale of the context language is available under the `sw-user-language` header.
:::

The request is signed with the `shop-secret`, that your app provided in the [registration response](app-base-guide.md#registration-response) and the signature can be found in the `shopware-shop-signature` header.  
You need to recalculate that signature and check that it matches the provided one, to make sure that the request is really send from shop with that shopId.

You can use following code snippet to generate the signature:

<Tabs>
<Tab title="PHP">

```php
use Psr\Http\Message\RequestInterface;

/** @var RequestInterface $request */
$hmac = \hash_hmac('sha256', $request->getBody()->getContents(), $shopSecret);
```

</Tab>
</Tabs>

## Permissions

Shopware comes with the possibility to create fine grained [Access Control Lists](../plugins/administration/add-acl-rules) \(ACLs\). That means that that you need to request permissions if your app needs to read or write data over the API or wants to receive webhooks. The permissions your app needs are defined in the manifest file and are composed of the privilege \(`read`, `create`, `update`, `delete`\) and the entity.
Since version 6.4.12.0 your app can also request additional non-CRUD privileges with the `<permission>` element.

Sample permissions to read, create and update products, delete orders, as well as reading the cache configuration looks like this:

<CodeBlock title="manifest.xml">

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        ...
    </meta>
    <permissions>
        <read>product</read>
        <create>product</create>
        <update>product</update>

        <delete>order</delete>

        <!-- Since version 6.4.12.0 your app can request additional non-CRUD privileges-->
        <permission>system:cache:info</permission>
    </permissions>
</manifest>
```

</CodeBlock>

The permissions you request need to be accepted by the user during the installation of your app. After that these permissions are granted for your app and your API access through the credentials from the [confirmation request](app-base-guide.md#confirmation-request) of the [setup workflow](app-base-guide.md#setup) are limited to those permissions.

::: warning
Keep in mind that read permissions also extend to the data contained in the requests so that your app needs read permissions for the entities contained in the subscribed [webhooks](app-base-guide.md#webhooks).
:::

## Webhooks

With webhooks you are able to subscribe to events occurring in Shopware. Whenever such an event occurs a POST request will be send to the specified URL.

To use webhooks in your app, you need to implement a `<webhooks>` element in your manifest file, like this:

<CodeBlock title="manifest.xml">

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        ...
    </meta>
    <webhooks>
        <webhook name="product-changed" url="https://example.com/event/product-changed" event="product.written"/>
    </webhooks>
</manifest>
```

</CodeBlock>

This example illustrates you how to define a webhook with the name `product-changed` and the url `https://example.com/event/product-changed` which will be triggered if the event `product.written` is fired. So every time a product is changed, your custom logic will get executed. Further down you will find a list of the most important events you can hook into.

An event contains as much data as is needed to react to that event. The data is json contained in the request body. For example:

```json
{
  "data": {
    "payload": [
      {
        "entity": "product",
        "operation": "delete",
        "primaryKey": "7b04ebe416db4ebc93de4d791325e1d9",
        "updatedFields": []
      }
    ],
    "event": "product.written"
  },
  "source": {
    "url": "http://localhost:8000",
    "appVersion": "0.0.1",
    "shopId": "dgrH7nLU6tlE",
    "eventId": "7b04ebe416db4ebc93de4d791325e1d9"
  },
  "timestamp": 123123123
}
```

Where the `source` property contains all necessary information about the Shopware instance that send the request:

- `url` is the url under which your app can reach the Shopware instance and its api
- `appVersion` is the version of the app that is installed
- `shopId` is the id by which you can identify the Shopware instance
- `eventId` is a unique identifier of the event, this id will not change if sending of the webhook is retried, etc. **Since 6.4.11.0**.

The next property `data` contains the name of the event so that a single endpoint can handle several different events, should you desire. `data` also contains the event data in the `payload` property, due to the asynchronous nature of theses webhooks the `payload` for `entity.written` events does not contain complete entities as these might become outdated. Instead the entity in the payload is characterized by its id, stored under `primaryKey`, so that the app can fetch additional data through the shops API. This also has the advantage of giving the app explicit control over the associations that get fetched instead of relying on the associations determined by the event. Other events in contrast contain the entity data that defines the event, but keep in mind that event might not contain all associations.

The next property `timestamp` is the time which the webhook was handled. This can be used to prevent replay attacks, as an attacker cannot change the timestamp without making the signature invalid. If the timestamp is too old, your app should reject the request. This property is only available from 6.4.1.0 onwards

::: info
Starting from Shopware version 6.4.1.0, the current Shopware version will be sent as a `sw-version` header.
Starting from Shopware version 6.4.5.0, the current language id of the shopware context will be sent as a `sw-context-language` header , and the locale of the user or locale of the context language is available under the `sw-user-language` header.
:::

You can verify the authenticity of the incoming request by checking the `shopware-shop-signature` every request should have a sha256 hmac of the request body, that is signed with the secret your app assigned the shop during the [registration](app-base-guide.md#setup). The mechanism to verify the request is exactly the same as the one used for the [confirmation request](app-base-guide.md#confirmation-request).

You can use a variety of events to react to changes in Shopware that way. See that table [Webhook-Events-Reference](../../../resources/references/app-reference/webhook-events-reference) for an overview.

### App Notification

Starting from Shopware version 6.4.7.0, if you want to send notifications to the admin, to inform the user about some actions that happened on the app side, the app should send a POST request to the `api/notification` endpoint with a valid body and the header `Authorization` token.
Your app can request 10 times before being delayed by the system.

After 10 attempts you need to wait 10 seconds before trying to make requests again.
After 15 attempts it's 30 seconds.
After 20 attempts it's 60 seconds.
After 24 hours without a failed request the limit is reset.

Examples request body:
You need to pass the `status` property, the content of the notification as `message` property and you can restrict users who can read the notification by passing `requiredPrivileges` property and `adminOnly` property inside the payload.
When `adminOnly` is true, only admins can read this notification. If you don't send the `adminOnly` or `adminOnly` is false, you can pass the `requiredPrivileges` property so that users with specific permissions can read the notification. Otherwise, it will be displayed to every user.

```json
// POST /api/notification

{
  "status": "success",
  "message": "This is a successful message",
  "adminOnly": "true",
  "requiredPrivileges": []
}
```

- `status`: Notification status, one of `success`, `error`, `info`, `warning`
- `message`: The content of the notification
- `adminOnly`: Only admins can read this notification if this value is true
- `requiredPrivileges`: The required privileges that users need to have to read the notification

Keep in mind that your app needs the `notification:create` permission to access this api.

### **App lifecycle events**

Apps can also register to lifecycle events of its own lifecycle, namely its installation, updates and deletion. For example they maybe used to delete user relevant data from your data stores once somebody removes your app from their shop.

| Event             | Description                              |
| :---------------- | :--------------------------------------- |
| `app.installed`   | Triggers once the app is installed       |
| `app.updated`     | Triggers if the app is updated           |
| `app.deleted`     | Triggers once the app is removed         |
| `app.activated`   | Triggers if an inactive app is activated |
| `app.deactivated` | Triggers if an active app is deactivated |

Example request body:

```json
{
  "data": {
    "payload": [],
    "event": "app_deleted"
  },
  "source": {
    "url": "http://localhost:8000",
    "appVersion": "0.0.1",
    "shopId": "wPNrYZgArBTL"
  }
}
```

#### App lifecycle events for app scripts

Since Shopware 6.4.9.0 it is also possible to create [app scripts](./app-scripts/), that are executed during the lifecycle of your app.
You get access to the Database and can change or create some data e.g. when your app is activated, without the need of an external server.

For a full list of the available hook points and the available services refer to the [reference documentation](../../../resources/references/app-reference/script-reference/script-hooks-reference.md#app-lifecycle).

## Validation

You can run the `app:validate` command to validate the configuration of your app. It will check for common errors, like:

- non-matching app names
- missing translations
- unknown events registered as webhooks
- missing permissions for webhooks
- errors in the config.xml file, if it exists

To validate all apps in your `custom/apps` folder run:

```sh
bin/console app:validate
```

Additionally, you can specify which app should be validated by providing the app name as an argument;

```sh
bin/console app:validate MyExampleApp
```

## Handling the migration of shops

In the real world it may happen that shops are migrated to new servers and are available under a new URL. In the same regard it is possible that a running production shop is duplicated and treated as a staging environment.
These cases are challenging for app developers.
In the first case you may have to make a request against the shop, but the URL you saved during the registration process may not be valid anymore and the shop cannot be reached over this URL.
In the second case you may receive webhooks from both shops (prod & staging), that look like they came from the same shop (as the whole database was duplicated), thus it may corrupt the data associated with the original production shop.
The main reason that this is problematic is that two Shopware installations in two different locations (on two different URLs) are associated to the same shopId, because the whole database was replicated.

That's why we implemented a safe-guard mechanism that detects such situations, stops the communication to the apps to prevent data corruption and then ultimately let's the user decide how to solve the situation.
**Notice: This mechanism relies on the fact that the `APP_URL` environment variable will be set to the correct URL to the shop. Especially it is assumed that the environment variable will be changed, when a shop is migrated to a new domain, or a staging shop is created as a duplicate of a production shop.**

Keep in mind that this is only relevant for apps that have their own backends and where communication between app backends and shopware is necessary. That's why simple themes are not affected by shop migrations, they will continue to work.

### Detecting APP_URL changes

Everytime a request should be made against an app backend, Shopware will check whether the current APP_URL differs from the one used when Shopware generated an ID for this shop.
If the APP_URL differs Shopware will stop sending any requests to the installed apps to prevent data corruption on the side of the apps.
Now the user has the possibility to resolve the solution, by using one of the following strategies.
The user can either run a strategy with the `bin/console app:url-change:resolve` command, or with a modal that pops up when the administration is opened.

### APP_URL change resolver

- **MoveShopPermanently**: This strategy should be used if the live production shop is migrated from one URL to another one.
  This strategy will ultimately notify all apps about the change of the APP_URL and the apps continue working like before, including all the data the apps may already have associated with the given shop. It is important to notice that in this case the apps in the old installation on the old URL (if it is still running) will stop working!
  Technically this is achieved by rerunning the registration process again for all apps. During the registration the same shopId is used like before, but now with a different shop-url and a different key pair used to communicate over the Shopware API. Also you **must** generate a new communication secret during this registration process, that is subsequently used for the communication between Shopware and the app backend.
  This way it is ensured that the apps are notified about the new URL and the integration with the old installation stops working (because a new communication secret is associated with the given shop id, that the old installation does not know).

- **ReinstallApps**: This strategy makes sense to use in the case of the staging shop.
  By running this strategy all installed apps will be reinstalled, this means that this installation will get a new shopId, that is used during registration.
  Because the new installation will get a new shopId, the installed apps will continue working on the old installation as before, but as a consequence the data on the apps side that was associated with the old shopId can not be accessed on the new installation.

- **UninstallApps**: This strategy will simply uninstall all apps on the new installation, thus keeping the old installation working like before.

## API Docs

<!-- markdown-link-check-disable-next-line -->
<!-- {% api-method method="get" host="https://my.example.com" path="" %}
{% api-method-summary %}
registration
{% endapi-method-summary %}

{% api-method-description %}

{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="shopware-app-signature" type="string" required=true %}
The hmac-signature of the query string, signed with the app secret
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="timestamp" type="integer" required=true %}
The current Unix timestamp when the request was created
{% endapi-method-parameter %}

{% api-method-parameter name="shop-url" type="string" required=true %}
The URL of the shop, where the app was installed, can be used to access to the Shopware API
{% endapi-method-parameter %}

{% api-method-parameter name="shop-id" type="string" required=true %}
The unique identifier of the shop, where the app was installed
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```json
{
  "error": "The shop URL is invalid"
}
```

```json
{
  "proof": "94b42d39280141de84bd6fc8e538946ccdd182e4558f1e690eabb94f924e7bc7",
  "secret": "random secret string",
  "confirmation_url": "https://my.example.com/registration/confirm"
}
```

{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %} -->

<!-- markdown-link-check-disable-next-line -->
<!-- {% api-method method="post" host="https://my.example.com" path="" %}
{% api-method-summary %}
confirmation
{% endapi-method-summary %}

{% api-method-description %}

{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="shopware-shop-signature" type="string" required=true %}
The hmac-signature of the body content, signed with the shop secret returned from the registration request
{% endapi-method-parameter %}

{% api-method-parameter name="sw-version" type="string" required=true %}
Starting from Shopware version 6.4.1.0, the current Shopware version will be sent as a `sw-version` header.
Starting from Shopware version 6.4.5.0, the current language id of the Shopware context will be sent as a  `sw-context-language` header , and the locale of the user or locale of the context language is available under the `sw-user-language` header.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-body-parameters %}
{% api-method-parameter name="shopId" type="string" required=true %}
The unique identifier of the shop
{% endapi-method-parameter %}

{% api-method-parameter name="shopUrl" type="string" required=true %}
The URL of the shop
{% endapi-method-parameter %}

{% api-method-parameter name="timestamp" type="integer" required=true %}
The current Unix timestamp when the request was created
{% endapi-method-parameter %}

{% api-method-parameter name="secretKey" type="string" required=true %}
SecretKey used to authenticate against the Shopware API
{% endapi-method-parameter %}

{% api-method-parameter name="apiKey" type="string" required=true %}
ApiKey used to authenticate against the Shopware API
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```text

```

{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %} -->
