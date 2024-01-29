---
nav:
  title: Context
  position: 30

---

# Context

The ContextResolver helps you map the Shopware requests to struct classes to work with them more easily.
It also does some validation and checks if the request is valid.

## Usage

```php
$app = new AppConfiguration('Foo', 'test', 'http://localhost:6001/register/callback');
// for a repository to save stores implementing \Shopware\App\SDK\Shop\ShopRepositoryInterface, see FileShopRepository as an example
$repository = ...;

// Create a psr 7 request or convert it (HttpFoundation Symfony)
$psrRequest = ...;

$registrationService = new \Shopware\App\SDK\Registration\RegistrationService($app, $repository);
$shopResolver = new \Shopware\App\SDK\Shop\ShopResolver($repository);

$contextResolver = new \Shopware\App\SDK\Context\ContextResolver();

// Find the actual shop by the request
$shop = $shopResolver->resolveShop($psrRequest);

// Parse the request as a webhook
$webhook = $contextResolver->assembleWebhook($psrRequest, $shop);

$webhook->eventName; // the event name
$webhook->payload; // the event data
```

## Supported requests

- [Webhook](https://github.com/shopware/app-php-sdk/blob/main/src/Context/Webhook/WebhookAction.php) - Webhooks or App lifecycle events
- [ActionButton](https://github.com/shopware/app-php-sdk/blob/main/src/Context/ActionButton/ActionButtonAction.php) - Administration buttons
- [Module](https://github.com/shopware/app-php-sdk/blob/main/src/Context/Module/ModuleAction.php) - Iframe
- [TaxProvider](https://github.com/shopware/app-php-sdk/blob/main/src/Context/TaxProvider/TaxProviderAction.php) - Tax calculation
- [Payment Pay](https://github.com/shopware/app-php-sdk/blob/main/src/Context/Payment/PaymentPayAction.php) - Payment pay action
- [Payment Capture](https://github.com/shopware/app-php-sdk/blob/main/src/Context/Payment/PaymentCaptureAction.php) - Payment capture action
- [Payment Validate](https://github.com/shopware/app-php-sdk/blob/main/src/Context/Payment/PaymentValidateAction.php) - Payment validate action
- [Payment Finalize](https://github.com/shopware/app-php-sdk/blob/main/src/Context/Payment/PaymentFinalizeAction.php) - Payment finalize action

Next, we will look into the [Signing of responses](./04-signing).
