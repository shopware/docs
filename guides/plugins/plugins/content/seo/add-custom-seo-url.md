---
nav:
  title: Add custom SEO URLs
  position: 10

---

# Add custom SEO URLs

## Overview

Every good website had to deal with it at some point: SEO URLs. Of course Shopware supports the usage of SEO URLs, e.g. for products or categories.

This guide however will cover the question on how you can define your own SEO URLs, e.g. for your own custom entities. This will include both static SEO URLs, as well as dynamic SEO URLs.

## Prerequisites

As every almost every guide in the plugins section, this guide as well is built upon the plugin base guide.

<PageRef page="../../plugin-base-guide" />

Furthermore, we're going to use a [Custom storefront controller](../../storefront/add-custom-controller) for the static SEO URL example, as well as [Custom entities](../../framework/data-handling/add-custom-complex-data) for the dynamic SEO URLs. Make sure you know and understand those two as well before diving deeper into this guide. Those come with two different solutions:

* Using [plugin migrations](../../plugin-fundamentals/database-migrations) for static SEO URLs
* Using [DAL events](../../framework/data-handling/using-database-events) to react on entity changes and therefore generating a dynamic SEO URL

## Custom SEO URLs

As already mentioned in the overview, this guide will be divided into two parts: Static and dynamic SEO URLs.

### Static SEO URLs

A static SEO URL doesn't have to change every now and then. Imagine a custom controller, which is accessible via the link `yourShop.com/example`.

Now if you want this URL to be translatable, you'll have to add a custom SEO URL to your controller route, so it is accessible using both `Example-Page` in English, as well as e.g. `Beispiel-Seite` in German.

#### Example controller

For this example, the controller from the [Add custom controller guide](../../storefront/add-custom-controller) is being used. It creates a controller with a route like the example mentioned above: `/example`

Let's now have a look at our example controller:

```php
// <plugin root>/src/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
 */
class ExampleController extends StorefrontController
{
    /**
    * @Route("/example", name="frontend.example.example", methods={"GET"})
    */
    public function showExample(): Response
    {
        return $this->renderStorefront('@SwagBasicExample/storefront/page/example/index.html.twig', [
            'example' => 'Hello world'
        ]);
    }
}
```

The important information you'll need here is the route name, `frontend.example.example`, as well as the route itself: `/example`. Make sure to remember those for the next step.

#### Example migration

Creating a SEO URL in this scenario can be achieved by creating a [plugin migration](../../plugin-fundamentals/database-migrations).

The migration has to insert an entry for each sales channel and language into the `seo_url` table. For this case, we're making use of the `ImportTranslationsTrait`, which comes with a helper method `importTranslation`.

Don't be confused here, we'll just treat the `seo_url` table like a translation table, since it also needs a `language_id` and respective translated SEO URLs. You'll have to pass a German and an English array into an instance of the `Translations` class, which is then the second parameter for the `importTranslation` method.

Let's have a look at an example:

```php
// <plugin root>/src/Migration/Migration1619094740AddStaticSeoUrl.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\Migration\Traits\ImportTranslationsTrait;
use Shopware\Core\Migration\Traits\Translations;

class Migration1619094740AddStaticSeoUrl extends MigrationStep
{
    use ImportTranslationsTrait;

    public function getCreationTimestamp(): int
    {
        return 1619094740;
    }

    public function update(Connection $connection): void
    {
        $this->importTranslation('seo_url', new Translations(
            // German array
            array_merge($this->getSeoMetaArray($connection), ['seo_path_info' => 'Beispiel-Seite']),
            // English array
            array_merge($this->getSeoMetaArray($connection), ['seo_path_info' => 'Example-Page']),

        ), $connection);
    }

    public function updateDestructive(Connection $connection): void
    {
    }

    private function getSeoMetaArray(Connection $connection): array
    {
        return [
            'id' => Uuid::randomBytes(),
            'sales_channel_id' => $this->getStorefrontSalesChannelId($connection),
            'foreign_key' => Uuid::randomBytes(),
            'route_name' => 'frontend.example.example',
            'path_info' => '/example',
            'is_canonical' => 1,
            'is_modified' => 0,
            'is_deleted' => 0,
        ];
    }

    private function getStorefrontSalesChannelId(Connection $connection): ?string
    {
        $sql = <<<SQL
            SELECT id
            FROM sales_channel
            WHERE type_id = :typeId
SQL;
        $salesChannelId = $connection->fetchOne($sql, [
            ':typeId' => Uuid::fromHexToBytes(Defaults::SALES_CHANNEL_TYPE_STOREFRONT)
        ]);

        if (!$salesChannelId) {
            return null;
        }

        return $salesChannelId;
    }
}
```

You might want to have a look at the `getSeoMetaArray` method, that we implemented here. Most important for you are the columns `route_name` and `path_info` here, which represent the values you've defined in your controller's route annotation.

