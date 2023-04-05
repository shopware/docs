# App-Starter - Read and Write Data

This guide will show you how to set up an app server with our [app template](https://github.com/shopware/AppTemplate).
You will learn how to read and write data to the Shopware Admin API using an example of fetching dynamic translations for products when they are updated.

## Prerequisites

* Basic CLI usage (creating files, directories, running commands)
* Installed [shopware-cli](https://sw-cli.fos.gg/) tools
* Installed [symfony-cli](https://symfony.com/download)
* A running MariaDB or MySQL accessible to your development machine

## Setting up the app template

First, you need to clone the app template from GitHub into the directory that will contain the app server.

```sh
git clone git@github.com:shopware/AppTemplate.git translator-app
```

Next, you set your own git repo as a git remote:

```sh
git remote set-url origin <myrepo.git>
```

The app template contains a basic Symfony application to get started with app development.
Call `composer install` to fetch all required dependencies.

Modify the `APP_NAME` in the env to your app name`./.env` to ensure the app can be installed in a store later.
Also, configure the `DATABASE_URL` to point to your database, and choose an `APP_SECRET`:

```sh
// .env
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

You can now start the application with `symfony server:start -v`.

For now, your app server is currently only available locally.

::: info
When you are using a local Shopware environment, you can skip to the [next chapter](#creating-the-manifest)
:::

We need to expose your local app server to the internet. The easiest way to achieve that is using a tunneling service like [ngrok](https://ngrok.com/).

The setup is as simple as calling the following command (after installing ngrok)

```sh
ngrok http 8000
```

This will expose your Symfony server on a public URL, so the cloud store can communicate with your app.

## Creating the manifest

The `manifest.xml` is the main interface definition between stores and your app server.
It contains all the required information about your app.
Let's start by filling in all the meta information:

```xml
// release/manifest.xml
<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
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

::: warning
Take care to use the same `<name>` as in the `.env` file. Otherwise, stores can't install the app.
:::

### Setup hook

Next, we will define the `<setup>` part of the manifest. This part describes how the store will connect itself with the app server.

```xml
// release/manifest.xml
<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
    <!-- ... -->
    </meta>
    <setup>
        <registrationUrl>http://127.0.0.1:8000/register</registrationUrl>
        <secret>01f17b06402f0a24e6d2b084a6d18a87</secret>
    </setup>
</manifest>
```

The `<registraionUrl>` is already implemented by the app template and is always `/register`, unless you modify `src/Controller/RegistrationController.php`.
The `<secret>` element is only present in development versions of the app. In production, the extension store will provide the secret to authenticate your app buyers.

### Permissions

Permissions are needed as this app will need to read product descriptions and translate them:

```xml
// release/manifest.xml
<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
    <!-- ... -->
    </meta>
    <setup>
    <!-- ... -->
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

### Webhooks

Finally, your app needs to be notified every time a product description is modified.
The app system provides webhooks to subscribe your app server to any changes in the data
in its shops:

```xml
// release/manifest.xml
<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
    <!-- ... -->
    </meta>
    <setup>
    <!-- ... -->
    </setup>
    <permissions>
    <!-- ... -->
    </permissions>
    <webhooks>
        <webhook name="deleted" url="http://127.0.0.1:8000/registration/remove" event="app.deleted"></webhook>
        <webhook name="product-update" url="http://127.0.0.1:8000/product/written" event="product.written"></webhook>
    </webhooks>
</manifest>
```

::: info
The timeout for the requests against the app server is 5 seconds.
:::

These two webhooks provide a way for shops to notify your app server about events that occurred.
The `src/Controller/RegistrationController.php` controller in the app template already provides the `deleted` webhook. It notifies the server that a shop has deleted the app.

The `product-update` webhook is the path on which your app server will be notified about any product updates in the stores, like changing the description.

This webhook needs a custom controller, which will be the next part of this guide.

## Handling shop events

To get started, let's write a simple Symfony controller:

```php
// src/Controller/ProductController.php
class ProductController extends AbstractController
{
    public function __construct(private ShopRepository $shopRepository )
    {
    }
}
```

For later use, it is already injected with the `ShopRepository` and the `RequestVerifier`; They will become useful soon.

Next, implement a route for the aforementioned `product-update` webhook:

```php
// src/Controller/ProductController.php
class ProductController extends AbstractController
{
    /* ... missing constructor */

    #[Webhook('productWritten', 'product.written', path: 'product/written')]
    public function productWritten(Request $request)
    {
    }
}
```

Next, we will verify the request. For that, we need to fetch the shop data from the database. The shopRepository provides the getShopFromId method for that. The source part of the request contains the shopId.
With that id, the shop is retrieved from the repository. The verifier then validates the request with the shop object. A failed validation raises an exception, thus stopping unauthorized requests from going through.

```php
// src/Controller/ProductController.php
    public function productWritten(Request $request)
    {
        $event = json_decode($request->getContent(), true);
        $shop = $this->shopRepository->getShopFromId($event['source']['shopId']);

        $this->verifier->authenticatePostRequest($request, $shop);
    }
```

### Creating a shop client

Once the request has been verified, you can use the `$shop` to create an api-client for that particular shop.

```php
// src/Controller/ProductController.php
    public function productWritten(Request $request)
    {
        /* ... missing request verification */

        $client = new ShopClient(
            new Client([
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

The `ShopClient` receives a standard Guzzle HTTP client as well as the `$shop` we got from the database.
By setting the `base_uri` of the Guzzle client to the store-url, we don't have to set it repeatedly.

Now we can inspect the event payload:

```php
// src/Controller/ProductController.php
    public function productWritten(Request $request)
    {
        //...
        $updatedFields = $event['data']['payload'][0]['updatedFields'];

        if (!in_array('description', $updatedFields)) {
            return new Response('', Response::HTTP_NO_CONTENT);
        }
    }
```

### Fetching data from the shop

All `$entity.written` events contain a list of fields that a write event has changed.
The code above uses this information to determine if the description of a product was changed.
If the change did not affect the description, the controller returns a `204` response because there is nothing else to do for this event.

Now that it is certain that the description of the product was changed, we fetch the description through the API of the shop:

```php
// src/Controller/ProductController.php
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
    }
```

The request contains a criteria that fetches the product for which we received the event `'ids' => [$id]` and all translations and their associated languages `'associations' => 'language'`. Now we can retrieve the English description from the API response:

```php
// src/Controller/ProductController.php
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
    }
```

::: info
A common gotcha with `entity.written` webhooks is that they trigger themselves when you're performing write operations. Updating the description triggers another `entity.written` event. This again calls the webhook, which updates the description, and so on.
:::

Because our goal is to write a french translation of the product, the app needs to take care to avoid endless loops.
To determine if the app has already written a translation once, it saves a hash of the original description.
We will get to the generation of the hash later, but we need to check it first:

```php
// src/Controller/ProductController.php
    public function productWritten(Request $request)
    {
        //...
        $lastHash = $product['customFields']['translator-last-translation-hash'] ?? '';
        if (md5($description) === $lastHash) {
            return new Response('', Response::HTTP_NO_CONTENT);
        }
    }
```

### Writing a translated description

Now that the app can be sure the description has not been translated before it can write the new description like so:

```php
// src/Controller/ProductController.php
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
    }
```

Note that the hash of the original description gets saved as a value in the
custom fields of the product entity. This is possible without any further config since all custom fields are schema-less.

The implementation of the `translate` method is disregarded in this example. You might perform an additional lookup through a translation API service to implement it.

## Install the app

In this last step, we will install the app using the Shopware CLI tools.

::: info
If this is your first time using the Shopware CLI, you have to [install](https://sw-cli.fos.gg/install/) it first. Next, configure it using the `shopware-cli project config init` command.
:::

```sh
shopware-cli project extension upload ProductTranslator/release --activate --increase-version
```

This command will create a zip file from the specified extension directory and upload it to your configured store.
The `--increase-version` parameter increases the version specified in the `manifest.xml` file. This flag is required so Shopware picks up changes made to the `manifest.xml` since the last installation.
Once successfully installed, you will see the app in the extension manager.
And when you save a product, the description will automatically update.

## Where to continue

In this example, you have learned how to receive events and modify data through the app system. You can also:

* Add [new payments](../payment.md) as apps
* Write code that runs during checkout [app scripting](../app-scripts/cart-manipulation.md)
* Add new endpoints to the API [custom endpoints](./add-api-endpoint.md)
