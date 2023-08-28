# Add / Modify Completion

The Advanced Search does not use the default Elasticsearch completion because it only supports a fixed order and the storage size is high. As an alternative, Advanced Search uses aggregations to find the most important word combinations for your search input.

## Adding completion to your definition mapping:

To index our own completion keywords, we need to inject `Shopware\Commercial\AdvancedSearch\Domain\Completion\CompletionDefinitionEnrichment` into your ES definition and call enrich methods in `getMapping` and `fetch` as following example:

Example:

_The definition is from the [previous example](./How-to-define-your-custom-Elasticsearch-definition.md):_

```php
<?php declare(strict_types=1);

class YourCustomElasticsearchDefinition extends AbstractElasticsearchDefinition
{
    public function __construct(
        private readonly EntityDefinition $definition,
        private readonly Connection $connection,
        private readonly AbstractSearchLogic $searchLogic,
        private readonly CompletionDefinitionEnrichment $completionDefinitionEnrichment,
        private readonly array $languageAnalyzerMapping
    ) {
    }

    public function getMapping(Context $context): array
    {
        // ...
        
        return [
            '_source' => ['includes' => ['id']],
            // to add the mapping of completion field in your definition
            'properties' => array_merge($properties, $this->completionDefinitionEnrichment->enrichMapping()),
        ];
    }

    public function fetch(array $ids, Context $context): array
    {
        // ...

        // to add the completion keywords to the existing data
        return $this->completionDefinitionEnrichment->enrichData($this->getEntityDefinition(), $documents);
    }
}
```

## Add/modify completion keywords

By default, each of Shopware's ES definitions has a set of `string` fields to be considered as completion keywords. This configuration is realized via the parameter `%advanced_search.completion%`, if the configured fields for your definition are not set, all StringFields of the definition will be used as completion keywords. 

For example, you can add or modify this configuration in `config/packages/advanced_search.yaml`:

```yaml
advanced_search:
    completion:
        your_custom_entity:
            - email
            - company
```

If you want to have more control over the completion, such as using static texts from files or parsing a field from another data source as completion keywords, you might want to decorate the service `\Shopware\Commercial\AdvancedSearch\Domain\Completion\CompletionDefinitionEnrichment::enrichData` instead.
