---
nav:
  title: Add middleware
  position: 30

---

# Add Middleware

## Overview

In this guide you will learn how to add a custom middleware.

A [Middleware](https://symfony.com/doc/current/messenger.html#middleware) is called when the message bus dispatches messages. The middleware defines what happens when you dispatch a message. For example the `send_message` middleware is responsible for sending your message to the configured transport and the `handle_message` middleware will actually call your handlers for the given message.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide), but you don't necessarily need that. Furthermore, registering classes or services to the DI container is also not explained here, but it's covered in our guide about [Dependency injection](../../plugin-fundamentals/dependency-injection), so having this open in another tab won't hurt.

## Create middleware

First we need to create a new service that implements the `MiddlewareInterface`. This interface comes with a method `handle`, which should always call the next middleware.

```php
// <plugin root>/src/MessageQueue/Middleware/ExampleMiddleware.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\MessageQueue\Middleware;

use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\Middleware\MiddlewareInterface;
use Symfony\Component\Messenger\Middleware\StackInterface;

class ExampleMiddleware implements MiddlewareInterface
{
    public function handle(Envelope $envelope, StackInterface $stack): Envelope
    {
        // do something here

        // don't forget to call the next middleware
        return $stack->next()->handle($envelope, $stack);
    }
}
```

## Configure middleware

After we've created our middleware, we have to add that middleware to the message bus through configuration.

For each defined bus in our `framework.yaml`, we can define the middleware that this bus should use. To add middleware, we simply specify our custom middleware as follows:

```yaml
// <platform root>/src/Core/Framework/Resources/config/packages/framework.yaml
framework:
    messenger:
        default_bus: messenger.bus.shopware
        buses:
            messenger.bus.shopware:
              middleware:
                - 'Swag\BasicExample\MessageQueue\Middleware\ExampleMiddleware'
                - 'Swag\BasicExample\MessageQueue\Middleware\AnotherExampleMiddleware'
```

## More interesting topics

* [Message Queue](add-message-to-queue)
* [Message Handler](add-message-handler)
