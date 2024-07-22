---
nav:
  title: Performance Tweaks
  position: 70

---

# Performance Tweaks

Shopware is a platform for many different projects. It needs to handle a broad range of load characteristics and environments. It means that the default configuration is optimized for the best out-of-the-box experience. However, there are many opportunities to increase the performance by fitting the configuration to your needs.

## HTTP cache

To ensure a high RPS (Requests Per Second), Shopware offers an integrated HTTP cache with a possible reverse proxy configuration. Any system that handles high user numbers should always use HTTP caching to reduce server resources.

To enable this, set `SHOPWARE_HTTP_CACHE_ENABLED=1` in the `.env`

### Reverse proxy cache

When you have many app servers, you should consider using a [reverse proxy cache](../infrastructure/reverse-http-cache) like Varnish. Shopware offers a default configuration for Varnish out-of-the-box and a [Varnish Docker image](https://github.com/shopware/varnish-shopware) for development.

### Logged-in / cart-filled

By default, Shopware can no longer deliver complete pages from a cache for a logged-in customer or if products are in the shopping cart. As soon as this happens, the user sessions differ, and the context rules could be different depending on the user. This results in different content for each customer. A good example is the [Dynamic Access](https://docs.shopware.com/en/shopware-6-en/extensions/dynamiccontent) plugin.

However, if the project does not require such functionality, pages can also be cached by the HTTP cache/reverse proxy. To disable cache invalidation in these cases:

```yaml
# config/packages/prod/shopware.yaml
shopware:
    cache:
        invalidation:
            http_cache: []
```

### Delayed invalidation

A delay for cache invalidation can be activated for systems with a high update frequency for the inventory (products, categories). Once the instruction to delete the cache entries for a specific product or category occurs, they are not deleted instantly but processed by a background task later. Thus, if two processes invalidate the cache in quick succession, the timer for the invalidation of this cache entry will only reset.

```yaml
# config/packages/prod/shopware.yaml
shopware:
    cache:
        invalidation:
            delay: 0
            count: 150
```

## MySQL configuration

Shopware sets some MySQL configuration variables on each request to ensure it works in any environment. You can disable this behavior if you have correctly configured your MySQL server.

- Make sure that `group_concat_max_len` is by default higher or equal to `320000`
- Make sure that `sql_mode` doesn't contain `ONLY_FULL_GROUP_BY`
and then you can set `SQL_SET_DEFAULT_SESSION_VARIABLES=0` to your `.env` file

## SQL is faster than DAL

DAL(Data Abstraction Layer) has been designed suitably to provide developers with a flexible and extensible data management. However, features in such a system come at the cost of performance. Therefore, using DBAL (plain SQL) is much faster than using the DAL in many scenarios, especially when it comes to internal processes, where often only one ID of an entity is needed.

Refer to this article to know more on [when to use plain SQL and DAL](../../../resources/references/adr/2021-05-14-when-to-use-plain-sql-or-dal).

## Elasticsearch/Opensearch

Elasticsearch/Opensearch is a great tool to reduce the load of the MySQL server. Especially for systems with large product assortments, this is a must-have since MySQL simply does not cope well above a certain assortment size.

When using Elasticsearch, it is important to set the `SHOPWARE_ES_THROW_EXCEPTION=1` `.env` variable. This ensures that there is no fallback to the MySQL server if an error occurs when querying the data via Elasticsearch. In large projects, the failure of Elasticsearch leads to the MySQL server being completely overloaded otherwise.

Read more on [Elasticsearch setup](../infrastructure/elasticsearch/elasticsearch-setup)

## Prevent mail data updates

::: info
[Prevent mail updates](../../../resources/references/adr/2022-03-25-prevent-mail-updates.md) feature is available starting with Shopware 6.4.11.0.
:::

To provide auto-completion for different mail templates in the Administration UI, Shopware has a mechanism that writes an example mail into the database when sending the mail.

With the `shopware.mail.update_mail_variables_on_send` configuration, you can disable this source of database load:

```yaml
# config/packages/prod/shopware.yaml
shopware:
    mail:
        update_mail_variables_on_send: false
```

If you ever wonder why it is in `prod`, take a look into the [Symfony configuration environments](https://symfony.com/doc/current/configuration.html#configuration-environments).

## Increment storage

The [Increment storage](../performance/increment) is used to store the state and display it in the Administration.
This storage increments or decrements a given key in a transaction-safe way, which causes locks upon the storage. Therefore, we recommend moving this source of server load to a separate Redis:

```yaml
# config/packages/prod/shopware.yaml
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

If you don't need such functionality, it is highly recommended that you disable this behavior by using `array` as a type.

## Lock storage

Shopware uses [Symfony's Lock component](https://symfony.com/doc/5.4/lock.html) to implement locking functionality.
By default, Symfony will use a local file-based [lock store](../performance/lock-store), which breaks into multi-machine (cluster) setups. This is avoided using one of the [supported remote stores](https://symfony.com/doc/5.4/components/lock.html#available-stores).

```yaml
# config/packages/prod/framework.yaml
framework:
    lock: 'redis://host:port'
```

## Number ranges

[Number Ranges](../performance/number-ranges) provide a consistent way to generate a consecutive number sequence that is used for order numbers, invoice numbers, etc.
The generation of the number ranges is an **atomic** operation, which guarantees that the sequence is consecutive and no number is generated twice.

By default, the number range states are stored in the database.
In scenarios where high throughput is required (e.g., thousands of orders per minute), the database can become a performance bottleneck because of the requirement for atomicity.
Redis offers better support for atomic increments than the database. Therefore, the number ranges should be stored in Redis in such scenarios.

```yaml
# config/packages/prod/shopware.yaml
shopware:
  number_range:
    increment_storage: "Redis"
    redis_url: 'redis://host:port/dbindex'
```

## Sending mails with the Queue

Shopware sends the mails by default synchronously. This process can take a while when the remote SMTP server is struggling. For this purpose, it is possible to handle the mails in the message queue. To enable this, add the following config to your config:

```yaml
# config/packages/prod/framework.yaml
framework:
    mailer:
        message_bus: 'messenger.default_bus'
```

## PHP Config tweaks

```ini
; don't evaluate assert()
zend.assertions=-1

; cache file_exists,is_file
; WARNING: this will lead to thrown errors after clearing cache while it tries to access cached Shopware_Core_KernelProdDebugContainer.php
opcache.enable_file_override=1

; increase opcache string buffer as shopware has many files
opcache.interned_strings_buffer=20

; disables opcache validation for timestamp for reinvalidation of the cache
; WARNING: you need to clear on deployments the opcache by reloading php-fpm or cachetool (https://github.com/gordalina/cachetool)
opcache.validate_timestamps=0

; disable check for BOM
zend.detect_unicode=0

; increase default realpath cache
realpath_cache_ttl=3600
```

::: info
The web updater is not compatible with opcache, as updates require an opcache clear.
:::

Also, PHP PCRE Jit Target should be enabled. This can be checked using `php -i | grep 'PCRE JIT Target'` or looking into the *phpinfo* page.

For an additional 2-5% performance improvement, it is possible to provide a preload file to opcache. Preload also brings a lot of drawbacks:

- Each cache clear requires a PHP-FPM restart
- Each file change requires a PHP-FPM restart
- The Extension Manager does not work

The PHP configuration would look like:

```ini
opcache.preload=/var/www/html/var/cache/opcache-preload.php
opcache.preload_user=nginx
```

## Cache ID

The Shopware cache has a global cache ID to clear the cache faster and work in a cluster setup. This cache ID is saved in the database and will only be changed when the cache is cleared. This ensures that the new cache is used and the message queue can clean the old folder. If this functionality is not used, this cache ID can also be hardcoded `SHOPWARE_CACHE_ID=foo` in the `.env` to save one SQL query on each request.

## .env.local.php

[Symfony recommends](https://symfony.com/doc/current/configuration.html#configuring-environment-variables-in-production) that a `.env.local.php` file is used in Production instead of a `.env` file to skip parsing of the  .env file on every request.
If you are using a containerized environment, all those variables can also be set directly in the environment variables instead of dumping them into a file.

Since Shopware 6.4.15.0, you can dump the content of the `.env` file to a `.env.local.php` file by running `bin/console system:setup --dump-env` or `bin/console dotenv:dump {APP_ENV}`.

## Benchmarks

In addition to the benchmarks that Shopware regularly performs with the software, we strongly recommend integrating your benchmark tools and pipelines for larger systems. A generic benchmark of a product can rarely be adapted to individual, highly customized projects.
Tools such as [locust](https://locust.io/) or [k6](https://k6.io/) can be used for this purpose.

## Logging

Set the log level of the monolog to `error` to reduce the amount of logged events. Also, limiting the `buffer_size` of monolog prevents memory overflows for long-lived jobs:

```yaml
# config/packages/prod/monolog.yaml
monolog:
    handlers:
        main:
            level: error
            buffer_size: 30
        business_event_handler_buffer:
            level: error
```

The `business_event_handler_buffer` handler logs flow. Setting it to `error` will disable the logging of flow activities that succeed.

## Disable App URL external check

On any Administration load, Shopware tries to request itself to test that the configured `APP_URL` inside `.env` is correct.
If your `APP_URL` is correct, you can disable this behavior with an environment variable `APP_URL_CHECK_DISABLED=1`.

## Disable fine-grained caching

Shopware has a fine-grained caching system for system config, translation and theme config. This allows to clear only the relevant pages when a translation or theme config is changed. This is done by adding per config element a cache tag to the response. This behavior generates a lot of Redis keys or entries in Varnish. To save this overhead on config changes, it is possible to disable this behavior and clear the whole cache instead using the following config:

```yaml
# config/packages/shopware.yaml
shopware:
    cache:
        tagging:
            each_config: false
            each_snippet: false
            each_theme_config: false
```

## Using zstd instead of gzip for compression

Shopware uses `gzip` for compressing the cache elements and the cart when enabled. `gzip` saves a lot of storage, but it can be slow with huge values.

Since Shopware 6.6.4.0, it has been possible to use `zstd` as an alternative compression algorithm. `zstd` is faster than `gzip` and has a better compression ratio. Unfortunately, `zstd` is not included by default in PHP, so you need to install the extension first.


```yaml
# Enabling cart compression with zstd
shopware:
    cart:
      compress: true
      compression_method: zstd
```

::: danger
If you are changing the **cache** compression method, you need to clear the cache after changing the configuration.
:::

```yaml
# Enabling cache compression with zstd
shopware:
  cache:
    cache_compression_method: 'zstd'
```
