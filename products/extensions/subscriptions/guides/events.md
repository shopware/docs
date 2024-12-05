---
nav:
  title: Events
  position: 30

---

# Events

Most of the events triggered within subscription checkout are prefixed with `subscription.`. These events are identical to normal checkout events. If you wish to use these events, you need to subscribe to them.

```php
// Normal Event Listener
class MyEventSubscriber implements EventSubscriberInterface
{
  public static function getSubscribedEvents(): array
  {
    return [CheckoutOrderPlacedCriteriaEvent::class => 'onOrderPlacedCriteria'];
  }

  public function onOrderPlacedCriteria(CheckoutOrderPlacedCriteriaEvent $event): void
  {
    // Your event handler logic
  }
}

// Subscription Event Listener
class MyEventSubscriber implements EventSubscriberInterface
{
  public static function getSubscribedEvents(): array
  {
    return ['subscription.' . CheckoutOrderPlacedCriteriaEvent::class => 'onOrderPlacedCriteria'];
  }

  public function onOrderPlacedCriteria(CheckoutOrderPlacedCriteriaEvent $event): void
  {
    // Your event handler logic
  }
}
```

These are the events available in the subscription checkout (subject to change):

- AfterLineItemAddedEvent
- AfterLineItemRemovedEvent
- AfterLineItemQuantityChangedEvent
- BeforeLineItemAddedEvent
- BeforeLineItemRemovedEvent
- BeforeLineItemQuantityChangedEvent
- BeforeCartMergeEvent
- CartCreatedEvent
- CartConvertedEvent
- CartDeletedEvent
- CartLoadedEvent
- CartMergedEvent
- CartSavedEvent
- CartVerifyPersistEvent
- CheckoutCartPageLoadedEvent
- CheckoutConfirmPageLoadedEvent
- CheckoutOrderPlacedCriteriaEvent
- CheckoutOrderPlacedEvent
- CheckoutRegisterPageLoadedEvent
- LineItemRemovedEvent
- SalesChannelContextCreatedEvent
- SalesChannelContextResolvedEvent
- SalesChannelContextRestoredEvent
- SalesChannelContextRestorerOrderCriteriaEvent
- OffcanvasCartPageLoadedEvent
