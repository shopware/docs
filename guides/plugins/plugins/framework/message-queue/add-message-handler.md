# Add message handler

## Overview

In this guide you'll learn how to create a message handler.

A [handler](https://symfony.com/doc/current/messenger.html#creating-a-message-handler) gets called once the message is dispatched by the `handle_messages` middleware. Handlers do the actual processing of the message.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide.md), but you don't necessarily need that. It will use an example message, so if you don't know how to add a custom message yet, have a look at our guide about [Adding a message to queue](add-message-to-queue.md). Furthermore, registering classes or services to the DI container is also not explained here, but it's covered in our guide about [Dependency injection](../../plugin-fundamentals/dependency-injection.md), so having this open in another tab won't hurt.

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

## Consuming messages

There is a console command to start a worker that will receive incoming messages from your transport and dispatch them. Simply start the worker with the following command:

```bash
// 
bin/console messenger:consume async
```

Where `async` is the transport you want to consume message from. There is also an API-Route that lets you consume messages for a given transport. Just post to the route `/api/_action/message-queue/consume` and define the transport from which you want to consume:

```js
// on
{
  "receiver": "async"
}
```

The receiver will consume messages for 2 seconds and then you get the count of the handled messages in the response:

```js
// on
{
  "handledMessages": 15
}
```

### The admin-worker

Per default there is an admin-worker that will periodically ping the endpoint to consume messages from the Administration. This feature is intended for development and hosting environments where a more complex setup is not feasible. However, you really should use the cli-worker in production setups, because the admin-worker just consumes messages if an Administration user is logged in.

### The cli-worker

The recommended way to consume messages is through the cli command. You can configure the command to run a certain amount of time or to stop if it exceeds a certain memory limit like:

```bash
// 
bin/console messenger:consume async --time-limit=60
```

```bash
// 
bin/console messenger:consume async --memory-limit=128M
```

For more information about the command and its configuration use the `-h` option:

```bash
// 
bin/console messenger:consume -h
```

You should use the limit option to periodically restart the worker processes, because of the memory leak issues of long running php processes. To automatically start the processes again after they stopped because of exceeding the given limits you can use something like [upstart](http://upstart.ubuntu.com/getting-started.html) or [supervisor](http://supervisord.org/running.html). Alternatively you can configure a `CronJob` that runs the command periodically.

If you have configured the cli-worker, you can turn off the admin worker in your `shopware.yaml`.

```yaml
// <platform root>/src/Core/Framework/Resources/config/packages/shopware.yaml
shopware:
    admin_worker:
        enable_admin_worker: false
```

**Note:** This will disable the AdminWorker completely and you have to configure the cli-worker for scheduled tasks as well.

## Configuration

### Message bus

The message bus is used to dispatch your messages to your registered handlers. While dispatching your message it loops through the configured middleware for that bus. The message bus used inside Shopware can be found under the service tag `messenger.bus.shopware`. It is mandatory to use this message bus if your messages should be handled inside Shopware. However if you want to send messages to external systems you can define your custom message bus for that.

You can configure an array of buses and define one default bus in your `framework.yaml`.

```yaml
// <platform root>/src/Core/Framework/Resources/config/packages/framework.yaml
framework:
    messenger:
        default_bus: messenger.bus.shopware
        buses:
            messenger.bus.shopware:
```

For more information on this check the [Symfony docs](https://symfony.com/doc/current/messenger/multiple_buses.html).

### Transport

A [transport](https://symfony.com/doc/current/messenger.html#transports-async-queued-messages) is responsible for communicating with your 3rd party message broker. You can configure multiple transports and route messages to multiple or different transports. Supported are all transports that are either supported by [Symfony](https://symfony.com/doc/current/messenger.html#transport-configuration) itself. If you don't configure a transport, messages will be processed synchronously like in the Symfony event system.

You can configure an amqp transport directly in your `framework.yaml` and simply tell Symfony to use your  transports.

In a simple setup you only need to set the transport to a valid DSN like:

```yaml
// <platform root>/src/Core/Framework/Resources/config/packages/queue.yaml
framework:
  messenger:
    transports:
      my_transport:
        dsn: "%env(MESSENGER_TRANSPORT_DSN)%"
```

For more information on this check the [symfony docs](https://symfony.com/doc/current/messenger.html#transport-configuration).

### Routing

You can route messages to different transports. For that, just configure your routing in the `framework.yaml`.

```yaml
// <plugin root>/src/
framework:
    messenger:
      transports:
        async: "%env(MESSENGER_TRANSPORT_DSN)%"
        another_transport: "%env(MESSENGER_TRANSPORT_ANOTHER_DSN)%"
      routing: 
        'Swag\BasicExample\MessageQueue\Message\SmsNotification': another_transport
        'Swag\BasicExample\MessageQueue\Message\AnotherExampleNotification': [async, another_transport]
        '*': async
```

You can route messages by their classname and use the asterisk as a fallback for all other messages. If you specify a list of transports the messages will be routed to all of them. For more information on this check the [Symfony docs](https://symfony.com/doc/current/messenger.html#routing-messages-to-a-transport).

### Admin worker

The admin-worker can be configured or disabled in the general `shopware.yml` configuration. If you want to use the admin worker you have to specify each transport, that previously was configured. The poll interval is the time in seconds that the admin-worker polls messages from the queue. After the poll-interval is over the request terminates and the Administration initiates a new request.

```yaml
// <platform root>/src/Core/Framework/Resources/config/packages/shopware.yaml
shopware:
    admin_worker:
        enable_admin_worker: true
        poll_interval: 30
        transports: ["async"]
```

## Next steps

Now that you know how to add a message handler and configure a bus for it, you may want to add a custom middleware for your bus. To do this, head over to our "Add middleware" guide:

<PageRef page="add-middleware" />
