# Custom cache invalidation

The current cache system of Shopware is based on a multi-layer system, in which the individual layers build on each other and whose tags are passed on to the upper layer for later invalidation.

Thus, an HTTP cache entry for a product detail page is built with all cache tags that are loaded or set during the rendering of the page for the individual routes or other cache entries in the system.

These tags are determined by the Shopware core system when writing data via API and invalidated via the configured cache pool.

In the current state, almost all invalidations happen in class `Shopware\Core\Framework\Adapter\Cache\CacheInvalidationSubscriber`. This is an event listener which listens for various events in the system and determines the corresponding cache tags and sends them via `Shopware\Core\Framework\Adapter\Cache\CacheInvalidator` to the cache pool for invalidation.

However, currently, the subscriber adheres to a highly precise invalidation concept, where any data written to the product results in the invalidation of cache tags for that specific product, even if the data is not utilized in the corresponding pages. This approach is not ideal for Shopware, being a standard product, as it becomes challenging to determine precisely when and which cache entries should be deleted. Moreover, due to project-specific variations, it is not feasible to generalize the process.

Therefore, we have solved all configurations via the service definition of this subscriber, so that all events, on which the subscriber listens, can be manipulated via compiler passes.

{% code title="src/Core/Framework/DependencyInjection/cache.xml" %}

```xml
<service id="Shopware\Core\Framework\Adapter\Cache\CacheInvalidationSubscriber">
    <tag name="kernel.event_listener" event="Shopware\Core\Content\Category\Event\CategoryIndexerEvent" method="invalidateCategoryRouteByCategoryIds" priority="2000" />

    <tag name="kernel.event_listener" event="Shopware\Core\Content\Category\Event\CategoryIndexerEvent" method="invalidateListingRouteByCategoryIds" priority="2001" />

    <tag name="kernel.event_listener" event="Shopware\Core\Content\LandingPage\Event\LandingPageIndexerEvent" method="invalidateIndexedLandingPages" priority="2000" />
    
    <!-- ... -->
</service>
```

{% endcode %}

For example, if you want to disable all cache invalidation in a project, you can simply remove the `kernel.event_listener` tag of the service definition via compiler pass and implement your own cache invalidation.

```php
<?php

namespace MyProject;

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
<?php

namespace MyProject;

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
