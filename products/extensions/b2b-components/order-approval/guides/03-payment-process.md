---
nav:
  title: Payment Process
  position: 30

---

# Order approval's payment process

The payment process of the order approval component is the same as the payment process of the order component. You can select the payment method that you want to use for your orders; however unlike the standard order component, the payment process will be executed only after the order has been approved in case of the online payment method (Visa, PayPal, etc.).

## Customization

### Storefront

The payment process of the order approval component can be customized by extending or overriding this page `@OrderApproval/storefront/pending-order/page/pending-approval/detail.html.twig`

### Payment process

Normally, after reviewer approves the order, the payment process will be executed automatically. However, if you just want to approve the order without executing the payment process, you can subscribe to the `PendingOrderApprovedEvent` event and set the `PendingOrderApprovedEvent::shouldProceedPlaceOrder` to `false`. This event is dispatched in the `Shopware\Commercial\B2B\OrderApproval\Storefront\Controller\ApprovalPendingOrderController::order` method.

```php

use Shopware\Commercial\B2B\OrderApproval\Event\PendingOrderApprovedEvent;

class MySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            PendingOrderApprovedEvent::class => 'onPendingOrderApproved'
        ];
    }

    public function onPendingOrderApproved(PendingOrderApprovedEvent $event): void
    {
        $event->setShouldProceedPlaceOrder(false);
    }
}
```
