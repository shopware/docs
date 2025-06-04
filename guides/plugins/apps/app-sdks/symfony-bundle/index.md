---
nav:
  title: Official Symfony bundle
  position: 10

---

# App Bundle

App Bundle integrates the PHP App SDK for Symfony. This can be accessed at [app-bundle-symfony](https://github.com/shopware/app-bundle-symfony).

## Installation

### With SQL based storage (Doctrine)

```bash
composer require shopware/app-bundle doctrine/orm symfony/doctrine-bridge
```

### With NoSQL based storage (DynamoDB)

```bash
composer require shopware/app-bundle async-aws/async-aws-bundle async-aws/dynamo-db
```

## Quick Start using SQL based storage (Doctrine)

### 1. Create a new Symfony Project (skip if existing)

```bash
composer create-project symfony/skeleton:"6.2.*" my-app
```

### 2. Install the App Bundle in your Symfony Project

```bash
composer require shopware/app-bundle doctrine/orm symfony/doctrine-bridge
```

It is also recommended to install the monolog bundle to have logging:

```bash
composer require logger
```

### 3. Create a new App manifest

Here is an example app manifest

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>TestApp</name>
        <label>TestApp</label>
        <label lang="de-DE">TestApp</label>
        <description/>
        <description lang="de-DE"/>
        <author>Your Company</author>
        <copyright>(c) by Your Company</copyright>
        <version>1.0.0</version>
        <icon>Resources/config/plugin.png</icon>
        <license>MIT</license>
    </meta>
    <setup>
        <registrationUrl>http://localhost:8000/app/lifecycle/register</registrationUrl>
        <secret>TestSecret</secret>
    </setup>
    <webhooks>
        <webhook name="appActivated" url="http://localhost:8000/app/lifecycle/activate" event="app.activated"/>
        <webhook name="appDeactivated" url="http://localhost:8000/app/lifecycle/deactivate" event="app.deactivated"/>
        <webhook name="appDeleted" url="http://localhost:8000/app/lifecycle/delete" event="app.deleted"/>
    </webhooks>
</manifest>
```

change the app name and the app secret to your needs
and also adjust the environment variables inside your `.env` file to match them.

By default, the following routes are registered:

* `/app/lifecycle/register` - Register the app
* `/app/lifecycle/activate` - Activate the app
* `/app/lifecycle/deactivate` - Deactivate the app
* `/app/lifecycle/delete` - Delete the app

You can change the prefix by editing the `config/routes/shopware_app.yaml` file.

The registration also dispatches events to react to the different lifecycle events. See APP SDK docs for it

### 4. Connecting Doctrine to a Database

<!--@include: @/docs/snippets/guide/app_database_setup.md-->

### 5. Implement first ActionButtons, Webhooks, Payment

[Check out the official app documentation to learn more about the different integration points with this SDK](/docs/guides/plugins/apps/app-base-guide.md#sdk-integration).

You can also check out the [APP SDK](https://github.com/shopware/app-php-sdk) documentation.

### Optional: Webhook as Symfony Events

The app bundle also registers a generic webhook controller, which dispatches the webhook as a Symfony event.
To use that, register your Shopware webhooks to the generic webhook, which is by default `/app/webhook`.

```xml
<webhook name="productWritten" url="http://localhost:8000/app/webhook" event="product.written"/>
```

With that, you can write a Symfony EventListener/Subscriber to listen to and react to the event.

```php
#[AsEventListener(event: 'webhook.product.written')]
class ProductUpdatedListener
{
    public function __invoke(WebhookAction $action): void
    {
        // handle the webhook
    }
}
```
