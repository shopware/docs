# Messaging

Shopware integrates with the [Symfony Messenger](https://symfony.com/doc/current/components/messenger.html) component and [Enqueue](https://enqueue.forma-pro.com/). This gives you the possibility to send and handle asynchronous messages.

## Components

### Message Bus

The [Message bus](https://symfony.com/doc/current/components/messenger.html#bus) is used to dispatch your messages to your registered handlers. While dispatching your message it loops through the configured middleware for that bus. The message bus used inside Shopware can be found under the service tag `messenger.bus.shopware`. It is mandatory to use this message bus if your messages should be handled inside Shopware. However, if you want to send messages to external systems, you can define your custom message bus for that.

### Middleware

A [Middleware](https://symfony.com/doc/current/messenger.html#middleware) is called when the message bus dispatches messages. It defines what happens when you dispatch a message. For example, the `send\_message` middleware is responsible for sending your message to the configured [Transport](messaging#transport), and the `handle_message` middleware will actually call your handlers for the given message. You can add your own middleware by implementing the `MiddlewareInterface` and adding that middleware to the message bus through configuration.

### Handler

A [Handler](https://symfony.com/doc/current/messenger.html#registering-handlers) gets called once the message is dispatched by the `handle_messages` middleware. A message handler is a PHP callable, the recommended way to create it is to create a class that has the `AsMessageHandler` attribute and has an `__invoke()` method that's type-hinted with the message class (or a message interface)

### Message

A [Message](https://symfony.com/doc/current/messenger.html#message) is a simple PHP class you want to dispatch over the MessageQueue. It must be serializable and should contain all the necessary information that a [handler](messaging#handler) needs to process the message.

### Envelope

A message will be wrapped in an [Envelope](https://symfony.com/doc/current/components/messenger.html#adding-metadata-to-messages-envelopes) by the message bus that dispatches the message.

### Stamps

While the message bus is processing the message through its middleware, it adds [Stamps](https://symfony.com/doc/current/components/messenger.html#adding-metadata-to-messages-envelopes) to the envelope that contain metadata about the message. If you need to add metadata or configuration to your message, you can either wrap your message in an envelope and add the necessary stamps before dispatching your message or create your own custom middleware.

### Transport

A [Transport](https://symfony.com/doc/current/messenger.html#transports) is responsible for communicating with your 3rd party message broker. You can configure multiple Transports and route messages to multiple or different Transports. Supported are all Transports that are either supported by [Symfony](https://symfony.com/doc/current/messenger.html#transports) itself or by [Enqueue](https://github.com/php-enqueue/enqueue-dev/tree/master/docs/transport). If you don't configure a Transport, messages will be processed synchronously, like in the Symfony event system.

### Sending Messages

To send messages, the Shopware messenger bus is used, which can be injected through DI and populated with metadata. Optionally, there is also a message bus for sensitive data that offers encryption.

### Consuming Messages

Consuming messages can be done via both a [Console command](../../guides/hosting/infrastructure/message-queue#cli-worker) and via an API endpoint. The console command starts a worker that will receive incoming messages from your Transport and dispatch them. The API can be communicated via a POST, which will consume messages for 2 seconds, and then you get the count of the handled messages in the response.
