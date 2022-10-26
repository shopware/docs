# Shopware Session

Shopware, by default, uses the session storage configured in PHP. On most installations, this is the file system. So, in smaller setups, you will not need to take care of sessions.
For larger setups with a lot of traffic, or that are using clustering however, you will most probably want to configure alternative session storage such as Redis, in order to reduce the load on the database.

## Session Adapters

### Configure Redis using PHP.ini

As Shopware by default uses the settings configured in PHP, you can reconfigure the Session config directly in your `php.ini`. Here is an example to configure it directly in PHP.

```ini
session.save_handler = redis
session.save_path = "tcp://host:6379"
```

Please refer to the official [PhpRedis documentation](https://github.com/phpredis/phpredis#php-session-handler) for all possible options.

### Configure Redis using Shopware configuration

If you don't have access to the php.ini configuration, you can configure it directly in Shopware itself. For this create a `config/packages/redis.yml` file with the following content

```yaml
# config/packages/redis.yml
framework:
    session:
        handler_id: "redis://host:port"
```

### Other adapters

Symfony also provides PHP implementations of some adapters:

- [PdoSessionHandler](https://github.com/symfony/symfony/blob/5.4/src/Symfony/Component/HttpFoundation/Session/Storage/Handler/PdoSessionHandler.php)
- [MemcachedSessionHandler](https://github.com/symfony/symfony/blob/5.4/src/Symfony/Component/HttpFoundation/Session/Storage/Handler/MemcachedSessionHandler.php)
- [MongoDbSessionHandler](https://github.com/symfony/symfony/blob/5.4/src/Symfony/Component/HttpFoundation/Session/Storage/Handler/MongoDbSessionHandler.php)

To use one of these handlers, you need to create a new service in the dependency injection and set the `handler_id` to the service id.

Example service definition:

```xml
<service id="session.db" class="Symfony\Component\HttpFoundation\Session\Storage\Handler\PdoSessionHandler">
    <argument ....></argument>
</service>
```

Example session configuration:

```yaml
# config/packages/redis.yml
framework:
    session:
        handler_id: "session.db"
```
