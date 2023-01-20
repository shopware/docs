# Extending a Shopware Migration Profile

## Overview

In this guide, you will see an example of how you can extend a Shopware migration profile of the [Shopware Migration Assistant](https://store.shopware.com/search?sSearch=Swag257162657297f). For this example, the Shopware 5 [SwagAdvDevBundle](https://github.com/shopwareLabs/SwagAdvDevBundle) plugin is migrated to the Shopware 6. For simplicity, only the local gateway is implemented.

## Setup

It is required to have a basic plugin running. You must have installed the [SwagAdvDevBundle](https://github.com/shopwareLabs/SwagAdvDevBundle) plugin in Shopware 5, an own [Plugin](../../../../guides/plugins/plugins/plugin-base-guide#create-your-first-plugin) and [Shopware Migration Assistant](https://store.shopware.com/search?sSearch=Swag257162657297f) in Shopware 6.

## Enrich existing plugin with migration features

Instead of creating a new plugin for the migration, you might want to add migration features to your existing plugin. Of course, your plugin should then also be installable without the Migration Assistant plugin. So we have an optional requirement. Have a look at this [section of the guide](../../../../guides/plugins/plugins/plugin-fundamentals/database-migrations) on how to inject the needed migration services only if the Migration Assistant plugin is available. You could also have a look at the example plugin to see how the conditional loading is managed in the plugin base class.

## Creating a new dataSet

First of all, you need to create a new `DataSet` for your bundle entity:

```php
<?php declare(strict_types=1);

namespace SwagMigrationBundleExample\Profile\Shopware\DataSelection\DataSet;

use SwagMigrationAssistant\Migration\DataSelection\DataSet\DataSet;
use SwagMigrationAssistant\Migration\MigrationContextInterface;
use SwagMigrationAssistant\Profile\Shopware\ShopwareProfileInterface;

class BundleDataSet extends DataSet
{
    public static function getEntity(): string
    {
        return 'swag_bundle'; // Identifier of this entity
    }

    public function supports(MigrationContextInterface $migrationContext): bool
    {
        // This way we support all Shopware profile versions
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface;
    }

    public function getSnippet(): string
    {
        return 'swag-migration.index.selectDataCard.entities.' . static::getEntity();
    }
}
```

The bundle entities must be migrated after the products, because of which you have to extend the `ProductDataSelection` as follows:

```php
<?php declare(strict_types=1);

namespace SwagMigrationBundleExample\Profile\Shopware\DataSelection;

use SwagMigrationAssistant\Migration\DataSelection\DataSelectionInterface;
use SwagMigrationAssistant\Migration\DataSelection\DataSelectionStruct;
use SwagMigrationAssistant\Migration\MigrationContextInterface;
use SwagMigrationBundleExample\Profile\Shopware\DataSelection\DataSet\BundleDataSet;
use SwagMigrationOwnProfileExample\Profile\OwnProfile\DataSelection\DataSet\ProductDataSet;

class ProductDataSelection implements DataSelectionInterface
{
    private DataSelectionInterface $originalDataSelection;

    public function __construct(DataSelectionInterface $originalDataSelection)
    {
        $this->originalDataSelection = $originalDataSelection;
    }

    public function supports(MigrationContextInterface $migrationContext): bool
    {
        return $this->originalDataSelection->supports($migrationContext);
    }

    public function getData(): DataSelectionStruct
    {
        $dataSelection = $this->originalDataSelection->getData();

        // Add the modified DataSet array to a new DataSelectionStruct
        return new DataSelectionStruct(
            $dataSelection->getId(),
            $this->getDataSets(),
            $this->getDataSetsRequiredForCount(),
            $dataSelection->getSnippet(),
            $dataSelection->getPosition(),
            $dataSelection->getProcessMediaFiles(),
            DataSelectionStruct::PLUGIN_DATA_TYPE
        );
    }

    public function getDataSets(): array
    {
        $entities = $this->originalDataSelection->getDataSets();
        $entities[] = new BundleDataSet(); // Add the BundleDataSet to the DataSet array

        return $entities;
    }

    public function getDataSetsRequiredForCount(): array
    {
        return $this->originalDataSelection->getDataSetsRequiredForCount();
    }
}
```

To insert the bundle entity to this `DataSelection`, you have to add this entity to the entities array of the returning `DataSelectionStruct` of the `getData` function.

Both classes have to be registered in the `migration_assistant_extension.xml`:

```html
<service id="SwagMigrationBundleExample\Profile\Shopware\DataSelection\ProductDataSelection"
         decorates="SwagMigrationAssistant\Profile\Shopware\DataSelection\ProductDataSelection">
    <argument type="service" id="SwagMigrationBundleExample\Profile\Shopware\DataSelection\ProductDataSelection.inner"/>
</service>

<service id="SwagMigrationBundleExample\Profile\Shopware\DataSelection\DataSet\BundleDataSet">
    <tag name="shopware.migration.data_set"/>
</service>
```

All `DataSets` have to be tagged with `shopware.migration.data_set`. The `DataSetRegistry` fetches all these classes and searches for the correct `DataSet` with the `supports` method.

## Adding entity count snippets

If you check your current progress in the data selection table of Shopware Migration Assistant in the Administration, you can see that the bundle entities are automatically counted, but the description of the entity count is currently not loaded. To get a correct description of the new entity count, you have to add new snippets for this.

First of all, you create a new snippet file, e.g., `en-GB.json`:

```json
{
    "swag-migration": {
        "index": {
            "selectDataCard": {
                "entities": {
                    "swag_bundle": "Bundles:"
                }
            }
        }
    }
}
```

All count entity descriptions are located in the `swag-migration.index.selectDataCard.entities` namespace by default, so you have to create a new entry with the entity name of the new bundle entity or you could change the snippet in the `getSnippet` function of the `DataSet`.

At last, you have to create the `main.js` in the `Resources/app/administration` directory like this:

```javascript
import enGBSnippets from './snippet/en-GB.json';

const { Application } = Shopware;

Application.addInitializerDecorator('locale', (localeFactory) => {
    localeFactory.extend('en-GB', enGBSnippets);

    return localeFactory;
});
```

As you see in the code above, you register your snippet file for the `en-GB` locale. Now the count entity description should display in the Administration correctly.

## Creating a local reader

```php
<?php declare(strict_types=1);

namespace SwagMigrationBundleExample\Profile\Shopware\Gateway\Local\Reader;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Driver\ResultStatement;
use SwagMigrationAssistant\Migration\MigrationContextInterface;
use SwagMigrationAssistant\Migration\TotalStruct;
use SwagMigrationAssistant\Profile\Shopware\Gateway\Local\Reader\AbstractReader;
use SwagMigrationAssistant\Profile\Shopware\Gateway\Local\ShopwareLocalGateway;
use SwagMigrationAssistant\Profile\Shopware\ShopwareProfileInterface;
use SwagMigrationBundleExample\Profile\Shopware\DataSelection\DataSet\BundleDataSet;

class LocalBundleReader extends AbstractReader
{
    public function supportsTotal(MigrationContextInterface $migrationContext): bool
    {
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface
            && $migrationContext->getGateway()->getName() === ShopwareLocalGateway::GATEWAY_NAME;
    }

    public function readTotal(MigrationContextInterface $migrationContext): ?TotalStruct
    {
        $this->setConnection($migrationContext);

        $query = $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from('s_bundles')
            ->execute();

        $total = 0;
        if ($query instanceof ResultStatement) {
            $total = (int) $query->fetchColumn();
        }

        return new TotalStruct(BundleDataSet::getEntity(), $total);
    }

    public function supports(MigrationContextInterface $migrationContext): bool
    {
        // Make sure that this reader is only called for the BundleDataSet entity
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface
            && $migrationContext->getGateway()->getName() === ShopwareLocalGateway::GATEWAY_NAME
            && $migrationContext->getDataSet()::getEntity() === BundleDataSet::getEntity();
    }

    /**
     * Read all bundles with associated product data
     */
    public function read(MigrationContextInterface $migrationContext, array $params = []): array
    {
        $this->setConnection($migrationContext);

        // Fetch the ids of the given table with the given offset and limit
        $ids = $this->fetchIdentifiers('s_bundles', $migrationContext->getOffset(), $migrationContext->getLimit());

        // Strip the table prefix 'bundles' out of the bundles array 
        $bundles = $this->mapData($this->fetchBundles($ids), [], ['bundles']);
        $bundleProducts = $this->fetchBundleProducts($ids);

        foreach ($bundles as &$bundle) {
            if (isset($bundleProducts[$bundle['id']])) {
                $bundle['products'] = $bundleProducts[$bundle['id']];
            }
        }

        return $bundles;
    }

    /**
     * Fetch all bundles by given ids
     */
    private function fetchBundles(array $ids): array
    {
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
     */
    private function fetchBundleProducts(array $ids): array
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

In this local reader, you fetch all bundles with associated products and return this in the `read` method. Like the `DataSelection` and `DataSet`, you must register the local reader and tag it with `shopware.migration.reader` in your `migration_assistant_extension.xml`. Also, you have to set the parent property of your local reader to `AbstractReader` to inherit from this class:

```html
<service id="SwagMigrationBundleExample\Profile\Shopware\Gateway\Local\Reader\LocalBundleReader"
         parent="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\Reader\AbstractReader">
    <tag name="shopware.migration.reader"/>
</service>
```

## Creating a converter

```php
<?php declare(strict_types=1);

namespace SwagMigrationBundleExample\Profile\Shopware\Converter;

use Shopware\Core\Framework\Context;
use SwagMigrationAssistant\Migration\Converter\ConvertStruct;
use SwagMigrationAssistant\Migration\DataSelection\DefaultEntities;
use SwagMigrationAssistant\Migration\MigrationContextInterface;
use SwagMigrationAssistant\Profile\Shopware\Converter\ShopwareConverter;
use SwagMigrationAssistant\Profile\Shopware\ShopwareProfileInterface;
use SwagMigrationBundleExample\Profile\Shopware\DataSelection\DataSet\BundleDataSet;

class BundleConverter extends ShopwareConverter
{
    public function supports(MigrationContextInterface $migrationContext): bool
    {
        // Take care that you specify the supports function the same way that you have in your reader
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface
            && $migrationContext->getDataSet()::getEntity() === BundleDataSet::getEntity();
    }

    public function getSourceIdentifier(array $data): string
    {
        return $data['id'];
    }

    public function convert(array $data, Context $context, MigrationContextInterface $migrationContext): ConvertStruct
    {
        // Generate a checksum for the data to allow faster migrations in the future
        $this->generateChecksum($data);

        // Get uuid for bundle entity out of mapping table or create a new one
        $this->mainMapping = $this->mappingService->getOrCreateMapping(
            $migrationContext->getConnection()->getId(),
            BundleDataSet::getEntity(),
            $data['id'],
            $context,
            $this->checksum
        );
        $converted['id'] = $this->mainMapping['entityUuid'];

        // This method checks if key is available in data array and set value in converted array
        $this->convertValue($converted, 'name', $data, 'name');

        // Set default values for required fields, because these data do not exists in SW5
        $converted['discountType'] = 'absolute';
        $converted['discount'] = 0;

        if (isset($data['products'])) {
            $products = $this->getProducts($context, $migrationContext, $data);

            if (!empty($products)) {
                $converted['products'] = $products;
            }
        }

        // Unset used data keys
        unset(
            // Used
            $data['id'],
            $data['name'],
            $data['products']
        );

        if (empty($data)) {
            $data = null;
        }
        $this->updateMainMapping($migrationContext, $context);

        return new ConvertStruct($converted, $data, $this->mainMapping['id']);
    }

    /** 
     * Get converted products 
    */
    private function getProducts(Context $context, MigrationContextInterface $migrationContext, array $data): array
    {
        $connectionId = $migrationContext->getConnection()->getId();
        $products = [];
        foreach ($data['products'] as $product) {
            // Get associated uuid of product out of mapping table
            $mapping = $this->mappingService->getMapping(
                $connectionId,
                DefaultEntities::PRODUCT . '_mainProduct',
                $product,
                $context
            );

            // Log missing association of product
            if ($mapping === null) {
                continue;
            }

            $productUuid = $mapping['entityUuid'];
            $newProduct['id'] = $productUuid;
            $products[] = $newProduct;
        }

        return $products;
    }

    /** 
     * Called to write the created mapping to the mapping table
    */
    public function writeMapping(Context $context): void
    {
        $this->mappingService->writeMapping($context);
    }
}
```

The converter is the main logic of the migration and converts old Shopware 5 data to new Shopware 6 data structure. If you don't know what the Shopware 6 data structure of your entity looks like, you have to look for the entity definition:

```php
<?php declare(strict_types=1);

namespace Swag\BundleExample\Core\Content\Bundle;

use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FloatField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToManyAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\TranslatedField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\TranslationsAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Swag\BundleExample\Core\Content\Bundle\Aggregate\BundleProduct\BundleProductDefinition;
use Swag\BundleExample\Core\Content\Bundle\Aggregate\BundleTranslation\BundleTranslationDefinition;

class BundleDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'swag_bundle';
    }

    public function getEntityClass(): string
    {
        return BundleEntity::class;
    }

    public function getCollectionClass(): string
    {
        return BundleCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
            new TranslatedField('name'),
            (new StringField('discount_type', 'discountType'))->addFlags(new Required()),
            (new FloatField('discount', 'discount'))->addFlags(new Required()),
            new TranslationsAssociationField(BundleTranslationDefinition::class, 'swag_bundle_id'),
            new ManyToManyAssociationField('products', ProductDefinition::class, BundleProductDefinition::class, 'bundle_id', 'product_id'),
        ]);
    }
}
```

In the `BundleDefinition`, you can see which fields the entity has and which are required. \(Hint: Always use the property name of the field.\) At the end of this step, you have to register your new converter in the `migration_assistant_extension.xml` and tag it with `shopware.migration.converter`:

```html
<service id="SwagMigrationBundleExample\Profile\Shopware\Converter\BundleConverter">
    <argument type="service" id="SwagMigrationAssistant\Migration\Mapping\MappingService"/>
    <argument type="service" id="SwagMigrationAssistant\Migration\Logging\LoggingService"/>
    <tag name="shopware.migration.converter"/>
