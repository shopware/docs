# Message Queue

## What is the Message Queue
Shopware uses the Symfony Messenger component and Enqueue to handle asynchronous messages. This allows tasks to be processed in the background. Thus, tasks can be processed independently of timeouts or system crashes. By default, tasks in Shopware are stored in the database and processed via the browser, as long as you are logged into the administration. This is a simple and fast method for the development process, but not recommended for production systems. With multiple users logged into the administration, this can lead to high CPU load and interfere with the smooth execution of PHP FPM.
If you want to know more about the implementation of the Message Queue within shopware, take a look at the [Message Queue developer guide](https://docs.shopware.com/en/shopware-platform-dev-en/developer-guide/core/message-queue).

## Message Queue on production systems
On a productive system, the message queue should not be processed via the browser in the administration, but via the CLI. This way, tasks are also completed when no one is logged into the administration and high CPU load due to multiple users in the admin is also avoided.
Furthermore you can change the transport to another system like [RabbitMQ](https://www.rabbitmq.com/) for example. This would on the one hand relieve the database and on the other hand use a much more specialized service for handling message queues. 
The following are examples of the steps needed.

### Consuming Messages
The recommended method for consuming messages is using the cli worker. A detailed guide how to achieve this can be found in the documentation [Consuming Messages](https://docs.shopware.com/en/shopware-platform-dev-en/developer-guide/core/message-queue#consuming-messages).

### Transport: RabbitMQ example
In this example we replace the standard transport, which stores the messages in the database, with RabbitMQ. Of course, other transports can be used as well. A detailed documentation of the parameters and possibilities can be found in the [enqueue symfony documentation](https://php-enqueue.github.io/bundle/config_reference/). 
In the following I assume that RabbitMQ is installed and started. Furthermore, a queue, here called `shopware-queue`, should be created inside RabbitMQ.
The only thing left is to tell shopware about the new transport. Therefore we edit/create the configuration file `config/packages/enqueue.yaml` with the following content:
```yaml
enqueue:
    rabbitmq:
        transport:
            dsn: "amqp://guest:guest@rabbitmq:5672/%2F?connection_timeout=1000&heartbeat=100"
        client: ~
```
Be sure to replace the login credentials, host and port with your correct parameters in the connection string.
And now we activate that transport and replace the default one of shopware. This can be done by editing/creating the file `config/packages/framework.yaml`.
```yaml
framework:
    messenger:
        transports:
            default:
                dsn: "enqueue://rabbitmq?queue[name]=shopware-queue"
```
Notice that `shopware-queue` is the name of the previously created queue in RabbitMQ. Also `rabbitmq` matches the name of the new transport in the previously created `enqueue.yaml`.
