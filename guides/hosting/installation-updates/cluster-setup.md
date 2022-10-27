# Cluster setup

The setup of high-scaling systems differs from a normal installation of Shopware. They are completely customized stores with individual templates and extensions.

This guide contains information for everyone who intends to start with such a project.

## Production template

We start with the [production](composer.md#shopware-6-production-template) template. We recommend this repository for use on production systems. A fork should be made of the template, in which the desired Shopware repositories (core, storefront, admin, elastic, etc) are then pinned to the desired version.

Pinning the versions prevents unwanted updates when deploying.

## Sources

The following folders are available in the production template:

- **/src**: Here the project specific bundles and sources can be stored.
- **/config**: Here are the .yaml config files as well as other possible configurations (routing, admin configs, etc).
- **/tests**: Here you can store the tests for the project specific sources.
- **/config/bundles.php**: In this file all Symfonfy bundles are defined, which should be included in the project.

## Third party sources

Most big-scale projects have a development team assigned. It's responsible for the stability and performance of the system. The integration of external sources via apps or plugins can be usefull, but should always be viewed with a critical eye. By including those sources, the development team relinquishes control over parts of the system. We recommend including necessary plugins as composer packages, instead of user managed plugins.

### Disable extensions

For requests, the entire handling of the app and plugin system, via the database, should be deactivated via the configuration `DISABLE_EXTENSIONS` for request handling PHP processes like php-fpm. If this environment variable is activated, the plugin list is acquired from the required composer dependencies. This hands over the control over active plugin list to be regulated via the project deployment.  Third party sources can rely on [plugin lifecycle events](https://developer.shopware.com/docs/guides/plugins/plugins/plugin-fundamentals/plugin-lifecycle), so running commands like `bin/console plugin:install --activate SwagExample` or `bin/console plugin:update SwagExample` needs to be integrated into the deployment without the `DISABLE_EXTENSIONS` flag. In the future it will be no longer possible to obtain plug-ins via the built-in Extension Store, or to deactivate or uninstall them via a UI or database.

## Redis

We recommend setting up at least five Redis servers for the following resources:

1. Session ([Read more](../performance/session)) + cart ([Read more](../infrastructure/database-cluster.md#cart-in-redis))
1. cache.object - [Read more](../performance/caches.md#example-replace-some-cache-with-redis)
1. Lock ([Read more](../performance/lock-store)) + Increment storage ([Read more](../performance/increment))
1. Number Ranges - [Read more](../performance/number-ranges)
1. Enqueue - [Read more](../infrastructure/message-queue.md#transport-redis-example)  
   Instead of setting up a Redis server for `enqueue`, you can also work directly with [RabbitMQ](../infrastructure/message-queue.md#transport-rabbitmq-example)

The PHP Redis extension provides persistent Redis connections. Persistent connections can help in high load scenarios as each request doesn't have to open and close connections. Using non-persistent Redis connections can also hit the system's maximum of open sockets. Because of these limitations, the Redis extension is preferred over Predis.

When a Redis cluster is in usage, the `php.ini` setting `redis.clusters.cache_slots=1` should be set to skip the cluster node lookup on each connection

## Database Cluster

We have compiled some best practices and configurations that will allow you to operate Shopware in a clustered database environment. Please refer to the guide below.

<PageRef page="../infrastructure/database-cluster" title="<<<title-missing>>>" />

## Filesystem

In a multi-app-server system, manage specific directories over a shared filesystem. This includes assets as well as theme files and private and public filesystems. The recommendation is to use a S3 compatible bucket.

[Read more](../infrastructure/filesystem)

### Shared directories

Besides the S3 bucket, it is also necessary to create certain directories for the app servers as shared filesystem.

[Read more](./composer.md#storage-and-caches)

## Shopware updates + security

To update your project, we always recommend using a staging environment. However, updates for a project should only be obtained if there are critical problems with the system or if essential features have been provided by Shopware.
Updates of such systems requires a certain amount of effort, as issues often arise during deployments to production systems.

### Security plugin

For obtaining security fixes, without version upgrades, we provide a dedicated [Security Plugin](https://store.shopware.com/swag136939272659f/shopware-6-sicherheits-plugin.html). This is compatible with all Shopware versions and corresponding hot fixes are only included in versions that are affected.

### Disable auto update

Shopware's integrated auto update functionality should be disabled to prevent unwanted updates. Also, this feature is not multi app server compatible and should be controlled via deployment.

```yaml
shopware:
    auto_update:
        enabled: false
```

## Message queue

On a productive system, the message queue should be processed via CLI processes instead of the ([Admin worker](../infrastructure/message-queue.md#admin-worker)). This way, messages are completed regardless of logged-in administration users and CPU load due to messages can be regulated through the amount of worker processes. Furthermore, you can change the transport to another system like [RabbitMQ](https://www.rabbitmq.com/) for example.

It's recommended to run multiple `messenger:consume`-workers. To automatically start the processes again after they stopped because of exceeding the given limits you can use a process control system like [systemd](https://www.freedesktop.org/wiki/Software/systemd/) or [supervisor](http://supervisord.org/running.html).

[Read more](../infrastructure/message-queue)

### Own queue

It is also recommended defining your own message queue in addition to the standard message queue. This gives you more control over the load distribution and allows you to prioritize your own processes higher than the data indexing of Shopware.

## Monitoring

Likewise, we recommend setting up an appropriate monitoring dashboard with well-known software such as:

- [Blackfire](https://www.blackfire.io/)
- [Tideways](https://tideways.com/)
- [Datadog](https://www.datadoghq.com/)
- [Elastic](https://www.elastic.co/)

## Local machines

It is important to keep the local development environments of the developers similar to the live environments. A development environment without Redis or Elasticsearch is always too far away from reality and often leads to complications after deployment. Therefore, it is advisable to maintain internal documentation on how to deploy the server structure and how to set up local machines.

## Theme compiling

The theme compilation in Shopware by default depends on the settings in the database. However, since a connection to the database is usually not guaranteed during deployment, we recommend configuring static theme compilation

[Read more](deployments/build-w-o-db.md#compiling-the-storefront-without-database)

## Strong CPU

For the server setup, pay special attention to the speed of the CPU. This applies to all servers (app, SQL, Elasticsearch, Redis). Usually, it is more optimal to choose a slightly stronger CPU instead of many weaker ones. But this has to be determined more precisely depending on the project and load. Experience has shown so far that systems with powerful CPUs finish processes faster and can therefore release the resources sooner.

## Performance Tweaks

When setting up big scale projects, there are some settings and conditions that should be taken into account with regard to performance

[Read more](../performance/performance-tweaks)
