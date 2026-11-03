---
nav:
  title: Split message queues
  position: 85
---

# Split message queues

By default, every message in Shopware PaaS Native goes to the single `async` transport defined in `config/packages/operator.yaml`. Long-running messages, such as indexing, can delay time-critical messages such as order confirmation emails. You can route selected messages to an additional transport so they are processed independently.

## Why not edit `operator.yaml`

The `async` transport and the rest of the platform configuration come from the [`shopware/k8s-meta`](../fundamentals/k8s-meta.md) package. `operator.yaml` is managed by its Symfony Flex recipe, so changes to it are overwritten when the recipe is updated. Define additional transports and routing in a separate file instead. Symfony merges all files in `config/packages/`, so the new transport is added next to the `async` transport from `operator.yaml`.

## Example: dedicated mail queue

Create `config/packages/paas_messenger.yaml`:

::: code-group

```yaml [config/packages/paas_messenger.yaml]
framework:
    messenger:
        transports:
            mail:
                dsn: "%env(MESSENGER_TRANSPORT_DSN)%"
                options:
                    stream: messages_mail
                    consumer: "%env(MESSENGER_CONSUMER_NAME)%"
        routing:
            'Symfony\Component\Mailer\Messenger\SendEmailMessage': mail
```

:::

This configuration:

- Adds a `mail` transport that reuses `MESSENGER_TRANSPORT_DSN`, so it connects to the same Valkey instance as the `async` transport.
- Sets its own stream `messages_mail`, so mail messages are stored separately from the `messages` stream used by `async`.
- Reuses `MESSENGER_CONSUMER_NAME`, which the platform sets for every worker, so each worker replica gets a unique consumer name.
- Routes `SendEmailMessage` to the `mail` transport instead of `async`. All other messages keep going to `async`.

::: warning
Use a new, unique `stream` name for each additional transport. Without the `stream` option, the transport falls back to `messages` and shares the stream with `async`.
:::

## Adding routes versus overriding routes

How you route a message depends on how Shopware already routes it:

- **Routed by class name**: Shopware core routes `SendEmailMessage` to `async` by its class name. A `framework.messenger.routing` entry for the same class replaces that route, as in the mail example above.
- **Routed by interface**: Shopware routes every message that implements `AsyncMessageInterface` to `async`. A `framework.messenger.routing` entry for such a message class is **added** to the interface route, so the message is sent to both transports and processed twice. Use `shopware.messenger.routing_overwrite` instead, as described in [Routing overwrites](../../../../guides/hosting/infrastructure/message-queue.md#routing-overwrites).

## Adding more queues

For example, to move import and export messages to their own queue, add a transport with its own stream name. `ImportExportMessage` implements `AsyncMessageInterface`, so route it with `routing_overwrite`:

::: code-group

```yaml [config/packages/paas_messenger.yaml]
framework:
    messenger:
        transports:
            mail:
                dsn: "%env(MESSENGER_TRANSPORT_DSN)%"
                options:
                    stream: messages_mail
                    consumer: "%env(MESSENGER_CONSUMER_NAME)%"
            export:
                dsn: "%env(MESSENGER_TRANSPORT_DSN)%"
                options:
                    stream: messages_export
                    consumer: "%env(MESSENGER_CONSUMER_NAME)%"
        routing:
            'Symfony\Component\Mailer\Messenger\SendEmailMessage': mail

shopware:
    messenger:
        routing_overwrite:
            'Shopware\Core\Content\ImportExport\Message\ImportExportMessage': export
```

:::

For details on routing, see the [Symfony Messenger documentation](https://symfony.com/doc/current/messenger.html#routing-messages-to-a-transport).

## Verify the configuration

Run the following commands locally to inspect the merged transports and routing:

```bash
bin/console debug:config framework messenger
bin/console debug:config shopware messenger
```

After deployment, open an exec session and run `bin/console messenger:stats` to see the number of pending messages per transport.
