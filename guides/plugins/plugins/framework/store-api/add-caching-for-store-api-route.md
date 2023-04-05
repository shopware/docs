# Add caching for Store API route

## Overview

In this guide you will learn how to add a cache layer to your custom Store API route. In this example, we will add a cache layer for the `ExampleRoute`, which is created in the [Add Store API route](./add-store-api-route.md) guide. For the cache invalidation we will write a invalidation subscriber.

## Prerequisites

In order to add a cache layer for the Store API route, you first need a Store API route as base. Therefore, you can refer to the [Add Store API route](./add-store-api-route.md) guide.

You also should have a look at our [Adding custom complex data](../data-handling/add-custom-complex-data.md) guide, since this guide is built upon it.

## Add cache layer

As you might have learned already from the [Add Store API route](./add-store-api-route.md) guide, we use abstract classes to make our routes more decoratable.

This concept is very advantageous if we now want to include a cache layer for the route. There are of course different ways to do this - but in this guide we show how we implemented it in the core.

### Add cached route class

First, we create an abstract class called `CachedExampleRoute` which extends the `AbstractExampleRoute`.

<Tabs>
<Tab title="CachedExampleRoute">

```php
// <plugin root>/src/Core/Content/Example/SalesChannel/CachedExampleRoute.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use OpenApi\Annotations as OA;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Adapter\Cache\CacheStateSubscriber;use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\Framework\Adapter\Cache\AbstractCacheTracer;
use Shopware\Core\Framework\Adapter\Cache\CacheCompressor;
use Shopware\Core\Framework\DataAbstractionLayer\Cache\EntityCacheKeyGenerator;
use Shopware\Core\Framework\Util\Json;
use Shopware\Core\Framework\Routing\Annotation\Entity;
use Shopware\Core\Framework\Routing\Annotation\Since;
use Symfony\Component\Cache\Adapter\TagAwareAdapterInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

/**
 * @Route(defaults={"_routeScope"={"store-api"}})
 */
class CachedExampleRoute extends AbstractExampleRoute
{
    private AbstractExampleRoute $decorated;

    private TagAwareAdapterInterface $cache;

    private EntityCacheKeyGenerator $generator;

    private AbstractCacheTracer $tracer;

    private array $states;

    private LoggerInterface $logger;

    public function __construct(
        AbstractExampleRoute $decorated,
        TagAwareAdapterInterface $cache,
        EntityCacheKeyGenerator $generator,
        AbstractCacheTracer $tracer,
        LoggerInterface $logger
    ) {
        $this->decorated = $decorated;
        $this->cache = $cache;
        $this->generator = $generator;
        $this->tracer = $tracer;
        
        // declares that this route can not be cached if the customer is logged in
        $this->states = [CacheStateSubscriber::STATE_LOGGED_IN];
        $this->logger = $logger;
    }
    
    public function getDecorated(): AbstractExampleRoute
    {
        return $this->decorated;
    }

    /**
     * @Entity("swag_example")
     * @Route("/store-api/example", name="store-api.example.search", methods={"GET", "POST"})
     */
    public function load(Criteria $criteria, SalesChannelContext $context): ExampleRouteResponse
    {
        // The context is provided with a state where the route cannot be cached
        if ($context->hasState(...$this->states)) {
            return $this->getDecorated()->load($criteria, $context);
        }

        // Fetch item from the cache pool
        $item = $this->cache->getItem(
            $this->generateKey($criteria, $context)
        );

        try {
            if ($item->isHit() && $item->get()) {
                // Use cache compressor to uncompress the cache value
                return CacheCompressor::uncompress($item);
            }
        } catch (\Throwable $e) {
            // Something went wrong when uncompress the cache item - we log the error and continue to overwrite the invalid cache item 
            $this->logger->error($e->getMessage());
        }

        $name = self::buildName();
        // start tracing of nested cache tags and system config keys
        $response = $this->tracer->trace($name, function () use ($criteria, $context) {
            return $this->getDecorated()->load($criteria, $context);
        });
        
        // compress cache content to reduce cache size
        $item = CacheCompressor::compress($item, $response);

        $item->tag(array_merge(
            // get traced tags and configs        
            $this->tracer->get(self::buildName()),
            [self::buildName()]
        ));

        $this->cache->save($item);

        return $response;
    }
    
    public static function buildName(): string 
    {
        return 'example-route';
    }
  
    private function generateKey(SalesChannelContext $context, Criteria $criteria): string
    {
        $parts = [
            self::buildName(),
            // generate a hash for the route criteria
            $this->generator->getCriteriaHash($criteria),
            // generate a hash for the current context 
            $this->generator->getSalesChannelContextHash($context),
        ];
          
        return md5(Json::encode($parts));
    }
}
```

