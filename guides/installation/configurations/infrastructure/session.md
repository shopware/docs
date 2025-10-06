---
nav:
  title: Session
  position: 30

---

# Shopware Session

Shopware, by default, uses the session storage configured in PHP. On most installations, this is the file system. In smaller setups, you will not need to take care of sessions. However, for larger setups using clustering or with a lot of traffic, you will probably configure alternative session storage, such as Redis, to reduce the load on the database.

## Session adapters

### Configure Redis using PHP.ini

By default, Shopware uses the settings configured in PHP. You can reconfigure the Session config directly in your `php.ini`. Here is an example of configuring it directly in PHP.

```ini
session.save_handler = redis
session.save_path = "tcp://host:6379?database=0"
```

Please refer to the official [PhpRedis documentation](https://github.com/phpredis/phpredis#php-session-handler) for all possible options.

### Configure Redis using Shopware configuration

If you don't have access to the php.ini configuration, you can configure it directly in Shopware itself. For this, create a `config/packages/redis.yml` file with the following content:

```yaml
# config/packages/redis.yml
framework:
    session:
        handler_id: "redis://host:port/0"
```

### Redis configuration

As the information stored here is durable and should be persistent, even in the case of a Redis restart, it is recommended to configure the used Redis instance that it will not just keep the data in memory, but also store it on the disk. This can be done by using snapshots (RDB) and Append Only Files (AOF), refer to the [Redis docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) for details.

As key eviction policy you should use `allkeys-lru`, which only automatically deletes the last recently used entries when Redis reaches max memory consumption. For a detailed overview of Redis key eviction policies see the [Redis docs](https://redis.io/docs/latest/develop/reference/eviction/).
