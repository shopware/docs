---
nav:
  title: Caching
  position: 20

---

# Caching

Caching is a technique to store frequently accessed data in a temporary storage layer for faster retrieval, reducing latency and improving performance by avoiding repeated and costly data retrieval operations

While caching enhances performance, it requires careful management of data consistency, cache invalidation strategies, and storage efficiency to prevent serving outdated or incorrect data.

This guide will show you how you can modify the default caching mechanisms to suite your needs. If you are looking for information on how to add your routes to the HTTP-Cache, take a look at [this guide](../../storefront/add-caching-to-custom-controller.md).

## Cache Layers

The current cache system of Shopware is based on a multi-layer system, in which the individual layers build on each other to improve performance and scalability.
There is the [HTTP-Cache](../../../../../concepts/framework/http_cache.md) on the outer level and then multiple smaller internal "Object Caches" that are used to cache data in the application.

For information on how to configure the different cache layers, please refer to the [caching hosting guide](../../../../hosting/performance/caches.md).

### HTTP-Cache

#### Modifying the cache keys

Every cached item has a unique key used to retrieve the cached data later on. For that, it is important that all the relevant information that affects the data that is being cached is part of the key.
For example, if the same data is cached in multiple languages or for multiple sales channels, the key must contain the language and sales channel information, so that the correct data can be retrieved later on.
Please note that for every potential value your key part can take, a new cache entry will be created. So if you have a key part that can take 10 different values, you will have 10 times the number of cache entries for the same data.

If you add customization to your projects that lead to different versions of the page being rendered, you need to make sure that the cache key is unique for each version of the page. This can be done by adding a specific part to the cache key that shopware is generating.
You can do so by subscribing to the `HttpCacheKeyEvent` event and add your specific part to the key.

```php
class CacheKeySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            HttpCacheKeyEvent::class => 'addKeyPart',
        ];
    }
    
    public function addKeyPart(HttpCacheKeyEvent $event): void
    {
        $request = $event->request;
        // Perform checks to determine the key
        $key = $this->determineKey($request);
        $event->add('myCustomKey', $key);
    }
}
```

:::info
The event is called on any Request; make sure that you don't use expensive operations like Database Queries.

Also, with an external reverse proxy, the cache key might be generated on the proxy and not in your application. In that case, you need to add the key part to the reverse proxy configuration.
:::

#### Adding cache tags

One problem with caching is that you not only need to retrieve the correct data, but also need to have a performant way to invalidate the cache when the data changes.
Only invalidating the caches based on the unique cache key is often not that helpful, because you don't know which cache keys are affected by the change of a specific data set.
Therefore, a tagging system is used alongside the cache keys to make cache invalidations easier and more performant. Every cache entry can be tagged with multiple tags, thus we can invalidate the cache based on the tags.
For example, all pages that contain product data are tagged with product ids of all products they contain. So if a product is changed, we can invalidate all cache entries that are tagged with the product id of the changed product.

To add your own cache tags to the HTTP-Cache, you need to dispatch the `AddCacheTagEvent` with the tag you want to add to the cache entry for the current request.

```php
class MyCustomEntityExtension
{
    public function __construct(
        private readonly EventDispatcherInterface $eventDispatcher,
    ) {}
    
    public function loadAdditionalData(): void
    {
        // Load the additional data you need, add it to the response, then add the correct tag to the cache entry
        $this->eventDispatcher->dispatch(
            new AddCacheTagEvent('my-custom-entity-' . $idOfTheLoadedData)
        );
    }
}
```

#### Invalidating the cache

Adding custom cache tags is only useful if you also use them to invalidate the cache when the data changed.
To invalidate the cache, you need to call the `CacheInvalidator` service and pass the tag you want to invalidate.

```php
class CacheInvalidationSubscriber implements EventSubscriberInterface
{
    public function __construct(private CacheInvalidator $cacheInvalidator) 
    {
    }
    
    public static function getSubscribedEvents()
    {
        return [
            // The EntityWrittenContainerEvent is a generic event always thrown when an entities are written. This contains all changed entities
            EntityWrittenContainerEvent::class => 'invalidate'
            ],
        ];
    }
    
    public function invalidate(EntityWrittenContainerEvent $event): void
    {
        // Check if own entity written. In some cases, you want to use the primary keys for further cache invalidation
        $changes = $event->getPrimaryKeys(ExampleDefinition::ENTITY_NAME);
        
        // No example entity changed? Then the cache does not need to be invalidated
        if (empty($changes)) {
            return;
        }

        foreach ($changes as $id) {
            // Invalidate the cache for the changed entity
            $this->cacheInvalidator->invalidate([
                'my-custom-entity-' . $id
            ]);
        }
    }
}
```

##### Overwrite default cache invalidation behaviour

The default tags that shopware adds to the HTTP-Cache are also invalidated automatically when the data changes. This is done by the `CacheInvalidationSubscriber` class, which listens to various events and invalidates the cache based on the tags that are added to the cache entries.
However, the subscriber adheres to an exact invalidation concept, where any data written to the product invalidates cache tags for that specific product, even if the data is not used in the corresponding pages. This might lead to cases where the cache is invalidated too often, and the invalidation can be tweaked to the project's needs. Moreover, due to project-specific variations, it is not feasible to generalize the process.
Therefore, all events it listens to are configured over the service configuration, so that all events, on which the subscriber listens to, can be manipulated via compiler passes.

:::code-group

