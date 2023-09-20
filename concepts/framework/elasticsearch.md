---
nav:
  title: Elasticsearch
  position: 60

---

# Elasticsearch

Elasticsearch is a NoSQL Database focused on search capabilities to act as a search engine.
The Shopware implementation of Elasticsearch provides an integrated way to improve the performance of product and category searches.
To use Elasticsearch for your shop, take a look at our [Elasticsearch guide](../../guides/hosting/infrastructure/elasticsearch/elasticsearch-setup)

## Concept

### Enabling Elasticsearch for your search

Elasticsearch is only used in searches that are explicitly defined.
This is by default set to the `ProductSearchRoute`, `ProductListingRoute`, and `ProductSuggestRoute`.
To use Elasticsearch on your own searches, make sure to add the Elasticsearch aware state to your criteria.

::: info
If the Elasticsearch query fails, the data is loaded using MySQL. You can disable this behavior by setting the environment variable `SHOPWARE_ES_THROW_EXCEPTION=1`
:::

```php
$criteria = new \Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria();
$context = \Shopware\Core\Framework\Context::createDefaultContext();
// Enables Elasticsearch for this search
$context->addState(\Shopware\Core\Framework\Context::STATE_ELASTICSEARCH_AWARE);

$repository->search($criteria, $context);
```

### ElasticsearchDefinition

To provide Elasticsearch for an entity, a corresponding `ElasticsearchDefinition` needs to be added. Shopware has a definition for the product entity called `ProductElasticsearchDefinition`.
This definition defines the fields provided to Elasticsearch and how they are aggregated.

### ElasticsearchEntitySearcher

The `ElasticsearchEntitySearcher` decorates the `EntitySearcher` to map the entity search to the Elasticsearch structure.
The `ElasticsearchEntitySearcher` returns an `IdSearchResult` hydrated by the `ElasticsearchEntitySearchHydrator` as the `EntitySearcher` does, and this result is used to read the found ids from the database.

### ElasticsearchEntityAggregator

The `ElasticsearchEntityAggregator` does the same as the `ElasticsearchEntitySearcher` for aggregations.

### CriteriaParser

The `CriteriaParser` parses the criteria to an Elasticsearch specific notation.

### ProductSearchBuilder

The product search has a special `ProductSearchBuilder` in the core, and so has the Elasticsearch extension, a corresponding extension for the `ProductSearchBuilder`.
This extension matches the queries of the core `ProductSearchBuilder` to the Elasticsearch notation.

### ProductUpdater

The `ProductUpdater` listens to the `ProductIndexerEvent` and triggers the `ElasticsearchIndexer` on changes to a `ProductEntity`.

## Commands

### es:index:cleanup

The command `es:index:cleanup` deletes outdated Elasticsearch indexes.
The parameter `-f` will skip the confirmation.

### es:create:alias

The command `es:create:alias` refreshes the current Elasticsearch index and sets the alias to the index name without the timestamp (which will make this index the active index).
This will happen automatically when a new index is published, so this command can force the alias creation for testing purposes or if something goes wrong.

### es:index

The command `es:index` re-indexes all configured entities to Elasticsearch.

### es:reset

The command `es:reset` resets all active indices and clears the queue. This command should be used only if an index is corrupted or needs to be set up completely from scratch.

### es:status

The command `es:status` returns the status of all current Elasticsearch indices.

### es:test:analyzer

The command `es:test:analyzer` runs an Elasticsearch analyzer on your indices. For more details on Elasticsearch analyzers, take a look at this [external link](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-analyzers.html).

## Customize the Elasticsearch integration

To customize the Elasticsearch integration or add your own fields and entities, refer to the [Elasticsearch extension guide](../../guides/plugins/plugins/elasticsearch/add-product-entity-extension-to-elasticsearch)
