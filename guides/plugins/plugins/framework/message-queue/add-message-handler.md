---
nav:
  title: Add message handler
  position: 20

---

# Add message handler

## Overview

::: warning
Parts of this guide refer to the `low_priority` queue, which is only available in version 6.5.7.0 and above. Configuring the messenger to consume this queue will fail if it does not exist.
:::

In this guide you'll learn how to create a message handler.

A [handler](https://symfony.com/doc/current/messenger.html#creating-a-message-handler) gets called once the message is dispatched by the `handle_messages` middleware. Handlers do the actual processing of the message.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide), but you don't necessarily need that. It will use an example message, so if you don't know how to add a custom message yet, have a look at our guide about [Adding a message to queue](add-message-to-queue). Furthermore, registering classes or services to the DI container is also not explained here, but it's covered in our guide about [Dependency injection](../../plugin-fundamentals/dependency-injection), so having this open in another tab won't hurt.

## Handling messages

First, we have to create a new class which we will name `SmsHandler` in this example. To mark the class as message handler, we use the php attribute `#[AsMessageHandler]` and implement the method `__invoke`. We can also define multiple handlers for the same message. To register a handler, we have to tag it with the `messenger.message_handler` tag.

```php
// <plugin root>/src/MessageQueue/Handler/SmsHandler.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\MessageQueue\Handler;

use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Swag\BasicExample\MessageQueue\Message\SmsNotification;

#[AsMessageHandler]
class SmsHandler
{
    public function __invoke(SmsNotification $message)
    {
        // ... do some work - like sending an SMS message!
    }
}
```

## Next steps

Now that you know how to add a message handler, you may want to add a custom middleware for your bus. To do this, head over to [Add middleware](add-middleware) guide.

If you want to learn more about configuring the message queue, have a look at the [Message queue hosting guide](../../../../hosting/infrastructure/message-queue.md).
