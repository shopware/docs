---
nav:
  title: Add message to queue
  position: 10

---

# Add message to queue

## Overview

In this guide you'll learn how to create a message and add it to the queue.

Shopware integrates with the [Symfony Messenger](https://symfony.com/doc/current/components/messenger.html) component and [Enqueue](https://enqueue.forma-pro.com/). This gives you the possibility to send and handle asynchronous messages.

A [message](https://symfony.com/doc/current/messenger.html#creating-a-message-handler) is a simple PHP object that you want to dispatch over the MessageQueue. It must be serializable and should contain all necessary information that your handlers need to process the message.

It will be wrapped in an [envelope](https://symfony.com/doc/current/components/messenger.html#adding-metadata-to-messages-envelopes) by the message bus that dispatches the message.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide), but you don't necessarily need that. It will use an example service, so if you don't know how to add a custom service yet, have a look at our guide about [Adding a custom service](../../plugin-fundamentals/add-custom-service). Furthermore, registering classes or services to the DI container is also not explained here, but it's covered in our guide about [Dependency injection](../../plugin-fundamentals/dependency-injection), so having this open in another tab won't hurt.

## Create a message

First, we have to create a new message class in the directory `<plugin root>/MessageQueue/Message`. In this example, we create a `SmsNotification` that contains a string with content. By default, all messages are handled synchronously, to change the behavior to asynchronously we have to implement the `AsyncMessageInterface` interface.  

Here's an example:

```php
// <plugin root>/src/MessageQueue/Message/SmsNotification.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\MessageQueue\Message;

use Shopware\Core\Framework\MessageQueue\AsyncMessageInterface;

class SmsNotification implements AsyncMessageInterface
{
    private string $content;

    public function __construct(string $content)
    {
        $this->content = $content;
    }

    public function getContent(): string
    {
        return $this->content;
    }
}
```

## Send a message

After we've created our notification, we will create a service that will send our `SmsNotification`. We will name this service `ExampleSender`. In this service we need to inject the `Symfony\Component\Messenger\MessageBusInterface`, that is needed to send the message through the desired bus, which is called `messenger.bus.shopware`.

```php
// <plugin root>/src/Service/ExampleSender.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Swag\BasicExample\MessageQueue\Message\SmsNotification;
use Symfony\Component\Messenger\MessageBusInterface;

class ExampleSender
{
    private MessageBusInterface $bus;

    public function __construct(MessageBusInterface $bus)
    {
        $this->bus = $bus;
    }

    public function sendMessage(string $message): void
    {
        $this->bus->dispatch(new SmsNotification($message));
    }
}
```

If we want to add metadata to our message, we can dispatch an `Symfony\Component\Messenger\Envelope` in our service instead with the necessary [stamps](https://symfony.com/doc/current/components/messenger.html#adding-metadata-to-messages-envelopes). In this example below, we use the `Symfony\Component\Messenger\Stamp\DelayStamp`, which tells the queue to process the message later.

```php
// <plugin root>/src/Service/ExampleSender.php
public function sendMessage(string $message): void
{
    $message = new SmsNotification($message);
    $this->bus->dispatch(
        (new Envelope($message))
            ->with(new DelayStamp(5000))
    );
}
```

## Encrypted messages

As the sent messages may travel through some 3rd party services you may want to encrypt messages containing sensible information. To send encrypted messages simply use the `encrypted.messenger.bus.shopware` rather than the `messenger.bus.shopware` message bus. The encrypted bus will handle encryption and decryption for you.

```html
// <plugin root>/src/Resources/config/services.xml
<service id="Swag\BasicExample\Service\ExampleSender">
    <argument type="service" id="encrypted.messenger.bus.shopware"/>
</service>
```

## Next steps

Now that you know how to create a message and add it to the queue, let's create a handler to process our message. To do this, head over to our "Add message handler" guide:

<PageRef page="add-message-handler" />
