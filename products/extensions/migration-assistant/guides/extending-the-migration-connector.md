---
nav:
  title: Extending the Migration Connector
  position: 20

---

# Extending the Migration Connector

In this guide, you will see an example of how you can extend the [Migration connector](https://github.com/shopware/SwagMigrationConnector) plugin to migrate the Shopware 5 [SwagAdvDevBundle](https://github.com/shopwareLabs/SwagAdvDevBundle) to a Shopware 6 plugin via API.

## Setup

It is required to have a basic Shopware 5 plugin running. You must have installed the [SwagAdvDevBundle](https://github.com/shopwareLabs/SwagAdvDevBundle), the [Migration connector](https://github.com/shopware/SwagMigrationConnector) plugin in Shopware 5, and an own Shopware 6 [Plugin](../../../../guides/plugins/plugins/plugin-base-guide#create-your-first-plugin), the [Migration Assistant](https://github.com/shopware/SwagMigrationAssistant) and the [SwagMigrationBundleExample](extending-a-shopware-migration-profile) plugin in Shopware 6. If you want to know how all plugins work together, please look at the [Extending a Shopware Migration Profile](extending-a-shopware-migration-profile) guide.

With this setup, you have the bundle plugin in Shopware 5 and also the bundle plugin in Shopware 6. So you can migrate your Shopware 5 shop to Shopware 6 via local and API gateway, but your bundle data only via a local gateway.

## Creating bundle repository

To fetch your data via the Shopware 5 API, you have to create a bundle repository first:

```php
<?php

namespace SwagMigrationBundleApiExample\Repository;

use Doctrine\DBAL\Connection;
use SwagMigrationConnector\Repository\AbstractRepository;

class BundleRepository extends AbstractRepository
{
    /**
     * Fetch bundles using offset and limit
     *
     * @param int $offset
     * @param int $limit
     *
     * @return array
     */
    public function fetch($offset = 0, $limit = 250)
    {
        $ids = $this->fetchIdentifiers('s_bundles', $offset, $limit);

        $query = $this->connection->createQueryBuilder();

        $query->from('s_bundles', 'bundles');
        $this->addTableSelection($query, 's_bundles', 'bundles');

        $query->where('bundles.id IN (:ids)');
        $query->setParameter('ids', $ids, Connection::PARAM_STR_ARRAY);

        $query->addOrderBy('bundles.id');

        return $query->execute()->fetchAll();
    }

    /**
     * Fetch all bundle products by bundle ids
     *
     * @param array $ids
     *
     * @return array
     */
    public function fetchBundleProducts(array $ids)
    {
        $query = $this->connection->createQueryBuilder();

        $query->from('s_bundle_products', 'bundleProducts');
        $this->addTableSelection($query, 's_bundle_products', 'bundleProducts');

        $query->where('bundleProducts.bundle_id IN (:ids)');
        $query->setParameter('ids', $ids, Connection::PARAM_INT_ARRAY);

        return $query->execute()->fetchAll(\PDO::FETCH_GROUP | \PDO::FETCH_COLUMN);
    }
}
```

The repository has to inherit from the `AbstractRepository` of the Migration Connector. This provides helper functions like `addTableSelection`, which sets a prefix to all table columns and adds these to the query builder.

You have to register the repository in your `service.xml` with the parent property like this:

```html
<service id="swag_migration_bundle_api_example.bundle_repository"
         class="SwagMigrationBundleApiExample\Repository\BundleRepository"
         parent="SwagMigrationConnector\Repository\AbstractRepository"
         />
```

## Creating bundle service

In the next step, you create a new `BundleService`, which uses your new `BundleRepository` to fetch all bundles and products to map them to one result array:

```php
<?php
/**
 * (c) shopware AG <info@shopware.com>
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code.
 */

namespace SwagMigrationBundleApiExample\Service;

use SwagMigrationBundleApiExample\Repository\BundleRepository;
use SwagMigrationConnector\Repository\ApiRepositoryInterface;
use SwagMigrationConnector\Service\AbstractApiService;

class BundleService extends AbstractApiService
{
    private BundleRepository $bundleRepository;

    /**
     * @param ApiRepositoryInterface $bundleRepository
     */
    public function __construct(ApiRepositoryInterface $bundleRepository)
    {
        $this->bundleRepository = $bundleRepository;
    }

    /**
     * @param int $offset
     * @param int $limit
     *
     * @return array
     */
    public function getBundles($offset = 0, $limit = 250)
    {
        $bundles = $this->bundleRepository->fetch($offset, $limit);
        $ids = array_column($bundles, 'bundles.id');
        $bundleProducts = $this->bundleRepository->fetchBundleProducts($ids);

        // Strip the table prefix 'bundles' out of the bundles array
        $bundles = $this->mapData($bundles, [], ['bundles']);

        foreach ($bundles as &$bundle) {
            if (isset($bundleProducts[$bundle['id']])) {
                $bundle['products'] = $bundleProducts[$bundle['id']];
            }
        }

        return $this->cleanupResultSet($bundles);
    }
}
```

You have to register the `BundleService` in your `service.xml`:

```html
<service class="SwagMigrationBundleApiExample\Service\BundleService" id="swag_migration_bundle_api_example.bundle_service">
    <argument type="service" id="swag_migration_bundle_api_example.bundle_repository"/>
</service>
```

## Create a new API controller

At last, you have to create a new API controller, which uses the `BundleService` to get your bundle data:

```php
<?php
/**
 * (c) shopware AG <info@shopware.com>
 * For the full copyright and license information, please view the LICENSE
 * File that was distributed with this source code
 */

use SwagMigrationBundleApiExample\Service\BundleService;
use SwagMigrationConnector\Service\ControllerReturnStruct;

class Shopware_Controllers_Api_SwagMigrationBundles extends Shopware_Controllers_Api_Rest
{
    public function indexAction()
    {
        $offset = (int) $this->Request()->getParam('offset', 0);
        $limit = (int) $this->Request()->getParam('limit', 250);

        /** @var BundleService $bundleService */
        $bundleService = $this->container->get('swag_migration_bundle_api_example.bundle_service');

        $bundles = $bundleService->getBundles($offset, $limit);
        $response = new ControllerReturnStruct($bundles, empty($bundles));

        $this->view->assign($response->jsonSerialize());
    }
}
```

Now you have to create the `BundleReader` in the [SwagMigrationBundleExample](extending-a-shopware-migration-profile) plugin, which only contains the Shopware 5 API route:

```php
<?php declare(strict_types=1);

namespace SwagMigrationBundleExample\Profile\Shopware\Gateway\Api\Reader;

use SwagMigrationAssistant\Migration\MigrationContextInterface;
use SwagMigrationAssistant\Profile\Shopware\Gateway\Api\Reader\ApiReader;
use SwagMigrationAssistant\Profile\Shopware\Gateway\Api\ShopwareApiGateway;
use SwagMigrationAssistant\Profile\Shopware\ShopwareProfileInterface;
use SwagMigrationBundleExample\Profile\Shopware\DataSelection\DataSet\BundleDataSet;

class BundleReader extends ApiReader
{
    public function supports(MigrationContextInterface $migrationContext): bool
    {
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface
            && $migrationContext->getGateway()->getName() === ShopwareApiGateway::GATEWAY_NAME
            && $migrationContext->getDataSet()::getEntity() === BundleDataSet::getEntity();
    }

    protected function getApiRoute(): string
    {
        return 'SwagMigrationBundles'; // This defines which API route should called
    }
}
```

After this, you have to register the reader in the Symfony container:

```html
<service id="SwagMigrationBundleExample\Profile\Shopware\Gateway\Api\BundleReader"
         parent="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\Reader\ApiReader">
    <tag name="shopware.migration.reader"/>
</service>
```

With that, you have implemented your first plugin migration via API.

## Source

Check out this [GitHub repository](https://github.com/shopware/swag-docs-extending-shopware-migration-connector) containing a full example source.
