---
nav:
  title: Events
  position: 60

---

# Events

The `Shopware\App\SDK\AppLifecycle` and `Shopware\App\SDK\Registration\RegistrationService` class accepts a PSR event dispatcher.
When a PSR Dispatcher is passed, the following events will be fired:

- [BeforeShopActivateEvent](https://github.com/shopware/app-php-sdk/blob/main/src/Event/BeforeShopActivateEvent.php)
- [ShopActivatedEvent](https://github.com/shopware/app-php-sdk/blob/main/src/Event/ShopActivatedEvent.php)
- [BeforeShopDeactivatedEvent](https://github.com/shopware/app-php-sdk/blob/main/src/Event/BeforeShopDeactivatedEvent.php)
- [ShopDeactivatedEvent](https://github.com/shopware/app-php-sdk/blob/main/src/Event/ShopDeactivatedEvent.php)
- [BeforeShopDeletionEvent](https://github.com/shopware/app-php-sdk/blob/main/src/Event/BeforeShopDeletionEvent.php)
- [ShopDeletedEvent](https://github.com/shopware/app-php-sdk/blob/main/src/Event/ShopDeletedEvent.php)
- [BeforeRegistrationCompletedEvent](https://github.com/shopware/app-php-sdk/blob/main/src/Event/BeforeRegistrationCompletedEvent.php)
- [RegistrationCompletedEvent](https://github.com/shopware/app-php-sdk/blob/main/src/Event/RegistrationCompletedEvent.php)

With that event, you can react to several actions during the app lifecycle or a registration process to run your code.