</service>
```

For more general information on converter, mapping, and deltas concept, refer to [Converter and Mapping](../concept/convert-and-mapping) section of the guide.

## Adding a writer

```php
<?php declare(strict_types=1);

namespace SwagMigrationBundleExample\Migration\Writer;

use SwagMigrationAssistant\Migration\Writer\AbstractWriter;
use SwagMigrationBundleExample\Profile\Shopware\DataSelection\DataSet\BundleDataSet;

class BundleWriter extends AbstractWriter
{
    public function supports(): string
    {
        return BundleDataSet::getEntity();
    }
}
```

```html
<service id="SwagMigrationBundleExample\Migration\Writer\BundleWriter"
         parent="SwagMigrationAssistant\Migration\Writer\AbstractWriter">
    <argument type="service" id="Shopware\Core\Framework\DataAbstractionLayer\Write\EntityWriter"/>
    <argument type="service" id="Swag\BundleExample\Core\Content\Bundle\BundleDefinition"/>
    <tag name="shopware.migration.writer"/>
</service>
```

You only need to implement the `supports` method and specify the right `Definition` in `migration_assistant_extension.xml`. The logic to write the data is defined in the `AbstractWriter` class and should almost always be the same. Look at [writer concept](../concept/writer) for more information.

With that have implemented your first plugin migration. Install your plugin, clear the cache and build the Administration again to see the migration of your bundle entities.

## Source

Check out this [GitHub repository](https://github.com/shopware/swag-docs-extending-shopware-migration-profile) containing a full example source.
