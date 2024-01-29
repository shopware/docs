---
nav:
  title: Lifecycle
  position: 20

---

# Lifecycle

The Shopware App System manages the lifecycle of an app.
Shopware will send any change if registered a webhook to our backend server.

To track the state in our Database correctly, we need to implement some lifecycle methods.

## Lifecycle Methods

* `activate`
* `deactivate`
* `uninstall`

The lifecycle registration in the `manifest.xml` would look like this:

```xml
<webhooks>
    <webhook name="appActivate" url="https://app-server.com/app/activate" event="app.activated"/>
    <webhook name="appDeactivated" url="https://app-server.com/app/deactivated" event="app.deactivated"/>
    <webhook name="appDelete" url="https://app-server.com/app/delete" event="app.deleted"/>
</webhooks>
```

## Usage

The implementation is similar to [Registration](./01-getting_started)
and wraps the RegistrationService to inject only one controller for all lifecycle methods.

```php
$app = new AppConfiguration('Foo', 'test', 'http://localhost:6001/register/callback');
// for a repository to save stores implementing \Shopware\App\SDK\Shop\ShopRepositoryInterface, see FileShopRepository as an example
$repository = ...;

// Create a psr 7 request or convert it (HttpFoundation Symfony)
$psrRequest = ...;

$registrationService = new \Shopware\App\SDK\Registration\RegistrationService($app, $repository);
$shopResolver = new \Shopware\App\SDK\Shop\ShopResolver($repository);
$lifecycle = new \Shopware\App\SDK\AppLifecycle($registrationService, $shopResolver, $repository);

$response = match ($_SERVER['REQUEST_URI']) {
    '/app/register' => $lifecycle->register($psrRequest),
    '/app/register/confirm' => $lifecycle->registerConfirm($psrRequest),
    '/app/activate' => $lifecycle->activate($psrRequest),
    '/app/deactivate' => $lifecycle->deactivate($psrRequest),
    '/app/delete' => $lifecycle->delete($psrRequest),
    default => throw new \RuntimeException('Unknown route')
};

// return the response
```

So, in this case, our backend gets notified of any app change, and we can track the state in our database.

Next, we will look into the [Context resolving](./03-context).