</Tab>

<Tab title="services.xml">

```xml
// <plugin root>/src/Resources/config/services.xml

<?xml version="1.0" ?> 

<container xmlns="http://symfony.com/schema/dic/services" 
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    
    <services> 
        <service id="Swag\BasicExample\Core\Content\Example\SalesChannel\CachedExampleRoute" decorates="Swag\BasicExample\Core\Content\Example\SalesChannel\ExampleRoute" decoration-priority="-1000">
            <argument type="service" id="Swag\BasicExample\Core\Content\Example\SalesChannel\CachedExampleRoute.inner"/>
            <argument type="service" id="cache.object"/>
            <argument type="service" id="Shopware\Core\Framework\DataAbstractionLayer\Cache\EntityCacheKeyGenerator"/>
            <argument type="service" id="Shopware\Core\Framework\Adapter\Cache\CacheTracer"/>
            <argument type="service" id="logger" />
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

In the new `CachedExampleRoute` some core classes are used which simplify the caching.

* `TagAwareAdapterInterface` - Used to read, write and tag cache items.

* `EntityCacheKeyGenerator` - Used to generate hashes for the context and/or criteria;

* `AbstractCacheTracer` - Traces all system config keys that were accessed. The data is needed later for cache invalidation.

* `CacheCompressor` - Provides an optimal compression of the cache entries to use as little disk space as possible.

### Add cache invalidation

Cache invalidation is much harder to implement than the actual caching. Finding the right balance between too much and too little invalidation is difficult. Therefore, there is no precise guidance or documentation on when to invalidate what. What and how to invalidate depends on what has been cached. For example, the product routes in the core are always invalidated when the product is written, but also when the product is ordered and reaches the out-of-stock status. The entire cache invalidation in Shopware is controlled via events. On the one hand there is the entity written event and on the other hand the corresponding business events like `ProductNoLongerAvailableEvent`.

<Tabs>
<Tab title="CacheInvalidationSubscriber.php">

```php
// <plugin root>/src/Core/Content/Example/SalesChannel/CacheInvalidationSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenContainerEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Swag\BasicExample\Core\Content\Example\ExampleDefinition;
use Shopware\Core\Framework\Adapter\Cache\CacheInvalidator;

class CacheInvalidationSubscriber implements EventSubscriberInterface
{
    private CacheInvalidator $cacheInvalidator;

    public function __construct(CacheInvalidator $cacheInvalidator) 
    {
        $this->cacheInvalidator = $cacheInvalidator;
    }
    
    public static function getSubscribedEvents()
    {
        return [
            // The EntityWrittenContainerEvent is a generic event that is always thrown when an entities are written. This contains all changed entities
            EntityWrittenContainerEvent::class => [
                ['invalidate', 2001]
            ],
        ];
    }
    
    public function invalidate(EntityWrittenContainerEvent $event): void
    {
        // check if own entity written. In some cases you want to use the primary keys for further cache invalidation
        $changes = $event->getPrimaryKeys(ExampleDefinition::ENTITY_NAME);
        
        // no example entity changed? Then the cache does not need to be invalidated
        if (empty($changes)) {
            return;
        }

        $this->cacheInvalidator->invalidate([
            CachedExampleRoute::buildName()  
        ]);
    }
}
```

</Tab>

<Tab title="services.xml">

```xml
// <plugin root>/src/Resources/config/services.xml

<?xml version="1.0" ?> 

<container xmlns="http://symfony.com/schema/dic/services" 
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    
    <services> 
        <service id=" Swag\BasicExample\Core\Content\Example\SalesChannel\CacheInvalidationSubscriber">
            <argument type="service" id="Shopware\Core\Framework\Adapter\Cache\CacheInvalidator"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>
