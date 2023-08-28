# Define a custom Elasticsearch Definition

In the previous implementation, the Elasticsearch index was language-based, meaning each system's language would be indexed in a separate index. With the introduction of the multilingual index:

Each index will contain multiple language-based fields; refer to the [ADR](https://developer.shopware.com/docs/resources/references/adr/2023-04-11-new-language-inheritance-mechanism-for-opensearch) and adjust your custom Elasticsearch definition's configuration mapping to adapt to the new mapping structure.

For instance, to define your custom Elasticsearch definition (this definition will be used for later examples).

```php
<?php declare(strict_types=1);

namespace YourPluginNameSpace;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use OpenSearchDSL\Query\Compound\BoolQuery;
use Shopware\Commercial\AdvancedSearch\Domain\Search\AbstractSearchLogic;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Elasticsearch\Framework\AbstractElasticsearchDefinition;
use Shopware\Elasticsearch\Framework\ElasticsearchQueryHelper;

class YourCustomElasticsearchDefinition extends AbstractElasticsearchDefinition
{
    public function __construct(
        private readonly EntityDefinition $definition,
        private readonly Connection $connection,
        private readonly AbstractSearchLogic $searchLogic,
        private readonly array $languageAnalyzerMapping
    ) {
    }

    /**
     * Define your ES definition's mapping
     */
    public function getMapping(Context $context): array
    {
        $languages = $this->connection->fetchAllKeyValue(
            'SELECT LOWER(HEX(language.`id`)) as id, locale.code
             FROM language
             INNER JOIN locale ON locale_id = locale.id'
        );

        $languageFields = ElasticsearchQueryHelper::mapTranslatedField(
            $languages,
            $this->languageAnalyzerMapping,
            self::getTextFieldConfig()
        );

        $properties = [
            'id' => self::KEYWORD_FIELD,
            'name' => $languageFields,
            'description' => $languageFields,
        ];

        return [
            '_source' => ['includes' => ['id']],
            'properties' => $properties,
        ];
    }

    /**
     * Build a bool query when searching your custom ES definition, by default we use the Shopware\Commercial\AdvancedSearch\Domain\Search\SearchLogic  
     */
    public function buildTermQuery(Context $context, Criteria $criteria): BoolQuery
    {
        return $this->searchLogic->build($this->definition, $criteria, $context);
    }

    /**
    * fetch data from storage to push to elasticsearch cluster when indexing data 
    */
    public function fetch(array $ids, Context $context): array
    {
        $data = $this->fetchData($ids, $context);

        $documents = [];

        foreach ($data as $id => $item) {
            ['translation' => $translations] = ElasticsearchQueryHelper::parseJson($item, ['translation']);

            $document = array_merge([
                'id' => $id,
            ], ElasticsearchQueryHelper::mapTranslatedFieldsValue([
                'keywords',
                'packUnit',
                'packUnitPlural',
            ], true, ...$translations));

            $documents[$id] = $document;
        }

        return $documents;
    }

    public function getEntityDefinition(): EntityDefinition
    {
        return $this->definition;
    }

    private function fetchData(array $ids, Context $context): array
    {
        $sql = <<<'SQL'
SELECT
    LOWER(HEX(your_custom_table.id)) AS id,
    #translation#
FROM your_custom_table manufacturer
    LEFT JOIN your_custom_table_translation ON your_custom_table_translation.your_custom_table_id = your_custom_table.id
WHERE your_custom_table.id IN (:ids)
GROUP BY your_custom_table.id
SQL;

        $sql = str_replace('#translation#', ElasticsearchQueryHelper::groupConcatSql('your_custom_table_translation', 'translation', ['name', 'description'], ['language_id']), $sql);

        $result = $this->connection->fetchAllAssociativeIndexed(
            $sql,
            [
                'ids' => $ids,
            ],
            [
                'ids' => ArrayParameterType::STRING,
            ]
        );

        return $result;
    }
}
```

And register it in the container with tag `shopware.es.definition` and `advanced_search.supported_definition`


```xml
# YourPluginNameSpace should be changed to your respectively ElasticsearchDefinition and Definition classes
<service id="YourPluginNameSpace\YourCustomElasticsearchDefinition">
    <argument type="service" id="YourPluginNameSpace\YourCustomDefinition"/>
    <argument type="service" id="Doctrine\DBAL\Connection"/>
    <argument type="service" id="Shopware\Commercial\AdvancedSearch\Domain\Search\SearchLogic"/>
    <argument>%advanced_search.language_analyzer_mapping%</argument>

    <tag name="shopware.es.definition"/>
    <tag name="advanced_search.supported_definition"/>
</service>
```
