# Events

The `Shopware\App\SDK\AppLifecycle` and `Shopware\App\SDK\Registration\RegistrationService` class accepts a PSR event dispatcher.
When an PSR Dispatcher is passed, the following events will be fired:

- [BeforeShopActivateEvent](../src/Event/BeforeShopActivateEvent.php)
- [ShopActivatedEvent](../src/Event/ShopActivatedEvent.php)
- [BeforeShopDeactivatedEvent](../src/Event/BeforeShopDeactivatedEvent.php)
- [ShopDeactivatedEvent](../src/Event/ShopDeactivatedEvent.php)
- [BeforeShopDeletionEvent](../src/Event/BeforeShopDeletionEvent.php)
- [ShopDeletedEvent](../src/Event/ShopDeletedEvent.php)
- [BeforeRegistrationCompletedEvent](../src/Event/BeforeRegistrationCompletedEvent.php)
- [RegistrationCompletedEvent](../src/Event/RegistrationCompletedEvent.php)

With that event, you can react to several actions happening while app lifecycle or a registration process to run your own code.
