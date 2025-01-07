---
nav:
  title: Redis
  position: 45

---

# Redis

Starting with Shopware v6.6.8.0, Redis support has been improved, giving you more flexibility in how you use it in your projects and plugins.

## Accessing Redis connections

Once you've set up your Redis connections as explained in the  [Redis configuration](../../hosting/infrastructure/redis) guide, you can access them in your code using the following methods:

1. Inject `Shopware\Core\Framework\Adapter\Redis\RedisConnectionProvider` and retrieve connections by name:

    ```xml
    <service id="MyCustomService">
        <argument type="service" id="Shopware\Core\Framework\Adapter\Redis\RedisConnectionProvider" />
        <argument>%myservice.redis_connection_name%</argument>
    </service>
    ```

    ```php
    class MyCustomService
    { 
        public function __construct (
            private RedisConnectionProvider $redisConnectionProvider,
            string $connectionName,
        ) { }

        public function doSomething()
        {
            if ($this->redisConnectionProvider->hasConnection($this->connectionName)) {
                $connection = $this->redisConnectionProvider->getConnection($this->connectionName);
                // use connection
            }
        }
    }
    ```

2. Use `Shopware\Core\Framework\Adapter\Redis\RedisConnectionProvider` as factory to define custom services:

    ```xml
    <service id="my.custom.redis_connection" class="Redis">
        <factory service="Shopware\Core\Framework\Adapter\Redis\RedisConnectionProvider" method="getConnection" />
        <argument>%myservice.redis_connection_name%</argument>
    </service>

    <service id="MyCustomService">
        <argument type="service" id="my.custom.redis_connection" />
    </service>
    ```

    ```php
    class MyCustomService
    { 
        public function __construct (
            private object $redisConnection,
        ) { }

        public function doSomething()
        {
            // use connection
        }
    }
    ```

   This approach is especially useful when you want multiple services to share the same Redis connection.

3. Inject connection directly by name:

    ```xml
    <service id="MyCustomService">
        <argument type="service" id="shopware.redis.connection.connection_name" />
    </service>
    ```

   Be cautious with this approach! If you change the Redis connection names in your configuration, it will cause container build errors.

## Redis usage tips

### Connection types

Under the hood, connection service objects are created using the `\Symfony\Component\Cache\Adapter\RedisAdapter::createConnection` method.
Depending on the installed extensions/libraries and the provided DSN, this method may return instance of one of the following classes:
`\Redis|Relay|\RedisArray|\RedisCluster|\Predis\ClientInterface`

### Reusing connections

Connections are cached in a static variable and reused based on the provided DSN. If you use the same DSN for multiple connections, they will share the same connection object.
This means you need to be cautious when closing or modifying connection options, as it will affect all services using the same connection.

### Connection initialization

The moment actual connection is established depends on the usage model:

* When `RedisConnectionProvider::getConnection` is called.
* When the Redis connection service is requested from the container.
* When a service that depends on Redis connection is instantiated.

### Redis is optional

When developing a plugin, please keep in mind that Redis is an optional dependency in Shopware and might not be available in all installations.
