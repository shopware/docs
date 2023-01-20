# Modify Sitemap Entries

## Overview

You might have had a look at our guide about [adding custom sitemap entries](add-custom-sitemap-entries),
e.g. for a custom entity.
However, you might not want to add new URLs, but rather modify already existing ones.
This guide will cover modifying e.g. the product URLs for the sitemap.

## Prerequisites

This guide is built upon the [Plugin base guide](../../plugin-base-guide), like most guides.

Modifying the sitemap entries is done via decoration, so should know how that's done as well.
Also, knowing how the URL providers work, like it's explained in our guide about [adding custom sitemap entries](add-custom-sitemap-entries),
will come in handy.

## Modifying the sitemap

There's two ways of actually modifying the sitemap entries, but both ways are done by decorating
the respective `UrlProvider`, e.g. the `Shopware\Core\Content\Sitemap\Provider\ProductUrlProvider` for products.

Hence, let's start with creating the basic decorated class for the `ProductUrlProvider`. We'll call
this class `DecoratedProductUrlProvider`:

<Tabs>
<Tab title="DecoratedProductUrlProvider.php">

```php
// <plugin root>/src/Core/Content/Sitemap/Provider/DecoratedProductUrlProvider.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Sitemap\Provider;

use Doctrine\DBAL\Connection;
use Shopware\Core\Content\Sitemap\Provider\AbstractUrlProvider;
use Shopware\Core\Content\Sitemap\Struct\UrlResult;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class DecoratedProductUrlProvider extends AbstractUrlProvider
{
    private AbstractUrlProvider $decoratedUrlProvider;

    public function __construct(AbstractUrlProvider $abstractUrlProvider)
    {
        $this->decoratedUrlProvider = $abstractUrlProvider;
    }

    public function getDecorated(): AbstractUrlProvider
    {
        return $this->decoratedUrlProvider;
    }

    public function getName(): string
    {
        return $this->getDecorated()->getName();
    }

    public function getUrls(SalesChannelContext $context, int $limit, ?int $offset = null): UrlResult
    {
        return $this->getDecorated()->getUrls($context, $limit, $offset);
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
        <service id="Swag\BasicExample\Core\Content\Sitemap\Provider\DecoratedProductUrlProvider" decorates="Shopware\Core\Content\Sitemap\Provider\ProductUrlProvider">
            <argument type="service" id="Swag\BasicExample\Core\Content\Sitemap\Provider\DecoratedProductUrlProvider.inner" />
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

Now let's get on to the two possible ways and its benefits.

### Adjusting the getUrls method

By adjusting the `getUrls` method, you can execute the parent's `getUrls` method and modify its return value, which
is an instance of the `UrlResult`.
On this instance, you can use the method `getUrls` to actually get the `Url` instances and make adjustments to them - or even remove them.

```php
// <plugin root>/src/Core/Content/Sitemap/Provider/DecoratedProductUrlProvider.php
public function getUrls(SalesChannelContext $context, int $limit, ?int $offset = null): UrlResult
{
    $urlResult = $this->getDecorated()->getUrls($context, $limit, $offset);
    $urls = $urlResult->getUrls();

    /* Change $urls, e.g. removing entries or updating them by iterating over them. */

    return new UrlResult($urls, $urlResult->getNextOffset());
}
```

You could iterate over the `$urls` array and modify each entry - or even create a new array with less entries,
if you want to fully remove some.

There is one main downside to this way:
You don't have access to a lot of information about the entity itself, that was used for this `Url` instance.
E.g. if you'd like to filter all products with a given name, you can't do that here, since the name itself isn't available.
The only reliable information you have here, is the ID of the entity by using the method `getIdentifier` on the `Url` instance.

Also, it's not the best way in terms of performance to read all SEO URLs from the database, only to filter them afterwards.

### Overriding the getSeoUrls method

The available SEO URLs are read in the protected method `getSeoUrls` of the `AbstractUrlProvider`.
Since it's a protected method, you can override it and create a custom SQL in order to only read the data you really want.

For this you'll most likely want to copy the original method's code and paste it into your overridden method.
You can then add new lines to the SQL statement in order to do the necessary filtering or customising.

```php
// <plugin root>/src/Core/Content/Sitemap/Provider/DecoratedProductUrlProvider.php
protected function getSeoUrls(array $ids, string $routeName, SalesChannelContext $context, Connection $connection): array
{
    /* Make adjustments to this SQL */
    $sql = 'SELECT LOWER(HEX(foreign_key)) as foreign_key, seo_path_info
                FROM seo_url WHERE foreign_key IN (:ids)
                 AND `seo_url`.`route_name` =:routeName
                 AND `seo_url`.`is_canonical` = 1
                 AND `seo_url`.`is_deleted` = 0
                 AND `seo_url`.`language_id` =:languageId
                 AND (`seo_url`.`sales_channel_id` =:salesChannelId OR seo_url.sales_channel_id IS NULL)';

    return $connection->fetchAll(
        $sql,
        [
            'routeName' => $routeName,
            'languageId' => Uuid::fromHexToBytes($context->getSalesChannel()->getLanguageId()),
            'salesChannelId' => Uuid::fromHexToBytes($context->getSalesChannelId()),
            'ids' => Uuid::fromHexToBytesList(array_values($ids)),
        ],
        [
            'ids' => Connection::PARAM_STR_ARRAY,
        ]
    );
}
```

Now you could adjust the SQL statement to fit your needs, e.g. by adding a `JOIN` to the respective entities' table.

However, there is a downside here as well:
Overriding the method like this is not really update-compatible. If the original method is changed in a future
update, those changes will not apply for your modification, hence you might not receive a performance update or a bugfix
for those few lines of code.