```xml [PLUGIN_ROOT/src/Core/Framework/DependencyInjection/cache.xml]
<service id="Shopware\Core\Framework\Adapter\Cache\CacheInvalidationSubscriber">
    <tag name="kernel.event_listener" event="Shopware\Core\Content\Category\Event\CategoryIndexerEvent" method="invalidateCategoryRouteByCategoryIds" priority="2000" />

    <tag name="kernel.event_listener" event="Shopware\Core\Content\Category\Event\CategoryIndexerEvent" method="invalidateListingRouteByCategoryIds" priority="2001" />

    <tag name="kernel.event_listener" event="Shopware\Core\Content\LandingPage\Event\LandingPageIndexerEvent" method="invalidateIndexedLandingPages" priority="2000" />
    
    <!-- ... -->
</service>
```

:::

For example, if you want to disable all cache invalidations in a project, you can remove the `kernel.event_listener` tag of the service definition via compiler pass and implement your own cache invalidation.

```php
use Shopware\Core\Content\Product\Events\ProductIndexerEvent;
use Shopware\Core\Content\Product\Events\ProductNoLongerAvailableEvent;
use Shopware\Core\Framework\DependencyInjection\CompilerPass\RemoveEventListener;
use Shopware\Core\Framework\Adapter\Cache\CacheInvalidationSubscriber;

class TweakCacheInvalidation implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        $container
            ->getDefinition(CacheInvalidationSubscriber::class)
            ->clearTag('kernel.event_listener')
    }

}
```

However, suppose only certain parts of the cache invalidation are to be adjusted, finer adjustments to the class can be made using `Shopware\Core\Framework\DependencyInjection\CompilerPass\RemoveEventListener`, in which it is possible to define which event listeners of the service are to be removed.

```php
use Shopware\Core\Content\Product\Events\ProductIndexerEvent;
use Shopware\Core\Content\Product\Events\ProductNoLongerAvailableEvent;
use Shopware\Core\Framework\DependencyInjection\CompilerPass\RemoveEventListener;
use Shopware\Core\Framework\Adapter\Cache\CacheInvalidationSubscriber;

class TweakCacheInvalidation implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        RemoveEventListener::remove(
            $container,
            CacheInvalidationSubscriber::class,
            [
                [ProductIndexerEvent::class, 'invalidateListings'],
                [ProductNoLongerAvailableEvent::class, 'invalidateListings'],
            ]
        );
    }
} 
```

### Object Cache

The internal caches are built upon the [Symfony Cache](https://symfony.com/doc/current/components/cache.html) component and are used internally to cache data that is expensive to compute or retrieve.
As the object caches are handled internally, it should not be necessary to control them directly, therefore adding custom tags or manipulating the cache key is not supported for the various object caches.

#### Cache invalidation

However, you can still manually invalidate the object caches, via the same mechanism as you invalidate the HTTP-Cache, the `CacheInvalidator` service.

You can use the `CacheInvalidator` service to invalidate the object caches by passing the tag you want to invalidate.

```php
public function invalidateSystemConfigCache(): void
{
    $this->cacheInvalidator->invalidate([
        CachedSystemConfigLoader::CACHE_TAG
    ]);
}
```

## Delayed Invalidation

By default, the cache invalidation happens delayed (for both http and object caches). This means that the invalidation is not instant, but rather all the tags that should be invalidated are invalidated in a regular interval. For special cases where you need to immediately clear the cache take a look at the [force immediate invalidation](#force-immediate-invalidation) section.
This really benefits the performance of the system, as the invalidation is not done immediately, but rather in a batch process.
Additionally, it prevents cases where sometimes the caches are written and deleted more often than they are read, which only leads to overhead, more resource needs on the caching side and a bad cache-hit rate.

The invalidation of the delayed cache is done via the `shopware.invalidate_cache` task, that runs every 5 minutes (default setting). However, that run interval can be adjusted in the database.
If your caches don't seem to be invalidated at all, please ensure that the scheduled tasks are running correctly.

You can also manually invalidate the cache entries that are marked for delayed invalidation by running the `cache:clear:delayed` command or calling the `CacheInvalidator::invalidateExpired()` method from your plugin or send an API request to the `DELETE /api/_action/cache-delayed` endpoint.
For debug purposes you can also watch the tags that are marked for delayed invalidation by running the `cache:watch:delayed` command.

### Force immediate invalidation

Some changes require that the caches should be invalidated immediately and returning stale content is not acceptable.
In that case you can pass the `force=true` flag to the CacheInvalidator service, which will invalidate the cache immediately.

```php
public function invalidateSystemConfigCache(): void
{
    $this->cacheInvalidator->invalidate([
        CachedSystemConfigLoader::CACHE_TAG
    ], true);
}
```

If you sent an API request with critical information, where the cache should be invalidated immediately, you can set the `sw-force-cache-invalidate` header on your request.

```http
POST /api/product
sw-force-cache-invalidate: 1
```

## Manual cache clear

You can also manually clear the caches when you performed some actions that made a cache invalidation necessary, but where it was not triggered automatically.
To clear all caches, you can execute the `cache:clear:all` command, which clears the HTTP-Cache, the object caches as well as any other caches that are registered in the system.
The `cache:clear` command on the other hand will only clear the object caches, but won't invalidate the HTTP-Cache.
On the other hand, the `cache:clear:http` command will clear the complete HTTP-Cache, but won't invalidate the object caches.
