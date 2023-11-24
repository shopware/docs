---
nav:
  title: Add custom sitemap entries
  position: 10

---

# Add Custom Sitemap Entries

## Overview

Of course Shopware comes with a sitemap generation feature, including products and categories, as well as some more URLs.
This guide however will cover how you can add your own custom URLs to the sitemap.

## Prerequisites

This guide is mostly built upon the guide about [Adding a custom SEO URL](../seo/add-custom-seo-url#Dynamic SEO URLs for entities),
so you might want to have a look at that.
The said guide comes with a custom entity, a controller with a technical route to display each entity, and a custom SEO URL.
All of this will be needed for this guide, as we're going to add the custom entity SEO URLs to the sitemap here.

## Adding an URL provider

So let's get started.
Adding custom URLs to the sitemap is done by adding a so called "URL provider" to the system.

This is done by adding a new class, which is extending from `Shopware\Core\Content\Sitemap\Provider\AbstractUrlProvider`.
It then has to be registered to the [service container](../../plugin-fundamentals/dependency-injection) using the tag
`shopware.sitemap_url_provider`.

It has to provide three methods:

- `getDecorated`: Just throw an exception of type `DecorationPatternException` here. This is done for the sake of extending
a class via decoration. Learn more about this [here](../../plugin-fundamentals/adjusting-service).
- `getName`: A technical name for your custom URLs
- `getUrls`: The main method to take care of. It has to return an instance of `Shopware\Core\Content\Sitemap\Struct\UrlResult`,
containing an array of all URLs to be added.

Let's have a look at the example class:

<Tabs>
<Tab title="CustomUrlProvider.php">

```php
// <plugin root>/src/Core/Content/Sitemap/Provider/CustomUrlProvider.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Sitemap\Provider;

use Doctrine\DBAL\Connection;
use Shopware\Core\Content\Sitemap\Provider\AbstractUrlProvider;
use Shopware\Core\Content\Sitemap\Struct\Url;
use Shopware\Core\Content\Sitemap\Struct\UrlResult;
use Shopware\Core\Framework\DataAbstractionLayer\Doctrine\FetchModeHelper;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Plugin\Exception\DecorationPatternException;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Swag\BasicExample\Core\Content\Example\ExampleEntity;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class CustomUrlProvider extends AbstractUrlProvider
{
    public const CHANGE_FREQ = 'daily';
    public const PRIORITY = 1.0;

    private EntityRepository $exampleRepository;

    private Connection $connection;

    private RouterInterface $router;

    public function __construct(
        EntityRepository $exampleRepository,
        Connection $connection,
        RouterInterface $router
    ) {
        $this->exampleRepository = $exampleRepository;
        $this->connection = $connection;
        $this->router = $router;
    }

    public function getDecorated(): AbstractUrlProvider
    {
        throw new DecorationPatternException(self::class);
    }

    public function getName(): string
    {
        return 'custom';
    }

    /**
     * {@inheritdoc}
     */
    public function getUrls(SalesChannelContext $context, int $limit, ?int $offset = null): UrlResult
    {
        $criteria = new Criteria();
        $criteria->setLimit($limit);
        $criteria->setOffset($offset);

        $exampleEntities = $this->exampleRepository->search($criteria, $context->getContext());

        if ($exampleEntities->count() === 0) {
            return new UrlResult([], null);
        }

        $seoUrls = $this->getSeoUrls($exampleEntities->getIds(), 'frontend.example.example', $context, $this->connection);
        $seoUrls = FetchModeHelper::groupUnique($seoUrls);

        $urls = [];

        /** @var ExampleEntity $exampleEntity */
        foreach ($exampleEntities as $exampleEntity) {
            $exampleUrl = new Url();
            $exampleUrl->setLastmod($exampleEntity->getUpdatedAt() ?? new \DateTime());
            $exampleUrl->setChangefreq(self::CHANGE_FREQ);
            $exampleUrl->setPriority(self::PRIORITY);
            $exampleUrl->setResource(ExampleEntity::class);
            $exampleUrl->setIdentifier($exampleEntity->getId());

            if (isset($seoUrls[$exampleEntity->getId()])) {
                $exampleUrl->setLoc($seoUrls[$exampleEntity->getId()]['seo_path_info']);
            } else {
                $exampleUrl->setLoc(
                    $this->router->generate(
                        'frontend.example.example',
                        ['exampleId' => $exampleEntity->getId()],
                        UrlGeneratorInterface::ABSOLUTE_PATH
                    )
                );
            }

            $urls[] = $exampleUrl;
        }

        return new UrlResult($urls, null);
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
        <service id="Swag\BasicExample\Core\Content\Sitemap\Provider\CustomUrlProvider" >
            <argument type="service" id="swag_example.repository" />
            <argument type="service" id="Doctrine\DBAL\Connection"/>
            <argument type="service" id="router"/>

            <tag name="shopware.sitemap_url_provider" />
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

Let's go through this step by step.
First of all we created a new class `CustomUrlProvider`, which is extending from the `AbstractUrlProvider`.
Following are the constants `CHANGE_FREQ` and `priority` - you don't have to add those values as constants of course.
They're going to be used later in the generation of the sitemap URLs.

Passed into the constructor are the repository for our [custom entity](../../framework/data-handling/add-custom-complex-data),
the DBAL connection used for actually fetching SEO URLs from the database, and the Symfony router in order to generate SEO URLs
that have not yet been written to the database.

Now let's get to the main method `getUrls`.
Here we start of with fetching all custom entities, using the provided `$limit` and `$offset` values.
Make sure to always use those values, as the sitemap support "paging" and therefore you do not want to simply fetch all
of your entities.
If there aren't any entities to be fetched, there is nothing more to be done here.

Afterwards we fetch all already existing SEO URLs for our custom entities. Once again, have a look at our guide about
[adding a custom SEO URL](../seo/add-custom-seo-url#Dynamic SEO URLs for entities) if you don't know how to add custom
SEO URLs in the first place.

We're then iterating over all of our fetched entities and we create an instance of `Shopware\Core\Content\Sitemap\Struct\Url`
for each iteration.
This struct requests each of the typical sitemap information:

- `lastMod`: The last time this entry was modified. Just use the `updatedAt` value here, if available
- `changeFreq`: How often will the entry most likely change?
Possible values are `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly` and `never`
- `priority`: Has to have a value between 0 and 1. URLs with higher priority are considered to be "more important" by common
search engines.
- `resource`: Just a name for your entry, in this example we're just using the entity class name
- `identifier`: The ID of the entry, if available

The most important entry is set afterwards, which is the `location`: The actual SEO URL to be indexed.
We're setting this value by checking if the SEO URL for the given entity was already generated, and if not, we're generating it on the fly.

All of those instances are then stored in array, which in return is passed to the `UrlResult`.
And that's it already!