By using the default PHP method `array_merge`, we're then also adding our translated SEO URL to the column `seo_path_info`.

And that's it! After installing our plugin, you should now be able to access your controller's route with the given SEO URLs.

::: info
You can only access the German SEO URL if you've configured a German domain in your respective sales channel first.
:::

### Dynamic SEO URLs

Dynamic SEO URLs are URLs, that have to change every now and then. Yet, there's another separation necessary.

If you're going to generate custom SEO URLs for your custom entities, you'll have to follow the section about [Dynamic SEO URLs for entities](add-custom-seo-url#dynamic-seo-urls-for-entities). For all other kinds of dynamic content, that are not DAL entities, the section about [Dynamic SEO URLs for other content](add-custom-seo-url#dynamic-seo-urls-for-custom-content) is your way to go.

#### Dynamic SEO URLs for entities

This scenario will be about a custom entity, to be specific we're going to use the entity from our guide about [adding custom complex data](../../framework/data-handling/add-custom-complex-data), which then would have a custom Storefront route for each entity.

Each entity comes with a name, which eventually should be the SEO URL. Thus, your entity named `Foo` should be accessible using the route `yourShop.com/Foo` or `yourShop.com/Entities/Foo` or whatever you'd like. Now, everytime you create a new entity, a SEO URL has to be automatically created as well. When you update your entities' name, guess what, you'll have to change the SEO URL as well.

For this scenario, you can make use of the Shopware built-in `SeoUrlRoute` classes, which hold all necessary information about your dynamic route and will then create the respective `seo_url` entries automatically.

Let's first have a look at such an example class:

<Tabs>
<Tab title="ExamplePageSeoUrlRoute.php">

```php
// <plugin root>/src/Storefront/Framework/Seo/SeoUrlRoute/ExamplePageSeoUrlRoute.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Framework\Seo\SeoUrlRoute;

use Shopware\Core\Content\Seo\SeoUrlRoute\SeoUrlMapping;
use Shopware\Core\Content\Seo\SeoUrlRoute\SeoUrlRouteConfig;
use Shopware\Core\Content\Seo\SeoUrlRoute\SeoUrlRouteInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\SalesChannelEntity;
use Swag\BasicExample\Core\Content\Example\ExampleDefinition;
use Swag\BasicExample\Core\Content\Example\ExampleEntity;

class ExamplePageSeoUrlRoute implements SeoUrlRouteInterface
{
    public const ROUTE_NAME = 'frontend.example.example';
    public const DEFAULT_TEMPLATE = '{{ example.name }}';

    private ExampleDefinition $exampleDefinition;

    public function __construct(ExampleDefinition $exampleDefinition)
    {
        $this->exampleDefinition = $exampleDefinition;
    }

    public function getConfig(): SeoUrlRouteConfig
    {
        return new SeoUrlRouteConfig(
            $this->exampleDefinition,
            self::ROUTE_NAME,
            self::DEFAULT_TEMPLATE,
            true
        );
    }

    public function prepareCriteria(Criteria $criteria): void
    {
    }

    public function getMapping(Entity $example, ?SalesChannelEntity $salesChannel): SeoUrlMapping
    {
        if (!$example instanceof ExampleEntity) {
            throw new \InvalidArgumentException('Expected ExampleEntity');
        }

        $exampleJson = $example->jsonSerialize();

        return new SeoUrlMapping(
            $example,
            ['exampleId' => $example->getId()],
            [
                'example' => $exampleJson,
            ]
        );
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
        <service id="Swag\BasicExample\Storefront\Framework\Seo\SeoUrlRoute\ExamplePageSeoUrlRoute">
            <argument type="service" id="Swag\BasicExample\Core\Content\Example\ExampleDefinition"/>

            <tag name="shopware.seo_url.route"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

Okay, so let's look through this step by step.

Your custom "SeoUrlRoute" class has to implement the `SeoUrlRouteInterface`, which comes with three necessary methods:

* `getConfig`: Here you have to return an instance of `SeoUrlRouteConfig`, containing your entity's definition,

  the technical name of the route to be used, and the desired SEO path.

* `prepareCriteria`: Here you can adjust the criteria instance, which will be used to fetch your entities.

  Here you can e.g. narrow down which entities may be used for the SEO URL generation. For example you could add a filter

  on an `active` field and therefore only generate SEO URLs for active entities. Also you can add associations here,

  which will then be available with the entity provided in the `getMapping` method.

* `getMapping`: In this method you have to return an instance of `SeoUrlMapping`. It has to contain the actually

  available data for the SEO URL template. If you're using a variable `example.name` in the SEO URL template, you have to

  provide the data for the key `example` here.

Make sure to check which kind of entity has been applied to the `getMapping` method, since you don't want to provide mappings for other entities than your custom one.

It then has to be registered to the container using the tag `shopware.seo_url.route`.

Now that you've set up this class, there are two more things to be done, which are covered in the next sections.

**Example subscriber**

Every time your entity is written now, you have to let Shopware know, that you want to generate the SEO URLs for those entities now. This is done by reacting to the [DAL events](../../framework/data-handling/using-database-events) of your custom entity, to be specific we're going to use the `written` event. Everytime your entity is written, you then have to execute the `update` method of the `Shopware\Core\Content\Seo\SeoUrlUpdater` class.

Once again, let's have a look at an example subscriber here:

<Tabs>
<Tab title="DynamicSeoUrlPageSubscriber.php">

```php
// <plugin root>/src/Service/DynamicSeoUrlPageSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Content\Seo\SeoUrlUpdater;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenEvent;
use Swag\BasicExample\Storefront\Framework\Seo\SeoUrlRoute\ExamplePageSeoUrlRoute;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class DynamicSeoUrlPageSubscriber implements EventSubscriberInterface
{
    private SeoUrlUpdater $seoUrlUpdater;

    public function __construct(SeoUrlUpdater $seoUrlUpdater) {
        $this->seoUrlUpdater = $seoUrlUpdater;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'swag_example.written' => 'onEntityWritten'
        ];
    }

    public function onEntityWritten(EntityWrittenEvent $event): void
    {
        $this->seoUrlUpdater->update(ExamplePageSeoUrlRoute::ROUTE_NAME, $event->getIds());
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
        <!-- ... -->
        <service id="Swag\BasicExample\Service\DynamicSeoUrlPageSubscriber" >
            <argument type="service" id="Shopware\Core\Content\Seo\SeoUrlUpdater" />

            <tag name="kernel.event_subscriber" />
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

As already said, we're using the `written` event of our custom entity by providing the entities' technical name with the `.written` suffix. Everytime it is executed, we're just using the said `update` method of the `SeoUrlUpdater`. Here you'll have to provide the technical route name and the IDs of the entities, that need to be updated. And that's it for the subscriber.

The `SeoUrlUpdater` will need one more thing in order to work properly: An entry in the table `seo_url_template`, which is done in the next step.

**Example SeoUrlTemplate migration**

Now we need to add an entry to the `seo_url_template` table for our new dynamic SEO URL template. This is done by adding a [database migration](../../plugin-fundamentals/database-migrations) to our plugin.

The most important values you'll have to set in the migration are:

* `route_name`: We've defined this multiple times already. Use the constant from your `ExamplePageSeoUrlRoute` class
* `entity_name`: The technical name of your custom entity. In this guide it's `swag_example`
* `template`: Once again use the constant `DEFAULT_TEMPLATE` from your `ExamplePageSeoUrlRoute` class

Now here is the said example migration:

```php
// <plugin root>/src/Migration/Migration1619514731AddExampleSeoUrlTemplate.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;
use Swag\BasicExample\Storefront\Framework\Seo\SeoUrlRoute\ExamplePageSeoUrlRoute;

class Migration1619514731AddExampleSeoUrlTemplate extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1619514731;
    }

    public function update(Connection $connection): void
    {
        $connection->insert('seo_url_template', [
            'id' => Uuid::randomBytes(),
            'sales_channel_id' => null,
            'route_name' => ExamplePageSeoUrlRoute::ROUTE_NAME,
            'entity_name' => 'swag_example',
            'template' => ExamplePageSeoUrlRoute::DEFAULT_TEMPLATE,
            'created_at' => (new \DateTimeImmutable())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
        ]);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
```

And that's it! Every time your entity is written now, you'll automatically generate a SEO URL for it.

::: info
This guide will not cover creating an actual controller with the used example route. Learn how that is done in our guide about [creating a storefront controller](../../storefront/add-custom-controller).
:::

**Reacting to entity deletion**

If your entity is deleted, you want the SEO URL to be updated as well. In detail, the column `is_deleted` of the respective entry in the `seo_url` table has to be set to `1`.

This can be achieved by using the DAL event `.deleted` and then executing the `update` method again.

```php
// <plugin root>/src/Service/DynamicSeoUrlPageSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Content\Seo\SeoUrlUpdater;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityDeletedEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenEvent;
use Swag\BasicExample\Storefront\Framework\Seo\SeoUrlRoute\ExamplePageSeoUrlRoute;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class DynamicSeoUrlPageSubscriber implements EventSubscriberInterface
{
    // ...

    public static function getSubscribedEvents(): array
    {
        return [
            'swag_example.written' => 'onEntityWritten',
            'swag_example.deleted' => 'onEntityDeleted'
        ];
    }

    // ...

    public function onEntityDeleted(EntityDeletedEvent $event): void
    {
        $this->seoUrlUpdater->update(ExamplePageSeoUrlRoute::ROUTE_NAME, $event->getIds());
    }
}
```

#### Dynamic SEO URLs for custom content

This section is specifically about dynamic content other than custom entities. This could be e.g. data from an external resource, maybe external APIs.

You'll need some kind of event or some other way to execute code once your dynamic content changes, like once a new instance of that content is created or once it is updated.

In this example, we'll assume you've got a class called `DynamicSeoUrlsService` with a method `writeSeoEntries`. This method will get an array of entries to be written, including their respective payload, such as a name for the SEO URL. It also needs the current context.

Calling this method is up to you, depending on your set up and the type of "dynamic content" you're having.

This method will then use the `SeoUrlPersister` and its method `updateSeoUrls` in order to write entries to the `seo_url` table.

Here's an example of such a class:

```php
// <plugin root>/src/Service/DynamicSeoUrlsService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Cocur\Slugify\SlugifyInterface;
use Shopware\Core\Content\Seo\SeoUrlPersister;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;

class DynamicSeoUrlsService
{
    public const ROUTE_NAME = 'example.route.name';

    private SeoUrlPersister $seoUrlPersister;

    private EntityRepository $salesChannelRepository;

    private SlugifyInterface $slugify;

    public function __construct(
        SeoUrlPersister $seoUrlPersister,
        EntityRepository $salesChannelRepository,
        SlugifyInterface $slugify
    ) {
        $this->seoUrlPersister = $seoUrlPersister;
        $this->salesChannelRepository = $salesChannelRepository;
        $this->slugify = $slugify;
    }

    public function writeSeoEntries(array $entries, Context $context): void
    {
        $urls = [];

        $salesChannelId = $this->getStorefrontSalesChannelId($context);
        if (!$salesChannelId) {
            // Might want to throw an error here
            return;
        }

        foreach ($entries as $entry) {
            $urls[] = [
                'salesChannelId' => $salesChannelId,
                'foreignKey' => $entry->getId(),
                // The name of the route in the respective controller
                'routeName' => self::ROUTE_NAME,
                // The technical path of your custom route, using a given parameter
                'pathInfo' => '/example-path/' . $entry->getId(),
                'isCanonical' => true,
                // The SEO URL that you want to use here, in this case just the name
                'seoPathInfo' => '/' . $this->slugify->slugify($entry->getName()),
            ];
        }

        // You might have to create a new context using another specific language ID
        $this->seoUrlPersister->updateSeoUrls($context, self::ROUTE_NAME, array_column($urls, 'foreignKey') , $urls);
    }

    private function getStorefrontSalesChannelId(Context $context): ?string
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('typeId', Defaults::SALES_CHANNEL_TYPE_STOREFRONT));

        return $this->salesChannelRepository->searchIds($criteria, $context)->firstId();
    }
}
```

The method `writeSeoEntries` will look for a Storefront sales channel and return its ID. It's then iterating over each provided entry, which in this example will need a method called `getId` and method called `getName`. Using this data, an array of URLs to be written is created. Make sure to change the values of the following keys:

* `routeName`: The technical name of your route, configured in your controller
* `pathInfo`: The technical, non-SEO, path of your route, also configured in your controller
* `seoPathInfo`: The actual SEO path you want to use - in this case the name of the said content

::: info
This guide will not cover creating an actual controller with the used example route. Learn how that is done in our guide about [creating a storefront controller](../../storefront/add-custom-controller).
:::

It will then use the built array and all of the other information like the context, the route name and an array of foreign keys for the method `updateSeoUrls` of the `SeoUrlPersister`. And that's it for your dynamic content.

#### Reacting to deletion of the content

If your custom dynamic content is deleted, you have to set the column `is_deleted` to `1` of the respective `seo_url` entry. This can be achieved with a new method, in this example we'll call it `deleteSeoEntries`. It will receive an array of IDs to be deleted. Those IDs have to match the value of the column `foreign_key` in the `seo_url` table. Also it needs the current context. It will take care of setting the generated SEO URLs to `deleted`. It will **not** delete an entry from the table `seo_url`.

```php
public function deleteSeoEntries(array $ids, Context $context): void
{
    $this->seoUrlPersister->updateSeoUrls($context, self::ROUTE_NAME, $ids, []);
}
```

This way the respective SEO URLs will be marked as `is_deleted` for the system. However, this SEO route will remain accessible, so make sure to implement a check whether or not the content still exists in your controller.

#### Writing SEO URLs for another language

In the example mentioned above, we're just using a `Context` instance, for whichever language that is. You can be more specific here though, in order to properly define the language ID yourself here and therefore ensuring it is written for the right language.

```php
$context = new Context(
    $event->getContext()->getSource(),
    $event->getContext()->getRuleIds(),
    $event->getContext()->getCurrencyId(),
    [$languageId]
);
```

You can then pass this context to the `updateSeoUrls` method.
