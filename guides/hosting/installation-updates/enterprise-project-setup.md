# Enterprise project setup

The setup of enterprise systems differs from a normal installation of Shopware. Most enterprise systems are a completely customized store with individual templates and extensions to make the store work the way it should.

This guide is meant to serve as a suffering guide for all those who do not have any experience in this area yet.

## Production template
We start with the [production](composer.md#shopware-6-production-template) template. We recommend this repository for use on production systems. A fork should be made of the template, in which the desired Shopware repositories (core, storefront, admin, elastic, etc) are then pinned to the desired version.

By pinning the versions, it is prevented that unwanted updates are imported into the system when deploying.

## Sources
The following folders are available in the production template:
- **/src**: Here the project specific bundles and sources can be stored.
- **/config**: Here are the .yaml config files as well as other possible configurations (routing, admin configs, etc).
- **/tests**: Here you can store the tests for the project specific sources.
- **/config/bundles.php**: In this file all Symfonfy bundles are defined, which should be included in the project.

## Third party sources
Most enterprise projects are projects in which the development team is responsible for the stability and performance of the system. The integration of external sources via apps or plugins is of course not forbidden, but should always be viewed with a critical eye. By including those sources, the development team partially relinquishes control over the system. If some plugins are necessary, we recommend not to include them as a installable and uninstallable plugin, but as a package through composer.

### Disable extensions
For requests, the entire handling of the app and plugin system, via the database, should be deactivated via the configuration `DISABLE_EXTENSIONS` for request handling PHP processes like php-fpm. If this environment variable is activated, the plugin list is acquired from the required composer dependencies. This hands over the control over active plugin list to be regulated via the project deployment.  Third party sources can rely on [plugin lifecycle events](https://developer.shopware.com/docs/guides/plugins/plugins/plugin-fundamentals/plugin-lifecycle), so running commands like `bin/console plugin:install --activate SwagExample` or `bin/console plugin:update SwagExample` needs to be integrated into the deployment without the `DISABLE_EXTENSIONS` flag. In the future it will be no longer possible to obtain plug-ins via the built-in Extension Store, or to deactivate or uninstall them via a UI or database.

## Shopware updates + security
To update an enterprise project, we always recommend using a staging environment. However, updates for a project should only be obtained if there are critical problems with the system or if essential features have been provided by Shopware. The update of a system is always associated with effort and usually possible errors are found only during deployment in the production system

### Security plugin
For obtaining security fixes we always recommend our customers to use our [Security Plugin](https://store.shopware.com/swag136939272659f/shopware-6-sicherheits-plugin.html). This is compatible with all Shopware versions and corresponding hot fixes are only included in versions that are affected.

### Disable auto update
Shopware has an integrated auto update functionality, this should be disabled to prevent unwanted updates. Also, this feature is not multi app server compatible and should be controlled via deployment.
```yaml
shopware:
    auto_update:
        enabled: false
```

## Message queue
Enterprise projects are mostly self-hosted systems. On a productive system, the message queue should be processed via the CLI instead of the browser in the administration ([Admin worker](../infrastructure/message-queue.md#admin-worker)). This way, tasks are also completed when no one is logged into the administration and high CPU load due to multiple users in the admin is also avoided. Furthermore you can change the transport to another system like [RabbitMQ](https://www.rabbitmq.com/) for example.

It's recommended to run multiple `messenger:consume`-workers. To automatically start the processes again after they stopped because of exceeding the given limits you can use a process control system like [systemd](https://www.freedesktop.org/wiki/Software/systemd/) or [supervisor](http://supervisord.org/running.html).

[Read more](../infrastructure/message-queue.md)

### Own queue

It is also recommended defining your own message queue in addition to the standard message queue. This gives you more control over the load distribution and allows you to prioritize your own processes higher than the data indexing of Shopware.

## Monolog

To prevent the logs on the system from filling up, the log level for Monolog should be set to `error`. Furthermore, it is important to limit the `buffer_size` of Monolog, otherwise the memory will overflow for long-lived jobs:

```yaml
monolog:
    handlers:
        main:
            level: error  
            buffer_size: 30
        business_event_handler_buffer:
            level: error
```

## Monitoring

Likewise, we recommend setting up an appropriate monitoring dashboard. Well-known software such as:

- [Blackfire](https://www.blackfire.io/)
- [Tideways](https://tideways.com/)
- [Datadog](https://www.datadoghq.com/)
- [Elastic](https://www.elastic.co/)

## Local machines

It is recommended to always adapt the local development environments of the developers as close as possible to the live environments. A local development environment without Redis or Elasticsearch is always too far away from reality and can only lead to complications after deployment. Therefore, it is always advisable to maintain internal documentation on how to deploy, the server structure and how to set up local machines.

## Theme compiling

The theme compilation in Shopware depends by default on the settings in the database. However, since a connection to the database is usually not guaranteed during deployment, we recommend configuring static theme compilation

[Read more](deployments/build-w-o-db.md#compiling-the-storefront-without-database)

## Performance Tweaks
When setting up enterprise projects, there are some settings and conditions that should be taken into account with regard to performance

### Strong CPU
For the server setup, it is recommended to choose machines with the most powerful CPU possible. This applies to all servers (app, sql, elastic, redis). Often it is more optimal to choose a slightly stronger CPU instead of many smaller weaker ones. But this has to be determined more precisely depending on the project and load. Experience has shown so far that systems with strong CPUs get the processes processed faster and can therefore release the resources faster.

### Redis
It is also recommended configuring different Redis servers. We recommend setting up at least four Redis servers for the following resources:
- Session + cart - [Read more](../performance/session.md)
- cache.object - [Read more](../performance/caches.md#example-replace-some-cache-with-redis)
- Enqueue - [Read more](../infrastructure/message-queue.md#transport-redis-example)
- Lock + Increment storage - [Read more](../performance/increment.md)

Instead of setting up a Redis server for `enqueue`, you can also work directly with [RabbitMQ](../infrastructure/message-queue.md#transport-rabbitmq-example)

### Filesystem
In a multi-app server system, it is always recommended to run certain directories over a shared filesystem. This includes assets as well as theme files and private and public filesystems.

[Read more](../infrastructure/filesystem.md)

### HTTP Cache
To ensure a high RPS (requests per second), Shopware offers an integrated HTTP cache with a possible reverse proxy configuration. Any system that handles high user numbers should always use such technology to reduce server resources.

[Read more](../infrastructure/reverse-http-cache.md)

#### logged-in / cart-filled
By default, shopware can no longer deliver complete pages from a cache once the customer is logged in or there are products in the shopping cart. As soon as this is the case, the user sessions differ and the context rules could be different depending on the user. This can result in different content for each customer, a good example is the plugin [Dynamic Access](https://store.shopware.com/swag140583558965t/dynamic-access.html).

However, if such functionality is not used in the project, such pages can also be cached by the HTTP cache/reverse proxy. This would once again significantly reduce the load for the system. Invalidation can be easily disabled via a configuration:
```
shopware:
    cache:
        invalidation:
            http_cache: []
```

#### Delayed invalidation
For systems that have a high update frequency for the inventory (products, categories), it is recommended to activate a delay for the cache invalidation. If the instruction, to delete the cache entries for a specific product or category, occurs in the code, the cache is not deleted directly, but processed via a background task afterwards. However, if another process also tries to invalidate one of the cache entries of the first process, there will be no overlap but the timer for the invalidation of this cache entry will only be reset.

```yaml
shopware:
    cache:
        invalidation:
            delay: 0
            count: 150
```

### MySQL instead of MariaDB
In some places in the code we use JSON fields. As soon as it comes to filtering, sorting or aggregating JSON fields, MySQL is quite a bit ahead of the MariaDB fork. Therefore, we definitely recommend the use of MySQL.

### SQL is faster than DAL
The DAL (Data Abstraction Layer) was designed to provide developers a flexible and extensible data management. However, features in such a system are always integrated at the cost of performance. Therefore, using DBAL (plain SQL) is much faster than using the DAL in many scenarios. Especially when it comes to internal processes, where often only one ID of an entity is needed.

[Read more](https://github.com/shopware/platform/blob/trunk/adr/2021-05-14-when-to-use-plain-sql-or-dal.md)

### Elasticsearch
Elasticsearch is a great tool to reduce the load of MySQL. Especially for systems with large product assortments this is a must-have, since MySQL simply does not scale anymore above a certain assortment size.

When using Elasticsearch, it is important to set the `SHOPWARE_ES_THROW_EXCEPTION=1` `.env` variable. This ensures that if an error occurs when querying the data via Elasticsearch, there is no fallback to the MySQL server. In most larger projects this leads to the MySQL server being completely overloaded.

[Read more](../infrastructure/elasticsearch/elasticsearch-setup.md)

### Prevent mail data updates
In order to guarantee an autocompletion for the different mail templates in the administration UI, we currently have a mechanism, which writes an example mail into the database when sending the mail.

With the `shopware.mail.update_mail_variables_on_send` configuration, you can disable this database load:

```yaml
shopware:
    mail:
        update_mail_variables_on_send: false
```

[Read more](https://github.com/shopware/platform/blob/trunk/adr/2022-03-25-prevent-mail-updates.md)

### Increment storage
The increment storage is used to store state and display it in the Administration. This can include
This storage increments or decrements a given key in a transaction-safe way, which causes locks upon the storage. Therefore, we recommend moving this load to a separate Redis:
```yaml
shopware:
    increment:
        user_activity:
          type: 'redis'
          config:
            url: 'redis://host:port/dbindex'

        message_queue:
          type: 'redis'
          config:
            url: 'redis://host:port/dbindex'
```

[Read more](../performance/increment.md)

### Lock storage
Shopware uses [Symfony's Lock component](https://symfony.com/doc/5.4/lock.html) to implement locking functionality.
By default, Symfony will use a local lock store, this means in multi-machine (cluster) setups naive file locks will break the system, therefore it is highly recommended using one of the [supported remote stores](https://symfony.com/doc/5.4/components/lock.html#available-stores).

```
framework:
    lock: 'redis://host:port'
```

[Read more](../performance/lock-store.md)

### Benchmarks
In addition to the benchmarks that Shopware regularly performs with the software, we strongly recommend integrating your own benchmark tools and pipelines for larger systems. A generic benchmark of a product can rarely be adapted to individual, highly customized projects.
Tools such as [locust](https://locust.io/) or [k6](https://k6.io/) can be used for this purpose.
