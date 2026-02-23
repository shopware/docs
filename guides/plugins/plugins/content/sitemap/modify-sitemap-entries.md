---
nav:
  title: Modifying sitemap entries
  position: 20

---

# Modify Sitemap Entries

## Overview

You might have had a look at our guide about [adding custom sitemap entries](add-custom-sitemap-entries),
for example for a custom entity.
However, you might not want to add new URLs, but rather modify already existing ones.
This guide covers how to modify existing sitemap URLs (for example product URLs) in a plugin.

## Prerequisites

This guide is built upon the [Plugin base guide](../../plugin-base-guide), like most guides.

Knowing [service decoration](../../plugin-fundamentals/adjusting-service) and the sitemap URL provider system from
[adding custom sitemap entries](add-custom-sitemap-entries) will be helpful.

## Ways to modify sitemap entries

There are two common ways to modify existing sitemap entries.

1. Decorate a URL provider and adjust the returned `UrlResult`
2. Modify the provider query with `SitemapQueryEvent` (recommended when filtering by entity data)

### Decorate a URL provider and adjust the `UrlResult`

This approach is useful when you only need to adjust sitemap metadata (`priority`, `changefreq`, `lastmod`) or drop
entries by identifier.

Start by decorating the corresponding URL provider, for example
`Shopware\Core\Content\Sitemap\Provider\ProductUrlProvider`.

<Tabs>
<Tab title="DecoratedProductUrlProvider.php">

```php
// <plugin root>/src/Core/Content/Sitemap/Provider/DecoratedProductUrlProvider.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Sitemap\Provider;

use Shopware\Core\Content\Sitemap\Provider\AbstractUrlProvider;
use Shopware\Core\Content\Sitemap\Struct\Url;
use Shopware\Core\Content\Sitemap\Struct\UrlResult;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class DecoratedProductUrlProvider extends AbstractUrlProvider
{
    public function __construct(
        private readonly AbstractUrlProvider $inner
    ) {
    }

    public function getDecorated(): AbstractUrlProvider
    {
        return $this->inner;
    }

    public function getName(): string
    {
        return $this->inner->getName();
    }

    public function getUrls(SalesChannelContext $context, int $limit, ?int $offset = null): UrlResult
    {
        $urlResult = $this->inner->getUrls($context, $limit, $offset);
        $urls = [];

        foreach ($urlResult->getUrls() as $url) {
            \assert($url instanceof Url);

            // Example: drop one specific entry by its technical identifier.
            if ($url->getIdentifier() === 'd20e4d60e35e4afdb795c767eee08fec') {
                continue;
            }

            // Example: adjust metadata.
            $url->setPriority(0.7);
            $url->setChangefreq('daily');

            $urls[] = $url;
        }

        return new UrlResult($urls, $urlResult->getNextOffset());
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
        <service id="Swag\BasicExample\Core\Content\Sitemap\Provider\DecoratedProductUrlProvider"
                 decorates="Shopware\Core\Content\Sitemap\Provider\ProductUrlProvider">
            <argument type="service" id="Swag\BasicExample\Core\Content\Sitemap\Provider\DecoratedProductUrlProvider.inner" />
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

Downside of this approach:
You only have sitemap `Url` structs at this point.
If you need to filter by entity fields (for example product name, manufacturer, custom fields), this is usually too late.

### Modify the provider query via `SitemapQueryEvent` (recommended)

Core sitemap providers dispatch `SitemapQueryEvent` before executing their database query.
For products, the event contains the technical name `sitemap.query.product`.

This is the recommended extension point when you need to:

- filter entities before URLs are generated
- add SQL `JOIN`s for entity-based conditions
- keep your extension more update-compatible than copying provider internals

<Tabs>
<Tab title="ProductSitemapQuerySubscriber.php">

```php
// <plugin root>/src/Core/Content/Sitemap/ProductSitemapQuerySubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Sitemap;

use Shopware\Core\Content\Sitemap\Provider\ProductUrlProvider;
use Shopware\Core\Content\Sitemap\Event\SitemapQueryEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ProductSitemapQuerySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            SitemapQueryEvent::class => 'onProductSitemapQuery',
        ];
    }

    public function onProductSitemapQuery(SitemapQueryEvent $event): void
    {
        if ($event->getName() !== ProductUrlProvider::QUERY_EVENT_NAME) {
            return;
        }

        $query = $event->query;

        // Example: exclude products with product numbers starting with "TEST-".
        $query->andWhere('`product`.product_number NOT LIKE :blockedProductNumberPrefix');
        $query->setParameter('blockedProductNumberPrefix', 'TEST-%');
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
        <service id="Swag\BasicExample\Core\Content\Sitemap\ProductSitemapQuerySubscriber">
            <tag name="kernel.event_subscriber" />
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

## Important note about `getSeoUrls`

`getSeoUrls` is a protected method on `AbstractUrlProvider`.
If you only decorate a provider and forward `getUrls()` to the inner service, overriding `getSeoUrls` in your decorator
has no effect.

If you really need to change SEO URL lookup internals, you have to implement the provider logic in your own service.
This is possible, but less update-compatible because you copy core internals.

## Related configuration options

Depending on your use case, configuration might already solve your requirement:

- [Remove sitemap entries](remove-sitemap-entries) via `shopware.sitemap.excluded_urls`
- product visibility behavior in core via `core.sitemap.excludeLinkedProducts`
