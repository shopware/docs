---
nav:
  title: Add more fields to product search
  position: 30

---

# Add more Fields to Product Search

You can add more searchable fields into your product or any Elasticsearch definition.

In this example, we create a field called `productNumberPrefix` to make it searchable. This requires 3 steps:

**1. Decorate the ElasticsearchDefinition**

```xml
<service id="YourPluginNameSpace\ElasticsearchProductDefinitionDecorator" decorates="Shopware\Elasticsearch\Product\ElasticsearchProductDefinition">
    <argument type="service" id=".inner"/>
    <argument type="service" id="Shopware\Commercial\AdvancedSearch\Domain\Search\SearchLogic"/>
</service>
```

```php
<?php declare(strict_types=1);

namespace YourPluginNameSpace;

use OpenSearchDSL\Query\Compound\BoolQuery;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Elasticsearch\Framework\AbstractElasticsearchDefinition;

class ElasticsearchProductDefinitionDecorator extends AbstractElasticsearchDefinition
{
    public function __construct(
        private readonly AbstractElasticsearchDefinition $decorated
    ) {
    }

    public function getEntityDefinition(): EntityDefinition
    {
        return $this->decorated->getEntityDefinition();
    }

    public function buildTermQuery(Context $context, Criteria $criteria): BoolQuery
    {
        return $this->decorated->buildTermQuery($context, $criteria);
    }

    public function getMapping(Context $context): array
    {
        $mappings = $this->decorated->getMapping($context);

        $additionalMappings = [
            // define your new field's type
            'prefixProductNumber' => self::KEYWORD_FIELD,
            // other additional fields
        ];

        $mappings['properties'] = array_merge($mappings['properties'], $additionalMappings);

        return $mappings;
    }

    public function fetch(array $ids, Context $context): array
    {
        $data = $this->decorated->fetch($ids, $context);

        $documents = [];

        foreach ($data as $id => $document) {
            $document = array_merge($document, [
                // get first 5 characters from productNumber to index it
                'prefixProductNumber' => substr($document['productNumber'], 0, 5),
            ]);

            $documents[$id] = $document;
        }

        return $documents;
    }
}
```

**2. Run the commands:**

We need to update these data mapping to the Opensearch's server to make the change effective:

```bash
// Update the Elasticsearch indices mapping, introduce since 6.5.4.0
bin/console es:mapping:update

// Assume the new field data are already set in products, otherwise you don't need to reindex
bin/console es:index --no-queue
```

**3. Insert new fields to advanced_search_config_field of the search entity**

So now the data is mapped and indexed, we need to make it searchable by adding the new field into the search config. Create a new migration and make sure it is run by reinstalling or updating the plugin:

```bash
bin/console database:create-migration --name AddNewPrefixProductNumberFieldIntoProductAdvancedSearch --plugin YourPlugin
```

```php
<?php declare(strict_types=1);

namespace YourPluginNameSpace\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Commercial\AdvancedSearch\Entity\AdvancedSearchConfig\Aggregate\AdvancedSearchConfigFieldDefinition;
use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;

class Migration1692954529AddNewPrefixProductNumberFieldIntoProductAdvancedSearch extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1692954529;
    }

    public function update(Connection $connection): void
    {
        $configSalesChannelIds = $connection->fetchFirstColumn('SELECT id FROM advanced_search_config');

        $createdAt = (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT);

        foreach ($configSalesChannelIds as $configSalesChannelId) {
            $connection->insert(AdvancedSearchConfigFieldDefinition::ENTITY_NAME, [
                'id' => Uuid::randomBytes(),
                'field' => 'prefixProductNumber',
                'config_id' => $configSalesChannelId,
                'entity' => ProductDefinition::ENTITY_NAME,
                'tokenize' => 1,
                'searchable' => 1,
                'ranking' => 500,
                'created_at' => $createdAt,
            ]);
        }
    }
}
```
