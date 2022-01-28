# Message Queue

## What is the Message Queue

Shopware uses the Symfony Messenger component and Enqueue to handle asynchronous messages. This allows tasks to be processed in the background. Thus, tasks can be processed independently of timeouts or system crashes. By default, tasks in Shopware are stored in the database and processed via the browser, as long as you are logged into the administration. This is a simple and fast method for the development process, but not recommended for production systems. With multiple users logged into the administration, this can lead to high CPU load and interfere with the smooth execution of PHP FPM.

## Message Queue on production systems

On a productive system, the message queue should be processed via the CLI instead of the browser in the administration ([Admin worker](#admin-worker)). This way, tasks are also completed when no one is logged into the administration and high CPU load due to multiple users in the admin is also avoided. Furthermore you can change the transport to another system like [RabbitMQ](https://www.rabbitmq.com/) for example. This would on the one hand relieve the database and on the other hand use a much more specialized service for handling message queues. The following are examples of the steps needed.  
It's recommended to run one or more `messenger:consume`-workers. To automatically start the processes again after they stopped because of exceeding the given limits you can use a process control system like [systemd](https://www.freedesktop.org/wiki/Software/systemd/) or [supervisor](http://supervisord.org/running.html).  
Alternatively you can configure a cron job that runs the command periodically. Please note: Using cron jobs won't take care of maximum running worker, like supervisor can do. They don't wait for another worker to stop. So there is a risk starting an unwanted amount of workers when you have messages running longer than the set time-limit. If the time-limit has been exceeded worker will wait for the current message being finished.

Find here the docs of Symfony: https://symfony.com/doc/current/messenger.html#deploying-to-production  

{% hint style="info" %}
It is recommended to use a third party message queue to support multiple consumers and / or a greater amount of data to index.
{% endhint %}

### Consuming Messages

The recommended method for consuming messages is using the cli worker.

#### Cli worker

You can configure the command just to run a certain amount of time and to stop if it exceeds a certain memory limit like: 

```bash
bin/console messenger:consume default --time-limit=60 --memory-limit=128M
```

For more information about the command and its configuration use the -h option: 

```bash
bin/console messenger:consume -h
```

#### Admin worker

If you have configured the cli-worker, you should turn off the admin worker in the shopware configuration file, therefore create or edit the configuration `shopware.yaml`.

```yaml
# config/packages/shopware.yaml
shopware:
    admin_worker:
        enable_admin_worker: false
```

The admin-worker, if used, can be configured in the general `shopware.yml` configuration. If you want to use the admin worker you have to specify each transport, that previously was configured. The poll interval is the time in seconds that the admin-worker polls messages from the queue. After the poll-interval is over the request terminates and the administration initiates a new request.

```yaml
# config/packages/shopware.yaml
shopware:
    admin_worker:
        enable_admin_worker: true
        poll_interval: 30
        transports: ["default"]
```

#### systemd example

We assume the services to be called `shopware_consumer`.

Create a new file `/etc/systemd/system/shopware_consumer@.service`
```bash
[Unit]
Description=Shopware Message Queue Consumer, instance %i
PartOf=shopware_consumer.target

[Service]
Type=simple
User=www-data # Change this to webservers user name
Restart=always
RestartSec=always
# Change the path to your shop path
ExecStart=php /var/www/html/bin/console messenger:consume --time-limit=60 --memory-limit=512M

[Install]
WantedBy=shopware_consumer.target
```

Create a new file `/etc/systemd/system/shopware_consumer.target`
```bash
[Install]
WantedBy=multi-user.target

[Unit]
Description=shopware_consumer service
```

Enable multiple instances. Example for three instances:
`systemctl enable shopware_consumer@{1..3}.service`

Enable the dummy target:
`systemctl enable shopware_consumer.target`

At the end start the services:
`systemctl start shopware_consumer.target`

#### supervisord example

Please refer to the [Symfony documentation](https://symfony.com/doc/current/messenger.html#supervisor-configuration) for the setup.

### Sending Mails over the Message Queue

By default Shopware sends the mails synchronously. Since this can affect the page speed, you can switch it to use the Message Queue with a small configuration change.

```yaml
# config/packages/framework.yaml
framework:
    mailer:
        message_bus: 'messenger.default_bus'
```


### Transport: RabbitMQ example

In this example we replace the standard transport, which stores the messages in the database, with RabbitMQ. Of course, other transports can be used as well. A detailed documentation of the parameters and possibilities can be found in the [enqueue symfony documentation](https://php-enqueue.github.io/bundle/config_reference/). In the following I assume that RabbitMQ is installed and started. Furthermore, a queue, here called `shopware-queue`, should be created inside RabbitMQ. The only thing left is to tell Shopware about the new transport. Therefore we edit/create the configuration file `enqueue.yaml` with the following content:

```yaml
# config/packages/enqueue.yaml
enqueue:
    rabbitmq:
        transport:
            dsn: "amqp://guest:guest@rabbitmq:5672/%2F?connection_timeout=1000&heartbeat=100"
        client: ~
```

Be sure to replace the login credentials, host and port with your correct parameters in the connection string. And now we activate that transport and replace the default one of shopware. This can be done by editing/creating the file `framework.yaml`.

```yaml
# config/packages/framework.yaml
framework:
    messenger:
        transports:
            default:
                dsn: "enqueue://rabbitmq?queue[name]=shopware-queue"
```

Notice that `shopware-queue` is the name of the previously created queue in RabbitMQ. Also `rabbitmq` matches the name of the new transport in the previously created `enqueue.yaml`.

### Transport: Redis example

In the following I assume that Redis is installed and started. Since Shopware 6.4.9.0, the Redis transport is preinstalled. In previous versions this had to be installed using `composer require enqueue/redis`. If the Redis PHP extension is not installed, you also need to install Predis using `composer require predis/predis`. The only thing left is to tell Shopware about the new transport. Therefore, we edit/create the configuration file `enqueue.yaml` with the following content:

```yaml
# config/packages/enqueue.yaml
enqueue:
    redis:
        transport:
            # PHP Redis extension
            dsn: “redis+phpredis://host:port”
            # predis/predis composer package
            dsn: “redis+predis://host:port”
        client: ~
```

By default enqueue tries to use predis, if you want to force to use PhpRedis you have to use the scheme `redis+phpredis://host:port`.

Be sure to replace the host and port with your correct parameters in the connection string. And now we activate that transport and replace the default one of shopware. This can be done by editing/creating the file `framework.yaml`.

```yaml
# config/packages/framework.yaml
framework:
    messenger:
        transports:
            default:
                dsn: “enqueue://redis?queue[name]=messages”
```
