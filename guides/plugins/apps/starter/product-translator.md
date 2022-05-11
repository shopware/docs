# App-Starter - Read and Write Data

This guide will show you how to set up an app-server with our [App-Template](https://github.com/shopware/AppTemplate).
You will learn to read and write data to the shopware admin API.

## Prerequisites

 * Basic CLI usage (creating files, directories, running commands)
 * Installed [shopware-cli](https://sw-cli.fos.gg/) tools
 * Installed [symfony-cli](https://symfony.com/download)
 * A running maria or mysql accessible to your development machine

## Setting up the App-Template

First, you need to clone the App-Template from GitHub into the directory that will contain the app-server.

``` bash
git clone git@github.com:shopware/AppTemplate.git TranslatorApp
```

Next, you set your own git repo as a git remote:

``` bash
git remote set-URL origin <myrepo.git>
```

The App-Template contains a basic Symfony application to get started with app development.
Call `composer install` to fetch all required dependencies.

Modify the `APP_NAME` in the env to your app name`./.env` to ensure a shop can install the app later.
Also configure the `DATABASE_URL` to point to your database, and choose an `APP_SECRET`:

{% code title=".env" %}
```
###> symfony/framework-bundle ###
APP_NAME=product-translator
APP_ENV=dev
APP_SECRET=01f17b06402f0a24e6d2b084a6d18a87
APP_DEBUG=true
###< symfony/framework-bundle ###

###> doctrine/doctrine-bundle ###
# Format described at https://www.doctrine-project.org/projects/doctrine-dbal/en/latest/reference/configuration.html#connecting-using-a-url
# IMPORTANT: You MUST configure your server version, either here or in config/packages/doctrine.yaml
#
DATABASE_URL=mysql://root:root@127.0.0.1:3306/product_translator?serverVersion=8.0
###< doctrine/doctrine-bundle ##
```
{% endcode %}

You can now start the application with `Symfony server:start -v`.
Your app-server is currently available only locally.
If you develop with a local instance of shopware, you can skip to the next chapter.

If you're developing with a cloud shop, your app-server needs to be reachable from
the internet. To achieve that, we recommend using a tunneling service such as [cloudflare tunnel](https://www.cloudflare.com/products/tunnel/)
or [ngrok](https://ngrok.com/).

## Creating the manifest

The `manifest.xml` is the main interface definition between shops and your app-server.
As such, it contains all the required information about your app.
So let's start by filling in all the meta information:


{% code title="release/manifest.xml" %}
``` xml
<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <name>product-translator</name>
        <label>Product translator</label>
        <description>App to translate product descriptions</description>
        <author>shopware AG</author>
        <copyright>(c) by shopware AG</copyright>
        <version>0.1.0</version>
        <license>MIT</license>
    </meta>
   </manifest>
```
{% endcode %}

{% hint style="info" %}
Take care to use the same `<name>` as in the `.env` file; otherwise, shops can't install the app!
{% endhint %}

Next up, we will define the manifest's `<setup>` part. This part describes how the shop will connect itself with the app-server.

{% code title="release/manifest.xml" %}
``` xml
<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
    ...
    </meta>
    <setup>
	<registrationUrl>https://6472-2a02-908-3225-1a00-71b6-e1fe-77b1-ee8.ngrok.io/register</registrationUrl>
	<secret>01f17b06402f0a24e6d2b084a6d18a87</secret>
    </setup>
   </manifest>
```
{% endcode %}

The `<registraionUrl>` is already implemented by the App-Template, and is always `/register` unless you modify `src/Controller/RegistrationController.php`.
The `<secret>` element is only present in development versions of the app. In production, the extension store will provide the secret to authenticate your app buyers.

Because this app will need to read product descriptions and translate them the it needs permissions to do so:

{% code title="release/manifest.xml" %}
``` xml
<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
    ...
    </meta>
    <setup>
    ...
    </setup>
    <permissions>
	<read>product</read>
        <read>product_translation</read>
        <read>language</read>
        <update>product_translation</update>
        <create>product_translation</create>
    </permissions>
   </manifest>
```
{% endcode %}

Finally, your app needs to be notified every time a product description is modified.
The app system provides webhooks to subscribe your app-server to any changes in the data
in its shops:

{% code title="release/manifest.xml" %}
``` xml
<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
    ...
    </meta>
    <setup>
    ...
    </setup>
    <permissions>
    ...
    </permissions>
    <webhooks>
        <webhook name="deleted" url="https://6472-2a02-908-3225-1a00-71b6-e1fe-77b1-ee8.ngrok.io/registration/remove" event="app.deleted"></webhook>
        <webhook name="product-update" url="https://6472-2a02-908-3225-1a00-71b6-e1fe-77b1-ee8.ngrok.io/product/written" event="product.written"></webhook>
    </webhooks>
   </manifest>
```
{% endcode %}

These two webhooks provide a way for shops to notify your app-server about events that occurred.
The `src/Controller/RegistrationController.php`  controller in the App-Template already provides the `deleted` webhook. It notifies the server that a shop has deleted the app.

The `product-update` webhook is the path your app-server will be notified of changes to any product in the shops, like changing the description.
This webhook needs a custom controller, which will be the next part of this guide.

## Implementing the translation

To get started write a lets write a simple symfony controller:


{% code title="src/Controller/ProductController.php" %}
``` php
class ProductController extends AbstractController
{
    public function __construct(
        private ShopRepository $shopRepository,
	private RequestVerfier $verifier
    )
    {
    }
}
```
{% endcode %}

For later use, it's already injected with the `ShopRepository` and the `RequestVerifier`; They will become useful soon.

Next implement a route for the `product-update` webhook:

{% code title="src/Controller/ProductController.php" %}
``` php
class ProductController extends AbstractController
{
    //...
    #[Webhook('productWritten', 'product.written', path: 'product/written')]
    public function productWritten(Request $request)
    {
    }
}
```
{% endcode %}

Next, we will verify the request:
For that, we need to fetch the shop data from the database.
The shopRepository provides the getShopFromId method for that.
The source part of the request contains the shopId.
With that id, the shop is retrieved from the repository.
The verifier then validates the request with the shop object.
A failed validation raises an exception, thus stopping unauthorized requests from going through.
{% code title="src/Controller/ProductController.php" %}
``` php
    public function productWritten(Request $request)
    {
	$event = json_decode($request->getContent(), true);
        $shop = $this->shopRepository->getShopFromId($event['source']['shopId']);

        $this->verifier->authenticatePostRequest($request, $shop);
    }
```
{% endcode %}



Once the request has been verified you can use the `$shop` to create a api-client for that particular shop.
{% code title="src/Controller/ProductController.php" %}
``` php
    public function productWritten(Request $request)
    {
        //...
	$client = new ShopClient(new Client([
            'base_uri' => $shop->getUrl(),
	    'headers' => [
	        'accept' => 'application/json',
		'content-type' => 'application/json'
            ]
        ]),
	    $shop
        );
    }
```
{% endcode %}

The `ShopClient` receives a standard guzzle client, and the `$shop` we got from the database.
By setting the `base_uri` of the guzzle client to the shop-URL, we have an easier time using the client further down the line.

Now we can inspect the event payload if it's of any relevance:

{% code title="src/Controller/ProductController.php" %}
``` php
    public function productWritten(Request $request)
    {
        //...
        $updatedFields = $event['data']['payload'][0]['updatedFields'];

        if (!in_array('description', $updatedFields)) {
            return new Response('', Response::HTTP_NO_CONTENT);
        }
```
{% endcode %}

All `$entity.written` events contain a list of fields that a write event has changed.
The code above uses this information to determine if the description of a product was changed.
If the change did not affect the description, the controller returns a 204 response because there is nothing else to do for this event.

Now that it's certain the description of the product was changed, we fetch the description through the API of the shop:

{% code title="src/Controller/ProductController.php" %}
``` php
    public function productWritten(Request $request)
    {
        //...
        $resp = $client->sendRequest(
            new \GuzzleHttp\Psr7\Request(
                'POST',
                'api/search/product',
                body: json_encode([
                    'ids' => [$id],
                    'associations' => [
                        'translations' => [
                            'associations' => [
                                'language' => [
                                    'associations' => [
                                        'locale' => []
                                    ]
                                ],
                            ]
                        ],
                    ]
                ])
            )
        );
```
{% endcode %}

The request contains a criteria that fetches a the product for which we received the event `'ids' => [$id]` and all translations and their associated languages `'associations' => 'language'`. Now we can retrieve the englisch description from the api response:


{% code title="src/Controller/ProductController.php" %}
``` php
    public function productWritten(Request $request)
    {
        //...
	$product = json_decode($resp->getBody(), true)['data'][0];
        $description = '';
        $name = '';
        foreach ($product['translations'] as $translation) {
            if ($translation['language']['locale']['code'] === 'en-GB') {
                $description = $translation['description'];
                $name = $translation['name'];
            }
        }
    ```
{% endcode %}

Because our goal is to write a french translation of the product, the app needs to take care to avoid endless loops.
To determine if the app has already written a translation once, it saves a hash of the original description.
We will get to the generation of the hash later but we need to check it first:

{% code title="src/Controller/ProductController.php" %}
``` php
    public function productWritten(Request $request)
    {
        //...
	$lastHash = $product['customFields']['translator-last-translation-hash'] ?? '';
        if (md5($description) === $lastHash) {
            return new Response('', Response::HTTP_NO_CONTENT);
        }
    ```
{% endcode %}

Now that the app can be sure the description has not been translated before, it can write the new description like so:

{% code title="src/Controller/ProductController.php" %}
``` php
    public function productWritten(Request $request)
    {
        //...
	$client->sendRequest(
            new \GuzzleHttp\Psr7\Request(
                'PATCH',
                'api/product/' . $id,
                body: json_encode([
                    'translations' => [
                        'fr-FR' => [
                            'name' => $name,
                            'description' => $this->translate($description)
                        ],
                    ],
                    'customFields' => [
                        'translator-last-translation-hash' => md5($description)
                    ]
                ])
            )
        );
    ```
{% endcode %}

Note the hash of the original description gets saved as a value in the 
custom fields of the product entity. This is possible without any further config since all custom fields are schema-less.

## Install the App

In this last step, we will install the app using the Shopware CLI tools.

{% hint style="info" %}
If this is your first time using the Shopware CLI, you have to [install](https://sw-cli.fos.gg/install/) it first. Next, configure it using the `shopware-cli project config init` command.
{% endhint %}

```bash
shopware-cli project extension upload ProductTranslator/release --activate --increase-version
```

This command will create a zip file from the specified extension directory and upload it to your configured store.
The `--increase-version` parameter increases the version specified in the `manifest.xml` file. This flag is required, so Shopware picks up changes made to the `manifest.xml` since the last installation.
Once successfully installed, you will see the app in the extension manager.
And when you save a product, the description will automatically update.

## Where to continue

In this example, you've learned how to receive events and modify data through the app system. But that is just the tip of the iceberg:

 * Did you know you can add [new payments](../payment) as apps?
 * Write code that runs during checkout [app scripting](../app-scripts/cart-manipulation)
 * Add new endpoints to both store and admin API [custom endpoints](../app-scripts/custom-endpoints)

