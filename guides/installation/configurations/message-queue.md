---
nav:
  title: Message Queue
  position: 20

---

# Message Queue

## Overview

Shopware uses the Symfony Messenger component and Enqueue to handle asynchronous messages. This allows tasks to be processed in the background. Thus, tasks can be processed independently of timeouts or system crashes. By default, tasks in Shopware are stored in the database and processed via the browser as long as you are logged into the Administration. This is a simple and fast method for the development process, but not recommended for production systems. With multiple users logged into the Administration, this can lead to a high CPU load and interfere with the smooth execution of PHP FPM.

## Message queue on production systems

On a production system, the message queue should be processed via the CLI instead of the browser in the Administration ([Admin worker](#admin-worker)). This way, tasks are also completed when no one is logged into the Administration and high CPU load due to multiple users in the admin is also avoided. Furthermore, you can change the transport to another system like [RabbitMQ](https://www.rabbitmq.com/). This would, relieve the database and, on the other hand, use a much more specialized service for handling message queues. The following are examples of the steps needed.  
It is recommended to run one or more `messenger:consume` workers. To automatically start the processes again after they stopped because of exceeding the given limits you can use a process control system like [systemd](https://www.freedesktop.org/wiki/Software/systemd/) or [supervisor](http://supervisord.org/running.html).
Alternatively, you can configure a cron job that runs the command periodically.

::: info
Using cron jobs won't take care of maximum running worker, like supervisor can do. They don't wait for another worker to stop. So there is a risk of starting an unwanted amount of workers when you have messages running longer than the set time limit. If the time limit has been exceeded worker will wait for the current message to be finished.
:::

Find here the docs of Symfony: <https://symfony.com/doc/current/messenger.html#deploying-to-production>  

::: info
It is recommended to use a third-party message queue to support multiple consumers and/or a greater amount of data to index.
:::

## Execution methods

::: info
The Admin Worker is enabled by default, but it's recommended to disable it and use the CLI worker in production systems.
:::

### CLI worker

You can configure the command just to run a certain amount of time and to stop if it exceeds a certain memory limit like:

```bash
bin/console messenger:consume async --time-limit=60 --memory-limit=128M
```

You can also configure the command to consume messages from multiple transports to prioritize them to your needs, as it is recommended by the [Symfony documentation](https://symfony.com/doc/current/messenger.html#prioritized-transports):

```bash
bin/console messenger:consume async low_priority
```

For more information about the command and its configuration, use the -h option:

```bash
bin/console messenger:consume -h
```

If you have configured the cli-worker, you should turn off the admin worker in the Shopware configuration file. Therefore, create or edit the configuration `shopware.yaml`.

```yaml
# config/packages/shopware.yaml
shopware:
    admin_worker:
        enable_admin_worker: false
```

### Admin worker

The admin worker, if used, can be configured in the general `shopware.yml` configuration. If you want to use the admin worker, you have to specify each transport that was previously configured. The poll interval is the time in seconds that the admin worker polls messages from the queue. After the poll interval is over, the request terminates, and the Administration initiates a new request.

```yaml
# config/packages/shopware.yaml
shopware:
    admin_worker:
        enable_admin_worker: true
        poll_interval: 30
```

## Sending mails over the message queue

By default, Shopware sends the mails synchronously. Since this can affect the page speed, you can switch it to use the Message Queue with a small configuration change.

```yaml
# config/packages/framework.yaml
framework:
    mailer:
        message_bus: 'messenger.default_bus'
```

## Failed messages

If a message fails, it will be moved to the failed transport. The failed transport is configured using the `MESSENGER_TRANSPORT_FAILURE_DSN` env. The default is the Doctrine transport. The messages are retried automatically 3 times. If the message fails again, it will be deleted. You can learn more about the failed transport and how you can configure it in the Symfony Messenger documentation: <https://symfony.com/doc/current/messenger.html#retries-failures>

## Changing the transport

By default, Shopware uses the Doctrine transport. This is simple transport that stores the messages in the database. This is a good choice for development, but not recommended for production systems. You can change the transport to another system like [RabbitMQ](https://www.rabbitmq.com/). This would, relieve the database and, on the other hand, use a much more specialized service for handling message queues. The following are examples of the steps needed.

You can find all available transport options in the Symfony Messenger documentation: <https://symfony.com/doc/current/messenger.html#transport-configuration>

Following environment variables are in use out of the box:

* `MESSENGER_TRANSPORT_DSN` - The DSN to the transport to use (e.g. `doctrine://default`).
* `MESSENGER_TRANSPORT_LOW_PRIORITY_DSN` - The DSN to the transport to use for low priority messages (e.g. `doctrine://default?queue_name=low_priority`).
* `MESSENGER_TRANSPORT_FAILURE_DSN` - The DSN to the transport to use for failed messages (e.g. `doctrine://default?queue_name=failed`).

## Worker count for efficient message processing

The number of workers depends on the number of messages queued and the type of messages they are. Product indexing messages are usually slow, while other messages are processed very fast. Therefore, it is difficult to give a general recommendation. You should be able to monitor the queue and adjust the number of workers accordingly.
Sometimes, it also makes sense to route messages to a different transport to limit the number of workers for a specific type of message to avoid database locks or prioritize messages like sending emails.

<!-- {"WATCHER_URL":"https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/Resources/config/packages/shopware.yaml","WATCHER_HASH":"183f85ba8f15e8e7d0006b70be20940f","WATCHER_CONTAINS":"enable_admin_worker"} -->

## Configuration

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

#### Routing overwrites

By default, all messages that implement the `AsyncMessageInterface` will be routed to the `async` transport. The default symfony config detailed above will only let you add additional routing to those messages, however if you need to overwrite the additional routing you can do so by adding the following to your `shopware.yaml`:

```yaml
shopware:
  messenger:
    routing_overwrite:
      'Shopware\Core\Framework\DataAbstractionLayer\Indexing\EntityIndexingMessage': entity_indexing
```

The `shopware.messenger.routing_overwrite` config option accepts the same format as the `framework.messenger.routing` option, but it will overwrite the routing for the given message class instead of adding to it.
This is especially useful if there is a default routing already configured based on a message interface, but you need to change the routing for a specific message.
