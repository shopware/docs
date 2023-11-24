---
nav:
  title: Getting started
  position: 10

---

# Getting Started

The app server written in PHP is an open-source project accessible at [app-php-sdk](https://github.com/shopware/app-php-sdk).

## Installation

Install the Shopware APP SDK via composer:

```bash
composer require shopware/app-php-sdk
```

After the package installation, Composer will automatically install the http client if missing.

## Registration process

```php
$app = new AppConfiguration('Foo', 'test', 'http://localhost:6001/register/callback');
// for a repository to save stores implementing \Shopware\App\SDK\Shop\ShopRepositoryInterface, see FileShopRepository as an example
$repository = ...;

// Create a psr 7 request or convert it (HttpFoundation Symfony)
$psrRequest = ...;

// you can also use the AppLifecycle see Lifecycle section
$registrationService = new \Shopware\App\SDK\Registration\RegistrationService($app, $repository);

$response = match($_SERVER['REQUEST_URI']) {
    '/app/register' => $registrationService->register($psrRequest),
    '/app/register/confirm' => $registrationService->registerConfirm($psrRequest),
    default => throw new \RuntimeException('Unknown route')
};

// return the response
```

With this code, you can register your app with our custom app backend.

Next, we will look into the [lifecycle handling](./02-lifecycle).
