# App Base Guide

## Overview

This guide will walk you through the process of adding your own app to Shopware and configuring it, so it is able to communicate to your external backend server. 

## Prerequisites

If your're not familiar with the app system, please take a look at the concept first.

{% page-ref page="./../../../concepts/extensions/apps-concept.md" %}

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

{% code title="manifest.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <name>MyExampleApp</name>
        <label>Label</label>
        <label lang="de-DE">Name</label>
        <description>A description</description>
        <description lang="de-DE">Eine Beschreibung</description>
        <author>Your Company Ltd.</author>
        <copyright>(c) by Your Company Ltd.</copyright>
        <version>1.0.0</version>
        <license>MIT</license>
    </meta>
</manifest>
```
{% endcode %}

{% hint style="warning" %}
The name of your app, that you provide in the manifest file, needs to match the folder name of your app.
{% endhint %}

The app can now be installed by running the following command:

```bash
bin/console app:install --activate MyExampleApp
```

By default, your app files will be [validated](./app-base-guide.md#Validation) before installation, to skip the validation you may use the `--no-validate` flag.

{% hint style="info" %}
Apps get installed as inactive. You can activate them by passing the `--activate` flag to the `app:install` command or by executing the `app:activate` command after installation.
{% endhint %}

For a complete reference of the structure of the manifest file take a look at the [Manifest reference](../../../resources/references/app-reference/manifest-reference.md).

## Setup

If your app backend server and Shopware need to communicate, it is necessary that a registration is performed during the installation of your app. This process is called setup.  
During the setup it is verified, that Shopware connects to the right backend server and keys are exchanged to secure all further communications. During the setup process your app backend will obtain credentials that can be used to authenticate against the Shopware API. Additionally your app will provide a secret that Shopware will use to sign all further requests it makes to your app backend, allowing you to verify that the incoming requests originate from authenticated Shopware installations.

The setup workflow is shown in the following schema, each step will be explained in detail.

![Setup request workflow](../../../.gitbook/assets/shop-app-communication-1-.svg)

### Registration Request

The registration request is made as a GET-Request against a URL that you provide in the manifest file of your app.

{% code title="manifest.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        ...
    </meta>
    <setup>
        <registrationUrl>https://my.example.com/registration</registrationUrl>
    </setup>
</manifest>
```
{% endcode %}

The following query parameters will be send with the request:

* shop-id: The unique identifier of the shop, where the app was installed
* shop-url: The URL of the shop, this can later be used to access the Shopware API
* timestamp: The Unix timestamp when the request was created

An example request may look like this: 

```text
GET https://my.example.com/registration?shop-id=KIPf0Fz6BUkN&shop-url=http%3A%2F%2Fmy.shop.com&timestamp=159239728
```

Additionally, the `shopware-app-signature` header will be provided, which contains a cryptographic signature of the query string.  
The secret used to generate this signature is the `app secret`, that is unique per app and will be provided by the Shopware Account if you upload your app to the store. This secret won't leave the Shopware Account, so it won't be even leaked to the shops installing your app.

{% hint style="danger" %}
You and the Shopware Account are the only parties that should know your `app-secret`, therefore make sure you never accidentally publish your `app-secret`.
{% endhint %}

{% hint style="warning" %}
For local development you can specify a &lt;secret&gt; in the manifest file, that is used for signing the registration request. However if a app uses a hard-coded secret in the manifest it can not be uploaded to the store.
{% endhint %}

To verify that the registration can only be triggered by authenticated Shopware shops you need to recalculate the signature and check that the signatures match, thus you've verified that the sender of the request possesses the `app secret`.

Following code snippet can be used to recalculate the signature:

{% tabs %}
{% tab title="PHP" %}
```php
use Psr\Http\Message\RequestInterface;

/** @var RequestInterface $request */
$queryString = $request->getUri()->getQuery();
$signature = hash_hmac('sha256', $queryString, $appSecret);
```
{% endtab %}
{% endtabs %}

### Registration Response

There may be valid cases where the app installation fails, because the domain is blocked, or some other prerequisite in that shop is not met, in which case you can return the message error as follows
```javascript
{
  "error": "The shop URL is invalid"
}
```

When the registration is successful.
To verify that you are also in possession of the `app secret` you need to provide a proof that is signed with the `app secret` too. The proof consist of the sha256 hmac of the concatenated `shopId`, `shopUrl` and your app's name.

Following code snippet can be used to calculate the proof:

{% tabs %}
{% tab title="PHP" %}
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
{% endtab %}
{% endtabs %}

Besides the proof your app needs to provide a randomly generated secret, that should be used to sign every further request from this shop. Make sure to save the shopId, shopUrl and generated secret, so you can associate and use this information later.

{% hint style="info" %}
This secret will be called `shop-secret` to distinguish it from the `app-secret`. The `app-secret` is unique for your app and is used to sign the registration request of every shop that installs your app. The `shop-secret` will be provided by your app during the registration and should be unique for every shop
{% endhint %}

The last thing needed in the registration response is a URL, which the confirmation request will be send to.

A sample registration response may look like this:

```javascript
{
  "proof": "94b42d39280141de84bd6fc8e538946ccdd182e4558f1e690eabb94f924e7bc7",
  "secret": "random secret string",
  "confirmation_url": "https://my.example.com/registration/confirm"
}
```

### Confirmation Request

If the proof you provided in the [registration response](./app-base-guide.md#registration-response) matched the one generated on the shop side the registration is completed. As a result your app will receive a POST request against the URL specified as the `confirmation_url` of the registration with the following parameters send in the request body:

* `apiKey`: The ApiKey used to authenticate against the Shopware API
* `secretKey`: The SecretKey used to authenticate against the Shopware API
* `timestamp`: The Unix timestamp when the request was created
* `shopUrl`: The URL of the shop
* `shopId`: The unique identifier of the shop

The payload of that request may look like this:

```javascript
{
  "apiKey":"SWIARXBSDJRWEMJONFK2OHBNWA",
  "secretKey":"Q1QyaUg3ZHpnZURPeDV3ZkpncXdSRzJpNjdBeWM1WWhWYWd0NE0",
  "timestamp":"1592398983",
  "shopUrl":"http:\/\/my.shop.com",
  "shopId":"sqX6cqHi6hbj"
}
```

Make sure that you save the api-credentials for that shopId.

The request is signed with the `shop-secret`, that your app provided in the [registration response](./app-base-guide.md#registration-response) and the signature can be found in the `shopware-shop-signature` header.  
You need to recalculate that signature and check that it matches the provided one, to make sure that the request is really send from shop with that shopId.

You can use following code snippet to generate the signature:

{% tabs %}
{% tab title="PHP" %}
```php
use Psr\Http\Message\RequestInterface;

/** @var RequestInterface $request */
$hmac = \hash_hmac('sha256', $request->getBody()->getContents(), $shopSecret);
```
{% endtab %}
{% endtabs %}

## Permissions

Shopware comes with the possibility to create fine grained [Access Control Lists](../plugins/administration/add-acl-rules.md) (ACLs). That means that that you need to request permissions if your app needs to read or write data over the API or wants to receive webhooks.
The permissions your app needs are defined in the manifest file and are composed of the privilege (`read`, `create`, `update`, `delete`) and the entity.

Sample permissions to read, create and update products, as well as delete orders look like this:

{% code title="manifest.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        ...
    </meta>
    <permissions>
        <read>product</read>
        <create>product</create>
        <update>product</update>

        <delete>order</delete>
    </permissions>
</manifest>
```
{% endcode %}

The permissions you request need to be accepted by the user during the installation of your app. After that these permissions are granted for your app and your API access through the credentials from the [confirmation request](./app-base-guide.md#confirmation-request) of the [setup workflow](./app-base-guide.md#setup) are limited to those permissions.

{% hint style="warning" %}
Keep in mind that read permissions also extend to the data contained in the requests so that your app needs read permissions for the entities contained in the subscribed [webhooks](./app-base-guide.md#webhooks).
{% endhint %}

## Webhooks

With webhooks you are able to subscribe to events occurring in Shopware. Whenever such an event occurs a POST request will be send to the specified URL.

To use webhooks in your app, you need to implement a `<webhooks>` element in your manifest file, like this:

{% code title="manifest.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        ...
    </meta>
    <webhooks>
        <webhook name="product-changed" url="https://example.com/event/product-changed" event="product.written"/>
    </webhooks>
</manifest>
```
{% endcode %}

This example illustrates you how to define a webhook with the name `product-changed` and the url `https://example.com/event/product-changed` which will be triggered if the event `product.written` is fired. So every time a product is changed, your custom logic will get executed. Further down you will find a list of the most important events you can hook into.

An event contains as much data as is needed to react to that event. The data is json contained in the request body. For example:

```javascript
{
  "data":{
    "payload":[
      {
        "entity":"product",
        "operation":"delete",
        "primaryKey":"7b04ebe416db4ebc93de4d791325e1d9",
        "updatedFields":[
        ]
      }
    ],
    "event":"product.written"
  },
  "source":{
    "url":"http:\/\/localhost:8000",
    "appVersion":"0.0.1",
    "shopId":"dgrH7nLU6tlE"
  }
}
```

Where the `source` property contains all necessary information about the Shopware instance that send the request:

* `url` is the url under which your app can reach the Shopware instance and its api
* `appVersion` is the version of the app that is installed
* `shopId` is the id by which you can identify the Shopware instance

The next property `data` contains the name of the event so that a single endpoint can handle several different events, should you desire. `data` also contains the event data in the `payload` property, due to the asynchronous nature of theses webhooks the `payload` for `entity.written` events does not contain complete entities as these might become outdated. Instead the entity in the payload is characterized by its id, stored under `primaryKey`, so that the app can fetch additional data through the shops API. This also has the advantage of giving the app explicit control over the associations that get fetched instead of relying on the associations determined by the event. Other events in contrast contain the entity data that defines the event, but keep in mind that event might not contain all associations.

You can verify the authenticity of the incoming request by checking the `shopware-shop-signature` every request should have a sha256 hmac of the request body, that is signed with the secret your app assigned the shop during the [registration](./app-base-guide.md#setup). The mechanism to verify the request is exactly the same as the one used for the [confirmation request](./app-base-guide.md#confirmation-request).

You can use a variety of events to react to changes in Shopware that way. See the table below for an overview of most important ones.

| Event | Description | Permissions needed |
| :--- | :--- | :--- |
| `contact_form.send` | Triggers if a contact form is send | - |
| `mail.sent` | Triggers if a mail is send from Shopware | - |
| `mail.before.send` | Triggers before a mail is send | - |
| `checkout.order.placed` | Triggers if an order is placed checkout-wise | `order:read` |
| `checkout.customer.register` | Triggers if a new customer was registered yo | `customer:read` |
| `checkout.customer.login` | Triggers as soon as a customer logs in | `customer:read` |
| `checkout.customer.double_opt_in_guest_order` | Triggers as soon as double opt-in is accepted in a guest order | `customer:read` |
| `checkout.customer.before.login` | Triggers as soon as a customer logs in within the checkout process | `customer:read` |
| `checkout.customer.changed-payment-method` | Triggers if a customer changes his payment method in checkout process | `customer:read` |
| `checkout.customer.logout` | Triggers if a customer logs out | `customer:read` |
| `checkout.customer.double_opt_in_registration` | Triggers if a customer commits to his registration via double opt in | `customer:read` |
| `customer.recovery.request` | Triggers if a customer recovers his password | `customer_recovery:read` |
| `product.written` | Triggers if a product is written | `product:read` |
| `product_price.written` | Triggers if product price is written | `product_price:read` |
| `category.written` | Triggers if a category is written | `category:read` |

### **App lifecycle events**

Apps can also register to lifecycle events of its own lifecycle, namely its installation, updates and deletion. For example they maybe used to delete user relevant data from your data stores once somebody removes your app from their shop.

| Event | Description |
| :--- | :--- |
| `app.installed` | Triggers once the app is installed |
| `app.updated` | Triggers if the app is updated |
| `app.deleted` | Triggers once the app is removed |
| `app.activated` | Triggers if an inactive app is activated |
| `app.deactivated` | Triggers if an active app is deactivated |

Example request body:

```javascript
{
  "data":{
    "payload":[

    ],
    "event":"app_deleted"
  },
  "source":{
    "url":"http:\/\/localhost:8000",
    "appVersion":"0.0.1",
    "shopId":"wPNrYZgArBTL"
  }
}
```

## Validation

You can run the `app:validate` command to validate the configuration of your app. It will check for common errors, like:

* non-matching app names
* missing translations
* unknown events registered as webhooks
* missing permissions for webhooks
* errors in the config.xml file, if it exists

To validate all apps in your `custom/apps` folder run:

```bash
bin/console app:validate
```

Additionally, you can specify which app should be validated by providing the app name as an argument;

```bash
bin/console app:validate MyExampleApp
```

## API Docs

<!-- markdown-link-check-disable-next-line -->
{% api-method method="get" host="https://my.example.com" path="" %}
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

```text
{
  "error": "The shop URL is invalid"
}
```

```text
{
  "proof": "94b42d39280141de84bd6fc8e538946ccdd182e4558f1e690eabb94f924e7bc7",
  "secret": "random secret string",
  "confirmation_url": "https://my.example.com/registration/confirm"
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

<!-- markdown-link-check-disable-next-line -->
{% api-method method="post" host="https://my.example.com" path="" %}
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
{% endapi-method %}

